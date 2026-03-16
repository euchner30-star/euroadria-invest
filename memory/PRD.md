# EuroAdria - Product Requirements Document

## Projekt-Übersicht
EuroAdria ist eine professionelle Website für eine Investment-, Business- und Lifestyle-Beratung mit Fokus auf die Adria/Balkan-Region. Die Website dient als Ergänzung zur Haupt-Website euroadria.me.

---

## Letzte Änderungen (16. März 2026 - Abend)

### ✅ Team-Seite CMS Integration Fix
- **Bug behoben:** Team-Mitglieder-Bilder wurden nicht vom CMS angezeigt
- **Ursache:** Default-Bildpfade in server.py zeigten auf nicht existierende Dateien (`/uploads/team-holger.webp`)
- **Lösung:** Bildpfade auf existierende Dateien aktualisiert (`/holger-kuhlmann.jpg`, `/milena-bubanja.jpg`)
- **Status:** TeamSection.jsx holt Daten von `pagesApi.getBySlug('team')` - CMS funktioniert vollständig
- **Tests:** 54/54 Backend-Tests, 54/54 Frontend-Tests bestanden

### ✅ DSGVO / Rechtliche Compliance Features
- **Cookie-Consent Banner implementiert:**
  - Erscheint beim ersten Besuch der Website
  - 3 Optionen: "Alle akzeptieren", "Nur notwendige", "Einstellungen anpassen"
  - Detaillierte Kategorien: Notwendig (immer aktiv), Analyse, Marketing
  - Speichert Einwilligung in localStorage (`euroadria_cookie_consent`)
  - Links zu Datenschutz & Impressum
  - Datei: `/app/frontend/src/components/CookieConsent.jsx`

- **Datenschutz-Einwilligung im Kontaktformular:**
  - Pflicht-Checkbox vor dem Absenden
  - Button deaktiviert bis Einwilligung gegeben
  - Link zur Datenschutzerklärung
  - Datei: `/app/frontend/src/pages/ContactPage.jsx` aktualisiert

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
- **Infrastruktur-Radar:** `/infrastruktur-radar`
  - Interaktive Leaflet.js Karte (iframe)
  - Investment-Scores für 23 Standorte
  - Lead-Magnet Exposé-Formular
- **Immobilienangebot-Sektion:** (NEU - 16. März 2026)
  - Dropdown-Navigation mit 5 Regionen
  - **Skadar-Lake:** `/immobilien/skadar-lake` - Score 88/100, €800-1.500/m²
  - **Žabljak:** `/immobilien/zabljak` - Score 91/100, €1.000-2.000/m²
  - **Budva:** `/immobilien/budva` - Score 82/100, €2.500-5.000/m²
  - **Nikšić:** `/immobilien/niksic` - Score 85/100, €600-1.200/m²
  - **Podgorica:** `/immobilien/podgorica` - Score 90/100, €1.500-3.000/m² (NEU)
  - Jede Seite mit Investment-Kennzahlen, Infrastruktur-Vorteilen, Apartments-Placeholder
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
  - `GET /api/comments/article/{article_id}` - Kommentare nach ID
  - `GET /api/comments/slug/{article_slug}` - Kommentare nach Slug (NEU)
  - Admin-Moderation (approve/reject)

### ✅ SEO
- react-helmet-async für dynamische Meta-Tags
- sitemap.xml und robots.txt
- Strukturierte Daten (JSON-LD)
- Scroll-to-Top Komponente

---

## Abgeschlossene Arbeiten

### 16. März 2026 - Immobilienangebot-Sektion & Bug-Fixes
- ✅ Dropdown-Navigation "Immobilienangebot" mit 4 Regionen implementiert
- ✅ Desktop: Hover/Click Dropdown mit Region-Links und Beschreibungen
- ✅ Mobile: Accordion-Style mit expandierbaren Region-Links
- ✅ 4 neue Premium-Landing-Pages erstellt:
  - Skadar-Lake: Naturparadies (Score 88, +40-60% Potenzial)
  - Žabljak: Ski-Resort der Zukunft (Score 91, +50-80% Potenzial)
  - Budva: Küstenmetropole (Score 82, 5-8% Mietrendite)
  - Nikšić: Industriezentrum (Score 85, +80-120% Potenzial)
- ✅ Jede Seite mit Investment-Kennzahlen, Infrastruktur-Vorteilen, Apartments-Placeholder
- ✅ Bug-Fix: WYSIWYG-Editor schreibt Text nicht mehr rückwärts auf Mobile
  - `handleFocus()` entfernt, Browser handelt Cursor natürlich
- ✅ Bug-Fix: Kommentar-Funktion auf Serbia Executive Seite repariert
  - Neuer Slug-basierter Endpoint: `/api/comments/slug/{slug}`
  - CommentsSection verwendet Slug wenn articleId >= 900
- ✅ 57 Frontend-Tests + 24 Backend-Tests bestanden

### 16. März 2026 - Navigation & Admin-Panel Erweiterung
- ✅ **Header-Navigation neu geordnet** (Benutzerfreundlich):
  - Logo → HOME → IMMOBILIENANGEBOT (Dropdown) → INFRASTRUKTUR-RADAR (NEU Badge)
  - BLOG, ÜBER UNS, KONTAKT, SERBIA EXECUTIVE rechts
- ✅ **Podgorica als 5. Region** hinzugefügt:
  - `/immobilien/podgorica` - Investment-Score 90/100
  - KCCG, Flughafen, Verwaltung als Infrastruktur-Vorteile
- ✅ **Admin-Panel Regionen-Tab**:
  - Neuer "Regionen" Tab im Admin Dashboard
  - CMS-verwaltete Regions-Landingpages
  - Felder: Titel, Untertitel, Investment-Score, WYSIWYG-Inhalt
  - Bullet-Points für Quick-Facts
  - Bilder-Galerie
  - Vordefinierte Slugs (skadar-lake, zabljak, budva, niksic, podgorica)
- ✅ **Backend Regions API** implementiert:
  - `GET /api/regions` - Alle Regionen
  - `GET /api/regions/{slug}` - Region nach Slug
  - `POST /api/admin/regions` - Region erstellen
  - `PUT /api/admin/regions/{slug}` - Region aktualisieren
  - `DELETE /api/admin/regions/{slug}` - Region löschen
  - Apartments-Verwaltung pro Region
- ✅ 73 Frontend-Tests + 36 Backend-Tests bestanden

### 15. März 2026 - SEO & GEO Optimierung
- ✅ Erweiterte Schema.org strukturierte Daten (Organization, ProfessionalService, InvestmentOrDeposit, FAQPage)
- ✅ GEO-optimierte Inhalte mit zitierfähigen Fakten (Weltbank-Ranking, Steuersätze, Förderquoten)
- ✅ Semantische HTML-Struktur (article, section, figure, figcaption)
- ✅ Content-Parser für Markdown-zu-HTML Konvertierung
- ✅ Interne Verlinkung zu Serbia Executive Access in relevanten Artikeln
- ✅ Erweiterte Meta-Tags und FAQ-Schema für KI-Systeme
- ✅ robots.txt für GPTBot, ClaudeBot und andere KI-Crawler optimiert

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

### Behoben
- ✅ WYSIWYG-Editor rückwärts-Text auf Mobile (handleFocus entfernt)
- ✅ Kommentare auf Serbia Executive Seite (Slug-basierter Endpoint)

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

### P0 (Kritisch)
- ✅ Immobilienangebot-Sektion implementiert

### P1 (Hoch)
- Karten-Standorte vom Infrastruktur-Radar mit Immobilien-Seiten verlinken
- Produktions-Deployment und Custom Domain Setup

### P2 (Mittel)
- Newsletter-Integration
- Konkrete Immobilien-Listings in Apartments-Sektion einfügen

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
- `GET /api/comments/article/{article_id}` - Kommentare nach Artikel-ID
- `GET /api/comments/slug/{article_slug}` - Kommentare nach Slug
- `GET /api/regions` - Alle Regionen (NEU)
- `GET /api/regions/{slug}` - Region nach Slug (NEU)

### Admin (Basic Auth erforderlich)
- `POST /api/admin/login` - Login
- `GET /api/admin/articles` - Artikel verwalten
- `POST /api/admin/articles` - Artikel erstellen
- `PUT /api/admin/articles/{id}` - Artikel bearbeiten
- `DELETE /api/admin/articles/{id}` - Artikel löschen
- `GET /api/admin/comments` - Kommentare moderieren
- `PUT /api/admin/comments/{id}/status` - Kommentar-Status ändern
- `GET /api/admin/regions` - Regionen verwalten (NEU)
- `POST /api/admin/regions` - Region erstellen (NEU)
- `PUT /api/admin/regions/{slug}` - Region bearbeiten (NEU)
- `DELETE /api/admin/regions/{slug}` - Region löschen (NEU)
- `POST /api/admin/regions/{slug}/apartments` - Apartment hinzufügen (NEU)

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
