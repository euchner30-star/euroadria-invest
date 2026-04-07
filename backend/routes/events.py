"""Events & Leistungen CMS endpoints."""
from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, timezone
import uuid

from core import db, verify_admin
from models import EventCreate, EventUpdate

router = APIRouter()


# ── Leistungen CMS ──────────────────────────────────────────────────────

LEISTUNGEN_DEFAULTS = {
    "hero": {"tagline": "Präzise. Effizient. Strategisch.", "title": "Unsere Leistungen für Ihre Zukunft", "description": "Wir entwickeln Konzepte für die Unternehmensgründung, Vermögensstrukturierung, Immobilien, Aufenthalts- und Finanzlösungen — genau auf Ihre Situation zugeschnitten."},
    "services": [
        {"id": "immobilien", "title": "Immobilien & Aufenthalt", "tagline": "Finden. Sichern. Leben.", "description": "Finden und sichern Sie Ihre Traumimmobilie und regeln Sie Ihren Aufenthaltsstatus unkompliziert.", "image": "", "points": ["Immobiliensuche & Due Diligence", "Aufenthaltsgenehmigung & Visa", "Katasterprüfung & Eigentumsübertragung", "Mietrendite-Optimierung"]},
        {"id": "gruendung", "title": "Unternehmensgründung & Strukturierung", "tagline": "Gründen. Strukturieren. Wachsen.", "description": "Wir gestalten Ihre internationale Unternehmensarchitektur für maximale Effizienz und Rechtssicherheit.", "image": "", "points": ["Firmengründung in Montenegro (9% KSt)", "Holding-Strukturen & Steueroptimierung", "Bankkonto-Eröffnung & KYC-Begleitung", "Geschäftsadresse & Virtual Office"]},
        {"id": "legal", "title": "Legal- & Finanzdienstleistungen", "tagline": "Prüfen. Absichern. Durchsetzen.", "description": "Führen Sie Ihr Vorhaben sicher durch die rechtlichen und finanziellen Anforderungen vor Ort.", "image": "", "points": ["Vertragsgestaltung & -prüfung", "Steuerberatung Montenegro & Serbien", "AML/KYC Compliance", "Streitbeilegung & Mediation"]},
        {"id": "investor", "title": "Investor Relations & Projektvermittlung", "tagline": "Verbinden. Vermitteln. Realisieren.", "description": "Wir verbinden Sie mit exklusiven Off-Market Investitionsmöglichkeiten und lokalen Partnern.", "image": "", "points": ["Off-Market Deal-Zugang", "Investoren-Matching & Co-Investments", "Projektentwicklung & Feasibility", "Exit-Strategien & Wiederverkauf"]}
    ],
    "legal_risks": {"title": "Juristische Stabilisierung", "description": "Das größte Risiko in Montenegro sind Immobilien, die zwar physisch existieren, aber formal nicht legalisiert, nicht abgenommen oder nicht nutzungsfähig sind.", "conclusion": "Ihr Vorteil: Aus einem juristischen Risiko wird ein rechtlich abgesichertes, werthaltiges Asset.", "items": [
        {"id": "baugenehmigung", "problem": "Fehlende Baugenehmigung & Legalisierung", "risk": "Drohendes Nutzungsverbot, Abrissverfügung oder massiver Wertabschlag bei nicht legalisierten Objekten.", "solution": "EuroAdria Corporate Solutions: Vollständige Legalisierungsprüfung und Nachholung aller behördlichen Genehmigungen durch unser Netzwerk."},
        {"id": "kataster", "problem": "Unklare Katastereinträge", "risk": "Der Verkäufer steht noch im Kataster, alte Grundschulden oder Dienstbarkeiten sind nicht gelöscht.", "solution": "Forensische Katasterrecherche bis 1945. Bereinigung aller Altlasten vor Vertragsunterzeichnung."},
        {"id": "erbchaos", "problem": "Erbchaos & Familienkonflikte", "risk": "Miteigentümer oder Dritte stellen den Deal nachträglich infrage und schaffen Erpressungspotenzial.", "solution": "Lückenlose Eigentümerkette. Notarielle Absicherung aller Parteien. Keine offenen Ansprüche."}
    ]},
    "compliance_risks": {"title": "Exit-Sicherheit & Compliance", "description": "Renditeobjekte erfordern mehr als nur ein schönes Gebäude. Sie erfordern klare Compliance und eine steuerlich verteidigbare Zahlungsstruktur.", "conclusion": "Kein politischer Blindflug — garantierte Wiederverkaufsfähigkeit Ihres Objekts.", "items": [
        {"id": "airbnb", "problem": "Illegale Kurzzeitvermietung (Airbnb)", "risk": "Viele Objekte sind nicht für touristische Nutzung zugelassen — das gefährdet Ihre gesamte Rendite.", "solution": "Prüfung & Beantragung der touristischen Nutzungsgenehmigung. Registrierung bei der Steuerbehörde."},
        {"id": "grauzonen", "problem": "Grauzonen-Zahlungen", "risk": "Niedriger Kaufpreis in der Urkunde, Rest bar — zerstört die Exit-Strategie und schafft ein Geldwäschethema.", "solution": "Transparente Kaufpreisstruktur. Vollständige Dokumentation für westliche Banken und Steuerbehörden."},
        {"id": "politisch", "problem": "Politische & regulatorische Risiken", "risk": "Plötzlicher Baustopp, Enteignung oder Nutzungsänderung durch die Gemeinde.", "solution": "Politisches Screening vor Ort. Frühwarnsystem durch unser Behörden-Netzwerk in Montenegro."}
    ]},
    "guarantee": {"title": "Die doppelte Garantie", "subtitle": "Sicherheit für Neukäufer, Sanierung für Bestandsbesitzer", "buyer": {"label": "VOR DEM KAUF", "title": "Für den Erstkäufer", "description": "Wir erstellen ein vollständiges Compliance-Dossier zur Immobilie, das alle Risikobereiche abdeckt: Legalisierung, Kataster, Standort-Screening und Exitfähigkeit.", "highlight": "Wir garantieren Klarheit und Compliance, bevor Sie den Kaufvertrag unterzeichnen. Keine versteckten Risiken, keine unkalkulierbaren Überraschungen."}, "owner": {"label": "NACH DEM KAUF", "title": "Für den Bestandsbesitzer", "description": "Wenn Ihr Investment bereits von juristischen Mängeln betroffen ist, übernehmen wir die Schadensbegrenzung und juristische Sanierung Ihres Objekts.", "highlight": "Wir bereinigen offene Ansprüche, führen fehlende Eintragungen durch und machen aus einem Risiko-Objekt ein bankfähiges, exitfähiges Asset."}},
    "cta": {"title": "Kontaktieren Sie uns für eine Erstberatung", "description": "Sie planen den Kauf oder sitzen bereits in der Risikozone? Nehmen Sie jetzt Kontakt mit unserer Kanzlei-gestützten Task Force auf.", "button_text": "Jetzt unverbindliche Erstberatung anfragen"}
}


@router.get("/leistungen-content")
async def get_leistungen_content():
    content = await db.leistungen_content.find_one({"key": "main"}, {"_id": 0})
    if not content:
        return LEISTUNGEN_DEFAULTS
    return {k: v for k, v in content.items() if k != "key"}


@router.put("/admin/leistungen-content")
async def update_leistungen_content(data: dict, admin: str = Depends(verify_admin)):
    data["key"] = "main"
    await db.leistungen_content.update_one({"key": "main"}, {"$set": data}, upsert=True)
    updated = await db.leistungen_content.find_one({"key": "main"}, {"_id": 0})
    return {k: v for k, v in updated.items() if k != "key"}


# ── Events ──────────────────────────────────────────────────────────────

@router.get("/events")
async def get_events():
    return await db.events.find({}, {"_id": 0}).sort("date", 1).to_list(100)


@router.get("/events/{event_id}")
async def get_event(event_id: str):
    event = await db.events.find_one({"id": event_id}, {"_id": 0})
    if not event:
        raise HTTPException(status_code=404, detail="Event nicht gefunden")
    return event


@router.post("/admin/events")
async def create_event(event: EventCreate, admin: str = Depends(verify_admin)):
    event_dict = event.model_dump()
    event_dict["id"] = str(uuid.uuid4())[:8]
    event_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.events.insert_one(event_dict)
    return await db.events.find_one({"id": event_dict["id"]}, {"_id": 0})


@router.put("/admin/events/{event_id}")
async def update_event(event_id: str, event: EventUpdate, admin: str = Depends(verify_admin)):
    update_data = {k: v for k, v in event.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="Keine Änderungen")
    result = await db.events.update_one({"id": event_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Event nicht gefunden")
    return await db.events.find_one({"id": event_id}, {"_id": 0})


@router.delete("/admin/events/{event_id}")
async def delete_event(event_id: str, admin: str = Depends(verify_admin)):
    result = await db.events.delete_one({"id": event_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Event nicht gefunden")
    return {"message": "Event gelöscht"}
