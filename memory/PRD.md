# EuroAdria Corporate Solutions — PRD

## Original Problem Statement
Professional "Beratung & Angebotsplattform" for the Balkan region with full CMS. Decoupled from Emergent, self-hosted on Render with MongoDB Atlas. Target: DACH investors interested in Montenegro/Serbia.

## Architecture
- **Frontend**: React 19, TailwindCSS, Recharts -> Render Static Site
- **Backend**: FastAPI, Motor (async MongoDB) -> Render Web Service
- **Database**: MongoDB Atlas (remote)
- **Email**: Resend API (noreply@euroadria.me)
- **Newsletter**: Brevo API
- **Domain**: euroadria.me (ACTIVE, primary — NICHT MEHR ÄNDERN)
- **PDF**: ReportLab (branded Exposés + universal PDF Generator)
- **SEO**: Dynamic Sitemap, Open Graph, Twitter Cards, Schema.org (BlogPosting, ProfessionalService, LocalBusiness, Organization, FAQPage, NewsArticle, CollectionPage)
- **Tracking**: Custom Analytics (no Google Analytics)
- **Translation**: Argos (offline) + MyMemory API (fallback)
- **Video**: YouTube Data API v3 with caching
- **Images**: User uploads via imgBB (external), Object Storage endpoint for internal uploads

## IMPORTANT: Already Done — DO NOT re-ask user about these
- Domain euroadria.me is ACTIVE and configured
- Render deployment is working (Frontend + Backend separate)
- MongoDB Atlas is connected
- Resend email is configured with DKIM/SPF
- All 15 articles are in the live DB
- Image position sliders (horizontal + vertical) are working
- WYSIWYG Editor works on mobile with unlimited headings
- ImageUploader has URL-paste, file-upload, and delete buttons (mobile-friendly)
- DB cleanup done (no test/placeholder images)
- Code lint: Frontend 100% clean, Backend bugs fixed (HTTPException import, bare except)

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
- Organization, ProfessionalService, LocalBusiness
- BlogPosting, CollectionPage, NewsArticle, FAQPage
- BreadcrumbList, ItemList

### WYSIWYG Editor (fully working on Desktop + Mobile)
- Bold, Italic, H1/H2/H3, Normal, Klein
- Lists (ordered/unordered), Blockquotes, Links
- Page Break for PDF
- Smart Paste: Rich HTML + Markdown auto-detection
- Direct DOM manipulation for headings (no execCommand quirks)
- Selection restore on mobile (lastSelectionRef + onMouseDown preventDefault)
- Undo/Redo with History

### Image Management
- ImageUploader with 3 always-visible buttons: Neue Datei / URL einfügen / Entfernen
- Auto-extraction of image URL from imgBB embed code
- Image position sliders (horizontal + vertical) with -30% to 130% range
- Blog cards use slider position, Article page shows original (50%/50%)
- hidePreview mode shows compact controls (no blank UI)

### Other
- /leistungen, /events pages (CMS)
- /infrastruktur-radar page with request form
- /serbia-executive, crypto-banking, crypto-compliance pages
- 5 Immobilien region pages (Budva, Podgorica, Zabljak, Skadar Lake, Niksic)
- Navigation mega-menu with 3 region categories
- Header dropdown closed on scroll (no accidental open)
- Smart Traffic Source Detection (UTM, Click-IDs, User-Agent, Referrer)
- Cookie Consent, Impressum, Datenschutz, AGB
- Multilingual (DE/EN via LanguageContext + i18n)
- YouTube integration, WhatsApp button
- Newsletter (Brevo), ShareButtons, CommentsSection

### Domain & Deployment
- euroadria.me as primary domain (DONE)
- Render (Frontend + Backend separate services)
- GitHub auto-deploy on push

## Pending / Backlog
- Google Search Console: add euroadria.me property (P2)
- Apartment-Listing with real DB data (P1)
- Video background for Hero section (P1)
- Podcast-Integration (P1) — NEU
- FunnelCockpit Tracking Integration (BLOCKED — waiting for user tracking code)
- Newsletter integration expansion (P2)
- PDF Generator template save/load feature (P2)
- Google Docs Import via URL (P2)

## Zuletzt erledigt
- **14.04.2026**: Reddit/Quora Tracking Fix — UTM-Source-Normalisierung in allen 3 Backend-Aggregation-Pipelines ergänzt (pipeline_referrers, pipeline_utm, pipeline_utm_sources). Reddit + Quora werden jetzt korrekt als eigene Traffic-Quellen im Analytics-Dashboard angezeigt.
- **15.04.2026**: Code Splitting — React.lazy() + Suspense für alle 28 Seiten implementiert. Initial Load von 1.5MB auf 368KB reduziert (~75% Verbesserung). 30 separate Chunks werden nur bei Bedarf geladen.
- **15.04.2026**: Performance-Optimierung — 404-Seite, Error Boundary, Font-Optimierung (non-blocking load), OptimizedImage-Komponente (WebP + lazy loading), CSS von 117KB auf 104KB reduziert.
- **16.04.2026**: ShareButtons Upgrade — LinkedIn, X und WhatsApp bekommen jetzt automatisch Teaser-Text (Excerpt) + Hashtags + UTM-Tracking-Link. Für jeden Artikel automatisch generiert aus den vorhandenen Daten.
- **11.04.2026**: Gefällt-mir-Button (Like) für Kommentare + Antworten
- **11.04.2026**: Lead-Erstellung aus Blog-Kommentaren (Quelle: blog_comment)
- **11.04.2026**: Kommentar-Antworten (Threading) + Auto-Freigabe-System implementiert
- **11.04.2026**: Content-Parser Fix — HTML-Artikel werden direkt angezeigt statt als Markdown konvertiert
- **11.04.2026**: Goldene Aufzählungslisten-Styling für Artikel (CSS)
- **11.04.2026**: WYSIWYG speichert jetzt HTML direkt (kein Markdown-Roundtrip mehr → Bold bleibt erhalten)
- **11.04.2026**: PDF-Anhang in E-Mail — MongoDB-basiert statt Object Storage (funktioniert auf Render)
- **11.04.2026**: Admin Panel: "PDF hochladen" Button in Downloads-Sektion
- **11.04.2026**: Praxisleitfaden PDF in Object Storage hochgeladen + Lead-Gate Download-Flow getestet
- **10.04.2026**: PDF-Generator Serbische Sonderzeichen Fix + Font-Family Registrierung für Bold/Italic
- **10.04.2026**: WYSIWYG Smart Paste Fix — Google Docs Formatierung 1:1 übernehmen
- **10.04.2026**: Image Slider Desktop Fix — von object-position auf 140%-Wrapper-Ansatz umgestellt
- **10.04.2026**: Navbar Anpassungen — KONTAKT entfernt, Immobilienangebot nur bei Klick
- **10.04.2026**: Space/Enter Desktop Fix — WYSIWYG Editor nutzt native Enter-Behandlung, Due Diligence Textarea preserviert Zeilenumbrüche während Tippen (Aufräumung bei Blur), Form-Submit bei Enter in Inputs verhindert, funktioniert jetzt auf Desktop UND Mobile zuverlässig

## Credentials
See /app/memory/test_credentials.md

## Key API Endpoints
- /api/health
- /api/contact (POST)
- /api/leads (POST)
- /api/articles (GET/POST/PUT/DELETE)
- /api/articles/list (GET — includes imagePosition fields)
- /api/admin/crm/*
- /api/admin/analytics/*
- /api/calculator/roi, /api/calculator/simulation, /api/calculator/expose-pdf
- /api/admin/generate-pdf
- /api/admin/storage/upload
- /api/translate, /api/translate/batch
- /api/youtube/latest
- /api/sitemap.xml
