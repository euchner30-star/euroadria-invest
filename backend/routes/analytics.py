"""Analytics & Tracking endpoints."""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone, timedelta
import resend

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
