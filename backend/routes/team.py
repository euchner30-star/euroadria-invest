"""Team CRM routes - Member login, lead management, notes, email tracking, outbound emails."""
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import Response
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
import bcrypt
import jwt
import os
import resend

from core import db, RESEND_API_KEY, logger

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

class EmailSend(BaseModel):
    subject: str
    body: str
    signature: Optional[str] = None

class SignatureUpdate(BaseModel):
    signature: str


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


# ── Signature ───────────────────────────────────────────────────────────

@router.get("/team/signature")
async def get_signature(member=Depends(get_current_member)):
    """Get saved signature for current team member."""
    sig = await db.team_signatures.find_one({"email": member["email"]})
    return {"signature": sig.get("signature", "") if sig else ""}


@router.put("/team/signature")
async def save_signature(data: SignatureUpdate, member=Depends(get_current_member)):
    """Save/update signature for current team member."""
    await db.team_signatures.update_one(
        {"email": member["email"]},
        {"$set": {"signature": data.signature, "updated_at": datetime.now(timezone.utc).isoformat()}},
        upsert=True
    )
    return {"success": True}


# ── Outbound Emails ─────────────────────────────────────────────────────

SIGNATURE_HTML_TEMPLATE = """
<div style="margin-top: 28px; padding-top: 20px; border-top: 2px solid #C8A96A; font-family: Arial, sans-serif;">
    <table cellpadding="0" cellspacing="0" border="0" style="font-size: 13px; color: #333;">
        <tr>
            <td style="vertical-align: top; padding-right: 20px; border-right: 2px solid #C8A96A;">
                <img src="https://euroadria.me/euroadria-logo.png" alt="EuroAdria" style="width: 120px; display: block; margin-bottom: 8px;">
            </td>
            <td style="vertical-align: top; padding-left: 20px; line-height: 1.5;">
                <p style="margin: 0 0 2px; font-size: 15px; font-weight: bold; color: #04151F;">EuroAdria Corporate Solutions</p>
                <p style="margin: 0 0 6px;"><a href="https://euroadria.me" style="color: #C8A96A; text-decoration: none; font-size: 12px;">https://euroadria.me</a></p>
                <p style="margin: 0 0 10px; font-size: 11px; color: #888;">a brand of <strong style="color: #555;">Montaris &amp; Co. d.o.o.</strong></p>
                <table cellpadding="0" cellspacing="0" border="0" style="font-size: 12px; color: #555; line-height: 1.6;">
                    <tr>
                        <td style="vertical-align: top; padding-right: 24px;">
                            <p style="margin: 0 0 2px; font-weight: bold; color: #04151F; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Headquarters</p>
                            <p style="margin: 0;">Novi Sad | Podgorica | D&uuml;sseldorf</p>
                            <p style="margin: 0;">Marka Miljanova 12</p>
                            <p style="margin: 0;">21000 Novi Sad, Serbien</p>
                            <p style="margin: 4px 0 0; font-size: 11px; color: #888;">Reg. no.: 22147382 | PIB: 115356237</p>
                        </td>
                    </tr>
                    <tr><td style="padding-top: 8px;">
                        <table cellpadding="0" cellspacing="0" border="0" style="font-size: 12px; color: #555; line-height: 1.5;">
                            <tr>
                                <td style="vertical-align: top; padding-right: 20px;">
                                    <p style="margin: 0 0 2px; font-weight: bold; color: #04151F; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Office Podgorica</p>
                                    <p style="margin: 0;">Studentska br. 11</p>
                                    <p style="margin: 0;">Podgorica, Crna Gora</p>
                                </td>
                                <td style="vertical-align: top;">
                                    <p style="margin: 0 0 2px; font-weight: bold; color: #04151F; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Office D&uuml;sseldorf</p>
                                    <p style="margin: 0;">Speditionsstra&szlig;e 15a</p>
                                    <p style="margin: 0;">40221 D&uuml;sseldorf, Germany</p>
                                </td>
                            </tr>
                        </table>
                    </td></tr>
                </table>
            </td>
        </tr>
    </table>
</div>
"""


@router.post("/team/leads/{lead_id}/email")
async def send_lead_email(lead_id: str, data: EmailSend, member=Depends(get_current_member)):
    """Send an email to a lead from the Team CRM."""
    from bson import ObjectId
    from emails import wrap_email

    lead = await db.leads.find_one({"_id": ObjectId(lead_id)})
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    if not RESEND_API_KEY:
        raise HTTPException(status_code=500, detail="Email service not configured")

    lead_email = lead.get("email")
    if not lead_email:
        raise HTTPException(status_code=400, detail="Lead has no email address")

    # Build HTML body with personal greeting + corporate signature
    body_html = data.body.replace("\n", "<br>")
    personal_line = ""
    if data.signature:
        personal_line = f'<p style="margin: 20px 0 0; color: #555; font-size: 14px; line-height: 1.6;">{data.signature.replace(chr(10), "<br>")}</p>'

    content = f"""
    <div style="color: #333; font-size: 15px; line-height: 1.7;">
        {body_html}
    </div>
    {personal_line}
    {SIGNATURE_HTML_TEMPLATE}
    """

    try:
        resend.api_key = RESEND_API_KEY
        result = resend.Emails.send({
            "from": f"EuroAdria Team <noreply@euroadria.me>",
            "to": [lead_email],
            "subject": data.subject,
            "html": wrap_email(content, lead_id=lead_id),
            "reply_to": member["email"]
        })

        # Store sent email in DB
        email_record = {
            "lead_id": lead_id,
            "to": lead_email,
            "subject": data.subject,
            "body": data.body,
            "signature": data.signature or "",
            "sent_by": member["name"],
            "sent_by_email": member["email"],
            "sent_at": datetime.now(timezone.utc).isoformat(),
            "resend_id": result.get("id") if isinstance(result, dict) else str(result)
        }
        await db.lead_emails.insert_one(email_record)

        # Auto-add note
        await db.lead_notes.insert_one({
            "lead_id": lead_id,
            "text": f"Email sent: \"{data.subject}\"",
            "author": member["name"],
            "created_at": datetime.now(timezone.utc).isoformat()
        })

        logger.info(f"Team email sent by {member['name']} to {lead_email}: {data.subject}")
        return {"success": True, "message": f"Email sent to {lead_email}"}

    except Exception as e:
        logger.error(f"Team email send failed: {e}")
        raise HTTPException(status_code=500, detail=f"Email sending failed: {str(e)}")


@router.get("/team/leads/{lead_id}/emails")
async def get_lead_emails(lead_id: str, member=Depends(get_current_member)):
    """Get all sent emails for a lead."""
    emails = await db.lead_emails.find({"lead_id": lead_id}).sort("sent_at", -1).to_list(50)
    for e in emails:
        e["_id"] = str(e["_id"])
    return emails


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


# ── Email open tracking ─────────────────────────────────────────────────

# 1x1 transparent PNG pixel
PIXEL_PNG = bytes([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
    0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89, 0x00, 0x00, 0x00,
    0x0A, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9C, 0x62, 0x00, 0x00, 0x00, 0x02,
    0x00, 0x01, 0xE2, 0x21, 0xBC, 0x33, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45,
    0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
])

@router.get("/t/{lead_id}.png")
async def track_email_open(lead_id: str, request: Request):
    """Track email opens via invisible pixel. Records timestamp and user-agent."""
    from bson import ObjectId
    try:
        await db.leads.update_one(
            {"_id": ObjectId(lead_id)},
            {
                "$set": {"email_opened": True, "email_opened_at": datetime.now(timezone.utc).isoformat()},
                "$inc": {"email_open_count": 1}
            }
        )
    except Exception:
        pass
    return Response(
        content=PIXEL_PNG,
        media_type="image/png",
        headers={"Cache-Control": "no-store, no-cache, must-revalidate, max-age=0"}
    )
