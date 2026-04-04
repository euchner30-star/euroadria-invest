# EuroAdria Investment Intelligence Platform - PRD

## Original Problem Statement
Professional "Investment Intelligence Platform" for the Balkan region with full CMS. Features: ROI calculator, dynamic location profiles, contact form with email notifications, SEO-optimized blog, interactive investment maps, extensive CMS admin panel, YouTube Video Slider, and automatic DE/EN translation based on browser language.

## Tech Stack
- **Frontend**: React, TailwindCSS, Custom i18n Context with auto-detection
- **Backend**: FastAPI, Motor (async MongoDB)
- **Database**: MongoDB Atlas (Remote)
- **Hosting**: Render (separate Frontend/Backend services)
- **APIs**: YouTube Data API v3, MyMemory Translation API, Resend API

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
- [x] Article Download URL/Exposé (Admin + public view)
- [x] DE/EN Translation System (2026-04-04):
  - Auto-detection: German browsers → DE, all others → EN
  - Static UI: JSON files + inline ternaries (Header, Footer, Hero, Contact, FAQ, Blog UI, ROI Calculator, all 5 Immobilien pages, Serbia Executive, Crypto pages, Investment Dashboard, Comments)
  - Dynamic DB content (articles): Backend MyMemory API with HTML-aware paragraph splitting + MongoDB caching
  - Manual toggle removed per user request
  - Note: Free MyMemory API has limitations on long article content translation

## Architecture
### Translation System
- `/app/frontend/src/i18n/de.json` & `en.json` - Static string dictionaries
- `/app/frontend/src/context/LanguageContext.jsx` - Auto-detects browser language
- `/app/frontend/src/components/T.jsx` - Synchronous dictionary component
- Backend `/api/translate/article/{slug}` - MyMemory API with MongoDB caching

## Pending/Backlog Tasks

### P1 - Upcoming
- Admin Panel UI for Investment Data (Locations, Infrastructure)
- Apartment-Listing functionality

### P2 - Future
- FunnelCockpit Tracking Integration (BLOCKED: user needs to provide tracking code)
- Heatmap Visualizations on investment map
- Video Background for Hero section
- Multi-language support (Serbian as 3rd language)
- Custom Domain Setup (`invest.euroadria.me`)
- WYSIWYG editor backward-text bug on mobile (testing pending)

### P3 - Nice to Have
- Cloudinary/S3 for native file uploads
- Newsletter Integration
- Consider paid translation API (DeepL) for better article translation quality

## Deployment
Git push to `euchner30-star/euroadria-invest` → Render auto-deploy.
