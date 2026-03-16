# =============================================
# INVESTMENT INTELLIGENCE MODELS & API
# =============================================

from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone


# =============================================
# LOCATION MODELS
# =============================================

class LocationBase(BaseModel):
    city: str
    country: str
    latitude: float
    longitude: float
    price_per_m2: float  # EUR
    rental_yield: float  # Percentage (e.g., 6.5 for 6.5%)
    tourism_growth: float  # Percentage annual growth
    population_growth: float  # Percentage
    price_growth: float  # Percentage annual
    infrastructure_score: float  # 0-100
    description: Optional[str] = None
    opportunities: Optional[List[str]] = []
    risks: Optional[List[str]] = []
    use_cases: List[str] = []  # logistics, residential, tourism, relocation
    time_horizon: str = "medium"  # short, medium, long


class LocationCreate(LocationBase):
    pass


class LocationUpdate(BaseModel):
    city: Optional[str] = None
    country: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    price_per_m2: Optional[float] = None
    rental_yield: Optional[float] = None
    tourism_growth: Optional[float] = None
    population_growth: Optional[float] = None
    price_growth: Optional[float] = None
    infrastructure_score: Optional[float] = None
    description: Optional[str] = None
    opportunities: Optional[List[str]] = None
    risks: Optional[List[str]] = None
    use_cases: Optional[List[str]] = None
    time_horizon: Optional[str] = None


class Location(LocationBase):
    id: str
    investment_score: float  # Calculated automatically
    updated_at: str


# =============================================
# INFRASTRUCTURE PROJECT MODELS
# =============================================

class InfrastructureProjectBase(BaseModel):
    project_name: str
    type: str  # road, rail, airport, port, clinic
    latitude: float
    longitude: float
    impact_radius_km: float
    status: str  # built, modernization, construction, planned
    description: Optional[str] = None
    completion_year: Optional[int] = None
    investment_eur: Optional[float] = None


class InfrastructureProjectCreate(InfrastructureProjectBase):
    pass


class InfrastructureProjectUpdate(BaseModel):
    project_name: Optional[str] = None
    type: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    impact_radius_km: Optional[float] = None
    status: Optional[str] = None
    description: Optional[str] = None
    completion_year: Optional[int] = None
    investment_eur: Optional[float] = None


class InfrastructureProject(InfrastructureProjectBase):
    id: str
    created_at: str


# =============================================
# OPPORTUNITY ZONE MODELS
# =============================================

class OpportunityZoneBase(BaseModel):
    name: str
    country: str
    description: str
    center_lat: float
    center_lng: float
    radius_km: float
    color: str  # Hex color
    investment_focus: List[str] = []  # tourism, logistics, tech, etc.
    expected_growth: Optional[float] = None


class OpportunityZoneCreate(OpportunityZoneBase):
    pass


class OpportunityZoneUpdate(BaseModel):
    name: Optional[str] = None
    country: Optional[str] = None
    description: Optional[str] = None
    center_lat: Optional[float] = None
    center_lng: Optional[float] = None
    radius_km: Optional[float] = None
    color: Optional[str] = None
    investment_focus: Optional[List[str]] = None
    expected_growth: Optional[float] = None


class OpportunityZone(OpportunityZoneBase):
    id: str


# =============================================
# ROI CALCULATOR MODEL
# =============================================

class ROICalculation(BaseModel):
    purchase_price: float
    renovation_costs: float = 0
    additional_costs: float = 0  # Nebenkosten
    monthly_rent: float
    vacancy_rate: float = 5  # Percentage
    running_costs_monthly: float = 0  # Verwaltung, Instandhaltung


class ROIResult(BaseModel):
    total_investment: float
    gross_rental_income: float
    net_rental_income: float
    annual_cashflow: float
    roi_percent: float
    net_yield_percent: float
    break_even_years: float


# =============================================
# INVESTMENT SCORE CALCULATION
# =============================================

def calculate_investment_score(
    infrastructure_score: float,
    tourism_growth: float,
    rental_yield: float,
    price_growth: float
) -> float:
    """
    Calculate investment score based on weighted formula:
    Score = 0.30 * infrastructure + 0.25 * tourism + 0.25 * yield + 0.20 * price_growth
    
    All inputs should be normalized to 0-100 scale
    """
    # Normalize values to 0-100 scale
    normalized_infrastructure = min(infrastructure_score, 100)
    normalized_tourism = min(tourism_growth * 5, 100)  # 20% growth = 100 score
    normalized_yield = min(rental_yield * 10, 100)  # 10% yield = 100 score
    normalized_price = min(price_growth * 5, 100)  # 20% growth = 100 score
    
    score = (
        0.30 * normalized_infrastructure +
        0.25 * normalized_tourism +
        0.25 * normalized_yield +
        0.20 * normalized_price
    )
    
    return round(min(score, 100), 1)


def calculate_roi(calc: ROICalculation) -> ROIResult:
    """Calculate ROI metrics for a property investment"""
    total_investment = calc.purchase_price + calc.renovation_costs + calc.additional_costs
    
    # Annual gross rental
    gross_rental_income = calc.monthly_rent * 12
    
    # Account for vacancy
    effective_rental = gross_rental_income * (1 - calc.vacancy_rate / 100)
    
    # Subtract running costs
    annual_running_costs = calc.running_costs_monthly * 12
    net_rental_income = effective_rental - annual_running_costs
    
    # Annual cashflow (same as net rental for now, could add mortgage later)
    annual_cashflow = net_rental_income
    
    # ROI = Annual Cashflow / Total Investment
    roi_percent = (annual_cashflow / total_investment) * 100 if total_investment > 0 else 0
    
    # Net Yield = Net Rental / Purchase Price
    net_yield_percent = (net_rental_income / calc.purchase_price) * 100 if calc.purchase_price > 0 else 0
    
    # Break-even years
    break_even_years = total_investment / annual_cashflow if annual_cashflow > 0 else float('inf')
    
    return ROIResult(
        total_investment=round(total_investment, 2),
        gross_rental_income=round(gross_rental_income, 2),
        net_rental_income=round(net_rental_income, 2),
        annual_cashflow=round(annual_cashflow, 2),
        roi_percent=round(roi_percent, 2),
        net_yield_percent=round(net_yield_percent, 2),
        break_even_years=round(break_even_years, 1)
    )


# =============================================
# SEED DATA
# =============================================

SEED_LOCATIONS = [
    # Montenegro
    {
        "city": "Podgorica",
        "country": "Montenegro",
        "latitude": 42.4304,
        "longitude": 19.2594,
        "price_per_m2": 1800,
        "rental_yield": 5.5,
        "tourism_growth": 8,
        "population_growth": 1.2,
        "price_growth": 12,
        "infrastructure_score": 85,
        "description": "Hauptstadt Montenegros mit starkem Wirtschaftswachstum und neuen Infrastrukturprojekten.",
        "opportunities": ["Hauptstadtbonus", "Flughafen-Erweiterung", "Business-Hub"],
        "risks": ["Begrenzte Küstennähe", "Sommer-Hitze"],
        "use_cases": ["residential", "logistics", "relocation"],
        "time_horizon": "short"
    },
    {
        "city": "Budva",
        "country": "Montenegro",
        "latitude": 42.2914,
        "longitude": 18.8403,
        "price_per_m2": 3500,
        "rental_yield": 7.5,
        "tourism_growth": 15,
        "population_growth": 2.5,
        "price_growth": 10,
        "infrastructure_score": 75,
        "description": "Tourismus-Hotspot an der Adriaküste mit höchsten Mietrenditen.",
        "opportunities": ["Airbnb-Potential", "Strandlage", "Nachtleben"],
        "risks": ["Hohe Saisonalität", "Überfüllung im Sommer"],
        "use_cases": ["tourism", "residential"],
        "time_horizon": "short"
    },
    {
        "city": "Bar",
        "country": "Montenegro",
        "latitude": 42.0903,
        "longitude": 19.1003,
        "price_per_m2": 1500,
        "rental_yield": 6.0,
        "tourism_growth": 12,
        "population_growth": 1.8,
        "price_growth": 15,
        "infrastructure_score": 88,
        "description": "Wichtigster Hafen Montenegros mit exzellenter Logistik-Infrastruktur.",
        "opportunities": ["Hafen-Erweiterung", "Autobahn-Anbindung", "Logistik-Hub"],
        "risks": ["Industriecharakter"],
        "use_cases": ["logistics", "residential", "relocation"],
        "time_horizon": "medium"
    },
    {
        "city": "Tivat",
        "country": "Montenegro",
        "latitude": 42.4367,
        "longitude": 18.6969,
        "price_per_m2": 4000,
        "rental_yield": 6.5,
        "tourism_growth": 18,
        "population_growth": 3.0,
        "price_growth": 14,
        "infrastructure_score": 82,
        "description": "Luxus-Destination mit Porto Montenegro und internationalem Flughafen.",
        "opportunities": ["Premium-Segment", "Yacht-Tourismus", "Flughafen"],
        "risks": ["Hohe Einstiegspreise"],
        "use_cases": ["tourism", "residential"],
        "time_horizon": "short"
    },
    {
        "city": "Kotor",
        "country": "Montenegro",
        "latitude": 42.4247,
        "longitude": 18.7712,
        "price_per_m2": 3200,
        "rental_yield": 7.0,
        "tourism_growth": 14,
        "population_growth": 1.5,
        "price_growth": 8,
        "infrastructure_score": 70,
        "description": "UNESCO-Weltkulturerbe mit einzigartigem historischem Charme.",
        "opportunities": ["UNESCO-Status", "Kreuzfahrt-Tourismus", "Altstadt"],
        "risks": ["Begrenzte Neubau-Möglichkeiten", "Hohe Preise"],
        "use_cases": ["tourism", "residential"],
        "time_horizon": "medium"
    },
    {
        "city": "Ulcinj",
        "country": "Montenegro",
        "latitude": 41.9297,
        "longitude": 19.2086,
        "price_per_m2": 1200,
        "rental_yield": 5.0,
        "tourism_growth": 20,
        "population_growth": 1.0,
        "price_growth": 18,
        "infrastructure_score": 65,
        "description": "Aufstrebende Küstenstadt mit großem Wertsteigerungspotenzial.",
        "opportunities": ["Niedriger Einstiegspreis", "Längste Strände", "Ada Bojana"],
        "risks": ["Infrastruktur-Rückstand", "Albanische Grenze"],
        "use_cases": ["tourism", "residential"],
        "time_horizon": "long"
    },
    {
        "city": "Nikšić",
        "country": "Montenegro",
        "latitude": 42.7731,
        "longitude": 18.9444,
        "price_per_m2": 800,
        "rental_yield": 4.5,
        "tourism_growth": 5,
        "population_growth": -0.5,
        "price_growth": 8,
        "infrastructure_score": 72,
        "description": "Zweitgrößte Stadt mit Industriebasis und niedrigen Preisen.",
        "opportunities": ["Sehr günstig", "Universität", "Industrie"],
        "risks": ["Bevölkerungsrückgang", "Wenig Tourismus"],
        "use_cases": ["residential", "logistics"],
        "time_horizon": "long"
    },
    {
        "city": "Bijelo Polje",
        "country": "Montenegro",
        "latitude": 43.0367,
        "longitude": 19.7489,
        "price_per_m2": 600,
        "rental_yield": 4.0,
        "tourism_growth": 8,
        "population_growth": -0.3,
        "price_growth": 10,
        "infrastructure_score": 68,
        "description": "Nördliche Stadt mit Potenzial durch neue Autobahnanbindung.",
        "opportunities": ["Autobahnanbindung", "Ski-Nähe", "Niedrige Preise"],
        "risks": ["Abgelegene Lage", "Wirtschaftsschwäche"],
        "use_cases": ["residential", "logistics"],
        "time_horizon": "long"
    },
    # Serbien
    {
        "city": "Belgrad",
        "country": "Serbien",
        "latitude": 44.7866,
        "longitude": 20.4489,
        "price_per_m2": 2800,
        "rental_yield": 5.5,
        "tourism_growth": 12,
        "population_growth": 0.5,
        "price_growth": 10,
        "infrastructure_score": 90,
        "description": "Hauptstadt und wirtschaftliches Zentrum Serbiens mit internationalem Flair.",
        "opportunities": ["Hauptstadt", "Waterfront-Projekt", "Tech-Hub"],
        "risks": ["Höhere Preise", "Konkurrenz"],
        "use_cases": ["residential", "logistics", "relocation"],
        "time_horizon": "short"
    },
    {
        "city": "Novi Sad",
        "country": "Serbien",
        "latitude": 45.2671,
        "longitude": 19.8335,
        "price_per_m2": 2200,
        "rental_yield": 5.8,
        "tourism_growth": 15,
        "population_growth": 1.2,
        "price_growth": 12,
        "infrastructure_score": 85,
        "description": "Kulturhauptstadt Europas 2022 mit starkem Wachstum im IT-Sektor.",
        "opportunities": ["IT-Sektor", "Kulturhauptstadt", "EXIT Festival"],
        "risks": ["Wachsende Preise"],
        "use_cases": ["residential", "relocation", "tourism"],
        "time_horizon": "short"
    },
    {
        "city": "Niš",
        "country": "Serbien",
        "latitude": 43.3209,
        "longitude": 21.8958,
        "price_per_m2": 1100,
        "rental_yield": 5.2,
        "tourism_growth": 8,
        "population_growth": 0.3,
        "price_growth": 9,
        "infrastructure_score": 78,
        "description": "Drittgrößte Stadt mit strategischer Lage an der Ost-West-Achse.",
        "opportunities": ["Günstige Preise", "Universität", "Logistik-Koridor"],
        "risks": ["Wirtschaftliche Herausforderungen"],
        "use_cases": ["residential", "logistics"],
        "time_horizon": "medium"
    },
    {
        "city": "Subotica",
        "country": "Serbien",
        "latitude": 46.1003,
        "longitude": 19.6656,
        "price_per_m2": 1300,
        "rental_yield": 5.0,
        "tourism_growth": 6,
        "population_growth": -0.2,
        "price_growth": 7,
        "infrastructure_score": 75,
        "description": "Grenzstadt zu Ungarn mit Art-Nouveau-Architektur.",
        "opportunities": ["EU-Grenznähe", "Architektur", "Palić-See"],
        "risks": ["Bevölkerungsrückgang", "Periphere Lage"],
        "use_cases": ["residential", "tourism"],
        "time_horizon": "medium"
    },
    {
        "city": "Kragujevac",
        "country": "Serbien",
        "latitude": 44.0128,
        "longitude": 20.9114,
        "price_per_m2": 950,
        "rental_yield": 4.8,
        "tourism_growth": 5,
        "population_growth": 0.1,
        "price_growth": 8,
        "infrastructure_score": 73,
        "description": "Industriestadt mit FIAT-Werk und wachsendem Technologiesektor.",
        "opportunities": ["Industrie", "Universität", "Günstige Preise"],
        "risks": ["Industrieabhängigkeit"],
        "use_cases": ["residential", "logistics"],
        "time_horizon": "medium"
    },
    {
        "city": "Čačak",
        "country": "Serbien",
        "latitude": 43.8914,
        "longitude": 20.3492,
        "price_per_m2": 850,
        "rental_yield": 4.5,
        "tourism_growth": 4,
        "population_growth": -0.1,
        "price_growth": 6,
        "infrastructure_score": 70,
        "description": "Mittelgroße Stadt mit guter Autobahnanbindung nach Belgrad.",
        "opportunities": ["Autobahnanbindung", "Günstig", "Landwirtschaft"],
        "risks": ["Wenig Wachstum"],
        "use_cases": ["residential"],
        "time_horizon": "long"
    },
    {
        "city": "Zlatibor",
        "country": "Serbien",
        "latitude": 43.7297,
        "longitude": 19.7031,
        "price_per_m2": 1800,
        "rental_yield": 6.5,
        "tourism_growth": 18,
        "population_growth": 2.0,
        "price_growth": 15,
        "infrastructure_score": 72,
        "description": "Premium-Bergresort mit ganzjährigem Tourismus und Ski-Infrastruktur.",
        "opportunities": ["Ski-Tourismus", "Wellness", "Ganzjährig"],
        "risks": ["Saisonalität", "Wetterabhängigkeit"],
        "use_cases": ["tourism", "residential"],
        "time_horizon": "short"
    }
]

SEED_INFRASTRUCTURE = [
    # Montenegro
    {
        "project_name": "Autobahn Bar-Boljare (Smokovac-Mateševo)",
        "type": "road",
        "latitude": 42.65,
        "longitude": 19.35,
        "impact_radius_km": 30,
        "status": "construction",
        "description": "Wichtigste Autobahnverbindung Montenegros von der Küste nach Serbien.",
        "completion_year": 2025,
        "investment_eur": 809000000
    },
    {
        "project_name": "Flughafen Podgorica Erweiterung",
        "type": "airport",
        "latitude": 42.3594,
        "longitude": 19.2519,
        "impact_radius_km": 25,
        "status": "modernization",
        "description": "Kapazitätserweiterung auf 2 Millionen Passagiere pro Jahr.",
        "completion_year": 2026,
        "investment_eur": 50000000
    },
    {
        "project_name": "Flughafen Tivat Terminal",
        "type": "airport",
        "latitude": 42.4047,
        "longitude": 18.7233,
        "impact_radius_km": 20,
        "status": "built",
        "description": "Modernisierter internationaler Terminal für Küstentourismus.",
        "completion_year": 2023,
        "investment_eur": 35000000
    },
    {
        "project_name": "Hafen Bar Modernisierung",
        "type": "port",
        "latitude": 42.0903,
        "longitude": 19.1003,
        "impact_radius_km": 15,
        "status": "modernization",
        "description": "Größter Adriahafen mit Container-Terminal-Erweiterung.",
        "completion_year": 2027,
        "investment_eur": 120000000
    },
    {
        "project_name": "Klinisches Zentrum Podgorica",
        "type": "clinic",
        "latitude": 42.4411,
        "longitude": 19.2636,
        "impact_radius_km": 40,
        "status": "built",
        "description": "Hauptkrankenhaus Montenegros mit modernster Ausstattung.",
        "completion_year": 2020,
        "investment_eur": 80000000
    },
    {
        "project_name": "Bahnstrecke Podgorica-Nikšić Modernisierung",
        "type": "rail",
        "latitude": 42.6,
        "longitude": 19.0,
        "impact_radius_km": 20,
        "status": "planned",
        "description": "Elektrifizierung und Modernisierung der Inlandstrecke.",
        "completion_year": 2030,
        "investment_eur": 200000000
    },
    # Serbien
    {
        "project_name": "Belgrade Waterfront",
        "type": "road",
        "latitude": 44.8125,
        "longitude": 20.4489,
        "impact_radius_km": 10,
        "status": "construction",
        "description": "Größtes Stadtentwicklungsprojekt Südosteuropas.",
        "completion_year": 2028,
        "investment_eur": 3500000000
    },
    {
        "project_name": "Flughafen Belgrad Nikola Tesla",
        "type": "airport",
        "latitude": 44.8184,
        "longitude": 20.3091,
        "impact_radius_km": 35,
        "status": "modernization",
        "description": "Hub-Flughafen mit neuem Terminal und erhöhter Kapazität.",
        "completion_year": 2025,
        "investment_eur": 732000000
    },
    {
        "project_name": "Schnellstraße Belgrad-Sarajevo",
        "type": "road",
        "latitude": 44.2,
        "longitude": 19.8,
        "impact_radius_km": 40,
        "status": "construction",
        "description": "Wichtige regionale Verbindung nach Bosnien.",
        "completion_year": 2027,
        "investment_eur": 600000000
    },
    {
        "project_name": "Hochgeschwindigkeitszug Belgrad-Budapest",
        "type": "rail",
        "latitude": 45.0,
        "longitude": 20.0,
        "impact_radius_km": 50,
        "status": "construction",
        "description": "Erste Hochgeschwindigkeitsstrecke der Region.",
        "completion_year": 2026,
        "investment_eur": 2100000000
    }
]

SEED_ZONES = [
    # Montenegro
    {
        "name": "Boka Premium",
        "country": "Montenegro",
        "description": "Premium-Investitionszone um die Bucht von Kotor mit Fokus auf Luxus-Tourismus.",
        "center_lat": 42.43,
        "center_lng": 18.73,
        "radius_km": 15,
        "color": "#c8a96a",
        "investment_focus": ["luxury", "tourism", "yachting"],
        "expected_growth": 12
    },
    {
        "name": "Budva Core",
        "country": "Montenegro",
        "description": "Tourismus-Kernzone mit höchster Airbnb-Dichte und Mietrenditen.",
        "center_lat": 42.29,
        "center_lng": 18.84,
        "radius_km": 8,
        "color": "#ef8354",
        "investment_focus": ["tourism", "short-term-rental"],
        "expected_growth": 15
    },
    {
        "name": "Bar System",
        "country": "Montenegro",
        "description": "Logistik- und Industriezone rund um den Hafen Bar.",
        "center_lat": 42.09,
        "center_lng": 19.10,
        "radius_km": 12,
        "color": "#4ea8de",
        "investment_focus": ["logistics", "industrial", "port"],
        "expected_growth": 18
    },
    {
        "name": "Ulcinj South Opportunity",
        "country": "Montenegro",
        "description": "Aufstrebende Zone mit dem höchsten Wertsteigerungspotenzial.",
        "center_lat": 41.93,
        "center_lng": 19.21,
        "radius_km": 10,
        "color": "#5ec576",
        "investment_focus": ["tourism", "beach", "development"],
        "expected_growth": 22
    },
    {
        "name": "Northern Growth Belt",
        "country": "Montenegro",
        "description": "Wachstumszone entlang der neuen Autobahn im Norden.",
        "center_lat": 42.85,
        "center_lng": 19.5,
        "radius_km": 25,
        "color": "#f4d35e",
        "investment_focus": ["logistics", "residential", "agriculture"],
        "expected_growth": 14
    },
    # Serbien
    {
        "name": "Belgrade Business Core",
        "country": "Serbien",
        "description": "Geschäftszentrum mit Waterfront-Projekt und Premium-Immobilien.",
        "center_lat": 44.82,
        "center_lng": 20.45,
        "radius_km": 8,
        "color": "#c8a96a",
        "investment_focus": ["business", "residential", "commercial"],
        "expected_growth": 10
    },
    {
        "name": "Novi Sad Tech Corridor",
        "country": "Serbien",
        "description": "IT- und Technologie-Hub mit starkem Wachstum und junger Bevölkerung.",
        "center_lat": 45.27,
        "center_lng": 19.83,
        "radius_km": 10,
        "color": "#4ea8de",
        "investment_focus": ["tech", "residential", "education"],
        "expected_growth": 15
    },
    {
        "name": "Serbia Logistics Corridor",
        "country": "Serbien",
        "description": "Logistik-Korridor entlang der Ost-West-Achse durch Serbien.",
        "center_lat": 43.8,
        "center_lng": 20.8,
        "radius_km": 40,
        "color": "#5ec576",
        "investment_focus": ["logistics", "industrial", "warehouse"],
        "expected_growth": 12
    }
]
