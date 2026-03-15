# EuroAdria - Product Requirements Document

## Projekt-Übersicht
EuroAdria ist eine professionelle Website für eine Investment-, Business- und Lifestyle-Beratung mit Fokus auf die Adria/Balkan-Region. Die Website dient als Ergänzung zur Haupt-Website euroadria.me.

## Zielgruppe
- DACH-Investoren (Deutschland, Österreich, Schweiz)
- Auswanderer und Digital Nomads
- Unternehmer und Geschäftsleute

## Design-System (Exakt wie euroadria.me)
**Farben:**
- **ea-dark:** #04151F (Haupt Navy)
- **ea-light:** #F9F5EE (Creme Hintergrund)
- **ea-gold:** #D5B781 (Akzentfarbe Gold)
- **ea-navy:** #0E2A3B (Sekundäres Navy)
- **ea-white:** #FFFFFF

**Schriftart:**
- **Figtree** (von onecdn.io)
- Header: font-weight 600, line-height 1.3
- Text: font-weight 400, line-height 1.5

**Button-Styles:**
- CTA Buttons: bg-ea-dark mit weißem Text
- Sekundäre Buttons: bg-ea-gold mit ea-dark Text

---

## Implementierter Umfang

### ✅ Frontend (React + TailwindCSS)
- **Homepage** mit Hero-Sektion und Testimonials
- **Blog-Seite** mit 60 Artikeln in 6 Themen-Clustern
- **Artikel-Detailseiten** mit Due Diligence Box und Expert Tips
- **Team-Seite** mit Milena Bubanja & Holger Kuhlmann
- **Kontakt-Seite** mit Kontaktformular
- **Serbia Executive Access Seite:** `/serbia-executive`
  - Video-Intro
  - Government Relations
  - Infrastructure & PPP
  - Incentives & Subsidies
  - Executive Inquiry Formular (MOCKED)
  - ShareButtons & Kommentare integriert
- **Rechtliche Seiten:**
  - Impressum (inkl. Niederlassung)
  - Datenschutz (DSGVO-konform)

### ✅ Backend (FastAPI + MongoDB)
- **REST API für Artikel:**
  - `GET /api/articles` - Alle Artikel (mit Filtern)
  - `GET /api/articles/{slug}` - Einzelner Artikel
  - `GET /api/clusters` - Themen-Cluster mit Anzahl
  - `GET /api/categories` - Kategorien
- **Admin API (HTTP Basic Auth):**
  - `POST /api/admin/articles` - Artikel erstellen
  - `PUT /api/admin/articles/{id}` - Artikel bearbeiten
  - `DELETE /api/admin/articles/{id}` - Artikel löschen
  - `GET /api/admin/verify` - Login-Verifizierung
- **Kommentar-System:**
  - `POST /api/comments` - Kommentar erstellen
  - `GET /api/comments/{article_id}` - Kommentare abrufen
  - Admin-Moderation (approve/reject)

### ✅ SEO
- react-helmet-async für dynamische Meta-Tags
- sitemap.xml und robots.txt
- Strukturierte Daten (JSON-LD)
- Scroll-to-Top Komponente

---

## Abgeschlossene Arbeiten

### 15. März 2026 - Design-Überarbeitung
- ✅ Komplette Design-Überarbeitung um euroadria.me 1:1 zu replizieren
- ✅ Farben aktualisiert: Navy (#04151F), Gold (#D5B781), Creme (#F9F5EE)
- ✅ Schriftart auf Figtree geändert
- ✅ Alle Komponenten und Seiten refaktoriert
- ✅ tailwind.config.js mit ea-* Farbpalette
- ✅ index.css mit CSS-Variablen
- ✅ Team-Seite (Über uns) korrigiert - jetzt lesbar
- ✅ Admin Panel komplett gestylt
- ✅ Alle Tests bestanden (44/44 Frontend, 24/24 Backend)

### Frühere Arbeiten
- ✅ Serbia Executive Access Seite erstellt
- ✅ SEO-Implementierung
- ✅ Scroll-to-Top Fix
- ✅ SMTP-Code vorbereitet (wartet auf User-Credentials)

---

## Bekannte Issues

### Blockiert
- **SMTP-Konfiguration:** Backend-Code ist bereit. Wartet auf SMTP-Zugangsdaten vom Benutzer.

---

## Anmeldedaten

### Admin Panel
- **URL:** /admin
- **Username:** admin
- **Password:** euroadria2025

---

## Zukünftige Aufgaben (Backlog)

### P1 (Hoch)
- Produktions-Deployment und Custom Domain Setup

### P2 (Mittel)
- Newsletter-Integration
- Immobilien-Sektion

### P3 (Niedrig)
- Enhanced Admin Authentication (Refactoring von Hardcoded Login)

---

## Tech Stack

- **Frontend:** React, TailwindCSS, react-helmet-async
- **Backend:** FastAPI, Pydantic
- **Datenbank:** MongoDB
- **Architektur:** Headless CMS

---

## API Endpoints

### Öffentlich
- `GET /api/articles` - Alle Artikel
- `GET /api/articles/{slug}` - Einzelner Artikel
- `GET /api/articles/featured` - Featured Artikel
- `GET /api/clusters` - Themen-Cluster
- `GET /api/comments/{article_id}` - Kommentare

### Admin (Basic Auth erforderlich)
- `POST /api/admin/login` - Login
- `GET /api/admin/articles` - Artikel verwalten
- `POST /api/admin/articles` - Artikel erstellen
- `PUT /api/admin/articles/{id}` - Artikel bearbeiten
- `DELETE /api/admin/articles/{id}` - Artikel löschen
- `GET /api/admin/comments` - Kommentare moderieren
- `PUT /api/admin/comments/{id}/status` - Kommentar-Status ändern

---

## Datenbankschema

### articles
```json
{
  "slug": "string",
  "title": "string",
  "cluster": "string",
  "category": "string",
  "teaser": "string",
  "content": "string",
  "author": "string",
  "date": "string",
  "image": "string",
  "readTime": "string",
  "featured": "boolean",
  "expertTip": { "author": "string", "title": "string", "content": "string" },
  "dueDiligenceBox": { "title": "string", "content": "string" }
}
```

### comments
```json
{
  "article_id": "string",
  "article_slug": "string",
  "name": "string",
  "email": "string",
  "content": "string",
  "status": "pending|approved|rejected",
  "created_at": "datetime"
}
```
