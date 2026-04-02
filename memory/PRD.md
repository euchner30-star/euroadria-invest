# EuroAdria - Product Requirements Document

## Original Problem Statement
Professional "Investment Intelligence Platform" for the Balkan region with full CMS. Deployed on Render with MongoDB Atlas. Admin panel for managing articles, hero images, PDF Expose downloads, and download URLs. Custom domain: `invest.euroadria.me`.

## Architecture
- **Frontend:** React + TailwindCSS (Static Site on Render: `euroadria-invest`)
- **Backend:** FastAPI + Motor/MongoDB (Web Service on Render: `invest.euroadria`)
- **Database:** MongoDB Atlas (remote)
- **Email:** Resend API
- **Newsletter:** Brevo API
- **Images:** imgBB (external hosting)
- **PDFs/Exposes:** External URLs (Google Drive, Dropbox)
- **Maps:** Leaflet + OpenStreetMap
- **Tracking:** FunnelCockpit Conversion Pixel
- **Object Storage:** Emergent Object Storage (Newsletter uploads)
- **GitHub Repo:** `euchner30-star/euroadria-invest` (branch: `main`)
- **Custom Domain:** `invest.euroadria.me` (via Strato DNS -> Render)

## What's Been Implemented

### Core Features
- Investment Dashboard with ROI Calculator
- AEO-optimized Blog with Expert Tips
- Admin Panel (Articles, Comments, Regions, Pages CMS, Downloads, Homepage CMS, Legal Pages)
- Contact Form with Resend email notifications
- Dynamic Location Profiles (5 Immobilien-Seiten)
- Infrastructure Radar with interactive Leaflet maps
- Interactive Leaflet/OpenStreetMap maps for Montenegro & Serbia
- Trust Bar (global, all pages)
- Floating WhatsApp Button with pulse animation
- Homepage CMS (Hero text, Testimonials, CTA, Trust Badges)
- Image Position Sliders for Hero, Testimonial, and Article images
- Newsletter System (Brevo: Anmeldung, Kampagnen, Abmeldung)
- Analytics Dashboard (KPIs, Charts, Page-View Tracking, Lead-Tabelle)
- Lead-Generierung (Expose-Downloads mit Name+E-Mail)
- Crypto-Banking & Compliance Subpages (Serbia Executive)
- AGB-Seite mit Admin Panel Editor (April 2026)

### Completed Tasks (Latest First)
- Kategorie-Tabs auf Infrastruktur-Karte: 7 Tabs (Flughäfen, Gemeinden, Rivièras, Nationalparks, Berge, Seen, Skizentren) mit automatischem Zoom und Premium-Design (2. April 2026)
- AGB-Seite (/agb) mit 11 Paragraphen, Admin Panel WYSIWYG-Editor, Footer + Cookie-Banner Links, Sitemap (2. April 2026)
- Backend-Optimierung: ~43 MB RAM gespart durch Entfernung ungenutzter Deps (pandas, numpy, boto3), Lazy PIL Import, MongoDB Pool Limits (2. April 2026)
- Karten-Labels vergroessert: Entfernungen/Fahrzeiten von 9-10px auf 12-13px (2. April 2026)
- Kommentar-E-Mail von SMTP auf Resend migriert (2. April 2026)
- Health-Check erweitert mit DB-Ping (2. April 2026)
- Object Storage Upload im Newsletter-Admin (2. April 2026)
- Newsletter Abmelde-Seite mit Brevo-Integration (1. April 2026)
- WYSIWYG Editor Bug Fix (Cursor-Jumping via Debouncing) (1. April 2026)
- Technical SEO: Schema.org, Open Graph, Sitemap (1. April 2026)
- Crypto-Banking & Compliance Subpages (1. April 2026)
- Legal Pages: Impressum & Datenschutz editierbar mit WYSIWYG + Live-Vorschau (31. Maerz 2026)

## Legal Pages
- **Impressum** (`/impressum`) - DSGVO-konform, editierbar im Admin
- **Datenschutz** (`/datenschutz`) - DSGVO-konform, editierbar im Admin
- **AGB** (`/agb`) - 11 Paragraphen, editierbar im Admin, enthält Investment-Disclaimer

## SEO Status
- 7 JSON-LD Structured Data Schemas
- Dynamic Sitemap at `/api/sitemap.xml` (25+ pages inkl. /agb)
- robots.txt, Canonical, OG, Twitter meta tags

## Prioritized Backlog

### P1 (Important)
- Apartment-Listing Funktionalitaet (User-Interesse)
- Video Background fuer Hero Section

### P2 (Nice to Have)
- Mehrsprachigkeit (DE/EN/SR)
- AdminPage.jsx / server.py Refactoring (Monolithen)

## Known Issues
- Render ephemeral storage: local file uploads wiped on deploy (using external URLs)

## Admin Credentials
- Local: `admin` / `euroadria2025`
- Render (live): `office@euroadria.me` / `IsTH42#HZMC4q@3A7ITfp#Ip`

## 3rd Party Integrations
- Resend API (emails)
- Brevo API (newsletter)
- MongoDB Atlas (database)
- Emergent Object Storage (newsletter file uploads)
- imgBB (image hosting, user-managed)
- FunnelCockpit (tracking pixel)
- OpenStreetMap/Leaflet (maps)
