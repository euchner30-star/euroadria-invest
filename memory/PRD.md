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
- [x] ROI Calculator (with proper input clearing)
- [x] AEO-optimized Blog with Expert Tips
- [x] Admin Panel with bulk article import
- [x] Contact form with Resend email notifications
- [x] YouTube Video Slider (dynamic via API)
- [x] Cookie consent banner (GDPR)
- [x] Article Download URL/Exposé (Admin + public view)
- [x] **DE/EN Translation System (2026-04-04)**: Synchronous JSON + dictionary-based translations
  - Auto-detection of browser language (English browser → English site, otherwise German)
  - Manual EN/DE toggle REMOVED per user request
  - Static UI text: `de.json`/`en.json` via `t()` function
  - Page-specific text: Inline `lang === 'en'` ternaries
  - ROI Calculator: `<T>` component with synchronous dictionary lookup
  - Dynamic DB content: Backend `/api/translate/article/{slug}` endpoint
  - Removed slow `TranslatePage` DOM-manipulator from all pages

## Architecture
### Translation System
- `/app/frontend/src/i18n/de.json` & `en.json` - Static string dictionaries
- `/app/frontend/src/context/LanguageContext.jsx` - Auto-detects browser language + `t()` helper
- `/app/frontend/src/components/T.jsx` - Synchronous German→English dictionary component (no API calls)
- Backend `/api/translate/article/{slug}` - MyMemory API with MongoDB caching for dynamic content
- NO manual language toggle button - fully automatic based on `navigator.language`

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
- WYSIWYG editor backward-text bug on mobile (testing pending, recurrence: 2)

### P3 - Nice to Have
- Cloudinary/S3 integration for native file uploads (currently using external URLs)
- Newsletter Integration

## Deployment
Changes must be pushed to GitHub: `euchner30-star/euroadria-invest` → Render auto-deploy.
