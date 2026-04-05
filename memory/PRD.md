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
- [x] Admin Panel with bulk article import
- [x] Contact form with Resend email notifications
- [x] YouTube Video Slider (dynamic via API)
- [x] Cookie consent banner (GDPR)
- [x] Article Download URL/Expose (Admin + public view)
- [x] Translation system REMOVED per user request - app is strictly German-only
- [x] Admin Panel Investment Data UI (2026-04-05):
  - Full CRUD for Locations (22 seeded), Infrastructure Projects (14 seeded), Opportunity Zones (8 seeded)
  - Sub-tabs: Standorte / Infrastruktur / Zonen
  - Location form correctly maps to backend: tourism_growth, population_growth, infrastructure_score, opportunities, risks, use_cases, time_horizon
  - Infrastructure form: project_name, type, status, completion_year, investment_eur, impact_radius_km, lat/lng
  - Zones form: name, country, color picker, expected_growth, radius_km, investment_focus, lat/lng

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
