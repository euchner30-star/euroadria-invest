# EuroAdria - Product Requirements Document

## Original Problem Statement
Professional "Investment Intelligence Platform" for the Balkan region with full CMS. Deployed on Render with MongoDB Atlas. Admin panel for managing articles, hero images, PDF Exposé downloads, and download URLs. Custom domain: `invest.euroadria.me`.

## Architecture
- **Frontend:** React + TailwindCSS (Static Site on Render: `euroadria-invest`)
- **Backend:** FastAPI + Motor/MongoDB (Web Service on Render: `invest.euroadria`)
- **Database:** MongoDB Atlas (remote)
- **Email:** Resend API
- **Images:** imgBB (external hosting)
- **PDFs/Exposés:** External URLs (Google Drive, Dropbox)
- **Maps:** Leaflet + OpenStreetMap
- **Tracking:** FunnelCockpit Conversion Pixel
- **GitHub Repo:** `euchner30-star/euroadria-invest` (branch: `main`)
- **Custom Domain:** `invest.euroadria.me` (via Strato DNS → Render)
- **Main Domain:** `euroadria.me` (separate site, links to invest subdomain under "Leistungen")

## What's Been Implemented

### Core Features
- Investment Dashboard with ROI Calculator
- AEO-optimized Blog with Expert Tips
- Admin Panel (Articles, Comments, Regions, Pages CMS, Downloads, Homepage CMS)
- Contact Form with Resend email notifications
- Dynamic Location Profiles (5 Immobilien-Seiten)
- Infrastructure Radar with interactive Leaflet maps
- Interactive Leaflet/OpenStreetMap maps for Montenegro & Serbia
- Trust Bar (global, all pages)
- Floating WhatsApp Button with pulse animation
- Homepage CMS (Hero text, Testimonials, CTA, Trust Badges)
- Image Position Sliders for Hero, Testimonial, and Article images

### Completed Tasks (Latest First)
- Newsletter Abmelde-Seite (/newsletter/abmelden) mit Brevo-Integration (1. April 2026)
- Brevo Domain-Authentifizierung (DKIM/SPF) erfolgreich (1. April 2026)
- Newsletter-System komplett: Anmeldung, Willkommens-E-Mail, Kampagnen, Abmeldung (1. April 2026)
- Analytics Dashboard: KPIs, Charts, Page-View Tracking, Lead-Tabelle mit CSV-Export (1. April 2026)
- Lead-Generierung: Exposé-Downloads nur mit Name+E-Mail, Leads in DB + E-Mail (31. März 2026)
- Admin Panel: Rechtliches Tab - Impressum & Datenschutz editierbar mit WYSIWYG-Editor (31. März 2026)
- Admin Panel: Statistik-Bild (60-80%) editierbar mit Vorschau und Positions-Slider (31. März 2026)
- SEO: Alle Domain-Referenzen auf `invest.euroadria.me` korrigiert (31. März 2026)
- Artikel-Bild Positionsregler mit Live-Vorschau im Admin Panel (März 2026)
- Grüner WhatsApp-Button unten rechts mit Puls-Animation (März 2026)
- Alle Telefon/WhatsApp/E-Mail-Links öffnen in neuem Tab (März 2026)
- Homepage CMS komplett im Admin Panel (Hero, Testimonials, CTA, Trust Badges) (März 2026)
- FunnelCockpit Tracking Pixel integriert (März 2026)
- Hero-Bild Fade-In gegen graue Blitze (März 2026)
- Custom Domain `invest.euroadria.me` eingerichtet (März 2026)
- EuroAdria Logos vergrößert mit Hover-Animationen (März 2026)
- 7 Kontaktformulare auf Resend API umgestellt (März 2026)
- Dynamische Distanzen (km) und Fahrzeiten (min) auf Infrastructure Map (März 2026)
- 10 FAQ-Fragen auf Homepage mit Schema-Markup (März 2026)
- Admin Panel Mobile-Optimierung (Feb 2026)
- Dynamische Exposés im Admin Panel (Feb 2026)
- Investment Heatmap: 2 Leaflet/OpenStreetMap Karten (Feb 2026)
- Trust Bar global eingebunden (Feb 2026)
- Download URL / Exposé Feature in Admin + Article View
- Article sorting with sortOrder field
- Downloads tab in Admin Panel
- SEO: Dynamic sitemap, FAQ schema, LocalBusiness, BreadcrumbList, AggregateRating
- Migration to MongoDB Atlas
- Render deployment (Frontend + Backend)
- Resend API email integration
- ROI Calculator input fix
- Expert Tip names updated
- Header CTA button slimmed

## SEO Status
- 7 JSON-LD Structured Data Schemas (Organization, NewsArticle x2, ProfessionalService, ItemList, FAQPage, LocalBusiness, BreadcrumbList)
- Dynamic Sitemap at `/api/sitemap.xml` with all pages + blog articles
- robots.txt with allowed bots (Google, Bing, GPT, Claude)
- Canonical, OG, Twitter meta tags → all pointing to `invest.euroadria.me`
- **Next:** User submitting sitemap to Google Search Console

## DB Schema - Articles
```json
{
  "id": "int",
  "slug": "string",
  "title": "string",
  "cluster": "string",
  "category": "string",
  "excerpt": "string",
  "content": "string (HTML)",
  "author": "string",
  "date": "string",
  "image": "string (URL)",
  "imagePosition": "int (0-100, vertical position)",
  "readTime": "string",
  "featured": "boolean",
  "sortOrder": "int (0=top, higher=lower)",
  "expertTip": { "author": "string", "title": "string", "content": "string" },
  "dueDiligenceBox": { "title": "string", "content": "string" },
  "downloadUrl": "string (optional, external PDF link)",
  "metaTitle": "string (optional)",
  "metaDescription": "string (optional)"
}
```

## DB Schema - Site Settings
```json
{
  "key": "homepage_settings",
  "hero_title": "string",
  "hero_subtitle": "string",
  "hero_cta_text": "string",
  "testimonial_image": "string (URL)",
  "testimonial_image_position": "int (0-100)",
  "testimonial_quote": "string",
  "testimonial_author": "string",
  "cta_title": "string",
  "cta_subtitle": "string"
}
```

## Prioritized Backlog

### P1 (Important)
- Google Search Console: Submit sitemap (USER ACTION - in progress)

### P2 (Nice to Have)
- Video Background for Hero Section (user mentioned interest)
- Apartment-Listing functionality
- AdminPage.jsx / server.py refactoring (monoliths)

## Known Issues
- Render ephemeral storage: local file uploads wiped on deploy (using external URLs as workaround)
- Render Deployment Desync: Frontend may deploy faster than Backend, causing temporary API 404s

## Key API Endpoints
- `POST /api/contact` — Resend email
- `POST /api/calculator/roi` — ROI calculation
- `GET/POST/PUT/DELETE /api/articles` — Article CRUD
- `GET /api/settings/downloads` — Public download URLs
- `PUT /api/admin/settings/downloads` — Admin update download URLs
- `GET/PUT /api/settings/homepage` — Homepage CMS
- `GET /api/sitemap.xml` — Dynamic sitemap (domain: invest.euroadria.me)

## Admin Credentials
- Local: `admin` / `euroadria2025`
- Render (live): `office@euroadria.me` / `IsTH42#HZMC4q@3A7ITfp#Ip`

## 3rd Party Integrations
- Resend API (emails) — RESEND_API_KEY in Render env
- MongoDB Atlas — MONGO_URL in Render env
- imgBB (image hosting) — managed by user externally
- FunnelCockpit (tracking) — Conversion Pixel ID injected
- OpenStreetMap/Leaflet — Free open-source map tiles
