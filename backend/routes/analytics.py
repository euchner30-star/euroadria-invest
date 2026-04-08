"""Analytics & Tracking endpoints."""
from fastapi import APIRouter, Depends
from typing import Optional, List
from datetime import datetime, timezone, timedelta

from core import db, verify_admin, parse_device_type
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
                        {"case": {"$and": ["$has_ref", {"$regexMatch": {"input": "$referrer", "regex": "reddit\\.com"}}]}, "then": "Reddit"},
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
    ct = await db.calculator_tracking.delete_many({})
    ld = await db.leads.delete_many({})
    return {
        "message": "Analytics zurückgesetzt",
        "deleted_page_views": pv.deleted_count,
        "deleted_contact_submissions": cs.deleted_count,
        "deleted_calculator_tracking": ct.deleted_count,
        "deleted_leads": ld.deleted_count
    }


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
