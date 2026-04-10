"""Investment Intelligence API: Locations, Infrastructure, Zones, ROI, Simulation, PDF, Dashboard."""
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from typing import Optional
from datetime import datetime, timezone
import uuid
import io
import os
import math

from core import db, verify_admin
from investment_models import (
    LocationCreate, LocationUpdate,
    InfrastructureProjectCreate, InfrastructureProjectUpdate,
    OpportunityZoneCreate, OpportunityZoneUpdate,
    ROICalculation, ROIResult,
    SimulationInput, SimulationResult, calculate_simulation,
    MarketCheckInput, MarketCheckResult, MarketCheckWarning,
    PredictiveScoreResult,
    INFRA_TYPE_WEIGHTS, INFRA_STATUS_MULTIPLIER,
    calculate_investment_score, calculate_roi,
    SEED_LOCATIONS, SEED_INFRASTRUCTURE, SEED_ZONES
)

router = APIRouter()


def calculate_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)
    a = math.sin(delta_lat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return R * c


async def calculate_infrastructure_boost(lat: float, lng: float) -> float:
    projects = await db.infrastructure_projects.find({}, {"_id": 0}).to_list(1000)
    boost = 0
    for project in projects:
        distance = calculate_distance_km(lat, lng, project["latitude"], project["longitude"])
        if distance <= project["impact_radius_km"]:
            impact_factor = 1 - (distance / project["impact_radius_km"])
            type_boost = INFRA_TYPE_WEIGHTS.get(project["type"], 5.0)
            status_mult = INFRA_STATUS_MULTIPLIER.get(project["status"], 0.5)
            boost += type_boost * impact_factor * status_mult
    return min(boost, 25)


# ── Locations ───────────────────────────────────────────────────────────

@router.get("/locations")
async def get_all_locations():
    locations = await db.locations.find({}, {"_id": 0}).to_list(1000)
    for loc in locations:
        infra_boost = await calculate_infrastructure_boost(loc["latitude"], loc["longitude"])
        adjusted_infra = min(loc["infrastructure_score"] + infra_boost, 100)
        loc["investment_score"] = calculate_investment_score(adjusted_infra, loc["tourism_growth"], loc["rental_yield"], loc["price_growth"])
        loc["infrastructure_boost"] = round(infra_boost, 1)
    locations.sort(key=lambda x: x["investment_score"], reverse=True)
    return locations


@router.get("/locations/{city}")
async def get_location(city: str):
    location = await db.locations.find_one({"city": {"$regex": f"^{city}$", "$options": "i"}}, {"_id": 0})
    if not location:
        raise HTTPException(status_code=404, detail="Location not found")
    infra_boost = await calculate_infrastructure_boost(location["latitude"], location["longitude"])
    adjusted_infra = min(location["infrastructure_score"] + infra_boost, 100)
    location["investment_score"] = calculate_investment_score(adjusted_infra, location["tourism_growth"], location["rental_yield"], location["price_growth"])
    location["infrastructure_boost"] = round(infra_boost, 1)
    related_articles = await db.articles.find(
        {"$or": [{"title": {"$regex": city, "$options": "i"}}, {"content": {"$regex": city, "$options": "i"}}, {"cluster": {"$regex": location["country"], "$options": "i"}}]},
        {"_id": 0, "id": 1, "title": 1, "slug": 1, "excerpt": 1, "image": 1}
    ).limit(5).to_list(5)
    location["related_articles"] = related_articles
    return location


@router.get("/locations/compare/{cities}")
async def compare_locations(cities: str):
    city_list = [c.strip() for c in cities.split(",")]
    comparisons = []
    for city in city_list:
        location = await db.locations.find_one({"city": {"$regex": f"^{city}$", "$options": "i"}}, {"_id": 0})
        if location:
            infra_boost = await calculate_infrastructure_boost(location["latitude"], location["longitude"])
            adjusted_infra = min(location["infrastructure_score"] + infra_boost, 100)
            location["investment_score"] = calculate_investment_score(adjusted_infra, location["tourism_growth"], location["rental_yield"], location["price_growth"])
            comparisons.append(location)
    return comparisons


@router.post("/admin/locations")
async def create_location(location: LocationCreate, admin: str = Depends(verify_admin)):
    existing = await db.locations.find_one({"city": location.city})
    if existing:
        raise HTTPException(status_code=400, detail="Location already exists")
    loc_dict = location.model_dump()
    loc_dict["id"] = str(uuid.uuid4())
    loc_dict["investment_score"] = calculate_investment_score(location.infrastructure_score, location.tourism_growth, location.rental_yield, location.price_growth)
    loc_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.locations.insert_one(loc_dict)
    loc_dict.pop("_id", None)
    return loc_dict


@router.put("/admin/locations/{city}")
async def update_location(city: str, update: LocationUpdate, admin: str = Depends(verify_admin)):
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = await db.locations.update_one({"city": {"$regex": f"^{city}$", "$options": "i"}}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Location not found")
    updated = await db.locations.find_one({"city": {"$regex": f"^{city}$", "$options": "i"}}, {"_id": 0})
    updated["investment_score"] = calculate_investment_score(updated["infrastructure_score"], updated["tourism_growth"], updated["rental_yield"], updated["price_growth"])
    return updated


@router.delete("/admin/locations/{city}")
async def delete_location(city: str, admin: str = Depends(verify_admin)):
    result = await db.locations.delete_one({"city": {"$regex": f"^{city}$", "$options": "i"}})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Location not found")
    return {"message": "Location deleted", "city": city}


# ── Infrastructure ──────────────────────────────────────────────────────

@router.get("/infrastructure")
async def get_all_infrastructure():
    projects = await db.infrastructure_projects.find({}, {"_id": 0}).to_list(1000)
    return projects


@router.get("/infrastructure/{project_id}")
async def get_infrastructure_project(project_id: str):
    project = await db.infrastructure_projects.find_one({"id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.post("/admin/infrastructure")
async def create_infrastructure(project: InfrastructureProjectCreate, admin: str = Depends(verify_admin)):
    proj_dict = project.model_dump()
    proj_dict["id"] = str(uuid.uuid4())
    proj_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.infrastructure_projects.insert_one(proj_dict)
    proj_dict.pop("_id", None)
    return proj_dict


@router.put("/admin/infrastructure/{project_id}")
async def update_infrastructure(project_id: str, update: InfrastructureProjectUpdate, admin: str = Depends(verify_admin)):
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    result = await db.infrastructure_projects.update_one({"id": project_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    updated = await db.infrastructure_projects.find_one({"id": project_id}, {"_id": 0})
    return updated


@router.delete("/admin/infrastructure/{project_id}")
async def delete_infrastructure(project_id: str, admin: str = Depends(verify_admin)):
    result = await db.infrastructure_projects.delete_one({"id": project_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"message": "Project deleted", "id": project_id}


# ── Opportunity Zones ───────────────────────────────────────────────────

@router.get("/zones")
async def get_all_zones():
    return await db.opportunity_zones.find({}, {"_id": 0}).to_list(1000)


@router.get("/zones/{zone_id}")
async def get_zone(zone_id: str):
    zone = await db.opportunity_zones.find_one({"id": zone_id}, {"_id": 0})
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    return zone


@router.post("/admin/zones")
async def create_zone(zone: OpportunityZoneCreate, admin: str = Depends(verify_admin)):
    zone_dict = zone.model_dump()
    zone_dict["id"] = str(uuid.uuid4())
    await db.opportunity_zones.insert_one(zone_dict)
    zone_dict.pop("_id", None)
    return zone_dict


@router.put("/admin/zones/{zone_id}")
async def update_zone(zone_id: str, update: OpportunityZoneUpdate, admin: str = Depends(verify_admin)):
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    result = await db.opportunity_zones.update_one({"id": zone_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Zone not found")
    updated = await db.opportunity_zones.find_one({"id": zone_id}, {"_id": 0})
    return updated


@router.delete("/admin/zones/{zone_id}")
async def delete_zone(zone_id: str, admin: str = Depends(verify_admin)):
    result = await db.opportunity_zones.delete_one({"id": zone_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Zone not found")
    return {"message": "Zone deleted", "id": zone_id}


# ── ROI Calculator ──────────────────────────────────────────────────────

@router.post("/calculator/roi", response_model=ROIResult)
async def calculate_property_roi(calc: ROICalculation):
    return calculate_roi(calc)


@router.post("/calculator/simulation", response_model=SimulationResult)
async def run_investment_simulation(inp: SimulationInput):
    return calculate_simulation(inp)


# ── Predictive Infrastructure Score ─────────────────────────────────────

@router.get("/locations/{city}/predictive-score")
async def get_predictive_score(city: str):
    location = await db.locations.find_one({"city": city}, {"_id": 0})
    if not location:
        raise HTTPException(status_code=404, detail=f"Standort '{city}' nicht gefunden")
    projects = await db.infrastructure_projects.find({}, {"_id": 0}).to_list(1000)
    current_boost = await calculate_infrastructure_boost(location["latitude"], location["longitude"])
    adjusted_infra = min(location["infrastructure_score"] + current_boost, 100)
    current_score = calculate_investment_score(adjusted_infra, location["tourism_growth"], location["rental_yield"], location["price_growth"])

    nearby = []
    for proj in projects:
        dist = calculate_distance_km(location["latitude"], location["longitude"], proj["latitude"], proj["longitude"])
        if dist <= proj["impact_radius_km"] * 1.5:
            nearby.append({"project_name": proj["project_name"], "type": proj["type"], "status": proj["status"], "distance_km": round(dist, 1), "impact_radius_km": proj["impact_radius_km"], "within_range": dist <= proj["impact_radius_km"], "type_weight": INFRA_TYPE_WEIGHTS.get(proj["type"], 5.0), "status_multiplier": INFRA_STATUS_MULTIPLIER.get(proj["status"], 0.5)})

    scenarios = []
    for proj in projects:
        if proj["status"] in ("planned", "construction"):
            dist = calculate_distance_km(location["latitude"], location["longitude"], proj["latitude"], proj["longitude"])
            if dist <= proj["impact_radius_km"]:
                impact_factor = 1 - (dist / proj["impact_radius_km"])
                type_w = INFRA_TYPE_WEIGHTS.get(proj["type"], 5.0)
                current_contribution = type_w * impact_factor * INFRA_STATUS_MULTIPLIER.get(proj["status"], 0.5)
                completed_contribution = type_w * impact_factor * 1.0
                delta = completed_contribution - current_contribution
                new_boost = current_boost + delta
                new_infra = min(location["infrastructure_score"] + new_boost, 100)
                new_score = calculate_investment_score(new_infra, location["tourism_growth"], location["rental_yield"], location["price_growth"])
                scenarios.append({"project_name": proj["project_name"], "current_status": proj["status"], "simulated_status": "built", "score_impact": round(new_score - current_score, 1), "predicted_score": round(new_score, 1), "distance_km": round(dist, 1)})

    total_boost_all = 0
    for proj in projects:
        dist = calculate_distance_km(location["latitude"], location["longitude"], proj["latitude"], proj["longitude"])
        if dist <= proj["impact_radius_km"]:
            impact_factor = 1 - (dist / proj["impact_radius_km"])
            type_w = INFRA_TYPE_WEIGHTS.get(proj["type"], 5.0)
            total_boost_all += type_w * impact_factor * 1.0

    max_infra = min(location["infrastructure_score"] + total_boost_all, 100)
    predicted_max = calculate_investment_score(max_infra, location["tourism_growth"], location["rental_yield"], location["price_growth"])

    return PredictiveScoreResult(city=city, current_score=round(current_score, 1), predicted_score=round(predicted_max, 1), score_delta=round(predicted_max - current_score, 1), infrastructure_boost=round(current_boost, 1), nearby_projects=sorted(nearby, key=lambda x: x["distance_km"]), scenarios=sorted(scenarios, key=lambda x: x["score_impact"], reverse=True))


# ── Market Data Validation ──────────────────────────────────────────────

@router.post("/v1/market-check", response_model=MarketCheckResult)
async def market_data_check(inp: MarketCheckInput):
    warnings = []
    market_avgs = {}
    location = None
    if inp.city:
        location = await db.locations.find_one({"city": inp.city}, {"_id": 0})
    if not location and inp.country:
        locations = await db.locations.find({"country": inp.country}, {"_id": 0}).to_list(1000)
        if locations:
            location = {"city": f"Durchschnitt {inp.country}", "price_per_m2": sum(l["price_per_m2"] for l in locations) / len(locations), "rental_yield": sum(l["rental_yield"] for l in locations) / len(locations), "price_growth": sum(l["price_growth"] for l in locations) / len(locations)}
    if not location:
        return MarketCheckResult(city=inp.city, market_data_available=False, warnings=[], market_averages={}, risk_level="unknown", summary="Keine Marktdaten für diesen Standort verfügbar.")

    market_avgs = {"price_per_m2": round(location.get("price_per_m2", 0), 2), "rental_yield": round(location.get("rental_yield", 0), 2), "price_growth": round(location.get("price_growth", 0), 2)}

    if inp.price_per_m2 and location.get("price_per_m2"):
        avg = location["price_per_m2"]
        dev = ((inp.price_per_m2 - avg) / avg) * 100
        severity = "critical" if abs(dev) > 30 else "warning" if abs(dev) > 15 else "info"
        direction = "über" if dev > 0 else "unter"
        warnings.append(MarketCheckWarning(field="price_per_m2", user_value=inp.price_per_m2, market_average=round(avg, 2), deviation_percent=round(dev, 1), severity=severity, message=f"Ihr Preis von {inp.price_per_m2:.0f} EUR/m² liegt {abs(dev):.0f}% {direction} dem Marktdurchschnitt von {avg:.0f} EUR/m²."))

    if inp.rental_yield and location.get("rental_yield"):
        avg = location["rental_yield"]
        dev = ((inp.rental_yield - avg) / avg) * 100
        severity = "critical" if abs(dev) > 30 else "warning" if abs(dev) > 15 else "info"
        direction = "über" if dev > 0 else "unter"
        warnings.append(MarketCheckWarning(field="rental_yield", user_value=inp.rental_yield, market_average=round(avg, 2), deviation_percent=round(dev, 1), severity=severity, message=f"Ihre Mietrendite von {inp.rental_yield:.1f}% liegt {abs(dev):.0f}% {direction} dem Marktdurchschnitt von {avg:.1f}%."))

    if inp.monthly_rent_per_m2 and inp.price_per_m2:
        implied_yield = (inp.monthly_rent_per_m2 * 12 / inp.price_per_m2) * 100
        avg_yield = location.get("rental_yield", 5.0)
        dev = ((implied_yield - avg_yield) / avg_yield) * 100
        severity = "critical" if abs(dev) > 30 else "warning" if abs(dev) > 15 else "info"
        market_avgs["implied_yield"] = round(implied_yield, 2)
        if abs(dev) > 15:
            warnings.append(MarketCheckWarning(field="implied_yield", user_value=round(implied_yield, 2), market_average=round(avg_yield, 2), deviation_percent=round(dev, 1), severity=severity, message=f"Ihre implizierte Rendite von {implied_yield:.1f}% weicht {abs(dev):.0f}% vom Marktdurchschnitt ab."))

    critical_count = sum(1 for w in warnings if w.severity == "critical")
    warning_count = sum(1 for w in warnings if w.severity == "warning")

    if critical_count > 0:
        risk_level = "high"
        summary = f"Achtung: {critical_count} kritische Abweichung(en) vom Marktdurchschnitt. Bitte Eingaben prüfen."
    elif warning_count > 0:
        risk_level = "medium"
        summary = f"{warning_count} Eingabe(n) weichen über 15% vom Markt ab. Empfehlung: Marktforschung vertiefen."
    else:
        risk_level = "low"
        summary = "Ihre Eingaben liegen im Rahmen der aktuellen Marktdaten."

    return MarketCheckResult(city=inp.city or location.get("city"), market_data_available=True, warnings=warnings, market_averages=market_avgs, risk_level=risk_level, summary=summary)


# ── PDF Exposé Generator ────────────────────────────────────────────────

@router.post("/calculator/expose-pdf")
async def generate_expose_pdf(inp: SimulationInput):
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.units import mm
    from reportlab.lib.colors import HexColor
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.enums import TA_RIGHT
    from reportlab.platypus.flowables import HRFlowable

    result = calculate_simulation(inp)
    buffer = io.BytesIO()

    ea_white = HexColor('#FFFFFF')
    ea_gold = HexColor('#C8A96A')
    ea_dark = HexColor('#04151F')
    ea_gray = HexColor('#888888')
    ea_light_bg = HexColor('#F8F9FA')
    ea_lighter_bg = HexColor('#FFFFFF')
    ea_border = HexColor('#E5E7EB')
    ea_text = HexColor('#333333')

    page_w, page_h = A4

    def page_template(canvas, doc):
        canvas.saveState()
        # White page background
        canvas.setFillColor(ea_white)
        canvas.rect(0, 0, page_w, page_h, fill=1, stroke=0)
        # Header bar - white with gold bottom border
        canvas.setFillColor(ea_white)
        canvas.rect(0, page_h - 28*mm, page_w, 28*mm, fill=1, stroke=0)
        canvas.setStrokeColor(ea_gold)
        canvas.setLineWidth(2)
        canvas.line(0, page_h - 28*mm, page_w, page_h - 28*mm)
        # Logo (download from web if not local)
        try:
            logo_path = '/app/frontend/public/euroadria-logo.png'
            if not os.path.exists(logo_path):
                logo_path = '/tmp/euroadria-logo.png'
                if not os.path.exists(logo_path):
                    import requests as _req
                    r = _req.get('https://euroadria.me/euroadria-logo.png', timeout=5)
                    if r.ok:
                        with open(logo_path, 'wb') as f:
                            f.write(r.content)
            if os.path.exists(logo_path):
                canvas.drawImage(logo_path, 15*mm, page_h - 24*mm, width=18*mm, height=18*mm, preserveAspectRatio=True, mask='auto')
        except Exception:
            pass
        canvas.setFont('Helvetica-Bold', 11)
        canvas.setFillColor(ea_dark)
        canvas.drawString(36*mm, page_h - 16*mm, "EUROADRIA CORPORATE SOLUTIONS")
        canvas.setFont('Helvetica', 7.5)
        canvas.setFillColor(ea_gold)
        canvas.drawString(36*mm, page_h - 21*mm, "Beratung & Angebotsplattform")
        # Footer bar - light gray
        canvas.setFillColor(ea_light_bg)
        canvas.rect(0, 0, page_w, 14*mm, fill=1, stroke=0)
        canvas.setStrokeColor(ea_border)
        canvas.setLineWidth(0.5)
        canvas.line(0, 14*mm, page_w, 14*mm)
        canvas.setFont('Helvetica', 6.5)
        canvas.setFillColor(ea_gray)
        canvas.drawString(15*mm, 8*mm, "EuroAdria Corporate Solutions | euroadria.me | office@euroadria.me")
        canvas.drawRightString(page_w - 15*mm, 8*mm, f"Seite {doc.page}")
        canvas.setFillColor(ea_gold)
        canvas.setFont('Helvetica', 5.5)
        canvas.drawCentredString(page_w / 2, 3.5*mm, "Vertraulich — Nur für den persönlichen Gebrauch bestimmt")
        canvas.restoreState()

    doc = SimpleDocTemplate(buffer, pagesize=A4, leftMargin=15*mm, rightMargin=15*mm, topMargin=34*mm, bottomMargin=20*mm)

    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle('EA_Title', parent=styles['Title'], fontSize=20, textColor=ea_dark, spaceAfter=2*mm, fontName='Helvetica-Bold'))
    styles.add(ParagraphStyle('EA_Subtitle', parent=styles['Normal'], fontSize=10, textColor=ea_gray, spaceAfter=6*mm))
    styles.add(ParagraphStyle('EA_Section', parent=styles['Heading2'], fontSize=12, textColor=ea_gold, spaceBefore=7*mm, spaceAfter=3*mm, fontName='Helvetica-Bold', borderWidth=0))
    styles.add(ParagraphStyle('EA_Body', parent=styles['Normal'], fontSize=9, textColor=ea_text, leading=13))
    styles.add(ParagraphStyle('EA_Small', parent=styles['Normal'], fontSize=7, textColor=ea_gray, leading=10))

    elements = []

    def fmt(val, suffix='EUR'):
        if suffix == 'EUR':
            return f"{val:,.0f} EUR".replace(',', '.')
        elif suffix == '%':
            return f"{val:.2f}%"
        return str(val)

    location_text = f"  |  Standort: {inp.location_name}" if inp.location_name else ""
    elements.append(Paragraph("INVESTMENT EXPOSÉ", styles['EA_Title']))
    elements.append(Paragraph(f"Personalisierte 10-Jahres-Prognose{location_text}  |  Erstellt am {datetime.now(timezone.utc).strftime('%d.%m.%Y')}", styles['EA_Subtitle']))
    elements.append(HRFlowable(width="100%", thickness=1, color=ea_gold, spaceAfter=5*mm))

    elements.append(Paragraph("ZUSAMMENFASSUNG", styles['EA_Section']))
    kpi_data = [
        ['Gesamtinvestition', 'Eigenkapital', 'Fremdkapital', 'IRR'],
        [fmt(result.total_investment), fmt(result.equity_invested), fmt(result.debt_amount), fmt(result.irr_percent, '%')],
        ['NPV', 'Eigenkapital-ROI', 'Gesamtgewinn', 'Break-Even'],
        [fmt(result.npv), fmt(result.equity_roi_percent, '%'), fmt(result.total_profit), f"Jahr {result.break_even_year}" if result.break_even_year else "–"]
    ]
    kpi_table = Table(kpi_data, colWidths=[42*mm]*4)
    kpi_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), ea_light_bg), ('BACKGROUND', (0, 2), (-1, 2), ea_light_bg),
        ('BACKGROUND', (0, 1), (-1, 1), ea_lighter_bg), ('BACKGROUND', (0, 3), (-1, 3), ea_lighter_bg),
        ('TEXTCOLOR', (0, 0), (-1, 0), ea_gold), ('TEXTCOLOR', (0, 2), (-1, 2), ea_gold),
        ('TEXTCOLOR', (0, 1), (-1, 1), ea_dark), ('TEXTCOLOR', (0, 3), (-1, 3), ea_dark),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica'), ('FONTNAME', (0, 2), (-1, 2), 'Helvetica'),
        ('FONTNAME', (0, 1), (-1, 1), 'Helvetica-Bold'), ('FONTNAME', (0, 3), (-1, 3), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 7), ('FONTSIZE', (0, 2), (-1, 2), 7),
        ('FONTSIZE', (0, 1), (-1, 1), 12), ('FONTSIZE', (0, 3), (-1, 3), 12),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'), ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 6), ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('GRID', (0, 0), (-1, -1), 0.5, ea_border), ('ROUNDEDCORNERS', [3, 3, 3, 3]),
    ]))
    elements.append(kpi_table)
    elements.append(Spacer(1, 4*mm))

    elements.append(Paragraph("EINGABEPARAMETER", styles['EA_Section']))
    param_data = [
        ['Parameter', 'Wert', 'Parameter', 'Wert'],
        ['Kaufpreis', fmt(inp.purchase_price), 'Mietsteigerung/Jahr', fmt(inp.rent_increase_percent, '%')],
        ['Renovierung', fmt(inp.renovation_costs), 'Wertsteigerung/Jahr', fmt(inp.appreciation_percent, '%')],
        ['Nebenkosten', fmt(inp.additional_costs_percent, '%'), 'Leerstandsrate', fmt(inp.vacancy_rate, '%')],
        ['Monatliche Miete', fmt(inp.monthly_rent), 'Betriebskosten', fmt(inp.running_costs_percent, '%')],
        ['Eigenkapital', fmt(inp.equity_percent, '%'), 'Hypothekenzins', fmt(inp.mortgage_rate, '%')],
        ['Haltedauer', f"{inp.holding_period} Jahre", 'Diskontierungszins', fmt(inp.discount_rate, '%')],
    ]
    param_table = Table(param_data, colWidths=[38*mm, 32*mm, 40*mm, 30*mm])
    param_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), ea_gold), ('TEXTCOLOR', (0, 0), (-1, 0), ea_white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'), ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('TEXTCOLOR', (0, 1), (-1, -1), ea_text),
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'), ('ALIGN', (3, 0), (3, -1), 'RIGHT'),
        ('TOPPADDING', (0, 0), (-1, -1), 4), ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('GRID', (0, 0), (-1, -1), 0.5, ea_border),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [ea_lighter_bg, ea_light_bg]),
    ]))
    elements.append(param_table)
    elements.append(Spacer(1, 4*mm))

    elements.append(Paragraph("10-JAHRES-CASHFLOW-PROGNOSE", styles['EA_Section']))
    cf_header = ['Jahr', 'Bruttomiete', 'Netto-Miete', 'Hypothek', 'Cashflow', 'Kum. CF', 'Immobilienwert']
    cf_rows = [cf_header]
    for y in result.yearly_data:
        cf_rows.append([str(y.year), fmt(y.gross_rent), fmt(y.net_rental_income), fmt(y.mortgage_payment), fmt(y.cashflow), fmt(y.cumulative_cashflow), fmt(y.property_value)])

    cf_table = Table(cf_rows, colWidths=[12*mm, 26*mm, 24*mm, 22*mm, 22*mm, 22*mm, 30*mm])
    cf_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), ea_gold), ('TEXTCOLOR', (0, 0), (-1, 0), ea_white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'), ('FONTSIZE', (0, 0), (-1, -1), 7.5),
        ('TEXTCOLOR', (0, 1), (-1, -1), ea_text),
        ('ALIGN', (0, 0), (-1, -1), 'RIGHT'), ('ALIGN', (0, 0), (0, -1), 'CENTER'),
        ('TOPPADDING', (0, 0), (-1, -1), 3), ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('GRID', (0, 0), (-1, -1), 0.5, ea_border),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [ea_lighter_bg, ea_light_bg]),
    ]))
    elements.append(cf_table)
    elements.append(Spacer(1, 6*mm))

    elements.append(HRFlowable(width="100%", thickness=0.5, color=ea_gold, spaceBefore=4*mm, spaceAfter=3*mm))
    elements.append(Paragraph("<b>WICHTIGER HINWEIS — KEINE ANLAGEBERATUNG</b>", ParagraphStyle('Disc_Title', parent=styles['Normal'], fontSize=8, textColor=ea_gold, spaceBefore=2*mm, spaceAfter=2*mm, fontName='Helvetica-Bold')))
    elements.append(Paragraph("Diese Simulation dient ausschließlich zu Informations- und Veranschaulichungszwecken und stellt keine Anlageberatung, Kaufempfehlung oder Renditegarantie dar. Alle dargestellten Zahlen, Prognosen und Ergebnisse basieren auf den vom Benutzer eingegebenen Annahmen und vereinfachten Modellen. <b>Tatsächliche Ergebnisse können erheblich abweichen.</b>", styles['EA_Small']))
    elements.append(Paragraph("Insbesondere können Faktoren wie Steuern, Finanzierungskonditionen, Währungsrisiken, politische Veränderungen, Marktvolatilität, Instandhaltungskosten und unvorhergesehene Ereignisse die tatsächliche Rendite wesentlich beeinflussen. Konsultieren Sie vor jeder Investitionsentscheidung einen qualifizierten und unabhängigen Finanzberater. Der Herausgeber übernimmt keine Haftung für Entscheidungen, die auf Grundlage dieser Berechnung getroffen werden.", styles['EA_Small']))

    doc.build(elements, onFirstPage=page_template, onLaterPages=page_template)
    pdf_bytes = buffer.getvalue()
    buffer.close()

    return Response(content=pdf_bytes, media_type="application/pdf", headers={"Content-Disposition": "attachment; filename=EuroAdria_Investment_Expose.pdf"})


# ── Dashboard Stats ─────────────────────────────────────────────────────

@router.get("/dashboard/stats")
async def get_dashboard_stats():
    locations = await db.locations.find({}, {"_id": 0}).to_list(1000)
    projects = await db.infrastructure_projects.find({}, {"_id": 0}).to_list(1000)
    zones = await db.opportunity_zones.find({}, {"_id": 0}).to_list(1000)

    for loc in locations:
        infra_boost = await calculate_infrastructure_boost(loc["latitude"], loc["longitude"])
        adjusted_infra = min(loc["infrastructure_score"] + infra_boost, 100)
        loc["investment_score"] = calculate_investment_score(adjusted_infra, loc["tourism_growth"], loc["rental_yield"], loc["price_growth"])

    by_score = sorted(locations, key=lambda x: x["investment_score"], reverse=True)
    by_yield = sorted(locations, key=lambda x: x["rental_yield"], reverse=True)
    by_growth = sorted(locations, key=lambda x: x["price_growth"], reverse=True)
    new_projects = [p for p in projects if p["status"] in ["construction", "planned"]]

    return {
        "total_locations": len(locations), "total_infrastructure": len(projects), "total_zones": len(zones),
        "top_investment": by_score[:5], "highest_yield": by_yield[:5], "strongest_growth": by_growth[:5],
        "new_infrastructure": new_projects[:5],
        "countries": {"Montenegro": len([l for l in locations if l["country"] == "Montenegro"]), "Serbien": len([l for l in locations if l["country"] == "Serbien"])}
    }


# ── Seed Investment Data ────────────────────────────────────────────────

@router.post("/admin/seed-investment-data")
async def seed_investment_data(admin: str = Depends(verify_admin)):
    loc_count = await db.locations.count_documents({})
    if loc_count == 0:
        for loc in SEED_LOCATIONS:
            loc_dict = loc.copy()
            loc_dict["id"] = str(uuid.uuid4())
            loc_dict["investment_score"] = calculate_investment_score(loc["infrastructure_score"], loc["tourism_growth"], loc["rental_yield"], loc["price_growth"])
            loc_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
            await db.locations.insert_one(loc_dict)

    infra_count = await db.infrastructure_projects.count_documents({})
    if infra_count == 0:
        for proj in SEED_INFRASTRUCTURE:
            proj_dict = proj.copy()
            proj_dict["id"] = str(uuid.uuid4())
            proj_dict["created_at"] = datetime.now(timezone.utc).isoformat()
            await db.infrastructure_projects.insert_one(proj_dict)

    zone_count = await db.opportunity_zones.count_documents({})
    if zone_count == 0:
        for zone in SEED_ZONES:
            zone_dict = zone.copy()
            zone_dict["id"] = str(uuid.uuid4())
            await db.opportunity_zones.insert_one(zone_dict)

    return {"message": "Investment data seeded successfully", "locations": len(SEED_LOCATIONS), "infrastructure": len(SEED_INFRASTRUCTURE), "zones": len(SEED_ZONES)}
