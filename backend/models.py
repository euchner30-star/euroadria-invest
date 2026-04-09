"""
Pydantic models for the EuroAdria API.
"""
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone


# ── Status Check ────────────────────────────────────────────────────────

class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class StatusCheckCreate(BaseModel):
    client_name: str


# ── Articles ────────────────────────────────────────────────────────────

class DueDiligenceBox(BaseModel):
    title: str
    content: str


class ExpertTip(BaseModel):
    author: str
    title: str
    content: str
    image: Optional[str] = None


class ArticleBase(BaseModel):
    cluster: str
    title: str
    slug: str
    excerpt: str
    content: str
    image: str
    category: str
    date: str
    readTime: str
    featured: bool = False
    author: str
    relatedArticles: List[int] = []
    dueDiligenceBox: Optional[DueDiligenceBox] = None
    expertTip: Optional[ExpertTip] = None
    downloadUrl: Optional[str] = None
    sortOrder: int = 0
    imagePosition: Optional[int] = 50


class ArticleCreate(ArticleBase):
    pass


class ArticleUpdate(BaseModel):
    cluster: Optional[str] = None
    title: Optional[str] = None
    slug: Optional[str] = None
    excerpt: Optional[str] = None
    content: Optional[str] = None
    image: Optional[str] = None
    category: Optional[str] = None
    date: Optional[str] = None
    readTime: Optional[str] = None
    featured: Optional[bool] = None
    author: Optional[str] = None
    relatedArticles: Optional[List[int]] = None
    dueDiligenceBox: Optional[DueDiligenceBox] = None
    expertTip: Optional[ExpertTip] = None
    metaTitle: Optional[str] = None
    metaDescription: Optional[str] = None
    downloadUrl: Optional[str] = None
    sortOrder: Optional[int] = None
    imagePosition: Optional[int] = None


class Article(ArticleBase):
    model_config = ConfigDict(extra="ignore")
    id: int


# ── Comments ────────────────────────────────────────────────────────────

class CommentCreate(BaseModel):
    articleId: int
    articleSlug: str
    name: str
    email: str
    content: str


class CommentResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    articleId: int
    articleSlug: str
    name: str
    content: str
    status: str
    createdAt: str


class CommentAdminResponse(CommentResponse):
    email: str
    articleTitle: Optional[str] = None


# ── Events ──────────────────────────────────────────────────────────────

class EventCreate(BaseModel):
    title: str
    description: str
    date: str
    time: Optional[str] = None
    location: Optional[str] = None
    type: str = "Event"
    image: Optional[str] = None
    link: Optional[str] = None
    status: str = "upcoming"


class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    date: Optional[str] = None
    time: Optional[str] = None
    location: Optional[str] = None
    type: Optional[str] = None
    image: Optional[str] = None
    link: Optional[str] = None
    status: Optional[str] = None


# ── CRM / Pipeline ─────────────────────────────────────────────────────

DEFAULT_PIPELINE_STAGES = [
    {"id": "new_lead", "name": "Neuer Lead", "order_index": 1, "probability": 10, "color": "#6B7280"},
    {"id": "qualified", "name": "Qualifiziert", "order_index": 2, "probability": 20, "color": "#3B82F6"},
    {"id": "call_scheduled", "name": "Termin vereinbart", "order_index": 3, "probability": 30, "color": "#8B5CF6"},
    {"id": "consultation_done", "name": "Erstgespräch", "order_index": 4, "probability": 40, "color": "#F59E0B"},
    {"id": "offer_sent", "name": "Angebot gesendet", "order_index": 5, "probability": 60, "color": "#F97316"},
    {"id": "negotiation", "name": "Verhandlung", "order_index": 6, "probability": 80, "color": "#EF4444"},
    {"id": "won", "name": "Gewonnen", "order_index": 7, "probability": 100, "color": "#10B981"},
    {"id": "lost", "name": "Verloren", "order_index": 8, "probability": 0, "color": "#374151"},
]


class CRMLeadCreate(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    lead_source: str = "direct"
    utm_source: Optional[str] = None
    utm_medium: Optional[str] = None
    utm_campaign: Optional[str] = None
    entry_page: Optional[str] = None
    tool_used: Optional[str] = None


class CRMLeadUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    lead_source: Optional[str] = None
    status: Optional[str] = None


class DealCreate(BaseModel):
    lead_id: str
    stage: str = "new_lead"
    deal_value: float = 0
    assigned_to: Optional[str] = None
    notes: Optional[str] = None


class DealUpdate(BaseModel):
    stage: Optional[str] = None
    deal_value: Optional[float] = None
    assigned_to: Optional[str] = None
    notes: Optional[str] = None


# ── Team / Pages / CMS ─────────────────────────────────────────────────

class TeamMember(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4())[:8])
    name: str
    title: str
    description: str
    image: str
    email: Optional[str] = None
    phone: Optional[str] = None


class InfoCard(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4())[:8])
    title: str
    description: str
    icon: Optional[str] = None


class HeroSection(BaseModel):
    title: str
    subtitle: str
    description: Optional[str] = None
    ctaText: Optional[str] = None
    ctaLink: Optional[str] = None
    backgroundImage: Optional[str] = None


class PageSection(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4())[:8])
    type: str
    title: Optional[str] = None
    content: Optional[str] = None
    data: Optional[dict] = None


class PageBase(BaseModel):
    slug: str
    title: str
    metaTitle: Optional[str] = None
    metaDescription: Optional[str] = None
    sections: List[PageSection] = []


class PageCreate(PageBase):
    pass


class PageUpdate(BaseModel):
    title: Optional[str] = None
    metaTitle: Optional[str] = None
    metaDescription: Optional[str] = None
    sections: Optional[List[PageSection]] = None


class Page(PageBase):
    model_config = ConfigDict(extra="ignore")
    id: str
    updatedAt: Optional[str] = None


# ── Regions ─────────────────────────────────────────────────────────────

class RegionBulletPoint(BaseModel):
    text: str


class RegionApartment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    price: str
    size: str
    imageUrl: str
    features: List[str] = []
    isAvailable: bool = True


class RegionBase(BaseModel):
    slug: str
    title: str
    subtitle: str
    investmentScore: int
    priceRange: str
    potential: str
    timeHorizon: str
    content: str
    bulletPoints: List[RegionBulletPoint] = []
    imageUrls: List[str] = []
    apartments: List[RegionApartment] = []


class RegionCreate(RegionBase):
    pass


class RegionUpdate(BaseModel):
    title: Optional[str] = None
    subtitle: Optional[str] = None
    investmentScore: Optional[int] = None
    priceRange: Optional[str] = None
    potential: Optional[str] = None
    timeHorizon: Optional[str] = None
    content: Optional[str] = None
    bulletPoints: Optional[List[RegionBulletPoint]] = None
    imageUrls: Optional[List[str]] = None
    apartments: Optional[List[RegionApartment]] = None


class Region(RegionBase):
    model_config = ConfigDict(extra="ignore")
    id: str


# ── Contact / Lead ──────────────────────────────────────────────────────

class ContactForm(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    subject: str
    message: str


class LeadForm(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    source: str
    expose_name: Optional[str] = None


# ── Analytics ───────────────────────────────────────────────────────────

class PageViewEvent(BaseModel):
    path: str
    referrer: Optional[str] = None
    user_agent: Optional[str] = None
    utm_source: Optional[str] = None
    utm_medium: Optional[str] = None
    utm_campaign: Optional[str] = None


# ── Newsletter ──────────────────────────────────────────────────────────

class NewsletterSubscribe(BaseModel):
    email: EmailStr
    name: Optional[str] = None


# ── Translation ─────────────────────────────────────────────────────────

class TranslateRequest(BaseModel):
    text: str
    source: str = "de"
    target: str = "en"


class TranslateBatchRequest(BaseModel):
    texts: List[str]
    source: str = "de"
    target: str = "en"
