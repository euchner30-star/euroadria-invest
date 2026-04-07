"""Pages CMS endpoints."""
from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, timezone
import uuid

from core import db, verify_admin
from models import PageCreate, PageUpdate

router = APIRouter()

DEFAULT_PAGES = {
    "home": {
        "title": "Home",
        "metaTitle": "EuroAdria - Investment & Business Beratung Adria",
        "metaDescription": "Professionelle Beratung für Investments, Business und Lifestyle an der Adria. Schwerpunkt Montenegro, Serbien und Balkan-Region.",
        "sections": [
            {"id": "hero", "type": "hero", "data": {"title": "Investieren an der Adria", "subtitle": "Ihr Partner für nachhaltige Investments in Montenegro & Serbien", "ctaText": "Jetzt Beratung anfragen", "ctaLink": "/contact"}},
            {"id": "why-balkan", "type": "cards", "title": "Warum Balkan statt EU?", "data": {"cards": [
                {"id": "1", "title": "Niedrige Steuern", "description": "Körperschaftssteuer nur 9% in Montenegro, 15% in Serbien", "icon": "percent"},
                {"id": "2", "title": "EU-Beitritt", "description": "Montenegro und Serbien auf dem Weg in die EU - Wertsteigerungspotenzial", "icon": "flag"},
                {"id": "3", "title": "Wachstumsmarkt", "description": "Tourismus wächst jährlich um 15-20%, Immobilienpreise steigen", "icon": "trending-up"},
                {"id": "4", "title": "Strategische Lage", "description": "Tor zwischen Ost und West, neue Infrastrukturprojekte", "icon": "map-pin"}
            ]}},
            {"id": "task-force", "type": "cards", "title": "Warum Task Force Adria?", "data": {"cards": [
                {"id": "1", "title": "Lokale Expertise", "description": "Unser Team lebt und arbeitet vor Ort", "icon": "users"},
                {"id": "2", "title": "Rechtssicherheit", "description": "Due Diligence und rechtliche Begleitung inklusive", "icon": "shield"},
                {"id": "3", "title": "Netzwerk", "description": "Direkter Zugang zu Off-Market Deals", "icon": "network"},
                {"id": "4", "title": "Rundum-Service", "description": "Von der Suche bis zum Notar - alles aus einer Hand", "icon": "check-circle"}
            ]}}
        ]
    },
    "team": {
        "title": "Über uns",
        "metaTitle": "Team - EuroAdria Investment Beratung",
        "metaDescription": "Lernen Sie unser erfahrenes Team kennen. Holger Kuhlmann und Milena Bubanja - Ihre Experten für Investments an der Adria.",
        "sections": [
            {"id": "hero", "type": "hero", "data": {"title": "Unser Team", "subtitle": "Erfahrung trifft lokale Expertise"}},
            {"id": "team-members", "type": "team", "data": {"members": [
                {"id": "holger", "name": "Holger Kuhlmann", "title": "Berater & Leitung DACH", "description": "Ich glaube daran, dass nachhaltige Projekte und solide Strukturen die beste Basis für langfristigen Erfolg sind.", "image": "/holger-kuhlmann.jpg", "email": "holger@euroadria.me"},
                {"id": "milena", "name": "Milena Bubanja", "title": "Co-Founderin und Geschäftsführerin", "subtitle": "Public Affairs und Balkan Relations", "description": "Nachhaltige Ergebnisse entstehen dort, wo lokale Realität und europäische Standards sauber zusammengeführt werden.", "image": "/milena-bubanja.jpg", "email": "milena@euroadria.me"}
            ]}},
            {"id": "about-text", "type": "text", "title": "Unsere Mission", "content": "<p>EuroAdria wurde gegründet, um deutschsprachigen Investoren einen sicheren und professionellen Zugang zu den wachsenden Märkten Montenegros und Serbiens zu bieten.</p><p>Wir kombinieren deutsche Gründlichkeit mit lokalem Know-how und begleiten Sie von der ersten Idee bis zum erfolgreichen Abschluss.</p>"}
        ]
    },
    "contact": {
        "title": "Kontakt",
        "metaTitle": "Kontakt - EuroAdria Investment Beratung",
        "metaDescription": "Kontaktieren Sie uns für eine unverbindliche Erstberatung zu Investments in Montenegro und Serbien.",
        "sections": [
            {"id": "hero", "type": "hero", "data": {"title": "Kontakt", "subtitle": "Wir freuen uns auf Ihre Anfrage"}},
            {"id": "contact-info", "type": "contact", "data": {"email": "info@euroadria.me", "phone": "+382 69 123 456", "address": "Podgorica, Montenegro", "hours": "Mo-Fr: 9:00 - 18:00 Uhr"}}
        ]
    }
}


@router.get("/pages")
async def get_all_pages():
    pages = await db.pages.find({}, {"_id": 0}).to_list(100)
    return pages


@router.get("/pages/{slug}")
async def get_page(slug: str):
    page = await db.pages.find_one({"slug": slug}, {"_id": 0})
    if not page:
        if slug in DEFAULT_PAGES:
            return {"slug": slug, "id": f"default-{slug}", **DEFAULT_PAGES[slug], "isDefault": True}
        raise HTTPException(status_code=404, detail="Page not found")
    return page


@router.get("/admin/pages")
async def get_admin_pages(admin: str = Depends(verify_admin)):
    pages = await db.pages.find({}, {"_id": 0}).to_list(100)
    existing_slugs = {p["slug"] for p in pages}
    for slug, default_data in DEFAULT_PAGES.items():
        if slug not in existing_slugs:
            pages.append({"slug": slug, "id": f"default-{slug}", **default_data, "isDefault": True})
    return pages


@router.post("/admin/pages")
async def create_page(page: PageCreate, admin: str = Depends(verify_admin)):
    existing = await db.pages.find_one({"slug": page.slug})
    if existing:
        raise HTTPException(status_code=400, detail="Page with this slug already exists")

    page_dict = page.model_dump()
    page_dict["id"] = str(uuid.uuid4())
    page_dict["updatedAt"] = datetime.now(timezone.utc).isoformat()

    await db.pages.insert_one(page_dict)
    page_dict.pop("_id", None)

    return page_dict


@router.put("/admin/pages/{slug}")
async def update_page(slug: str, page_update: PageUpdate, admin: str = Depends(verify_admin)):
    update_data = {k: v for k, v in page_update.model_dump().items() if v is not None}
    update_data["updatedAt"] = datetime.now(timezone.utc).isoformat()

    existing = await db.pages.find_one({"slug": slug})

    if not existing:
        if slug in DEFAULT_PAGES:
            new_page = {"slug": slug, "id": str(uuid.uuid4()), **DEFAULT_PAGES[slug], **update_data}
            await db.pages.insert_one(new_page)
            new_page.pop("_id", None)
            return new_page
        else:
            raise HTTPException(status_code=404, detail="Page not found")

    await db.pages.update_one({"slug": slug}, {"$set": update_data})

    updated = await db.pages.find_one({"slug": slug}, {"_id": 0})
    return updated


@router.delete("/admin/pages/{slug}")
async def delete_page(slug: str, admin: str = Depends(verify_admin)):
    result = await db.pages.delete_one({"slug": slug})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Page not found or is default")
    return {"message": "Page deleted (reset to default)", "slug": slug}
