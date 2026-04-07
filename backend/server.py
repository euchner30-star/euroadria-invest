"""
EuroAdria Corporate Solutions — Backend Entry Point
Slim server that imports all route modules.
"""
from fastapi import FastAPI, APIRouter
from fastapi.staticfiles import StaticFiles
from starlette.middleware.cors import CORSMiddleware
import os
import asyncio

from core import client, logger, UPLOAD_DIR
from emails import followup_email_loop

from routes.analytics import router as analytics_router
from routes.articles import router as articles_router
from routes.comments import router as comments_router
from routes.contact import router as contact_router
from routes.crm import router as crm_router
from routes.events import router as events_router
from routes.investment import router as investment_router
from routes.newsletter import router as newsletter_router
from routes.pages import router as pages_router
from routes.regions import router as regions_router
from routes.settings import router as settings_router
from routes.uploads import router as uploads_router
from routes.translate import router as translate_router
from routes.youtube import router as youtube_router

app = FastAPI()

# ── CORS ────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', 'https://euroadria.me,https://euroadria.me').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── API Router (all routes under /api) ──────────────────────────────────
api_router = APIRouter(prefix="/api")


@api_router.get("/health")
async def health_check():
    try:
        await client.admin.command('ping')
        return {"status": "ok", "db": "connected"}
    except Exception:
        return {"status": "ok", "db": "reconnecting"}


@api_router.get("/")
async def root():
    return {"message": "Hello World"}


# Include all route modules
api_router.include_router(analytics_router)
api_router.include_router(articles_router)
api_router.include_router(comments_router)
api_router.include_router(contact_router)
api_router.include_router(crm_router)
api_router.include_router(events_router)
api_router.include_router(investment_router)
api_router.include_router(newsletter_router)
api_router.include_router(pages_router)
api_router.include_router(regions_router)
api_router.include_router(settings_router)
api_router.include_router(uploads_router)
api_router.include_router(translate_router)
api_router.include_router(youtube_router)

app.include_router(api_router)

# ── Static files ────────────────────────────────────────────────────────
if UPLOAD_DIR.exists():
    app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

# ── Lifecycle events ────────────────────────────────────────────────────

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(followup_email_loop())
    logger.info("Server started - Object storage will init on first use")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
