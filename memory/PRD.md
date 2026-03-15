# EuroAdria - Product Requirements Document

## Projekt-Übersicht
EuroAdria ist eine professionelle Website für eine Investment-, Business- und Lifestyle-Beratung mit Fokus auf die Adria/Balkan-Region.

## Zielgruppe
- DACH-Investoren (Deutschland, Österreich, Schweiz)
- Auswanderer und Digital Nomads
- Unternehmer und Geschäftsleute

## Design-Prinzipien
- **"Quiet Luxury"** Stil
- Navy Blue (#002147) als Basis
- Gold (#D4AF37) als Akzentfarbe
- Playfair Display für Headlines
- Montserrat für Body Text

---

## Implementierter Umfang

### ✅ Frontend (React + TailwindCSS)
- Homepage mit Hero-Sektion und Team-Präsentation
- Blog-Seite mit 60 Artikeln in 6 Themen-Clustern
- Artikel-Detailseiten mit Due Diligence Box und Expert Tips
- Team-Seite mit Milena Bubanja & Holger Kuhlmann
- Kontakt-Seite
- **Rechtliche Seiten:**
  - Impressum (inkl. Niederlassung Deutschland: Speditionsstraße 15a, 40221 Düsseldorf)
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

### ✅ CMS Admin Panel
- Login unter `/admin`
- Artikel-Liste mit Bearbeitungs- und Löschfunktion
- Artikel-Editor für alle Felder inkl. Due Diligence Box und Expert Tip
- **Credentials:** admin / euroadria2025

### ✅ Content
- **60 vollständige Artikel** in 6 Clustern:
  - A: Makro & Strategie (11)
  - B: Recht & Compliance (10)
  - C: Montenegro Regionen (10)
  - D: Serbien & Balkan (8)
  - E: Lifestyle & Relocation (10)
  - F: Business Setup (11)

---

## Technischer Stack
- **Frontend:** React 19, React Router, TailwindCSS, Lucide Icons
- **Backend:** FastAPI (Python), Motor (async MongoDB driver)
- **Database:** MongoDB
- **Auth:** HTTP Basic Authentication für Admin

## API-Endpunkte

### Öffentlich
| Methode | Endpoint | Beschreibung |
|---------|----------|--------------|
| GET | /api/articles | Alle Artikel |
| GET | /api/articles/{slug} | Artikel by Slug |
| GET | /api/articles/id/{id} | Artikel by ID |
| GET | /api/clusters | Cluster mit Anzahl |
| GET | /api/categories | Kategorien |

### Admin (Basic Auth)
| Methode | Endpoint | Beschreibung |
|---------|----------|--------------|
| GET | /api/admin/verify | Login prüfen |
| POST | /api/admin/articles | Erstellen |
| PUT | /api/admin/articles/{id} | Bearbeiten |
| DELETE | /api/admin/articles/{id} | Löschen |

---

## Verbleibende Aufgaben

### P1 - Wichtig
- [x] Social Sharing Buttons (implementiert)
- [ ] Newsletter-Integration (Email-Sammlung, Lead Magnet)
- [ ] SEO-Meta-Tags für alle Seiten

### P2 - Nice-to-Have
- [x] Kommentar-Funktion (implementiert mit Moderation)
- [ ] Artikel-Suche mit Volltextsuche
- [ ] Related Articles Algorithmus verbessern
- [ ] Multi-Language Support (DE/EN)
- [ ] Analytics Integration

### P3 - Zukunft
- [ ] Newsletter-Automatisierung
- [ ] User-Registrierung für Lead Magnet
- [ ] CRM-Integration
- [ ] Blog-Import von externen Quellen

---

## Dateistruktur

```
/app
├── backend
│   ├── server.py              # FastAPI Backend
│   ├── seed_articles.py       # Initial 17 Artikel
│   ├── add_remaining_articles.py  # +26 Artikel
│   ├── add_final_articles.py  # +17 Artikel
│   ├── .env                   # Credentials
│   └── requirements.txt
└── frontend
    ├── src
    │   ├── components/        # UI Komponenten
    │   ├── pages/             # Seiten
    │   │   ├── Home.jsx
    │   │   ├── BlogPage.jsx
    │   │   ├── ArticlePage.jsx
    │   │   ├── TeamPage.jsx
    │   │   ├── ContactPage.jsx
    │   │   ├── AdminPage.jsx      # CMS Admin
    │   │   ├── ImpressumPage.jsx  # Legal
    │   │   └── DatenschutzPage.jsx
    │   ├── services/
    │   │   └── api.js         # API Service
    │   ├── data/
    │   │   └── clusters.js    # Cluster Definitionen
    │   └── App.js             # Router
    └── package.json
```

---

## Changelog

### 2025-03-15 (Update 2)
- ✅ Share-Buttons implementiert (LinkedIn, X, Facebook, WhatsApp, E-Mail)
- ✅ Kommentar-System mit Moderation eingerichtet
- ✅ Admin-Panel um Kommentar-Verwaltung erweitert (Freigabe/Ablehnung/Löschen)
- ✅ E-Mail-Benachrichtigung bei neuen Kommentaren konfiguriert (office@euroadria.me)
- ✅ Backend-API für Kommentare (CRUD + Moderation)

### 2025-03-15 (Update 1)
- ✅ Impressum-Seite mit Niederlassung Deutschland erstellt
- ✅ Datenschutz-Seite (DSGVO) erstellt
- ✅ Footer-Links zu rechtlichen Seiten hinzugefügt
- ✅ CMS-Backend mit MongoDB implementiert
- ✅ Admin-Panel unter /admin erstellt
- ✅ CRUD-API für Artikel implementiert
- ✅ Frontend auf API-Daten umgestellt (statt lokaler JS-Datei)
- ✅ 43 weitere Artikel hinzugefügt (60 total)
- ✅ Alle 6 Themen-Cluster vollständig befüllt

### Frühere Updates
- Website-Redesign zu "Quiet Luxury" (Navy/Gold)
- 15 Pillar-Artikel erstellt
- Team-Integration (Milena Bubanja & Holger Kuhlmann)
- Mobile Menu repariert
- Lead Magnet Komponente hinzugefügt

---

## Admin-Zugang
- **URL:** /admin
- **Benutzername:** admin
- **Passwort:** euroadria2025
