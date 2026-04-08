# EuroAdria Corporate Solutions — PRD

## Original Problem Statement
Professional "Beratung & Angebotsplattform" for the Balkan region with full CMS. Decoupled from Emergent, self-hosted on Render with MongoDB Atlas. Target: DACH investors interested in Montenegro/Serbia.

## Architecture
- **Frontend**: React 19, TailwindCSS, Recharts -> Render Static Site
- **Backend**: FastAPI, Motor (async MongoDB) -> Render Web Service
- **Database**: MongoDB Atlas (remote)
- **Email**: Resend API (noreply@euroadria.me)
- **Newsletter**: Brevo API
- **Domain**: euroadria.me (primary), invest.euroadria.me (legacy)

## Backend Architecture (Refactored April 2026)
```
/app/backend/
  server.py          # Slim entry point (~90 lines) - App, CORS, router includes
  core.py            # DB connection, Auth (verify_admin), Storage helpers, Config
  models.py          # All Pydantic models
  emails.py          # Resend email logic + follow-up automation
  investment_models.py  # Investment calculation models + seed data
  routes/
    analytics.py     # Page views, calculator tracking, analytics dashboard, reset
    articles.py      # Article CRUD, clusters, categories, OG tags, sitemap, bulk import
    comments.py      # Public + admin comment moderation
    contact.py       # Contact form + lead capture + CRM auto-link
    crm.py           # Kanban pipeline, deals, stats, migration, cleanup
    events.py        # Events + Leistungen CMS
    investment.py    # Locations, infrastructure, zones, ROI, simulation, PDF expose
    newsletter.py    # Brevo integration (subscribe, unsubscribe, send campaigns)
    pages.py         # CMS pages with defaults
    regions.py       # Regions & apartments
    settings.py      # Download settings, homepage settings, legal pages
    translate.py     # Translation (Argos offline + MyMemory API fallback)
    uploads.py       # Image upload, optimization, object storage, file serving
    youtube.py       # YouTube Data API v3 with caching
```

## Completed Features

### Core Platform
- Investment Dashboard with ROI Calculator
- Simulation Calculator (Tax, Exit Costs, Mortgage)
- AEO-optimized Blog with Expert Tips
- Admin Panel (Articles, Comments, Regions, Pages, Newsletter, Downloads, Pipeline, Revenue)
- Contact Form with Resend email notifications
- Dynamic Location Profiles (22 locations)

### CRM + Revenue Tracking (April 2026)
- Kanban Pipeline: 7 stages (Neuer Lead -> Gewonnen/Verloren)
- Revenue Dashboard: KPI cards, bar/pie charts, source tracking
- Auto CRM-Lead from ALL forms (contact, expose download, newsletter)
- CRM Reset functionality

### PDF Expose (April 2026)
- EuroAdria branded PDF (dark bg, gold accents, white logo)
- Dynamic location name, 10-year cashflow table
- Lead-Gate: Name + Email required before download
- Confirmation email to customer

### Email System (April 2026)
- Admin notification on new contact/lead
- Customer confirmation emails (contact + PDF download)
- Follow-up automation (3-day loop)
- All via Resend with noreply@euroadria.me

### Domain Migration (April 2026)
- euroadria.me as primary domain
- All URLs, CORS, SEO, Sitemap updated

### Backend Refactoring (April 2026)
- Monolithic server.py (4509 lines) -> 18 modular files (3828 lines total)
- Clean separation: core, models, emails, 14 route modules
- All 39 API endpoints tested and verified (100% pass rate)

### Unified Light Email Branding (April 2026)
- All 6 email templates converted from dark to light design
- Consistent branding: white background, logo header, gold accents, professional footer
- PDF Exposé also converted to light design with regular logo
- Shared `wrap_email()` helper in emails.py for consistent layout

### Resend Domain Verification (April 2026)
- DKIM, SPF TXT, and SPF MX all verified for euroadria.me
- MX record set via Strato subdomain `send.euroadria.me` → `feedback-smtp.eu-west-1.amazonses.com`
- Emails sending via `noreply@euroadria.me`

### Smart Traffic Source Detection (April 2026)
- 5-step source detection: UTM → Click-IDs (fbclid/ttclid/gclid) → User-Agent → Referrer → Direct
- Auto-detects TikTok, Instagram, Facebook, LinkedIn, Twitter, Snapchat, Pinterest in-app browsers
- Solves the problem of social media in-app browsers stripping the Referrer header

### Other
- /leistungen page with CMS editor
- /events page with CRUD API
- Navigation dropdown
- Source maps disabled, CORS restricted
- Global brand rename to "EuroAdria Corporate Solutions"
- Analytics Dashboard with "Zurucksetzen" button
- Cookie consent modal

### PDF Generator im Admin Panel (April 2026)
- Neuer "PDF Generator" Tab in der Sidebar unter "Inhalte"
- WYSIWYG-Editor für formatierten Inhalt (H1-H3, Listen, fett, kursiv, Links, Zitate)
- Automatisches EuroAdria-Branding: Logo, goldene Akzente, Header/Footer, "Vertraulich"-Hinweis
- Titel + optionaler Untertitel + Datum wird automatisch eingefügt
- Backend: HTML-zu-PDF Konvertierung mit reportlab + BeautifulSoup
- Endpoint: POST /api/admin/generate-pdf (Auth required)

### Admin Panel Sidebar Navigation (April 2026)
- Replaced tab-based navigation with sidebar layout
- Collapsible groups: Überblick, Inhalte, Kommunikation, Daten & Recht
- 14 navigation items with badges (article count, pending comments, etc.)
- Mobile responsive: slide-in sidebar with hamburger menu
- Active state highlighting with gold accent

## Pending
- Google Search Console: add euroadria.me property

## Backlog (P2)
- Apartment-Listing with real DB data
- Video background for Hero section
- Newsletter integration expansion
- FunnelCockpit Tracking Integration (waiting for user tracking code)
- Optional: api.euroadria.me subdomain for backend
- Follow-up email automation testing

## Credentials
See /app/memory/test_credentials.md

## Key API Endpoints
- /api/health - Health check + DB ping
- /api/contact (POST) - Contact form + CRM auto-link
- /api/leads (POST) - Expose download + CRM auto-link
- /api/articles (GET/POST/PUT/DELETE)
- /api/admin/crm/* - CRM pipeline management
- /api/admin/analytics/* - Analytics dashboard
- /api/calculator/roi, /api/calculator/simulation, /api/calculator/expose-pdf
- /api/translate, /api/translate/batch, /api/translate/article/{slug}
- /api/youtube/latest
- /api/sitemap.xml
