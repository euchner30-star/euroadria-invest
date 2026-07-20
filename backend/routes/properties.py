"""Property listings endpoints - CRUD for real estate listings with images and PDF exposé."""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
from bson import ObjectId
import io

from core import db, verify_admin, logger


def _oid(val: str) -> ObjectId:
    """Parse ObjectId or raise 400."""
    try:
        return ObjectId(val)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ID format")

router = APIRouter()


# ── Public Endpoints ────────────────────────────────────────────────────

@router.get("/properties")
async def get_properties(
    location: Optional[str] = None,
    property_type: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    status: Optional[str] = "available"
):
    """Get published property listings with optional filters."""
    query = {"published": True}
    if location:
        query["location"] = {"$regex": location, "$options": "i"}
    if property_type:
        query["property_type"] = property_type
    if status:
        query["status"] = status
    if min_price is not None:
        query["price"] = query.get("price", {})
        query["price"]["$gte"] = min_price
    if max_price is not None:
        query["price"] = query.get("price", {})
        query["price"]["$lte"] = max_price

    properties = await db.properties.find(query).sort("created_at", -1).to_list(200)
    for p in properties:
        p["_id"] = str(p["_id"])
    return properties


@router.get("/properties/{property_id}")
async def get_property(property_id: str):
    """Get single property detail."""
    prop = await db.properties.find_one({"_id": _oid(property_id)})
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    prop["_id"] = str(prop["_id"])
    return prop


@router.post("/properties/{property_id}/inquiry")
async def property_inquiry(property_id: str, name: str = Form(...), email: str = Form(...), phone: str = Form(""), message: str = Form("")):
    """Submit an inquiry for a property - creates a lead."""
    prop = await db.properties.find_one({"_id": _oid(property_id)})
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")

    # Check duplicate lead
    existing = await db.leads.find_one({"email": email.strip().lower()})
    lead = {
        "name": name.strip(),
        "email": email.strip().lower(),
        "phone": phone.strip(),
        "source": "Property Inquiry",
        "interest": f"{prop.get('property_type', '')} in {prop.get('location', '')} - {prop.get('title', '')}",
        "property_inquiry_id": property_id,
        "property_title": prop.get("title", ""),
        "message": message.strip(),
        "submitted_at": datetime.now(timezone.utc).isoformat(),
    }
    if existing:
        # Update existing lead with new inquiry note
        await db.lead_notes.insert_one({
            "lead_id": str(existing["_id"]),
            "text": f"New property inquiry: {prop.get('title', '')} ({prop.get('location', '')})\nMessage: {message}",
            "author": "System",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        return {"success": True, "message": "Inquiry submitted"}
    else:
        await db.leads.insert_one(lead)
        return {"success": True, "message": "Inquiry submitted"}


# ── Property Image Serving ──────────────────────────────────────────────

@router.get("/properties/img/{image_id}")
async def serve_property_image(image_id: str):
    """Serve a property image from GridFS."""
    from motor.motor_asyncio import AsyncIOMotorGridFSBucket
    fs = AsyncIOMotorGridFSBucket(db)
    try:
        grid_out = await fs.open_download_stream(_oid(image_id))
        content = await grid_out.read()
        content_type = grid_out.metadata.get("content_type", "image/jpeg") if grid_out.metadata else "image/jpeg"
        return StreamingResponse(io.BytesIO(content), media_type=content_type)
    except Exception:
        raise HTTPException(status_code=404, detail="Image not found")


@router.get("/properties/pdf/{property_id}")
async def serve_property_pdf(property_id: str):
    """Serve property PDF exposé."""
    from motor.motor_asyncio import AsyncIOMotorGridFSBucket
    fs = AsyncIOMotorGridFSBucket(db)
    prop = await db.properties.find_one({"_id": _oid(property_id)})
    if not prop or not prop.get("pdf_expose_id"):
        raise HTTPException(status_code=404, detail="PDF not found")
    try:
        grid_out = await fs.open_download_stream(ObjectId(prop["pdf_expose_id"]))
        content = await grid_out.read()
        return StreamingResponse(
            io.BytesIO(content),
            media_type="application/pdf",
            headers={"Content-Disposition": f'inline; filename="{prop.get("title", "expose")}.pdf"'}
        )
    except Exception:
        raise HTTPException(status_code=404, detail="PDF not found")


# ── Admin Endpoints ─────────────────────────────────────────────────────

@router.get("/admin/properties")
async def admin_get_properties(admin: str = Depends(verify_admin)):
    """Get all properties (admin)."""
    properties = await db.properties.find({}).sort("created_at", -1).to_list(500)
    for p in properties:
        p["_id"] = str(p["_id"])
    return properties


@router.post("/admin/properties")
async def admin_create_property(
    admin: str = Depends(verify_admin),
    title: str = Form(...),
    description: str = Form(""),
    price: float = Form(0),
    area_sqm: float = Form(0),
    rooms: int = Form(0),
    bathrooms: int = Form(0),
    property_type: str = Form("Apartment"),
    location: str = Form(""),
    address: str = Form(""),
    features: str = Form(""),
    status: str = Form("available"),
    published: bool = Form(True),
):
    """Create a new property listing."""
    prop = {
        "title": title.strip(),
        "description": description.strip(),
        "price": price,
        "currency": "EUR",
        "area_sqm": area_sqm,
        "rooms": rooms,
        "bathrooms": bathrooms,
        "property_type": property_type,
        "location": location.strip(),
        "address": address.strip(),
        "features": [f.strip() for f in features.split(",") if f.strip()] if features else [],
        "status": status,
        "published": published,
        "images": [],
        "cover_image": None,
        "pdf_expose_id": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    result = await db.properties.insert_one(prop)
    prop["_id"] = str(result.inserted_id)
    return prop


@router.put("/admin/properties/{property_id}")
async def admin_update_property(
    property_id: str,
    admin: str = Depends(verify_admin),
    title: str = Form(None),
    description: str = Form(None),
    price: float = Form(None),
    area_sqm: float = Form(None),
    rooms: int = Form(None),
    bathrooms: int = Form(None),
    property_type: str = Form(None),
    location: str = Form(None),
    address: str = Form(None),
    features: str = Form(None),
    status: str = Form(None),
    published: bool = Form(None),
):
    """Update property listing."""
    update = {}
    for field, val in [("title", title), ("description", description), ("price", price), ("area_sqm", area_sqm), ("rooms", rooms), ("bathrooms", bathrooms), ("property_type", property_type), ("location", location), ("address", address), ("status", status), ("published", published)]:
        if val is not None:
            update[field] = val.strip() if isinstance(val, str) else val
    if features is not None:
        update["features"] = [f.strip() for f in features.split(",") if f.strip()]
    if not update:
        raise HTTPException(status_code=400, detail="No fields to update")
    update["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.properties.update_one({"_id": _oid(property_id)}, {"$set": update})
    return {"success": True}


@router.delete("/admin/properties/{property_id}")
async def admin_delete_property(property_id: str, admin: str = Depends(verify_admin)):
    """Delete a property and its images."""
    prop = await db.properties.find_one({"_id": _oid(property_id)})
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    # Delete images from GridFS
    from motor.motor_asyncio import AsyncIOMotorGridFSBucket
    fs = AsyncIOMotorGridFSBucket(db)
    for img_id in prop.get("images", []):
        try:
            await fs.delete(ObjectId(img_id))
        except Exception:
            pass
    if prop.get("pdf_expose_id"):
        try:
            await fs.delete(ObjectId(prop["pdf_expose_id"]))
        except Exception:
            pass
    await db.properties.delete_one({"_id": _oid(property_id)})
    return {"success": True}


@router.post("/admin/properties/{property_id}/images")
async def admin_upload_images(property_id: str, files: List[UploadFile] = File(...), admin: str = Depends(verify_admin)):
    """Upload images to a property listing (stored in GridFS)."""
    from motor.motor_asyncio import AsyncIOMotorGridFSBucket
    fs = AsyncIOMotorGridFSBucket(db)

    prop = await db.properties.find_one({"_id": _oid(property_id)})
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")

    image_ids = list(prop.get("images", []))
    for file in files:
        content = await file.read()
        if len(content) > 15 * 1024 * 1024:
            continue  # Skip files > 15MB
        grid_id = await fs.upload_from_stream(
            file.filename,
            io.BytesIO(content),
            metadata={"content_type": file.content_type, "property_id": property_id}
        )
        image_ids.append(str(grid_id))

    update = {"images": image_ids, "updated_at": datetime.now(timezone.utc).isoformat()}
    if not prop.get("cover_image") and image_ids:
        update["cover_image"] = image_ids[0]
    await db.properties.update_one({"_id": _oid(property_id)}, {"$set": update})
    return {"success": True, "image_ids": image_ids}


@router.delete("/admin/properties/{property_id}/images/{image_id}")
async def admin_delete_image(property_id: str, image_id: str, admin: str = Depends(verify_admin)):
    """Delete an image from a property."""
    from motor.motor_asyncio import AsyncIOMotorGridFSBucket
    fs = AsyncIOMotorGridFSBucket(db)
    try:
        await fs.delete(_oid(image_id))
    except Exception:
        pass
    prop = await db.properties.find_one({"_id": _oid(property_id)})
    if prop:
        images = [i for i in prop.get("images", []) if i != image_id]
        update = {"images": images}
        if prop.get("cover_image") == image_id:
            update["cover_image"] = images[0] if images else None
        await db.properties.update_one({"_id": _oid(property_id)}, {"$set": update})
    return {"success": True}


@router.put("/admin/properties/{property_id}/cover/{image_id}")
async def admin_set_cover(property_id: str, image_id: str, admin: str = Depends(verify_admin)):
    """Set cover image for a property."""
    await db.properties.update_one({"_id": _oid(property_id)}, {"$set": {"cover_image": image_id}})
    return {"success": True}


@router.post("/admin/properties/{property_id}/pdf")
async def admin_upload_pdf(property_id: str, file: UploadFile = File(...), admin: str = Depends(verify_admin)):
    """Upload PDF exposé for a property."""
    from motor.motor_asyncio import AsyncIOMotorGridFSBucket
    fs = AsyncIOMotorGridFSBucket(db)

    prop = await db.properties.find_one({"_id": _oid(property_id)})
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")

    # Delete old PDF if exists
    if prop.get("pdf_expose_id"):
        try:
            await fs.delete(ObjectId(prop["pdf_expose_id"]))
        except Exception:
            pass

    content = await file.read()
    grid_id = await fs.upload_from_stream(
        file.filename,
        io.BytesIO(content),
        metadata={"content_type": "application/pdf", "property_id": property_id}
    )
    await db.properties.update_one(
        {"_id": _oid(property_id)},
        {"$set": {"pdf_expose_id": str(grid_id), "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    return {"success": True, "pdf_id": str(grid_id)}
