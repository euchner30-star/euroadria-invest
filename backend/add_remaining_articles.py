#!/usr/bin/env python3
"""
Script to add remaining 43 articles to EuroAdria database
Based on 60 SEO Headlines structure
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Additional articles to reach 60 total
additional_articles = [
    # ========================================
    # CLUSTER A: Makro & Strategie (7 more = 10 total)
    # ========================================
    {
        "id": 104,
        "cluster": "A",
        "title": "Serbien Investment Guide 2025: Chancen im größten Balkan-Markt",
        "slug": "serbien-investment-guide-2025",
        "excerpt": "Serbien bietet mit 7 Mio. Einwohnern den größten Markt am Westbalkan. IT-Hub Belgrad, günstige Produktionskosten und EU-Annäherung.",
        "content": """Serbien ist der wirtschaftliche Motor des Westbalkans mit enormem Potenzial für strategische Investoren.

## Warum Serbien?

**Marktgröße**: 7 Millionen Einwohner – größter Binnenmarkt am Westbalkan
**Wachstum**: 4-5% BIP-Wachstum p.a.
**Talent**: Starker IT- und Engineering-Sektor
**Kosten**: 40-50% günstiger als EU

## Schlüsselsektoren

### IT & Software Development
Belgrad ist der Tech-Hub des Balkans. Über 50.000 IT-Fachkräfte, wachsende Startup-Szene.

### Automotive & Manufacturing
Fiat, Continental, Bosch – große Namen produzieren bereits in Serbien.

### Agribusiness
Fruchtbare Böden, Export-Potenzial in EU und MENA-Region.

## Steuerliche Vorteile

- Corporate Tax: 15%
- Sonderwirtschaftszonen mit 0% für 10 Jahre
- Freihandelsabkommen mit EU, EFTA, Türkei, Russland

## Risiken

- EU-Beitritt unsicher (Kosovo-Frage)
- Politische Volatilität
- Infrastruktur-Gaps außerhalb Belgrads""",
        "image": "https://images.unsplash.com/photo-1580910527160-6891e5ed8784",
        "category": "Makro & Strategie",
        "date": "2025-01-16",
        "readTime": "12 min",
        "featured": False,
        "author": "Dr. Marcus Weber",
        "relatedArticles": [101, 102, 127],
        "dueDiligenceBox": {
            "title": "Serbien DD Essentials",
            "content": "Prüfung: Eigentumsregister, Steuerschulden, Arbeitsrechtliche Compliance, Umweltgenehmigungen, Sanktions-Screening (Russland-Nähe beachten)."
        },
        "expertTip": {
            "author": "Holger Kuhlmann",
            "title": "Belgrad First",
            "content": "Starten Sie in Belgrad – dort finden Sie das beste Talent und die etablierteste Infrastruktur. Expansion in andere Städte erst nach Proof of Concept."
        }
    },
    {
        "id": 105,
        "cluster": "A",
        "title": "Albanien: Der schlafende Riese erwacht – Investment-Chancen 2025",
        "slug": "albanien-investment-chancen-2025",
        "excerpt": "EU-Kandidat mit rasantem Wachstum, unberührten Küsten und dem niedrigsten Preisniveau am Mittelmeer.",
        "content": """Albanien ist der am meisten unterschätzte Markt am Balkan – und genau das macht ihn interessant.

## Das Albanien-Paradox

**Wahrnehmung**: Arm, rückständig, riskant
**Realität**: 5%+ Wachstum, EU-Beitrittsverhandlungen, Tourismus-Boom

## Warum jetzt investieren?

### 1. Tourismus-Explosion
Die albanische Riviera wird als "das neue Kroatien" gehandelt – zu einem Bruchteil der Preise.

### 2. Immobilien-Arbitrage
Saranda, Vlora, Himara: €800-€1.500/m² vs. €4.000+ in Kroatien für vergleichbare Lagen.

### 3. EU-Konvergenz
Beitrittsverhandlungen laufen seit 2022. Target: 2030-2033.

## Sektoren mit Potenzial

- **Tourismus & Hospitality**: Boutique-Hotels, Beach Clubs
- **Landwirtschaft**: Bio-Produkte für EU-Export
- **Erneuerbare Energien**: Wasserkraft, Solar

## Risiken & Mitigation

- **Korruption**: Starker lokaler Partner essentiell
- **Infrastruktur**: Verbessert sich, aber Gaps bleiben
- **Rechtsunsicherheit**: Forensische DD Pflicht""",
        "image": "https://images.unsplash.com/photo-1596402184320-417e7178b2cd",
        "category": "Makro & Strategie",
        "date": "2025-01-17",
        "readTime": "11 min",
        "featured": False,
        "author": "Holger Kuhlmann",
        "relatedArticles": [101, 103, 111],
        "dueDiligenceBox": {
            "title": "Albanien Entry Checklist",
            "content": "Must-haves: Lokaler Anwalt mit internationaler Erfahrung, Eigentumshistorie bis 1991 (Kommunismus-Ära), Bank-Pre-Clearance."
        },
        "expertTip": {
            "author": "Holger Kuhlmann",
            "title": "Die Riviera jetzt",
            "content": "Saranda und Ksamil sind bereits auf dem Radar. Himara und Dhermi bieten noch authentisches Pre-Discovery Pricing. Handeln Sie schnell."
        }
    },
    {
        "id": 109,
        "cluster": "A",
        "title": "Nordmazedonien: Tech-Hub im Herzen des Balkans",
        "slug": "nordmazedonien-tech-investment",
        "excerpt": "NATO-Mitglied, EU-Kandidat und aufstrebender IT-Standort mit wettbewerbsfähigen Kosten.",
        "content": """Nordmazedonien positioniert sich als attraktiver Nearshoring-Standort für europäische Unternehmen.

## Standortvorteile

- **NATO-Mitglied** seit 2020 – politische Stabilität
- **EU-Kandidat** – regulatorische Angleichung
- **Niedrige Kosten**: 50-60% unter EU-Niveau
- **Strategische Lage**: Korridor X verbindet EU mit Griechenland

## IT & Outsourcing

Skopje entwickelt sich zum IT-Hub:
- 15.000+ IT-Fachkräfte
- Englisch weit verbreitet
- Timezone: CET (ideal für EU-Kunden)

## Steuerstruktur

- Corporate Tax: 10%
- TIDZ Zonen: 0% für 10 Jahre
- Flat Tax: 10%

## Investieren in Nordmazedonien

### Chancen
- IT-Outsourcing & BPO
- Landwirtschaft (Wein, Tabak)
- Leichtindustrie

### Risiken
- Politische Spannungen mit Bulgarien
- Kleine Marktgröße (2 Mio.)
- Brain Drain""",
        "image": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5",
        "category": "Makro & Strategie",
        "date": "2025-01-18",
        "readTime": "10 min",
        "featured": False,
        "author": "Dr. Marcus Weber",
        "relatedArticles": [104, 101, 127],
        "dueDiligenceBox": {
            "title": "Nordmazedonien Checklist",
            "content": "Prüfpunkte: TIDZ-Eignung, Arbeitsgenehmigungen, lokale Partnerschaften, Bankkonto-Eröffnung (kann 2-3 Monate dauern)."
        },
        "expertTip": {
            "author": "Holger Kuhlmann",
            "title": "TIDZ nutzen",
            "content": "Die Technologisch-Industriellen Entwicklungszonen (TIDZ) bieten 10 Jahre Steuerfreiheit. Bei IT-Projekten unbedingt prüfen."
        }
    },
    {
        "id": 110,
        "cluster": "A",
        "title": "Balkan Nearshoring: Warum europäische Unternehmen zurückkehren",
        "slug": "balkan-nearshoring-trend",
        "excerpt": "Post-COVID und Post-Ukraine: Der Balkan wird zum strategischen Nearshoring-Hub für EU-Unternehmen.",
        "content": """Die Lieferketten-Disruption hat den Balkan als Produktionsstandort rehabilitiert.

## Der Nearshoring-Shift

### Warum Unternehmen den Balkan wählen

1. **Nähe zu EU-Märkten**: 1-2 Tage Lieferzeit
2. **Kostenvorteile**: 40-60% günstiger als EU
3. **Qualifizierte Arbeitskräfte**: Technische Ausbildung
4. **Zeitzone**: CET – keine Nachtschichten für Abstimmung

## Sektoren mit Momentum

### Automotive
Serbien und Nordmazedonien haben etablierte Zulieferer-Cluster.

### Textil & Mode
Albanien, Kosovo – schnelle Lieferung für Fast Fashion.

### IT & Software
Alle Balkan-Länder – stark wachsend.

## Ländervergleich für Nearshoring

| Land | Stärke | Kosten-Level |
|------|--------|--------------|
| Serbien | Automotive, IT | Mittel |
| Albanien | Textil, Call Center | Niedrig |
| Nordmazedonien | IT, BPO | Niedrig |
| Montenegro | Premium Services | Mittel-Hoch |

## Risiken

- Fachkräftemangel in Spitzenpositionen
- Infrastruktur außerhalb der Hauptstädte
- Korruption und Bürokratie""",
        "image": "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d",
        "category": "Makro & Strategie",
        "date": "2025-01-19",
        "readTime": "13 min",
        "featured": True,
        "author": "Dr. Marcus Weber & Holger Kuhlmann",
        "relatedArticles": [104, 109, 127],
        "dueDiligenceBox": {
            "title": "Nearshoring DD",
            "content": "Prüfen Sie: Arbeitsmarkt-Verfügbarkeit, Logistik-Infrastruktur, Zoll-Prozesse, lokale Management-Kapazitäten."
        },
        "expertTip": {
            "author": "Holger Kuhlmann",
            "title": "Pilot First",
            "content": "Starten Sie mit einem kleinen Pilotprojekt (10-20 MA). Skalieren Sie erst nach 6-12 Monaten erfolgreichem Betrieb."
        }
    },
    # ========================================
    # CLUSTER B: Recht & Compliance (7 more = 10 total)
    # ========================================
    {
        "id": 131,
        "cluster": "B",
        "title": "Restitutionsrisiken am Balkan: Der versteckte Deal-Killer",
        "slug": "restitutionsrisiken-balkan",
        "excerpt": "Wie kommunistische Enteignungen noch heute Immobilien-Deals gefährden und wie Sie sich schützen.",
        "content": """Restitution ist das Damoklesschwert über vielen Balkan-Immobilien.

## Was ist Restitution?

Nach dem Fall des Kommunismus (1989-1991) begannen Balkan-Staaten, enteignetes Eigentum an frühere Besitzer zurückzugeben.

**Problem**: Dieser Prozess ist in vielen Ländern NICHT abgeschlossen.

## Länder-Status 2025

### Montenegro
- **Status**: Weitgehend abgeschlossen
- **Risiko**: Mittel
- **Prüfung**: Restitutionsregister existiert

### Serbien
- **Status**: Laufend
- **Risiko**: Hoch
- **Prüfung**: Agentur für Restitution konsultieren

### Albanien
- **Status**: Chaotisch
- **Risiko**: Sehr hoch
- **Prüfung**: Forensische Analyse erforderlich

## Red Flags

- Eigentum wurde zwischen 1945-1991 verstaatlicht
- Frühere Eigentümer haben Ansprüche angemeldet
- Unstimmigkeiten in Grundbucheinträgen
- Verkäufer kann keine lückenlose Kette nachweisen

## Due Diligence Prozess

1. **Kataster-Recherche**: Offizielle Einträge prüfen
2. **Restitutionsregister**: Anhängige Ansprüche?
3. **Historische Archive**: Eigentum vor 1945
4. **Gerichtsregister**: Laufende Verfahren
5. **Lokale Befragung**: Was wissen Nachbarn?

## Absicherung

- **Eigentumsversicherung**: In einigen Ländern verfügbar
- **Escrow-Vereinbarung**: Kaufpreis zurückhalten
- **Vertragliche Garantien**: Verkäufer haftet""",
        "image": "https://images.unsplash.com/photo-1450101499163-c8848c66ca85",
        "category": "Recht & Compliance",
        "date": "2025-01-20",
        "readTime": "14 min",
        "featured": False,
        "author": "Milena Bubanja",
        "relatedArticles": [106, 107, 108],
        "dueDiligenceBox": {
            "title": "Restitutions-Check",
            "content": "EuroAdria prüft: Restitutionsregister, historische Eigentümer, anhängige Verfahren, Verkäufer-Garantien. Kein Deal ohne Clean Title."
        },
        "expertTip": {
            "author": "Milena Bubanja",
            "title": "Keine Kompromisse",
            "content": "Bei Restitutionsrisiken gibt es keine Grauzone. Entweder der Titel ist sauber oder nicht. Walk away von jedem Deal mit unklarem Status."
        }
    },
    {
        "id": 132,
        "cluster": "B",
        "title": "Vertragsrecht am Balkan: Internationale Standards durchsetzen",
        "slug": "vertragsrecht-balkan-standards",
        "excerpt": "Wie Sie Verträge strukturieren, die auch bei Streit durchsetzbar sind.",
        "content": """Lokale Verträge reichen am Balkan oft nicht aus. So strukturieren Sie bankfest.

## Die Zwei-Ebenen-Strategie

### Ebene 1: Lokaler Vertrag
- In Landessprache
- Nach lokalem Recht
- Notariell beglaubigt
- Für Grundbucheintrag erforderlich

### Ebene 2: Master Agreement
- In Englisch
- Nach internationalem Recht (z.B. englisch, österreichisch)
- ICC Arbitration Klausel
- Detaillierte Schutzklauseln

## Must-Have Klauseln

### 1. Dispute Resolution
Vienna International Arbitration Centre (VIAC) oder ICC Paris.

### 2. Governing Law
Englisches oder österreichisches Recht bevorzugen.

### 3. Milestone Payments
Niemals 100% upfront. Zahlung bei Erfüllung.

### 4. Representations & Warranties
Verkäufer garantiert: Clean Title, No Litigation, Tax Compliance.

### 5. Penalty Clauses
Automatische Vertragsstrafen bei Verzug.

### 6. Exit Rights
Rücktrittsrecht bei Material Breach.

## Durchsetzung

**Lokale Gerichte**: Langsam (3-7 Jahre), unsicher
**Arbitration**: Schneller (12-18 Monate), international durchsetzbar
**Mediatorische Lösung**: Oft effektiver bei lokalen Partnern""",
        "image": "https://images.unsplash.com/photo-1589829545856-d10d557cf95f",
        "category": "Recht & Compliance",
        "date": "2025-01-21",
        "readTime": "11 min",
        "featured": False,
        "author": "Milena Bubanja",
        "relatedArticles": [108, 106, 107],
        "dueDiligenceBox": {
            "title": "Vertrags-Review",
            "content": "Wir prüfen und ergänzen lokale Verträge um internationale Schutzklauseln. Master Agreement auf Englisch inklusive."
        },
        "expertTip": {
            "author": "Milena Bubanja",
            "title": "Never Solo",
            "content": "Unterschreiben Sie nie einen Vertrag am Balkan ohne unabhängige rechtliche Prüfung. Verkäufer-Anwälte vertreten nicht Ihre Interessen."
        }
    },
    {
        "id": 133,
        "cluster": "B",
        "title": "Steuerfallen am Balkan: Was DACH-Investoren wissen müssen",
        "slug": "steuerfallen-balkan-dach",
        "excerpt": "Doppelbesteuerung, Quellensteuer, Verrechnungspreise – die kritischen Punkte.",
        "content": """Niedrige Steuern am Balkan sind attraktiv – aber Vorsicht vor versteckten Fallen.

## Die häufigsten Fehler

### 1. Doppelbesteuerung ignorieren
Ohne DBA-Nutzung zahlen Sie möglicherweise in beiden Ländern.

### 2. Substanz unterschätzen
Shell Companies ohne echte Aktivität verlieren Treaty Benefits.

### 3. Verrechnungspreise vernachlässigen
Transfer Pricing wird auch am Balkan geprüft.

### 4. Exit-Tax übersehen
Verkauf von Anteilen kann Steuerpflicht auslösen.

## Länder-Übersicht Steuern

| Land | Corporate | Dividenden | WHT |
|------|-----------|------------|-----|
| Montenegro | 9% | 9% | 9% (reduzierbar) |
| Serbien | 15% | 15% | 20% (reduzierbar) |
| Albanien | 15% | 8% | 15% (reduzierbar) |
| Nordmazedonien | 10% | 10% | 10% (reduzierbar) |

## Optimierung

### Holding-Struktur
Montenegro oder Zypern als Holding → Dividenden steuerfrei durchleiten.

### IP-Strukturen
Lizenzgebühren aus dem Balkan können optimiert werden.

### Finanzierungsstrukturen
Gesellschafterdarlehen statt Eigenkapital kann Vorteile bieten.

## Compliance ist Pflicht

- Jährliche Steuererklärungen fristgerecht
- Transfer Pricing Dokumentation
- Substance nachweisen
- Lokaler Steuerberater erforderlich""",
        "image": "https://images.unsplash.com/photo-1554224155-6726b3ff858f",
        "category": "Recht & Compliance",
        "date": "2025-01-22",
        "readTime": "12 min",
        "featured": False,
        "author": "Dr. Marcus Weber",
        "relatedArticles": [126, 127, 107],
        "dueDiligenceBox": {
            "title": "Tax Structuring",
            "content": "EuroAdria erstellt steueroptimierte Strukturen: Holding-Design, DBA-Nutzung, Transfer Pricing Compliance, Exit-Planning."
        },
        "expertTip": {
            "author": "Holger Kuhlmann",
            "title": "Substance First",
            "content": "Keine Struktur ohne echte Substanz. Leere Briefkastenfirmen sind 2025 nicht mehr bankfähig und steuerlich angreifbar."
        }
    },
    {
        "id": 134,
        "cluster": "B",
        "title": "Arbeitsrecht am Balkan: Hiring, Firing und Compliance",
        "slug": "arbeitsrecht-balkan-guide",
        "excerpt": "Was Sie bei Einstellung, Kündigung und Arbeitsverträgen am Balkan beachten müssen.",
        "content": """Arbeitsrecht am Balkan ist arbeitnehmerfreundlicher als oft angenommen.

## Grundlagen

### Arbeitsverträge
- Schriftform erforderlich
- Befristung möglich (meist 2-3 Jahre max)
- Probezeit: 3-6 Monate

### Sozialabgaben
| Land | Arbeitgeber | Arbeitnehmer |
|------|-------------|--------------|
| Montenegro | ~10% | ~24% |
| Serbien | ~17% | ~19% |
| Albanien | ~16% | ~11% |

## Kündigungsschutz

### Montenegro
- 30 Tage Kündigungsfrist
- Abfindung: 1/3 Monatsgehalt pro Jahr
- Gründe erforderlich nach Probezeit

### Serbien
- 15-30 Tage Kündigungsfrist
- Strenger Kündigungsschutz
- Arbeitsgerichtverfahren häufig

## Expat-Beschäftigung

### Arbeitsgenehmigungen
- Antrag vor Einreise
- Processing: 2-4 Wochen
- Jährliche Erneuerung

### Aufenthaltstitel
- An Arbeitsvertrag gekoppelt
- Familiennachzug möglich

## Best Practices

1. **Lokale HR-Expertise**: Arbeitsrecht-Spezialist engagieren
2. **Standardverträge**: EU-aligned Templates nutzen
3. **Dokumentation**: Alles schriftlich
4. **Compliance**: Sozialabgaben pünktlich zahlen""",
        "image": "https://images.unsplash.com/photo-1521791136064-7986c2920216",
        "category": "Recht & Compliance",
        "date": "2025-01-23",
        "readTime": "10 min",
        "featured": False,
        "author": "Milena Bubanja",
        "relatedArticles": [126, 127, 133],
        "dueDiligenceBox": {
            "title": "HR Compliance Check",
            "content": "Wir prüfen: Arbeitsverträge, Sozialversicherungsanmeldung, Arbeitsgenehmigungen, Kündigungsverfahren."
        },
        "expertTip": {
            "author": "Milena Bubanja",
            "title": "EOR als Alternative",
            "content": "Für erste Mitarbeiter: Employer of Record (EOR) nutzen. Sie zahlen Service-Fee, aber sparen Setup-Kosten und Compliance-Risiken."
        }
    },
    # ========================================
    # CLUSTER C: Montenegro Regionen (7 more = 10 total)
    # ========================================
    {
        "id": 114,
        "cluster": "C",
        "title": "Kotor: UNESCO-Welterbe als Investment – Chancen und Limits",
        "slug": "kotor-unesco-investment",
        "excerpt": "Die Perle der Adria zwischen Denkmalschutz und Investitionschance.",
        "content": """Kotor ist Montenegros Kronjuwel – mit allen Vor- und Nachteilen eines UNESCO-Welterbes.

## Das Kotor-Paradox

**Stärke**: UNESCO-Status garantiert internationale Aufmerksamkeit
**Schwäche**: Strenge Auflagen limitieren Entwicklung

## Marktdaten

- **Preisniveau**: €3.500-€8.000/m² (Altstadt €10.000+)
- **Touristen**: 600.000+ Kreuzfahrt-Passagiere/Jahr
- **Auslastung**: 85%+ in der Saison

## Investment-Optionen

### Altstadt (Old Town)
**Chancen**: Premium-Mietpreise, kulturelle Attraktivität
**Limits**: Strenge Renovierungsauflagen, Genehmigungen schwer
**Geeignet für**: Langfrist-Investoren mit Geduld

### Kotor Bucht (Dobrota, Muo, Prčanj)
**Chancen**: Waterfront ohne UNESCO-Restriktionen
**Limits**: Variierende Qualität, teils steile Hanglagen
**Geeignet für**: Entwickler mit Seeblick-Projekten

### Tivat & Porto Montenegro
**Chancen**: Luxury Yachting, internationale Käufer
**Limits**: Premium-Preise, hohe Konkurrenz
**Geeignet für**: High-End Residential

## UNESCO-Compliance

Bei Renovierungen in der Altstadt:
- Denkmalschutz-Genehmigung erforderlich
- Historische Materialien verwenden
- Fassaden dürfen nicht verändert werden
- Innenausbau flexibler

## ROI-Realität

**Altstadt Short-Term Rental**: 6-9% brutto
**Kotor Bucht Langzeitmiete**: 5-7%
**Capital Appreciation**: 5-8% p.a.""",
        "image": "https://images.unsplash.com/photo-1555990538-1e7c0ff9a0dd",
        "category": "Montenegro Regionen",
        "date": "2025-01-24",
        "readTime": "12 min",
        "featured": True,
        "author": "Holger Kuhlmann",
        "relatedArticles": [111, 112, 113],
        "dueDiligenceBox": {
            "title": "Kotor Property DD",
            "content": "Spezial-Prüfungen: (1) UNESCO-Auflagen, (2) Renovierungsgenehmigungen, (3) Kreuzfahrt-Abhängigkeit, (4) Saisonalität."
        },
        "expertTip": {
            "author": "Holger Kuhlmann",
            "title": "Bucht statt Altstadt",
            "content": "Für aktive Investoren: Kotor Bucht bietet mehr Flexibilität als die stark reglementierte Altstadt. Dobrota ist mein Geheimtipp."
        }
    },
    {
        "id": 115,
        "cluster": "C",
        "title": "Tivat & Porto Montenegro: Yachting-Lifestyle und Investment",
        "slug": "tivat-porto-montenegro-investment",
        "excerpt": "Europas führende Superyacht-Marina als Immobilien-Investment.",
        "content": """Porto Montenegro hat Tivat vom verschlafenen Flughafenort zur Luxus-Destination transformiert.

## Das Projekt

**Developer**: Adriatic Marinas (Peter Munk)
**Investment**: €1.5+ Mrd
**Status**: Weitgehend fertiggestellt
**USP**: Einzige Superyacht-Marina im östlichen Mittelmeer

## Immobilien-Optionen

### Porto Montenegro Residences
- €5.000-€10.000/m²
- Full-Service Living
- Marina-Zugang
- 5-Sterne Amenities

### Tivat Stadt
- €2.500-€4.000/m²
- Lokaler Charakter
- Flughafen-Nähe
- Gute Mietrenditen

### Umliegende Dörfer (Lepetani, Radanovići)
- €1.800-€2.800/m²
- Authentisch
- Entwicklungspotenzial

## Zielgruppen

**Käufer**: UHNWI aus Russland (vor 2022), GCC, UK, DACH
**Mieter**: Yacht-Crews, Seasonal Visitors, Digital Nomads

## ROI-Analyse

### Porto Montenegro
- Rental Yield: 4-6% (managed)
- Appreciation: 5-7% p.a.
- Liquidität: Gut (internationaler Markt)

### Tivat Stadt
- Rental Yield: 6-8%
- Appreciation: 6-9% p.a.
- Liquidität: Mittel

## Risiken

- Russland-Sanktionen reduzieren Käuferbasis
- Superyacht-Markt zyklisch
- Hohe Nebenkosten in Porto Montenegro""",
        "image": "https://images.unsplash.com/photo-1544551763-46a013bb70d5",
        "category": "Montenegro Regionen",
        "date": "2025-01-25",
        "readTime": "11 min",
        "featured": False,
        "author": "Dr. Marcus Weber",
        "relatedArticles": [114, 112, 111],
        "dueDiligenceBox": {
            "title": "Tivat Investment Check",
            "content": "Prüfpunkte: HOA-Gebühren, Rental-Pool-Bedingungen, Wiederverkaufsrestriktionen, Marina-Berth-Verfügbarkeit."
        },
        "expertTip": {
            "author": "Holger Kuhlmann",
            "title": "Tivat Stadt > Porto",
            "content": "Für Rendite-orientierte Investoren ist Tivat Stadt oft attraktiver als Porto Montenegro. Niedrigere Einstiegspreise, bessere Yields."
        }
    },
    {
        "id": 118,
        "cluster": "C",
        "title": "Herceg Novi: Die sonnige Seite der Bucht",
        "slug": "herceg-novi-investment-guide",
        "excerpt": "Montenegros sonnenreichste Stadt zwischen Tradition und Tourismus-Boom.",
        "content": """Herceg Novi ist der unterschätzte Klassiker an der Bucht von Kotor.

## Warum Herceg Novi?

- **270 Sonnentage/Jahr** – mehr als irgendwo sonst in Montenegro
- **Authentisch**: Weniger Massentourismus als Budva
- **Erschwinglich**: 30-40% günstiger als Kotor
- **Grenzlage**: 10 Minuten nach Kroatien

## Stadtteile

### Altstadt (Stari Grad)
- Historisch, charmant
- €2.000-€3.500/m²
- Limited Supply

### Savina
- Kloster-Nähe, ruhig
- €1.800-€2.800/m²
- Familien-orientiert

### Igalo
- Spa & Wellness Tradition
- €1.500-€2.500/m²
- Gesundheitstourismus

### Meljine & Zelenika
- Neue Entwicklungen
- €1.800-€3.000/m²
- Moderne Apartments

## Investment-Case

### Stärken
- Ganzjährig mild
- Wellness-Tourismus
- Kroatien-Spillover
- Lokaler Markt stabil

### Schwächen
- Infrastruktur verbesserungswürdig
- Weniger international bekannt
- Saisonalität bleibt

## Rendite-Erwartung

- Short-Term Rental: 6-9%
- Long-Term: 5-7%
- Appreciation: 5-8% p.a.""",
        "image": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64",
        "category": "Montenegro Regionen",
        "date": "2025-01-26",
        "readTime": "10 min",
        "featured": False,
        "author": "Holger Kuhlmann",
        "relatedArticles": [114, 113, 111],
        "dueDiligenceBox": {
            "title": "Herceg Novi DD",
            "content": "Fokus auf: Gebäudezustand (viele ältere Bauten), Parkplatz-Situation, Hanglagen-Zugang, saisonale Wasserversorgung."
        },
        "expertTip": {
            "author": "Holger Kuhlmann",
            "title": "Igalo Potential",
            "content": "Igalo war zu jugoslawischen Zeiten DAS Wellness-Zentrum. Mit modernem Konzept kann hier ein Revival gelingen. Grundstücke noch erschwinglich."
        }
    },
    {
        "id": 119,
        "cluster": "C",
        "title": "Ulcinj: Montenegros Süden – Albanische Riviera Light",
        "slug": "ulcinj-investment-sueden",
        "excerpt": "Lange Sandstrände, multikulturelle Atmosphäre und Entdeckerpreise.",
        "content": """Ulcinj ist Montenegros multikulturelle Grenzstadt – und ein unterschätztes Investment-Ziel.

## Das Ulcinj-Profil

- **Bevölkerung**: 70% albanisch
- **Charakter**: Authentisch, wenig Massentourismus
- **Strände**: Längster Sandstrand Montenegros (13 km)
- **Preisniveau**: 40-50% unter Budva

## Immobilienmarkt

### Altstadt (Stari Grad)
- Historisch, Festung
- €1.500-€2.500/m²
- Limited, aber charming

### Velika Plaža (Long Beach)
- 13 km Sandstrand
- €1.200-€2.000/m²
- Entwicklungspotenzial hoch

### Ada Bojana
- Naturist-Insel, einzigartig
- €1.000-€1.800/m²
- Nischen-Investment

## Investment-Thesis

### Bull Case
- EU-Beitritt bringt Infrastruktur
- Albanien-Spillover (bessere Straße nach Shkodra)
- Unentdeckt von Massenmarkt
- Kite-Surf Destination

### Bear Case
- Abgelegen
- Infrastruktur-Defizite
- Kleinerer Mietmarkt
- Kulturelle Barrieren für einige Käufer

## Rendite-Potenzial

- Short-Term: 5-8%
- Long-Term: 4-6%
- Appreciation: 8-12% (bei Erschließung)""",
        "image": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
        "category": "Montenegro Regionen",
        "date": "2025-01-27",
        "readTime": "10 min",
        "featured": False,
        "author": "Holger Kuhlmann",
        "relatedArticles": [113, 111, 105],
        "dueDiligenceBox": {
            "title": "Ulcinj Spezial-DD",
            "content": "Prüfen: Eigentumshistorie (albanisch-montenegrinische Komplexitäten), Küstenschutz-Zonen, Infrastruktur-Pläne."
        },
        "expertTip": {
            "author": "Holger Kuhlmann",
            "title": "Velika Plaža Timing",
            "content": "Der Long Beach ist der letzte große unentwickelte Strand Montenegros. Wer früh einsteigt, profitiert am meisten. Aber: Geduld erforderlich."
        }
    },
    {
        "id": 120,
        "cluster": "C",
        "title": "Podgorica: Hauptstadt-Investment abseits der Touristenpfade",
        "slug": "podgorica-hauptstadt-investment",
        "excerpt": "Die oft übersehene Hauptstadt bietet solide Renditen für den rationalen Investor.",
        "content": """Podgorica ist nicht schön – aber profitabel.

## Das Podgorica-Profil

- **Einwohner**: 200.000 (1/3 der Landesbevölkerung)
- **Funktion**: Wirtschafts-, Verwaltungs-, Universitätsstadt
- **Charakter**: Funktional, wachsend, erschwinglich

## Warum Podgorica?

### Vorteile
- **Ganzjährige Nachfrage**: Keine Saisonalität
- **Lokaler Markt**: Unabhängig von Tourismus
- **Preisniveau**: €1.200-€2.200/m²
- **Rendite**: 6-9% netto möglich

### Nachteile
- Wenig "sexy"
- Heiße Sommer (40°C+)
- Limitiertes Lifestyle-Angebot

## Stadtteile

### City Kvart / Stara Varoš
- Zentral, urban
- €1.800-€2.500/m²
- Junge Professionals

### Zabjelo / Konik
- Residential, Familien
- €1.200-€1.800/m²
- Gute Yields

### Delta City Umgebung
- Modern, Shopping-Nähe
- €1.500-€2.200/m²
- Expats

## Mietermarkt

**Zielgruppen**:
- Regierungsangestellte
- Diplomaten & NGOs
- Studenten (2 Universitäten)
- Business Travelers
- Lokale Familien

## ROI-Kalkulation

€80.000 Investment (50m² Apartment)
€450/Monat Miete = €5.400/Jahr
Netto nach Kosten: ~€4.500
**Yield: 5.6%** + Appreciation""",
        "image": "https://images.unsplash.com/photo-1449824913935-59a10b8d2000",
        "category": "Montenegro Regionen",
        "date": "2025-01-28",
        "readTime": "11 min",
        "featured": False,
        "author": "Milena Bubanja",
        "relatedArticles": [113, 111, 126],
        "dueDiligenceBox": {
            "title": "Podgorica Property Check",
            "content": "Fokus: Gebäudestandard, Verwaltung, Parkplatz, Klimaanlage (essentiell!), Nähe zu Arbeitgebern."
        },
        "expertTip": {
            "author": "Milena Bubanja",
            "title": "Diplomaten-Markt",
            "content": "Apartments in der Nähe von Botschaften und internationalen Organisationen haben stabile, zahlungskräftige Mieter. Weniger Aufwand, höhere Zuverlässigkeit."
        }
    },
    # ========================================
    # CLUSTER D: Serbien & Balkan (8 more = 10 total)
    # ========================================
    {
        "id": 135,
        "cluster": "D",
        "title": "Belgrad Real Estate: Die heimliche Balkan-Metropole",
        "slug": "belgrad-real-estate-guide",
        "excerpt": "1.7 Millionen Einwohner, boomender IT-Sektor und ein dynamischer Immobilienmarkt.",
        "content": """Belgrad ist der größte und dynamischste Immobilienmarkt am Westbalkan.

## Marktüberblick

- **Einwohner**: 1.7 Millionen
- **Preisentwicklung**: +8-12% p.a. (2020-2024)
- **Preisniveau**: €2.000-€4.500/m² (je nach Lage)

## Stadtteile für Investoren

### Dorćol & Stari Grad
- Historisch, zentral
- €3.500-€5.000/m²
- Short-Term Rental Gold

### Vračar
- Residential Premium
- €3.000-€4.500/m²
- Familien, Expats

### Novi Beograd
- Modern, Business
- €2.500-€3.500/m²
- Long-Term Rental

### Zemun
- Donau-Charme
- €2.000-€3.000/m²
- Aufstrebend

## Investment-Case

### Bull Case
- IT-Boom treibt Nachfrage
- Internationale Events (Expo-Bewerbung)
- Waterfront-Entwicklungen
- Starker lokaler Markt

### Bear Case
- Politische Volatilität
- EU-Beitritt unsicher
- Infrastruktur-Staus
- Bürokratie

## Renditen

- Short-Term: 7-10%
- Long-Term: 5-7%
- Appreciation: 6-10% p.a.""",
        "image": "https://images.unsplash.com/photo-1580910527160-6891e5ed8784",
        "category": "Serbien & Balkan",
        "date": "2025-01-29",
        "readTime": "12 min",
        "featured": True,
        "author": "Dr. Marcus Weber",
        "relatedArticles": [104, 116, 127],
        "dueDiligenceBox": {
            "title": "Belgrad Property DD",
            "content": "Prüfpunkte: Legalisierungsstatus (viele illegale Bauten), Eigentumshistorie, Baugenehmigungen, HOA-Funktionalität."
        },
        "expertTip": {
            "author": "Holger Kuhlmann",
            "title": "Waterfront beobachten",
            "content": "Belgrade Waterfront ist kontrovers, aber transformiert die Stadt. Umliegende Viertel (Savamala) profitieren. Jetzt positionieren."
        }
    },
    {
        "id": 136,
        "cluster": "D",
        "title": "Novi Sad: Serbiens zweite Stadt und EU-Kulturhauptstadt",
        "slug": "novi-sad-investment-guide",
        "excerpt": "Kulturhauptstadt 2022, EXIT Festival und wachsender IT-Sektor machen Novi Sad interessant.",
        "content": """Novi Sad ist Serbiens charmante Alternative zu Belgrad.

## Stadt-Profil

- **Einwohner**: 400.000
- **Charakter**: Kultiviert, entspannt, europäisch
- **Events**: EXIT Festival, EU-Kulturhauptstadt 2022

## Immobilienmarkt

### Preisniveau
- Zentrum: €1.800-€2.800/m²
- Residential: €1.500-€2.200/m²
- 30-40% günstiger als Belgrad

### Stadtteile
**Stari Grad**: Historisch, touristisch
**Liman**: Modern, Familien
**Petrovaradin**: Festung, Charakter
**Detelinara**: Residential, Value

## Investment-Thesis

### Stärken
- EXIT Festival bringt 200.000 Besucher/Jahr
- Wachsender IT-Sektor
- Universitätsstadt (50.000 Studenten)
- Lebensqualität hoch

### Schwächen
- Kleinerer Markt als Belgrad
- Saisonalität (Sommer-Events)
- Limitierte internationale Bekanntheit

## Renditen

- Short-Term (Festival-Saison): 10-15%
- Long-Term: 5-7%
- Appreciation: 5-8% p.a.""",
        "image": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64",
        "category": "Serbien & Balkan",
        "date": "2025-01-30",
        "readTime": "10 min",
        "featured": False,
        "author": "Holger Kuhlmann",
        "relatedArticles": [135, 104, 116],
        "dueDiligenceBox": {
            "title": "Novi Sad Check",
            "content": "Prüfen: Festival-Nähe (Lärm!), Uni-Nähe für Studentenvermietung, Parkplätze, Donau-Hochwasser-Risiko."
        },
        "expertTip": {
            "author": "Holger Kuhlmann",
            "title": "Petrovaradin Geheimtipp",
            "content": "Die Festungsseite (Petrovaradin) ist unterschätzt. Weniger touristisch als erwartet, aber Character und Preisvorteil."
        }
    },
    {
        "id": 137,
        "cluster": "D",
        "title": "Kosovo: Der kontroverse Wachstumsmarkt",
        "slug": "kosovo-investment-analyse",
        "excerpt": "Jüngste Bevölkerung Europas, EU-Perspektive und unerschlossene Märkte.",
        "content": """Kosovo ist der kontroverseste – und möglicherweise renditeträchtigste – Balkan-Markt.

## Das Kosovo-Profil

- **Status**: Teilweise anerkannte Republik
- **Bevölkerung**: 1.8 Mio (Median-Alter: 29 Jahre!)
- **Wachstum**: 4-5% BIP p.a.
- **Währung**: Euro (einseitig)

## Chancen

### Demografischer Vorteil
Jüngste Bevölkerung Europas = Arbeitskräfte + Konsum

### Diaspora-Kapital
500.000+ Kosovaren in DACH schicken Geld zurück

### Unerschlossene Märkte
Wenig Wettbewerb in vielen Sektoren

### EU-Annäherung
Visa-Liberalisierung, Stabilisierungs-Assoziierung

## Risiken

### Politische Unsicherheit
Serbien erkennt Kosovo nicht an

### Rechtsunsicherheit
Eigentumsfragen komplex

### Internationale Isolation
Nicht alle Länder erkennen an

### Korruption
Transparency International: Niedrige Scores

## Sektoren

- **Immobilien**: Pristina boomt
- **Gastgewerbe**: Tourismus wächst
- **IT/BPO**: Aufstrebend
- **Landwirtschaft**: Export-Potenzial

## Fazit

Kosovo ist für risikobereite Pioniere mit lokaler Expertise. Nicht für den durchschnittlichen DACH-Investor.""",
        "image": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5",
        "category": "Serbien & Balkan",
        "date": "2025-01-31",
        "readTime": "11 min",
        "featured": False,
        "author": "Dr. Marcus Weber",
        "relatedArticles": [104, 109, 105],
        "dueDiligenceBox": {
            "title": "Kosovo Risk Assessment",
            "content": "Essentiell: Lokaler Partner mit Regierungskontakten, internationale Rechtsstruktur, Exit-Strategie, Versicherung."
        },
        "expertTip": {
            "author": "Holger Kuhlmann",
            "title": "Diaspora-Connection",
            "content": "Die kosovarische Diaspora in DACH ist der Schlüssel. Partner mit Diaspora-Netzwerk können Türen öffnen, die anderen verschlossen bleiben."
        }
    },
    {
        "id": 138,
        "cluster": "D",
        "title": "Bosnien-Herzegowina: Komplexität als Chance",
        "slug": "bosnien-herzegowina-investment",
        "excerpt": "Drei Ethnien, zwei Entitäten, unzählige Chancen für den informierten Investor.",
        "content": """Bosnien ist komplex – aber gerade das schafft Arbitrage-Chancen.

## Das Land verstehen

**Struktur**: 
- Föderation Bosnien-Herzegowina
- Republika Srpska
- Distrikt Brčko

**Ethnien**: Bosniaken, Serben, Kroaten

## Investitions-Landschaft

### Sarajevo (Föderation)
- Hauptstadt, größter Markt
- €1.500-€2.500/m²
- Wachsender Tourismus

### Banja Luka (Republika Srpska)
- Zweitgrößte Stadt
- €1.000-€1.800/m²
- Stabil, weniger dynamisch

### Mostar
- UNESCO Brücke
- Tourismus-Fokus
- €1.200-€2.000/m²

## Chancen

- Unentdeckte Touristenziele
- Günstige Immobilienpreise
- EU-Kandidatenstatus
- Gut ausgebildete Arbeitskräfte

## Risiken

- Politische Fragmentierung
- Bürokratie verdoppelt (Entitäten)
- Brain Drain
- Komplexe Eigentumsrechte

## Sektoren

- **Tourismus**: Sarajevo, Mostar
- **Energie**: Wasserkraft
- **IT**: Wachsend
- **Landwirtschaft**: Export""",
        "image": "https://images.unsplash.com/photo-1581351123004-757df051db8e",
        "category": "Serbien & Balkan",
        "date": "2025-02-01",
        "readTime": "11 min",
        "featured": False,
        "author": "Dr. Marcus Weber",
        "relatedArticles": [104, 137, 116],
        "dueDiligenceBox": {
            "title": "Bosnien Komplexitäts-Check",
            "content": "Entscheidend: In welcher Entität liegt das Asset? Rechtssystem, Steuern, Genehmigungen unterscheiden sich fundamental."
        },
        "expertTip": {
            "author": "Holger Kuhlmann",
            "title": "Sarajevo First",
            "content": "Für Einsteiger: Konzentrieren Sie sich auf Sarajevo. Größter Markt, beste Infrastruktur, internationale Community. Expansion später."
        }
    },
    # ========================================
    # CLUSTER E: Lifestyle & Relocation (7 more = 10 total)
    # ========================================
    {
        "id": 124,
        "cluster": "E",
        "title": "Montenegro Krankenversicherung: Optionen für Expats",
        "slug": "montenegro-krankenversicherung-expats",
        "excerpt": "Öffentlich, privat oder international? Die Gesundheitsvorsorge für Auswanderer im Detail.",
        "content": """Gesundheitsversorgung ist ein kritischer Faktor bei der Relocation-Entscheidung.

## Das System verstehen

### Öffentliches System
- **Beiträge**: €40-€80/Monat
- **Leistungen**: Grundversorgung
- **Qualität**: Variiert stark
- **Wartezeiten**: Oft lang

### Private Versorgung
- **Kosten**: €100-€300/Monat
- **Leistungen**: Besser
- **Kliniken**: Podgorica, Budva
- **Qualität**: EU-Standard möglich

## Optionen für Expats

### Option 1: Öffentliche Versicherung
- Günstig
- Für Dauerresidenten
- Basis-Coverage

### Option 2: Lokale Privatversicherung
- Triglav, Lovćen, Uniqa
- €80-€150/Monat
- Lokale Kliniken

### Option 3: Internationale Versicherung
- Cigna, Allianz, AXA
- €150-€400/Monat
- Weltweiter Schutz
- Evakuierung inklusive

## Empfehlung

**Für junge Expats**: Internationale Police mit hohem Selbstbehalt
**Für Familien**: Lokale Privatversicherung + Evakuierungspolice
**Für Senioren**: Vollständige internationale Abdeckung

## Wichtige Kliniken

- **Podgorica**: Clinical Center (öffentlich), Codra (privat)
- **Budva**: Mediteran Hospital
- **Kotor**: Allgemeinkrankenhaus

## Für ernste Fälle

**Realität**: Komplexe Behandlungen → Kroatien oder Österreich
**Empfehlung**: Versicherung mit Repatriierung wählen""",
        "image": "https://images.unsplash.com/photo-1576091160550-2173dba999ef",
        "category": "Lifestyle & Relocation",
        "date": "2025-02-02",
        "readTime": "10 min",
        "featured": False,
        "author": "Marina Dalmatinac",
        "relatedArticles": [121, 122, 123],
        "dueDiligenceBox": {
            "title": "Healthcare Planning",
            "content": "EuroAdria hilft bei: Versicherungsvergleich, Klinik-Empfehlungen, Arzt-Kontakte, Notfall-Planung."
        },
        "expertTip": {
            "author": "Holger Kuhlmann",
            "title": "Evakuierung ist Pflicht",
            "content": "Für ernste Fälle ist Montenegro limitiert. Versicherung mit Evakuierung nach Wien/München ist keine Luxusoption, sondern notwendig."
        }
    },
    {
        "id": 125,
        "cluster": "E",
        "title": "Internationale Schulen in Montenegro: Guide für Familien",
        "slug": "internationale-schulen-montenegro",
        "excerpt": "Bildungsoptionen für Expat-Kinder: Von Montessori bis IB-Curriculum.",
        "content": """Bildung ist oft der limitierende Faktor für Familien-Relocation.

## Internationale Schulen

### QSI International School Podgorica
- **Curriculum**: US-amerikanisch
- **Alter**: 3-18 Jahre
- **Gebühren**: €8.000-€14.000/Jahr
- **Sprache**: Englisch
- **Qualität**: Gut etabliert

### Knightsbridge Schools International (Tivat)
- **Curriculum**: Britisch
- **Alter**: 3-18 Jahre
- **Gebühren**: €10.000-€18.000/Jahr
- **Sprache**: Englisch
- **Qualität**: Premium

### Arcadia Academy (Podgorica)
- **Curriculum**: Cambridge
- **Alter**: 6-18 Jahre
- **Gebühren**: €6.000-€10.000/Jahr
- **Sprache**: Englisch
- **Qualität**: Wachsend

## Alternative Optionen

### Montenegrinische Schulen
- Kostenlos für Residenten
- Montenegrinisch als Unterrichtssprache
- Internationale Abteilungen in einigen Schulen

### Homeschooling
- Legal in Montenegro
- Online-Curricula verfügbar
- Flexibel für reisende Familien

### Boarding Schools (Ausland)
- Kroatien, Österreich, Schweiz
- Ab €30.000/Jahr
- Für High School

## Empfehlung nach Region

**Podgorica**: QSI oder Arcadia
**Tivat/Kotor**: Knightsbridge
**Budva**: Pendeln nach Podgorica oder Tivat
**Herceg Novi**: Dubrovnik (30 min) hat Optionen""",
        "image": "https://images.unsplash.com/photo-1503676260728-1c00da094a0b",
        "category": "Lifestyle & Relocation",
        "date": "2025-02-03",
        "readTime": "11 min",
        "featured": False,
        "author": "Marina Dalmatinac",
        "relatedArticles": [123, 121, 122],
        "dueDiligenceBox": {
            "title": "Education Planning",
            "content": "Wir organisieren: Schulbesichtigungen, Anmeldungsprozess, Visa-Koordination für schulpflichtige Kinder."
        },
        "expertTip": {
            "author": "Holger Kuhlmann",
            "title": "Früh planen",
            "content": "Internationale Schulen haben limitierte Plätze. Anmeldung 6-12 Monate vor Schulbeginn. Wartelisten sind real."
        }
    },
    {
        "id": 129,
        "cluster": "E",
        "title": "Auto kaufen in Montenegro: Import, Zulassung, Versicherung",
        "slug": "auto-kaufen-montenegro-guide",
        "excerpt": "Vom EU-Import bis zur montenegrinischen Zulassung – der komplette Fahrzeug-Guide.",
        "content": """Ein Auto ist in Montenegro außerhalb von Podgorica fast unverzichtbar.

## Optionen

### Option 1: Lokal kaufen
- Gebrauchtwagen-Markt existiert
- Preise: Vergleichbar mit DACH
- Qualität: Variiert stark
- Vorteil: Sofortige Nutzung

### Option 2: EU-Import
- Oft günstiger (besonders Premium)
- Zoll: 0% für EU-Fahrzeuge mit Residenz
- Homologation erforderlich
- Dauer: 2-4 Wochen

### Option 3: Leasing
- Lokale Optionen begrenzt
- Internationale Leasingfirmen in Podgorica
- Für Unternehmen oft sinnvoll

## Import-Prozess

1. **Fahrzeug kaufen** (EU)
2. **Export-Kennzeichen** erhalten
3. **Transport** nach Montenegro
4. **Zoll** (0% für Residenten, ~20% für Nicht-Residenten)
5. **Homologation** (technische Prüfung)
6. **Zulassung** (Verkehrsbehörde)

## Kosten

- **Zoll** (Nicht-Residenten): 15-20% vom Wert
- **Homologation**: €100-€300
- **Zulassung**: €50-€100
- **Versicherung**: €300-€800/Jahr

## Versicherung

**Pflicht**: Haftpflicht (min. €200/Jahr)
**Empfohlen**: Vollkasko für teure Fahrzeuge
**Anbieter**: Lovćen, Sava, Triglav, Uniqa

## Tipps

- Deutsche Fahrzeuge haben guten Ruf
- Diesel ist günstig (€1.30-€1.50/L)
- Werkstätten: Qualität variiert, Empfehlungen holen
- Ersatzteile: Für gängige Marken verfügbar""",
        "image": "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d",
        "category": "Lifestyle & Relocation",
        "date": "2025-02-04",
        "readTime": "10 min",
        "featured": False,
        "author": "Stefan Petrovic",
        "relatedArticles": [123, 121, 122],
        "dueDiligenceBox": {
            "title": "Fahrzeug-Import Service",
            "content": "EuroAdria unterstützt: Fahrzeugsuche, Import-Logistik, Zoll-Abwicklung, Homologation, Zulassung, Versicherung."
        },
        "expertTip": {
            "author": "Holger Kuhlmann",
            "title": "SUV oder Allrad",
            "content": "Montenegro hat Berge und schlechte Nebenstraßen. Ein SUV oder Allrad ist keine Luxusoption, besonders wenn Sie außerhalb der Küste wohnen."
        }
    },
    {
        "id": 130,
        "cluster": "E",
        "title": "Bankkonto eröffnen in Montenegro: Der praktische Guide",
        "slug": "bankkonto-montenegro-eroeffnen",
        "excerpt": "Welche Bank, welche Dokumente, welche Fallstricke – für Privatpersonen und Unternehmen.",
        "content": """Ein lokales Bankkonto ist für jeden längeren Aufenthalt in Montenegro essentiell.

## Banken-Übersicht

### CKB (Crnogorska Komercijalna Banka)
- Größte lokale Bank
- Gute Online-Banking
- Expat-freundlich
- Empfehlung: Erste Wahl

### NLB (Nova Ljubljanska Banka)
- Slowenische Muttergesellschaft
- EU-Standards
- Schnelle Kontoeröffnung

### Erste Bank
- Österreichische Mutter
- Konservativ aber solide
- Gute SEPA-Anbindung

### Hipotekarna Banka
- Lokale Bank
- Persönlicher Service
- Für KMU interessant

## Kontoeröffnung (Privatperson)

### Erforderliche Dokumente
1. Reisepass (gültig)
2. Residence Permit (oder Tourist mit Begründung)
3. Adressnachweis (Mietvertrag/Utility Bill)
4. Referenzschreiben (von Heimatbank hilfreich)

### Prozess
1. Termin vereinbaren
2. Dokumente vorlegen
3. Formulare ausfüllen
4. Erstkontierung (€100-€500 empfohlen)
5. Karte/Online-Zugang in 5-10 Tagen

## Für Unternehmen

**Zusätzlich erforderlich**:
- Gesellschaftsvertrag
- Handelsregisterauszug
- UBO-Erklärung
- Business Plan
- Source of Funds Nachweis

**Dauer**: 2-8 Wochen (je nach Komplexität)

## Gebühren

- Kontoführung: €5-€20/Monat
- Überweisungen (lokal): €0.50-€2
- SEPA: €3-€10
- International: €15-€30

## Online-Banking

- Alle großen Banken bieten es an
- Mobile Apps verfügbar
- Qualität: Akzeptabel, nicht EU-Niveau""",
        "image": "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d",
        "category": "Lifestyle & Relocation",
        "date": "2025-02-05",
        "readTime": "10 min",
        "featured": False,
        "author": "Milena Bubanja",
        "relatedArticles": [128, 126, 122],
        "dueDiligenceBox": {
            "title": "Banking Setup Service",
            "content": "EuroAdria organisiert: Bank-Termine, Dokumentenvorbereitung, Übersetzungen, Follow-up bei Verzögerungen."
        },
        "expertTip": {
            "author": "Milena Bubanja",
            "title": "Relationship Manager",
            "content": "Fragen Sie nach einem persönlichen Relationship Manager. Bei Problemen oder Spezialanfragen ist dieser direkte Kontakt Gold wert."
        }
    },
    # ========================================
    # CLUSTER F: Business Setup (7 more = 10 total)
    # ========================================
    {
        "id": 139,
        "cluster": "F",
        "title": "Freelancing in Montenegro: Steuern, Registrierung, Best Practices",
        "slug": "freelancing-montenegro-guide",
        "excerpt": "Als Selbstständiger in Montenegro arbeiten: Von der Registrierung bis zur Optimierung.",
        "content": """Montenegro ist für Freelancer attraktiv – wenn man es richtig strukturiert.

## Optionen für Freelancer

### Option 1: Einzelunternehmer (Preduzetnik)
- **Registrierung**: 1-2 Wochen
- **Kosten**: €100-€200 Setup
- **Steuern**: 9% auf Gewinn
- **Sozialabgaben**: ~€150-€250/Monat
- **Buchhaltung**: Einfach

### Option 2: D.O.O. (GmbH)
- **Registrierung**: 2-4 Wochen
- **Kosten**: €500-€1.500 Setup
- **Steuern**: 9% Corporate + 9% Dividenden
- **Buchhaltung**: Volle Buchführung
- **Vorteil**: Haftungsbeschränkung

### Option 3: Digital Nomad Visa
- **Steuern**: 0% auf ausländisches Einkommen
- **Dauer**: 12 Monate
- **Limit**: Nur Remote-Arbeit für Nicht-MNE-Kunden

## Steueroptimierung

### Legale Möglichkeiten
- Betriebsausgaben maximieren
- Pauschalen nutzen (wo möglich)
- Timing von Rechnungen
- Sozialabgaben-Optimierung

### Was NICHT funktioniert
- Keine Substanz → Probleme
- Aggressive Konstruktionen
- Doppelte Strukturen ohne Grund

## Praktische Schritte

1. **Residenz** sichern
2. **Bank** eröffnen
3. **Registrierung** (Einzelunternehmer oder D.O.O.)
4. **Steuerberater** engagieren
5. **Rechnungsstellung** einrichten
6. **Buchhaltung** organisieren

## Branchen-Tipps

**IT/Development**: D.O.O. oft sinnvoll (IP-Schutz)
**Beratung**: Einzelunternehmer kann reichen
**Creative**: Flexibel, je nach Volumen""",
        "image": "https://images.unsplash.com/photo-1522202176988-66273c2fd55f",
        "category": "Business Setup",
        "date": "2025-02-06",
        "readTime": "12 min",
        "featured": False,
        "author": "Stefan Petrovic",
        "relatedArticles": [121, 126, 127],
        "dueDiligenceBox": {
            "title": "Freelancer Setup",
            "content": "EuroAdria Paket: Rechtsformberatung, Registrierung, Steuerberatung, Buchhaltungs-Setup, Bank-Intro."
        },
        "expertTip": {
            "author": "Holger Kuhlmann",
            "title": "Volumen entscheidet",
            "content": "Unter €50k/Jahr: Einzelunternehmer. Darüber: D.O.O. prüfen. Ab €100k: D.O.O. fast immer sinnvoller."
        }
    },
    {
        "id": 140,
        "cluster": "F",
        "title": "E-Commerce aus Montenegro: Amazon, Shopify & Co.",
        "slug": "ecommerce-montenegro-setup",
        "excerpt": "Online-Handel von Montenegro aus betreiben: Logistik, Steuern, Plattformen.",
        "content": """E-Commerce aus Montenegro ist möglich – mit den richtigen Strukturen.

## Plattformen

### Amazon (FBA)
- **Möglich**: Ja, über EU-Entität
- **Struktur**: MNE Company → EU Amazon Account
- **Logistik**: FBA-Lager in EU
- **Herausforderung**: VAT-Compliance in EU

### Shopify/Eigener Shop
- **Einfacher**: Direkt aus Montenegro
- **Payment**: Stripe (über US-Entity), PayPal
- **Logistik**: Dropshipping oder 3PL

### Etsy
- **Gut geeignet**: Handgemachte Produkte
- **Zahlungen**: PayPal, direkte Überweisung
- **Steuern**: Einfacher als Amazon

## Steuerliche Aspekte

### Montenegro-Seite
- 9% Corporate Tax
- 21% VAT (für lokale Verkäufe)
- Export: 0% VAT

### EU-Verkäufe
- OSS (One Stop Shop) Registrierung empfohlen
- VAT in Kundenländern ab Schwellenwert
- Komplexität bei hohem Volumen

## Logistik-Optionen

### Dropshipping
- Kein Lager in Montenegro
- Supplier liefert direkt
- Geeignet für Start

### 3PL in EU
- Lager in Slowenien/Kroatien
- Schnellere Lieferung
- Höhere Kosten

### Lokales Lager + Export
- Nur für bestimmte Produkte sinnvoll
- Zoll bei EU-Export beachten

## Empfehlung

**Start**: Dropshipping + Shopify
**Wachstum**: 3PL in EU + OSS-Registrierung
**Skalierung**: Eigene EU-Entität prüfen""",
        "image": "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d",
        "category": "Business Setup",
        "date": "2025-02-07",
        "readTime": "11 min",
        "featured": False,
        "author": "Dr. Marcus Weber",
        "relatedArticles": [126, 127, 139],
        "dueDiligenceBox": {
            "title": "E-Commerce Setup",
            "content": "Wir strukturieren: Unternehmensform, Payment-Setup, VAT-Compliance, Logistik-Partner, Bank-Anbindung."
        },
        "expertTip": {
            "author": "Holger Kuhlmann",
            "title": "EU-Entität bei Skalierung",
            "content": "Ab €100k EU-Umsatz: Eigene EU-Entity (z.B. Slowenien, Estland) oft sinnvoller als komplexe MNE-Struktur."
        }
    },
    {
        "id": 141,
        "cluster": "F",
        "title": "Gastgewerbe in Montenegro gründen: Restaurant, Bar, Hotel",
        "slug": "gastgewerbe-montenegro-gruenden",
        "excerpt": "Von Genehmigungen bis Saisonalität – was Sie über F&B und Hospitality wissen müssen.",
        "content": """Gastgewerbe ist Montenegros wichtigster Wirtschaftszweig – mit Chancen und Fallstricken.

## Genehmigungen

### Restaurant/Bar
1. **Gewerbeanmeldung** (D.O.O. oder Einzelunternehmer)
2. **Gesundheitsgenehmigung** (Sanitäre Inspektion)
3. **Brandschutz** (Feuerwehr-Zertifikat)
4. **Alkohollizenz** (Gemeinde)
5. **Außenbereich** (Gemeinde-Genehmigung)

### Hotel/Pension
- Zusätzlich: Tourismus-Kategorisierung
- Feuermelder, Notausgänge
- Rezeptionspflicht ab Größe

## Standort-Analyse

### Budva
- Höchste Frequenz
- Höchste Konkurrenz
- Saisonalität extrem (Juni-September)

### Kotor
- UNESCO-Touristen
- Ganzjähriger (aber weniger)
- Premium-Positionierung möglich

### Tivat
- Yacht-Publikum
- Kaufkräftig
- Weniger saisonal

## Kosten-Kalkulation

### Setup (kleines Restaurant, 50 Plätze)
- Umbau/Ausstattung: €50.000-€150.000
- Genehmigungen: €5.000-€10.000
- Erstausstattung: €20.000-€40.000
- Working Capital: €20.000-€30.000
- **Total**: €100.000-€250.000

### Laufende Kosten
- Personal: 30-40% vom Umsatz
- Wareneinsatz: 25-35%
- Miete: 10-20%
- Sonstiges: 10-15%

## Saisonalität managen

### Strategien
- Winter-Angebot für Locals
- Events/Catering
- Delivery
- Temporäre Schließung (Off-Season)

### Realität
- 70-80% des Jahresumsatzes in 4 Monaten
- Personal-Fluktuation hoch
- Cashflow-Planung kritisch""",
        "image": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4",
        "category": "Business Setup",
        "date": "2025-02-08",
        "readTime": "13 min",
        "featured": False,
        "author": "Holger Kuhlmann",
        "relatedArticles": [113, 114, 126],
        "dueDiligenceBox": {
            "title": "F&B Feasibility",
            "content": "EuroAdria prüft: Standort-Analyse, Genehmigungsprozess, Wettbewerb, Break-Even-Kalkulation, Personal-Verfügbarkeit."
        },
        "expertTip": {
            "author": "Holger Kuhlmann",
            "title": "Personal ist alles",
            "content": "Der größte Engpass ist gutes Personal. Kochen Sie Ihr Konzept auf den lokalen Arbeitsmarkt runter – komplexe Küche scheitert oft am Team."
        }
    },
    {
        "id": 142,
        "cluster": "F",
        "title": "Immobilien-Entwicklung in Montenegro: Vom Grundstück zum Projekt",
        "slug": "immobilien-entwicklung-montenegro",
        "excerpt": "Development-Guide: Genehmigungen, Kosten, Timeline und kritische Erfolgsfaktoren.",
        "content": """Real Estate Development in Montenegro kann lukrativ sein – mit dem richtigen Prozess.

## Der Development-Prozess

### Phase 1: Land Acquisition
- Due Diligence (Chain of Title!)
- Zoning-Prüfung
- Infrastruktur-Anbindung
- Kaufvertrag mit Conditions

### Phase 2: Planning
- Architekt beauftragen
- Preliminary Design
- Urban Planning Compliance
- Environmental Assessment (wenn erforderlich)

### Phase 3: Permits
- Location Permit (Lokacijska dozvola)
- Building Permit (Građevinska dozvola)
- Utility Connections
- Timeline: 6-18 Monate

### Phase 4: Construction
- Contractor Selection (Ausschreibung empfohlen)
- Construction Management
- Quality Control
- Timeline: 12-36 Monate

### Phase 5: Completion
- Occupancy Permit (Uporabna dozvola)
- Registration
- Sales/Rental

## Kosten-Struktur

### Kleine Villa (200m², Premium-Lage)
- Land: €150.000-€300.000
- Construction: €150.000-€250.000
- Permits/Fees: €15.000-€30.000
- Professional Fees: €20.000-€40.000
- **Total**: €350.000-€620.000
- **Verkaufswert**: €500.000-€900.000

### Apartment-Projekt (10 Units)
- Land: €300.000-€600.000
- Construction: €800.000-€1.500.000
- Soft Costs: €150.000-€300.000
- **Total**: €1.3-€2.4 Mio
- **Verkaufswert**: €1.8-€3.5 Mio

## Kritische Erfolgsfaktoren

1. **Standort**: Location, Location, Location
2. **Genehmigungen**: Vor Kauf sicherstellen
3. **Contractor**: Referenzen prüfen
4. **Timeline**: Puffer einplanen (30%+)
5. **Finanzierung**: Durchfinanziert starten""",
        "image": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab",
        "category": "Business Setup",
        "date": "2025-02-09",
        "readTime": "14 min",
        "featured": True,
        "author": "Holger Kuhlmann",
        "relatedArticles": [106, 113, 126],
        "dueDiligenceBox": {
            "title": "Development Feasibility",
            "content": "EuroAdria prüft: Grundstücks-DD, Zoning, Genehmigungsfähigkeit, Cost Estimate, Pro-Forma, Exit-Strategie."
        },
        "expertTip": {
            "author": "Holger Kuhlmann",
            "title": "Occupancy Permit First",
            "content": "Kaufen Sie NIEMALS ein Grundstück ohne schriftliche Bestätigung, dass eine Baugenehmigung erteilt werden kann. Informelle Zusagen sind wertlos."
        }
    },
    {
        "id": 143,
        "cluster": "F",
        "title": "Yacht-Charter-Business in Montenegro: Der Marine-Markt",
        "slug": "yacht-charter-business-montenegro",
        "excerpt": "Porto Montenegro als Sprungbrett: Charter-Lizenzen, Flotten-Management und ROI.",
        "content": """Montenegro positioniert sich als Yachting-Destination – mit Geschäftsmöglichkeiten.

## Der Markt

### Nachfrage
- Wachstum: 10-15% p.a.
- Saison: Mai-Oktober
- Zielgruppe: EU-Touristen, GCC, UK

### Angebot
- Porto Montenegro: Superyacht-Hub
- Kotor: Kleinere Yachten, Tagestourismus
- Budva: Day-Charter, lokaler Markt

## Business-Modelle

### Modell 1: Eigene Charter-Yacht
- **Investment**: €150.000-€2 Mio+
- **Revenue**: €30.000-€200.000/Saison
- **Kosten**: Marina, Wartung, Crew, Versicherung
- **Net Yield**: 5-12%

### Modell 2: Charter-Management
- Yachten im Management
- Commission: 20-30% vom Charter
- Geringeres Investment
- Skalierbar

### Modell 3: Day-Charter/Touren
- Kleine Boote (€30.000-€100.000)
- Hohe Rotation
- Personal-intensiv
- ROI: 15-25%

## Rechtliche Anforderungen

### Charter-Lizenz
- Gewerbeanmeldung (D.O.O.)
- Charter-Permit (Ministerium)
- Yacht-Registrierung
- Crew-Zertifikate

### Steuerlich
- 21% VAT auf Charter
- 9% Corporate Tax
- Crew-Sozialabgaben

## Standort-Wahl

### Porto Montenegro
- Premium-Markt
- Hohe Kosten
- Internationale Kundschaft

### Kotor
- Mid-Market
- Moderatere Kosten
- Wachsend

### Budva
- Mass-Market
- Niedrigste Kosten
- Höchste Konkurrenz""",
        "image": "https://images.unsplash.com/photo-1544551763-46a013bb70d5",
        "category": "Business Setup",
        "date": "2025-02-10",
        "readTime": "12 min",
        "featured": False,
        "author": "Dr. Marcus Weber",
        "relatedArticles": [115, 114, 126],
        "dueDiligenceBox": {
            "title": "Marine Business Setup",
            "content": "EuroAdria unterstützt: Marktanalyse, Lizenzierung, Yacht-Sourcing, Marina-Verhandlung, Crew-Rekrutierung."
        },
        "expertTip": {
            "author": "Holger Kuhlmann",
            "title": "Day-Charter als Einstieg",
            "content": "Starten Sie mit Day-Charter (8-12m Boot). Geringeres Risiko, schneller Cashflow, lernen Sie den Markt kennen. Skalieren Sie später."
        }
    }
]


async def add_articles():
    """Add remaining articles to database"""
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.environ.get('DB_NAME', 'test_database')
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    # Get current count
    current_count = await db.articles.count_documents({})
    print(f"Current articles in database: {current_count}")
    
    # Insert new articles
    added = 0
    for article in additional_articles:
        # Check if article with this ID already exists
        existing = await db.articles.find_one({"id": article["id"]})
        if existing:
            print(f"Skipping (exists): {article['title'][:40]}...")
            continue
        
        await db.articles.insert_one(article)
        print(f"Added: {article['title'][:40]}...")
        added += 1
    
    # Get final count
    final_count = await db.articles.count_documents({})
    print(f"\nAdded {added} new articles")
    print(f"Total articles now: {final_count}")
    
    client.close()


if __name__ == "__main__":
    asyncio.run(add_articles())
