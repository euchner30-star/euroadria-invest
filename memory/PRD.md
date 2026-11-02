# EuroAdria Investment Intelligence Platform — PRD

## Original Problem Statement
Professionelle EuroAdria Investment Intelligence Platform für den Balkan: React/FastAPI/MongoDB mit CMS, Immobilienportal, Admin-CRM, Team-CRM, E-Mail-System, Provisionen, Dokumentenbibliothek, Analytics und DSGVO-Funktionen. Kommunikation auf Deutsch.

## Architecture
- **Frontend**: React 19, TailwindCSS, Shadcn/UI, react-helmet-async
- **Backend**: FastAPI, Motor/MongoDB
- **Storage**: Object Storage für neue Bilder/Dokumente, GridFS-Fallback für Altbestände
- **Hosting**: Render (Production, Domain euroadria.me); Emergent (Preview)
- **Auth**: Admin HTTP Basic, Team JWT+bcrypt

## Core Features Implemented
- Property CRUD mit dynamischen Locations, Price-on-Request, Gallery, OG-Images
- Blog/Articles CMS mit Share-Funktionalität
- Team CRM: Login, Lead-Management, Notes, E-Mail mit Mehrfachanhängen, Dokumentenbibliothek
- Admin Dashboard: Kanban Pipeline, Lead-Bearbeitung, Team-Aktivitäten, Produkt-/Provisionskatalog
- DSGVO-Panel: E-Mail-Suche über alle Collections, IP-Erfassung, Backup-Export
- Cookie-Banner v1.1 (DE/EN, IP, GA4, Meta Pixel Hinweise)
- Investment Heatmap mit Leaflet-Karten
- E-Mail: Resend für alle Mails, Tracking-Pixel, Corporate-Signatur
- OG/Social Share: Serverseitige Share-HTML für WhatsApp/Social
- Video Hero: Drohnen-Video von Budva/Montenegro als Hintergrund

## Recent Changes (2026-11-02)
- **Karten-Fix**: CARTO Tiles (API KEY REQUIRED) durch OpenStreetMap + CSS Dark-Filter ersetzt
- **Hero Video**: Statisches Hintergrundbild durch Pexels Drohnen-Video (Budva, Montenegro) ersetzt, komprimiert auf 3MB

## Pending / Backlog

### P0 — Critical
- Brevo-Nutzung klären: Newsletter-Sendepfad prüfen, Entscheidung ob behalten/ersetzen/deaktivieren
- Dokumentenbibliothek: Download-Endpoint wegen Preview-404 vollständig testen
- E-Mail-Versand in Production mit Resend konfigurieren/verifizieren
- Security-Reaudit nach korrekter Render-Env-Konfiguration

### P1 — Important
- Cloudflare/Crawler-Freigabe für Facebook/Twitter/LinkedIn Social Previews
- Render → Emergent Hosting Migration (nach Nutzerentscheidung)
- Refactoring: AdminPage.jsx, AnalyticsDashboard.jsx, TeamCRM.jsx aufteilen

### P2 — Nice to Have
- Video-Hintergrund Hero (verschiedene Szenen/Montage)
- Podcast-Integration
- Lead-Reaktivierung via WhatsApp
- PDF-Generator: Templates speichern
- Google Docs Import per URL
- Telegram/SMS/WhatsApp-Benachrichtigungen (vom Nutzer pausiert)

## Key Files
- `/app/frontend/src/components/Hero.jsx` — Video Hero
- `/app/frontend/src/components/InvestmentHeatmap.jsx` — Karten mit OSM Tiles
- `/app/frontend/src/App.css` — Dark-Tiles CSS Filter
- `/app/backend/routes/properties.py` — Immobilien CRUD, OG, Share
- `/app/backend/routes/team.py` — Team CRM, Docs, E-Mail
- `/app/backend/routes/analytics.py` — Admin, DSGVO, Backup
- `/app/backend/routes/newsletter.py` — Newsletter (Brevo-Abhängigkeit prüfen)
- `/app/backend/core.py` — DB, Auth, Config
