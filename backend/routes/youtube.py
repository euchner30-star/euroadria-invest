"""YouTube API endpoints."""
from fastapi import APIRouter, HTTPException
import os
import time
import requests as http_requests

router = APIRouter()

_youtube_cache = {"data": None, "expires": 0}


@router.get("/youtube/latest")
async def get_youtube_latest():
    now = time.time()
    if _youtube_cache["data"] and now < _youtube_cache["expires"]:
        return _youtube_cache["data"]

    api_key = os.environ.get("YOUTUBE_API_KEY", "")
    playlist_id = os.environ.get("YOUTUBE_PLAYLIST_ID", "UULJ7QhMlsoV23wgYusibA3A")

    if not api_key:
        raise HTTPException(status_code=500, detail="YouTube API key not configured")

    try:
        url = "https://www.googleapis.com/youtube/v3/playlistItems"
        params = {
            "part": "snippet",
            "playlistId": playlist_id,
            "maxResults": 12,
            "key": api_key
        }
        resp = http_requests.get(url, params=params, timeout=10)
        resp.raise_for_status()
        raw = resp.json()

        videos = []
        for item in raw.get("items", []):
            s = item.get("snippet", {})
            vid_id = s.get("resourceId", {}).get("videoId")
            if not vid_id:
                continue
            videos.append({
                "id": vid_id,
                "title": s.get("title", ""),
                "thumbnail": s.get("thumbnails", {}).get("high", {}).get("url", f"https://img.youtube.com/vi/{vid_id}/hqdefault.jpg"),
                "publishedAt": s.get("publishedAt", ""),
            })

        if videos:
            vid_ids = ",".join(v["id"] for v in videos)
            stats_url = "https://www.googleapis.com/youtube/v3/videos"
            stats_params = {"part": "statistics", "id": vid_ids, "key": api_key}
            stats_resp = http_requests.get(stats_url, params=stats_params, timeout=10)
            if stats_resp.ok:
                stats_data = stats_resp.json()
                view_map = {}
                for si in stats_data.get("items", []):
                    vc = int(si.get("statistics", {}).get("viewCount", 0))
                    if vc >= 1000:
                        view_map[si["id"]] = f"{vc / 1000:.1f}K"
                    else:
                        view_map[si["id"]] = str(vc)
                for v in videos:
                    v["views"] = view_map.get(v["id"], "0")

        result = {"videos": videos, "channelUrl": "https://youtube.com/@euroadriacs"}
        _youtube_cache["data"] = result
        _youtube_cache["expires"] = now + 3600
        return result

    except http_requests.exceptions.RequestException as e:
        if _youtube_cache["data"]:
            return _youtube_cache["data"]
        raise HTTPException(status_code=502, detail=f"YouTube API error: {str(e)}")
