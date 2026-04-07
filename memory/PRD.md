# EuroAdria Corporate Solutions — Investment Intelligence Platform

## Original Problem Statement
Professional "Investment Intelligence Platform" for the Balkan region with full CMS. Decoupled from Emergent, self-hosted on Render with MongoDB Atlas. Target: DACH investors interested in Montenegro/Serbia.

## Architecture
- **Frontend**: React 19, TailwindCSS, Recharts → Render Static Site
- **Backend**: FastAPI, Motor (async MongoDB) → Render Web Service
- **Database**: MongoDB Atlas (remote)
- **Email**: Resend API (noreply@euroadria.me)
- **Newsletter**: Brevo API
- **Domain**: euroadria.me (primary), invest.euroadria.me (legacy, still active)

## Completed Features

### Core Platform
- Investment Dashboard with ROI Calculator
- Simulation Calculator (Tax, Exit Costs, Mortgage)
- AEO-optimized Blog with Expert Tips
- Admin Panel (Articles, Comments, Regions, Pages, Newsletter, Downloads, Pipeline, Revenue)
- Contact Form with Resend email notifications
- Dynamic Location Profiles (22 locations)

### CRM + Revenue Tracking (April 2026)
- Kanban Pipeline: 7 stages (Neuer Lead → Qualifiziert → Termin → Erstgespräch → Angebot → Verhandlung → Gewonnen/Verloren)
- Revenue Dashboard: KPI cards, bar/pie charts, source tracking
- Auto CRM-Lead from ALL forms (contact, expose download, newsletter)
- Won/Lost deals separated from active pipeline
- CRM Reset functionality
- Mobile-responsive UI

### PDF Exposé (April 2026)
- EuroAdria branded PDF (dark bg, gold accents, white logo)
- Dynamic location name based on customer selection
- Lead-Gate: Name + Email required before PDF download
- Confirmation email to customer after download

### Email System (April 2026)
- Admin notification on new contact/lead
- Customer confirmation email (contact form)
- Customer confirmation email (PDF download)
- All via Resend with noreply@euroadria.me
- EuroAdria branded HTML templates

### Domain Migration (April 2026)
- euroadria.me as primary domain (was invest.euroadria.me)
- All URLs, CORS, SEO, Sitemap, emails updated
- Resend domain verification (pending DNS propagation)
- invest.euroadria.me still active as legacy

### Other
- /leistungen page with CMS editor
- /events page with CRUD API
- Navigation dropdown (Leistungen → Unsere Leistungen + Events)
- Source maps disabled, CORS restricted
- Global brand rename to "EuroAdria Corporate Solutions"
- Number formatting (Mrd. vs Mio.)
- Horizontal scroll fix on mobile

## Pending
- Resend domain verification (waiting for DNS propagation at Strato)
- Google Search Console: add euroadria.me property

## Recent Changes (April 2026)
- Analytics Dashboard: Added "Zurücksetzen" button with confirmation modal to reset all page views, contacts, and tracking data

## Backlog (P2)
- Apartment-Listing with real DB data
- Video background for Hero section
- Newsletter integration expansion
- server.py refactoring (4000+ lines → API routers)
- Optional: api.euroadria.me subdomain for backend
- Follow-up email automation (3 days after PDF download)

## Credentials
See /app/memory/test_credentials.md

## Key API Endpoints
- /api/contact (POST) — Contact form + CRM auto-link
- /api/leads (POST) — Expose download + CRM auto-link
- /api/articles (GET/POST/PUT/DELETE)
- /api/admin/crm/leads (GET/POST)
- /api/admin/crm/deals (GET/POST/PUT/DELETE)
- /api/admin/crm/stages (GET)
- /api/admin/crm/stats (GET)
- /api/admin/crm/reset (DELETE)
- /api/admin/crm/migrate (POST)
- /api/calculator/expose-pdf (POST)
- /api/debug/email-test (GET)
