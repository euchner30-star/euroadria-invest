"""Upload endpoints (image optimization, object storage, file serving)."""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import Response
from pathlib import Path
from datetime import datetime, timezone
import uuid
import io

from core import db, verify_admin, UPLOAD_DIR, ALLOWED_EXTENSIONS, MAX_FILE_SIZE, MAX_IMAGE_DIMENSION, APP_NAME, put_object, get_object

router = APIRouter()


def optimize_image(image_data: bytes, max_dimension: int = MAX_IMAGE_DIMENSION, quality: int = 85) -> bytes:
    from PIL import Image
    try:
        import pillow_heif
        pillow_heif.register_heif_opener()
    except ImportError:
        pass
    img = Image.open(io.BytesIO(image_data))
    if img.mode in ('RGBA', 'P'):
        background = Image.new('RGB', img.size, (255, 255, 255))
        if img.mode == 'RGBA':
            background.paste(img, mask=img.split()[3])
        else:
            background.paste(img)
        img = background
    elif img.mode != 'RGB':
        img = img.convert('RGB')
    width, height = img.size
    if width > max_dimension or height > max_dimension:
        ratio = min(max_dimension / width, max_dimension / height)
        new_size = (int(width * ratio), int(height * ratio))
        img = img.resize(new_size, Image.Resampling.LANCZOS)
    output = io.BytesIO()
    img.save(output, format='WEBP', quality=quality, optimize=True)
    return output.getvalue()


@router.post("/admin/upload")
async def upload_image(file: UploadFile = File(...), admin: str = Depends(verify_admin)):
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Dateityp nicht erlaubt. Erlaubt: {', '.join(ALLOWED_EXTENSIONS)}")

    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail=f"Datei zu groß. Maximum: {MAX_FILE_SIZE // (1024*1024)}MB")

    try:
        import base64
        optimized = optimize_image(content)
        unique_id = str(uuid.uuid4())[:8]
        original_name = Path(file.filename).stem
        clean_name = "".join(c for c in original_name if c.isalnum() or c in "-_")[:30]
        filename = f"{clean_name}_{unique_id}.webp"
        
        # Store in MongoDB instead of local disk (Render ephemeral storage)
        img_b64 = base64.b64encode(optimized).decode("utf-8")
        await db.images.update_one(
            {"filename": filename},
            {"$set": {
                "filename": filename,
                "data": img_b64,
                "content_type": "image/webp",
                "size": len(optimized),
                "original_name": file.filename,
                "uploaded_at": datetime.now(timezone.utc).isoformat()
            }},
            upsert=True
        )

        # Also save locally as fallback
        try:
            file_path = UPLOAD_DIR / filename
            with open(file_path, "wb") as f:
                f.write(optimized)
        except Exception:
            pass

        url = f"/api/img/{filename}"
        original_size = len(content)
        optimized_size = len(optimized)
        reduction = ((original_size - optimized_size) / original_size) * 100 if original_size > 0 else 0

        return {"url": url, "filename": filename, "originalSize": original_size, "optimizedSize": optimized_size, "reduction": f"{reduction:.1f}%"}
    except Exception as e:
        from core import logger
        logger.error(f"Image upload failed: {e}")
        raise HTTPException(status_code=500, detail=f"Bildverarbeitung fehlgeschlagen: {str(e)}")


@router.get("/img/{filename}")
async def serve_image(filename: str):
    """Serve images from MongoDB (persistent) or local fallback."""
    import base64
    # Try MongoDB first
    img_doc = await db.images.find_one({"filename": filename}, {"_id": 0, "data": 1, "content_type": 1})
    if img_doc and img_doc.get("data"):
        img_bytes = base64.b64decode(img_doc["data"])
        return Response(content=img_bytes, media_type=img_doc.get("content_type", "image/webp"), headers={"Cache-Control": "public, max-age=31536000, immutable"})
    
    # Fallback to local file
    file_path = UPLOAD_DIR / filename
    if file_path.exists():
        return Response(content=file_path.read_bytes(), media_type="image/webp", headers={"Cache-Control": "public, max-age=31536000, immutable"})
    
    raise HTTPException(status_code=404, detail="Bild nicht gefunden")


@router.get("/admin/uploads")
async def list_uploads(admin: str = Depends(verify_admin)):
    uploads = []
    all_ext = ALLOWED_EXTENSIONS | {".webp"}
    for file_path in UPLOAD_DIR.glob("*"):
        if file_path.suffix.lower() in all_ext:
            stat = file_path.stat()
            uploads.append({"filename": file_path.name, "url": f"/uploads/{file_path.name}", "size": stat.st_size, "created": datetime.fromtimestamp(stat.st_ctime).isoformat()})
    uploads.sort(key=lambda x: x["created"], reverse=True)
    return uploads


@router.delete("/admin/uploads/{filename}")
async def delete_upload(filename: str, admin: str = Depends(verify_admin)):
    file_path = UPLOAD_DIR / filename
    if ".." in filename or "/" in filename:
        raise HTTPException(status_code=400, detail="Ungültiger Dateiname")
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Datei nicht gefunden")
    file_path.unlink()
    return {"message": "Datei gelöscht", "filename": filename}


@router.get("/admin/verify")
async def verify_admin_access(admin: str = Depends(verify_admin)):
    return {"authenticated": True, "username": admin}


# ── Object Storage Upload ───────────────────────────────────────────────

@router.post("/admin/storage/upload")
async def admin_upload_file(file: UploadFile = File(...), admin: str = Depends(verify_admin)):
    allowed_ext = {"jpg", "jpeg", "png", "gif", "webp", "pdf", "csv", "txt"}
    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if ext not in allowed_ext:
        raise HTTPException(status_code=400, detail=f"Dateityp .{ext} nicht erlaubt")

    mime_map = {"jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png", "gif": "image/gif", "webp": "image/webp", "pdf": "application/pdf", "csv": "text/csv", "txt": "text/plain"}
    content_type = file.content_type or mime_map.get(ext, "application/octet-stream")
    file_id = str(uuid.uuid4())
    storage_path = f"{APP_NAME}/uploads/{file_id}.{ext}"

    data = await file.read()
    result = put_object(storage_path, data, content_type)

    await db.uploaded_files.insert_one({"file_id": file_id, "storage_path": result["path"], "original_filename": file.filename, "content_type": content_type, "size": result.get("size", len(data)), "ext": ext, "created_at": datetime.now(timezone.utc).isoformat()})

    return {"success": True, "file_id": file_id, "filename": file.filename, "url": f"/api/files/{result['path']}", "content_type": content_type}


@router.get("/files/{path:path}")
async def serve_file(path: str):
    record = await db.uploaded_files.find_one({"storage_path": path}, {"_id": 0})
    if not record:
        raise HTTPException(status_code=404, detail="Datei nicht gefunden")
    data, ct = get_object(path)
    return Response(content=data, media_type=record.get("content_type", ct))
