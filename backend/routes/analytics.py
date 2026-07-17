"""Analytics & Tracking endpoints."""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone, timedelta
import resend
import csv
import io

from core import db, verify_admin, parse_device_type, RESEND_API_KEY, logger
from models import PageViewEvent, StatusCheck, StatusCheckCreate

router = APIRouter()


@router.post("/track/pageview")
async def track_pageview(event: PageViewEvent):
    """Track a page view (called from frontend)"""
    doc = {
        "path": event.path,
        "referrer": event.referrer or "",
        "device": parse_device_type(event.user_agent or ""),
        "utm_source": event.utm_source or "",
        "utm_medium": event.utm_medium or "",
        "utm_campaign": event.utm_campaign or "",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    await db.page_views.insert_one(doc)
    return {"ok": True}


@router.post("/track/calculator")
async def track_calculator_usage():
    """Track ROI calculator usage"""
    doc = {"timestamp": datetime.now(timezone.utc).isoformat(), "type": "roi_calculator"}
    await db.calculator_usage.insert_one(doc)
    return {"ok": True}


@router.post("/track/whatsapp-click")
async def track_whatsapp_click(data: dict):
    """Track WhatsApp button click and create a lead"""
    doc = {
        "page": data.get("page", "/"),
        "articleTitle": data.get("articleTitle", ""),
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "type": "whatsapp_click"
    }
    await db.page_views.insert_one({
        "path": data.get("page", "/"),
        "referrer": "",
        "device": "",
        "utm_source": "whatsapp_click",
        "utm_medium": "chat",
        "utm_campaign": "",
        "timestamp": datetime.now(timezone.utc).isoformat()
    })
    await db.whatsapp_clicks.insert_one(doc)
    return {"ok": True}


@router.get("/admin/analytics/overview")
async def get_analytics_overview(days: int = 30, admin: str = Depends(verify_admin)):
    """Get analytics overview data for dashboard"""
    cutoff = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()

    # Total page views in period
    total_views = await db.page_views.count_documents({"timestamp": {"$gte": cutoff}})

    # Views per day (for chart)
    pipeline_daily = [
        {"$match": {"timestamp": {"$gte": cutoff}}},
        {"$addFields": {"date": {"$substr": ["$timestamp", 0, 10]}}},
        {"$group": {"_id": "$date", "views": {"$sum": 1}}},
        {"$sort": {"_id": 1}}
    ]
    daily_views = await db.page_views.aggregate(pipeline_daily).to_list(60)

    # Top pages
    pipeline_pages = [
        {"$match": {"timestamp": {"$gte": cutoff}}},
        {"$group": {"_id": "$path", "views": {"$sum": 1}}},
        {"$sort": {"views": -1}},
        {"$limit": 10}
    ]
    top_pages = await db.page_views.aggregate(pipeline_pages).to_list(10)

    # Device breakdown
    pipeline_devices = [
        {"$match": {"timestamp": {"$gte": cutoff}}},
        {"$group": {"_id": "$device", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    devices = await db.page_views.aggregate(pipeline_devices).to_list(5)

    # Referrer breakdown (traffic sources) - combined with UTM data
    pipeline_referrers = [
        {"$match": {"timestamp": {"$gte": cutoff}}},
        {"$addFields": {
            "has_utm": {"$and": [
                {"$ne": [{"$ifNull": ["$utm_source", ""]}, ""]},
                {"$ne": [{"$ifNull": ["$utm_source", ""]}, None]}
            ]},
            "has_ref": {"$and": [
                {"$ne": [{"$ifNull": ["$referrer", ""]}, ""]},
                {"$ne": [{"$ifNull": ["$referrer", ""]}, None]}
            ]}
        }},
        {"$addFields": {
            "source": {
                "$switch": {
                    "branches": [
                        {"case": {"$and": ["$has_utm", {"$regexMatch": {"input": {"$ifNull": ["$utm_source", ""]}, "regex": "tiktok", "options": "i"}}]}, "then": "TikTok"},
                        {"case": {"$and": ["$has_utm", {"$regexMatch": {"input": {"$ifNull": ["$utm_source", ""]}, "regex": "^instagram$|^ig$|^insta$|^lg$", "options": "i"}}]}, "then": "Instagram"},
                        {"case": {"$and": ["$has_utm", {"$regexMatch": {"input": {"$ifNull": ["$utm_source", ""]}, "regex": "facebook|^fb$", "options": "i"}}]}, "then": "Facebook"},
                        {"case": {"$and": ["$has_utm", {"$regexMatch": {"input": {"$ifNull": ["$utm_source", ""]}, "regex": "youtube|^yt$", "options": "i"}}]}, "then": "YouTube"},
                        {"case": {"$and": ["$has_utm", {"$regexMatch": {"input": {"$ifNull": ["$utm_source", ""]}, "regex": "linkedin", "options": "i"}}]}, "then": "LinkedIn"},
                        {"case": {"$and": ["$has_utm", {"$regexMatch": {"input": {"$ifNull": ["$utm_source", ""]}, "regex": "google", "options": "i"}}]}, "then": "Google"},
                        {"case": {"$and": ["$has_utm", {"$regexMatch": {"input": {"$ifNull": ["$utm_source", ""]}, "regex": "^tt$|^tik$", "options": "i"}}]}, "then": "TikTok"},
                        {"case": {"$and": ["$has_utm", {"$regexMatch": {"input": {"$ifNull": ["$utm_source", ""]}, "regex": "^twitter$|^x$|x\\.com", "options": "i"}}]}, "then": "Twitter/X"},
                        {"case": {"$and": ["$has_utm", {"$regexMatch": {"input": {"$ifNull": ["$utm_source", ""]}, "regex": "reddit", "options": "i"}}]}, "then": "Reddit"},
                        {"case": {"$and": ["$has_utm", {"$regexMatch": {"input": {"$ifNull": ["$utm_source", ""]}, "regex": "quora", "options": "i"}}]}, "then": "Quora"},
                        {"case": {"$and": ["$has_utm", {"$regexMatch": {"input": {"$ifNull": ["$utm_source", ""]}, "regex": "whatsapp|^wa$", "options": "i"}}]}, "then": "WhatsApp"},
                        {"case": {"$and": ["$has_utm", {"$regexMatch": {"input": {"$ifNull": ["$utm_source", ""]}, "regex": "telegram|^tg$", "options": "i"}}]}, "then": "Telegram"},
                        {"case": "$has_utm", "then": "Andere (UTM)"},
                        {"case": {"$and": ["$has_ref", {"$regexMatch": {"input": "$referrer", "regex": "google"}}]}, "then": "Google"},
                        {"case": {"$and": ["$has_ref", {"$regexMatch": {"input": "$referrer", "regex": "linkedin"}}]}, "then": "LinkedIn"},
                        {"case": {"$and": ["$has_ref", {"$regexMatch": {"input": "$referrer", "regex": "facebook|fb.com"}}]}, "then": "Facebook"},
                        {"case": {"$and": ["$has_ref", {"$regexMatch": {"input": "$referrer", "regex": "instagram|l\\.instagram"}}]}, "then": "Instagram"},
                        {"case": {"$and": ["$has_ref", {"$regexMatch": {"input": "$referrer", "regex": "twitter|x.com"}}]}, "then": "Twitter/X"},
                        {"case": {"$and": ["$has_ref", {"$regexMatch": {"input": "$referrer", "regex": "tiktok"}}]}, "then": "TikTok"},
                        {"case": {"$and": ["$has_ref", {"$regexMatch": {"input": "$referrer", "regex": "youtube"}}]}, "then": "YouTube"},
                        {"case": {"$and": ["$has_ref", {"$regexMatch": {"input": "$referrer", "regex": "euroadria"}}]}, "then": "EuroAdria.me"},
                        {"case": {"$and": ["$has_ref", {"$regexMatch": {"input": "$referrer", "regex": "rtl\\.de|rtl\\.com|n-tv|ntv"}}]}, "then": "RTL / n-tv"},
                        {"case": {"$and": ["$has_ref", {"$regexMatch": {"input": "$referrer", "regex": "focus\\.de|focus\\.com"}}]}, "then": "Focus"},
                        {"case": {"$and": ["$has_ref", {"$regexMatch": {"input": "$referrer", "regex": "bild\\.de"}}]}, "then": "Bild"},
                        {"case": {"$and": ["$has_ref", {"$regexMatch": {"input": "$referrer", "regex": "spiegel\\.de"}}]}, "then": "Spiegel"},
                        {"case": {"$and": ["$has_ref", {"$regexMatch": {"input": "$referrer", "regex": "welt\\.de"}}]}, "then": "Welt"},
                        {"case": {"$and": ["$has_ref", {"$regexMatch": {"input": "$referrer", "regex": "faz\\.net"}}]}, "then": "FAZ"},
                        {"case": {"$and": ["$has_ref", {"$regexMatch": {"input": "$referrer", "regex": "handelsblatt\\.com"}}]}, "then": "Handelsblatt"},
                        {"case": {"$and": ["$has_ref", {"$regexMatch": {"input": "$referrer", "regex": "finanzen\\.net|finanzen\\.de"}}]}, "then": "Finanzen.net"},
                        {"case": {"$and": ["$has_ref", {"$regexMatch": {"input": "$referrer", "regex": "t-online\\.de"}}]}, "then": "t-online"},
                        {"case": {"$and": ["$has_ref", {"$regexMatch": {"input": "$referrer", "regex": "reddit\\.com|reddit", "options": "i"}}]}, "then": "Reddit"},
                        {"case": {"$and": ["$has_ref", {"$regexMatch": {"input": "$referrer", "regex": "quora\\.com|quora", "options": "i"}}]}, "then": "Quora"},
                        {"case": {"$and": ["$has_ref", {"$regexMatch": {"input": "$referrer", "regex": "whatsapp\\.com|wa\\.me"}}]}, "then": "WhatsApp"},
                        {"case": {"$and": ["$has_ref", {"$regexMatch": {"input": "$referrer", "regex": "t\\.me|telegram"}}]}, "then": "Telegram"},
                        {"case": {"$and": ["$has_ref", {"$regexMatch": {"input": "$referrer", "regex": "bing\\.com"}}]}, "then": "Bing"},
                        {"case": "$has_ref", "then": "Andere"},
                    ],
                    "default": "Direkt"
                }
            }
        }},
        {"$group": {"_id": "$source", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 10}
    ]
    referrers = await db.page_views.aggregate(pipeline_referrers).to_list(10)

    # Total leads in period
    total_leads = await db.leads.count_documents({"submitted_at": {"$gte": cutoff}})

    # Leads by source
    pipeline_lead_sources = [
        {"$match": {"submitted_at": {"$gte": cutoff}}},
        {"$group": {"_id": "$source", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    lead_sources = await db.leads.aggregate(pipeline_lead_sources).to_list(10)

    # Calculator usage count
    calc_usage = await db.calculator_usage.count_documents({"timestamp": {"$gte": cutoff}})

    # Contact form submissions count
    total_contacts = await db.contact_submissions.count_documents({"submitted_at": {"$gte": cutoff}})

    # Recent leads (include _id as string for deletion)
    recent_leads_raw = await db.leads.find({}).sort("submitted_at", -1).to_list(20)
    recent_leads = []
    for l in recent_leads_raw:
        l["lead_id"] = str(l.pop("_id"))
        recent_leads.append(l)

    # Conversion rate
    conversion_rate = round((total_leads / total_views * 100), 2) if total_views > 0 else 0

    # UTM Campaign / Source tracking (normalized)
    pipeline_utm = [
        {"$match": {"timestamp": {"$gte": cutoff}, "utm_source": {"$nin": ["", None]}}},
        {"$addFields": {
            "norm_source": {
                "$switch": {
                    "branches": [
                        {"case": {"$regexMatch": {"input": "$utm_source", "regex": "tiktok|^tt$|^tik$", "options": "i"}}, "then": "TikTok"},
                        {"case": {"$regexMatch": {"input": "$utm_source", "regex": "^instagram$|^ig$|^insta$|^lg$", "options": "i"}}, "then": "Instagram"},
                        {"case": {"$regexMatch": {"input": "$utm_source", "regex": "facebook|^fb$", "options": "i"}}, "then": "Facebook"},
                        {"case": {"$regexMatch": {"input": "$utm_source", "regex": "youtube|^yt$", "options": "i"}}, "then": "YouTube"},
                        {"case": {"$regexMatch": {"input": "$utm_source", "regex": "linkedin", "options": "i"}}, "then": "LinkedIn"},
                        {"case": {"$regexMatch": {"input": "$utm_source", "regex": "google", "options": "i"}}, "then": "Google"},
                        {"case": {"$regexMatch": {"input": "$utm_source", "regex": "^twitter$|^x$|x\\.com", "options": "i"}}, "then": "Twitter/X"},
                        {"case": {"$regexMatch": {"input": "$utm_source", "regex": "reddit", "options": "i"}}, "then": "Reddit"},
                        {"case": {"$regexMatch": {"input": "$utm_source", "regex": "quora", "options": "i"}}, "then": "Quora"},
                        {"case": {"$regexMatch": {"input": "$utm_source", "regex": "whatsapp|^wa$", "options": "i"}}, "then": "WhatsApp"},
                        {"case": {"$regexMatch": {"input": "$utm_source", "regex": "telegram|^tg$", "options": "i"}}, "then": "Telegram"},
                    ],
                    "default": "$utm_source"
                }
            }
        }},
        {"$group": {
            "_id": {
                "source": "$norm_source",
                "medium": "$utm_medium",
                "campaign": "$utm_campaign"
            },
            "count": {"$sum": 1}
        }},
        {"$sort": {"count": -1}},
        {"$limit": 15}
    ]
    utm_data = await db.page_views.aggregate(pipeline_utm).to_list(15)

    # UTM sources summary
    pipeline_utm_sources = [
        {"$match": {"timestamp": {"$gte": cutoff}, "utm_source": {"$nin": ["", None]}}},
        {"$addFields": {
            "norm_source": {
                "$switch": {
                    "branches": [
                        {"case": {"$regexMatch": {"input": "$utm_source", "regex": "tiktok|^tt$|^tik$", "options": "i"}}, "then": "TikTok"},
                        {"case": {"$regexMatch": {"input": "$utm_source", "regex": "^instagram$|^ig$|^insta$|^lg$", "options": "i"}}, "then": "Instagram"},
                        {"case": {"$regexMatch": {"input": "$utm_source", "regex": "facebook|^fb$", "options": "i"}}, "then": "Facebook"},
                        {"case": {"$regexMatch": {"input": "$utm_source", "regex": "youtube|^yt$", "options": "i"}}, "then": "YouTube"},
                        {"case": {"$regexMatch": {"input": "$utm_source", "regex": "linkedin", "options": "i"}}, "then": "LinkedIn"},
                        {"case": {"$regexMatch": {"input": "$utm_source", "regex": "google", "options": "i"}}, "then": "Google"},
                        {"case": {"$regexMatch": {"input": "$utm_source", "regex": "^twitter$|^x$|x\\.com", "options": "i"}}, "then": "Twitter/X"},
                        {"case": {"$regexMatch": {"input": "$utm_source", "regex": "reddit", "options": "i"}}, "then": "Reddit"},
                        {"case": {"$regexMatch": {"input": "$utm_source", "regex": "quora", "options": "i"}}, "then": "Quora"},
                        {"case": {"$regexMatch": {"input": "$utm_source", "regex": "whatsapp|^wa$", "options": "i"}}, "then": "WhatsApp"},
                        {"case": {"$regexMatch": {"input": "$utm_source", "regex": "telegram|^tg$", "options": "i"}}, "then": "Telegram"},
                    ],
                    "default": "$utm_source"
                }
            }
        }},
        {"$group": {"_id": "$norm_source", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 10}
    ]
    utm_sources = await db.page_views.aggregate(pipeline_utm_sources).to_list(10)

    return {
        "total_views": total_views,
        "total_leads": total_leads,
        "total_contacts": total_contacts,
        "calculator_usage": calc_usage,
        "conversion_rate": conversion_rate,
        "daily_views": [{"date": d["_id"], "views": d["views"]} for d in daily_views],
        "top_pages": [{"path": p["_id"], "views": p["views"]} for p in top_pages],
        "devices": [{"device": d["_id"], "count": d["count"]} for d in devices],
        "referrers": [{"source": r["_id"], "count": r["count"]} for r in referrers],
        "lead_sources": [{"source": l["_id"], "count": l["count"]} for l in lead_sources],
        "recent_leads": recent_leads,
        "utm_sources": [{"source": u["_id"], "count": u["count"]} for u in utm_sources],
        "utm_campaigns": [{"source": u["_id"].get("source", "-"), "medium": u["_id"].get("medium", "") or "-", "campaign": u["_id"].get("campaign", "") or "-", "count": u["count"]} for u in utm_data]
    }


@router.delete("/admin/analytics/reset")
async def reset_analytics(admin: str = Depends(verify_admin)):
    """Reset all analytics data (page views, contact submissions, calculator tracking, leads)"""
    pv = await db.page_views.delete_many({})
    cs = await db.contact_submissions.delete_many({})
    ct = await db.calculator_usage.delete_many({})
    ld = await db.leads.delete_many({})
    return {
        "message": "Analytics zurückgesetzt",
        "deleted_page_views": pv.deleted_count,
        "deleted_contact_submissions": cs.deleted_count,
        "deleted_calculator_tracking": ct.deleted_count,
        "deleted_leads": ld.deleted_count
    }


@router.get("/admin/leads/{lead_id}")
async def get_lead_detail(lead_id: str, admin: str = Depends(verify_admin)):
    """Get single lead with notes (Admin)"""
    from bson import ObjectId
    try:
        lead = await db.leads.find_one({"_id": ObjectId(lead_id)})
        if not lead:
            raise HTTPException(status_code=404, detail="Lead nicht gefunden")
        lead["_id"] = str(lead["_id"])
        notes = await db.lead_notes.find({"lead_id": lead_id}).sort("created_at", -1).to_list(100)
        for n in notes:
            n["_id"] = str(n["_id"])
        lead["notes"] = notes
        return lead
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


class AdminNoteCreate(BaseModel):
    text: str


@router.post("/admin/leads/{lead_id}/notes")
async def admin_add_note(lead_id: str, data: AdminNoteCreate, admin: str = Depends(verify_admin)):
    """Add a note to a lead (Admin)"""
    from bson import ObjectId
    from datetime import datetime, timezone
    lead = await db.leads.find_one({"_id": ObjectId(lead_id)})
    if not lead:
        raise HTTPException(status_code=404, detail="Lead nicht gefunden")
    note = {
        "lead_id": lead_id,
        "text": data.text,
        "author": "Admin (Holger)",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    result = await db.lead_notes.insert_one(note)
    note["_id"] = str(result.inserted_id)
    return note


# ── Admin Email ─────────────────────────────────────────────────────────

class AdminEmailSend(BaseModel):
    subject: str
    body: str


@router.post("/admin/leads/{lead_id}/email")
async def admin_send_email(lead_id: str, data: AdminEmailSend, admin: str = Depends(verify_admin)):
    """Send email to a lead from Admin panel (Holger)."""
    from bson import ObjectId
    from emails import wrap_email
    from routes.team import SIGNATURE_HTML_TEMPLATE

    lead = await db.leads.find_one({"_id": ObjectId(lead_id)})
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    if not RESEND_API_KEY:
        raise HTTPException(status_code=500, detail="Email service not configured")

    lead_email = lead.get("email")
    if not lead_email:
        raise HTTPException(status_code=400, detail="Lead has no email address")

    body_html = data.body.replace("\n", "<br>")
    personal = '<p style="margin: 20px 0 0; color: #555; font-size: 14px; line-height: 1.6;">Kind regards,<br>Holger Kuhlmann<br>CEO &amp; Founder</p>'

    content = f"""
    <div style="color: #333; font-size: 15px; line-height: 1.7;">
        {body_html}
    </div>
    {personal}
    {SIGNATURE_HTML_TEMPLATE}
    """

    try:
        resend.api_key = RESEND_API_KEY
        result = resend.Emails.send({
            "from": "Holger Kuhlmann - EuroAdria <office@euroadria.me>",
            "to": [lead_email],
            "subject": data.subject,
            "html": wrap_email(content, lang="en", lead_id=lead_id, include_footer=False),
            "reply_to": "office@euroadria.me"
        })

        email_record = {
            "lead_id": lead_id,
            "to": lead_email,
            "subject": data.subject,
            "body": data.body,
            "sent_by": "Admin (Holger)",
            "sent_by_email": "office@euroadria.me",
            "sent_at": datetime.now(timezone.utc).isoformat(),
            "resend_id": result.get("id") if isinstance(result, dict) else str(result)
        }
        await db.lead_emails.insert_one(email_record)

        await db.lead_notes.insert_one({
            "lead_id": lead_id,
            "text": f"Email sent: \"{data.subject}\"",
            "author": "Admin (Holger)",
            "created_at": datetime.now(timezone.utc).isoformat()
        })

        logger.info(f"Admin email sent to {lead_email}: {data.subject}")
        return {"success": True, "message": f"Email sent to {lead_email}"}
    except Exception as e:
        logger.error(f"Admin email send failed: {e}")
        raise HTTPException(status_code=500, detail=f"Email sending failed: {str(e)}")


@router.get("/admin/leads/{lead_id}/emails")
async def admin_get_lead_emails(lead_id: str, admin: str = Depends(verify_admin)):
    """Get sent email history for a lead."""
    emails = await db.lead_emails.find({"lead_id": lead_id}).sort("sent_at", -1).to_list(50)
    for e in emails:
        e["_id"] = str(e["_id"])
    return emails


class ManualLeadCreate(BaseModel):
    name: str
    email: str
    phone: Optional[str] = ""
    source: Optional[str] = "Manual"
    interest: Optional[str] = ""
    country: Optional[str] = ""
    city: Optional[str] = ""


@router.post("/admin/leads")
async def create_manual_lead(data: ManualLeadCreate, admin: str = Depends(verify_admin)):
    """Manually create a lead from Admin panel."""
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
        "source": data.source.strip() if data.source else "Manual",
        "interest": data.interest.strip() if data.interest else "",
        "country": data.country.strip() if data.country else "",
        "city": data.city.strip() if data.city else "",
        "submitted_at": datetime.now(timezone.utc).isoformat(),
        "manual": True,
    }
    result = await db.leads.insert_one(lead)
    lead["_id"] = str(result.inserted_id)
    return lead


class LeadAssign(BaseModel):
    assigned_to: Optional[str] = None  # email of team member, or None to unassign


@router.put("/admin/leads/{lead_id}/assign")
async def assign_lead(lead_id: str, data: LeadAssign, admin: str = Depends(verify_admin)):
    """Assign a lead to a team member (or unassign)."""
    from bson import ObjectId
    lead = await db.leads.find_one({"_id": ObjectId(lead_id)})
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    update = {"assigned_to": data.assigned_to or None}
    if data.assigned_to:
        member = await db.team_members.find_one({"email": data.assigned_to})
        update["assigned_to_name"] = member["name"] if member else data.assigned_to
    else:
        update["assigned_to_name"] = None
    await db.leads.update_one({"_id": ObjectId(lead_id)}, {"$set": update})
    return {"success": True, "assigned_to": data.assigned_to}


@router.get("/admin/team-members")
async def get_team_members(admin: str = Depends(verify_admin)):
    """Get all team members with stats."""
    members = await db.team_members.find({}, {"password": 0}).to_list(50)
    for m in members:
        m["_id"] = str(m["_id"])
        # Count assigned leads
        assigned = await db.leads.count_documents({"assigned_to": m["email"]})
        won = await db.leads.count_documents({"assigned_to": m["email"], "status": "won"})
        m["assigned_leads"] = assigned
        m["won_deals"] = won
    return members


class TeamMemberCreate(BaseModel):
    email: str
    name: str
    password: str
    role: Optional[str] = "member"
    commission_rate: Optional[float] = 3.0


class TeamMemberUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    commission_rate: Optional[float] = None
    reports_to: Optional[str] = None
    teamleader_commission_rate: Optional[float] = None


@router.post("/admin/team-members")
async def create_team_member(data: TeamMemberCreate, admin: str = Depends(verify_admin)):
    """Create a new team member."""
    import bcrypt
    email = data.email.strip().lower()
    existing = await db.team_members.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=409, detail=f"Member {email} already exists")
    hashed = bcrypt.hashpw(data.password.encode(), bcrypt.gensalt()).decode()
    member = {
        "email": email,
        "name": data.name.strip(),
        "password": hashed,
        "role": data.role or "member",
        "commission_rate": data.commission_rate or 3.0,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.team_members.insert_one(member)
    return {"success": True, "email": email, "name": data.name}


@router.put("/admin/team-members/{email}")
async def update_team_member(email: str, data: TeamMemberUpdate, admin: str = Depends(verify_admin)):
    """Update a team member."""
    update = {}
    if data.name is not None:
        update["name"] = data.name.strip()
    if data.role is not None:
        update["role"] = data.role
    if data.commission_rate is not None:
        update["commission_rate"] = data.commission_rate
    if data.reports_to is not None:
        update["reports_to"] = data.reports_to if data.reports_to else None
    if data.teamleader_commission_rate is not None:
        update["teamleader_commission_rate"] = data.teamleader_commission_rate
    if not update:
        raise HTTPException(status_code=400, detail="No fields to update")
    result = await db.team_members.update_one({"email": email}, {"$set": update})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Member not found")
    return {"success": True}


@router.delete("/admin/team-members/{email}")
async def delete_team_member(email: str, admin: str = Depends(verify_admin)):
    """Delete a team member."""
    result = await db.team_members.delete_one({"email": email})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Member not found")
    return {"success": True}


class CommissionRateUpdate(BaseModel):
    commission_rate: float


@router.put("/admin/team-members/{email}/commission")
async def set_commission_rate(email: str, data: CommissionRateUpdate, admin: str = Depends(verify_admin)):
    """Set commission rate for a team member."""
    result = await db.team_members.update_one(
        {"email": email},
        {"$set": {"commission_rate": data.commission_rate}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Member not found")
    return {"success": True, "commission_rate": data.commission_rate}


@router.get("/admin/commissions")
async def get_all_commissions(admin: str = Depends(verify_admin)):
    """Get commission overview across all team members for export."""
    members = await db.team_members.find({}, {"password": 0}).to_list(50)
    result = []
    for m in members:
        leads = await db.leads.find({"assigned_to": m["email"], "commission_amount": {"$gt": 0}}).to_list(500)
        for l in leads:
            result.append({
                "lead_id": str(l["_id"]),
                "member_name": m["name"],
                "member_email": m["email"],
                "lead_name": l.get("name", ""),
                "lead_email": l.get("email", ""),
                "property_value": l.get("property_value", 0),
                "property_type": l.get("property_type", ""),
                "property_location": l.get("property_location", ""),
                "commission_amount": l.get("commission_amount", 0),
                "status": l.get("status", ""),
                "confirmed": l.get("commission_confirmed", False),
                "confirmed_at": l.get("commission_confirmed_at", ""),
            })
    return result


@router.put("/admin/leads/{lead_id}/confirm-commission")
async def confirm_commission(lead_id: str, admin: str = Depends(verify_admin)):
    """Confirm a commission on a won deal."""
    from bson import ObjectId
    lead = await db.leads.find_one({"_id": ObjectId(lead_id)})
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    await db.leads.update_one(
        {"_id": ObjectId(lead_id)},
        {"$set": {"commission_confirmed": True, "commission_confirmed_at": datetime.now(timezone.utc).isoformat()}}
    )
    return {"success": True}


@router.delete("/admin/leads/{lead_id}")
async def delete_lead(lead_id: str, admin: str = Depends(verify_admin)):
    """Delete a lead from the leads collection"""
    from bson import ObjectId
    try:
        result = await db.leads.delete_one({"_id": ObjectId(lead_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Lead nicht gefunden")
        return {"message": "Lead gelöscht", "id": lead_id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ── CSV Lead Import ─────────────────────────────────────────────────────

FIELD_MAP = {
    'e-mail': 'email', 'email': 'email', 'e_mail': 'email',
    'name': 'name', 'full_name': 'name', 'fullname': 'name',
    'vorname': 'first_name', 'first_name': 'first_name', 'firstname': 'first_name',
    'nachname': 'last_name', 'last_name': 'last_name', 'lastname': 'last_name',
    'telefonnummer': 'phone', 'phone': 'phone', 'telefon': 'phone', 'tel': 'phone',
    'whatsapp-nummer': 'whatsapp', 'whatsapp': 'whatsapp', 'whatsapp_nummer': 'whatsapp',
    'sekundäre telefonnummer': 'phone_secondary', 'secondary_phone': 'phone_secondary',
    'quelle': 'csv_source', 'source': 'csv_source',
}


@router.post("/admin/leads/import")
async def import_leads_csv(
    file: UploadFile = File(...),
    source_label: str = Form("CSV Import"),
    admin: str = Depends(verify_admin)
):
    """Import leads from CSV file."""
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")

    content = await file.read()
    # Try UTF-8 BOM, then UTF-8, then latin-1
    for enc in ['utf-8-sig', 'utf-8', 'latin-1']:
        try:
            text = content.decode(enc)
            break
        except UnicodeDecodeError:
            continue
    else:
        raise HTTPException(status_code=400, detail="Could not decode CSV file")

    reader = csv.DictReader(io.StringIO(text), delimiter=',')
    # Auto-detect delimiter: if first field contains semicolons, switch
    if reader.fieldnames and len(reader.fieldnames) <= 2 and ';' in (reader.fieldnames[0] or ''):
        reader = csv.DictReader(io.StringIO(text), delimiter=';')

    imported = 0
    skipped = 0
    errors = []

    for i, row in enumerate(reader):
        mapped = {}
        for col, val in row.items():
            if not col:
                continue
            key = FIELD_MAP.get(col.strip().lower(), None)
            if key:
                mapped[key] = (val or '').strip()

        # Build name from parts if not present
        if not mapped.get('name') and (mapped.get('first_name') or mapped.get('last_name')):
            mapped['name'] = f"{mapped.get('first_name', '')} {mapped.get('last_name', '')}".strip()

        email = mapped.get('email', '').strip().lower()
        if not email:
            skipped += 1
            continue

        # Check duplicate
        existing = await db.leads.find_one({"email": email})
        if existing:
            skipped += 1
            continue

        phone = mapped.get('phone', '')
        if phone and not phone.startswith('+'):
            phone = '+' + phone

        lead = {
            "name": mapped.get('name', email.split('@')[0]),
            "email": email,
            "phone": phone,
            "whatsapp": mapped.get('whatsapp', ''),
            "source": source_label,
            "csv_source": mapped.get('csv_source', ''),
            "submitted_at": datetime.now(timezone.utc).isoformat(),
            "imported": True,
            "import_date": datetime.now(timezone.utc).isoformat(),
        }
        try:
            await db.leads.insert_one(lead)
            imported += 1
        except Exception as e:
            errors.append(f"Row {i+1}: {str(e)}")

    logger.info(f"CSV Import: {imported} imported, {skipped} skipped, {len(errors)} errors")
    return {
        "success": True,
        "imported": imported,
        "skipped": skipped,
        "errors": errors,
        "total_rows": imported + skipped + len(errors)
    }


# ── Status Checks (legacy) ─────────────────────────────────────────────

@router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    _ = await db.status_checks.insert_one(doc)
    return status_obj


@router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    return status_checks
