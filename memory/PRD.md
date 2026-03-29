# EuroAdria - Product Requirements Document

## Original Problem Statement
Professional "Investment Intelligence Platform" for the Balkan region with full CMS. Deployed on Render with MongoDB Atlas. Admin panel for managing articles, hero images, PDF Exposé downloads, and download URLs.

## Architecture
- **Frontend:** React + TailwindCSS (Static Site on Render: `euroadria-invest`)
- **Backend:** FastAPI + Motor/MongoDB (Web Service on Render: `invest.euroadria`)
- **Database:** MongoDB Atlas (remote)
- **Email:** Resend API
- **Images:** imgBB (external hosting)
- **PDFs/Exposés:** External URLs (Google Drive, Dropbox)
- **GitHub Repo:** `euchner30-star/euroadria-invest` (branch: `main`)
- **GitHub Push:** Via token from CLI (`git push github main`)

## What's Been Implemented

### Core Features
- Investment Dashboard with ROI Calculator
- AEO-optimized Blog with Expert Tips
- Admin Panel (Articles, Comments, Regions, Pages CMS, Downloads)
- Contact Form with Resend email notifications
- Dynamic Location Profiles (5 Immobilien-Seiten)
- Infrastructure Radar

### Completed Tasks (Latest First)
- ✅ SEO Boost: Dynamic sitemap, 8 FAQ schema, LocalBusiness, BreadcrumbList, AggregateRating (29. März 2026)
- ✅ Emergent badge completely removed from index.html (29. März 2026)
- ✅ n-tv & RTL buttons added to article content in live DB (29. März 2026)
- ✅ Team member titles fixed in DB + code (29. März 2026)
- ✅ Article sorting with sortOrder field (29. März 2026)
- ✅ Downloads tab in Admin Panel - 6 configurable URLs (29. März 2026)
- ✅ Download URL / Exposé Feature in Admin + Article View (29. März 2026)
- ✅ Pillow added to requirements.txt for Render deployment
- ✅ Direct Git push to GitHub (via user token)
- ✅ Migration to MongoDB Atlas
- ✅ Render deployment (Frontend + Backend)
- ✅ Resend API email integration
- ✅ ROI Calculator input fix
- ✅ Expert Tip names updated
- ✅ Header CTA button slimmed
- ✅ metaTitle/metaDescription added to ArticleUpdate

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

## DB Schema - Site Settings (Downloads)
```json
{
  "key": "downloads",
  "praxisleitfaden_url": "string",
  "budva_expose_url": "string",
  "niksic_expose_url": "string",
  "podgorica_expose_url": "string",
  "skadar_lake_expose_url": "string",
  "zabljak_expose_url": "string"
}
```

## Prioritized Backlog

### P0 (Critical)
- Custom Domain Setup (`invest.euroadria.me`) — CNAME at Namecheap (NEXT SESSION)

### P1 (Important)
- Admin Panel for Investment Data (Locations, Infrastructure)
- Heatmap Visualizations on investment map
- Google Search Console: Submit sitemap (`/api/sitemap.xml`)

### P2 (Nice to Have)
- FunnelCockpit Tracking (blocked on user providing code)
- Missing 54 articles (user to manually re-add)
- Apartment-Listing functionality
- Newsletter Integration
- AdminPage.jsx / server.py refactoring (monoliths)

## Known Issues
- WYSIWYG editor text writing backward on mobile (testing pending)
- Render ephemeral storage: local file uploads wiped on deploy (using external URLs)

## Key API Endpoints
- `POST /api/contact` — Resend email
- `POST /api/calculator/roi` — ROI calculation
- `GET/POST/PUT/DELETE /api/articles` — Article CRUD (supports downloadUrl, sortOrder)
- `GET /api/settings/downloads` — Public download URLs
- `PUT /api/admin/settings/downloads` — Admin update download URLs
- `GET /api/sitemap.xml` — Dynamic sitemap
- `GET/POST/PUT/DELETE /api/admin/*` — Admin endpoints (HTTP Basic Auth)

## Admin Credentials
- Local: `admin` / `euroadria2025`
- Render (live): `office@euroadria.me` / `IsTH42#HZMC4q@3A7ITfp#Ip` (set via ADMIN_USERNAME/ADMIN_PASSWORD env vars)

## 3rd Party Integrations
- Resend API (emails) — RESEND_API_KEY in Render env
- MongoDB Atlas — MONGO_URL in Render env
- imgBB (image hosting) — managed by user externally
