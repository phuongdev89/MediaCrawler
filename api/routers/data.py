# -*- coding: utf-8 -*-
# Copyright (c) 2025 relakkes@gmail.com
#
# This file is part of MediaCrawler project.
# Repository: https://github.com/NanmiCoder/MediaCrawler/blob/main/api/routers/data.py
# GitHub: https://github.com/NanmiCoder
# Licensed under NON-COMMERCIAL LEARNING LICENSE 1.1
#
# 声明：本代码仅供学习和研究目的使用。使用者应遵守以下原则：
# 1. 不得用于任何商业用途。
# 2. 使用时应遵守目标平台的使用条款和robots.txt规则。
# 3. 不得进行大规模爬取或对平台造成运营干扰。
# 4. 应合理控制请求频率，避免给目标平台带来不必要的负担。
# 5. 不得用于任何非法或不当的用途。
#
# 详细许可条款请参阅项目根目录下的LICENSE文件。
# 使用本代码即表示您同意遵守上述原则和LICENSE中的所有条款。

import os
import json
from pathlib import Path
from typing import Optional

import httpx
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import FileResponse, StreamingResponse
from sqlalchemy import select, func

import config
from database.db_session import get_session
from database.models import XhsNote, XhsNoteComment

router = APIRouter(prefix="/data", tags=["data"])

# Data directory
DATA_DIR = Path(__file__).parent.parent.parent / "data"


def get_file_info(file_path: Path) -> dict:
    """Get file information"""
    stat = file_path.stat()
    record_count = None

    # Try to get record count
    try:
        if file_path.suffix == ".json":
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                if isinstance(data, list):
                    record_count = len(data)
        elif file_path.suffix == ".csv":
            with open(file_path, "r", encoding="utf-8") as f:
                record_count = sum(1 for _ in f) - 1  # Subtract header row
    except Exception:
        pass

    return {
        "name": file_path.name,
        "path": str(file_path.relative_to(DATA_DIR)),
        "size": stat.st_size,
        "modified_at": stat.st_mtime,
        "record_count": record_count,
        "type": file_path.suffix[1:] if file_path.suffix else "unknown"
    }


@router.get("/xhs/posts")
async def get_xhs_posts(limit: int = 1000, page: int = 1):
    """Get XHS posts directly from DB."""
    async with get_session() as session:
        if not session:
            return {"data": [], "total": 0, "source": "db"}

        count_stmt = select(func.count(XhsNote.id))
        total_res = await session.execute(count_stmt)
        total = total_res.scalar() or 0

        stmt = select(XhsNote).order_by(XhsNote.last_modify_ts.desc()).offset((page - 1) * limit).limit(limit)
        res = await session.execute(stmt)
        notes = res.scalars().all()

        data = []
        for n in notes:
            # Check for locally downloaded media
            local_images = _list_local_media("xhs", "images", n.note_id) if n.note_id else []
            local_videos = _list_local_media("xhs", "videos", n.note_id) if n.note_id else []
            item = {
                "note_id": n.note_id,
                "title": n.title,
                "title_vi": n.title_vi,
                "desc": n.desc,
                "desc_vi": n.desc_vi,
                "tag_list": n.tag_list,
                "tag_list_vi": n.tag_list_vi,
                "type": n.type,
                "nickname": n.nickname,
                "creator_hash": n.creator_hash,
                "liked_count": n.liked_count,
                "collected_count": n.collected_count,
                "comment_count": n.comment_count,
                "share_count": n.share_count,
                "source_keyword": n.source_keyword,
                "time": n.time,
                "last_modify_ts": n.last_modify_ts,
                "image_list": n.image_list,
                "video_url": n.video_url,
                "local_images": local_images,
                "local_videos": local_videos,
                "is_translated": n.is_translated or 0,
                "note_url": n.note_url,
            }
            data.append(item)
        return {"data": data, "total": total, "source": "db"}


@router.get("/xhs/comments")
async def get_xhs_comments(note_id: Optional[str] = None, limit: int = 10000, page: int = 1):
    """Get XHS comments directly from DB."""
    async with get_session() as session:
        if not session:
            return {"data": [], "total": 0, "source": "db"}

        count_stmt = select(func.count(XhsNoteComment.id))
        stmt = select(XhsNoteComment).order_by(XhsNoteComment.last_modify_ts.desc())
        if note_id:
            count_stmt = count_stmt.where(XhsNoteComment.note_id == note_id)
            stmt = stmt.where(XhsNoteComment.note_id == note_id)

        total_res = await session.execute(count_stmt)
        total = total_res.scalar() or 0

        res = await session.execute(stmt.offset((page - 1) * limit).limit(limit))
        comments = res.scalars().all()

        data = []
        for c in comments:
            data.append({
                "comment_id": c.comment_id,
                "create_time": c.create_time,
                "note_id": c.note_id,
                "content": c.content,
                "creator_hash": c.creator_hash,
                "nickname": c.nickname,
                "sub_comment_count": c.sub_comment_count,
                "pictures": c.pictures,
                "parent_comment_id": c.parent_comment_id,
                "last_modify_ts": c.last_modify_ts,
                "like_count": c.like_count,
            })
        return {"data": data, "total": total, "source": "db"}


@router.get("/files")
async def list_data_files(platform: Optional[str] = None, file_type: Optional[str] = None):
    """Get data file list"""
    if not DATA_DIR.exists():
        return {"files": []}

    files = []
    supported_extensions = {".json", ".csv", ".xlsx", ".xls"}

    for root, dirs, filenames in os.walk(DATA_DIR):
        root_path = Path(root)
        for filename in filenames:
            file_path = root_path / filename
            if file_path.suffix.lower() not in supported_extensions:
                continue

            # Platform filter
            if platform:
                rel_path = str(file_path.relative_to(DATA_DIR))
                if platform.lower() not in rel_path.lower():
                    continue

            # Type filter
            if file_type and file_path.suffix[1:].lower() != file_type.lower():
                continue

            try:
                files.append(get_file_info(file_path))
            except Exception:
                continue

    # Sort by modification time (newest first)
    files.sort(key=lambda x: x["modified_at"], reverse=True)

    return {"files": files}


@router.get("/files/{file_path:path}")
async def get_file_content(file_path: str, preview: bool = True, limit: int = 100):
    """Get file content or preview"""
    full_path = DATA_DIR / file_path

    if not full_path.exists():
        raise HTTPException(status_code=404, detail="File not found")

    if not full_path.is_file():
        raise HTTPException(status_code=400, detail="Not a file")

    # Security check: ensure within DATA_DIR
    try:
        full_path.resolve().relative_to(DATA_DIR.resolve())
    except ValueError:
        raise HTTPException(status_code=403, detail="Access denied")

    if preview:
        # Return preview data
        try:
            if full_path.suffix == ".json":
                with open(full_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    if isinstance(data, list):
                        return {"data": data[:limit], "total": len(data)}
                    return {"data": data, "total": 1}
            elif full_path.suffix == ".csv":
                import csv
                with open(full_path, "r", encoding="utf-8") as f:
                    reader = csv.DictReader(f)
                    rows = []
                    for i, row in enumerate(reader):
                        if i >= limit:
                            break
                        rows.append(row)
                    # Re-read to get total count
                    f.seek(0)
                    total = sum(1 for _ in f) - 1
                    return {"data": rows, "total": total}
            elif full_path.suffix.lower() in (".xlsx", ".xls"):
                import pandas as pd
                # Read first limit rows
                df = pd.read_excel(full_path, nrows=limit)
                # Get total row count (only read first column to save memory)
                df_count = pd.read_excel(full_path, usecols=[0])
                total = len(df_count)
                # Convert to list of dictionaries, handle NaN values
                rows = df.where(pd.notnull(df), None).to_dict(orient='records')
                return {
                    "data": rows,
                    "total": total,
                    "columns": list(df.columns)
                }
            else:
                raise HTTPException(status_code=400, detail="Unsupported file type for preview")
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="Invalid JSON file")
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    else:
        # Return file download
        return FileResponse(
            path=full_path,
            filename=full_path.name,
            media_type="application/octet-stream"
        )


@router.get("/download/{file_path:path}")
async def download_file(file_path: str):
    """Download file"""
    full_path = DATA_DIR / file_path

    if not full_path.exists():
        raise HTTPException(status_code=404, detail="File not found")

    if not full_path.is_file():
        raise HTTPException(status_code=400, detail="Not a file")

    # Security check
    try:
        full_path.resolve().relative_to(DATA_DIR.resolve())
    except ValueError:
        raise HTTPException(status_code=403, detail="Access denied")

    return FileResponse(
        path=full_path,
        filename=full_path.name,
        media_type="application/octet-stream"
    )


@router.get("/stats")
async def get_data_stats():
    """Get data statistics"""
    if not DATA_DIR.exists():
        return {"total_files": 0, "total_size": 0, "by_platform": {}, "by_type": {}}

    stats = {
        "total_files": 0,
        "total_size": 0,
        "by_platform": {},
        "by_type": {}
    }

    supported_extensions = {".json", ".csv", ".xlsx", ".xls"}

    for root, dirs, filenames in os.walk(DATA_DIR):
        root_path = Path(root)
        for filename in filenames:
            file_path = root_path / filename
            if file_path.suffix.lower() not in supported_extensions:
                continue

            try:
                stat = file_path.stat()
                stats["total_files"] += 1
                stats["total_size"] += stat.st_size

                # Statistics by type
                file_type = file_path.suffix[1:].lower()
                stats["by_type"][file_type] = stats["by_type"].get(file_type, 0) + 1

                # Statistics by platform (inferred from path)
                rel_path = str(file_path.relative_to(DATA_DIR))
                for platform in ["xhs", "dy", "ks", "bili", "wb", "tieba", "zhihu"]:
                    if platform in rel_path.lower():
                        stats["by_platform"][platform] = stats["by_platform"].get(platform, 0) + 1
                        break
            except Exception:
                continue

    return stats


import mimetypes

ALLOWED_MEDIA_HOSTS = {"sns-video-bd.xhscdn.com", "sns-video-hw.xhscdn.com", "sns-video-al.xhscdn.com",
                       "sns-img-bd.xhscdn.com", "sns-img-hw.xhscdn.com", "sns-img-al.xhscdn.com",
                       "ci.xiaohongshu.com", "sns-webpic-qc.xhscdn.com"}


def _list_local_media(platform: str, media_type: str, note_id: str) -> list[str]:
    """List local media files for a note. Returns API-relative paths."""
    media_dir = DATA_DIR / platform / media_type / note_id
    if not media_dir.is_dir():
        return []
    files = sorted(media_dir.iterdir())
    return [
        f"/api/data/local-media/{platform}/{media_type}/{note_id}/{f.name}"
        for f in files if f.is_file()
    ]


@router.get("/local-media/{platform}/{media_type}/{note_id}/{filename}")
async def serve_local_media(platform: str, media_type: str, note_id: str, filename: str):
    """Serve locally downloaded media files (images/videos)."""
    if media_type not in ("images", "videos"):
        raise HTTPException(status_code=400, detail="media_type must be images or videos")

    full_path = (DATA_DIR / platform / media_type / note_id / filename).resolve()
    # Security: must stay inside DATA_DIR
    try:
        full_path.relative_to(DATA_DIR.resolve())
    except ValueError:
        raise HTTPException(status_code=403, detail="Access denied")

    if not full_path.is_file():
        raise HTTPException(status_code=404, detail="File not found")

    content_type = mimetypes.guess_type(str(full_path))[0] or "application/octet-stream"
    return FileResponse(
        path=full_path,
        media_type=content_type,
        headers={"Cache-Control": "public, max-age=86400"},
    )


@router.get("/media-proxy")
async def media_proxy(url: str = Query(...)):
    """Proxy XHS media to bypass CORS."""
    from urllib.parse import urlparse
    parsed = urlparse(url)
    if parsed.hostname not in ALLOWED_MEDIA_HOSTS:
        raise HTTPException(status_code=403, detail="Host not allowed")

    async with httpx.AsyncClient(follow_redirects=True, timeout=30) as client:
        resp = await client.get(url, headers={"Referer": "https://www.xiaohongshu.com/"})
        if resp.status_code != 200:
            raise HTTPException(status_code=resp.status_code, detail="Upstream error")
        content_type = resp.headers.get("content-type", "application/octet-stream")
        return StreamingResponse(
            iter([resp.content]),
            media_type=content_type,
            headers={"Cache-Control": "public, max-age=86400"},
        )
