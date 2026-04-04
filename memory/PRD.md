# EuroAdria Investment Intelligence Platform - PRD

## Original Problem Statement
Professional "Investment Intelligence Platform" for the Balkan region with full CMS. Features: ROI calculator, dynamic location profiles, contact form with email notifications, SEO-optimized blog, interactive investment maps, extensive CMS admin panel, YouTube Video Slider, and DE/EN translation system.

## Tech Stack
- **Frontend**: React, TailwindCSS, Custom i18n Context
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
- [x] **DE/EN Translation System (2026-04-04)**: Complete refactor from DOM-manipulating TranslatePage to synchronous JSON + dictionary-based translations
  - Static UI text: `de.json`/`en.json` via `t()` function
  - Page-specific text: Inline `lang === 'en'` ternaries
  - ROI Calculator: `<T>` component with synchronous dictionary lookup
  - Dynamic DB content: Backend `/api/translate/article/{slug}` endpoint
  - Removed slow `TranslatePage` wrapper from all 15+ pages
  - Testing: 100% pass rate (iteration_10)

## Architecture
### Translation System
- `/app/frontend/src/i18n/de.json` & `en.json` - Static string dictionaries
- `/app/frontend/src/context/LanguageContext.jsx` - Global language state + `t()` helper
- `/app/frontend/src/components/T.jsx` - Synchronous German->English dictionary component (no API calls)
- Backend `/api/translate/article/{slug}` - MyMemory API with MongoDB caching for dynamic content

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
