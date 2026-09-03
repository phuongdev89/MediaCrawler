# -*- coding: utf-8 -*-
"""Background thread that translates content to Vietnamese using OpenAI.
Supports:
1. JSON files in data/
2. Database records (MySQL / SQLite / PostgreSQL) when is_translated = 0 (e.g. xhs_note).
Rotates between models defined in OPENAI_MODELS (comma-separated)."""

from __future__ import annotations

import asyncio
import itertools
import json
import logging
import os
import re
import sys
import threading
import time
from pathlib import Path
from typing import Any

from sqlalchemy import select

import config
from database.db_session import get_session
from database.models import XhsNote

# Ensure logger handler uses UTF-8 so Vietnamese output doesn't crash on Windows
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
    # File handler — persists to data/vi_translator.log
    _log_dir = Path(__file__).resolve().parent.parent / "data"
    _log_dir.mkdir(parents=True, exist_ok=True)
    _file_handler = logging.FileHandler(
        _log_dir / "vi_translator.log", encoding="utf-8", delay=True,
    )
    _file_handler.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(message)s"))
    _file_handler.setLevel(logging.DEBUG)
    logger.addHandler(_file_handler)
    logger.setLevel(logging.DEBUG)

# --- config -----------------------------------------------------------------
SCAN_INTERVAL = 10  # seconds between scans
DATA_DIR = Path(__file__).resolve().parent.parent / "data"
BATCH_SIZE = 20  # items per API call

CONTENT_FIELDS = ("title", "desc", "tag_list", "source_keyword")
COMMENT_FIELDS = ("content",)

_model_cycle: itertools.cycle | None = None
_model_cycle_lock = threading.Lock()


# --- model rotation --------------------------------------------------------

def _get_models() -> list[str]:
    raw = os.getenv("OPENAI_MODELS", os.getenv("OPENAI_MODEL", "gpt-4.1-mini"))
    models = [m.strip() for m in raw.split(",") if m.strip()]
    return models if models else ["gpt-4.1-mini"]


def _get_next_model() -> str:
    global _model_cycle
    with _model_cycle_lock:
        if _model_cycle is None:
            _model_cycle = itertools.cycle(_get_models())
        return next(_model_cycle)


# --- translation via OpenAI ------------------------------------------------

def _translate_batch(texts: list[str]) -> list[str]:
    """Translate a list of Chinese texts to Vietnamese using the next rotated OpenAI model."""
    try:
        from openai import OpenAI
    except ImportError:
        logger.error("[ViTranslator] openai package not installed")
        raise

    api_key = os.getenv("OPENAI_API_KEY", "")
    base_url = os.getenv("OPENAI_BASE_URL", None)
    if base_url and not base_url.endswith("/v1") and not base_url.endswith("/v1/"):
        # Append /v1 for typical OpenAI compatible endpoints if not present to avoid returning web html
        base_url = base_url.rstrip("/") + "/v1"

    if not api_key:
        raise RuntimeError("OPENAI_API_KEY not set in environment / .env")

    client_kwargs: dict[str, Any] = {"api_key": api_key}
    if base_url:
        client_kwargs["base_url"] = base_url

    client = OpenAI(**client_kwargs)
    model = _get_next_model()
    logger.info("[ViTranslator] Translating %d items using model: %s", len(texts), model)

    numbered = "\n".join(f"{i+1}. {t}" for i, t in enumerate(texts))
    prompt = (
        "Translate the following Chinese texts to Vietnamese. "
        "Keep the exact same numbered list format with one entry per original line. "
        "If an item consists only of symbols, emojis, or non-Chinese characters, copy it verbatim. "
        "Only output the translations with their line numbers. Preserve emoji and hashtag markers like [话题].\n\n"
        f"{numbered}"
    )

    logger.debug("[ViTranslator] >>> PROMPT:\n%s", prompt)

    resp = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": "You are a Chinese-to-Vietnamese translator. Translate accurately and naturally."},
            {"role": "user", "content": prompt},
        ],
        temperature=0.3,
    )

    if isinstance(resp, str):
        raw = resp
    else:
        raw = resp.choices[0].message.content or ""

    logger.debug("[ViTranslator] <<< RAW RESPONSE:\n%s", raw)

    lines = [l.strip() for l in raw.strip().splitlines() if l.strip()]

    result: list[str] = []
    for line in lines:
        cleaned = re.sub(r"^\s*\d+\s*[\.)、:-]\s*", "", line).strip()
        result.append(cleaned or line)

    if len(result) != len(texts):
        logger.warning(
            "[ViTranslator] Count mismatch: sent %d texts, got %d lines. Raw response:\n%s",
            len(texts), len(result), raw,
        )

    return result


def _translate_all(texts: list[str]) -> list[str]:
    all_translated: list[str] = []
    for i in range(0, len(texts), BATCH_SIZE):
        batch = texts[i : i + BATCH_SIZE]
        try:
            translated = _translate_batch(batch)
        except Exception:
            logger.exception("[ViTranslator] Batch translation failed, falling back to one-by-one")
            translated = []

        if len(translated) != len(batch):
            # Model returned wrong count — fall back to translating one at a time
            logger.warning(
                "[ViTranslator] Batch returned %d/%d items, retrying individually",
                len(translated), len(batch),
            )
            translated = []
            for text in batch:
                try:
                    result = _translate_batch([text])
                    translated.append(result[0] if result else text)
                except Exception:
                    logger.exception("[ViTranslator] Single-item translation failed, keeping original")
                    translated.append(text)

        all_translated.extend(translated)
    return all_translated


def _is_translatable(text: str | None) -> bool:
    """Return True only if text has real content worth translating."""
    if not text:
        return False
    stripped = text.strip().strip('"\'""''')
    if not stripped:
        return False
    # Must contain at least one Chinese character
    return bool(re.search(r"[一-鿿]", stripped))


# --- database translation ---------------------------------------------------

async def _translate_xhs_db_pass() -> int:
    """Find xhs_note records with is_translated = 0 and translate them."""
    async with get_session() as session:
        if not session:
            return 0
        stmt = select(XhsNote).where(XhsNote.is_translated == 0).limit(BATCH_SIZE)
        res = await session.execute(stmt)
        notes = res.scalars().all()
        if not notes:
            return 0

        logger.info("[ViTranslator] Found %d untranslated XHS notes in DB", len(notes))
        for note in notes:
            texts = []
            fields_present = []
            if _is_translatable(note.title):
                texts.append(note.title.strip())
                fields_present.append("title")
            if _is_translatable(note.desc):
                texts.append(note.desc.strip())
                fields_present.append("desc")
            if _is_translatable(note.tag_list):
                texts.append(note.tag_list.strip())
                fields_present.append("tag_list")

            if texts:
                try:
                    translations = _translate_all(texts)
                except Exception:
                    logger.exception("[ViTranslator] Translation failed for note %s; will retry later", note.note_id)
                    continue
                if len(translations) != len(texts):
                    logger.warning(
                        "[ViTranslator] Count mismatch for note %s (%d vs %d); will retry later",
                        note.note_id, len(translations), len(texts),
                    )
                    continue
                for field_name, translated_text in zip(fields_present, translations):
                    if field_name == "title":
                        note.title_vi = translated_text
                    elif field_name == "desc":
                        note.desc_vi = translated_text
                    elif field_name == "tag_list":
                        note.tag_list_vi = translated_text

            note.is_translated = 1

        await session.commit()
        translated_count = sum(1 for note in notes if note.is_translated == 1)
        logger.info("[ViTranslator] DB pass translated %d/%d notes", translated_count, len(notes))
        return translated_count


# --- JSON file translation --------------------------------------------------

def _is_comment_file(name: str) -> bool:
    return "comment" in name.lower()


def _fields_for(filename: str) -> tuple[str, ...]:
    return COMMENT_FIELDS if _is_comment_file(filename) else CONTENT_FIELDS


def _needs_translation(json_path: Path) -> bool:
    vi_path = json_path.with_suffix("").with_suffix(".vi.json")
    return not vi_path.exists()


def _vi_path(json_path: Path) -> Path:
    return json_path.with_suffix("").with_suffix(".vi.json")


def _collect_texts(items: list[dict], fields: tuple[str, ...]) -> list[str]:
    texts: list[str] = []
    for item in items:
        for f in fields:
            v = item.get(f, "")
            if isinstance(v, str) and _is_translatable(v):
                texts.append(v.strip())
    return texts


def _apply_translations(
    items: list[dict], fields: tuple[str, ...], translations: list[str]
) -> list[dict]:
    idx = 0
    result = []
    for item in items:
        new_item = dict(item)
        for f in fields:
            v = item.get(f, "")
            if isinstance(v, str) and _is_translatable(v):
                if idx < len(translations):
                    new_item[f] = translations[idx]
                idx += 1
        result.append(new_item)
    return result


def _scan_and_translate_files() -> None:
    if not DATA_DIR.exists():
        return

    json_files = sorted(DATA_DIR.rglob("*.json"))
    candidates = [
        p for p in json_files
        if not p.name.endswith(".vi.json") and _needs_translation(p)
    ]

    for json_path in candidates:
        try:
            logger.info("[ViTranslator] Translating file %s", json_path)
            with open(json_path, "r", encoding="utf-8") as f:
                data = json.load(f)

            if not isinstance(data, list) or not data:
                continue

            fields = _fields_for(json_path.name)
            texts = _collect_texts(data, fields)

            if not texts:
                translated_data = data
            else:
                translations = _translate_all(texts)
                if not _valid_translations(texts, translations):
                    logger.warning("[ViTranslator] Invalid translation result for file %s; skipping", json_path)
                    continue
                translated_data = _apply_translations(data, fields, translations)

            out_path = _vi_path(json_path)
            with open(out_path, "w", encoding="utf-8") as f:
                json.dump(translated_data, f, ensure_ascii=False, indent=4)

            logger.info("[ViTranslator] Saved %s", out_path)
        except Exception:
            logger.exception("[ViTranslator] Error translating %s", json_path)


# --- scan loop --------------------------------------------------------------

async def _async_scan_loop() -> None:
    logger.info(
        "[ViTranslator] Thread started, models=%s, scanning every %ds",
        _get_models(),
        SCAN_INTERVAL,
    )
    while True:
        try:
            # 1. DB mode translation in single persistent loop
            if config.SAVE_DATA_OPTION in ("db", "mysql", "sqlite", "postgres"):
                try:
                    await _translate_xhs_db_pass()
                except Exception:
                    logger.exception("[ViTranslator] Error during DB translation pass")

            # 2. File mode translation
            _scan_and_translate_files()
        except Exception:
            logger.exception("[ViTranslator] Unhandled error in scan loop")

        await asyncio.sleep(SCAN_INTERVAL)


def _loop() -> None:
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        loop.run_until_complete(_async_scan_loop())
    finally:
        loop.close()


def start() -> threading.Thread:
    """Start the translator daemon thread."""
    t = threading.Thread(target=_loop, name="vi-translator", daemon=True)
    t.start()
    return t
