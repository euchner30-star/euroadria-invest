# EuroAdria Investment Intelligence Platform — PRD

## Original Problem Statement
Professional "Investment Intelligence Platform" for the Balkan region with full CMS. Decoupled architecture (React + FastAPI + MongoDB Atlas), hosted on Render. Features: ROI/Simulation calculator, dynamic location profiles, CRM Kanban pipeline, AEO-optimized blog, branded PDF Exposé generation, custom Analytics, CMS admin panel, and targeted A/B tested landing pages for US/CA investors.

## Tech Stack
- **Frontend:** React 19 (Suspense/lazy routing), TailwindCSS
- **Backend:** FastAPI, Motor (async MongoDB), pillow-heif (iOS)
- **Database:** MongoDB Atlas (GridFS for chunked file/image storage)
- **Email:** Resend API
- **Hosting:** Render (ephemeral storage — all files in GridFS)

## Completed Features
- Performance & Code Splitting (React Suspense/lazy, 404 page, Error Boundaries)
- Reddit/Quora Social Tracking
- SEO: Hreflang Geo-Targeting, DSGVO-compliant GA4
- Strict Security Headers
- ShareButtons (WhatsApp/X/LinkedIn auto-inject teaser + hashtags)
- Whitepaper Landing Page + Lead-Gate + YouTube autoplay thank-you
- GridFS Migration (PDFs + images)
- iOS HEIC Upload support
- Legal Advertorial Compliance (BurdaForward)
- US Landing Pages A/B Test (`/us` light + `/usca` dark)
- US Strategy Brief PDF upload (17.5MB, chunked in MongoDB) — 2026-06-11

## Pending / In Progress
- [BLOCKED] VSL Video for `/us` and `/usca` (waiting on user)
- [USER VERIFY] `/usca` dark-theme design
- [USER VERIFY] X-Frame-Options SAMEORIGIN in Render

## Upcoming (P1)
- Apartment-Listing Funktionalität (real DB data integration)
- Video Background for Hero section
- Podcast-Integration

## Backlog (P2)
- Template-Speichern im PDF Generator
- Google Docs Import via URL

## Key Architecture Notes
- All media stored in MongoDB GridFS (no local disk on Render)
- PDFs >14MB base64 are chunked into `pdf_chunks` collection
- Admin credentials: HTTP Basic Auth
- Legal: Never use "berichten"/"referenziert" with news outlets — must say "Advertorial"/"Anzeige"
- Do NOT add `emergentintegrations` to requirements.txt (breaks Render build)
