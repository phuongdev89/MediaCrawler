# -*- coding: utf-8 -*-
"""Background thread that downloads media (images/videos) for notes
whose media_downloaded = 0 in the DB. Runs independently from the
crawler so scraping speed is unaffected.

Architecture mirrors vi_translator.py: a daemon thread with its own
asyncio event loop, polling every SCAN_INTERVAL seconds.
"""

from __future__ import annotations

import asyncio
import logging
import pathlib
import sys
import threading
from typing import List, Dict

import httpx
from sqlalchemy import select

import config
from database.db_session import get_session
from database.models import XhsNote

logger = logging.getLogger(__name__)
if not logger.handlers:
    _handler = logging.StreamHandler(stream=sys.stderr)
    _handler.setFormatter(logging.Formatter("%(levelname)s:%(name)s:%(message)s"))
    if hasattr(_handler.stream, "reconfigure"):
        try:
            _handler.stream.reconfigure(encoding="utf-8", errors="replace")
        except Exception:
            pass
    logger.addHandler(_handler)
    logger.setLevel(logging.INFO)

# --- config -----------------------------------------------------------------
SCAN_INTERVAL = 15  # seconds between scans
BATCH_SIZE = 10     # notes per pass
DOWNLOAD_TIMEOUT = 60  # seconds per media file
CONCURRENCY = 3     # parallel downloads per batch
DATA_DIR = pathlib.Path(__file__).resolve().parent.parent / "data"


# --- helpers ----------------------------------------------------------------

def _image_dir(platform: str, note_id: str) -> pathlib.Path:
    return DATA_DIR / platform / "images" / note_id


def _video_dir(platform: str, note_id: str) -> pathlib.Path:
    return DATA_DIR / platform / "videos" / note_id


def _parse_urls(comma_separated: str | None) -> List[str]:
    if not comma_separated:
        return []
    return [u.strip() for u in comma_separated.split(",") if u.strip()]


async def _download_file(client: httpx.AsyncClient, url: str, dest: pathlib.Path) -> bool:
    """Download a single file. Returns True on success."""
    try:
        resp = await client.get(url, headers={"Referer": "https://www.xiaohongshu.com/"})
        if resp.status_code != 200:
            logger.warning("[MediaDL] HTTP %d for %s", resp.status_code, url)
            return False
        if len(resp.content) < 100:
            # Too small, likely an error page
            return False
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(resp.content)
        return True
    except Exception:
        logger.exception("[MediaDL] Failed to download %s", url)
        return False


async def _download_note_media(client: httpx.AsyncClient, note: XhsNote) -> bool:
    """Download all images and videos for a single note. Returns True if anything was saved."""
    note_id = note.note_id
    any_saved = False

    # Images
    image_urls = _parse_urls(note.image_list)
    img_dir = _image_dir("xhs", note_id)
    for i, url in enumerate(image_urls):
        # Skip if already downloaded
        dest = img_dir / f"{i}.jpg"
        if dest.exists():
            any_saved = True
            continue
        if await _download_file(client, url, dest):
            any_saved = True
            logger.info("[MediaDL] Saved image %s/%d.jpg", note_id, i)

    # Videos
    video_urls = _parse_urls(note.video_url)
    vid_dir = _video_dir("xhs", note_id)
    for i, url in enumerate(video_urls):
        dest = vid_dir / f"{i}.mp4"
        if dest.exists():
            any_saved = True
            continue
        if await _download_file(client, url, dest):
            any_saved = True
            logger.info("[MediaDL] Saved video %s/%d.mp4", note_id, i)

    return any_saved


# --- DB pass ----------------------------------------------------------------

async def _download_pass() -> int:
    """Find notes with media_downloaded=0, download their media, mark done."""
    async with get_session() as session:
        if not session:
            return 0
        stmt = select(XhsNote).where(XhsNote.media_downloaded == 0).limit(BATCH_SIZE)
        res = await session.execute(stmt)
        notes = res.scalars().all()
        if not notes:
            return 0

        logger.info("[MediaDL] Found %d notes needing media download", len(notes))

        sem = asyncio.Semaphore(CONCURRENCY)
        async with httpx.AsyncClient(follow_redirects=True, timeout=DOWNLOAD_TIMEOUT) as client:
            async def _process(note: XhsNote):
                async with sem:
                    await _download_note_media(client, note)
                note.media_downloaded = 1

            await asyncio.gather(*[_process(n) for n in notes])

        await session.commit()
        return len(notes)


# --- scan loop --------------------------------------------------------------

async def _async_scan_loop() -> None:
    logger.info("[MediaDL] Thread started, scanning every %ds", SCAN_INTERVAL)
    while True:
        try:
            if config.SAVE_DATA_OPTION in ("db", "mysql", "sqlite", "postgres"):
                try:
                    count = await _download_pass()
                    if count:
                        logger.info("[MediaDL] Processed %d notes", count)
                except Exception:
                    logger.exception("[MediaDL] Error during download pass")
        except Exception:
            logger.exception("[MediaDL] Unhandled error in scan loop")

        await asyncio.sleep(SCAN_INTERVAL)


def _loop() -> None:
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        loop.run_until_complete(_async_scan_loop())
    finally:
        loop.close()


def start() -> threading.Thread:
    """Start the media downloader daemon thread."""
    t = threading.Thread(target=_loop, name="media-downloader", daemon=True)
    t.start()
    return t
