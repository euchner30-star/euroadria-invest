# EuroAdria Investment Intelligence Platform - PRD

## Original Problem Statement
Professional "Investment Intelligence Platform" for the Balkan region with full CMS. Decoupled architecture (React + FastAPI + MongoDB Atlas), hosted on Render.

## Tech Stack
- **Frontend:** React 19 (Suspense/lazy), TailwindCSS, i18n (EN default, DE switchable)
- **Backend:** FastAPI, Motor (async MongoDB), pillow-heif (iOS)
- **Database:** MongoDB Atlas (GridFS for chunked file/image storage)
- **Email:** Resend API
- **Tracking:** GTM (GTM-5D5FBKQ3), GA4 (G-KZK813E3BS + G-DQWDTYG7NX), Meta Pixel (2212587192833639)
- **Hosting:** Render (ephemeral storage - all files in GridFS)

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
- US Strategy Brief PDF upload (17.5MB, chunked in MongoDB)
- PDF Email via Resend `path` URL (memory-safe)
- PDF Status Indicator in Admin Panel
- English email wrapper for US leads
- Analytics Dashboard: 365 Days + All Time view
- `/usca` bottom section readability improved
- Google Tag Manager integration (DSGVO-compliant, admin-configurable)
- Meta Pixel with Lead conversion tracking on ALL 7 forms
- Dual GA4 properties
- Datenschutzerklaerung DSGVO-updated (GTM, GA4, Meta, Resend, Cookie-Consent)
- Default language: English (with DE/EN switcher in Header + Mobile)
- Complete English translation: ALL pages, components, DB content
- DB Migration endpoint `/api/settings/migrate-en-euroadria2025go`
- Expose requests routed to /api/leads with proper expose_name
- CSV Export: All leads, UTF-8 BOM, English headers
- Analytics Dashboard labels translated to English
- Long em-dashes removed from all visible text

## Pending / In Progress
- [BLOCKED] VSL Video for `/us` and `/usca` (waiting on user)
- [BLOCKED] TikTok + LinkedIn Pixel IDs (waiting on Holger)

## TODO (P1 - Next)
- CRM Email Tool: Send emails with attachments directly from pipeline, mark leads as qualified
- Lead Reactivation: Identify dead leads (7+ days no response), WhatsApp group invitation workflow

## Upcoming (P1)
- Apartment-Listing Funktionalitat (real DB data)
- Video Background for Hero section
- Podcast-Integration

## Backlog (P2)
- Template-Speichern im PDF Generator
- Google Docs Import via URL

## Key Architecture Notes
- All media stored in MongoDB GridFS (no local disk on Render)
- PDFs >14MB base64 are chunked into `pdf_chunks` collection
- PDF email attachments use Resend `path` URL to avoid 512MB Render OOM
- Both `/us` and `/usca` share same PDF key `pdf_us_strategy_brief`
- Language default: English, saved in localStorage, switchable DE/EN
- All tracking loads ONLY after cookie consent (DSGVO)
- Admin panel stays in German
- Legal: Never use "berichten"/"referenziert" with news outlets
- Do NOT add `emergentintegrations` to requirements.txt

## Key API Endpoints
- `GET /api/settings/migrate-en-{token}` - One-time DB migration to English
- `GET /api/pdf/{pdf_key}` - Serves stored PDFs (used by Resend path attachments)
- `GET /api/admin/settings/pdf-status` - Returns upload status for all PDFs
- `GET /api/settings/tracking` - Returns GTM ID
- `PUT /api/admin/settings/tracking` - Save GTM ID
- `POST /api/settings/upload-pdf-file` - Uploads PDFs in chunks
- `GET /api/img/{filename}` - Streams optimized webp images from GridFS
- `POST /api/leads` - Lead capture with PDF email attachment
- `GET /api/admin/leads` - Get all leads (used by CSV export)
