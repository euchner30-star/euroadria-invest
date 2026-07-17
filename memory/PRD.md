# EuroAdria Investment Intelligence Platform - PRD

## Original Problem Statement
Professional "Investment Intelligence Platform" for the Balkan region with full CMS + Sales CRM. Decoupled architecture (React + FastAPI + MongoDB Atlas), hosted on Render.

## Completed Features (Latest)
### Sales CRM Phase 1+2 (2026-07-10/17)
- Extended pipeline: 8 stages (new→contacted→qualified→offer→negotiation→contract→won→lost)
- Property details: value, type (7 options), location
- Individual commission amounts per deal (not percentage)
- Commission dashboard in Team CRM: pipeline/won/pending/confirmed
- **Team Management UI** in Admin Panel: Create/Edit/Delete team members
- **Commission confirmation** by admin (button in Lead Detail Modal + Team tab)
- **Commission CSV Export** with all deal data
- **Configurable roles**: member (full access) / restricted (assigned leads only)
- D. Lein account (restricted), Lead assignment, CSV Import, Manual Lead Creation
- Email sending from Admin + Team CRM with corporate signature + logo

### Previous Features
- Full CMS (articles, pages, regions, events, newsletter)
- ROI Calculator, Investment Models
- Tracking (GTM, GA4 dual, Meta Pixel - DSGVO compliant)
- GridFS file storage, PDF streaming
- English translation, Team CRM, Email tracking

## Pipeline Stages
new → contacted → qualified → offer → negotiation → contract → won → lost

## Commission System
- Individual amount per deal (set by sales rep or admin)
- Pending when status=won
- Confirmed by admin via "Provision bestätigen" button
- Visible in Team CRM dashboard + Admin Team tab

## Team Roles
- **member** (Milena): Full access to all leads
- **restricted** (D. Lein): Only sees assigned leads

## Key API Endpoints
### Sales CRM
- PUT /api/team/leads/{id} - Update with property_value, property_type, property_location, commission_amount
- GET /api/team/commissions - Commission dashboard for current member
- POST /api/admin/team-members - Create team member
- PUT /api/admin/team-members/{email} - Update member (name, role, commission_rate)
- DELETE /api/admin/team-members/{email} - Delete member
- GET /api/admin/commissions - All commissions for export
- PUT /api/admin/leads/{id}/confirm-commission - Confirm commission
- PUT /api/admin/leads/{id}/assign - Assign lead to member
- POST /api/admin/leads/import - CSV bulk import
- POST /api/admin/leads - Manual lead creation

## Upcoming
- Lead Reactivation (WhatsApp)
- Apartment-Listing (real DB data)
- Video Background Hero
- Podcast Integration

## Backlog
- Team hierarchy / Teamleiter view
- Performance dashboard per rep
- Auto commission notifications
- Template-Speichern PDF Generator
- Google Docs Import
