import React from 'react';
import { ChevronDown, Shield, Percent, Flag, Newspaper, Building } from 'lucide-react';

const FAQSection = () => {
  const faqs = [
    {
      icon: Shield,
      question: "Wie sicher ist eine Firmengründung oder Immobilien-Investment in Montenegro?",
      answer: `Montenegro bietet ein stabiles Rechtssystem nach europäischem Vorbild. Als EU-Beitrittskandidat hat das Land bereits zahlreiche EU-Richtlinien übernommen. Bei EuroAdria, referenziert in deutschen Wirtschaftsmedien wie n-tv und RTL, führen wir für jeden Mandanten eine umfassende Due Diligence durch, um maximale Rechtssicherheit zu gewährleisten. Unser Team aus deutschen und montenegrinischen Experten begleitet Sie durch den gesamten Prozess.`
    },
    {
      icon: Percent,
      question: "Welche Steuervorteile bietet Montenegro für Unternehmer und Investoren?",
      answer: `Montenegro hat mit nur 9% eine der niedrigsten Körperschaftsteuern in Europa, verglichen mit 15-30% in Deutschland. Zusätzlich gibt es keine Erbschaftsteuer, niedrige Sozialabgaben und attraktive Abschreibungsmodelle für Immobilien. Als von n-tv und RTL referenzierte Experten beraten wir Sie individuell zu Ihrer optimalen Steuerstruktur unter Berücksichtigung von DBA-Abkommen und EU-Regularien.`
    },
    {
      icon: Flag,
      question: "Wann tritt Montenegro der EU bei und was bedeutet das für Investoren?",
      answer: `Montenegro ist seit 2012 offizieller EU-Beitrittskandidat und hat bereits 33 von 35 Verhandlungskapiteln eröffnet. Der EU-Beitritt wird bis 2028 erwartet. Für Investoren bedeutet dies: Immobilien und Unternehmen, die heute zu günstigen Preisen erworben werden, profitieren von der erwarteten Wertsteigerung durch den EU-Beitritt. EuroAdria unterstützt Sie dabei, diese einmalige Opportunität zu nutzen.`
    },
    {
      icon: Building,
      question: "Was kostet eine Immobilie in Montenegro?",
      answer: `Immobilienpreise variieren stark je nach Lage: Budva Küste ab 2.500-4.000 EUR/m², Podgorica ab 1.200-2.000 EUR/m², Žabljak/Durmitor ab 800-1.500 EUR/m², Škadarsee ab 600-1.200 EUR/m². Im Vergleich zu EU-Durchschnittspreisen sind das 60-80% günstiger, mit erheblichem Wertsteigerungspotenzial vor dem EU-Beitritt 2028.`
    },
    {
      icon: Shield,
      question: "Kann man als Deutscher in Montenegro Immobilien kaufen?",
      answer: `Ja, Deutsche können in Montenegro Immobilien erwerben. Direkt möglich sind Wohnungen und Gewerbeimmobilien. Für Grundstücke wird eine montenegrinische Firma benötigt (Gründung in 5-10 Tagen). Es gibt keine Beschränkungen für EU-Bürger beim Immobilienkauf. EuroAdria führt forensische Due Diligence durch und begleitet den gesamten Kaufprozess.`
    },
    {
      icon: Percent,
      question: "Wie hoch sind die Mietrenditen in Montenegro?",
      answer: `Mietrenditen in Montenegro liegen bei 5-12% je nach Lage und Objekt. Küstenimmobilien in Budva erzielen durch Airbnb-Vermietung 8-12% brutto. Podgorica bietet stabile Langzeit-Mietrenditen von 5-7%. Die Kombination aus niedrigen Kaufpreisen, steigender Nachfrage und EU-Beitrittsperspektive macht Montenegro besonders attraktiv.`
    },
    {
      icon: Flag,
      question: "Welche Incentives bietet Serbien für ausländische Investoren?",
      answer: `Serbien bietet umfangreiche staatliche Förderungen: Bis zu 50% Zuschuss auf Investitionskosten, Steuerbefreiungen für 10 Jahre bei Investitionen über 8,5 Mio EUR, kostenlose Grundstücke in Sonderwirtschaftszonen, und vereinfachte Genehmigungsverfahren. Das Land hat Freihandelsabkommen mit der EU, Russland und der Türkei.`
    },
    {
      icon: Shield,
      question: "Was ist forensische Due Diligence bei Balkan-Investments?",
      answer: `Forensische Due Diligence geht über Standard-Prüfungen hinaus: Lückenlose Eigentumskette bis 1945, Prüfung von Restitutionsansprüchen, Verifizierung aller Baugenehmigungen (Occupancy Permits), KYC/AML-Compliance nach FATF-Standards, und Bankability-Garantie für westliche Finanzierungen.`
    },
    {
      icon: Building,
      question: "Wie gründe ich eine Firma in Montenegro?",
      answer: `Die Firmengründung in Montenegro dauert 5-10 Werktage. Benötigt werden: Reisepass, Adressnachweis, Gesellschaftsvertrag und ein lokales Bankkonto. Die Mindesteinlage beträgt 1 EUR. Montenegro hat 9% Körperschaftssteuer, keine Kapitalertragssteuer und vereinfachte Buchhaltung für kleine Unternehmen. EuroAdria begleitet den gesamten Prozess inkl. KYC-Compliance und Bankability-Garantie.`
    },
    {
      icon: Newspaper,
      question: "Wer ist EuroAdria und warum sollte ich mit Ihnen zusammenarbeiten?",
      answer: `EuroAdria ist ein spezialisiertes Beratungsunternehmen für DACH-Investoren in Montenegro und Serbien. Gegründet von Holger Kuhlmann (Berater & Leitung DACH) und Milena Bubanja (Co-Founderin, Public Affairs und Balkan Relations). EuroAdria wurde von n-tv und RTL als Experte für Unternehmensgründung und Auswandern nach Montenegro referenziert. Wir bieten End-to-End Beratung: Von der Marktanalyse über Due Diligence bis zur Bestandsverwaltung.`
    }
  ];

  const [openIndex, setOpenIndex] = React.useState(0);

  return (
    <section className="py-20 bg-gradient-to-b from-ea-light to-white">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-ea-gold text-sm font-bold tracking-widest uppercase mb-3">
            Häufige Fragen
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-ea-dark mb-4">
            Ihre Fragen, unsere Expertise
          </h2>
          <p className="text-ea-dark/60 max-w-2xl mx-auto">
            Antworten von den Experten, die von deutschen Wirtschaftsmedien referenziert werden
          </p>
        </div>

        {/* Media Badge */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100">
            <Newspaper className="w-4 h-4 text-ea-gold" />
            <span className="text-sm text-ea-dark/70">Referenziert in:</span>
            <span className="font-semibold text-ea-dark">n-tv</span>
            <span className="text-ea-dark/30">|</span>
            <span className="font-semibold text-ea-dark">RTL</span>
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4" data-testid="faq-section">
          {faqs.map((faq, index) => {
            const Icon = faq.icon;
            const isOpen = openIndex === index;
            
            return (
              <div 
                key={index}
                className={`bg-white rounded-2xl border transition-all duration-300 ${
                  isOpen ? 'border-ea-gold shadow-lg' : 'border-gray-100 hover:border-ea-gold/30'
                }`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  className="w-full flex items-center gap-4 p-6 text-left"
                  data-testid={`faq-question-${index}`}
                >
                  <div className={`p-3 rounded-xl transition-colors ${
                    isOpen ? 'bg-ea-gold/20' : 'bg-ea-light'
                  }`}>
                    <Icon className={`w-5 h-5 ${isOpen ? 'text-ea-gold' : 'text-ea-dark/50'}`} />
                  </div>
                  <span className={`flex-1 font-semibold ${
                    isOpen ? 'text-ea-dark' : 'text-ea-dark/80'
                  }`}>
                    {faq.question}
                  </span>
                  <ChevronDown className={`w-5 h-5 text-ea-dark/40 transition-transform duration-300 ${
                    isOpen ? 'rotate-180' : ''
                  }`} />
                </button>
                
                {isOpen && (
                  <div className="px-6 pb-6">
                    <div className="pl-16 border-l-2 border-ea-gold/20">
                      <p className="text-ea-dark/70 leading-relaxed" data-testid={`faq-answer-${index}`}>
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="text-ea-dark/60 mb-4">Weitere Fragen? Unsere Experten beraten Sie gerne.</p>
          <a 
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-ea-dark text-white font-semibold rounded-xl hover:bg-ea-navy transition-all"
          >
            Kostenlose Erstberatung anfragen
          </a>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
