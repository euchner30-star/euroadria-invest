# EuroAdria — Gesamtübersicht Architektur & Features

## Tech-Stack
| Bereich | Technologie |
|---------|------------|
| **Frontend** | React 19 + TailwindCSS + Shadcn/UI + Recharts |
| **Backend** | Python FastAPI + Motor (async MongoDB) |
| **Datenbank** | MongoDB Atlas |
| **File Storage** | Emergent Object Storage (CDN) + MongoDB GridFS (Legacy) |
| **E-Mails** | Resend API (Transactional) |
| **Hosting** | Render.com (Production) |
| **OG Images** | Pillow (PIL) — dynamische Generierung |
| **Auth** | HTTP Basic (Admin) + JWT (Team CRM) |

## Codebase-Statistik
- **Backend**: ~19.600 Zeilen Python
- **Frontend**: ~28.500 Zeilen JSX/JS
- **API-Endpunkte**: 191
- **MongoDB Collections**: 33
- **Frontend-Seiten**: 30+
- **Admin-Komponenten**: 10

---

## 🔧 BACKEND-ARCHITEKTUR

### Core-Dateien
| Datei | Funktion |
|-------|----------|
| `server.py` | FastAPI App, CORS, Middleware, Startup |
| `core.py` | MongoDB Client, Resend Config, Admin Auth, SITE_URL |
| `models.py` | Pydantic Schemas |
| `emails.py` | HTML E-Mail Templates, Wrap-Funktion |
| `object_storage.py` | Emergent Object Storage Helper (Upload, Download, Cache) |
| `investment_models.py` | ROI/Investment Berechnungen |

### API-Routes (17 Dateien)
| Route-Datei | Prefix | Funktion |
|-------------|--------|----------|
| `analytics.py` | `/api/admin/` | Admin Dashboard, Leads CRUD, Commissions, Team, Produkte, Aktivitäten |
| `team.py` | `/api/team/` | Team CRM Login, Lead-Bearbeitung, E-Mails, Notizen, Dokumente, Download-Links |
| `properties.py` | `/api/` | Immobilien CRUD, Image Upload (Object Storage), PDF Exposé, OG-Images, Inquiry, Share, Tracking |
| `articles.py` | `/api/` | Blog CRUD, OG-Images für Artikel, SEO |
| `contact.py` | `/api/` | Kontaktformular |
| `newsletter.py` | `/api/` | Newsletter Signup/Unsubscribe |
| `events.py` | `/api/` | Veranstaltungen |
| `regions.py` | `/api/` | Regionen/Standorte |
| `investment.py` | `/api/` | ROI Calculator, Investment Simulation |
| `pages.py` | `/api/` | CMS-Seiten |
| `uploads.py` | `/api/` | Datei-Uploads |
| `crm.py` | `/api/` | Lead-Capture Formulare |
| `comments.py` | `/api/` | Blog-Kommentare |
| `settings.py` | `/api/` | Site-Einstellungen |
| `translate.py` | `/api/` | Übersetzungen DE↔EN |
| `youtube.py` | `/api/` | YouTube Integration |

### Datenbank-Schema (Wichtigste Collections)
| Collection | Felder | Docs |
|-----------|--------|------|
| `leads` | name, email, phone, source, status, assigned_to, property_value, property_type, commission_amount | 58 |
| `team_members` | email, name, password (bcrypt), role (member/restricted/teamleader), reports_to, commission_rate | 2 |
| `properties` | title, price, price_on_request, location, area_sqm, rooms, property_type, images[], pdf_expose_id, status | 2 |
| `products_catalog` | name, price, category, commission_tiers[], assigned_to[], active | 3 |
| `articles` | title, slug, content, excerpt, image, category, published | 5 |
| `documents` | storage_path, filename, label, content_type, size, uploaded_by | 1 |
| `download_links` | download_id (UUID), storage_path, filename, lead_id, download_count | - |
| `email_opens` | tracking_id, lead_id, email, property_id, open_count, last_opened | 1 |
| `lead_emails` | lead_id, to, subject, body, sent_by, documents[], sent_at | - |
| `lead_notes` | lead_id, text, author, created_at | 4 |
| `property_locations` | name (auto-seeded: 18 Standorte) | 18 |
| `newsletter_subscribers` | email, name, subscribed | 3 |
| `page_views` | path, timestamp, referrer | 224 |
| `commission_models` | property_type, rate (%) | 6 |

---

## 🎨 FRONTEND-ARCHITEKTUR

### Öffentliche Seiten
| Seite | Route | Funktion |
|-------|-------|----------|
| `Home.jsx` | `/` | Hero, FeaturedProperties, TrustBar, FAQ |
| `PropertyListings.jsx` | `/properties` | Alle Immobilien mit Filtern (Standort, Typ, Preis) |
| `PropertyListings.jsx` (Detail) | `/properties/:id` | Detail-Ansicht mit Galerie, Beschreibung, Inquiry-Formular, Share-Button, Ähnliche Objekte |
| `BlogPage.jsx` | `/blog` | Blog-Übersicht |
| `ArticlePage.jsx` | `/blog/:slug` | Einzelner Artikel mit Share-Buttons |
| `ContactPage.jsx` | `/contact` | Kontaktformular |
| `LeistungenPage.jsx` | `/services` | Dienstleistungen |
| `EventsPage.jsx` | `/events` | Veranstaltungen |
| `TeamPage.jsx` | `/team` | Team-Vorstellung |
| `InfrastrukturRadarPage.jsx` | `/infrastruktur-radar` | Infrastruktur-Projekte |
| `SerbiaExecutivePage.jsx` | `/serbia-executive` | Serbien Business |
| `WhitepaperPage.jsx` | `/whitepaper` | Download-Gate |
| `USLandingPage.jsx` | `/us-investors` | US-Zielgruppe Landing |
| `USCALandingPage.jsx` | `/usca-investors` | US/CA Landing |
| `CryptoBankingPage.jsx` | `/crypto-banking` | Crypto Services |

### Immobilien-Standortseiten
| Seite | Route |
|-------|-------|
| `BudvaPage.jsx` | `/investment/standort/budva` |
| `PodgoricaPage.jsx` | `/investment/standort/podgorica` |
| `ZabljakPage.jsx` | `/investment/standort/zabljak` |
| `NiksicPage.jsx` | `/investment/standort/niksic` |
| `SkadarLakePage.jsx` | `/investment/standort/skadar-lake` |

### Investment-Tools
| Seite | Route | Funktion |
|-------|-------|----------|
| `ROICalculator.jsx` | `/investment/roi` | ROI-Rechner |
| `InvestmentSimulation.jsx` | `/investment/simulation` | Investment-Simulation |
| `LocationComparison.jsx` | `/investment/compare` | Standort-Vergleich |
| `LocationProfile.jsx` | `/investment/standort/:slug` | Standort-Detail |
| `InvestmentDashboard.jsx` | `/investment` | Investment-Übersicht |

### Admin Panel (`/admin`)
| Tab | Komponente | Funktion |
|-----|-----------|----------|
| Dashboard | `AnalyticsDashboard.jsx` | KPIs, Lead-Tabelle, Lead-Detail-Modal (editierbar), CSV Export/Import, E-Mail senden |
| Aktivitäten | `TeamActivities.jsx` | Team-Aktivitäten Feed (Notes, Emails, System), Filter nach Mitarbeiter/Zeitraum |
| Pipeline | `CRMPipeline.jsx` | Kanban-Board (8 Stages), Drag & Drop, Revenue Dashboard |
| Revenue | `CRMPipeline.jsx` (RevenueDashboard) | Umsatz-Übersicht |
| Team & Provisionen | `TeamManagement.jsx` | Mitglieder CRUD, Rollen, Provisionen-Tabelle, **Produkte & Provisionsstaffeln** |
| Immobilien | `PropertyManager.jsx` | Property CRUD, Bild/PDF Upload, Standort-Verwaltung |
| Newsletter | `NewsletterAdmin.jsx` | Subscriber-Verwaltung |
| PDF Generator | `PDFGenerator.jsx` | Exposé-Generierung |
| Seiten | in `AdminPage.jsx` | CMS für Textseiten |
| Blog | in `AdminPage.jsx` | Artikel CRUD mit WYSIWYG |
| Regionen | in `AdminPage.jsx` | Regionen-Verwaltung |
| Events | in `AdminPage.jsx` | Veranstaltungen CRUD |
| Downloads | in `AdminPage.jsx` | File-Management |
| Homepage | in `AdminPage.jsx` | Hero-Konfiguration |
| SEO/Tracking | in `AdminPage.jsx` | GTM, GA4, Meta Pixel |

### Team CRM (`/team`)
| Bereich | Funktion |
|---------|----------|
| Login | JWT-Auth (Email + Password) |
| Lead-Übersicht | Sortierbar, filterbar, Suche |
| Lead-Detail | **Editierbare** Kontaktfelder (Name, Email, Phone, Source), Status-Änderung, Notizen, E-Mail-Composer |
| E-Mail senden | Corporate Signatur, Dokumente als Download-Links (statt Anhänge), E-Mail-History |
| Provisions-Übersicht | Pipeline Value, Won Value, Pending, Confirmed |
| Meine Produkte | Zugewiesene Produkte mit Provisionsstaffeln |
| Auto-Logout | 30 Min Inaktivität |

### Shared Components
| Komponente | Funktion |
|-----------|----------|
| `Header.jsx` | Navigation mit Immobilien-Dropdown, Sprachumschalter |
| `Footer.jsx` | Footer mit Links, Social Media |
| `Hero.jsx` | Hero-Section |
| `FeaturedProperties.jsx` | Property-Grid auf der Homepage |
| `LocationProperties.jsx` | Property-Grid pro Standort |
| `ShareButtons.jsx` | Social Share (Blog) |
| `CookieConsent.jsx` | DSGVO Cookie-Banner |
| `WhatsAppButton.jsx` | Floating WhatsApp Button |
| `NewsletterSignup.jsx` | Newsletter-Formular |
| `SEO.jsx` | Meta-Tags, Structured Data |
| `T.jsx` | Translation Helper (DE/EN) |

---

## 📧 E-MAIL-SYSTEM

| Feature | Beschreibung |
|---------|-------------|
| **Team E-Mails** | Resend API, Corporate HTML-Signatur, Sender = Mitarbeiter-Name |
| **Dokumente als Links** | Upload → Object Storage → Download-Link in E-Mail (spart MBs) |
| **Inquiry-Bestätigung** | Kunde bekommt E-Mail mit Property-Bild + Signatur + Tracking-Pixel |
| **Team-Benachrichtigung** | Admin bekommt E-Mail bei neuer Inquiry |
| **Tracking-Pixel** | 1x1 GIF trackt E-Mail-Opens (Anzahl + Zeitstempel) |
| **Newsletter** | Signup/Unsubscribe mit Double-Opt-In |

---

## 🖼️ BILD & FILE SYSTEM

| Feature | Beschreibung |
|---------|-------------|
| **Object Storage** | Emergent CDN für neue Bilder (schnelle Ladezeiten) |
| **GridFS Fallback** | Alte Bilder aus MongoDB GridFS |
| **OG-Images** | Pillow generiert 1200x630 JPG mit Property-Bild + EuroAdria Logo + Titel/Preis |
| **Blog OG-Images** | Gleiches System für Blog-Artikel |
| **Logo Cache** | Logo + Fonts einmalig gecached (Memory-Leak Fix) |
| **OG-Image Cache** | Max 20 Bilder, 1h TTL, Browser Cache 24h |
| **Dokument-Bibliothek** | PDFs/Dateien zentral speichern, Team kann auswählen |
| **Download-Links** | UUID-basiert, Download-Counter, öffentlich zugänglich |

---

## 🔐 AUTH & SICHERHEIT

| Feature | Beschreibung |
|---------|-------------|
| **Admin** | HTTP Basic Auth (`admin` / `euroadria2025`) |
| **Team CRM** | JWT in LocalStorage, Bcrypt Passwörter |
| **Rollen** | `member` (alle Leads), `restricted` (nur zugewiesene), `teamleader` (Team-Bonus) |
| **Auto-Logout** | 30 Min Inaktivität |
| **Security Headers** | HSTS, X-Frame-Options, CSP, Referrer-Policy |
| **Provisions-Schutz** | Nur Admin kann Provisionen bestätigen/ändern |
| **Produkt-Zugriff** | Team sieht nur explizit zugewiesene Produkte |

---

## 📊 TRACKING & ANALYTICS

| Feature | Beschreibung |
|---------|-------------|
| **GTM** | Google Tag Manager |
| **GA4** | Google Analytics 4 (Dual) |
| **Meta Pixel** | Facebook/Instagram Tracking |
| **Page Views** | Eigene Collection für Seitenaufrufe |
| **WhatsApp Clicks** | Tracking von WhatsApp-Button Klicks |
| **E-Mail Opens** | Tracking-Pixel mit Open-Count |
| **Download Tracking** | Zählt Downloads pro Link |

---

## 🌍 SEO & SOCIAL

| Feature | Beschreibung |
|---------|-------------|
| **Sitemap** | Dynamisch generiert (`/api/sitemap.xml`) |
| **robots.txt** | Crawl-Regeln mit Allow für OG-Endpunkte |
| **OG Meta-Tags** | Dynamisch per react-helmet-async |
| **Share-Endpunkt** | `/api/p/{id}` für Immobilien, `/api/og/blog/{slug}` für Blog |
| **Übersetzungen** | DE/EN Toggle, Translation API |

---

## 🏗️ PRODUKT-KATALOG & PROVISIONEN

| Feature | Beschreibung |
|---------|-------------|
| **Produkte** | Name, Preis, Kategorie (Relocation/Immobilien/Consulting/Service/Premium) |
| **Provisionsstaffeln** | Variable Raten: z.B. Start 10%, ab 5 Sales 12%, ab 10 Sales 15% |
| **Team-Zuweisung** | Admin weist Produkte an Vertriebler zu (Toggle-Buttons) |
| **CRM-Ansicht** | Team sieht "My Products" mit €-Berechnung pro Staffel |
| **Beispiel-Produkte** | Relocation 120 (2.500€), Relocation Premium (5.000€), Immobilienpaket (250.000€) |

---

## 📁 VERZEICHNISSTRUKTUR

```
/app
├── backend/
│   ├── server.py              # FastAPI App Entry
│   ├── core.py                # DB, Auth, Config
│   ├── models.py              # Pydantic Models
│   ├── emails.py              # E-Mail Templates
│   ├── object_storage.py      # CDN Storage Helper
│   ├── investment_models.py   # ROI Berechnungen
│   ├── requirements.txt       # Python Dependencies
│   ├── .env                   # MONGO_URL, DB_NAME, RESEND_API_KEY, EMERGENT_LLM_KEY
│   └── routes/
│       ├── analytics.py       # Admin Dashboard + Leads + Products
│       ├── team.py            # Team CRM + Documents + Downloads
│       ├── properties.py      # Immobilien + OG Images + Inquiry
│       ├── articles.py        # Blog + OG Images
│       ├── contact.py         # Kontaktformular
│       ├── newsletter.py      # Newsletter
│       ├── events.py          # Events
│       ├── regions.py         # Regionen
│       ├── investment.py      # Investment Tools
│       ├── pages.py           # CMS
│       ├── uploads.py         # File Uploads
│       ├── crm.py             # Lead Capture
│       ├── comments.py        # Kommentare
│       ├── settings.py        # Settings
│       ├── translate.py       # Übersetzungen
│       └── youtube.py         # YouTube
│
├── frontend/
│   ├── .env                   # REACT_APP_BACKEND_URL
│   ├── public/
│   │   └── robots.txt
│   └── src/
│       ├── App.js             # Router + Layout
│       ├── pages/             # 30+ Seiten
│       │   ├── Home.jsx
│       │   ├── AdminPage.jsx  # ~4.600 Zeilen (Admin CMS)
│       │   ├── TeamCRM.jsx    # ~960 Zeilen (Team CRM)
│       │   ├── PropertyListings.jsx
│       │   ├── BlogPage.jsx
│       │   └── ...
│       └── components/
│           ├── Header.jsx, Footer.jsx, Hero.jsx
│           ├── FeaturedProperties.jsx
│           ├── LocationProperties.jsx
│           ├── ShareButtons.jsx
│           └── admin/
│               ├── AnalyticsDashboard.jsx  # ~1.400 Zeilen
│               ├── CRMPipeline.jsx
│               ├── TeamManagement.jsx
│               ├── TeamActivities.jsx
│               ├── PropertyManager.jsx
│               ├── PDFGenerator.jsx
│               └── ...
│
├── memory/
│   ├── PRD.md
│   └── test_credentials.md
│
└── docs/
    └── CRM_Anleitung.md
```
