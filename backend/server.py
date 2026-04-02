from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, BackgroundTasks, UploadFile, File
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from fastapi.staticfiles import StaticFiles
from fastapi.responses import Response
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Literal
import uuid
from datetime import datetime, timezone
import secrets
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from PIL import Image
import io
import resend
import requests as http_requests


ROOT_DIR = Path(__file__).parent
UPLOAD_DIR = ROOT_DIR.parent / "frontend" / "public" / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

load_dotenv(ROOT_DIR / '.env')

# Object Storage
STORAGE_URL = "https://integrations.emergentagent.com/objstore/api/v1/storage"
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY")
APP_NAME = "euroadria"
storage_key = None

def init_storage():
    global storage_key
    if storage_key:
        return storage_key
    resp = http_requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_KEY}, timeout=30)
    resp.raise_for_status()
    storage_key = resp.json()["storage_key"]
    return storage_key

def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    resp = http_requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type},
        data=data, timeout=120
    )
    resp.raise_for_status()
    return resp.json()

def get_object(path: str):
    key = init_storage()
    resp = http_requests.get(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key}, timeout=60
    )
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Simple HTTP Basic Auth for Admin
security = HTTPBasic()

# Admin credentials (in production, use environment variables and proper hashing)
ADMIN_USERNAME = os.environ.get('ADMIN_USERNAME', 'admin')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'euroadria2025')

# Email notification settings
NOTIFICATION_EMAIL = os.environ.get('NOTIFICATION_EMAIL', 'office@euroadria.me')
RESEND_API_KEY = os.environ.get('RESEND_API_KEY', '')
BREVO_API_KEY = os.environ.get('BREVO_API_KEY', '')
BREVO_LIST_ID = 3  # EuroAdria Newsletter list

# Legacy SMTP settings (fallback)
SMTP_HOST = os.environ.get('SMTP_HOST', 'smtp.gmail.com')
SMTP_PORT = int(os.environ.get('SMTP_PORT', '587'))
SMTP_USER = os.environ.get('SMTP_USER', '')
SMTP_PASSWORD = os.environ.get('SMTP_PASSWORD', '')

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# Health check endpoint (keeps Render server awake)
@api_router.get("/health")
async def health_check():
    return {"status": "ok"}


def verify_admin(credentials: HTTPBasicCredentials = Depends(security)):
    """Verify admin credentials"""
    correct_username = secrets.compare_digest(credentials.username, ADMIN_USERNAME)
    correct_password = secrets.compare_digest(credentials.password, ADMIN_PASSWORD)
    if not (correct_username and correct_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Basic"},
        )
    return credentials.username


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str


# Article Models
class DueDiligenceBox(BaseModel):
    title: str
    content: str

class ExpertTip(BaseModel):
    author: str
    title: str
    content: str

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


# Comment Models
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


# =============================================
# PAGE CMS MODELS
# =============================================

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
    icon: Optional[str] = None  # Icon name for frontend

class HeroSection(BaseModel):
    title: str
    subtitle: str
    description: Optional[str] = None
    ctaText: Optional[str] = None
    ctaLink: Optional[str] = None
    backgroundImage: Optional[str] = None

class PageSection(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4())[:8])
    type: str  # hero, team, cards, text, gallery, cta, testimonials
    title: Optional[str] = None
    content: Optional[str] = None  # WYSIWYG HTML
    data: Optional[dict] = None  # Flexible data for different section types

class PageBase(BaseModel):
    slug: str  # URL path: home, team, contact, etc.
    title: str  # Page title
    metaTitle: Optional[str] = None  # SEO title
    metaDescription: Optional[str] = None  # SEO description
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


# Region Models for Admin CMS
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
    slug: str  # e.g., "skadar-lake", "podgorica"
    title: str
    subtitle: str
    investmentScore: int  # 0-100
    priceRange: str  # e.g., "€1.500-3.000/m²"
    potential: str  # e.g., "+35-55%"
    timeHorizon: str  # e.g., "2-5 Jahre"
    content: str  # WYSIWYG HTML content
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


# Email notification function
async def send_notification_email(comment_data: dict, article_title: str):
    """Send email notification for new comment"""
    if not SMTP_USER or not SMTP_PASSWORD:
        logger.warning("SMTP credentials not configured - skipping email notification")
        return
    
    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = f'Neuer Kommentar auf EuroAdria: {article_title[:50]}'
        msg['From'] = SMTP_USER
        msg['To'] = NOTIFICATION_EMAIL
        
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; background-color: #002147; color: #ffffff; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #001233; padding: 30px; border-radius: 10px; border: 1px solid #D4AF37;">
                <h2 style="color: #D4AF37; margin-bottom: 20px;">Neuer Kommentar eingegangen</h2>
                
                <p style="color: #ffffff; margin-bottom: 10px;"><strong>Artikel:</strong> {article_title}</p>
                <p style="color: #ffffff; margin-bottom: 10px;"><strong>Name:</strong> {comment_data['name']}</p>
                <p style="color: #ffffff; margin-bottom: 10px;"><strong>E-Mail:</strong> {comment_data['email']}</p>
                <p style="color: #ffffff; margin-bottom: 20px;"><strong>Kommentar:</strong></p>
                <div style="background-color: #002147; padding: 15px; border-radius: 5px; border-left: 3px solid #D4AF37;">
                    <p style="color: #ffffff; margin: 0;">{comment_data['content']}</p>
                </div>
                
                <p style="color: #888888; margin-top: 30px; font-size: 12px;">
                    Dieser Kommentar wartet auf Freigabe im Admin-Panel.
                </p>
                
                <a href="https://roi-calc-preview.preview.emergentagent.com/admin" 
                   style="display: inline-block; margin-top: 20px; padding: 12px 24px; background-color: #D4AF37; color: #002147; text-decoration: none; border-radius: 5px; font-weight: bold;">
                    Zum Admin-Panel
                </a>
            </div>
        </body>
        </html>
        """
        
        msg.attach(MIMEText(html_content, 'html'))
        
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=10) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.send_message(msg)
        
        logger.info(f"Notification email sent for comment by {comment_data['name']}")
    except Exception as e:
        logger.error(f"Failed to send notification email: {e}")


# Contact form email function using Resend
async def send_contact_email(contact_data: dict):
    """Send email notification for contact form submission using Resend"""
    if not RESEND_API_KEY:
        logger.warning("Resend API key not configured - skipping contact email")
        return False
    
    try:
        resend.api_key = RESEND_API_KEY
        
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; background-color: #0A1628; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #1a2744; border-radius: 10px; padding: 30px;">
                <h2 style="color: #c8a96a; margin-bottom: 20px;">Neue Kontaktanfrage</h2>
                <div style="background-color: #0A1628; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <p style="color: #ffffff; margin-bottom: 10px;"><strong>Name:</strong> {contact_data['name']}</p>
                    <p style="color: #ffffff; margin-bottom: 10px;"><strong>E-Mail:</strong> {contact_data['email']}</p>
                    <p style="color: #ffffff; margin-bottom: 10px;"><strong>Telefon:</strong> {contact_data.get('phone', 'Nicht angegeben')}</p>
                    <p style="color: #ffffff; margin-bottom: 10px;"><strong>Betreff:</strong> {contact_data['subject']}</p>
                </div>
                <div style="background-color: #0A1628; padding: 20px; border-radius: 8px;">
                    <p style="color: #c8a96a; margin-bottom: 10px;"><strong>Nachricht:</strong></p>
                    <p style="color: #ffffff; white-space: pre-wrap;">{contact_data['message']}</p>
                </div>
                <hr style="border-color: #c8a96a; margin: 20px 0;">
                <p style="color: #888; font-size: 12px;">Diese Nachricht wurde über das Kontaktformular auf euroadria.me gesendet.</p>
            </div>
        </body>
        </html>
        """
        
        params = {
            "from": "EuroAdria Kontakt <onboarding@resend.dev>",
            "to": [NOTIFICATION_EMAIL],
            "subject": f"Neue Kontaktanfrage: {contact_data['subject']}",
            "html": html_content,
            "reply_to": contact_data['email']
        }
        
        email = resend.Emails.send(params)
        logger.info(f"Contact email sent via Resend from {contact_data['name']}, id: {email.get('id')}")
        return True
    except Exception as e:
        logger.error(f"Failed to send contact email: {e}")
        return False


# Contact form model
class ContactForm(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    subject: str
    message: str

# Lead form model (for Exposé downloads)
class LeadForm(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    source: str  # e.g. "budva_expose", "niksic_expose"
    expose_name: Optional[str] = None


# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}


# =============================================
# CONTACT FORM ENDPOINT
# =============================================

@api_router.post("/contact")
async def submit_contact_form(form: ContactForm):
    """Handle contact form submissions"""
    contact_dict = form.model_dump()
    contact_dict["submitted_at"] = datetime.now(timezone.utc).isoformat()
    contact_dict["status"] = "new"
    
    # Store in database
    await db.contact_submissions.insert_one(contact_dict)
    
    # Send email notification
    email_sent = await send_contact_email(contact_dict)
    
    return {
        "success": True,
        "message": "Vielen Dank für Ihre Nachricht! Wir melden uns zeitnah bei Ihnen.",
        "email_sent": email_sent
    }


# =============================================
# LEAD CAPTURE ENDPOINT (Exposé Downloads)
# =============================================

@api_router.post("/leads")
async def capture_lead(lead: LeadForm):
    """Capture lead data before Exposé download"""
    lead_dict = lead.model_dump()
    lead_dict["submitted_at"] = datetime.now(timezone.utc).isoformat()
    lead_dict["type"] = "expose_download"
    
    # Store in database
    await db.leads.insert_one(lead_dict)
    
    # Send email notification
    email_sent = False
    if RESEND_API_KEY:
        try:
            resend.api_key = RESEND_API_KEY
            html_content = f"""
            <html>
            <body style="font-family: Arial, sans-serif; background-color: #0A1628; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #1a2744; border-radius: 10px; padding: 30px;">
                    <h2 style="color: #c8a96a; margin-bottom: 20px;">Neuer Exposé-Download Lead</h2>
                    <div style="background-color: #0A1628; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                        <p style="color: #ffffff; margin-bottom: 10px;"><strong>Name:</strong> {lead_dict['name']}</p>
                        <p style="color: #ffffff; margin-bottom: 10px;"><strong>E-Mail:</strong> {lead_dict['email']}</p>
                        <p style="color: #ffffff; margin-bottom: 10px;"><strong>Telefon:</strong> {lead_dict.get('phone', 'Nicht angegeben')}</p>
                        <p style="color: #ffffff; margin-bottom: 10px;"><strong>Exposé:</strong> {lead_dict.get('expose_name', lead_dict['source'])}</p>
                    </div>
                    <hr style="border-color: #c8a96a; margin: 20px 0;">
                    <p style="color: #888; font-size: 12px;">Dieser Lead wurde über den Exposé-Download auf invest.euroadria.me generiert.</p>
                </div>
            </body>
            </html>
            """
            params = {
                "from": "EuroAdria Leads <onboarding@resend.dev>",
                "to": [NOTIFICATION_EMAIL],
                "subject": f"Neuer Lead: {lead_dict.get('expose_name', lead_dict['source'])} - {lead_dict['name']}",
                "html": html_content,
                "reply_to": lead_dict['email']
            }
            resend.Emails.send(params)
            email_sent = True
        except Exception as e:
            logger.error(f"Failed to send lead email: {e}")
    
    return {"success": True, "email_sent": email_sent}

@api_router.get("/admin/leads")
async def get_leads(admin: str = Depends(verify_admin)):
    """Get all collected leads (Admin only)"""
    leads = await db.leads.find({}, {"_id": 0}).sort("submitted_at", -1).to_list(500)
    return leads


# =============================================
# ANALYTICS & TRACKING ENDPOINTS
# =============================================

class PageViewEvent(BaseModel):
    path: str
    referrer: Optional[str] = None
    user_agent: Optional[str] = None

@api_router.post("/track/pageview")
async def track_pageview(event: PageViewEvent):
    """Track a page view (called from frontend)"""
    doc = {
        "path": event.path,
        "referrer": event.referrer or "",
        "device": parse_device_type(event.user_agent or ""),
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    await db.page_views.insert_one(doc)
    return {"ok": True}

@api_router.post("/track/calculator")
async def track_calculator_usage():
    """Track ROI calculator usage"""
    doc = {"timestamp": datetime.now(timezone.utc).isoformat(), "type": "roi_calculator"}
    await db.calculator_usage.insert_one(doc)
    return {"ok": True}

@api_router.get("/admin/analytics/overview")
async def get_analytics_overview(days: int = 30, admin: str = Depends(verify_admin)):
    """Get analytics overview data for dashboard"""
    from datetime import timedelta
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
    
    # Referrer breakdown (traffic sources)
    pipeline_referrers = [
        {"$match": {"timestamp": {"$gte": cutoff}, "referrer": {"$ne": ""}}},
        {"$addFields": {
            "source": {
                "$switch": {
                    "branches": [
                        {"case": {"$regexMatch": {"input": "$referrer", "regex": "google"}}, "then": "Google"},
                        {"case": {"$regexMatch": {"input": "$referrer", "regex": "linkedin"}}, "then": "LinkedIn"},
                        {"case": {"$regexMatch": {"input": "$referrer", "regex": "facebook|fb.com"}}, "then": "Facebook"},
                        {"case": {"$regexMatch": {"input": "$referrer", "regex": "instagram"}}, "then": "Instagram"},
                        {"case": {"$regexMatch": {"input": "$referrer", "regex": "twitter|x.com"}}, "then": "Twitter/X"},
                        {"case": {"$regexMatch": {"input": "$referrer", "regex": "euroadria"}}, "then": "EuroAdria.me"},
                    ],
                    "default": "Andere"
                }
            }
        }},
        {"$group": {"_id": "$source", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 8}
    ]
    referrers = await db.page_views.aggregate(pipeline_referrers).to_list(8)
    
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
    
    # Recent leads
    recent_leads = await db.leads.find({}, {"_id": 0}).sort("submitted_at", -1).to_list(20)
    
    # Conversion rate
    conversion_rate = round((total_leads / total_views * 100), 2) if total_views > 0 else 0
    
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
        "recent_leads": recent_leads
    }


@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks


# =============================================
# NEWSLETTER ENDPOINTS (Brevo)
# =============================================

import requests as http_requests

class NewsletterSubscribe(BaseModel):
    email: EmailStr
    name: Optional[str] = None

def brevo_request(method: str, endpoint: str, data: dict = None):
    """Make a request to Brevo API"""
    url = f"https://api.brevo.com/v3/{endpoint}"
    headers = {"api-key": BREVO_API_KEY, "content-type": "application/json"}
    if method == "GET":
        r = http_requests.get(url, headers=headers, params=data)
    elif method == "POST":
        r = http_requests.post(url, headers=headers, json=data)
    elif method == "PUT":
        r = http_requests.put(url, headers=headers, json=data)
    else:
        raise ValueError(f"Unsupported method: {method}")
    return r

@api_router.post("/newsletter/subscribe")
async def newsletter_subscribe(sub: NewsletterSubscribe):
    """Subscribe to newsletter via Brevo"""
    if not BREVO_API_KEY:
        raise HTTPException(status_code=500, detail="Newsletter nicht konfiguriert")
    
    # Create/update contact in Brevo with list assignment
    payload = {
        "email": sub.email,
        "updateEnabled": True,
        "listIds": [BREVO_LIST_ID],
    }
    if sub.name:
        payload["attributes"] = {"VORNAME": sub.name}
    
    r = brevo_request("POST", "contacts", payload)
    
    if r.status_code in (200, 201, 204):
        # Check if already subscribed locally (to avoid duplicate welcome emails)
        existing = await db.newsletter_subscribers.find_one({"email": sub.email})
        is_new = existing is None
        
        # Save/update locally for analytics
        await db.newsletter_subscribers.update_one(
            {"email": sub.email},
            {"$set": {"email": sub.email, "name": sub.name or "", "subscribed_at": datetime.now(timezone.utc).isoformat(), "active": True}},
            upsert=True
        )
        
        # Send welcome email ONLY for new subscribers
        if is_new:
            try:
                welcome_html = f"""
            <html>
            <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; margin: 0;">
                <div style="max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <div style="background: #ffffff; padding: 28px 32px; text-align: center; border-bottom: 2px solid #C8A96A;">
                        <img src="https://invest.euroadria.me/euroadria-logo.png" alt="EuroAdria" style="height: 50px;">
                    </div>
                    <div style="padding: 32px; color: #333; font-size: 15px; line-height: 1.7;">
                        <h2 style="color: #04151F; font-size: 22px; margin-bottom: 16px;">Willkommen bei EuroAdria Corporate Solutions!</h2>
                        <p>Hallo{(' ' + sub.name) if sub.name else ''},</p>
                        <p>vielen Dank für Ihre Anmeldung zum EuroAdria Newsletter! 
                        Sie erhalten ab sofort exklusive Investment-Insights, Marktanalysen 
                        und Neuigkeiten zu Immobilien-Projekten am Balkan.</p>
                        <p style="margin-top: 20px;">
                            <a href="https://invest.euroadria.me" style="display: inline-block; background: #C8A96A; color: #04151F; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">Zur Plattform</a>
                        </p>
                    </div>
                    <div style="padding: 16px 32px; background: #f8f8f8; border-top: 1px solid #eee; border-bottom: 1px solid #eee;">
                        <p style="color: #999; font-size: 12px; margin: 0; text-align: center;">
                            Sie erhalten diese E-Mail, weil Sie sich für den EuroAdria Newsletter angemeldet haben.<br>
                            Sie können sich jederzeit mit einem Klick 
                            <a href="https://invest.euroadria.me/newsletter/abmelden?email={sub.email}" style="color: #C8A96A;">hier abmelden</a> 
                            , unkompliziert und sofort wirksam.
                        </p>
                    </div>
                    <div style="padding: 24px 32px; border-top: 1px solid #e5e7eb; background: #fafafa;">
                        <table style="width: 100%;">
                            <tr>
                                <td style="vertical-align: top; padding-right: 20px; width: 130px;">
                                    <img src="https://invest.euroadria.me/euroadria-logo.png" alt="EuroAdria" style="width: 110px;">
                                </td>
                                <td style="vertical-align: top; font-size: 12px; color: #555; line-height: 1.6;">
                                    <p style="margin: 0 0 2px; font-size: 14px; font-weight: bold; color: #04151F;">EuroAdria Corporate Solutions</p>
                                    <p style="margin: 0 0 8px; font-size: 11px; color: #888;">a brand of <strong style="color: #333;">Montaris &amp; Co. d.o.o.</strong></p>
                                    <p style="margin: 0 0 8px; color: #555;">Montaris &amp; Co. d.o.o.<br>Marka Miljanova 12<br>21000 Novi Sad, Serbia</p>
                                    <p style="margin: 0 0 8px;">
                                        Tel.: <a href="tel:+38268559776" style="color: #C8A96A; text-decoration: none;">+382 68 559 776</a><br>
                                        E-Mail: <a href="mailto:office@euroadria.me" style="color: #C8A96A; text-decoration: none;">office@euroadria.me</a><br>
                                        Web: <a href="https://www.euroadria.me" style="color: #C8A96A; text-decoration: none;">www.euroadria.me</a><br>
                                        Investment: <a href="https://invest.euroadria.me" style="color: #C8A96A; text-decoration: none;">invest.euroadria.me</a>
                                    </p>
                                    <p style="margin: 0; font-size: 10px; color: #999; line-height: 1.5;">
                                        Company registration no.: 22147382 | Tax ID (PIB): 115356237<br>
                                        Director: Milena Bubanja
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </div>
                </div>
            </body>
            </html>
            """
                brevo_request("POST", "smtp/email", {
                    "to": [{"email": sub.email, "name": sub.name or sub.email}],
                    "sender": {"email": "office@euroadria.me", "name": "EuroAdria"},
                    "subject": "Willkommen beim EuroAdria Newsletter!",
                    "htmlContent": welcome_html
                })
            except Exception as e:
                logger.error(f"Welcome email failed: {e}")
        
        return {"success": True, "message": "Erfolgreich zum Newsletter angemeldet!" if is_new else "Sie sind bereits angemeldet!"}
    
    elif r.status_code == 400 and "already exist" in r.text.lower():
        return {"success": True, "message": "Sie sind bereits angemeldet!"}
    else:
        logger.error(f"Brevo subscribe error: {r.status_code} {r.text}")
        raise HTTPException(status_code=400, detail="Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.")

@api_router.post("/newsletter/unsubscribe")
async def newsletter_unsubscribe(data: dict):
    """Unsubscribe from newsletter"""
    email = data.get("email", "")
    if not email:
        raise HTTPException(status_code=400, detail="E-Mail erforderlich")
    
    # Remove from Brevo list
    if BREVO_API_KEY:
        try:
            brevo_request("POST", f"contacts/lists/{BREVO_LIST_ID}/contacts/remove", {"emails": [email]})
        except Exception as e:
            logger.error(f"Brevo unsubscribe error: {e}")
    
    # Mark as inactive locally
    await db.newsletter_subscribers.update_one(
        {"email": email},
        {"$set": {"active": False, "unsubscribed_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"success": True, "message": "Sie wurden erfolgreich abgemeldet."}

@api_router.get("/admin/newsletter/subscribers")
async def get_newsletter_subscribers(admin: str = Depends(verify_admin)):
    """Get all newsletter subscribers"""
    # Get from Brevo
    r = brevo_request("GET", f"contacts/lists/{BREVO_LIST_ID}/contacts?limit=500")
    brevo_contacts = []
    if r.ok:
        data = r.json()
        brevo_contacts = [{"email": c["email"], "name": c.get("attributes", {}).get("VORNAME", ""), "subscribed": True} for c in data.get("contacts", [])]
    
    # Get local count
    local_count = await db.newsletter_subscribers.count_documents({"active": True})
    
    return {
        "subscribers": brevo_contacts,
        "total": len(brevo_contacts),
        "local_count": local_count
    }

@api_router.post("/admin/newsletter/send")
async def send_newsletter(data: dict, admin: str = Depends(verify_admin)):
    """Send a newsletter campaign via Brevo"""
    if not BREVO_API_KEY:
        raise HTTPException(status_code=500, detail="Brevo nicht konfiguriert")
    
    subject = data.get("subject", "")
    content = data.get("content", "")
    
    if not subject or not content:
        raise HTTPException(status_code=400, detail="Betreff und Inhalt sind erforderlich")
    
    # Wrap content in branded template
    html_body = f"""
    <html>
    <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; margin: 0;">
        <div style="max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <div style="background: #ffffff; padding: 28px 32px; text-align: center; border-bottom: 2px solid #C8A96A;">
                <img src="https://invest.euroadria.me/euroadria-logo.png" alt="EuroAdria" style="height: 50px;">
            </div>
            <div style="padding: 32px; color: #333; font-size: 15px; line-height: 1.7;">
                {content}
            </div>
            <div style="padding: 24px 32px; border-top: 1px solid #e5e7eb; background: #fafafa;">
                <table style="width: 100%;">
                    <tr>
                        <td style="vertical-align: top; padding-right: 20px; width: 130px;">
                            <img src="https://invest.euroadria.me/euroadria-logo.png" alt="EuroAdria" style="width: 110px;">
                        </td>
                        <td style="vertical-align: top; font-size: 12px; color: #555; line-height: 1.6;">
                            <p style="margin: 0 0 2px; font-size: 14px; font-weight: bold; color: #04151F;">EuroAdria Corporate Solutions</p>
                            <p style="margin: 0 0 8px; font-size: 11px; color: #888;">a brand of <strong style="color: #333;">Montaris &amp; Co. d.o.o.</strong></p>
                            <p style="margin: 0 0 8px; color: #555;">Montaris &amp; Co. d.o.o.<br>Marka Miljanova 12<br>21000 Novi Sad, Serbia</p>
                            <p style="margin: 0 0 8px;">
                                Tel.: <a href="tel:+38268559776" style="color: #C8A96A; text-decoration: none;">+382 68 559 776</a><br>
                                E-Mail: <a href="mailto:office@euroadria.me" style="color: #C8A96A; text-decoration: none;">office@euroadria.me</a><br>
                                Web: <a href="https://www.euroadria.me" style="color: #C8A96A; text-decoration: none;">www.euroadria.me</a><br>
                                Investment: <a href="https://invest.euroadria.me" style="color: #C8A96A; text-decoration: none;">invest.euroadria.me</a>
                            </p>
                            <p style="margin: 0; font-size: 10px; color: #999; line-height: 1.5;">
                                Company registration no.: 22147382 | Tax ID (PIB): 115356237<br>
                                Director: Milena Bubanja
                            </p>
                        </td>
                    </tr>
                </table>
            </div>
            <div style="background: #04151F; padding: 16px 32px; text-align: center;">
                <p style="color: #888; font-size: 11px; margin: 0;">
                    <a href="{{{{unsubscribe}}}}" style="color: #C8A96A;">Newsletter abbestellen</a>
                </p>
            </div>
        </div>
    </body>
    </html>
    """
    
    # Create campaign in Brevo
    campaign_data = {
        "name": f"Newsletter: {subject} ({datetime.now(timezone.utc).strftime('%d.%m.%Y')})",
        "sender": {"email": "office@euroadria.me", "name": "EuroAdria"},
        "subject": subject,
        "htmlContent": html_body,
        "recipients": {"listIds": [BREVO_LIST_ID]},
        "type": "classic"
    }
    
    r = brevo_request("POST", "emailCampaigns", campaign_data)
    
    if not r.ok:
        logger.error(f"Brevo campaign create error: {r.status_code} {r.text}")
        raise HTTPException(status_code=400, detail=f"Kampagne konnte nicht erstellt werden: {r.text}")
    
    campaign_id = r.json().get("id")
    
    # Send immediately
    r2 = brevo_request("POST", f"emailCampaigns/{campaign_id}/sendNow", {})
    
    if r2.status_code in (200, 204):
        # Log in DB
        await db.newsletter_campaigns.insert_one({
            "campaign_id": campaign_id,
            "subject": subject,
            "sent_at": datetime.now(timezone.utc).isoformat(),
            "list_id": BREVO_LIST_ID
        })
        return {"success": True, "campaign_id": campaign_id, "message": "Newsletter wurde versendet!"}
    else:
        logger.error(f"Brevo send error: {r2.status_code} {r2.text}")
        raise HTTPException(status_code=400, detail=f"Newsletter konnte nicht gesendet werden: {r2.text}")


# =============================================
# ARTICLE ENDPOINTS (Public)
# =============================================

# Lightweight article fields for blog list (excludes heavy content)
BLOG_LIST_FIELDS = {
    "_id": 0,
    "id": 1,
    "slug": 1,
    "title": 1,
    "excerpt": 1,
    "image": 1,
    "category": 1,
    "cluster": 1,
    "date": 1,
    "readTime": 1,
    "featured": 1,
    "author": 1
}

@api_router.get("/articles/list")
async def get_articles_list(
    cluster: Optional[str] = None,
    category: Optional[str] = None,
    page: int = 1,
    limit: int = 12,
    search: Optional[str] = None
):
    """Get paginated article list for blog page (lightweight - no content)"""
    query = {}
    if cluster and cluster != "All":
        query["cluster"] = cluster
    if category:
        query["category"] = category
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"excerpt": {"$regex": search, "$options": "i"}}
        ]
    
    # Get total count
    total = await db.articles.count_documents(query)
    
    # Get paginated results
    skip = (page - 1) * limit
    articles = await db.articles.find(query, BLOG_LIST_FIELDS).sort([("sortOrder", 1), ("date", -1)]).skip(skip).limit(limit).to_list(limit)
    
    return {
        "articles": articles,
        "total": total,
        "page": page,
        "limit": limit,
        "totalPages": (total + limit - 1) // limit,
        "hasMore": skip + len(articles) < total
    }


@api_router.get("/articles", response_model=List[Article])
async def get_articles(
    cluster: Optional[str] = None,
    featured: Optional[bool] = None,
    category: Optional[str] = None,
    limit: Optional[int] = None
):
    """Get all articles with optional filters (full data)"""
    query = {}
    if cluster:
        query["cluster"] = cluster
    if featured is not None:
        query["featured"] = featured
    if category:
        query["category"] = category
    
    cursor = db.articles.find(query, {"_id": 0}).sort([("sortOrder", 1), ("date", -1)])
    if limit:
        cursor = cursor.limit(limit)
    
    articles = await cursor.to_list(1000)
    return articles


@api_router.get("/articles/{slug}", response_model=Article)
async def get_article_by_slug(slug: str):
    """Get a single article by slug"""
    article = await db.articles.find_one({"slug": slug}, {"_id": 0})
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    return article


@api_router.get("/articles/id/{article_id}", response_model=Article)
async def get_article_by_id(article_id: int):
    """Get a single article by ID"""
    article = await db.articles.find_one({"id": article_id}, {"_id": 0})
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    return article


@api_router.get("/clusters")
async def get_clusters():
    """Get all unique clusters with article counts"""
    pipeline = [
        {"$group": {"_id": "$cluster", "count": {"$sum": 1}, "category": {"$first": "$category"}}},
        {"$sort": {"_id": 1}}
    ]
    clusters = await db.articles.aggregate(pipeline).to_list(100)
    return [{"id": c["_id"], "cluster": c["_id"], "count": c["count"], "category": c["category"]} for c in clusters]


@api_router.get("/categories")
async def get_categories():
    """Get all unique categories with article counts"""
    pipeline = [
        {"$group": {"_id": "$category", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    categories = await db.articles.aggregate(pipeline).to_list(100)
    return [{"category": c["_id"], "count": c["count"]} for c in categories]


# =============================================
# ADMIN ENDPOINTS (Protected)
# =============================================

@api_router.post("/admin/articles", response_model=Article)
async def create_article(article: ArticleCreate, admin: str = Depends(verify_admin)):
    """Create a new article (Admin only)"""
    # Check if slug already exists
    existing = await db.articles.find_one({"slug": article.slug})
    if existing:
        raise HTTPException(status_code=400, detail="Article with this slug already exists")
    
    # Generate new ID (find max ID and increment)
    max_id_doc = await db.articles.find_one(sort=[("id", -1)])
    new_id = (max_id_doc["id"] + 1) if max_id_doc else 101
    
    article_dict = article.model_dump()
    article_dict["id"] = new_id
    
    await db.articles.insert_one(article_dict)
    
    # Return without _id
    return article_dict


@api_router.put("/admin/articles/{article_id}", response_model=Article)
async def update_article(article_id: int, article_update: ArticleUpdate, admin: str = Depends(verify_admin)):
    """Update an article (Admin only)"""
    # Check if article exists
    existing = await db.articles.find_one({"id": article_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Article not found")
    
    # Build update dict excluding None values
    update_data = {k: v for k, v in article_update.model_dump().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    # If slug is being updated, check it doesn't conflict
    if "slug" in update_data and update_data["slug"] != existing.get("slug"):
        slug_exists = await db.articles.find_one({"slug": update_data["slug"], "id": {"$ne": article_id}})
        if slug_exists:
            raise HTTPException(status_code=400, detail="Article with this slug already exists")
    
    await db.articles.update_one({"id": article_id}, {"$set": update_data})
    
    updated = await db.articles.find_one({"id": article_id}, {"_id": 0})
    return updated


@api_router.delete("/admin/articles/{article_id}")
async def delete_article(article_id: int, admin: str = Depends(verify_admin)):
    """Delete an article (Admin only)"""
    result = await db.articles.delete_one({"id": article_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Article not found")
    return {"message": "Article deleted successfully", "id": article_id}


# =============================================
# DYNAMIC SITEMAP
# =============================================

SITE_URL = "https://invest.euroadria.me"

# User-Agent parsing helper
def parse_device_type(user_agent: str) -> str:
    ua = user_agent.lower()
    if any(x in ua for x in ['mobile', 'android', 'iphone', 'ipod']):
        return 'mobile'
    if any(x in ua for x in ['ipad', 'tablet']):
        return 'tablet'
    return 'desktop'

STATIC_PAGES = [
    {"loc": "/", "priority": "1.0", "changefreq": "weekly"},
    {"loc": "/blog", "priority": "0.9", "changefreq": "daily"},
    {"loc": "/serbia-executive", "priority": "0.9", "changefreq": "weekly"},
    {"loc": "/serbia-executive/crypto-banking", "priority": "0.8", "changefreq": "weekly"},
    {"loc": "/serbia-executive/crypto-compliance", "priority": "0.8", "changefreq": "weekly"},
    {"loc": "/infrastruktur-radar", "priority": "0.8", "changefreq": "weekly"},
    {"loc": "/investment", "priority": "0.9", "changefreq": "weekly"},
    {"loc": "/investment/rechner", "priority": "0.8", "changefreq": "monthly"},
    {"loc": "/investment/vergleich", "priority": "0.8", "changefreq": "monthly"},
    {"loc": "/contact", "priority": "0.8", "changefreq": "monthly"},
    {"loc": "/team", "priority": "0.7", "changefreq": "monthly"},
    {"loc": "/immobilien/budva", "priority": "0.8", "changefreq": "weekly"},
    {"loc": "/immobilien/niksic", "priority": "0.8", "changefreq": "weekly"},
    {"loc": "/immobilien/podgorica", "priority": "0.8", "changefreq": "weekly"},
    {"loc": "/immobilien/skadar-lake", "priority": "0.8", "changefreq": "weekly"},
    {"loc": "/immobilien/zabljak", "priority": "0.8", "changefreq": "weekly"},
    {"loc": "/impressum", "priority": "0.3", "changefreq": "yearly"},
    {"loc": "/datenschutz", "priority": "0.3", "changefreq": "yearly"},
]

@api_router.get("/sitemap.xml")
async def generate_sitemap():
    """Generate dynamic sitemap from database articles + static pages"""
    from datetime import datetime
    today = datetime.now().strftime("%Y-%m-%d")
    
    xml_parts = ['<?xml version="1.0" encoding="UTF-8"?>']
    xml_parts.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    
    # Static pages
    for page in STATIC_PAGES:
        xml_parts.append(f'  <url>')
        xml_parts.append(f'    <loc>{SITE_URL}{page["loc"]}</loc>')
        xml_parts.append(f'    <lastmod>{today}</lastmod>')
        xml_parts.append(f'    <changefreq>{page["changefreq"]}</changefreq>')
        xml_parts.append(f'    <priority>{page["priority"]}</priority>')
        xml_parts.append(f'  </url>')
    
    # Dynamic articles from DB
    articles = await db.articles.find({}, {"_id": 0, "slug": 1, "date": 1}).to_list(1000)
    for article in articles:
        xml_parts.append(f'  <url>')
        xml_parts.append(f'    <loc>{SITE_URL}/blog/{article["slug"]}</loc>')
        xml_parts.append(f'    <lastmod>{article.get("date", today)}</lastmod>')
        xml_parts.append(f'    <changefreq>monthly</changefreq>')
        xml_parts.append(f'    <priority>0.7</priority>')
        xml_parts.append(f'  </url>')
    
    xml_parts.append('</urlset>')
    
    return Response(
        content="\n".join(xml_parts), 
        media_type="application/xml",
        headers={"Content-Type": "application/xml; charset=utf-8"}
    )


# =============================================
# SITE SETTINGS ENDPOINTS
# =============================================

SETTINGS_FIXED_KEYS = [
    "praxisleitfaden_url",
    "budva_expose_url",
    "niksic_expose_url",
    "podgorica_expose_url",
    "skadar_lake_expose_url",
    "zabljak_expose_url"
]

@api_router.get("/settings/downloads")
async def get_download_settings():
    """Get all download URL settings (public)"""
    settings = await db.site_settings.find_one({"key": "downloads"}, {"_id": 0})
    if not settings:
        result = {k: "" for k in SETTINGS_FIXED_KEYS}
        result["custom_exposes"] = []
        return result
    result = {k: settings.get(k, "") for k in SETTINGS_FIXED_KEYS}
    result["custom_exposes"] = settings.get("custom_exposes", [])
    return result

@api_router.put("/admin/settings/downloads")
async def update_download_settings(settings: dict, admin: str = Depends(verify_admin)):
    """Update download URL settings (Admin only)"""
    update_data = {k: settings.get(k, "") for k in SETTINGS_FIXED_KEYS}
    update_data["custom_exposes"] = settings.get("custom_exposes", [])
    update_data["key"] = "downloads"
    await db.site_settings.update_one(
        {"key": "downloads"},
        {"$set": update_data},
        upsert=True
    )
    result = {k: update_data[k] for k in SETTINGS_FIXED_KEYS}
    result["custom_exposes"] = update_data["custom_exposes"]
    return result


# =============================================
# HOMEPAGE CONTENT SETTINGS
# =============================================

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

@api_router.get("/settings/homepage")
async def get_homepage_settings():
    """Get homepage content settings (public)"""
    settings = await db.site_settings.find_one({"key": "homepage"}, {"_id": 0})
    if not settings:
        return HOMEPAGE_DEFAULTS
    result = {}
    for k, v in HOMEPAGE_DEFAULTS.items():
        saved = settings.get(k)
        # Use default if not saved or empty string
        if saved is None or saved == "":
            result[k] = v
        else:
            result[k] = saved
    return result

@api_router.put("/admin/settings/homepage")
async def update_homepage_settings(settings: dict, admin: str = Depends(verify_admin)):
    """Update homepage content settings (Admin only)"""
    update_data = {}
    for k in HOMEPAGE_DEFAULTS:
        if k in settings:
            update_data[k] = settings[k]
        else:
            update_data[k] = HOMEPAGE_DEFAULTS[k]
    update_data["key"] = "homepage"
    await db.site_settings.update_one(
        {"key": "homepage"},
        {"$set": update_data},
        upsert=True
    )
    return {k: update_data[k] for k in HOMEPAGE_DEFAULTS}


# =============================================
# LEGAL PAGES (Impressum & Datenschutz)
# =============================================

@api_router.get("/settings/legal/{page_type}")
async def get_legal_page(page_type: str):
    """Get legal page content (public). page_type: impressum or datenschutz"""
    if page_type not in ("impressum", "datenschutz"):
        raise HTTPException(status_code=404, detail="Page not found")
    doc = await db.site_settings.find_one({"key": f"legal_{page_type}"}, {"_id": 0})
    if not doc or not doc.get("content"):
        return {"content": ""}
    return {"content": doc["content"]}

@api_router.put("/admin/settings/legal/{page_type}")
async def update_legal_page(page_type: str, data: dict, admin: str = Depends(verify_admin)):
    """Update legal page content (Admin only)"""
    if page_type not in ("impressum", "datenschutz"):
        raise HTTPException(status_code=404, detail="Page not found")
    content = data.get("content", "")
    await db.site_settings.update_one(
        {"key": f"legal_{page_type}"},
        {"$set": {"key": f"legal_{page_type}", "content": content}},
        upsert=True
    )
    return {"content": content}



# =============================================
# IMAGE UPLOAD ENDPOINT (Admin only)
# =============================================

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
MAX_IMAGE_DIMENSION = 1920  # Max width/height for optimization

def optimize_image(image_data: bytes, max_dimension: int = MAX_IMAGE_DIMENSION, quality: int = 85) -> bytes:
    """Optimize image: resize if too large, convert to WebP for better compression"""
    img = Image.open(io.BytesIO(image_data))
    
    # Convert to RGB if necessary (for PNG with transparency)
    if img.mode in ('RGBA', 'P'):
        # Create white background
        background = Image.new('RGB', img.size, (255, 255, 255))
        if img.mode == 'RGBA':
            background.paste(img, mask=img.split()[3])
        else:
            background.paste(img)
        img = background
    elif img.mode != 'RGB':
        img = img.convert('RGB')
    
    # Resize if too large
    width, height = img.size
    if width > max_dimension or height > max_dimension:
        ratio = min(max_dimension / width, max_dimension / height)
        new_size = (int(width * ratio), int(height * ratio))
        img = img.resize(new_size, Image.Resampling.LANCZOS)
    
    # Save as WebP for better compression
    output = io.BytesIO()
    img.save(output, format='WEBP', quality=quality, optimize=True)
    return output.getvalue()


@api_router.post("/admin/upload")
async def upload_image(
    file: UploadFile = File(...),
    admin: str = Depends(verify_admin)
):
    """Upload and optimize an image (Admin only)"""
    # Validate file extension
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400, 
            detail=f"Dateityp nicht erlaubt. Erlaubt: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Read file
    content = await file.read()
    
    # Validate file size
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400, 
            detail=f"Datei zu groß. Maximum: {MAX_FILE_SIZE // (1024*1024)}MB"
        )
    
    try:
        # Optimize image
        optimized = optimize_image(content)
        
        # Generate unique filename
        unique_id = str(uuid.uuid4())[:8]
        original_name = Path(file.filename).stem
        # Clean filename
        clean_name = "".join(c for c in original_name if c.isalnum() or c in "-_")[:30]
        filename = f"{clean_name}_{unique_id}.webp"
        
        # Save file
        file_path = UPLOAD_DIR / filename
        with open(file_path, "wb") as f:
            f.write(optimized)
        
        # Return URL path
        url = f"/uploads/{filename}"
        
        # Calculate size reduction
        original_size = len(content)
        optimized_size = len(optimized)
        reduction = ((original_size - optimized_size) / original_size) * 100 if original_size > 0 else 0
        
        return {
            "url": url,
            "filename": filename,
            "originalSize": original_size,
            "optimizedSize": optimized_size,
            "reduction": f"{reduction:.1f}%"
        }
        
    except Exception as e:
        logger.error(f"Image upload failed: {e}")
        raise HTTPException(status_code=500, detail=f"Bildverarbeitung fehlgeschlagen: {str(e)}")


@api_router.get("/admin/uploads")
async def list_uploads(admin: str = Depends(verify_admin)):
    """List all uploaded images (Admin only)"""
    uploads = []
    for file_path in UPLOAD_DIR.glob("*"):
        if file_path.suffix.lower() in ALLOWED_EXTENSIONS or file_path.suffix.lower() == ".webp":
            stat = file_path.stat()
            uploads.append({
                "filename": file_path.name,
                "url": f"/uploads/{file_path.name}",
                "size": stat.st_size,
                "created": datetime.fromtimestamp(stat.st_ctime).isoformat()
            })
    
    # Sort by creation date, newest first
    uploads.sort(key=lambda x: x["created"], reverse=True)
    return uploads


@api_router.delete("/admin/uploads/{filename}")
async def delete_upload(filename: str, admin: str = Depends(verify_admin)):
    """Delete an uploaded image (Admin only)"""
    file_path = UPLOAD_DIR / filename
    
    # Security check - prevent directory traversal
    if ".." in filename or "/" in filename:
        raise HTTPException(status_code=400, detail="Ungültiger Dateiname")
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Datei nicht gefunden")
    
    file_path.unlink()
    return {"message": "Datei gelöscht", "filename": filename}


@api_router.get("/admin/verify")
async def verify_admin_access(admin: str = Depends(verify_admin)):
    """Verify admin credentials"""
    return {"authenticated": True, "username": admin}


@api_router.post("/admin/seed-articles")
async def seed_articles(admin: str = Depends(verify_admin)):
    """Seed the database with initial articles (Admin only)"""
    # Check if articles already exist
    count = await db.articles.count_documents({})
    if count > 0:
        return {"message": f"Database already contains {count} articles. Skipping seed.", "seeded": False}
    
    # The pillar articles data will be sent from frontend during initial setup
    return {"message": "Use POST /api/admin/seed-articles-data with articles array to seed", "seeded": False}


@api_router.post("/admin/seed-articles-data")
async def seed_articles_data(articles: List[ArticleCreate], admin: str = Depends(verify_admin)):
    """Seed the database with provided articles data (Admin only)"""
    # Clear existing articles
    await db.articles.delete_many({})
    
    # Insert all articles with IDs
    for i, article in enumerate(articles):
        article_dict = article.model_dump()
        article_dict["id"] = 101 + i
        await db.articles.insert_one(article_dict)
    
    return {"message": f"Successfully seeded {len(articles)} articles", "seeded": True, "count": len(articles)}


# =============================================
# COMMENT ENDPOINTS (Public & Admin)
# =============================================

@api_router.get("/comments/article/{article_id}")
async def get_approved_comments(article_id: int):
    """Get all approved comments for an article (Public)"""
    comments = await db.comments.find(
        {"articleId": article_id, "status": "approved"},
        {"_id": 0, "email": 0}  # Don't expose email publicly
    ).sort("createdAt", -1).to_list(100)
    return comments


@api_router.get("/comments/slug/{article_slug}")
async def get_approved_comments_by_slug(article_slug: str):
    """Get all approved comments for an article by slug (Public)"""
    comments = await db.comments.find(
        {"articleSlug": article_slug, "status": "approved"},
        {"_id": 0, "email": 0}  # Don't expose email publicly
    ).sort("createdAt", -1).to_list(100)
    return comments


@api_router.post("/comments")
async def create_comment(comment: CommentCreate, background_tasks: BackgroundTasks):
    """Create a new comment (requires moderation)"""
    # Get article info for email notification
    article = await db.articles.find_one({"id": comment.articleId}, {"title": 1})
    article_title = article.get("title", "Unknown Article") if article else "Unknown Article"
    
    comment_id = str(uuid.uuid4())
    comment_dict = {
        "id": comment_id,
        **comment.model_dump(),
        "status": "pending",  # pending, approved, rejected
        "createdAt": datetime.now(timezone.utc).isoformat()
    }
    
    await db.comments.insert_one(comment_dict)
    
    # Send notification email in background
    background_tasks.add_task(send_notification_email, comment_dict, article_title)
    
    return {"message": "Comment submitted for moderation", "id": comment_id}


@api_router.get("/admin/comments")
async def get_all_comments(
    status: Optional[str] = None,
    admin: str = Depends(verify_admin)
):
    """Get all comments with optional status filter (Admin only)"""
    query = {}
    if status:
        query["status"] = status
    
    comments = await db.comments.find(query, {"_id": 0}).sort("createdAt", -1).to_list(500)
    
    # Enrich with article titles
    for comment in comments:
        article = await db.articles.find_one({"id": comment.get("articleId")}, {"title": 1})
        comment["articleTitle"] = article.get("title", "Unknown") if article else "Unknown"
    
    return comments


@api_router.get("/admin/comments/stats")
async def get_comments_stats(admin: str = Depends(verify_admin)):
    """Get comment statistics (Admin only)"""
    total = await db.comments.count_documents({})
    pending = await db.comments.count_documents({"status": "pending"})
    approved = await db.comments.count_documents({"status": "approved"})
    rejected = await db.comments.count_documents({"status": "rejected"})
    
    return {
        "total": total,
        "pending": pending,
        "approved": approved,
        "rejected": rejected
    }


@api_router.put("/admin/comments/{comment_id}/approve")
async def approve_comment(comment_id: str, admin: str = Depends(verify_admin)):
    """Approve a comment (Admin only)"""
    result = await db.comments.update_one(
        {"id": comment_id},
        {"$set": {"status": "approved"}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Comment not found")
    return {"message": "Comment approved", "id": comment_id}


@api_router.put("/admin/comments/{comment_id}/reject")
async def reject_comment(comment_id: str, admin: str = Depends(verify_admin)):
    """Reject a comment (Admin only)"""
    result = await db.comments.update_one(
        {"id": comment_id},
        {"$set": {"status": "rejected"}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Comment not found")
    return {"message": "Comment rejected", "id": comment_id}


@api_router.delete("/admin/comments/{comment_id}")
async def delete_comment(comment_id: str, admin: str = Depends(verify_admin)):
    """Delete a comment (Admin only)"""
    result = await db.comments.delete_one({"id": comment_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Comment not found")
    return {"message": "Comment deleted", "id": comment_id}


# ============================================
# REGIONS API (Public + Admin)
# ============================================

@api_router.get("/regions")
async def get_all_regions():
    """Get all regions (Public)"""
    regions = await db.regions.find({}, {"_id": 0}).to_list(100)
    return regions


@api_router.get("/regions/{slug}")
async def get_region(slug: str):
    """Get a region by slug (Public)"""
    region = await db.regions.find_one({"slug": slug}, {"_id": 0})
    if not region:
        raise HTTPException(status_code=404, detail="Region not found")
    return region


@api_router.get("/admin/regions")
async def get_admin_regions(admin: str = Depends(verify_admin)):
    """Get all regions with full details (Admin only)"""
    regions = await db.regions.find({}, {"_id": 0}).to_list(100)
    return regions


@api_router.post("/admin/regions")
async def create_region(region: RegionCreate, admin: str = Depends(verify_admin)):
    """Create a new region (Admin only)"""
    # Check if slug already exists
    existing = await db.regions.find_one({"slug": region.slug})
    if existing:
        raise HTTPException(status_code=400, detail="Region with this slug already exists")
    
    region_dict = region.model_dump()
    region_dict["id"] = str(uuid.uuid4())
    region_dict["createdAt"] = datetime.now(timezone.utc).isoformat()
    region_dict["updatedAt"] = datetime.now(timezone.utc).isoformat()
    
    await db.regions.insert_one(region_dict)
    
    # Remove _id from response
    region_dict.pop("_id", None)
    return region_dict


@api_router.put("/admin/regions/{slug}")
async def update_region(slug: str, region_update: RegionUpdate, admin: str = Depends(verify_admin)):
    """Update a region (Admin only)"""
    update_data = {k: v for k, v in region_update.model_dump().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    update_data["updatedAt"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.regions.update_one(
        {"slug": slug},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Region not found")
    
    # Return updated region
    updated_region = await db.regions.find_one({"slug": slug}, {"_id": 0})
    return updated_region


@api_router.delete("/admin/regions/{slug}")
async def delete_region(slug: str, admin: str = Depends(verify_admin)):
    """Delete a region (Admin only)"""
    result = await db.regions.delete_one({"slug": slug})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Region not found")
    return {"message": "Region deleted", "slug": slug}


@api_router.post("/admin/regions/{slug}/apartments")
async def add_apartment_to_region(slug: str, apartment: RegionApartment, admin: str = Depends(verify_admin)):
    """Add an apartment to a region (Admin only)"""
    region = await db.regions.find_one({"slug": slug})
    if not region:
        raise HTTPException(status_code=404, detail="Region not found")
    
    apartment_dict = apartment.model_dump()
    apartment_dict["id"] = str(uuid.uuid4())
    
    await db.regions.update_one(
        {"slug": slug},
        {"$push": {"apartments": apartment_dict}}
    )
    
    return {"message": "Apartment added", "apartment": apartment_dict}


@api_router.delete("/admin/regions/{slug}/apartments/{apartment_id}")
async def remove_apartment_from_region(slug: str, apartment_id: str, admin: str = Depends(verify_admin)):
    """Remove an apartment from a region (Admin only)"""
    result = await db.regions.update_one(
        {"slug": slug},
        {"$pull": {"apartments": {"id": apartment_id}}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Region not found")
    
    return {"message": "Apartment removed", "apartment_id": apartment_id}


# =============================================
# PAGE CMS API (Public + Admin)
# =============================================

# Default page templates for initialization
DEFAULT_PAGES = {
    "home": {
        "title": "Home",
        "metaTitle": "EuroAdria - Investment & Business Beratung Adria",
        "metaDescription": "Professionelle Beratung für Investments, Business und Lifestyle an der Adria. Schwerpunkt Montenegro, Serbien und Balkan-Region.",
        "sections": [
            {
                "id": "hero",
                "type": "hero",
                "data": {
                    "title": "Investieren an der Adria",
                    "subtitle": "Ihr Partner für nachhaltige Investments in Montenegro & Serbien",
                    "ctaText": "Jetzt Beratung anfragen",
                    "ctaLink": "/contact"
                }
            },
            {
                "id": "why-balkan",
                "type": "cards",
                "title": "Warum Balkan statt EU?",
                "data": {
                    "cards": [
                        {"id": "1", "title": "Niedrige Steuern", "description": "Körperschaftssteuer nur 9% in Montenegro, 15% in Serbien", "icon": "percent"},
                        {"id": "2", "title": "EU-Beitritt", "description": "Montenegro und Serbien auf dem Weg in die EU - Wertsteigerungspotenzial", "icon": "flag"},
                        {"id": "3", "title": "Wachstumsmarkt", "description": "Tourismus wächst jährlich um 15-20%, Immobilienpreise steigen", "icon": "trending-up"},
                        {"id": "4", "title": "Strategische Lage", "description": "Tor zwischen Ost und West, neue Infrastrukturprojekte", "icon": "map-pin"}
                    ]
                }
            },
            {
                "id": "task-force",
                "type": "cards",
                "title": "Warum Task Force Adria?",
                "data": {
                    "cards": [
                        {"id": "1", "title": "Lokale Expertise", "description": "Unser Team lebt und arbeitet vor Ort", "icon": "users"},
                        {"id": "2", "title": "Rechtssicherheit", "description": "Due Diligence und rechtliche Begleitung inklusive", "icon": "shield"},
                        {"id": "3", "title": "Netzwerk", "description": "Direkter Zugang zu Off-Market Deals", "icon": "network"},
                        {"id": "4", "title": "Rundum-Service", "description": "Von der Suche bis zum Notar - alles aus einer Hand", "icon": "check-circle"}
                    ]
                }
            }
        ]
    },
    "team": {
        "title": "Über uns",
        "metaTitle": "Team - EuroAdria Investment Beratung",
        "metaDescription": "Lernen Sie unser erfahrenes Team kennen. Holger Kuhlmann und Milena Bubanja - Ihre Experten für Investments an der Adria.",
        "sections": [
            {
                "id": "hero",
                "type": "hero",
                "data": {
                    "title": "Unser Team",
                    "subtitle": "Erfahrung trifft lokale Expertise"
                }
            },
            {
                "id": "team-members",
                "type": "team",
                "data": {
                    "members": [
                        {
                            "id": "holger",
                            "name": "Holger Kuhlmann",
                            "title": "Berater & Leitung DACH",
                            "description": "Ich glaube daran, dass nachhaltige Projekte und solide Strukturen die beste Basis für langfristigen Erfolg sind.",
                            "image": "/holger-kuhlmann.jpg",
                            "email": "holger@euroadria.me"
                        },
                        {
                            "id": "milena",
                            "name": "Milena Bubanja",
                            "title": "Co-Founderin und Geschäftsführerin",
                            "subtitle": "Public Affairs und Balkan Relations",
                            "description": "Nachhaltige Ergebnisse entstehen dort, wo lokale Realität und europäische Standards sauber zusammengeführt werden.",
                            "image": "/milena-bubanja.jpg",
                            "email": "milena@euroadria.me"
                        }
                    ]
                }
            },
            {
                "id": "about-text",
                "type": "text",
                "title": "Unsere Mission",
                "content": "<p>EuroAdria wurde gegründet, um deutschsprachigen Investoren einen sicheren und professionellen Zugang zu den wachsenden Märkten Montenegros und Serbiens zu bieten.</p><p>Wir kombinieren deutsche Gründlichkeit mit lokalem Know-how und begleiten Sie von der ersten Idee bis zum erfolgreichen Abschluss.</p>"
            }
        ]
    },
    "contact": {
        "title": "Kontakt",
        "metaTitle": "Kontakt - EuroAdria Investment Beratung",
        "metaDescription": "Kontaktieren Sie uns für eine unverbindliche Erstberatung zu Investments in Montenegro und Serbien.",
        "sections": [
            {
                "id": "hero",
                "type": "hero",
                "data": {
                    "title": "Kontakt",
                    "subtitle": "Wir freuen uns auf Ihre Anfrage"
                }
            },
            {
                "id": "contact-info",
                "type": "contact",
                "data": {
                    "email": "info@euroadria.me",
                    "phone": "+382 69 123 456",
                    "address": "Podgorica, Montenegro",
                    "hours": "Mo-Fr: 9:00 - 18:00 Uhr"
                }
            }
        ]
    }
}


@api_router.get("/pages")
async def get_all_pages():
    """Get all pages (Public)"""
    pages = await db.pages.find({}, {"_id": 0}).to_list(100)
    return pages


@api_router.get("/pages/{slug}")
async def get_page(slug: str):
    """Get a page by slug (Public) - returns default if not in DB"""
    page = await db.pages.find_one({"slug": slug}, {"_id": 0})
    
    if not page:
        # Return default template if exists
        if slug in DEFAULT_PAGES:
            return {
                "slug": slug,
                "id": f"default-{slug}",
                **DEFAULT_PAGES[slug],
                "isDefault": True
            }
        raise HTTPException(status_code=404, detail="Page not found")
    
    return page


@api_router.get("/admin/pages")
async def get_admin_pages(admin: str = Depends(verify_admin)):
    """Get all pages with defaults (Admin only)"""
    pages = await db.pages.find({}, {"_id": 0}).to_list(100)
    
    # Add default pages that aren't in DB yet
    existing_slugs = {p["slug"] for p in pages}
    for slug, default_data in DEFAULT_PAGES.items():
        if slug not in existing_slugs:
            pages.append({
                "slug": slug,
                "id": f"default-{slug}",
                **default_data,
                "isDefault": True
            })
    
    return pages


@api_router.post("/admin/pages")
async def create_page(page: PageCreate, admin: str = Depends(verify_admin)):
    """Create a new page (Admin only)"""
    existing = await db.pages.find_one({"slug": page.slug})
    if existing:
        raise HTTPException(status_code=400, detail="Page with this slug already exists")
    
    page_dict = page.model_dump()
    page_dict["id"] = str(uuid.uuid4())
    page_dict["updatedAt"] = datetime.now(timezone.utc).isoformat()
    
    await db.pages.insert_one(page_dict)
    page_dict.pop("_id", None)
    
    return page_dict


@api_router.put("/admin/pages/{slug}")
async def update_page(slug: str, page_update: PageUpdate, admin: str = Depends(verify_admin)):
    """Update or create a page (Admin only) - upsert from default"""
    update_data = {k: v for k, v in page_update.model_dump().items() if v is not None}
    update_data["updatedAt"] = datetime.now(timezone.utc).isoformat()
    
    existing = await db.pages.find_one({"slug": slug})
    
    if not existing:
        # Create from default template
        if slug in DEFAULT_PAGES:
            new_page = {
                "slug": slug,
                "id": str(uuid.uuid4()),
                **DEFAULT_PAGES[slug],
                **update_data
            }
            await db.pages.insert_one(new_page)
            new_page.pop("_id", None)
            return new_page
        else:
            raise HTTPException(status_code=404, detail="Page not found")
    
    await db.pages.update_one({"slug": slug}, {"$set": update_data})
    
    updated = await db.pages.find_one({"slug": slug}, {"_id": 0})
    return updated


@api_router.delete("/admin/pages/{slug}")
async def delete_page(slug: str, admin: str = Depends(verify_admin)):
    """Delete a page (resets to default if available) (Admin only)"""
    result = await db.pages.delete_one({"slug": slug})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Page not found or is default")
    
    return {"message": "Page deleted (reset to default)", "slug": slug}


# =============================================
# INVESTMENT INTELLIGENCE API
# =============================================

from investment_models import (
    LocationBase, LocationCreate, LocationUpdate, Location,
    InfrastructureProjectBase, InfrastructureProjectCreate, InfrastructureProjectUpdate, InfrastructureProject,
    OpportunityZoneBase, OpportunityZoneCreate, OpportunityZoneUpdate, OpportunityZone,
    ROICalculation, ROIResult,
    calculate_investment_score, calculate_roi,
    SEED_LOCATIONS, SEED_INFRASTRUCTURE, SEED_ZONES
)
import math


def calculate_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance between two points using Haversine formula"""
    R = 6371  # Earth's radius in km
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)
    
    a = math.sin(delta_lat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    
    return R * c


async def calculate_infrastructure_boost(lat: float, lng: float) -> float:
    """Calculate infrastructure score boost based on nearby projects"""
    projects = await db.infrastructure_projects.find({}, {"_id": 0}).to_list(1000)
    
    boost = 0
    for project in projects:
        distance = calculate_distance_km(lat, lng, project["latitude"], project["longitude"])
        if distance <= project["impact_radius_km"]:
            # Closer projects have more impact
            impact_factor = 1 - (distance / project["impact_radius_km"])
            
            # Status-based multiplier
            status_multiplier = {
                "built": 1.0,
                "modernization": 0.8,
                "construction": 0.6,
                "planned": 0.3
            }.get(project["status"], 0.5)
            
            # Type-based base boost
            type_boost = {
                "airport": 8,
                "port": 7,
                "rail": 6,
                "road": 5,
                "clinic": 4
            }.get(project["type"], 5)
            
            boost += type_boost * impact_factor * status_multiplier
    
    return min(boost, 20)  # Cap at 20 points


# ---- LOCATIONS API ----

@api_router.get("/locations")
async def get_all_locations():
    """Get all investment locations with calculated scores"""
    locations = await db.locations.find({}, {"_id": 0}).to_list(1000)
    
    # Recalculate scores for each location
    for loc in locations:
        infra_boost = await calculate_infrastructure_boost(loc["latitude"], loc["longitude"])
        adjusted_infra = min(loc["infrastructure_score"] + infra_boost, 100)
        
        loc["investment_score"] = calculate_investment_score(
            adjusted_infra,
            loc["tourism_growth"],
            loc["rental_yield"],
            loc["price_growth"]
        )
        loc["infrastructure_boost"] = round(infra_boost, 1)
    
    # Sort by investment score
    locations.sort(key=lambda x: x["investment_score"], reverse=True)
    
    return locations


@api_router.get("/locations/{city}")
async def get_location(city: str):
    """Get a specific location by city name"""
    location = await db.locations.find_one(
        {"city": {"$regex": f"^{city}$", "$options": "i"}},
        {"_id": 0}
    )
    
    if not location:
        raise HTTPException(status_code=404, detail="Location not found")
    
    # Calculate infrastructure boost
    infra_boost = await calculate_infrastructure_boost(location["latitude"], location["longitude"])
    adjusted_infra = min(location["infrastructure_score"] + infra_boost, 100)
    
    location["investment_score"] = calculate_investment_score(
        adjusted_infra,
        location["tourism_growth"],
        location["rental_yield"],
        location["price_growth"]
    )
    location["infrastructure_boost"] = round(infra_boost, 1)
    
    # Get related blog articles
    related_articles = await db.articles.find(
        {"$or": [
            {"title": {"$regex": city, "$options": "i"}},
            {"content": {"$regex": city, "$options": "i"}},
            {"cluster": {"$regex": location["country"], "$options": "i"}}
        ]},
        {"_id": 0, "id": 1, "title": 1, "slug": 1, "excerpt": 1, "image": 1}
    ).limit(5).to_list(5)
    
    location["related_articles"] = related_articles
    
    return location


@api_router.get("/locations/compare/{cities}")
async def compare_locations(cities: str):
    """Compare multiple locations (comma-separated city names)"""
    city_list = [c.strip() for c in cities.split(",")]
    
    comparisons = []
    for city in city_list:
        location = await db.locations.find_one(
            {"city": {"$regex": f"^{city}$", "$options": "i"}},
            {"_id": 0}
        )
        if location:
            infra_boost = await calculate_infrastructure_boost(location["latitude"], location["longitude"])
            adjusted_infra = min(location["infrastructure_score"] + infra_boost, 100)
            
            location["investment_score"] = calculate_investment_score(
                adjusted_infra,
                location["tourism_growth"],
                location["rental_yield"],
                location["price_growth"]
            )
            comparisons.append(location)
    
    return comparisons


@api_router.post("/admin/locations")
async def create_location(location: LocationCreate, admin: str = Depends(verify_admin)):
    """Create a new investment location"""
    existing = await db.locations.find_one({"city": location.city})
    if existing:
        raise HTTPException(status_code=400, detail="Location already exists")
    
    loc_dict = location.model_dump()
    loc_dict["id"] = str(uuid.uuid4())
    loc_dict["investment_score"] = calculate_investment_score(
        location.infrastructure_score,
        location.tourism_growth,
        location.rental_yield,
        location.price_growth
    )
    loc_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.locations.insert_one(loc_dict)
    loc_dict.pop("_id", None)
    
    return loc_dict


@api_router.put("/admin/locations/{city}")
async def update_location(city: str, update: LocationUpdate, admin: str = Depends(verify_admin)):
    """Update an investment location"""
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.locations.update_one(
        {"city": {"$regex": f"^{city}$", "$options": "i"}},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Location not found")
    
    updated = await db.locations.find_one(
        {"city": {"$regex": f"^{city}$", "$options": "i"}},
        {"_id": 0}
    )
    
    # Recalculate score
    updated["investment_score"] = calculate_investment_score(
        updated["infrastructure_score"],
        updated["tourism_growth"],
        updated["rental_yield"],
        updated["price_growth"]
    )
    
    return updated


@api_router.delete("/admin/locations/{city}")
async def delete_location(city: str, admin: str = Depends(verify_admin)):
    """Delete an investment location"""
    result = await db.locations.delete_one({"city": {"$regex": f"^{city}$", "$options": "i"}})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Location not found")
    return {"message": "Location deleted", "city": city}


# ---- INFRASTRUCTURE API ----

@api_router.get("/infrastructure")
async def get_all_infrastructure():
    """Get all infrastructure projects"""
    projects = await db.infrastructure_projects.find({}, {"_id": 0}).to_list(1000)
    return projects


@api_router.get("/infrastructure/{project_id}")
async def get_infrastructure_project(project_id: str):
    """Get a specific infrastructure project"""
    project = await db.infrastructure_projects.find_one({"id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@api_router.post("/admin/infrastructure")
async def create_infrastructure(project: InfrastructureProjectCreate, admin: str = Depends(verify_admin)):
    """Create a new infrastructure project"""
    proj_dict = project.model_dump()
    proj_dict["id"] = str(uuid.uuid4())
    proj_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.infrastructure_projects.insert_one(proj_dict)
    proj_dict.pop("_id", None)
    
    return proj_dict


@api_router.put("/admin/infrastructure/{project_id}")
async def update_infrastructure(project_id: str, update: InfrastructureProjectUpdate, admin: str = Depends(verify_admin)):
    """Update an infrastructure project"""
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    result = await db.infrastructure_projects.update_one({"id": project_id}, {"$set": update_data})
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    
    updated = await db.infrastructure_projects.find_one({"id": project_id}, {"_id": 0})
    return updated


@api_router.delete("/admin/infrastructure/{project_id}")
async def delete_infrastructure(project_id: str, admin: str = Depends(verify_admin)):
    """Delete an infrastructure project"""
    result = await db.infrastructure_projects.delete_one({"id": project_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"message": "Project deleted", "id": project_id}


# ---- OPPORTUNITY ZONES API ----

@api_router.get("/zones")
async def get_all_zones():
    """Get all opportunity zones"""
    zones = await db.opportunity_zones.find({}, {"_id": 0}).to_list(1000)
    return zones


@api_router.get("/zones/{zone_id}")
async def get_zone(zone_id: str):
    """Get a specific opportunity zone"""
    zone = await db.opportunity_zones.find_one({"id": zone_id}, {"_id": 0})
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    return zone


@api_router.post("/admin/zones")
async def create_zone(zone: OpportunityZoneCreate, admin: str = Depends(verify_admin)):
    """Create a new opportunity zone"""
    zone_dict = zone.model_dump()
    zone_dict["id"] = str(uuid.uuid4())
    
    await db.opportunity_zones.insert_one(zone_dict)
    zone_dict.pop("_id", None)
    
    return zone_dict


@api_router.put("/admin/zones/{zone_id}")
async def update_zone(zone_id: str, update: OpportunityZoneUpdate, admin: str = Depends(verify_admin)):
    """Update an opportunity zone"""
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    result = await db.opportunity_zones.update_one({"id": zone_id}, {"$set": update_data})
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Zone not found")
    
    updated = await db.opportunity_zones.find_one({"id": zone_id}, {"_id": 0})
    return updated


@api_router.delete("/admin/zones/{zone_id}")
async def delete_zone(zone_id: str, admin: str = Depends(verify_admin)):
    """Delete an opportunity zone"""
    result = await db.opportunity_zones.delete_one({"id": zone_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Zone not found")
    return {"message": "Zone deleted", "id": zone_id}


# ---- ROI CALCULATOR API ----

@api_router.post("/calculator/roi", response_model=ROIResult)
async def calculate_property_roi(calc: ROICalculation):
    """Calculate ROI for a property investment"""
    return calculate_roi(calc)


# ---- DASHBOARD API ----

@api_router.get("/dashboard/stats")
async def get_dashboard_stats():
    """Get investment dashboard statistics"""
    locations = await db.locations.find({}, {"_id": 0}).to_list(1000)
    projects = await db.infrastructure_projects.find({}, {"_id": 0}).to_list(1000)
    zones = await db.opportunity_zones.find({}, {"_id": 0}).to_list(1000)
    
    # Recalculate scores
    for loc in locations:
        infra_boost = await calculate_infrastructure_boost(loc["latitude"], loc["longitude"])
        adjusted_infra = min(loc["infrastructure_score"] + infra_boost, 100)
        loc["investment_score"] = calculate_investment_score(
            adjusted_infra,
            loc["tourism_growth"],
            loc["rental_yield"],
            loc["price_growth"]
        )
    
    # Sort for rankings
    by_score = sorted(locations, key=lambda x: x["investment_score"], reverse=True)
    by_yield = sorted(locations, key=lambda x: x["rental_yield"], reverse=True)
    by_growth = sorted(locations, key=lambda x: x["price_growth"], reverse=True)
    
    # Filter new infrastructure projects
    new_projects = [p for p in projects if p["status"] in ["construction", "planned"]]
    
    return {
        "total_locations": len(locations),
        "total_infrastructure": len(projects),
        "total_zones": len(zones),
        "top_investment": by_score[:5],
        "highest_yield": by_yield[:5],
        "strongest_growth": by_growth[:5],
        "new_infrastructure": new_projects[:5],
        "countries": {
            "Montenegro": len([l for l in locations if l["country"] == "Montenegro"]),
            "Serbien": len([l for l in locations if l["country"] == "Serbien"])
        }
    }


# ---- SEED DATA API ----

@api_router.post("/admin/seed-investment-data")
async def seed_investment_data(admin: str = Depends(verify_admin)):
    """Seed the database with initial investment data"""
    
    # Seed Locations
    loc_count = await db.locations.count_documents({})
    if loc_count == 0:
        for loc in SEED_LOCATIONS:
            loc_dict = loc.copy()
            loc_dict["id"] = str(uuid.uuid4())
            loc_dict["investment_score"] = calculate_investment_score(
                loc["infrastructure_score"],
                loc["tourism_growth"],
                loc["rental_yield"],
                loc["price_growth"]
            )
            loc_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
            await db.locations.insert_one(loc_dict)
    
    # Seed Infrastructure
    infra_count = await db.infrastructure_projects.count_documents({})
    if infra_count == 0:
        for proj in SEED_INFRASTRUCTURE:
            proj_dict = proj.copy()
            proj_dict["id"] = str(uuid.uuid4())
            proj_dict["created_at"] = datetime.now(timezone.utc).isoformat()
            await db.infrastructure_projects.insert_one(proj_dict)
    
    # Seed Zones
    zone_count = await db.opportunity_zones.count_documents({})
    if zone_count == 0:
        for zone in SEED_ZONES:
            zone_dict = zone.copy()
            zone_dict["id"] = str(uuid.uuid4())
            await db.opportunity_zones.insert_one(zone_dict)
    
    return {
        "message": "Investment data seeded successfully",
        "locations": len(SEED_LOCATIONS),
        "infrastructure": len(SEED_INFRASTRUCTURE),
        "zones": len(SEED_ZONES)
    }


# ─── File Upload (Object Storage) ───────────────────────────────────────
@api_router.post("/admin/storage/upload")
async def admin_upload_file(file: UploadFile = File(...), admin: str = Depends(verify_admin)):
    """Upload image or file to object storage, returns public serve URL"""
    allowed_ext = {"jpg", "jpeg", "png", "gif", "webp", "pdf", "csv", "txt"}
    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if ext not in allowed_ext:
        raise HTTPException(status_code=400, detail=f"Dateityp .{ext} nicht erlaubt")
    
    mime_map = {
        "jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png",
        "gif": "image/gif", "webp": "image/webp", "pdf": "application/pdf",
        "csv": "text/csv", "txt": "text/plain"
    }
    content_type = file.content_type or mime_map.get(ext, "application/octet-stream")
    file_id = str(uuid.uuid4())
    storage_path = f"{APP_NAME}/uploads/{file_id}.{ext}"
    
    data = await file.read()
    result = put_object(storage_path, data, content_type)
    
    await db.uploaded_files.insert_one({
        "file_id": file_id,
        "storage_path": result["path"],
        "original_filename": file.filename,
        "content_type": content_type,
        "size": result.get("size", len(data)),
        "ext": ext,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {
        "success": True,
        "file_id": file_id,
        "filename": file.filename,
        "url": f"/api/files/{result['path']}",
        "content_type": content_type
    }

@api_router.get("/files/{path:path}")
async def serve_file(path: str):
    """Serve uploaded file from object storage"""
    record = await db.uploaded_files.find_one({"storage_path": path}, {"_id": 0})
    if not record:
        raise HTTPException(status_code=404, detail="Datei nicht gefunden")
    data, ct = get_object(path)
    return Response(content=data, media_type=record.get("content_type", ct))



# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

@app.on_event("startup")
async def startup_storage():
    try:
        init_storage()
        logger.info("Object storage initialized")
    except Exception as e:
        logger.warning(f"Object storage init deferred: {e}")