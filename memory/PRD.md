# EuroAdria - Product Requirements Document

## Original Problem Statement
Professional "Investment Intelligence Platform" for the Balkan region with full CMS. Deployed on Render with MongoDB Atlas. Admin panel for managing articles, hero images, and PDF Exposé downloads.

## Architecture
- **Frontend:** React + TailwindCSS (Static Site on Render: `euroadria-invest`)
- **Backend:** FastAPI + Motor/MongoDB (Web Service on Render: `invest.euroadria`)
- **Database:** MongoDB Atlas (remote)
- **Email:** Resend API
- **Images:** imgBB (external hosting)
- **PDFs/Exposés:** External URLs (Google Drive, Dropbox)
- **GitHub Repo:** `euchner30-star/euroadria-invest` (branch: `main`)

## What's Been Implemented

### Core Features
- Investment Dashboard with ROI Calculator
- AEO-optimized Blog with Expert Tips
- Admin Panel (Articles, Comments, Regions, Pages CMS)
- Contact Form with Resend email notifications
- Dynamic Location Profiles
- Infrastructure Radar

### Completed Tasks (Latest First)
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
  "expertTip": { "author": "string", "title": "string", "content": "string" },
  "dueDiligenceBox": { "title": "string", "content": "string" },
  "downloadUrl": "string (optional, external PDF link)",
  "metaTitle": "string (optional)",
  "metaDescription": "string (optional)"
}
```

## Prioritized Backlog

### P0 (Critical)
- (none currently)

### P1 (Important)
- Custom Domain Setup (`invest.euroadria.me`) — CNAME at Namecheap
- Admin Panel for Investment Data (Locations, Infrastructure)
- Heatmap Visualizations on investment map
- Remove "Made with Emergent" watermark (re-appeared)

### P2 (Nice to Have)
- FunnelCockpit Tracking (blocked on user providing code)
- Missing 54 articles (user to manually re-add)
- Apartment-Listing functionality
- Newsletter Integration
- AdminPage.jsx / server.py refactoring (monoliths)

## Known Issues
- "Made with Emergent" watermark re-appeared on frontend
- WYSIWYG editor text writing backward on mobile (testing pending)
- Render ephemeral storage: local file uploads wiped on deploy (using external URLs as workaround)

## Key API Endpoints
- `POST /api/contact` — Resend email
- `POST /api/calculator/roi` — ROI calculation
- `GET/POST/PUT/DELETE /api/articles` — Article CRUD (supports downloadUrl)
- `GET/POST/PUT/DELETE /api/admin/*` — Admin endpoints (HTTP Basic Auth)

## 3rd Party Integrations
- Resend API (emails) — RESEND_API_KEY in Render env
- MongoDB Atlas — MONGO_URL in Render env
- imgBB (image hosting) — managed by user externally
