from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, BackgroundTasks, UploadFile, File
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from fastapi.staticfiles import StaticFiles
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


ROOT_DIR = Path(__file__).parent
UPLOAD_DIR = ROOT_DIR.parent / "frontend" / "public" / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

load_dotenv(ROOT_DIR / '.env')

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
SMTP_HOST = os.environ.get('SMTP_HOST', 'smtp.gmail.com')
SMTP_PORT = int(os.environ.get('SMTP_PORT', '587'))
SMTP_USER = os.environ.get('SMTP_USER', '')
SMTP_PASSWORD = os.environ.get('SMTP_PASSWORD', '')

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


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
                
                <a href="https://page-builder-dev-1.preview.emergentagent.com/admin" 
                   style="display: inline-block; margin-top: 20px; padding: 12px 24px; background-color: #D4AF37; color: #002147; text-decoration: none; border-radius: 5px; font-weight: bold;">
                    Zum Admin-Panel
                </a>
            </div>
        </body>
        </html>
        """
        
        msg.attach(MIMEText(html_content, 'html'))
        
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.send_message(msg)
        
        logger.info(f"Notification email sent for comment by {comment_data['name']}")
    except Exception as e:
        logger.error(f"Failed to send notification email: {e}")

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

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
    articles = await db.articles.find(query, BLOG_LIST_FIELDS).skip(skip).limit(limit).to_list(limit)
    
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
    
    cursor = db.articles.find(query, {"_id": 0})
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
                            "title": "Geschäftsführer & Senior Berater",
                            "description": "Über 20 Jahre Erfahrung in internationaler Unternehmensberatung. Spezialisiert auf Markteintrittsstrategien und M&A in Südosteuropa.",
                            "image": "/holger-kuhlmann.jpg",
                            "email": "holger@euroadria.me"
                        },
                        {
                            "id": "milena",
                            "name": "Milena Bubanja",
                            "title": "Partnerin & Lokale Expertin",
                            "description": "Gebürtige Montenegrinerin mit juristischem Hintergrund. Expertin für Immobilienrecht und Unternehmensgründungen in Montenegro.",
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