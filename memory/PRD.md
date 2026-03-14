# EuroAdria - Product Requirements Document

## Original Problem Statement
Erstelle eine High-End-Webseite für 'EuroAdria' (Nische: Investment, Business & Lifestyle an der Adria/Balkan) mit ultra-modernem Glassmorphism-Design, 60+ SEO-optimierten Blog-Artikeln, dunklem Thema, Gold-Akzenten (#D4AF37), und exklusivem Premium-Look.

## Tech Stack
- **Frontend**: React 19, TailwindCSS, Shadcn UI
- **Backend**: FastAPI, MongoDB
- **Fonts**: Playfair Display (Headings), Montserrat (Body)
- **Design**: Dark Mode mit Glassmorphism, Gold-Akzente

## User Personas
1. **DACH-Investoren**: Deutschsprachige Investoren auf der Suche nach exklusiven Balkan-Investments
2. **High-Net-Worth Individuals**: Personen mit hohem Vermögen, die Lifestyle & ROI kombinieren wollen
3. **Business-Entscheider**: Unternehmer, die Expansion in den Balkan erwägen

## Core Requirements (Static)

### Design Anforderungen
- ✅ Glassmorphism-Design mit halbtransparenten Karten und Backdrop-Blur
- ✅ Dark Mode als Standard mit Gold-Akzentfarbe (#D4AF37)
- ✅ Hochauflösendes Hintergrundbild (kroatische/montenegrinische Küste)
- ✅ Schwebende Glas-Navigationsleiste
- ✅ Fonts: Playfair Display + Montserrat

### Funktionale Anforderungen
- ✅ Hero-Sektion mit prominentem Logo
- ✅ Blog mit 60+ Artikeln (Featured + Liste)
- ✅ SEO-optimierte URL-Struktur (/blog/artikel-slug)
- ✅ Kategorie-Filter (Investment, Real Estate, Business, Lifestyle)
- ✅ Suchfunktion für Artikel
- ✅ "Ähnliche Beiträge" Section für interne Verlinkung
- ✅ Kontaktformular mit Glassmorphism-Design

## What's Been Implemented (2024-12-15)

### Frontend (✅ Completed)
1. **Layout & Navigation**
   - Header mit schwebender Glas-Navigationsleiste
   - Logo prominent in Hero + dezent in Navigation
   - Footer mit Social Links, Services, Kontaktinfo
   
2. **Pages**
   - Home Page mit Hero-Sektion + Featured Articles
   - Blog Page mit Search, Filter, Featured + Liste
   - Article Page mit SEO-Struktur, H1-Tags, Related Articles
   - Contact Page mit funktionierendem Formular

3. **Design System**
   - Glassmorphism CSS (glass-card, glass-card-hover, glass-card-strong)
   - Gold Button mit Gradient und Hover-Effekten
   - Custom Animations (fadeIn, slideUp, hover-glow)
   - Responsive Design für mobile, tablet, desktop

4. **Content**
   - 60 Blog-Artikel als Mock-Daten
   - Hochwertige lizenzfreie Bilder via Vision Expert Agent
   - SEO-optimierte Titel und Beschreibungen
   - Kategorisierung und Tagging

### Mock Data Structure
- `/app/frontend/src/data/mockArticles.js`
  - 60 Artikel mit ID, title, slug, excerpt, content, image, category, date, readTime, author, relatedArticles
  - Helper functions: getFeaturedArticles(), getNonFeaturedArticles(), getArticleBySlug(), getRelatedArticles()

## Prioritized Backlog

### P0 (Next Phase - Backend Development)
- [ ] MongoDB Models für Blog-Artikel
- [ ] FastAPI Endpoints für CRUD Operations
- [ ] Admin-Interface für Content-Management
- [ ] Integration Frontend → Backend (Replace Mock Data)

### P1 (Enhancement Features)
- [ ] Newsletter-Anmeldung
- [ ] Social Media Sharing Buttons
- [ ] Reading Progress Bar für Artikel
- [ ] Dark/Light Mode Toggle
- [ ] Multi-Language Support (DE/EN)

### P2 (Advanced Features)
- [ ] Comment System für Artikel
- [ ] Bookmark/Favorite Funktion
- [ ] Author Profile Pages
- [ ] Related Articles Algorithm (ML-basiert)
- [ ] Analytics Integration

## Next Tasks
1. ✅ Review Frontend Design & Functionality
2. ✅ Test Navigation & Routing
3. Backend Planning & API Design
4. MongoDB Schema Design für Blog
5. Admin CMS Development

## Notes
- Alle Artikel verwenden lizenzfreie Stock-Fotos
- Mock-Daten ermöglichen sofortiges User-Feedback
- Design folgt strikt den Glassmorphism-Prinzipien
- SEO-Struktur bereits implementiert (saubere URLs, H1-Tags)
