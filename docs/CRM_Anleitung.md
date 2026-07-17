# EuroAdria CRM – Komplett-Anleitung für Erklärvideo

---

## 1. ADMIN PANEL (Holger / CEO)

### Login
- URL: `https://www.euroadria.me/admin`
- Benutzername: `admin`
- Passwort: `euroadria2025`
- Auto-Logout nach 30 Minuten Inaktivität

---

### 1.1 Dashboard – Leads Übersicht

**Aktuelle Leads sehen:**
- Nach dem Login siehst du sofort die "Recent Leads" Tabelle mit den neusten Leads
- Klicke auf **"Alle Leads anzeigen"** um ALLE Leads zu laden (z.B. 201 Stück)

**Leads durchsuchen:**
- **Suchfeld**: Tippe Name, Email oder Telefon ein → sofortige Filterung
- **Quellen-Filter** (Dropdown rechts): Filtere nach Herkunft, z.B. "Facebook Campaign (53)" oder "Manual"

**Neuen Lead manuell anlegen:**
- Klicke den grünen **"+ Lead"** Button
- Fülle Name, Email, Telefon, Quelle, Land, Stadt, Interesse aus
- Klicke "Lead speichern"

**Leads importieren (CSV):**
- Klicke **"Import"** Button
- Wähle eine CSV-Datei (Komma oder Semikolon getrennt)
- Gib ein Label ein (z.B. "Facebook Campaign", "LinkedIn Leads")
- Klicke "Leads importieren"
- Duplikate (gleiche Email) werden automatisch übersprungen

**Leads exportieren:**
- Klicke **"CSV"** Button → Alle Leads als CSV-Datei herunterladen

---

### 1.2 Lead Detail Modal – Das Herzstück

**Öffnen:** Klicke auf eine beliebige Lead-Zeile in der Tabelle

**Was du siehst:**
- Kontaktdaten: Name, Email, Telefon, Standort, Interesse
- Email-Status: Ob der Lead die Email geöffnet hat (und wie oft)

**Deal & Commission Bereich (gold umrandet):**
- **Property Value**: Immobilienwert eingeben (z.B. 350.000 €)
- **Property Type**: Typ auswählen (Apartment, House, Villa, Land, Commercial, Hotel)
- **Location**: Standort der Immobilie (z.B. "Budva, Montenegro")
- **Commission (EUR)**: Provision manuell eingeben (z.B. 10.500 €)
- Klicke **"Save Deal Details"** zum Speichern

**WICHTIG:** Nur DU (Admin) kannst Provisionen setzen! Das Team sieht nur den von dir eingetragenen Betrag (read-only).

**Email direkt senden:**
- Klicke **"Neue Email"** im Email-Bereich
- Betreff und Nachricht eingeben
- Absender: "Holger Kuhlmann - EuroAdria <office@euroadria.me>"
- Firmensignatur mit Logo wird automatisch angehängt
- Gesendete Emails sind aufklappbar im Verlauf sichtbar

**Notizen:**
- Schreibe eine Notiz und klicke "Speichern"
- Du siehst auch Notizen die das Team (Milena, D. Lein) geschrieben hat
- Notizen zeigen Autor und Zeitstempel

**Lead zuweisen (Dropdown unten im Modal):**
- Wähle einen Mitarbeiter aus dem Dropdown
- "Nicht zugewiesen" = Lead ist nur für dich und Full-Access-Mitglieder sichtbar
- Zugewiesene Leads erscheinen im Team CRM des jeweiligen Mitarbeiters

**Provision bestätigen:**
- Bei Won-Deals mit eingetragener Provision erscheint ein grüner Button: **"✓ Provision bestätigen (X €)"**
- Nach Bestätigung: Grünes Badge "✓ X € bestätigt"

---

### 1.3 Team & Provisionen (Neuer Tab im Seitenmenü)

**KPI-Karten:**
- Team Members: Anzahl Mitarbeiter
- Total Commissions: Summe aller Provisionen
- Pending: Noch nicht bestätigte Provisionen
- Confirmed: Von dir bestätigte Provisionen

**Neuen Mitarbeiter anlegen:**
- Klicke **"New Member"**
- Name, Email, Passwort eingeben
- Rolle wählen:
  - **Full Access** = Sieht alle Leads (z.B. für Senior-Mitarbeiter)
  - **Team Leader** = Sieht eigene + Team-Leads, verdient Team-Provision
  - **Restricted** = Sieht NUR die Leads die du ihm zuweist

**Mitarbeiter bearbeiten:**
- Klicke das Stift-Icon neben dem Mitarbeiter
- Ändere Name, Rolle, Commission Rate
- **Reports to**: Wähle den Teamleiter (nur sichtbar wenn Teamleiter existieren)
- **Team Leader Commission Rate**: Nur sichtbar bei Teamleiter-Rolle → Prozentsatz den der TL auf jeden Deal seiner Mitarbeiter verdient

**Mitarbeiter löschen:**
- Klicke das Mülleimer-Icon → Bestätigung → Gelöscht

**Commission Rates per Product:**
- Klicke **"Configure"** um Provisionsraten pro Immobilientyp zu setzen
- Beispiel: Apartment 3%, Villa 2%, Land 5%, Commercial 4%
- Diese Raten dienen als Vorlage wenn du im Lead-Modal den Typ auswählst

**Provisions-Tabelle:**
- Zeigt alle Deals mit Provisionen über alle Mitarbeiter
- Spalten: Member, Lead, Property, Value, Commission, Status
- **"Confirm"** Button bei Won-Deals → Provision freigeben
- **"CSV Export"** → Alle Provisionen als CSV herunterladen

---

## 2. TEAM CRM (Milena, D. Lein & weitere Mitarbeiter)

### Login
- URL: `https://www.euroadria.me/admin/team`
- Jeder Mitarbeiter hat eigene Login-Daten
- Auto-Logout nach 30 Minuten Inaktivität

---

### 2.1 Dashboard

**Statistiken oben:**
- Total Leads, New, In Pipeline, Won

**Commission Overview (erscheint wenn Deals mit Wert vorhanden):**
- Pipeline Value: Gesamtwert aller Deals
- Won Value: Wert der gewonnenen Deals
- Commission Pending: Ausstehende Provision
- Commission Confirmed: Bestätigte Provision
- **Team Leader Bonus** (nur für Teamleiter): Extra-Zeile mit dem prozentualen Bonus auf Team-Deals
- Deal-Liste mit allen Immobilien, Werten und Provisionen
- "Team Deal" Badge bei Deals die von Mitarbeitern geschlossen wurden

**Was sieht wer:**
- **Full Access**: Alle Leads
- **Team Leader**: Eigene Leads + Leads aller Mitarbeiter die "Reports to" auf ihn gesetzt haben
- **Restricted**: NUR Leads die der Admin zugewiesen hat

---

### 2.2 Lead bearbeiten

**Klicke auf einen Lead in der Tabelle:**

**Deal Details:**
- Status ändern: New → Contacted → Qualified → Offer → Negotiation → Contract → Won → Lost
- Property Value, Property Type, Location eingeben
- Lead Value eingeben

**Commission (read-only):**
- Wird vom Admin (Holger) gesetzt
- Mitarbeiter sieht: "Commission (set by Admin): 10.500 €"
- Status "Confirmed" wenn bestätigt

**Email senden:**
- **"Send Email"** Button → Composer öffnet sich
- Betreff und Nachricht schreiben
- Persönlicher Gruß wird automatisch angehängt (z.B. "Kind regards, Milena Bubanja")
- Firmensignatur mit EuroAdria Logo + alle Standorte
- Absender: Der jeweilige Mitarbeiter (z.B. "Milena Bubanja - EuroAdria <milena@euroadria.me>")
- **Signatur bearbeiten**: Klicke das ⚙️ Zahnrad-Icon → Persönlichen Gruß anpassen

**Notizen:**
- Notiz schreiben → für alle sichtbar (Admin + Team)

**Gesendete Emails:**
- Aufklappbare Liste aller gesendeten Emails
- Klick auf eine Email → voller Text wird angezeigt

---

## 3. TEAMLEITER-HIERARCHIE

### So richtest du es ein:

1. **Admin Panel** → Team & Provisionen
2. Erstelle oder bearbeite einen Mitarbeiter → Rolle: **"Team Leader"**
3. Setze die **Team Leader Commission Rate** (z.B. 2.5%)
4. Bearbeite die Verkäufer → Setze **"Reports to"** auf den Teamleiter

### Wie es funktioniert:

- Verkäufer schließt einen Deal ab (Status: Won, Property Value: 500.000 €)
- Admin setzt die Provision für den Verkäufer (z.B. 15.000 €)
- **Teamleiter bekommt automatisch** seinen Prozentsatz: 500.000 € × 2.5% = **12.500 €**
- Teamleiter sieht im Dashboard:
  - Eigene Deals (Type: "own")
  - Team-Deals mit "Team Deal" Badge
  - Separater "Team Leader Bonus" Betrag

---

## 4. SETUP NACH DEPLOYMENT

### Einmalige Schritte:

1. Code deployen (Save to Github → Render baut automatisch)
2. Im Browser aufrufen: `https://www.euroadria.me/api/team/seed`
   → Erstellt die Mitarbeiter-Accounts
3. Admin Panel → "Alle Leads anzeigen" → "Import" → CSV hochladen
   → Importiert die Facebook-Leads

### Neue Mitarbeiter hinzufügen:

- Admin Panel → Team & Provisionen → "New Member"
- Name, Email, Passwort, Rolle eingeben → "Create Member"
- Kein Seed-Endpoint mehr nötig!

---

## 5. SICHERHEIT

- **Admin Panel**: HTTP Basic Auth (Benutzername/Passwort)
- **Team CRM**: JWT Token (Login mit Email/Passwort)
- **Auto-Logout**: 30 Minuten Inaktivität → automatische Abmeldung
- **Restricted Role**: Mitarbeiter sieht NUR zugewiesene Leads
- **Provisionen nur durch Admin**: Team kann keine Provisionen setzen oder ändern
- **Email Tracking**: 1x1 Pixel trackt ob Leads die Email geöffnet haben

---

## 6. PIPELINE-STUFEN

| Stufe | Bedeutung |
|-------|-----------|
| **New** | Neuer Lead, noch nicht kontaktiert |
| **Contacted** | Erster Kontakt hergestellt |
| **Qualified** | Lead ist qualifiziert (echtes Interesse + Budget) |
| **Offer** | Angebot wurde unterbreitet |
| **Negotiation** | In Verhandlung |
| **Contract** | Vertrag in Vorbereitung |
| **Won** | Deal abgeschlossen ✓ → Provision wird berechnet |
| **Lost** | Lead verloren ✗ |
