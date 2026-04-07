# EuroAdria Investment Intelligence Platform - PRD

## Original Problem Statement
Professional "Investment Intelligence Platform" for the Balkan region with full CMS. Features: ROI calculator, dynamic location profiles, contact form with email notifications, SEO-optimized blog, interactive investment maps, extensive CMS admin panel, YouTube Video Slider.

## Tech Stack
- **Frontend**: React, TailwindCSS
- **Backend**: FastAPI, Motor (async MongoDB)
- **Database**: MongoDB Atlas (Remote)
- **Hosting**: Render (separate Frontend/Backend services)
- **APIs**: YouTube Data API v3, Resend API

## Environment Variables (Render)
- `MONGO_URL`, `DB_NAME`, `RESEND_API_KEY`, `YOUTUBE_API_KEY`, `YOUTUBE_PLAYLIST_ID`, `CORS_ORIGINS`

## Completed Features
- [x] E2E Investment Dashboard
- [x] ROI Calculator
- [x] AEO-optimized Blog with Expert Tips
- [x] Admin Panel with bulk article import (Duplikat-Schutz via Slug + Titel)
- [x] Contact form with Resend email notifications
- [x] YouTube Video Slider (dynamic via API)
- [x] Cookie consent banner (GDPR)
- [x] Article Download URL/Expose (Admin + public view)
- [x] Translation system REMOVED per user request - app is strictly German-only
- [x] Admin Panel Investment Data UI (2026-04-05): Locations, Infrastructure, Zones CRUD
- [x] Newsletter Admin: Subscriber delete function (2026-04-05)
- [x] ROI Calculator fix: Netto-Rendite based on Gesamtinvestition (2026-04-05)
- [x] Bulk Import: Professional duplicate detection (slug + title + file-internal) (2026-04-05)
- [x] 4 Pro-Features (2026-04-06):
  - Dynamic Simulation: 10-year IRR/NPV/Cashflow projection with sliders + Recharts
  - Predictive Infrastructure Score: Weighted algorithm (Airport +15%, Road +10%, Clinic +8%)
  - Market Data Validation: /api/v1/market-check with deviation warnings >15%
  - PDF Exposé Generator: Professional PDF with ReportLab (KPIs, parameters, 10-year table)
  - Frontend: /investment/simulation page with real-time sliders + PDF download
- [x] Simulation Erweiterungen (2026-04-06):
  - Steuer-Toggle: 9% MNE Pauschalsteuer (ein/ausschaltbar mit variablem Steuersatz)
  - Exit-Kosten: 3% Maklergebühr-Slider, abgezogen vom Endwert
  - Hypotheken-Annuität: Dynamische Tabellenspalte bei Fremdfinanzierung (EK < 100%)
  - Lead-Gen CTA: "Finanzierung für dieses Objekt anfragen" Button mit Kontaktformular-Link
- [x] OnePage-Migration (2026-04-07):
  - Neue /leistungen Seite: 4 Servicebereiche (Immobilien, Firmengründung, Legal, Investor Relations)
  - Rechtsrisiken Problem/Lösung Sektion (Baugenehmigung, Kataster, Erbchaos)
  - Exit-Sicherheit & Compliance Sektion (Airbnb, Grauzonen, politische Risiken)
  - Doppelte Garantie: Vor dem Kauf / Nach dem Kauf
  - Erweiterte Team-Bios (Holger: Evercraft/Industrie-Hintergrund, Milena: Master Rechtswissenschaften)
  - Kontaktformular: Service-Auswahl Dropdown + Betreff-Prefill via URL-Parameter
  - Navigation: "Leistungen" Link im Header
  - Sitemap: /leistungen mit Priorität 0.9 + Sitemap-Index Fix (alte statische sitemap.xml → Redirect zur dynamischen API)

## Architecture
### Key Files
- `/app/backend/server.py` - FastAPI monolith with all API routes
- `/app/backend/investment_models.py` - Pydantic models + seed data
- `/app/frontend/src/pages/AdminPage.jsx` - Monolithic CMS admin panel
- `/app/frontend/src/services/api.js` - API bindings (investmentApi, adminApi, etc.)

## Pending/Backlog Tasks

### P1 - Upcoming
- Apartment-Listing functionality (currently "Coming Soon")

### P2 - Future
- Heatmap Visualizations on investment map
- Video Background for Hero section
- Newsletter Integration
- WYSIWYG editor backward-text bug on mobile (recurring, testing pending)

### P3 - Nice to Have
- Cloudinary/S3 for native file uploads (Render ephemeral storage)
- AdminPage.jsx and server.py refactoring (monoliths >3000 lines)

## Deployment
Git push to `euchner30-star/euroadria-invest` -> Render auto-deploy.
Custom domain: invest.euroadria.me (LIVE)
