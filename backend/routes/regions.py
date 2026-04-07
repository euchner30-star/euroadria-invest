"""Regions & Apartments endpoints."""
from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, timezone
import uuid

from core import db, verify_admin
from models import RegionCreate, RegionUpdate, RegionApartment

router = APIRouter()


@router.get("/regions")
async def get_all_regions():
    """Get all regions (Public)"""
    regions = await db.regions.find({}, {"_id": 0}).to_list(100)
    return regions


@router.get("/regions/{slug}")
async def get_region(slug: str):
    """Get a region by slug (Public)"""
    region = await db.regions.find_one({"slug": slug}, {"_id": 0})
    if not region:
        raise HTTPException(status_code=404, detail="Region not found")
    return region


@router.get("/admin/regions")
async def get_admin_regions(admin: str = Depends(verify_admin)):
    """Get all regions with full details (Admin only)"""
    regions = await db.regions.find({}, {"_id": 0}).to_list(100)
    return regions


@router.post("/admin/regions")
async def create_region(region: RegionCreate, admin: str = Depends(verify_admin)):
    """Create a new region (Admin only)"""
    existing = await db.regions.find_one({"slug": region.slug})
    if existing:
        raise HTTPException(status_code=400, detail="Region with this slug already exists")

    region_dict = region.model_dump()
    region_dict["id"] = str(uuid.uuid4())
    region_dict["createdAt"] = datetime.now(timezone.utc).isoformat()
    region_dict["updatedAt"] = datetime.now(timezone.utc).isoformat()

    await db.regions.insert_one(region_dict)
    region_dict.pop("_id", None)
    return region_dict


@router.put("/admin/regions/{slug}")
async def update_region(slug: str, region_update: RegionUpdate, admin: str = Depends(verify_admin)):
    """Update a region (Admin only)"""
    update_data = {k: v for k, v in region_update.model_dump().items() if v is not None}

    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    update_data["updatedAt"] = datetime.now(timezone.utc).isoformat()

    result = await db.regions.update_one({"slug": slug}, {"$set": update_data})

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Region not found")

    updated_region = await db.regions.find_one({"slug": slug}, {"_id": 0})
    return updated_region


@router.delete("/admin/regions/{slug}")
async def delete_region(slug: str, admin: str = Depends(verify_admin)):
    """Delete a region (Admin only)"""
    result = await db.regions.delete_one({"slug": slug})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Region not found")
    return {"message": "Region deleted", "slug": slug}


@router.post("/admin/regions/{slug}/apartments")
async def add_apartment_to_region(slug: str, apartment: RegionApartment, admin: str = Depends(verify_admin)):
    """Add an apartment to a region (Admin only)"""
    region = await db.regions.find_one({"slug": slug})
    if not region:
        raise HTTPException(status_code=404, detail="Region not found")

    apartment_dict = apartment.model_dump()
    apartment_dict["id"] = str(uuid.uuid4())

    await db.regions.update_one({"slug": slug}, {"$push": {"apartments": apartment_dict}})

    return {"message": "Apartment added", "apartment": apartment_dict}


@router.delete("/admin/regions/{slug}/apartments/{apartment_id}")
async def remove_apartment_from_region(slug: str, apartment_id: str, admin: str = Depends(verify_admin)):
    """Remove an apartment from a region (Admin only)"""
    result = await db.regions.update_one({"slug": slug}, {"$pull": {"apartments": {"id": apartment_id}}})

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Region not found")

    return {"message": "Apartment removed", "apartment_id": apartment_id}
