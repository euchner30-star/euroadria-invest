#!/usr/bin/env python3
"""
Final batch of articles to reach 60 total
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Final batch of articles
final_articles = [
    # More Cluster A articles
    {
        "id": 144,
        "cluster": "A",
        "title": "Grüne Investments am Balkan: Erneuerbare Energien als Renditetreiber",
        "slug": "gruene-investments-balkan-energie",
        "excerpt": "Solar, Wind, Wasserkraft: Wie der Balkan zur grünen Energie-Region Europas wird.",
        "content": """Der Balkan wird zum Hotspot für erneuerbare Energien in Europa.

## Der Green Energy Boom

### Warum Balkan?
- **Sonnenstunden**: 2.000-2.500/Jahr (mehr als Deutschland)
- **Wasserkraft**: Ungenutzte Flüsse
- **EU-Förderung**: Milliarden für Transition
- **Feed-in-Tarife**: Attraktive Einspeisevergütungen

## Länder-Übersicht

### Montenegro
- 50% Wasserkraft bereits
- Solar-Ausbau geplant
- Investment: €800 Mio bis 2030

### Serbien
- Größtes Potenzial
- Wind: Südliche Regionen
- Solar: Vojvodina

### Albanien
- 100% Wasserkraft
- Solar-Diversifikation
- EU-Mittel verfügbar

## Investment-Modelle

### Utility-Scale Solar
- Investment: €5-€50 Mio
- ROI: 10-14% p.a.
- PPA-Modelle verfügbar

### Rooftop Solar
- Investment: €50.000-€500.000
- Self-Consumption + Feed-in
- ROI: 12-18%

### Wasserkraft (Klein)
- Investment: €1-€10 Mio
- Konzessionen erforderlich
- ROI: 8-12%

## Risiken

- Regulatorische Änderungen
- Grid-Connection Delays
- Political Risk
- Currency (für Nicht-€-Länder)""",
        "image": "https://images.unsplash.com/photo-1509391366360-2e959784a276",
        "category": "Makro & Strategie",
        "date": "2025-02-11",
        "readTime": "11 min",
        "featured": True,
        "author": "Dr. Marcus Weber",
        "relatedArticles": [101, 110, 104],
        "dueDiligenceBox": {
            "title": "Energy Project DD",
            "content": "Prüfpunkte: Konzessionen, Grid-Connection-Garantie, PPA-Konditionen, Genehmigungsstatus, Grundstücksrechte."
        },
        "expertTip": {
            "author": "Holger Kuhlmann",
            "title": "PPA vor Baubeginn",
            "content": "Sichern Sie einen Power Purchase Agreement BEVOR Sie investieren. Ohne garantierte Abnahme ist das Projekt wertlos."
        }
    },
    {
        "id": 145,
        "cluster": "A",
        "title": "Tourismus-Investment Balkan: Beyond the Beach",
        "slug": "tourismus-investment-balkan",
        "excerpt": "Adventure, Wellness, Cultural Tourism: Die neuen Wachstumssegmente.",
        "content": """Der Balkan-Tourismus diversifiziert sich – mit Chancen abseits des Strands.

## Wachstumssegmente

### Adventure Tourism
- Rafting, Hiking, Climbing
- Wachstum: 15-20% p.a.
- Ganzjährig möglich
- Hotspots: Durmitor, Tara Canyon, Albanian Alps

### Wellness & Medical
- Spa-Tradition
- Medical Tourism (Zahnmedizin)
- Hotspots: Igalo, Vrnjačka Banja

### Cultural & Heritage
- UNESCO-Sites
- Religious Tourism
- Hotspots: Kotor, Ohrid, Sarajevo

### Wine & Gastro
- Aufstrebend
- Boutique-Weingüter
- Hotspots: Skadar Lake, Fruška Gora

## Investment-Möglichkeiten

### Boutique Hotels
- 10-30 Zimmer
- Nischen-Positionierung
- ROI: 8-14%

### Experience-Operators
- Tour-Anbieter
- Equipment-Rental
- ROI: 15-25%

### Agritourism
- Farm Stays
- Weingüter mit Verkostung
- ROI: 6-12%

## Erfolgsfaktoren

1. Authentizität
2. Digital Marketing (Instagram!)
3. Internationale Buchungsplattformen
4. Qualitäts-Personal
5. Ganzjahres-Konzept""",
        "image": "https://images.unsplash.com/photo-1551632811-561732d1e306",
        "category": "Makro & Strategie",
        "date": "2025-02-12",
        "readTime": "10 min",
        "featured": False,
        "author": "Holger Kuhlmann",
        "relatedArticles": [111, 116, 117],
        "dueDiligenceBox": {
            "title": "Tourism Feasibility",
            "content": "Wir analysieren: Standort-Potenzial, Wettbewerb, Saisonalität, Marketing-Strategie, Break-Even."
        },
        "expertTip": {
            "author": "Holger Kuhlmann",
            "title": "Instagram-Test",
            "content": "Bevor Sie investieren: Ist der Standort Instagram-worthy? Ohne Social-Media-Appeal wird Marketing teuer."
        }
    },
    # More Cluster B articles
    {
        "id": 146,
        "cluster": "B",
        "title": "Geldwäsche-Prävention am Balkan: Was Investoren wissen müssen",
        "slug": "geldwaesche-praevention-balkan",
        "excerpt": "AML-Compliance, FATF-Standards und wie Sie nicht ins Visier geraten.",
        "content": """Anti-Money-Laundering ist am Balkan ein kritisches Thema für Investoren.

## Die AML-Landschaft

### FATF-Status
- **Montenegro**: Off Grey List (2022)
- **Serbien**: Compliance verbessert
- **Albanien**: Erhöhte Monitoring

### Praktische Auswirkungen
- Strengere Bank-Due-Diligence
- Source of Wealth Dokumentation
- Transaktions-Monitoring

## Compliance-Anforderungen

### Für Käufer
1. **Source of Funds**: Woher kommt das Geld?
2. **Source of Wealth**: Wie wurde Vermögen aufgebaut?
3. **Transaction Trail**: Lückenlose Nachverfolgung

### Dokumentation
- Steuerbescheide (3-5 Jahre)
- Bankkontoauszüge
- Verkaufsverträge (bei Asset-Verkäufen)
- Erbschaftsdokumente
- Unternehmensgewinne (geprüft)

## Red Flags (Was Banken alarmiert)

- Große Cash-Transaktionen
- Offshore-Herkunft ohne Erklärung
- Schneller Weiterverkauf
- Preis unter Marktwert
- Nominee-Strukturen

## Best Practices

1. **Proaktive Dokumentation**: Vor dem Deal
2. **Bank früh einbinden**: Pre-Approval einholen
3. **Transparente Strukturen**: Keine Offshore ohne Substanz
4. **Professional Advisors**: Mit AML-Erfahrung""",
        "image": "https://images.unsplash.com/photo-1450101499163-c8848c66ca85",
        "category": "Recht & Compliance",
        "date": "2025-02-13",
        "readTime": "11 min",
        "featured": False,
        "author": "Dr. Marcus Weber",
        "relatedArticles": [107, 128, 106],
        "dueDiligenceBox": {
            "title": "AML Compliance Package",
            "content": "EuroAdria erstellt: Source of Wealth Dokumentation, Transaction Trail, Bank Presentation Package."
        },
        "expertTip": {
            "author": "Milena Bubanja",
            "title": "Documentation ist König",
            "content": "Je besser Ihre Dokumentation, desto schneller die Bank-Approval. Investieren Sie Zeit in die Vorbereitung, nicht in Diskussionen mit der Bank."
        }
    },
    {
        "id": 147,
        "cluster": "B",
        "title": "Schiedsverfahren am Balkan: Wenn Deals schiefgehen",
        "slug": "schiedsverfahren-balkan-disputes",
        "excerpt": "Arbitration vs. lokale Gerichte: Der Dispute Resolution Guide.",
        "content": """Streitigkeiten sind unvermeidlich – die richtige Resolution-Strategie entscheidend.

## Optionen bei Streitigkeiten

### Lokale Gerichte
- **Dauer**: 3-7 Jahre
- **Kosten**: Niedrig initial, hoch total
- **Durchsetzung**: Lokal OK, international schwierig
- **Empfehlung**: Nur für kleine lokale Streitigkeiten

### Internationale Arbitration
- **Dauer**: 12-24 Monate
- **Kosten**: €50.000-€500.000+
- **Durchsetzung**: New York Convention (international)
- **Empfehlung**: Für alle signifikanten Deals

## Arbitration-Institutionen

### Vienna International Arbitration Centre (VIAC)
- Geografisch nah
- Deutsche/englische Verfahren
- Balkan-Erfahrung
- **Empfehlung**: Erste Wahl

### ICC (Paris)
- Weltweit anerkannt
- Teurer
- Für große Deals

### LCIA (London)
- Common Law Expertise
- Englisches Recht

## Vertragsgestaltung

### Must-Have Klauseln
1. **Arbitration Clause**: Institution + Ort + Sprache
2. **Governing Law**: Welches Recht gilt?
3. **Anzahl Schiedsrichter**: 1 oder 3
4. **Kosten**: Wer trägt was?

### Beispiel-Klausel
"Alle Streitigkeiten werden nach der Schiedsordnung der VIAC in Wien, Österreich, endgültig entschieden. Die Verfahrenssprache ist Deutsch/Englisch."

## Durchsetzung am Balkan

### Montenegro
- New York Convention Mitglied
- Durchsetzung funktioniert (meist)

### Serbien
- New York Convention
- Gerichte manchmal langsam

### Albanien
- New York Convention
- Praktische Umsetzung variiert""",
        "image": "https://images.unsplash.com/photo-1589829545856-d10d557cf95f",
        "category": "Recht & Compliance",
        "date": "2025-02-14",
        "readTime": "12 min",
        "featured": False,
        "author": "Milena Bubanja",
        "relatedArticles": [108, 132, 106],
        "dueDiligenceBox": {
            "title": "Dispute Prevention",
            "content": "EuroAdria hilft: Vertragsklauseln, Arbitration-Vorbereitung, Mediation, Durchsetzungs-Support."
        },
        "expertTip": {
            "author": "Milena Bubanja",
            "title": "Prevention > Resolution",
            "content": "Der beste Streit ist der vermiedene. Investieren Sie in gute Verträge und Due Diligence. Arbitration ist teuer und zeitaufwendig."
        }
    },
    # More Cluster C articles
    {
        "id": 148,
        "cluster": "C",
        "title": "Bar: Montenegros unterschätzter Hafenstadt-Charme",
        "slug": "bar-montenegro-investment",
        "excerpt": "Größter Hafen, Fährverbindung nach Italien und Immobilien-Potenzial.",
        "content": """Bar ist Montenegros wichtigste Hafenstadt – und investorentechnisch unterschätzt.

## Stadt-Profil

- **Einwohner**: 45.000
- **Funktion**: Größter Hafen Montenegros
- **Besonderheit**: Fährverbindung Bari/Italien
- **Charakter**: Arbeitsstadt, weniger touristisch

## Warum Bar interessant ist

### Infrastruktur
- Hafen: €300 Mio Expansion geplant
- Bahnverbindung nach Belgrad
- Autobahn nach Podgorica
- Flughafen: 45 min

### Immobilienmarkt
- Preise: €1.200-€2.000/m²
- 40-50% unter Budva
- Lokaler Markt stabil
- Weniger saisonal

## Investment-Optionen

### Stari Bar (Altstadt)
- Historische Ruinen
- Boutique-Potential
- Heritage-Projekte

### Sutomore (Strand)
- Badeort
- Familientourismus
- Moderate Preise

### Bar Zentrum
- Lokale Mieter
- Ganzjährig
- Solide Yields

## Investment-Thesis

### Bull Case
- Hafen-Expansion bringt Jobs
- Italien-Connection (Ferry)
- Unterbewertet vs. Küste
- Ganzjährige Nachfrage

### Bear Case
- Weniger "sexy"
- Industrie-Charakter
- Limitierter Tourismus""",
        "image": "https://images.unsplash.com/photo-1544551763-46a013bb70d5",
        "category": "Montenegro Regionen",
        "date": "2025-02-15",
        "readTime": "10 min",
        "featured": False,
        "author": "Holger Kuhlmann",
        "relatedArticles": [119, 113, 120],
        "dueDiligenceBox": {
            "title": "Bar Market Analysis",
            "content": "Wir prüfen: Hafen-Entwicklungspläne, Infrastruktur-Projekte, lokaler Mietmarkt, Tourismus-Potenzial."
        },
        "expertTip": {
            "author": "Holger Kuhlmann",
            "title": "Stari Bar Geheimtipp",
            "content": "Die Ruinenstadt Stari Bar ist ein schlafender Riese. Mit dem richtigen Konzept (Boutique Hotel, Restaurant) kann hier etwas Einzigartiges entstehen."
        }
    },
    {
        "id": 149,
        "cluster": "C",
        "title": "Bijela Shipyard: Industrielles Erbe und Waterfront-Potential",
        "slug": "bijela-shipyard-investment",
        "excerpt": "Die ehemalige Werft als Entwicklungs-Projekt: Was Investoren wissen sollten.",
        "content": """Bijela Shipyard ist eines der spannendsten Redevelopment-Projekte an der Bucht.

## Die Situation

### Historie
- Jugoslawische Werft
- Geschlossen 2020
- 80 Hektar Waterfront-Land

### Status 2025
- Privatisierung läuft
- Internationale Investoren interessiert
- Entwicklungspotenzial enorm

## Warum interessant?

### Lage
- Bucht von Kotor
- 5 km von Herceg Novi
- 15 km von Flughafen Tivat
- Tiefwasser-Zugang

### Potenzial
- Marina-Entwicklung
- Residential/Hotel
- Mixed-Use Community
- 5.000+ Wohneinheiten möglich

## Investment-Szenarien

### Szenario 1: Single Developer
- Großinvestor übernimmt alles
- €500 Mio+ Investment
- 10-15 Jahre Entwicklung

### Szenario 2: Consortium
- Mehrere Partner
- Phasen-Entwicklung
- Risiko-Streuung

### Szenario 3: Opportunistic Land Purchase
- Kleinere Parzellen nach Privatisierung
- Spekulation auf Gesamtentwicklung

## Risiken

- Altlasten (Industriegelände)
- Privatisierungs-Unsicherheit
- Politische Einflüsse
- Kapitalbedarf enorm

## Beobachten, nicht springen

Bijela ist NICHT für Einzelinvestoren. Aber: Die Entwicklung wird die gesamte Region beeinflussen. Herceg Novi und Umgebung profitieren.""",
        "image": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab",
        "category": "Montenegro Regionen",
        "date": "2025-02-16",
        "readTime": "10 min",
        "featured": False,
        "author": "Dr. Marcus Weber",
        "relatedArticles": [118, 114, 115],
        "dueDiligenceBox": {
            "title": "Redevelopment Monitoring",
            "content": "EuroAdria beobachtet: Privatisierungsprozess, Ausschreibungen, Investoren-Aktivität, Planungsstatus."
        },
        "expertTip": {
            "author": "Holger Kuhlmann",
            "title": "Spillover nutzen",
            "content": "Statt auf Bijela zu warten: Investieren Sie in Herceg Novi. Jede Entwicklung von Bijela wird die Nachbarschaft aufwerten."
        }
    },
    # More Cluster D articles
    {
        "id": 150,
        "cluster": "D",
        "title": "Kroatien für Balkan-Investoren: Die EU-Alternative",
        "slug": "kroatien-eu-alternative",
        "excerpt": "EU-Mitglied, Euro-Zone, etablierter Markt – aber lohnt es sich noch?",
        "content": """Kroatien ist der "sichere" Balkan-Markt – mit anderen Trade-offs.

## Warum Kroatien?

### Vorteile
- EU-Mitglied seit 2013
- Euro seit 2023
- Schengen seit 2023
- Rechtssicherheit hoch
- Liquidität gut

### Nachteile
- Preise bereits konvergiert
- Renditen komprimiert
- Konkurrenz etabliert
- Regulierung strenger

## Markt-Vergleich

| | Kroatien | Montenegro |
|---|----------|-----------|
| EU-Status | Mitglied | Kandidat |
| Preisniveau | Hoch | Mittel |
| Renditen | 3-5% | 6-10% |
| Risiko | Niedrig | Mittel |
| Potenzial | Moderat | Hoch |

## Für wen geeignet?

### Kroatien wählen wenn:
- Kapitalerhalt wichtiger als Rendite
- EU-Rechtssicherheit Priorität
- Liquidität/Exit wichtig
- Konservatives Profil

### Montenegro wählen wenn:
- Alpha/Rendite im Fokus
- Risikotoleranz vorhanden
- Langfrist-Horizont (5-10 Jahre)
- Aktives Management möglich

## Kombinierte Strategie

**Core**: Kroatien (50-60%) – Stabilität
**Satellite**: Montenegro (40-50%) – Wachstum

Diese Mischung bietet Balance aus Sicherheit und Upside.""",
        "image": "https://images.unsplash.com/photo-1555990538-1e7c0ff9a0dd",
        "category": "Serbien & Balkan",
        "date": "2025-02-17",
        "readTime": "10 min",
        "featured": False,
        "author": "Dr. Marcus Weber",
        "relatedArticles": [101, 103, 114],
        "dueDiligenceBox": {
            "title": "Cross-Border Strategy",
            "content": "EuroAdria berät: Portfolio-Allokation Kroatien/Montenegro, Steueroptimierung, Strukturierung."
        },
        "expertTip": {
            "author": "Holger Kuhlmann",
            "title": "Kroatien als Hedge",
            "content": "Wenn Ihr Hauptexposure Montenegro ist: Ein Kroatien-Asset als Hedge macht Sinn. Diversifikation innerhalb der Region."
        }
    },
    {
        "id": 151,
        "cluster": "D",
        "title": "Slowenien: Das Tor zwischen EU und Balkan",
        "slug": "slowenien-investment-gateway",
        "excerpt": "Warum Slowenien als Holding-Standort und Tor zum Balkan interessant ist.",
        "content": """Slowenien ist der natürliche Hub zwischen EU und Westbalkan.

## Warum Slowenien?

### Als Holding-Standort
- EU-Mitglied, Euro
- 19% Corporate Tax
- Gute DBA-Netzwerk
- Substanz einfach

### Als Tor zum Balkan
- Kulturelle Nähe
- Historische Verbindungen
- Logistik-Hub
- Banking-Zentrum

## Business-Strukturen

### Slowenien Holding → Balkan Operations
- Saubere EU-Struktur
- Dividenden: Participation Exemption
- Exit: Liquide EU-Märkte

### Für E-Commerce
- EU-VAT-Registrierung
- Fulfillment-Center
- Kurze Wege zum Balkan

## Immobilien in Slowenien

### Ljubljana
- €3.500-€5.500/m²
- Stabile Nachfrage
- Yields: 3-4%

### Küste (Piran, Portorož)
- €4.000-€7.000/m²
- Saisonal
- Premium-Markt

### Bled/Alpen
- Tourismus-Fokus
- €2.500-€4.000/m²
- Four-Season

## Slowenien vs. Montenegro

| Aspekt | Slowenien | Montenegro |
|--------|-----------|-----------|
| Steuern | 19% | 9% |
| Stabilität | Sehr hoch | Mittel |
| Renditen | 3-4% | 6-10% |
| Setup | Einfach | Einfach |""",
        "image": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64",
        "category": "Serbien & Balkan",
        "date": "2025-02-18",
        "readTime": "10 min",
        "featured": False,
        "author": "Dr. Marcus Weber",
        "relatedArticles": [126, 127, 140],
        "dueDiligenceBox": {
            "title": "Gateway Structuring",
            "content": "EuroAdria plant: Holding-Strukturen via Slowenien, Steueroptimierung, Logistik-Setup."
        },
        "expertTip": {
            "author": "Holger Kuhlmann",
            "title": "Ljubljana Office",
            "content": "Ein kleines Büro in Ljubljana gibt Ihrer Balkan-Holding EU-Substanz und einfachen Banking-Zugang. Kosten: €500-€1.000/Monat."
        }
    },
    # More Cluster E articles
    {
        "id": 152,
        "cluster": "E",
        "title": "Montenegro Immobilienkauf: Der Schritt-für-Schritt-Prozess",
        "slug": "montenegro-immobilienkauf-prozess",
        "excerpt": "Von der Suche bis zum Grundbucheintrag – der komplette Kaufprozess erklärt.",
        "content": """Immobilienkauf in Montenegro ist für EU-Bürger unkompliziert – wenn man den Prozess kennt.

## Der Kaufprozess

### Schritt 1: Suche & Auswahl
- Makler oder Direktsuche
- Besichtigung
- Preisverhandlung
- Dauer: 1-4 Wochen

### Schritt 2: Reservierung
- Reservierungsvereinbarung
- Anzahlung: €5.000-€20.000
- Exklusivität: 2-4 Wochen
- Dauer: 1 Tag

### Schritt 3: Due Diligence
- Eigentumssprüfung (Kataster)
- Belastungen (Hypotheken)
- Genehmigungen (Occupancy Permit!)
- Dauer: 1-3 Wochen

### Schritt 4: Kaufvertrag
- Notar-Termin
- Vertrag in Montenegrinisch
- Übersetzung empfohlen
- Dauer: 1-2 Tage

### Schritt 5: Zahlung & Übergabe
- Banküberweisung (EUR)
- Schlüsselübergabe
- Notarieller Akt
- Dauer: 1-2 Wochen

### Schritt 6: Registrierung
- Grundbucheintrag
- Steuerbescheid
- Dauer: 2-8 Wochen

## Kosten

- **Grunderwerbsteuer**: 3% vom Kaufpreis
- **Notar**: €500-€2.000
- **Makler**: 3-5% (meist Verkäufer)
- **Anwalt**: €500-€2.000
- **Übersetzung**: €100-€300

## Dokumenten-Checkliste

✓ Reisepass (gültig)
✓ Steuernummer (PIB) – wird beantragt
✓ Bankverbindung (für Überweisung)
✓ Vollmacht (falls nicht persönlich anwesend)""",
        "image": "https://images.unsplash.com/photo-1560518883-ce09059eeffa",
        "category": "Lifestyle & Relocation",
        "date": "2025-02-19",
        "readTime": "11 min",
        "featured": True,
        "author": "Milena Bubanja",
        "relatedArticles": [106, 122, 123],
        "dueDiligenceBox": {
            "title": "Kaufbegleitung Full-Service",
            "content": "EuroAdria begleitet: Suche, DD, Verhandlung, Notar-Koordination, Registrierung, Schlüsselübergabe."
        },
        "expertTip": {
            "author": "Milena Bubanja",
            "title": "Vollmacht vorbereiten",
            "content": "Wenn Sie nicht jeden Termin persönlich wahrnehmen können: Notariell beglaubigte Vollmacht an lokalen Anwalt. Spart mehrere Reisen."
        }
    },
    {
        "id": 153,
        "cluster": "E",
        "title": "Familie am Balkan: Was Eltern vor der Auswanderung wissen müssen",
        "slug": "familie-balkan-auswandern",
        "excerpt": "Bildung, Gesundheit, Kinderbetreuung, Sicherheit – der Family-Relocation-Guide.",
        "content": """Auswandern mit Familie erfordert andere Planung als Solo-Relocation.

## Die großen Fragen

### Bildung
- Internationale Schulen: Limited (Podgorica, Tivat)
- Lokale Schulen: Montenegrinisch
- Homeschooling: Legal
- → Planung 12+ Monate vorher

### Gesundheit
- Kinderärzte: Verfügbar, aber limitiert
- Spezialisten: Podgorica oder Ausland
- Notfälle: Grundversorgung OK
- → Internationale Versicherung Pflicht

### Kinderbetreuung
- Kitas: Existieren, aber Wartelisten
- Private Betreuung: €300-€600/Monat
- → Früh kümmern

### Sicherheit
- Kriminalität: Niedrig
- Verkehr: Vorsicht geboten
- Spielplätze: Verbesserungswürdig
- → Generell sicher für Familien

## Kosten-Kalkulation (Familie 4)

### Podgorica
- Wohnung (3-Schlafzimmer): €600-€900
- Int. Schule (2 Kinder): €12.000-€24.000/Jahr
- Kinderbetreuung: €400-€600
- Lebenshaltung: €1.500-€2.500
- **Total**: €3.500-€5.500/Monat

### Küste
- Wohnung: €800-€1.200
- Schule: Pendeln nach Tivat
- **Total**: €4.000-€6.500/Monat

## Familienfreundliche Orte

### Podgorica
+ Internationale Schule vorhanden
+ Ganzjährig stabile Community
- Sommer sehr heiß

### Tivat
+ Int. Schule (Knightsbridge)
+ Strand-Nähe
- Teurer

### Herceg Novi
+ Familiär, grün
+ Dubrovnik-Nähe (Bildung)
- Keine lokale int. Schule""",
        "image": "https://images.unsplash.com/photo-1475503572774-15a45e5d60b9",
        "category": "Lifestyle & Relocation",
        "date": "2025-02-20",
        "readTime": "12 min",
        "featured": False,
        "author": "Marina Dalmatinac",
        "relatedArticles": [125, 124, 123],
        "dueDiligenceBox": {
            "title": "Family Relocation Package",
            "content": "EuroAdria organisiert: Schulanmeldungen, Wohnungssuche (familiengerecht), Kinderarzt-Kontakte, Community-Intro."
        },
        "expertTip": {
            "author": "Holger Kuhlmann",
            "title": "Test-Sommer",
            "content": "Verbringen Sie einen Sommer (oder Winter) mit Familie BEVOR Sie alles aufgeben. Kinder adaptieren unterschiedlich schnell."
        }
    },
    # More Cluster F articles
    {
        "id": 154,
        "cluster": "F",
        "title": "Buchhaltung in Montenegro: Was Unternehmer wissen müssen",
        "slug": "buchhaltung-montenegro-guide",
        "excerpt": "Pflichten, Fristen, Software und wie Sie den richtigen Buchhalter finden.",
        "content": """Buchhaltung in Montenegro folgt eigenen Regeln – hier das Wichtigste.

## Buchführungspflichten

### Einzelunternehmer
- Einnahmen-Überschuss-Rechnung
- Einfache Buchführung
- Quartalsweise VAT (wenn registriert)
- Jahresabschluss

### D.O.O. (GmbH)
- Doppelte Buchführung
- Monatliche VAT-Meldungen
- Bilanz + GuV
- Jahresabschluss (publiziert)
- Audit ab €150.000 Umsatz

## Wichtige Fristen

| Was | Wann |
|-----|------|
| Monatliche VAT | 15. des Folgemonats |
| Quartals-Vorauszahlung | 15. nach Quartalsende |
| Jahresabschluss | 31. März |
| Steuererklärung | 31. März |

## Buchhalter finden

### Kriterien
- Lizenziert (Pflicht!)
- Englisch oder Deutsch
- Erfahrung mit ausländischen Klienten
- Responsive

### Kosten
- Einzelunternehmer: €50-€150/Monat
- Kleine D.O.O.: €100-€250/Monat
- Größere D.O.O.: €200-€500/Monat

## Software

### Lokale Lösungen
- Pantheon (Marktführer)
- DataLab (slowenisch)
- Lokale ERP-Systeme

### Internationale
- Nicht direkt kompatibel
- Export/Import nötig

## Häufige Fehler

1. Fristen verpassen → Strafen
2. Falscher VAT-Status
3. Unvollständige Dokumentation
4. Belegchaos
5. Mixing Private/Business""",
        "image": "https://images.unsplash.com/photo-1554224155-6726b3ff858f",
        "category": "Business Setup",
        "date": "2025-02-21",
        "readTime": "10 min",
        "featured": False,
        "author": "Milena Bubanja",
        "relatedArticles": [126, 139, 127],
        "dueDiligenceBox": {
            "title": "Accounting Setup",
            "content": "EuroAdria vermittelt: Geprüfte Buchhalter, Software-Setup, Prozess-Definition, Frist-Monitoring."
        },
        "expertTip": {
            "author": "Milena Bubanja",
            "title": "Digital First",
            "content": "Richten Sie von Anfang an digitale Prozesse ein. Belege scannen, Cloud-Ablage, direkter Buchhalter-Zugriff. Spart Zeit und Geld."
        }
    },
    {
        "id": 155,
        "cluster": "F",
        "title": "Franchise-Möglichkeiten in Montenegro: Bekannte Marken, neuer Markt",
        "slug": "franchise-montenegro-moeglichkeiten",
        "excerpt": "Internationale Marken nach Montenegro bringen: Chancen und Realitätscheck.",
        "content": """Franchise ist ein Weg, mit etablierten Konzepten in Montenegro zu starten.

## Der Montenegro-Markt

### Chancen
- Unterversorgt mit internationalen Marken
- Wachsender Konsum
- Tourismus als Treiber
- EU-Annäherung

### Limits
- Kleine Bevölkerung (620.000)
- Saisonalität (Küste)
- Kaufkraft begrenzt
- Franchise-Fees vs. Markt

## Existierende Franchises

### Food & Beverage
- McDonald's ✗ (nicht präsent)
- KFC ✗ (nicht präsent)
- Starbucks ✗ (nicht präsent)
- Lokale Ketten dominieren

### Retail
- Zara ✓ (Podgorica)
- H&M ✓ (Podgorica)
- IKEA ✗

### Services
- Fitness-Ketten: Begrenzt
- Hotels: Marriott, Hilton (Porto MNE)

## Franchise-Opportunities

### Realistisch
- Fitness/Gym Konzepte
- Coffee-Shops (lokale Marken)
- Service-Franchises
- Automotive Services

### Schwierig
- Fast Food (Konkurrenz zu lokal)
- Einzelhandel (kleine Märkte)
- Premium-Dining (lokal etabliert)

## Prozess

1. Marktanalyse (Passt das Konzept?)
2. Franchise-Geber kontaktieren
3. Territory Rights verhandeln
4. Lokale Strukturierung
5. Standort-Suche
6. Training & Setup
7. Launch

## Reality Check

Die meisten internationalen Franchises sehen Montenegro als "zu klein". Erfolgreicher sind oft:
- Regionale Expansion (Serbien → Montenegro)
- Master-Franchise für Balkan
- Lokale Adaptionen internationaler Konzepte""",
        "image": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4",
        "category": "Business Setup",
        "date": "2025-02-22",
        "readTime": "11 min",
        "featured": False,
        "author": "Dr. Marcus Weber",
        "relatedArticles": [141, 126, 127],
        "dueDiligenceBox": {
            "title": "Franchise Feasibility",
            "content": "EuroAdria analysiert: Markt-Fit, Standort-Optionen, Financial Projections, Franchise-Verhandlung."
        },
        "expertTip": {
            "author": "Holger Kuhlmann",
            "title": "Regional denken",
            "content": "Statt Montenegro allein: Master-Franchise für Montenegro + Albanien + Kosovo. Das macht für Franchise-Geber mehr Sinn."
        }
    },
    {
        "id": 156,
        "cluster": "F",
        "title": "Tech-Startup in Montenegro gründen: Der Insider-Guide",
        "slug": "tech-startup-montenegro-gruenden",
        "excerpt": "Warum Montenegro für Tech-Gründer interessant ist und wie man startet.",
        "content": """Montenegro positioniert sich als Startup-freundlicher Standort – mit Vor- und Nachteilen.

## Warum Montenegro für Startups?

### Vorteile
- 9% Corporate Tax
- Niedrige Lebenshaltungskosten
- Einfache Company-Gründung
- Digital Nomad Szene
- EU-Zeitzone

### Nachteile
- Kleiner lokaler Markt
- Limitierter Talent-Pool
- Wenig lokales VC
- Netzwerk-Aufbau nötig

## Startup-Strukturierung

### Typische Struktur
- Montenegro D.O.O. (Operations)
- Optional: Delaware C-Corp (für US-VCs)
- IP-Holding: Je nach Strategie

### Warum Montenegro + US?
- Montenegro: Team, Operations, Steuern
- US: VC-Fundraising, Kredibilität

## Finanzierung

### Lokale Optionen
- Investment Development Fund
- EU-Förderprogramme
- Lokale Angels (selten)

### Internationale
- Remote-First VC (für Balkan offen)
- DACH Angels
- Acceleratoren

## Talent

### Lokal rekrutieren
- IT-Talent: Begrenzt
- Konkurrenz: Serbien zahlt oft mehr
- Lösung: Remote-Teams

### Remote-Team
- Montenegro als Base
- Entwickler: Serbien, Ukraine, global
- Co-Working: Podgorica, Budva

## Startup-Ökosystem

### Podgorica
- Co-Working: Hub, Nest
- Events: Begrenzt
- Community: Klein aber wachsend

### Regional
- Belgrad: Größtes Balkan-Ökosystem
- Zagreb: Etabliert
- Sarajevo: Aufstrebend""",
        "image": "https://images.unsplash.com/photo-1522202176988-66273c2fd55f",
        "category": "Business Setup",
        "date": "2025-02-23",
        "readTime": "12 min",
        "featured": False,
        "author": "Stefan Petrovic",
        "relatedArticles": [139, 126, 127],
        "dueDiligenceBox": {
            "title": "Startup Setup Package",
            "content": "EuroAdria unterstützt: Company Formation, Strukturierung, Bank-Setup, Talent-Intro, Ökosystem-Zugang."
        },
        "expertTip": {
            "author": "Holger Kuhlmann",
            "title": "Base Montenegro, Scale Global",
            "content": "Montenegro ist perfekt als Base, aber bauen Sie von Tag 1 ein Remote-First-Mindset auf. Ihr Markt ist nicht Montenegro."
        }
    },
    {
        "id": 157,
        "cluster": "A",
        "title": "Private Equity am Balkan: Institutionelle Perspektive",
        "slug": "private-equity-balkan-guide",
        "excerpt": "Für institutionelle Investoren: Dealflow, Strukturierung und Exit-Strategien.",
        "content": """Private Equity am Balkan ist ein wachsender, aber komplexer Markt.

## Marktüberblick

### Deal-Volumen
- 2024: ~€2 Mrd (gesamt Westbalkan)
- Wachstum: 15-20% p.a.
- Trend: Steigend

### Aktive Fonds
- EBRD/IFC (Development)
- Regionale Fonds (Mid Europa, Enterprise)
- Lokale Fonds (klein)
- Family Offices (zunehmend)

## Deal-Typen

### Buyouts
- Target: €5-€50 Mio Enterprise Value
- Sektoren: Manufacturing, Services, IT
- Multiples: 4-7x EBITDA

### Growth Capital
- Target: €2-€20 Mio
- Sektoren: Tech, Healthcare, Consumer
- Structure: Minderheit mit Governance

### Real Estate
- Development Equity
- Distressed Assets
- Hospitality

## Strukturierung

### Typische Struktur
```
Luxembourg SCSp (Fund)
    ↓
Cyprus/Malta Holdco
    ↓
Local OpCo (Serbien/Montenegro)
```

### Warum so?
- Steuereffizienz
- EU-Rechtssicherheit
- Exit-Flexibilität
- LP-Akzeptanz

## Exit-Optionen

### Trade Sale
- An strategische Käufer
- Regional oder international
- Timeline: 4-7 Jahre

### Secondary
- An andere PE-Fonds
- Zunehmend aktiv
- Timeline: 3-5 Jahre

### IPO
- Belgrad Stock Exchange
- Ljubljana
- Sehr selten""",
        "image": "https://images.unsplash.com/photo-1517048676732-d65bc937f952",
        "category": "Makro & Strategie",
        "date": "2025-02-24",
        "readTime": "13 min",
        "featured": False,
        "author": "Dr. Marcus Weber",
        "relatedArticles": [101, 102, 110],
        "dueDiligenceBox": {
            "title": "PE Deal Support",
            "content": "EuroAdria für PE: Dealflow-Sourcing, Commercial DD, Management-Referenzen, Strukturierungsberatung."
        },
        "expertTip": {
            "author": "Holger Kuhlmann",
            "title": "Management ist alles",
            "content": "Am Balkan gibt es keine Turnaround-Märkte für schlechtes Management. Investieren Sie nur mit starken lokalen Führungsteams."
        }
    },
    {
        "id": 158,
        "cluster": "B",
        "title": "Umweltrecht am Balkan: Green Compliance für Investoren",
        "slug": "umweltrecht-balkan-compliance",
        "excerpt": "Environmental Due Diligence, Genehmigungen und EU-Angleichung.",
        "content": """Umweltrecht wird am Balkan wichtiger – getrieben durch EU-Annäherung.

## Der Status

### EU-Angleichung
- Montenegro: Kapitel 27 (Umwelt) in Verhandlung
- Serbien: Screening Phase
- Albanien: Frühe Phase

### Praktische Auswirkung
- Standards verschärfen sich
- Retrospektive Anforderungen
- Enforcement verbessert sich

## Environmental DD

### Was prüfen?
1. **Altlasten**: Historische Kontamination
2. **Genehmigungen**: Environmental Permits
3. **Compliance**: Laufende Einhaltung
4. **Haftung**: Wer trägt was?

### Für welche Assets?
- Industriegrundstücke (immer)
- Tankstellen, Werkstätten
- Waterfront-Entwicklung
- Landwirtschaftliche Flächen

## Genehmigungen

### Environmental Impact Assessment (EIA)
- Für größere Projekte Pflicht
- Dauer: 3-12 Monate
- Öffentliche Beteiligung

### Building Environmental Permits
- Teil des Genehmigungsprozesses
- Wasser, Abfall, Emissionen

## Risiko-Management

### Vertraglich
- Environmental Reps & Warranties
- Indemnities
- Escrow für bekannte Issues

### Due Diligence
- Phase I Assessment (Desktop)
- Phase II (Bodenproben) bei Verdacht

## Zukunft

EU-Beitritt bringt:
- Striktere Standards
- Höhere Sanktionen
- Besseres Enforcement

→ Heute compliant kaufen spart morgen Geld""",
        "image": "https://images.unsplash.com/photo-1509391366360-2e959784a276",
        "category": "Recht & Compliance",
        "date": "2025-02-25",
        "readTime": "11 min",
        "featured": False,
        "author": "Milena Bubanja",
        "relatedArticles": [106, 108, 144],
        "dueDiligenceBox": {
            "title": "Environmental DD",
            "content": "EuroAdria koordiniert: Phase I/II Assessments, Permit-Review, Compliance-Check, Risikoallokation."
        },
        "expertTip": {
            "author": "Milena Bubanja",
            "title": "Industriebrachen meiden",
            "content": "Ehemalige Industriestandorte können Altlasten-Albträume sein. Die Sanierung kostet oft mehr als das Grundstück wert ist."
        }
    },
    {
        "id": 159,
        "cluster": "E",
        "title": "Ruhestand in Montenegro: Pension, Steuern, Lifestyle",
        "slug": "ruhestand-montenegro-guide",
        "excerpt": "Montenegro als Altersruhesitz: Was Rentner aus DACH wissen müssen.",
        "content": """Montenegro wird für DACH-Rentner interessant – aus guten Gründen.

## Warum Montenegro für Rentner?

### Vorteile
- Niedrigere Lebenshaltungskosten
- Mediterranes Klima
- Keine Erbschaftsteuer
- Flache Steuern
- Nähe zu DACH (2h Flug)

### Nachteile
- Healthcare begrenzt
- Sprachbarriere
- Bürokratie
- Infrastruktur ausbaufähig

## Steuerliche Situation

### Renten aus DACH
- DBA regelt Besteuerungsrecht
- Staatliche Renten: Meist DACH-Besteuerung
- Private Renten: Oft Montenegro
- Betriebsrenten: Prüfen!

### Montenegro-Steuern
- 9% auf lokales Einkommen
- Keine Vermögensteuer
- 3% Erbschaftsteuer (gering)

## Residenz für Rentner

### Option 1: Temporary Residence
- Einkommensnachweis (Rente)
- Keine Mindest-Aufenthalt
- Jährliche Erneuerung

### Option 2: Property-Based
- Immobilienkauf
- Einfachster Weg
- Kombination mit Investment

## Gesundheitsversorgung

### Empfehlung
- Internationale Krankenversicherung
- Mit Evakuierungsschutz
- Ärzte-Netzwerk in Podgorica

### Kosten
- €200-€500/Monat (60+)
- Steigt mit Alter

## Best Locations für Rentner

### Herceg Novi
+ Mildestes Klima
+ Kroatien-Nähe (Dubrovnik)
+ Expat-Community
- Hügelig

### Kotor
+ Kulturell interessant
+ Community
- Teurer

### Tivat
+ Modern
+ Infrastruktur
- Weniger authentisch""",
        "image": "https://images.unsplash.com/photo-1544027993-37dbfe43562a",
        "category": "Lifestyle & Relocation",
        "date": "2025-02-26",
        "readTime": "11 min",
        "featured": False,
        "author": "Marina Dalmatinac",
        "relatedArticles": [123, 124, 122],
        "dueDiligenceBox": {
            "title": "Retirement Planning",
            "content": "EuroAdria berät: Steuerplanung für Rentner, Residenz-Optionen, Healthcare-Setup, Immobiliensuche."
        },
        "expertTip": {
            "author": "Holger Kuhlmann",
            "title": "Probewohnen",
            "content": "Mieten Sie 6-12 Monate BEVOR Sie kaufen. Winter erleben. Ärzte testen. Community finden. Dann entscheiden."
        }
    },
    {
        "id": 160,
        "cluster": "A",
        "title": "Exit-Strategien am Balkan: Wie Sie Ihr Investment realisieren",
        "slug": "exit-strategien-balkan",
        "excerpt": "Trade Sale, Secondary, Rückkauf – wie Sie aus Balkan-Investments aussteigen.",
        "content": """Ein Investment ohne Exit-Strategie ist kein Investment – es ist Hoffnung.

## Exit-Optionen

### 1. Trade Sale
- Verkauf an strategischen Käufer
- Regionale Expansion
- Höchste Multiples möglich
- Dauer: 6-18 Monate

### 2. Local Buyer
- Verkauf an lokalen Investor
- Schneller, aber niedrigere Preise
- Liquidität begrenzt

### 3. Secondary (PE/Family Office)
- An anderen Finanzinvestor
- Zunehmend aktiv
- Strukturierte Prozesse

### 4. Management Buyout
- Verkauf ans Management
- Vendor Financing oft nötig
- Für kleinere Deals

### 5. Refinanzierung
- Kapital zurückholen
- Asset bleibt im Portfolio
- Für Immobilien relevant

## Exit-Planung

### Bei Akquisition
- Exit bereits definieren
- Ziel-Käuferprofile
- Timeline
- Minimum-Return-Hurdle

### Während Haltedauer
- Value Creation für Exit
- Dokumentation
- Management incentivieren
- Beziehungen zu potenziellen Käufern

### Pre-Exit (12-24 Monate)
- Asset "exit-ready" machen
- Financials prüfen
- Legal Housekeeping
- Management sichern

## Realistische Timelines

| Asset-Typ | Typischer Exit |
|-----------|---------------|
| Immobilien | 5-10 Jahre |
| Operating Business | 5-7 Jahre |
| Development | 3-5 Jahre |
| Land Banking | 7-15 Jahre |

## Exit-Hindernisse am Balkan

- Kleine Märkte → wenige Käufer
- Informationsasymmetrie
- Bewertungsdifferenzen
- Finanzierungsschwierigkeiten für Käufer""",
        "image": "https://images.unsplash.com/photo-1444653614773-995cb1ef9efa",
        "category": "Makro & Strategie",
        "date": "2025-02-27",
        "readTime": "12 min",
        "featured": False,
        "author": "Dr. Marcus Weber",
        "relatedArticles": [101, 102, 157],
        "dueDiligenceBox": {
            "title": "Exit Planning",
            "content": "EuroAdria unterstützt: Exit-Strategie-Design, Käufer-Mapping, M&A-Prozess, Verhandlung."
        },
        "expertTip": {
            "author": "Holger Kuhlmann",
            "title": "Exit bei Entry planen",
            "content": "Fragen Sie sich VOR dem Investment: Wer kauft das in 5 Jahren? Wenn Sie keine gute Antwort haben, überdenken Sie den Deal."
        }
    }
]


async def add_final_articles():
    """Add final batch of articles"""
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.environ.get('DB_NAME', 'test_database')
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    current_count = await db.articles.count_documents({})
    print(f"Current articles: {current_count}")
    
    added = 0
    for article in final_articles:
        existing = await db.articles.find_one({"id": article["id"]})
        if existing:
            print(f"Skipping: {article['title'][:40]}...")
            continue
        
        await db.articles.insert_one(article)
        print(f"Added: {article['title'][:40]}...")
        added += 1
    
    final_count = await db.articles.count_documents({})
    print(f"\nAdded {added} new articles")
    print(f"Total articles: {final_count}")
    
    client.close()


if __name__ == "__main__":
    asyncio.run(add_final_articles())
