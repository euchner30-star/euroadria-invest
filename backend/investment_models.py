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
    normalized_infrastructure = min(infrastructure_score, 100)
    normalized_tourism = min(tourism_growth * 5, 100)
    normalized_yield = min(rental_yield * 10, 100)
    normalized_price = min(price_growth * 5, 100)
    
    score = (
        0.30 * normalized_infrastructure +
        0.25 * normalized_tourism +
        0.25 * normalized_yield +
        0.20 * normalized_price
    )
    
    return round(min(score, 100), 1)


# =============================================
# 1. DYNAMIC SIMULATION (IRR & CASHFLOW-PROGNOSE)
# =============================================

class SimulationInput(BaseModel):
    """10-Jahres Investment-Simulation mit IRR"""
    purchase_price: float = Field(..., gt=0, description="Kaufpreis in EUR")
    renovation_costs: float = Field(0, ge=0, description="Renovierungskosten in EUR")
    additional_costs_percent: float = Field(5.0, ge=0, le=20, description="Nebenkosten in % des Kaufpreises")
    monthly_rent: float = Field(..., gt=0, description="Monatliche Kaltmiete in EUR")
    vacancy_rate: float = Field(5.0, ge=0, le=50, description="Leerstandsrate in %")
    running_costs_percent: float = Field(15.0, ge=0, le=50, description="Betriebskosten in % der Miete")
    rent_increase_percent: float = Field(2.0, ge=-5, le=15, description="Jährliche Mietsteigerung in %")
    appreciation_percent: float = Field(3.0, ge=-10, le=30, description="Jährliche Wertsteigerung in %")
    discount_rate: float = Field(4.0, ge=0, le=20, description="Diskontierungszins / Opportunitätskosten in %")
    holding_period: int = Field(10, ge=1, le=30, description="Haltedauer in Jahren")
    equity_percent: float = Field(100.0, ge=10, le=100, description="Eigenkapitalanteil in %")
    mortgage_rate: float = Field(3.5, ge=0, le=15, description="Hypothekenzins in % (falls finanziert)")


class YearlyProjection(BaseModel):
    """Jährliche Projektion"""
    year: int
    gross_rent: float
    vacancy_loss: float
    running_costs: float
    net_rental_income: float
    mortgage_payment: float
    cashflow: float
    cumulative_cashflow: float
    property_value: float
    equity_value: float
    total_return: float


class SimulationResult(BaseModel):
    """Ergebnis der 10-Jahres-Simulation"""
    # Zusammenfassung
    total_investment: float
    equity_invested: float
    debt_amount: float
    irr_percent: float
    equity_roi_percent: float
    npv: float
    total_profit: float
    total_cashflow: float
    final_property_value: float
    value_appreciation: float
    # Jährliche Daten für Recharts
    yearly_data: List[YearlyProjection]
    # Kennzahlen
    average_annual_cashflow: float
    cashflow_yield_percent: float
    total_return_percent: float
    break_even_year: Optional[int]


def calculate_simulation(inp: SimulationInput) -> SimulationResult:
    """
    Berechnet eine vollständige 10-Jahres-Investment-Simulation.
    
    Mathematische Grundlagen:
    - Zinseszins: V(t) = V(0) * (1 + g)^t
    - NPV: Σ CF(t) / (1 + r)^t für t = 0..n
    - IRR: Diskontrate r bei der NPV = 0
    - Eigenkapital-ROI: (Gesamtgewinn / Eigenkapital) * 100
    """
    import numpy_financial as npf
    
    # Gesamtinvestition
    additional_costs = inp.purchase_price * (inp.additional_costs_percent / 100)
    total_investment = inp.purchase_price + inp.renovation_costs + additional_costs
    
    # Finanzierungsstruktur
    equity = total_investment * (inp.equity_percent / 100)
    debt = total_investment - equity
    
    # Jährliche Hypothekenzahlung (Annuität, Volltilgung über Haltedauer)
    if debt > 0 and inp.mortgage_rate > 0:
        monthly_rate = inp.mortgage_rate / 100 / 12
        n_months = inp.holding_period * 12
        if monthly_rate > 0:
            monthly_payment = debt * (monthly_rate * (1 + monthly_rate)**n_months) / ((1 + monthly_rate)**n_months - 1)
        else:
            monthly_payment = debt / n_months
        annual_mortgage = monthly_payment * 12
    else:
        annual_mortgage = debt / inp.holding_period if debt > 0 else 0
    
    # Cashflow-Reihe für IRR (Jahr 0 = Investition)
    cashflows_for_irr = [-equity]  # Eigenkapitaleinsatz als negativer Cashflow
    
    yearly_data = []
    cumulative_cf = 0
    break_even_year = None
    
    for year in range(1, inp.holding_period + 1):
        # Mietsteigerung mit Zinseszins
        gross_rent = inp.monthly_rent * 12 * (1 + inp.rent_increase_percent / 100) ** (year - 1)
        
        # Leerstand
        vacancy_loss = gross_rent * (inp.vacancy_rate / 100)
        effective_rent = gross_rent - vacancy_loss
        
        # Betriebskosten (% der Bruttomiete)
        running_costs = gross_rent * (inp.running_costs_percent / 100)
        
        # Netto-Mieteinnahmen
        net_rental = effective_rent - running_costs
        
        # Cashflow nach Hypothek
        cashflow = net_rental - annual_mortgage
        cumulative_cf += cashflow
        
        # Immobilienwert mit Wertsteigerung
        property_value = inp.purchase_price * (1 + inp.appreciation_percent / 100) ** year
        
        # Restschuld (linear vereinfacht)
        remaining_debt = max(0, debt * (1 - year / inp.holding_period))
        
        # Eigenkapitalwert = Immobilienwert - Restschuld
        equity_value = property_value - remaining_debt
        
        # Gesamtrendite = Kumulierter Cashflow + Eigenkapitalzuwachs
        total_return = cumulative_cf + (equity_value - equity)
        
        # Break-Even prüfen
        if break_even_year is None and cumulative_cf >= 0:
            break_even_year = year
        
        # Für IRR: Letztes Jahr enthält auch den Verkaufserlös
        if year == inp.holding_period:
            sale_proceeds = property_value - remaining_debt
            cashflows_for_irr.append(cashflow + sale_proceeds)
        else:
            cashflows_for_irr.append(cashflow)
        
        yearly_data.append(YearlyProjection(
            year=year,
            gross_rent=round(gross_rent, 2),
            vacancy_loss=round(vacancy_loss, 2),
            running_costs=round(running_costs, 2),
            net_rental_income=round(net_rental, 2),
            mortgage_payment=round(annual_mortgage, 2),
            cashflow=round(cashflow, 2),
            cumulative_cashflow=round(cumulative_cf, 2),
            property_value=round(property_value, 2),
            equity_value=round(equity_value, 2),
            total_return=round(total_return, 2)
        ))
    
    # IRR berechnen (numpy_financial)
    try:
        irr = npf.irr(cashflows_for_irr) * 100
        if irr is None or irr != irr:  # NaN check
            irr = 0.0
    except Exception:
        irr = 0.0
    
    # NPV berechnen
    discount_rate = inp.discount_rate / 100
    npv = sum(cf / (1 + discount_rate)**t for t, cf in enumerate(cashflows_for_irr))
    
    # Gesamtkennzahlen
    final_value = yearly_data[-1].property_value
    total_cashflow = sum(y.cashflow for y in yearly_data)
    value_gain = final_value - inp.purchase_price
    total_profit = total_cashflow + value_gain
    equity_roi = (total_profit / equity) * 100 if equity > 0 else 0
    avg_cashflow = total_cashflow / inp.holding_period
    cashflow_yield = (avg_cashflow / total_investment) * 100
    total_return_pct = (total_profit / equity) * 100 if equity > 0 else 0
    
    return SimulationResult(
        total_investment=round(total_investment, 2),
        equity_invested=round(equity, 2),
        debt_amount=round(debt, 2),
        irr_percent=round(irr, 2),
        equity_roi_percent=round(equity_roi, 2),
        npv=round(npv, 2),
        total_profit=round(total_profit, 2),
        total_cashflow=round(total_cashflow, 2),
        final_property_value=round(final_value, 2),
        value_appreciation=round(value_gain, 2),
        yearly_data=yearly_data,
        average_annual_cashflow=round(avg_cashflow, 2),
        cashflow_yield_percent=round(cashflow_yield, 2),
        total_return_percent=round(total_return_pct, 2),
        break_even_year=break_even_year
    )


# =============================================
# 2. PREDICTIVE INFRASTRUCTURE SCORE
# =============================================

# Gewichtungen nach Spezifikation
INFRA_TYPE_WEIGHTS = {
    "airport": 15.0,   # Flughafen +15%
    "road": 10.0,      # Autobahn +10%
    "rail": 8.0,       # Bahn +8%
    "port": 10.0,      # Hafen +10%
    "clinic": 8.0      # Klinik +8%
}

INFRA_STATUS_MULTIPLIER = {
    "built": 1.0,        # Fertiggestellt: voller Effekt
    "modernization": 0.8,
    "construction": 0.6, # Im Bau: 60% des Effekts
    "planned": 0.2       # Geplant: 20% des Effekts
}


class PredictiveScoreResult(BaseModel):
    """Ergebnis der prädiktiven Score-Analyse"""
    city: str
    current_score: float
    predicted_score: float
    score_delta: float
    infrastructure_boost: float
    nearby_projects: List[dict]
    scenarios: List[dict]


class ScenarioProjection(BaseModel):
    """Was-wäre-wenn Szenario"""
    project_name: str
    current_status: str
    simulated_status: str
    score_impact: float


# =============================================
# 3. MARKET-DATA-VALIDATION LAYER
# =============================================

class MarketCheckInput(BaseModel):
    """Eingabe für Marktdaten-Validierung"""
    city: Optional[str] = None
    country: Optional[str] = "Montenegro"
    price_per_m2: Optional[float] = Field(None, ge=0, description="Kaufpreis pro m² in EUR")
    monthly_rent_per_m2: Optional[float] = Field(None, ge=0, description="Monatsmiete pro m² in EUR")
    rental_yield: Optional[float] = Field(None, ge=0, le=50, description="Erwartete Mietrendite in %")
    purchase_price: Optional[float] = Field(None, ge=0, description="Gesamtkaufpreis in EUR")
    property_size_m2: Optional[float] = Field(None, ge=0, description="Wohnfläche in m²")


class MarketCheckWarning(BaseModel):
    """Einzelne Warnung"""
    field: str
    user_value: float
    market_average: float
    deviation_percent: float
    severity: str  # "info", "warning", "critical"
    message: str


class MarketCheckResult(BaseModel):
    """Ergebnis der Marktdaten-Prüfung"""
    city: Optional[str]
    market_data_available: bool
    warnings: List[MarketCheckWarning]
    market_averages: dict
    risk_level: str  # "low", "medium", "high"
    summary: str


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
    net_yield_percent = (net_rental_income / total_investment) * 100 if total_investment > 0 else 0
    
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
    },
    # Neue EuroAdria Portfolio-Standorte
    {
        "city": "Sveti Stefan",
        "country": "Montenegro",
        "latitude": 42.2567,
        "longitude": 18.8931,
        "price_per_m2": 8000,
        "rental_yield": 5.5,
        "tourism_growth": 12,
        "population_growth": 1.0,
        "price_growth": 8,
        "infrastructure_score": 70,
        "description": "Ikonische Halbinsel für Ultra-High-Net-Worth-Klientel. Absolute Privatsphäre und Exklusivität mit Aman Resort.",
        "opportunities": ["Ultra-Premium-Segment", "Absolute Privatsphäre", "Aman Resort", "High-End-Villen"],
        "risks": ["Sehr hohe Einstiegspreise", "Limitiertes Angebot"],
        "use_cases": ["tourism", "residential"],
        "time_horizon": "medium"
    },
    {
        "city": "Pržno",
        "country": "Montenegro",
        "latitude": 42.2633,
        "longitude": 18.8856,
        "price_per_m2": 5500,
        "rental_yield": 6.5,
        "tourism_growth": 14,
        "population_growth": 1.5,
        "price_growth": 12,
        "infrastructure_score": 72,
        "description": "Exklusiver Nachbarort von Sveti Stefan mit hervorragenden Entwicklungsmöglichkeiten.",
        "opportunities": ["Nähe zu Sveti Stefan", "Exklusive Projektentwicklung", "Strandlage"],
        "risks": ["Premium-Preise"],
        "use_cases": ["tourism", "residential"],
        "time_horizon": "short"
    },
    {
        "city": "Buljarica",
        "country": "Montenegro",
        "latitude": 42.1936,
        "longitude": 18.9456,
        "price_per_m2": 1200,
        "rental_yield": 4.5,
        "tourism_growth": 25,
        "population_growth": 2.0,
        "price_growth": 22,
        "infrastructure_score": 60,
        "description": "Größte unerschlossene Küstenfläche Montenegros. Enormes Potenzial durch geplante Budva-Umgehungsstraße.",
        "opportunities": ["Niedriger Einstiegspreis", "Riesige Entwicklungsflächen", "Umgehungsstraße geplant", "2km Sandstrand"],
        "risks": ["Noch unerschlossen", "Längerer Zeithorizont"],
        "use_cases": ["tourism", "residential"],
        "time_horizon": "long"
    },
    {
        "city": "Čanj",
        "country": "Montenegro",
        "latitude": 42.1256,
        "longitude": 19.0403,
        "price_per_m2": 1400,
        "rental_yield": 5.8,
        "tourism_growth": 18,
        "population_growth": 1.2,
        "price_growth": 16,
        "infrastructure_score": 68,
        "description": "Aufstrebender Küstenort mit erschwinglichem Luxus. Profitiert von der Nähe zur Hafenstadt Bar.",
        "opportunities": ["Erschwinglicher Luxus", "Nähe zu Bar", "Starkes Entwicklungspotenzial"],
        "risks": ["Noch weniger bekannt"],
        "use_cases": ["tourism", "residential"],
        "time_horizon": "medium"
    },
    {
        "city": "Danilovgrad",
        "country": "Montenegro",
        "latitude": 42.5536,
        "longitude": 19.1072,
        "price_per_m2": 900,
        "rental_yield": 5.0,
        "tourism_growth": 8,
        "population_growth": 0.8,
        "price_growth": 18,
        "infrastructure_score": 78,
        "description": "Der 'stille Gewinner' der Infrastrukturentwicklung. Zentraler Business- und Logistik-Korridor zwischen Podgorica und Nikšić.",
        "opportunities": ["Schnellstraßen-Ausbau", "Logistik-Hub", "Günstige Preise", "Strategische Lage"],
        "risks": ["Weniger touristisch"],
        "use_cases": ["logistics", "residential", "relocation"],
        "time_horizon": "medium"
    },
    {
        "city": "Skutarisee",
        "country": "Montenegro",
        "latitude": 42.2167,
        "longitude": 19.3167,
        "price_per_m2": 800,
        "rental_yield": 5.2,
        "tourism_growth": 20,
        "population_growth": 0.5,
        "price_growth": 15,
        "infrastructure_score": 55,
        "description": "Streng geschützte, ökologisch wertvolle Region. Perfekt für nachhaltigen Öko-Tourismus abseits des Massentourismus.",
        "opportunities": ["Öko-Tourismus", "UNESCO-Schutzgebiet", "InoCasa Ferienhäuser", "Naturstein & Glasfronten"],
        "risks": ["Strenge Bauvorschriften", "Abgelegene Lage"],
        "use_cases": ["tourism", "residential"],
        "time_horizon": "long"
    },
    {
        "city": "Krupac-See",
        "country": "Montenegro",
        "latitude": 42.7833,
        "longitude": 18.9333,
        "price_per_m2": 700,
        "rental_yield": 5.5,
        "tourism_growth": 15,
        "population_growth": 0.3,
        "price_growth": 12,
        "infrastructure_score": 65,
        "description": "Beliebtes Binnengewässer mit hoher regionaler Freizeitattraktivität. Exklusives InoCasa-Ferienhauспrojект in Planung.",
        "opportunities": ["Freizeitdestination", "Nachhaltige Ferienhäuser", "InoCasa-Partnerschaft", "Naturnahe Lage"],
        "risks": ["Limitierte Infrastruktur", "Saisonale Nachfrage"],
        "use_cases": ["tourism", "residential"],
        "time_horizon": "medium"
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
    },
    # Neue EuroAdria-relevante Infrastrukturprojekte
    {
        "project_name": "Boulevard Tivat-Jaz",
        "type": "road",
        "latitude": 42.41,
        "longitude": 18.72,
        "impact_radius_km": 15,
        "status": "construction",
        "description": "Neue Küstenstraße verbindet Tivat mit Budva, erschließt Premium-Lagen.",
        "completion_year": 2026,
        "investment_eur": 85000000
    },
    {
        "project_name": "Budva-Umgehungsstraße",
        "type": "road",
        "latitude": 42.22,
        "longitude": 18.92,
        "impact_radius_km": 20,
        "status": "planned",
        "description": "Entlastet Budva-Zentrum und erschließt Buljarica für Großprojekte.",
        "completion_year": 2029,
        "investment_eur": 150000000
    },
    {
        "project_name": "Schnellstraße Podgorica-Nikšić",
        "type": "road",
        "latitude": 42.55,
        "longitude": 19.0,
        "impact_radius_km": 25,
        "status": "construction",
        "description": "Ausbau zur Schnellstraße, positioniert Danilovgrad als Logistik-Hub.",
        "completion_year": 2027,
        "investment_eur": 120000000
    },
    {
        "project_name": "Porto Montenegro Phase 3",
        "type": "port",
        "latitude": 42.4367,
        "longitude": 18.6969,
        "impact_radius_km": 10,
        "status": "construction",
        "description": "Erweiterung des Luxusyachthafens mit neuen Residenzen und Marina.",
        "completion_year": 2027,
        "investment_eur": 250000000
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
