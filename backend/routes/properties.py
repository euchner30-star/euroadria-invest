"""Property listings endpoints - CRUD for real estate listings with images and PDF exposé."""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import StreamingResponse, Response
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
from bson import ObjectId
import io

from core import db, verify_admin, logger
from object_storage import init_storage, upload_image, get_object


def _oid(val: str) -> ObjectId:
    """Parse ObjectId or raise 400."""
    try:
        return ObjectId(val)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ID format")

router = APIRouter()

# ── Default Locations Seed ───────────────────────────────────────────────
DEFAULT_LOCATIONS = [
    "Budva", "Sveti Stefan", "Pržno", "Tivat", "Kotor", "Herceg Novi",
    "Bar", "Ulcinj", "Podgorica", "Nikšić", "Žabljak", "Skadar Lake",
    "Cetinje", "Danilovgrad", "Buljarica", "Čanj", "Novi Sad", "Belgrade"
]

async def seed_default_locations():
    """Seed default locations if collection is empty."""
    count = await db.property_locations.count_documents({})
    if count == 0:
        docs = [{"name": n, "created_at": datetime.now(timezone.utc).isoformat()} for n in DEFAULT_LOCATIONS]
        await db.property_locations.insert_many(docs)
        logger.info(f"Seeded {len(docs)} default property locations")


# ── Location Management ─────────────────────────────────────────────────

@router.get("/property-locations")
async def get_property_locations():
    """Get all property locations (public)."""
    await seed_default_locations()
    locations = await db.property_locations.find({}).sort("name", 1).to_list(100)
    for l in locations:
        l["_id"] = str(l["_id"])
    return locations


@router.get("/admin/property-locations")
async def admin_get_property_locations(admin: str = Depends(verify_admin)):
    """Get all property locations (admin)."""
    await seed_default_locations()
    locations = await db.property_locations.find({}).sort("name", 1).to_list(100)
    for l in locations:
        l["_id"] = str(l["_id"])
    return locations


@router.post("/admin/property-locations")
async def admin_add_property_location(admin: str = Depends(verify_admin), name: str = Form(...)):
    """Add a new property location."""
    n = name.strip()
    if not n:
        raise HTTPException(status_code=400, detail="Name is required")
    existing = await db.property_locations.find_one({"name": n})
    if existing:
        raise HTTPException(status_code=409, detail="Location already exists")
    result = await db.property_locations.insert_one({"name": n, "created_at": datetime.now(timezone.utc).isoformat()})
    return {"success": True, "_id": str(result.inserted_id), "name": n}


@router.delete("/admin/property-locations/{location_id}")
async def admin_delete_property_location(location_id: str, admin: str = Depends(verify_admin)):
    """Delete a property location."""
    result = await db.property_locations.delete_one({"_id": _oid(location_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Location not found")
    return {"success": True}


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
    """Submit an inquiry for a property - creates a lead and sends notification email."""
    import resend
    from core import RESEND_API_KEY, NOTIFICATION_EMAIL

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
        await db.lead_notes.insert_one({
            "lead_id": str(existing["_id"]),
            "text": f"New property inquiry: {prop.get('title', '')} ({prop.get('location', '')})\nMessage: {message}",
            "author": "System",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
    else:
        await db.leads.insert_one(lead)

    # Send notification emails
    if RESEND_API_KEY:
        from core import SITE_URL
        resend.api_key = RESEND_API_KEY
        price_text = "Price on Request" if prop.get("price_on_request") else f"{prop.get('price', 0):,.0f} EUR"
        cover = prop.get("cover_image") or (prop.get("images", []) or [None])[0]
        img_url = f"{SITE_URL}/api/properties/img/{cover}" if cover else ""
        prop_url = f"{SITE_URL}/properties/{property_id}"

        # 1) Internal notification to team
        try:
            team_html = f"""
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
                <div style="background:#04151F;padding:24px 32px;border-radius:12px 12px 0 0;">
                    <h2 style="color:#C8A96A;margin:0;font-size:20px;">New Property Inquiry</h2>
                </div>
                <div style="background:#f9f9f9;padding:24px 32px;border:1px solid #e5e5e5;">
                    <h3 style="color:#04151F;margin:0 0 4px;">{prop.get('title', '')}</h3>
                    <p style="color:#666;margin:0 0 16px;font-size:14px;">{prop.get('location', '')} · {prop.get('property_type', '')} · {price_text}</p>
                    <table style="width:100%;border-collapse:collapse;font-size:14px;">
                        <tr><td style="padding:8px 0;color:#999;width:100px;">Name</td><td style="padding:8px 0;color:#04151F;font-weight:bold;">{name}</td></tr>
                        <tr><td style="padding:8px 0;color:#999;">Email</td><td style="padding:8px 0;"><a href="mailto:{email}" style="color:#C8A96A;">{email}</a></td></tr>
                        <tr><td style="padding:8px 0;color:#999;">Phone</td><td style="padding:8px 0;color:#04151F;">{phone or '–'}</td></tr>
                    </table>
                    {f'<div style="margin-top:16px;padding:12px 16px;background:#fff;border-left:3px solid #C8A96A;border-radius:4px;font-size:14px;color:#333;">{message}</div>' if message else ''}
                </div>
                <div style="padding:16px 32px;background:#04151F;border-radius:0 0 12px 12px;text-align:center;">
                    <p style="color:#fff;margin:0;font-size:12px;opacity:0.5;">EuroAdria Corporate Solutions</p>
                </div>
            </div>"""
            resend.Emails.send({
                "from": "EuroAdria <noreply@euroadria.me>",
                "to": [NOTIFICATION_EMAIL],
                "subject": f"Property Inquiry: {prop.get('title', '')} – {name}",
                "html": team_html,
                "reply_to": email.strip(),
            })
            logger.info(f"Team notification sent for property {property_id}")
        except Exception as e:
            logger.error(f"Team notification email failed: {e}")

        # 2) Confirmation email to customer with property image
        try:
            features_html = ""
            if prop.get("features"):
                pills = "".join(f'<span style="display:inline-block;background:#f5f0e6;color:#04151F;padding:4px 12px;border-radius:20px;font-size:12px;margin:2px 4px 2px 0;">{f}</span>' for f in prop["features"][:6])
                features_html = f'<div style="margin-top:16px;">{pills}</div>'

            area_info = []
            if prop.get("area_sqm") and prop["area_sqm"] > 0:
                area_info.append(f'{prop["area_sqm"]} m²')
            if prop.get("rooms") and prop["rooms"] > 0:
                area_info.append(f'{prop["rooms"]} Rooms')
            if prop.get("bathrooms") and prop["bathrooms"] > 0:
                area_info.append(f'{prop["bathrooms"]} Bath')
            details_line = " · ".join(area_info)

            customer_html = f"""
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;">
                <!-- Header -->
                <div style="background:#04151F;padding:28px 32px;text-align:center;">
                    <h1 style="color:#C8A96A;margin:0;font-size:22px;font-weight:700;letter-spacing:0.5px;">EUROADRIA</h1>
                    <p style="color:#ffffff;margin:6px 0 0;font-size:12px;opacity:0.5;letter-spacing:2px;">CORPORATE SOLUTIONS</p>
                </div>

                <!-- Greeting -->
                <div style="padding:32px 32px 0;">
                    <h2 style="color:#04151F;margin:0 0 8px;font-size:20px;">Thank you, {name}!</h2>
                    <p style="color:#666;margin:0 0 24px;font-size:14px;line-height:1.6;">We have received your inquiry and our team will get back to you within 24 hours.</p>
                </div>

                <!-- Property Card -->
                <div style="margin:0 32px 24px;border:1px solid #e8e8e8;border-radius:12px;overflow:hidden;">
                    {'<img src="' + img_url + '" alt="' + prop.get("title", "") + '" style="width:100%;height:240px;object-fit:cover;display:block;" />' if img_url else ''}
                    <div style="padding:20px 24px;">
                        <p style="color:#C8A96A;margin:0 0 4px;font-size:12px;font-weight:600;">{prop.get('location', '')} · {prop.get('property_type', '')}</p>
                        <h3 style="color:#04151F;margin:0 0 8px;font-size:18px;font-weight:700;">{prop.get('title', '')}</h3>
                        <p style="color:#04151F;margin:0 0 4px;font-size:22px;font-weight:700;">{price_text}</p>
                        <p style="color:#999;margin:0;font-size:13px;">{details_line}</p>
                        {features_html}
                    </div>
                </div>

                <!-- View Property Button -->
                <div style="padding:0 32px 32px;text-align:center;">
                    <a href="{prop_url}" style="display:inline-block;background:#C8A96A;color:#04151F;padding:14px 40px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;">View Property</a>
                </div>

                <!-- Contact Info -->
                <div style="background:#f8f8f8;padding:24px 32px;border-top:1px solid #eee;">
                    <p style="color:#04151F;margin:0 0 12px;font-size:14px;font-weight:600;">Questions? Reach us directly:</p>
                    <table style="font-size:13px;color:#666;">
                        <tr><td style="padding:3px 12px 3px 0;">WhatsApp</td><td><a href="https://wa.me/38268559776" style="color:#C8A96A;text-decoration:none;">+382 68 559 776</a></td></tr>
                        <tr><td style="padding:3px 12px 3px 0;">Email</td><td><a href="mailto:office@euroadria.me" style="color:#C8A96A;text-decoration:none;">office@euroadria.me</a></td></tr>
                    </table>
                </div>

                <!-- Footer -->
                <div style="background:#04151F;padding:20px 32px;text-align:center;">
                    <p style="color:#fff;margin:0;font-size:11px;opacity:0.4;">EuroAdria Corporate Solutions · Montaris & Co. d.o.o. · Novi Sad, Serbia</p>
                </div>
            </div>"""
            resend.Emails.send({
                "from": "EuroAdria <noreply@euroadria.me>",
                "to": [email.strip()],
                "subject": f"Your Inquiry: {prop.get('title', '')} – EuroAdria",
                "html": customer_html,
            })
            logger.info(f"Customer confirmation sent to {email} for property {property_id}")
        except Exception as e:
            logger.error(f"Customer confirmation email failed: {e}")

    return {"success": True, "message": "Inquiry submitted"}


# ── Property Image Serving ──────────────────────────────────────────────

@router.get("/properties/img/{image_id:path}")
async def serve_property_image(image_id: str):
    """Serve a property image. Tries Object Storage first, falls back to GridFS."""
    # Object Storage path (contains '/')
    if "/" in image_id:
        try:
            data, content_type = get_object(image_id)
            return Response(content=data, media_type=content_type, headers={"Cache-Control": "public, max-age=86400"})
        except Exception as e:
            logger.error(f"Object Storage fetch failed for {image_id}: {e}")
            raise HTTPException(status_code=404, detail="Image not found")

    # Legacy GridFS fallback (ObjectId string)
    from motor.motor_asyncio import AsyncIOMotorGridFSBucket
    fs = AsyncIOMotorGridFSBucket(db)
    try:
        grid_out = await fs.open_download_stream(_oid(image_id))
        content = await grid_out.read()
        content_type = grid_out.metadata.get("content_type", "image/jpeg") if grid_out.metadata else "image/jpeg"
        return Response(content=content, media_type=content_type, headers={"Cache-Control": "public, max-age=86400"})
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
        # RFC 5987 encoded filename to support unicode chars
        from urllib.parse import quote
        raw_title = prop.get("title", "expose")
        ascii_title = raw_title.encode("ascii", "ignore").decode("ascii") or "expose"
        utf8_title = quote(raw_title)
        return StreamingResponse(
            io.BytesIO(content),
            media_type="application/pdf",
            headers={"Content-Disposition": f'inline; filename="{ascii_title}.pdf"; filename*=UTF-8\'\'{utf8_title}.pdf'}
        )
    except Exception as e:
        logger.error(f"PDF serve failed for property {property_id} (pdf_id={prop.get('pdf_expose_id')}): {type(e).__name__}: {e}")
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
    price_on_request: bool = Form(False),
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
        "price_on_request": price_on_request,
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
    price_on_request: bool = Form(None),
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
    for field, val in [("title", title), ("description", description), ("price", price), ("price_on_request", price_on_request), ("area_sqm", area_sqm), ("rooms", rooms), ("bathrooms", bathrooms), ("property_type", property_type), ("location", location), ("address", address), ("status", status), ("published", published)]:
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
    """Upload images to a property listing (stored in Object Storage)."""
    prop = await db.properties.find_one({"_id": _oid(property_id)})
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")

    image_ids = list(prop.get("images", []))
    for file in files:
        content = await file.read()
        if len(content) > 15 * 1024 * 1024:
            continue  # Skip files > 15MB
        try:
            storage_path = upload_image(content, file.filename, file.content_type or "image/jpeg")
            image_ids.append(storage_path)
        except Exception as e:
            logger.error(f"Object Storage upload failed: {e}")
            # Fallback to GridFS
            from motor.motor_asyncio import AsyncIOMotorGridFSBucket
            fs = AsyncIOMotorGridFSBucket(db)
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


@router.delete("/admin/properties/{property_id}/images/{image_id:path}")
async def admin_delete_image(property_id: str, image_id: str, admin: str = Depends(verify_admin)):
    """Delete an image from a property."""
    # Only attempt GridFS delete for legacy ObjectId-style IDs
    if "/" not in image_id:
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
