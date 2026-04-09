# EuroAdria Corporate Solutions — PRD

## Original Problem Statement
Professional "Beratung & Angebotsplattform" for the Balkan region with full CMS. Decoupled from Emergent, self-hosted on Render with MongoDB Atlas. Target: DACH investors interested in Montenegro/Serbia.

## Architecture
- **Frontend**: React 19, TailwindCSS, Recharts -> Render Static Site
- **Backend**: FastAPI, Motor (async MongoDB) -> Render Web Service
- **Database**: MongoDB Atlas (remote)
- **Email**: Resend API (noreply@euroadria.me)
- **Newsletter**: Brevo API
- **Domain**: euroadria.me (primary)
- **PDF**: ReportLab (branded Exposés + universal PDF Generator)
- **SEO**: Dynamic Sitemap, Open Graph, Twitter Cards, Schema.org (BlogPosting, ProfessionalService, LocalBusiness, Organization, FAQPage, NewsArticle, CollectionPage)
- **Tracking**: Custom Analytics (no Google Analytics)
- **Translation**: Argos (offline) + MyMemory API (fallback)
- **Video**: YouTube Data API v3 with caching

## Backend Architecture (18 Modules)
```
/app/backend/
  server.py          # Slim entry point (~90 lines)
  core.py            # DB, Auth, Storage, Config
  models.py          # Pydantic models
  emails.py          # Resend email + follow-up automation
  investment_models.py  # Investment calc models + seed data
  routes/
    analytics.py     # Pageview tracking, calculator tracking, dashboard, reset
    articles.py      # Article CRUD, clusters, categories, OG tags, sitemap, bulk import
    comments.py      # Public + admin comment moderation
    contact.py       # Contact form + lead capture + CRM auto-link
    crm.py           # Kanban pipeline, deals, stats, migration, cleanup
    events.py        # Events + Leistungen CMS
    investment.py    # Locations, infrastructure, zones, ROI, simulation, PDF expose
    newsletter.py    # Brevo integration
    pages.py         # CMS pages with defaults
    regions.py       # Regions & apartments
    settings.py      # Download settings, homepage settings, legal pages, PDF Generator
    translate.py     # Translation (Argos + MyMemory)
    uploads.py       # Image upload, optimization, object storage
    youtube.py       # YouTube Data API v3
```

## Completed Features

### Core Platform
- Investment Dashboard with 22 locations + Investment Heatmap
- ROI Calculator with live calculation
- Simulation Calculator (Tax, Exit Costs, Mortgage, 10-year cashflow, IRR, NPV)
- AEO-optimized Blog with Expert Tips
- Admin Panel with Sidebar Navigation (14 sections)
- Contact Form with Resend email notifications
- Dynamic Location Profiles

### CRM + Revenue Tracking
- Kanban Pipeline: 7 stages (Neuer Lead -> Gewonnen/Verloren)
- Revenue Dashboard: KPI cards, bar/pie charts, source tracking
- Auto CRM-Lead from ALL forms
- CRM Reset functionality

### PDF System
- Branded PDF Exposé with Lead-Gate (dark bg, gold accents)
- Universal PDF Generator in Admin Panel (WYSIWYG -> ReportLab)
- PDF Preview in browser

### Email System
- Admin notification on new contact/lead/comment
- Customer confirmation emails
- Follow-up automation (3-day loop)
- Unified light branding (white bg, logo header, gold accents)

### Schema.org SEO (April 2026)
- Organization schema with full address, founders, sameAs, knowsAbout
- ProfessionalService with priceRange, hasOfferCatalog, areaServed
- LocalBusiness with openingHours, aggregateRating
- BlogPosting for individual articles (datePublished with timezone, author with URL, wordCount, timeRequired)
- CollectionPage + ItemList for blog overview
- NewsArticle for 5 media mentions (n-tv, RTL, Focus, VC Magazin, Kosmo) with image, author, datePublished
- FAQPage with structured Q&A
- BreadcrumbList, ItemList for investment projects

### WYSIWYG Editor
- Bold, Italic, H1/H2/H3, Normal, Klein
- Lists (ordered/unordered), Blockquotes, Links
- Page Break for PDF
- Smart Paste: Rich HTML + Markdown auto-detection
- Partial-text heading selection
- Undo/Redo with History
- Mobile responsive: tooltips disabled on touch, horizontal scroll toolbar, hidden history counter

### Other
- /leistungen, /events pages (CMS)
- /infrastruktur-radar page with request form
- /serbia-executive, crypto-banking, crypto-compliance pages
- 5 Immobilien region pages (Budva, Podgorica, Zabljak, Skadar Lake, Niksic)
- Navigation mega-menu with 3 region categories
- Smart Traffic Source Detection (UTM, Click-IDs, User-Agent, Referrer)
- Cookie Consent, Impressum, Datenschutz, AGB
- Multilingual (DE/EN via LanguageContext + i18n)
- YouTube integration, WhatsApp button
- Newsletter (Brevo), ShareButtons, CommentsSection

### Domain & Deployment
- euroadria.me as primary domain
- Render (Frontend + Backend separate services)
- GitHub auto-deploy on push
- DKIM + SPF verified for noreply@euroadria.me

## Pending
- Google Search Console: add euroadria.me property

## Backlog (P2)
- Apartment-Listing with real DB data
- Video background for Hero section
- FunnelCockpit Tracking Integration (waiting for user tracking code)
- Newsletter integration expansion

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
- /api/admin/generate-pdf - Universal PDF Generator
- /api/translate, /api/translate/batch, /api/translate/article/{slug}
- /api/youtube/latest
- /api/sitemap.xml
