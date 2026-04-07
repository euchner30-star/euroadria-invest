"""Site settings (downloads, homepage, legal pages)."""
from fastapi import APIRouter, Depends, HTTPException

from core import db, verify_admin

router = APIRouter()

# ── Download Settings ───────────────────────────────────────────────────

SETTINGS_FIXED_KEYS = [
    "praxisleitfaden_url",
    "budva_expose_url",
    "niksic_expose_url",
    "podgorica_expose_url",
    "skadar_lake_expose_url",
    "zabljak_expose_url"
]


@router.get("/settings/downloads")
async def get_download_settings():
    settings = await db.site_settings.find_one({"key": "downloads"}, {"_id": 0})
    if not settings:
        result = {k: "" for k in SETTINGS_FIXED_KEYS}
        result["custom_exposes"] = []
        return result
    result = {k: settings.get(k, "") for k in SETTINGS_FIXED_KEYS}
    result["custom_exposes"] = settings.get("custom_exposes", [])
    return result


@router.put("/admin/settings/downloads")
async def update_download_settings(settings: dict, admin: str = Depends(verify_admin)):
    update_data = {k: settings.get(k, "") for k in SETTINGS_FIXED_KEYS}
    update_data["custom_exposes"] = settings.get("custom_exposes", [])
    update_data["key"] = "downloads"
    await db.site_settings.update_one({"key": "downloads"}, {"$set": update_data}, upsert=True)
    result = {k: update_data[k] for k in SETTINGS_FIXED_KEYS}
    result["custom_exposes"] = update_data["custom_exposes"]
    return result


# ── Homepage Settings ───────────────────────────────────────────────────

HOMEPAGE_DEFAULTS = {
    "hero_title": "Firmengründung, Aufenthalt & Investments in Montenegro und Serbien",
    "hero_subtitle": "EuroAdria ist Ihre Brücke zu erfolgreichen Investitionen, rechtssicherer Auswanderung und internationaler Unternehmensstrukturierung, sowohl in der Adria-Region als auch in Asien. Wir sind Ihr Trusted Advisor für alle unternehmerischen und privaten Vorhaben im Ausland.",
    "hero_cta_text": "Jetzt Beratung anfragen",
    "testimonial_image": "",
    "testimonial_image_position": 50,
    "testimonial_quote": "Dank EuroAdria konnte ich meine Firmengründung in Montenegro schnell, sicher und komplett stressfrei umsetzen. Ich habe mich bestens betreut gefühlt und kann EuroAdria jedem Unternehmer und Investor wärmstens empfehlen.",
    "testimonial_author": "Maximilian R., Unternehmer aus Deutschland",
    "stats_image": "https://images.unsplash.com/photo-1517048676732-d65bc937f952",
    "stats_image_position": 50,
    "cta_title": "Bereit für Ihre Investition?",
    "cta_subtitle": "Vereinbaren Sie ein unverbindliches Erstgespräch mit unseren Experten und entdecken Sie die Möglichkeiten am Balkan.",
    "trust_items": [
        {"title": "Vertrauenswürdig", "desc": "Referenziert in n-tv & RTL"},
        {"title": "Rendite-Fokus", "desc": "Zweistellige Zielrenditen"},
        {"title": "Expertise", "desc": "15+ Jahre Erfahrung"},
        {"title": "Sicherheit", "desc": "Asset Protection"}
    ]
}


@router.get("/settings/homepage")
async def get_homepage_settings():
    settings = await db.site_settings.find_one({"key": "homepage"}, {"_id": 0})
    if not settings:
        return HOMEPAGE_DEFAULTS
    result = {}
    for k, v in HOMEPAGE_DEFAULTS.items():
        saved = settings.get(k)
        if saved is None or saved == "":
            result[k] = v
        else:
            result[k] = saved
    return result


@router.put("/admin/settings/homepage")
async def update_homepage_settings(settings: dict, admin: str = Depends(verify_admin)):
    update_data = {}
    for k in HOMEPAGE_DEFAULTS:
        if k in settings:
            update_data[k] = settings[k]
        else:
            update_data[k] = HOMEPAGE_DEFAULTS[k]
    update_data["key"] = "homepage"
    await db.site_settings.update_one({"key": "homepage"}, {"$set": update_data}, upsert=True)
    return {k: update_data[k] for k in HOMEPAGE_DEFAULTS}


# ── Legal Pages ─────────────────────────────────────────────────────────

@router.get("/settings/legal/{page_type}")
async def get_legal_page(page_type: str):
    if page_type not in ("impressum", "datenschutz", "agb"):
        raise HTTPException(status_code=404, detail="Page not found")
    doc = await db.site_settings.find_one({"key": f"legal_{page_type}"}, {"_id": 0})
    if not doc or not doc.get("content"):
        return {"content": ""}
    return {"content": doc["content"]}


@router.put("/admin/settings/legal/{page_type}")
async def update_legal_page(page_type: str, data: dict, admin: str = Depends(verify_admin)):
    if page_type not in ("impressum", "datenschutz", "agb"):
        raise HTTPException(status_code=404, detail="Page not found")
    content = data.get("content", "")
    await db.site_settings.update_one(
        {"key": f"legal_{page_type}"},
        {"$set": {"key": f"legal_{page_type}", "content": content}},
        upsert=True
    )
    return {"content": content}
