"""CRM Pipeline endpoints (leads, deals, stats, migration, cleanup)."""
from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, timezone
import uuid

from core import db, verify_admin
from models import CRMLeadCreate, CRMLeadUpdate, DealCreate, DealUpdate, DEFAULT_PIPELINE_STAGES

router = APIRouter()


def get_stage_probability(stage_id: str) -> int:
    for s in DEFAULT_PIPELINE_STAGES:
        if s["id"] == stage_id:
            return s["probability"]
    return 0


@router.get("/admin/crm/stages")
async def get_pipeline_stages(admin: str = Depends(verify_admin)):
    return DEFAULT_PIPELINE_STAGES


@router.get("/admin/crm/leads")
async def get_crm_leads(admin: str = Depends(verify_admin)):
    return await db.crm_leads.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)


@router.post("/admin/crm/leads")
async def create_crm_lead(lead: CRMLeadCreate, admin: str = Depends(verify_admin)):
    lead_dict = lead.model_dump()
    now = datetime.now(timezone.utc).isoformat()
    existing = await db.crm_leads.find_one({"email": lead_dict.get("email", "")})
    if existing:
        if existing.get("status") == "lost":
            await db.crm_leads.update_one({"id": existing["id"]}, {"$set": {"status": "new"}})
        await db.crm_deals.insert_one({"id": str(uuid.uuid4())[:8], "lead_id": existing["id"], "stage": "new_lead", "deal_value": 0, "probability": 10, "expected_revenue": 0, "assigned_to": None, "notes": None, "created_at": now, "updated_at": now})
        return await db.crm_leads.find_one({"id": existing["id"]}, {"_id": 0})

    lead_dict["id"] = str(uuid.uuid4())[:8]
    lead_dict["status"] = "new"
    lead_dict["created_at"] = now
    await db.crm_leads.insert_one(lead_dict)

    await db.crm_deals.insert_one({"id": str(uuid.uuid4())[:8], "lead_id": lead_dict["id"], "stage": "new_lead", "deal_value": 0, "probability": 10, "expected_revenue": 0, "assigned_to": None, "notes": None, "created_at": now, "updated_at": now})

    return await db.crm_leads.find_one({"id": lead_dict["id"]}, {"_id": 0})


@router.put("/admin/crm/leads/{lead_id}")
async def update_crm_lead(lead_id: str, lead: CRMLeadUpdate, admin: str = Depends(verify_admin)):
    update_data = {k: v for k, v in lead.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="Keine Änderungen")
    result = await db.crm_leads.update_one({"id": lead_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Lead nicht gefunden")
    return await db.crm_leads.find_one({"id": lead_id}, {"_id": 0})


@router.delete("/admin/crm/leads/{lead_id}")
async def delete_crm_lead(lead_id: str, admin: str = Depends(verify_admin)):
    await db.crm_deals.delete_many({"lead_id": lead_id})
    result = await db.crm_leads.delete_one({"id": lead_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Lead nicht gefunden")
    return {"message": "Lead und zugehörige Deals gelöscht"}


# ── Deals ───────────────────────────────────────────────────────────────

@router.get("/admin/crm/deals")
async def get_crm_deals(admin: str = Depends(verify_admin)):
    deals = await db.crm_deals.find({}, {"_id": 0}).sort("updated_at", -1).to_list(1000)
    for deal in deals:
        lead = await db.crm_leads.find_one({"id": deal.get("lead_id")}, {"_id": 0})
        deal["lead"] = lead
    return deals


@router.post("/admin/crm/deals")
async def create_crm_deal(deal: DealCreate, admin: str = Depends(verify_admin)):
    probability = get_stage_probability(deal.stage)
    deal_dict = deal.model_dump()
    deal_dict["id"] = str(uuid.uuid4())[:8]
    deal_dict["probability"] = probability
    deal_dict["expected_revenue"] = round(deal_dict["deal_value"] * probability / 100, 2)
    deal_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    deal_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.crm_deals.insert_one(deal_dict)
    return await db.crm_deals.find_one({"id": deal_dict["id"]}, {"_id": 0})


@router.put("/admin/crm/deals/{deal_id}")
async def update_crm_deal(deal_id: str, deal: DealUpdate, admin: str = Depends(verify_admin)):
    update_data = {k: v for k, v in deal.model_dump().items() if v is not None}
    if "stage" in update_data:
        update_data["probability"] = get_stage_probability(update_data["stage"])
    current = await db.crm_deals.find_one({"id": deal_id}, {"_id": 0})
    if not current:
        raise HTTPException(status_code=404, detail="Deal nicht gefunden")
    new_value = update_data.get("deal_value", current.get("deal_value", 0))
    new_prob = update_data.get("probability", current.get("probability", 0))
    update_data["expected_revenue"] = round(new_value * new_prob / 100, 2)
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()

    await db.crm_deals.update_one({"id": deal_id}, {"$set": update_data})
    if update_data.get("stage") == "won":
        await db.crm_leads.update_one({"id": current["lead_id"]}, {"$set": {"status": "won"}})
    elif update_data.get("stage") == "lost":
        await db.crm_leads.update_one({"id": current["lead_id"]}, {"$set": {"status": "lost"}})
    elif update_data.get("stage") and update_data["stage"] not in ["new_lead"]:
        await db.crm_leads.update_one({"id": current["lead_id"]}, {"$set": {"status": "qualified"}})

    return await db.crm_deals.find_one({"id": deal_id}, {"_id": 0})


@router.delete("/admin/crm/deals/{deal_id}")
async def delete_crm_deal(deal_id: str, admin: str = Depends(verify_admin)):
    result = await db.crm_deals.delete_one({"id": deal_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Deal nicht gefunden")
    return {"message": "Deal gelöscht"}


# ── Stats ───────────────────────────────────────────────────────────────

@router.get("/admin/crm/stats")
async def get_crm_stats(admin: str = Depends(verify_admin)):
    total_leads = await db.crm_leads.count_documents({})
    active_deals = await db.crm_deals.count_documents({"stage": {"$nin": ["won", "lost"]}})
    won_deals = await db.crm_deals.count_documents({"stage": "won"})
    lost_deals = await db.crm_deals.count_documents({"stage": "lost"})

    pipeline = db.crm_deals.aggregate([{"$match": {"stage": {"$nin": ["lost", "won"]}}}, {"$group": {"_id": None, "pipeline_value": {"$sum": "$deal_value"}, "expected_revenue": {"$sum": "$expected_revenue"}}}])
    totals = await pipeline.to_list(1)
    totals = totals[0] if totals else {"pipeline_value": 0, "expected_revenue": 0}

    won_pipeline = db.crm_deals.aggregate([{"$match": {"stage": "won"}}, {"$group": {"_id": None, "won_revenue": {"$sum": "$deal_value"}}}])
    won_totals = await won_pipeline.to_list(1)
    won_revenue = won_totals[0]["won_revenue"] if won_totals else 0

    source_pipeline = db.crm_leads.aggregate([{"$group": {"_id": "$lead_source", "count": {"$sum": 1}}}])
    by_source = {doc["_id"]: doc["count"] async for doc in source_pipeline}

    stage_pipeline = db.crm_deals.aggregate([{"$group": {"_id": "$stage", "count": {"$sum": 1}, "total_value": {"$sum": "$deal_value"}, "total_expected": {"$sum": "$expected_revenue"}}}])
    by_stage = {}
    async for doc in stage_pipeline:
        by_stage[doc["_id"]] = {"count": doc["count"], "value": doc["total_value"], "expected": doc["total_expected"]}

    conversion_rate = round((won_deals / total_leads * 100), 1) if total_leads > 0 else 0

    return {"total_leads": total_leads, "active_deals": active_deals, "won_deals": won_deals, "lost_deals": lost_deals, "pipeline_value": totals.get("pipeline_value", 0), "expected_revenue": totals.get("expected_revenue", 0), "won_revenue": won_revenue, "conversion_rate": conversion_rate, "by_source": by_source, "by_stage": by_stage}


# ── Migrate & Cleanup ───────────────────────────────────────────────────

@router.post("/admin/crm/migrate")
async def migrate_existing_leads(admin: str = Depends(verify_admin)):
    old_leads = await db.leads.find({}, {"_id": 0}).to_list(1000)
    contacts = await db.contact_submissions.find({}, {"_id": 0}).to_list(1000)
    migrated = 0
    existing = await db.crm_leads.find({}, {"_id": 0, "email": 1, "id": 1}).to_list(1000)
    existing_map = {l["email"]: l["id"] for l in existing if l.get("email")}
    seen_emails = set()

    for lead in old_leads:
        email = lead.get("email", "")
        if not email or email in seen_emails:
            continue
        seen_emails.add(email)
        now = lead.get("submitted_at", datetime.now(timezone.utc).isoformat())
        if email in existing_map:
            await db.crm_deals.insert_one({"id": str(uuid.uuid4())[:8], "lead_id": existing_map[email], "stage": "new_lead", "deal_value": 0, "probability": 10, "expected_revenue": 0, "assigned_to": None, "notes": None, "created_at": now, "updated_at": now})
            await db.crm_leads.update_one({"id": existing_map[email]}, {"$set": {"status": "new"}})
        else:
            crm_lead = {"id": str(uuid.uuid4())[:8], "name": lead.get("name", ""), "email": email, "phone": lead.get("phone"), "lead_source": lead.get("source", "website"), "utm_source": None, "utm_medium": None, "utm_campaign": None, "entry_page": None, "tool_used": lead.get("type", lead.get("source", "unknown")), "status": "new", "created_at": now}
            await db.crm_leads.insert_one(crm_lead)
            await db.crm_deals.insert_one({"id": str(uuid.uuid4())[:8], "lead_id": crm_lead["id"], "stage": "new_lead", "deal_value": 0, "probability": 10, "expected_revenue": 0, "assigned_to": None, "notes": None, "created_at": now, "updated_at": now})
            existing_map[email] = crm_lead["id"]
        migrated += 1

    for contact in contacts:
        email = contact.get("email", "")
        if not email or email in seen_emails:
            continue
        seen_emails.add(email)
        now = contact.get("submitted_at", datetime.now(timezone.utc).isoformat())
        if email in existing_map:
            await db.crm_deals.insert_one({"id": str(uuid.uuid4())[:8], "lead_id": existing_map[email], "stage": "new_lead", "deal_value": 0, "probability": 10, "expected_revenue": 0, "assigned_to": None, "notes": f"Betreff: {contact.get('subject', '')}", "created_at": now, "updated_at": now})
            await db.crm_leads.update_one({"id": existing_map[email]}, {"$set": {"status": "new"}})
        else:
            crm_lead = {"id": str(uuid.uuid4())[:8], "name": contact.get("name", ""), "email": email, "phone": contact.get("phone"), "lead_source": "kontaktformular", "utm_source": None, "utm_medium": None, "utm_campaign": None, "entry_page": None, "tool_used": "contact_form", "status": "new", "created_at": now}
            await db.crm_leads.insert_one(crm_lead)
            await db.crm_deals.insert_one({"id": str(uuid.uuid4())[:8], "lead_id": crm_lead["id"], "stage": "new_lead", "deal_value": 0, "probability": 10, "expected_revenue": 0, "assigned_to": None, "notes": f"Betreff: {contact.get('subject', '')}", "created_at": now, "updated_at": now})
            existing_map[email] = crm_lead["id"]
        migrated += 1

    return {"migrated": migrated, "total_crm_leads": await db.crm_leads.count_documents({})}


@router.delete("/admin/crm/reset")
async def reset_crm_data(admin: str = Depends(verify_admin)):
    deleted_deals = await db.crm_deals.delete_many({})
    deleted_leads = await db.crm_leads.delete_many({})
    return {"message": "CRM-Daten zurückgesetzt", "deleted_leads": deleted_leads.deleted_count, "deleted_deals": deleted_deals.deleted_count}


@router.post("/admin/db/cleanup")
async def cleanup_database(admin: str = Depends(verify_admin)):
    results = {}
    old_leads = await db.leads.count_documents({})
    if old_leads > 0:
        await db.leads.delete_many({})
        results["old_leads_deleted"] = old_leads

    lead_ids = set()
    async for l in db.crm_leads.find({}, {"_id": 0, "id": 1}):
        lead_ids.add(l.get("id"))

    orphaned = 0
    async for d in db.crm_deals.find({}, {"_id": 0, "id": 1, "lead_id": 1}):
        if d.get("lead_id") not in lead_ids:
            await db.crm_deals.delete_one({"id": d["id"]})
            orphaned += 1
    results["orphaned_deals_deleted"] = orphaned

    collections = await db.list_collection_names()
    empty_removed = []
    keep_collections = {"articles", "contact_submissions", "crm_leads", "crm_deals", "pipeline_stages", "events", "pages", "site_settings", "newsletter_subscribers", "locations", "infrastructure_projects", "opportunity_zones", "leistungen_content", "comments", "page_views"}
    for col in collections:
        if col not in keep_collections:
            count = await db[col].count_documents({})
            if count == 0:
                await db.drop_collection(col)
                empty_removed.append(col)
    results["empty_collections_removed"] = empty_removed

    return {"message": "Datenbank bereinigt", "details": results}
