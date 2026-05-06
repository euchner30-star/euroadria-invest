import React from 'react';
import { useLanguage } from '../context/LanguageContext';

// Static German -> English translation dictionary for all <T> usage
const translations = {
  // ROI Calculator
  'ROI-Rechner für Immobilien': 'Real Estate ROI Calculator',
  'Berechnen Sie jährlichen Cashflow, ROI und Break-Even-Zeitpunkt für Ihre Immobilieninvestition': 'Calculate annual cash flow, ROI and break-even point for your real estate investment',
  'Eingaben': 'Inputs',
  'Kaufpreis': 'Purchase Price',
  'Renovierungskosten': 'Renovation Costs',
  'Nebenkosten (Notar, Makler, etc.)': 'Additional Costs (Notary, Broker, etc.)',
  'Monatliche Miete': 'Monthly Rent',
  'Leerstandsrate (%)': 'Vacancy Rate (%)',
  'Monatliche Kosten (Verwaltung, Instandhaltung)': 'Monthly Costs (Management, Maintenance)',
  'ROI Berechnen': 'Calculate ROI',
  'Berechne...': 'Calculating...',
  'Ergebnis': 'Result',
  'Geben Sie Ihre Investitionsdaten ein und klicken Sie auf "ROI Berechnen"': 'Enter your investment data and click "Calculate ROI"',
  'Jährlicher Cashflow': 'Annual Cash Flow',
  'Netto-Rendite': 'Net Yield',
  'Break-Even-Zeitpunkt': 'Break-Even Point',
  'Gesamtinvestition': 'Total Investment',
  'Einnahmen-Aufschlüsselung': 'Revenue Breakdown',
  'Brutto-Mieteinnahmen': 'Gross Rental Income',
  'Nach Leerstand': 'After Vacancy',
  'Laufende Kosten': 'Running Costs',
  'Netto-Mieteinnahmen': 'Net Rental Income',
  'Hinweise zur Berechnung': 'Calculation Notes',
  'Die Berechnung berücksichtigt keine Steuern, Finanzierungskosten oder Wertsteigerung': 'The calculation does not account for taxes, financing costs, or appreciation',
  'Jährlicher Cashflow / Gesamtinvestition × 100': 'Annual Cash Flow / Total Investment × 100',
  'Gesamtinvestition / Jährlicher Cashflow': 'Total Investment / Annual Cash Flow',
  'Netto-Mieteinnahmen / Kaufpreis × 100': 'Net Rental Income / Purchase Price × 100',

  // Comments
  'Kommentar hinterlassen': 'Leave a Comment',
  'Kommentar absenden': 'Submit Comment',
  'Wird gesendet...': 'Sending...',
  'Kommentar': 'Comment',
  'Kommentare': 'Comments',

  // Generic
  'German text': 'German text',
  'Mehr erfahren': 'Learn more',
  'Jetzt Beratung anfragen': 'Request Consultation Now',
  'Kostenlose Erstberatung anfragen': 'Request Free Consultation',
  'Zurück': 'Back',
  'Lesen': 'Read',
  'Laden...': 'Loading...',
  'Alle': 'All',
  'Jahre': 'Years',
  'Monate': 'Months',
  'Ja': 'Yes',
  'Nein': 'No',
  'Weitere Artikel laden': 'Load More Articles',
  'Artikel': 'Articles',
  'Kontakt': 'Contact',
  'Impressum': 'Imprint',
  'Datenschutz': 'Privacy Policy',
  'Blog': 'Blog',
  'Standorte': 'Locations',

  // Trust/Media
  'Referenziert in n-tv, RTL, Focus, VC Magazin & Kosmo': 'Featured on n-tv, RTL, Focus, VC Magazin & Kosmo (Advertorial)',
  'Ihr direkter Draht ins Office': 'Your direct line to the office',
  'Referenziert in:': 'Referenced in:',

  // FAQ
  'Häufige Fragen': 'Frequently Asked Questions',
  'Ihre Fragen, unsere Expertise': 'Your Questions, Our Expertise',
  'Antworten von den Experten, die von deutschen Wirtschaftsmedien referenziert werden': 'Answers from investment experts',
  'Weitere Fragen? Unsere Experten beraten Sie gerne.': 'More questions? Our experts will be happy to advise you.',
  'Kostenlose Erstberatung anfragen': 'Request Free Consultation',
};

/**
 * T Component - Synchronous Translation
 * Replaces German text with English translations when language is set to 'en'.
 * No API calls, no delays - instant translation using a static dictionary.
 */
const T = ({ children }) => {
  const { lang } = useLanguage();
  
  // If German or no children, render as-is
  if (lang === 'de' || !children) {
    return <>{children}</>;
  }
  
  // If English, look up translation
  const text = typeof children === 'string' ? children.trim() : '';
  if (text && translations[text]) {
    return <>{translations[text]}</>;
  }
  
  // Fallback: render original text
  return <>{children}</>;
};

export default T;
