# EuroAdria Investment Intelligence Platform — PRD

## Original Problem Statement
Professional "Investment Intelligence Platform" for the Balkan region with full CMS. Hosted on Render with MongoDB Atlas. Features include ROI calculator, dynamic location profiles, contact form with email (Resend), AEO-optimized blog, interactive maps, Admin Panel (CMS), Lead Generation, Analytics Dashboard, Brevo Newsletter, Crypto-Banking/Compliance pages, and YouTube Video Slider.

## Architecture
- **Frontend:** React + TailwindCSS (Render Static Site)
- **Backend:** FastAPI + Motor (Render Web Service)
- **Database:** MongoDB Atlas (Remote)
- **Deployment:** GitHub push → Render auto-deploy (`euchner30-star/euroadria-invest`)

## What's Been Implemented (Latest: 2026-02-04)
- [x] E2E Investment Dashboard with ROI Calculator
- [x] AEO-optimized Blog with Due Diligence Checklists & Expert Tips
- [x] Admin Panel with Article Bulk-Import (CSV/XLSX/DOCX)
- [x] Analytics Dashboard with UTM Tracking
- [x] Lead Generation Modals (Exposé downloads, newsletter)
- [x] Google Analytics GA4 & Search Console Verification
- [x] Media Mentions (Focus, VC Magazin, Kosmo)
- [x] Social Share Buttons with Copy Link
- [x] Contact Form via Resend API
- [x] Interactive Maps with Category Tabs
- [x] Brevo Newsletter Integration
- [x] Crypto-Banking & Compliance Landing Pages
- [x] Download URL/Exposé field in Admin Article Editor
- [x] **YouTube Data API v3 Integration** — Dynamic video slider with live view counts, 1-hour cache (2026-02-04)

## Pending / Backlog

### P1 — Upcoming
- Admin Panel UI for Investment Data (Locations, Infrastructure)
- Heatmap Visualizations on investment map
- Apartment-Listing functionality

### P2 — Future
- Video Background for Hero section
- Multi-language support (DE/EN/SR)
- FunnelCockpit Tracking (BLOCKED — awaiting user's code)
- Custom Domain (`invest.euroadria.me`) — user DNS configuration needed
- Cloudinary/S3 for native image uploads (currently using imgBB)

### Known Issues
- Render Cold Starts (free tier) — recommend paid plan
- WYSIWYG editor backward-text on mobile — testing pending

## Environment Variables (Render)
- `MONGO_URL` — MongoDB Atlas connection string
- `RESEND_API_KEY` — Resend email API
- `BREVO_API_KEY` — Brevo newsletter
- `YOUTUBE_API_KEY` — YouTube Data API v3
- `YOUTUBE_PLAYLIST_ID` — Channel uploads playlist
- `CORS_ORIGINS` — Allowed frontend origins
