"""Team CRM routes - Member login, lead management, notes, email tracking, outbound emails."""
from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile, File, Form
from fastapi.responses import Response
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
import bcrypt
import jwt
import os
import resend

from core import db, RESEND_API_KEY, logger, verify_admin as _verify_admin

router = APIRouter()
security = HTTPBearer()
JWT_SECRET = os.environ.get("JWT_SECRET")
if not JWT_SECRET:
    raise RuntimeError("JWT_SECRET must be set in .env")


# ── Models ──────────────────────────────────────────────────────────────

class TeamLogin(BaseModel):
    email: str
    password: str

class NoteCreate(BaseModel):
    text: str

class LeadUpdate(BaseModel):
    status: Optional[str] = None
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    source: Optional[str] = None
    lead_value: Optional[float] = None
    interest: Optional[str] = None
    timeline: Optional[str] = None
    contact_method: Optional[str] = None
    property_value: Optional[float] = None
    property_type: Optional[str] = None
    property_location: Optional[str] = None

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
    """Get leads for team view. Restricted: only assigned. Teamleader: own + team. Member: all."""
    role = member.get("role", "member")
    if role == "restricted":
        leads = await db.leads.find({"assigned_to": member["email"]}).sort("submitted_at", -1).to_list(1000)
    elif role == "teamleader":
        # Own assigned + team members' leads
        subordinates = await db.team_members.find({"reports_to": member["email"]}).to_list(50)
        sub_emails = [s["email"] for s in subordinates]
        all_emails = [member["email"]] + sub_emails
        leads = await db.leads.find({"assigned_to": {"$in": all_emails}}).sort("submitted_at", -1).to_list(1000)
    else:
        leads = await db.leads.find({}).sort("submitted_at", -1).to_list(1000)
    for l in leads:
        l["_id"] = str(l["_id"])
        notes = await db.lead_notes.find({"lead_id": l["_id"]}).sort("created_at", -1).to_list(50)
        for n in notes:
            n["_id"] = str(n["_id"])
        l["notes"] = notes
    return leads


class TeamLeadCreate(BaseModel):
    name: str
    email: str
    phone: Optional[str] = ""
    source: Optional[str] = ""
    interest: Optional[str] = ""
    country: Optional[str] = ""
    city: Optional[str] = ""
    note: Optional[str] = ""


@router.post("/team/leads")
async def create_team_lead(data: TeamLeadCreate, member=Depends(get_current_member)):
    """Create a new lead from Team CRM."""
    email = data.email.strip().lower()
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")
    existing = await db.leads.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=409, detail=f"Lead with email {email} already exists")
    lead = {
        "name": data.name.strip(),
        "email": email,
        "phone": data.phone.strip() if data.phone else "",
        "source": data.source.strip() if data.source else "Team CRM",
        "interest": data.interest.strip() if data.interest else "",
        "country": data.country.strip() if data.country else "",
        "city": data.city.strip() if data.city else "",
        "submitted_at": datetime.now(timezone.utc).isoformat(),
        "assigned_to": member["email"],
        "created_by": member["name"],
    }
    result = await db.leads.insert_one(lead)
    lead["_id"] = str(result.inserted_id)
    # Save initial note if provided
    if data.note and data.note.strip():
        await db.lead_notes.insert_one({
            "lead_id": lead["_id"],
            "text": data.note.strip(),
            "author": member["name"],
            "created_at": datetime.now(timezone.utc).isoformat()
        })
    return lead


@router.get("/team/leads/{lead_id}")
async def get_team_lead(lead_id: str, member=Depends(get_current_member)):
    """Get single lead with notes. Restricted members can only access assigned leads."""
    from bson import ObjectId
    lead = await db.leads.find_one({"_id": ObjectId(lead_id)})
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    # Check access for restricted members
    if member.get("role") == "restricted" and lead.get("assigned_to") != member["email"]:
        raise HTTPException(status_code=403, detail="Access denied")
    lead["_id"] = str(lead["_id"])
    notes = await db.lead_notes.find({"lead_id": lead_id}).sort("created_at", -1).to_list(100)
    for n in notes:
        n["_id"] = str(n["_id"])
    lead["notes"] = notes
    return lead


@router.put("/team/leads/{lead_id}")
async def update_team_lead(lead_id: str, data: LeadUpdate, member=Depends(get_current_member)):
    """Update lead status, value, property details etc."""
    from bson import ObjectId
    # Check access for restricted members
    if member.get("role") == "restricted":
        lead = await db.leads.find_one({"_id": ObjectId(lead_id)})
        if not lead or lead.get("assigned_to") != member["email"]:
            raise HTTPException(status_code=403, detail="Access denied")
    update = {}
    for field in ['status', 'name', 'email', 'phone', 'source', 'lead_value', 'interest', 'timeline', 'contact_method', 'property_value', 'property_type', 'property_location']:
        val = getattr(data, field, None)
        if val is not None:
            update[field] = val
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
    from bson import ObjectId
    if member.get("role") == "restricted":
        lead = await db.leads.find_one({"_id": ObjectId(lead_id)})
        if not lead or lead.get("assigned_to") != member["email"]:
            raise HTTPException(status_code=403, detail="Access denied")
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


# ── Commission Dashboard ────────────────────────────────────────────────

@router.get("/team/commissions")
async def get_my_commissions(member=Depends(get_current_member)):
    """Get commission overview for current team member, including team leader commissions."""
    role = member.get("role", "member")
    email = member["email"]

    # Own leads
    if role == "restricted":
        query = {"assigned_to": email}
    else:
        query = {"$or": [{"assigned_to": email}, {"updated_by": member["name"]}]}

    own_leads = await db.leads.find(query).to_list(1000)

    # Team leader: also get leads from team members who report to me
    team_member_emails = []
    team_leads = []
    if role == "teamleader":
        subordinates = await db.team_members.find({"reports_to": email}).to_list(50)
        team_member_emails = [s["email"] for s in subordinates]
        if team_member_emails:
            team_leads = await db.leads.find({"assigned_to": {"$in": team_member_emails}}).to_list(1000)

    member_full = await db.team_members.find_one({"email": email})
    tl_rate = member_full.get("teamleader_commission_rate", 0) if member_full else 0

    total_pipeline = 0
    total_won = 0
    total_commission_pending = 0
    total_commission_confirmed = 0
    total_team_commission = 0
    deals = []
    own_lead_ids = set()

    # Own deals
    for l in own_leads:
        pv = l.get("property_value", 0) or 0
        status = l.get("status", "new")
        commission = l.get("commission_amount", 0) or 0
        confirmed = l.get("commission_confirmed", False)
        own_lead_ids.add(str(l["_id"]))

        if status == "won" and commission > 0:
            total_won += pv
            if confirmed:
                total_commission_confirmed += commission
            else:
                total_commission_pending += commission

        if pv > 0:
            total_pipeline += pv
            deals.append({
                "lead_id": str(l["_id"]),
                "name": l.get("name", ""),
                "property_value": pv,
                "property_type": l.get("property_type", ""),
                "property_location": l.get("property_location", ""),
                "status": status,
                "commission": round(commission, 2),
                "confirmed": confirmed,
                "type": "own",
                "assigned_to": l.get("assigned_to", ""),
            })

    # Team leader bonus on team deals
    for l in team_leads:
        lid = str(l["_id"])
        if lid in own_lead_ids:
            continue
        pv = l.get("property_value", 0) or 0
        status = l.get("status", "new")
        member_commission = l.get("commission_amount", 0) or 0
        confirmed = l.get("commission_confirmed", False)
        tl_commission = round(pv * tl_rate / 100, 2) if tl_rate > 0 and pv > 0 else 0

        if status == "won" and tl_commission > 0:
            total_team_commission += tl_commission

        if pv > 0:
            deals.append({
                "lead_id": lid,
                "name": l.get("name", ""),
                "property_value": pv,
                "property_type": l.get("property_type", ""),
                "property_location": l.get("property_location", ""),
                "status": status,
                "commission": round(tl_commission, 2),
                "confirmed": confirmed,
                "type": "team",
                "assigned_to": l.get("assigned_to", ""),
            })

    return {
        "total_pipeline_value": round(total_pipeline, 2),
        "total_won_value": round(total_won, 2),
        "total_commission_pending": round(total_commission_pending, 2),
        "total_commission_confirmed": round(total_commission_confirmed, 2),
        "total_team_commission": round(total_team_commission, 2),
        "teamleader_rate": tl_rate,
        "team_members": team_member_emails,
        "deals": deals,
    }

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
<div style="margin-top: 28px; padding-top: 20px; border-top: 2px solid #C8A96A; font-family: Arial, sans-serif; max-width: 100%;">
    <div style="display: block; margin-bottom: 12px;">
        <img src="https://euroadria.me/euroadria-logo.png" alt="EuroAdria" style="width: 100px; display: block; margin-bottom: 10px;">
        <p style="margin: 0 0 2px; font-size: 15px; font-weight: bold; color: #04151F;">EuroAdria Corporate Solutions</p>
        <p style="margin: 0 0 4px;"><a href="https://euroadria.me" style="color: #C8A96A; text-decoration: none; font-size: 12px;">https://euroadria.me</a></p>
        <p style="margin: 0 0 12px; font-size: 11px; color: #888;">a brand of <strong style="color: #555;">Montaris &amp; Co. d.o.o.</strong></p>
    </div>
    <div style="font-size: 12px; color: #555; line-height: 1.6;">
        <p style="margin: 0;">Novi Sad | Podgorica | D&uuml;sseldorf</p>
        <p style="margin: 0;">Marka Miljanova 12, 21000 Novi Sad, Serbien</p>
        <p style="margin: 0 0 8px; font-size: 11px; color: #999;">Reg. no.: 22147382 &nbsp;|&nbsp; PIB: 115356237</p>
        <div style="margin-bottom: 6px;">
            <p style="margin: 0 0 2px; font-weight: bold; color: #04151F; font-size: 11px; letter-spacing: 0.5px;">OFFICE PODGORICA</p>
            <p style="margin: 0;">Studentska br. 11, Podgorica, Crna Gora</p>
        </div>
        <div>
            <p style="margin: 0 0 2px; font-weight: bold; color: #04151F; font-size: 11px; letter-spacing: 0.5px;">OFFICE D&Uuml;SSELDORF</p>
            <p style="margin: 0;">Speditionsstra&szlig;e 15a, 40221 D&uuml;sseldorf, Germany</p>
        </div>
    </div>
</div>
"""


@router.post("/team/leads/{lead_id}/email")
async def send_lead_email(lead_id: str, member=Depends(get_current_member), subject: str = Form(...), body: str = Form(...), signature: str = Form(""), attachments: List[UploadFile] = File(None), document_ids: str = Form("")):
    """Send an email to a lead. Attachments and library documents are sent as download links."""
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

    from core import SITE_URL
    import bleach

    # Sanitize user input for email body
    body = bleach.clean(body, tags=[], strip=True)
    subject = bleach.clean(subject, tags=[], strip=True)

    # Generate download links for documents
    download_links_html = ""
    doc_names = []

    # Handle library documents (comma-separated IDs)
    if document_ids and document_ids.strip():
        for doc_id in document_ids.split(","):
            doc_id = doc_id.strip()
            if not doc_id:
                continue
            doc = await db.documents.find_one({"_id": ObjectId(doc_id), "is_deleted": {"$ne": True}})
            if doc:
                dl_id = str(_uuid.uuid4())
                await db.download_links.insert_one({
                    "download_id": dl_id,
                    "storage_path": doc["storage_path"],
                    "filename": doc["filename"],
                    "label": doc.get("label", doc["filename"]),
                    "lead_id": lead_id,
                    "created_by": member["name"],
                    "created_at": datetime.now(timezone.utc).isoformat(),
                    "download_count": 0,
                })
                dl_url = f"{SITE_URL}/api/dl/{dl_id}"
                size_mb = doc.get("size", 0) / (1024 * 1024)
                doc_names.append(doc.get("label", doc["filename"]))
                download_links_html += f"""
                <a href="{dl_url}" style="display:block;margin:8px 0;padding:14px 20px;background:#04151F;border-radius:10px;text-decoration:none;color:#fff;font-size:14px;">
                    <span style="display:inline-block;vertical-align:middle;margin-right:10px;">📄</span>
                    <span style="font-weight:600;">{doc.get('label', doc['filename'])}</span>
                    <span style="float:right;color:#C8A96A;font-size:12px;">{size_mb:.1f} MB · Download</span>
                </a>"""

    # Handle uploaded attachments → convert each to download link
    attachment_names = []
    if attachments:
        for attachment in attachments:
            if not attachment or not attachment.filename:
                continue
            file_content = await attachment.read()
            if len(file_content) > 25 * 1024 * 1024:
                continue  # Skip files > 25MB

            from object_storage import put_object
            ext = attachment.filename.rsplit(".", 1)[-1] if "." in attachment.filename else "pdf"
            storage_path = f"euroadria/attachments/{_uuid.uuid4()}.{ext}"
            put_object(storage_path, file_content, attachment.content_type or "application/octet-stream")

            dl_id = str(_uuid.uuid4())
            await db.download_links.insert_one({
                "download_id": dl_id,
                "storage_path": storage_path,
                "filename": attachment.filename,
                "label": attachment.filename,
                "lead_id": lead_id,
                "created_by": member["name"],
                "created_at": datetime.now(timezone.utc).isoformat(),
                "download_count": 0,
            })
            dl_url = f"{SITE_URL}/api/dl/{dl_id}"
            size_mb = len(file_content) / (1024 * 1024)
            attachment_names.append(attachment.filename)
            doc_names.append(attachment.filename)
            download_links_html += f"""
            <a href="{dl_url}" style="display:block;margin:8px 0;padding:14px 20px;background:#04151F;border-radius:10px;text-decoration:none;color:#fff;font-size:14px;">
                <span style="display:inline-block;vertical-align:middle;margin-right:10px;">📎</span>
                <span style="font-weight:600;">{attachment.filename}</span>
                <span style="float:right;color:#C8A96A;font-size:12px;">{size_mb:.1f} MB · Download</span>
            </a>"""

    # Build HTML body
    body_html = body.replace("\n", "<br>")
    if signature and signature.strip():
        personal_line = f'<p style="margin: 20px 0 0; color: #555; font-size: 14px; line-height: 1.6;">{signature.replace(chr(10), "<br>")}</p>'
    else:
        personal_line = ""

    docs_section = ""
    if download_links_html:
        docs_section = f"""
        <div style="margin: 24px 0; padding: 20px; background: #f8f8f8; border-radius: 12px;">
            <p style="margin: 0 0 12px; font-size: 13px; color: #999; font-weight: 600; letter-spacing: 0.5px;">DOCUMENTS</p>
            {download_links_html}
        </div>"""

    content = f"""
    <div style="color: #333; font-size: 15px; line-height: 1.7;">
        {body_html}
    </div>
    {docs_section}
    {personal_line}
    {SIGNATURE_HTML_TEMPLATE}
    """

    try:
        resend.api_key = RESEND_API_KEY
        email_params = {
            "from": f"{member['name']} - EuroAdria <{member['email']}>",
            "to": [lead_email],
            "subject": subject,
            "html": wrap_email(content, lang="en", lead_id=lead_id, include_footer=False),
            "reply_to": member["email"]
        }

        result = resend.Emails.send(email_params)

        # Store sent email in DB
        email_record = {
            "lead_id": lead_id,
            "to": lead_email,
            "subject": subject,
            "body": body,
            "signature": signature or "",
            "attachment": attachment_names if attachment_names else None,
            "documents": doc_names,
            "sent_by": member["name"],
            "sent_by_email": member["email"],
            "sent_at": datetime.now(timezone.utc).isoformat(),
            "resend_id": result.get("id") if isinstance(result, dict) else str(result)
        }
        await db.lead_emails.insert_one(email_record)

        # Auto-add note
        note_text = f"Email sent: \"{subject}\""
        if doc_names:
            note_text += f" (Documents: {', '.join(doc_names)})"
        await db.lead_notes.insert_one({
            "lead_id": lead_id,
            "text": note_text,
            "author": member["name"],
            "created_at": datetime.now(timezone.utc).isoformat()
        })

        logger.info(f"Team email sent by {member['name']} to {lead_email}: {subject}")
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



@router.get("/team/products")
async def get_team_products(member=Depends(get_current_member)):
    """Get products explicitly assigned to this team member."""
    all_products = await db.products_catalog.find({"active": True}).to_list(100)
    result = []
    for p in all_products:
        assigned = p.get("assigned_to", [])
        # Only show if explicitly assigned to this member
        if member["email"] in assigned:
            p["_id"] = str(p["_id"])
            result.append(p)
    return result



# ── Seed member ─────────────────────────────────────────────────────────

@router.get("/admin/team-seed")
async def seed_team(admin: str = Depends(_verify_admin)):
    """Seed team members (admin-only, run once per new member)."""
    results = []
    members = [
        {"email": "milena@euroadria.me", "name": "Milena Bubanja", "password": "mb2026!mnfgz", "role": "member"},
        {"email": "d.lein@euroadria.me", "name": "Dennis Lein", "password": "Dl2026!xuzlq", "role": "restricted"},
    ]
    for m in members:
        existing = await db.team_members.find_one({"email": m["email"]})
        if existing:
            # Update role if changed
            if existing.get("role") != m["role"]:
                await db.team_members.update_one({"email": m["email"]}, {"$set": {"role": m["role"]}})
                results.append(f"{m['name']}: role updated to {m['role']}")
            else:
                results.append(f"{m['name']}: already exists")
            continue
        hashed = bcrypt.hashpw(m["password"].encode(), bcrypt.gensalt()).decode()
        await db.team_members.insert_one({
            "email": m["email"],
            "name": m["name"],
            "password": hashed,
            "role": m["role"],
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        results.append(f"{m['name']}: created ({m['role']})")
    return {"results": results}


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


# ── Document Library ─────────────────────────────────────────────────────
import uuid as _uuid
from object_storage import upload_image, get_object


@router.get("/team/documents")
async def get_documents(member=Depends(get_current_member)):
    """Get all documents in the library."""
    docs = await db.documents.find({"is_deleted": {"$ne": True}}).sort("uploaded_at", -1).to_list(200)
    for d in docs:
        d["_id"] = str(d["_id"])
    return docs


@router.post("/team/documents")
async def upload_document(member=Depends(get_current_member), file: UploadFile = File(...), label: str = Form("")):
    """Upload a document to the library (stored in Object Storage)."""
    content = await file.read()
    if len(content) > 25 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 25MB)")

    ext = file.filename.rsplit(".", 1)[-1] if "." in file.filename else "pdf"
    storage_path = f"euroadria/documents/{_uuid.uuid4()}.{ext}"

    from object_storage import put_object
    put_object(storage_path, content, file.content_type or "application/pdf")

    doc = {
        "storage_path": storage_path,
        "filename": file.filename,
        "label": label.strip() or file.filename,
        "content_type": file.content_type or "application/pdf",
        "size": len(content),
        "uploaded_by": member["name"],
        "uploaded_at": datetime.now(timezone.utc).isoformat(),
        "download_count": 0,
        "is_deleted": False,
    }
    result = await db.documents.insert_one(doc)
    doc["_id"] = str(result.inserted_id)
    return doc


@router.delete("/team/documents/{doc_id}")
async def delete_document(doc_id: str, member=Depends(get_current_member)):
    """Soft-delete a document from the library."""
    from bson import ObjectId
    await db.documents.update_one({"_id": ObjectId(doc_id)}, {"$set": {"is_deleted": True}})
    return {"success": True}


# Admin document endpoints

@router.get("/admin/documents")
async def admin_get_documents(admin: str = Depends(_verify_admin)):
    """Admin: Get all documents."""
    docs = await db.documents.find({"is_deleted": {"$ne": True}}).sort("uploaded_at", -1).to_list(200)
    for d in docs:
        d["_id"] = str(d["_id"])
    return docs

@router.post("/admin/documents")
async def admin_upload_document(admin: str = Depends(_verify_admin), file: UploadFile = File(...), label: str = Form("")):
    """Admin: Upload a document."""
    content = await file.read()
    if len(content) > 25 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 25MB)")
    ext = file.filename.rsplit(".", 1)[-1] if "." in file.filename else "pdf"
    storage_path = f"euroadria/documents/{_uuid.uuid4()}.{ext}"
    from object_storage import put_object
    put_object(storage_path, content, file.content_type or "application/pdf")
    doc = {
        "storage_path": storage_path,
        "filename": file.filename,
        "label": label.strip() or file.filename,
        "content_type": file.content_type or "application/pdf",
        "size": len(content),
        "uploaded_by": "Admin",
        "uploaded_at": datetime.now(timezone.utc).isoformat(),
        "download_count": 0,
        "is_deleted": False,
    }
    result = await db.documents.insert_one(doc)
    doc["_id"] = str(result.inserted_id)
    return doc

@router.delete("/admin/documents/{doc_id}")
async def admin_delete_document(doc_id: str, admin: str = Depends(_verify_admin)):
    """Admin: Soft-delete a document."""
    from bson import ObjectId
    await db.documents.update_one({"_id": ObjectId(doc_id)}, {"$set": {"is_deleted": True}})
    return {"success": True}




# ── Public Document Download (no auth required) ─────────────────────────

@router.get("/dl/{download_id}")
async def public_download(download_id: str):
    """Public download endpoint. Anyone with the link can download."""
    dl = await db.download_links.find_one({"download_id": download_id})
    if not dl:
        raise HTTPException(status_code=404, detail="Download link not found or expired")

    # Track download
    await db.download_links.update_one(
        {"download_id": download_id},
        {"$set": {"last_downloaded": datetime.now(timezone.utc).isoformat()}, "$inc": {"download_count": 1}},
    )

    storage_path = dl["storage_path"]
    try:
        data, content_type = get_object(storage_path)
    except Exception:
        raise HTTPException(status_code=404, detail="File not found")

    filename = dl.get("filename", "document.pdf")
    from urllib.parse import quote
    ascii_name = filename.encode("ascii", "ignore").decode("ascii") or "document"
    utf8_name = quote(filename)

    return Response(
        content=data,
        media_type=content_type,
        headers={
            "Content-Disposition": f'attachment; filename="{ascii_name}"; filename*=UTF-8\'\'{utf8_name}',
            "Cache-Control": "private, max-age=3600",
        },
    )
