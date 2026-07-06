"""Team CRM routes - Member login, lead management, notes."""
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
import bcrypt
import jwt
import os

from core import db

router = APIRouter()
security = HTTPBearer()
JWT_SECRET = os.environ.get("JWT_SECRET", "euroadria-team-secret-2026")


# ── Models ──────────────────────────────────────────────────────────────

class TeamLogin(BaseModel):
    email: str
    password: str

class NoteCreate(BaseModel):
    text: str

class LeadUpdate(BaseModel):
    status: Optional[str] = None
    lead_value: Optional[float] = None
    interest: Optional[str] = None
    timeline: Optional[str] = None
    contact_method: Optional[str] = None


# ── Auth helpers ────────────────────────────────────────────────────────

async def get_current_member(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=["HS256"])
        member = await db.team_members.find_one({"email": payload["email"]}, {"password": 0})
        if not member:
            raise HTTPException(status_code=401, detail="Invalid token")
        return member
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")


# ── Auth endpoints ──────────────────────────────────────────────────────

@router.post("/team/login")
async def team_login(data: TeamLogin):
    member = await db.team_members.find_one({"email": data.email.lower().strip()})
    if not member:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not bcrypt.checkpw(data.password.encode(), member["password"].encode()):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = jwt.encode(
        {"email": member["email"], "name": member["name"], "role": member.get("role", "member")},
        JWT_SECRET, algorithm="HS256"
    )
    return {"token": token, "name": member["name"], "role": member.get("role", "member")}


@router.get("/team/me")
async def team_me(member=Depends(get_current_member)):
    return {"name": member["name"], "email": member["email"], "role": member.get("role", "member")}


# ── Lead management ────────────────────────────────────────────────────

@router.get("/team/leads")
async def get_team_leads(member=Depends(get_current_member)):
    """Get all leads for team view."""
    leads = await db.leads.find({}).sort("submitted_at", -1).to_list(1000)
    for l in leads:
        l["_id"] = str(l["_id"])
        notes = await db.lead_notes.find({"lead_id": l["_id"]}).sort("created_at", -1).to_list(50)
        for n in notes:
            n["_id"] = str(n["_id"])
        l["notes"] = notes
    return leads


@router.get("/team/leads/{lead_id}")
async def get_team_lead(lead_id: str, member=Depends(get_current_member)):
    """Get single lead with notes."""
    from bson import ObjectId
    lead = await db.leads.find_one({"_id": ObjectId(lead_id)})
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    lead["_id"] = str(lead["_id"])
    notes = await db.lead_notes.find({"lead_id": lead_id}).sort("created_at", -1).to_list(100)
    for n in notes:
        n["_id"] = str(n["_id"])
    lead["notes"] = notes
    return lead


@router.put("/team/leads/{lead_id}")
async def update_team_lead(lead_id: str, data: LeadUpdate, member=Depends(get_current_member)):
    """Update lead status, value, etc."""
    from bson import ObjectId
    update = {}
    if data.status is not None:
        update["status"] = data.status
    if data.lead_value is not None:
        update["lead_value"] = data.lead_value
    if data.interest is not None:
        update["interest"] = data.interest
    if data.timeline is not None:
        update["timeline"] = data.timeline
    if data.contact_method is not None:
        update["contact_method"] = data.contact_method
    if not update:
        raise HTTPException(status_code=400, detail="No fields to update")
    update["updated_at"] = datetime.now(timezone.utc).isoformat()
    update["updated_by"] = member["name"]
    await db.leads.update_one({"_id": ObjectId(lead_id)}, {"$set": update})
    return {"success": True}


# ── Notes ───────────────────────────────────────────────────────────────

@router.post("/team/leads/{lead_id}/notes")
async def add_note(lead_id: str, data: NoteCreate, member=Depends(get_current_member)):
    """Add a note to a lead."""
    note = {
        "lead_id": lead_id,
        "text": data.text,
        "author": member["name"],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    result = await db.lead_notes.insert_one(note)
    note["_id"] = str(result.inserted_id)
    return note


@router.delete("/team/leads/{lead_id}/notes/{note_id}")
async def delete_note(lead_id: str, note_id: str, member=Depends(get_current_member)):
    """Delete a note."""
    from bson import ObjectId
    await db.lead_notes.delete_one({"_id": ObjectId(note_id), "lead_id": lead_id})
    return {"success": True}


# ── Seed member ─────────────────────────────────────────────────────────

@router.get("/team/seed")
async def seed_team():
    """Seed initial team members (run once)."""
    existing = await db.team_members.find_one({"email": "milena@euroadria.me"})
    if existing:
        return {"message": "Already seeded"}
    hashed = bcrypt.hashpw("mb2026!mnfgz".encode(), bcrypt.gensalt()).decode()
    await db.team_members.insert_one({
        "email": "milena@euroadria.me",
        "name": "Milena Bubanja",
        "password": hashed,
        "role": "member",
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    return {"message": "Team member Milena seeded"}
