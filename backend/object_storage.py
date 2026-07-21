"""Emergent Object Storage helper for fast image delivery."""
import os
import uuid
import requests
from core import logger

STORAGE_URL = "https://integrations.emergentagent.com/objstore/api/v1/storage"
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY")
APP_NAME = "euroadria"
storage_key = None


def init_storage():
    """Initialize storage session. Call once, reuse globally."""
    global storage_key
    if storage_key:
        return storage_key
    resp = requests.post(
        f"{STORAGE_URL}/init",
        json={"emergent_key": EMERGENT_KEY},
        timeout=30,
    )
    resp.raise_for_status()
    storage_key = resp.json()["storage_key"]
    logger.info("Object Storage initialized")
    return storage_key


def put_object(path: str, data: bytes, content_type: str) -> dict:
    """Upload file. Returns {"path": ..., "size": ..., "etag": ...}"""
    key = init_storage()
    resp = requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type},
        data=data,
        timeout=120,
    )
    resp.raise_for_status()
    return resp.json()


def get_object(path: str) -> tuple:
    """Download file. Returns (content_bytes, content_type)."""
    key = init_storage()
    resp = requests.get(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key},
        timeout=60,
    )
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")


def upload_image(data: bytes, filename: str, content_type: str) -> str:
    """Upload an image and return the storage path."""
    ext = filename.rsplit(".", 1)[-1] if "." in filename else "jpg"
    path = f"{APP_NAME}/properties/{uuid.uuid4()}.{ext}"
    result = put_object(path, data, content_type)
    return result["path"]
