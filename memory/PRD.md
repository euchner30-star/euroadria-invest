# EuroAdria Investment Intelligence Platform — PRD

## Architecture
- **Frontend:** React + TailwindCSS → Render Static Site
- **Backend:** FastAPI + Motor → Render Web Service
- **Database:** MongoDB Atlas
- **Deployment:** GitHub push → Render auto-deploy

## Implemented Features
- [x] Investment Dashboard, ROI Calculator, Interactive Maps
- [x] AEO Blog with Due Diligence, Expert Tips, Bulk Import
- [x] Admin Panel (CMS), Analytics Dashboard, UTM Tracking
- [x] Lead Generation, Newsletter (Brevo), Contact (Resend)
- [x] Google Analytics GA4, Search Console
- [x] Crypto-Banking & Compliance Pages
- [x] Download URL/Exposé in Article Editor
- [x] YouTube Data API v3 — Dynamic Video Slider (1h cache)
- [x] **Complete DE/EN Translation** — Language toggle, static JSON translations, auto-page-translation via TranslatePage component, backend batch API with MongoDB caching

## Pending
- P1: Admin UI for Investment Data, Heatmaps, Apartment-Listings
- P2: Video Hero, Multi-language (Serbisch), FunnelCockpit, Custom Domain

## Render Environment Variables
`MONGO_URL`, `RESEND_API_KEY`, `BREVO_API_KEY`, `YOUTUBE_API_KEY`, `YOUTUBE_PLAYLIST_ID`, `CORS_ORIGINS`
