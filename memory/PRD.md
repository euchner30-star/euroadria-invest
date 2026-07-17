# EuroAdria Investment Intelligence Platform - PRD

## Original Problem Statement
Professional "Investment Intelligence Platform" for the Balkan region with full CMS + Sales CRM. Decoupled architecture (React + FastAPI + MongoDB Atlas), hosted on Render.

## Tech Stack
- **Frontend:** React 19, TailwindCSS, Recharts, Leaflet
- **Backend:** FastAPI, Motor (async MongoDB), Resend API
- **Database:** MongoDB Atlas (GridFS for files)
- **Hosting:** Render (512MB RAM)
- **Tracking:** GTM, GA4 (dual), Meta Pixel

## Completed Features (Latest First)
- **Sales CRM Phase 1** (2026-07-10): Extended pipeline (8 stages), property details (value/type/location), commission system (3% default, configurable per member), commission dashboard with pipeline/won/pending/confirmed values, deal list
- **D. Lein Account** (2026-07-10): Restricted team member, sees only assigned leads
- **Lead Assignment** (2026-07-10): Admin assigns leads to team members via dropdown
- **Manual Lead Creation** (2026-07-10): Admin can add leads manually
- **CSV Lead Import** (2026-07-10): Bulk import with auto-delimiter detection, duplicate check, source labeling, source filter dropdown
- **53 Facebook Campaign Leads imported** (preview DB)
- **Admin Email Tool** (2026-07-07): Holger sends emails from admin panel with corporate signature
- **Team CRM Email Tool** (2026-07-07): Milena/D.Lein send emails with signature + logo
- **Double Logo Fix**: wrap_email(include_footer=False) for team emails
- **Lead Detail Modal** (2026-07-06): Clickable leads, notes, email composer
- **Admin "Alle Leads"**: Full list with search + source filter
- All previous features (translation, tracking, GridFS, etc.)

## Pipeline Stages
new → contacted → qualified → offer → negotiation → contract → won → lost

## Commission System
- Default rate: 3% of property_value
- Configurable per team member via PUT /api/admin/team-members/{email}/commission
- Commission pending when status=won
- Commission confirmed by admin via PUT /api/admin/leads/{id}/confirm-commission

## Team Roles
- **member** (Milena): Full access to all leads
- **restricted** (D. Lein): Only sees assigned leads

## TODO (P1 - Phase 2)
- Admin commission confirmation flow in UI
- Commission export (PDF/CSV)
- Easy team member creation (admin UI)
- Commission rate per team member configurable from UI

## Upcoming (P1)
- Lead Reactivation (WhatsApp)
- Apartment-Listing (real DB data)
- Video Background Hero
- Podcast Integration

## Backlog (P2)
- Template-Speichern PDF Generator
- Google Docs Import
- Team hierarchy / Teamleiter view
- Performance dashboard per rep
- Auto commission notifications

## Key API Endpoints (Sales CRM)
- PUT /api/team/leads/{id} - Update with property_value, property_type, property_location
- GET /api/team/commissions - Commission dashboard data
- PUT /api/admin/team-members/{email}/commission - Set commission rate
- PUT /api/admin/leads/{id}/confirm-commission - Confirm commission
- PUT /api/admin/leads/{id}/assign - Assign lead to member
- POST /api/admin/leads/import - CSV bulk import
- POST /api/admin/leads - Manual lead creation
- GET /api/admin/team-members - List team members
