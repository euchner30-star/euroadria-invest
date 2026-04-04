import React from 'react';
import { ChevronDown, Shield, Percent, Flag, Newspaper, Building } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const faqsDe = [
  {
    icon: Shield,
    question: "Wie sicher ist eine Firmengründung oder Immobilien-Investment in Montenegro?",
    answer: "Montenegro bietet ein stabiles Rechtssystem nach europäischem Vorbild. Als EU-Beitrittskandidat hat das Land bereits zahlreiche EU-Richtlinien übernommen. Bei EuroAdria Corporate Solutions, referenziert in internationalen Wirtschaftsmedien wie n-tv, RTL und Focus, führen wir für jeden Mandanten eine umfassende Due Diligence durch, um maximale Rechtssicherheit zu gewährleisten. Unser Team aus deutschen und montenegrinischen Experten begleitet Sie durch den gesamten Prozess."
  },
  {
    icon: Percent,
    question: "Welche Steuervorteile bietet Montenegro für Unternehmer und Investoren?",
    answer: "Montenegro hat mit nur 9% eine der niedrigsten Körperschaftsteuern in Europa, verglichen mit 15-30% in Deutschland. Zusätzlich gibt es keine Erbschaftsteuer, niedrige Sozialabgaben und attraktive Abschreibungsmodelle für Immobilien. Als von n-tv, RTL und Focus referenzierte Experten beraten wir Sie individuell zu Ihrer optimalen Steuerstruktur unter Berücksichtigung von DBA-Abkommen und EU-Regularien."
  },
  {
    icon: Flag,
    question: "Wann tritt Montenegro der EU bei und was bedeutet das für Investoren?",
    answer: "Montenegro ist seit 2012 offizieller EU-Beitrittskandidat und hat bereits 33 von 35 Verhandlungskapiteln eröffnet. Der EU-Beitritt wird bis 2028 erwartet. Für Investoren bedeutet dies: Immobilien und Unternehmen, die heute zu günstigen Preisen erworben werden, profitieren von der erwarteten Wertsteigerung durch den EU-Beitritt. EuroAdria Corporate Solutions unterstützt Sie dabei, diese einmalige Opportunität zu nutzen."
  },
  {
    icon: Building,
    question: "Was kostet eine Immobilie in Montenegro?",
    answer: "Immobilienpreise variieren stark je nach Lage: Budva Küste ab 2.500-4.000 EUR/m², Podgorica ab 1.200-2.000 EUR/m², Žabljak/Durmitor ab 800-1.500 EUR/m², Škadarsee ab 600-1.200 EUR/m². Im Vergleich zu EU-Durchschnittspreisen sind das 60-80% günstiger, mit erheblichem Wertsteigerungspotenzial vor dem EU-Beitritt 2028."
  },
  {
    icon: Shield,
    question: "Kann man als Deutscher in Montenegro Immobilien kaufen?",
    answer: "Ja, Deutsche können in Montenegro Immobilien erwerben. Direkt möglich sind Wohnungen und Gewerbeimmobilien. Für Grundstücke wird eine montenegrinische Firma benötigt (Gründung in 5-10 Tagen). Es gibt keine Beschränkungen für EU-Bürger beim Immobilienkauf. EuroAdria Corporate Solutions führt forensische Due Diligence durch und begleitet den gesamten Kaufprozess."
  },
  {
    icon: Percent,
    question: "Wie hoch sind die Mietrenditen in Montenegro?",
    answer: "Mietrenditen in Montenegro liegen bei 5-12% je nach Lage und Objekt. Küstenimmobilien in Budva erzielen durch Airbnb-Vermietung 8-12% brutto. Podgorica bietet stabile Langzeit-Mietrenditen von 5-7%. Die Kombination aus niedrigen Kaufpreisen, steigender Nachfrage und EU-Beitrittsperspektive macht Montenegro besonders attraktiv."
  },
  {
    icon: Flag,
    question: "Welche Incentives bietet Serbien für ausländische Investoren?",
    answer: "Serbien bietet umfangreiche staatliche Förderungen: Bis zu 50% Zuschuss auf Investitionskosten, Steuerbefreiungen für 10 Jahre bei Investitionen über 8,5 Mio EUR, kostenlose Grundstücke in Sonderwirtschaftszonen, und vereinfachte Genehmigungsverfahren. Das Land hat Freihandelsabkommen mit der EU, Russland und der Türkei."
  },
  {
    icon: Shield,
    question: "Was ist forensische Due Diligence bei Balkan-Investments?",
    answer: "Forensische Due Diligence geht über Standard-Prüfungen hinaus: Lückenlose Eigentumskette bis 1945, Prüfung von Restitutionsansprüchen, Verifizierung aller Baugenehmigungen (Occupancy Permits), KYC/AML-Compliance nach FATF-Standards, und Bankability-Garantie für westliche Finanzierungen."
  },
  {
    icon: Building,
    question: "Wie gründe ich eine Firma in Montenegro?",
    answer: "Die Firmengründung in Montenegro dauert 5-10 Werktage. Benötigt werden: Reisepass, Adressnachweis, Gesellschaftsvertrag und ein lokales Bankkonto. Die Mindesteinlage beträgt 1 EUR. Montenegro hat 9% Körperschaftssteuer, keine Kapitalertragssteuer und vereinfachte Buchhaltung für kleine Unternehmen. EuroAdria Corporate Solutions begleitet den gesamten Prozess inkl. KYC-Compliance und Bankability-Garantie."
  },
  {
    icon: Newspaper,
    question: "Wer ist EuroAdria Corporate Solutions und warum sollte ich mit Ihnen zusammenarbeiten?",
    answer: "EuroAdria Corporate Solutions ist ein spezialisiertes Beratungsunternehmen für DACH-Investoren in Montenegro und Serbien. Gegründet von Holger Kuhlmann (Berater & Leitung DACH) und Milena Bubanja (Co-Founderin, Public Affairs und Balkan Relations). EuroAdria Corporate Solutions wurde von n-tv, RTL, Focus, VC Magazin und Kosmo als Experte für Unternehmensgründung und Investment in Montenegro referenziert. Wir bieten End-to-End Beratung: Von der Marktanalyse über Due Diligence bis zur Bestandsverwaltung."
  }
];

const faqsEn = [
  {
    icon: Shield,
    question: "How safe is company formation or real estate investment in Montenegro?",
    answer: "Montenegro offers a stable legal system based on European standards. As an EU accession candidate, the country has already adopted numerous EU directives. At EuroAdria Corporate Solutions, referenced in international business media such as n-tv, RTL, and Focus, we conduct comprehensive due diligence for every client to ensure maximum legal certainty. Our team of German and Montenegrin experts guides you through the entire process."
  },
  {
    icon: Percent,
    question: "What tax advantages does Montenegro offer for entrepreneurs and investors?",
    answer: "Montenegro has one of the lowest corporate tax rates in Europe at just 9%, compared to 15-30% in Germany. Additionally, there is no inheritance tax, low social contributions, and attractive depreciation models for real estate. As experts referenced by n-tv, RTL, and Focus, we advise you individually on your optimal tax structure, considering double taxation agreements and EU regulations."
  },
  {
    icon: Flag,
    question: "When will Montenegro join the EU and what does it mean for investors?",
    answer: "Montenegro has been an official EU accession candidate since 2012 and has already opened 33 of 35 negotiation chapters. EU accession is expected by 2028. For investors, this means: real estate and businesses acquired at favorable prices today will benefit from the expected appreciation through EU accession. EuroAdria Corporate Solutions supports you in seizing this unique opportunity."
  },
  {
    icon: Building,
    question: "How much does real estate cost in Montenegro?",
    answer: "Real estate prices vary significantly by location: Budva coast from 2,500-4,000 EUR/m², Podgorica from 1,200-2,000 EUR/m², Žabljak/Durmitor from 800-1,500 EUR/m², Skadar Lake from 600-1,200 EUR/m². Compared to EU average prices, these are 60-80% cheaper, with significant appreciation potential before EU accession in 2028."
  },
  {
    icon: Shield,
    question: "Can Germans buy real estate in Montenegro?",
    answer: "Yes, Germans can purchase real estate in Montenegro. Apartments and commercial properties can be acquired directly. For land, a Montenegrin company is required (formation in 5-10 days). There are no restrictions for EU citizens when purchasing real estate. EuroAdria Corporate Solutions conducts forensic due diligence and accompanies the entire purchase process."
  },
  {
    icon: Percent,
    question: "How high are rental yields in Montenegro?",
    answer: "Rental yields in Montenegro range from 5-12% depending on location and property. Coastal properties in Budva achieve 8-12% gross through Airbnb rentals. Podgorica offers stable long-term rental yields of 5-7%. The combination of low purchase prices, increasing demand, and EU accession perspective makes Montenegro particularly attractive."
  },
  {
    icon: Flag,
    question: "What incentives does Serbia offer for foreign investors?",
    answer: "Serbia offers extensive government subsidies: Up to 50% grants on investment costs, tax exemptions for 10 years for investments over 8.5 million EUR, free land in special economic zones, and simplified approval procedures. The country has free trade agreements with the EU, Russia, and Turkey."
  },
  {
    icon: Shield,
    question: "What is forensic due diligence for Balkan investments?",
    answer: "Forensic due diligence goes beyond standard checks: complete chain of ownership back to 1945, review of restitution claims, verification of all building permits (Occupancy Permits), KYC/AML compliance according to FATF standards, and bankability guarantee for Western financing."
  },
  {
    icon: Building,
    question: "How do I start a company in Montenegro?",
    answer: "Company formation in Montenegro takes 5-10 business days. Requirements include: passport, proof of address, articles of association, and a local bank account. The minimum deposit is 1 EUR. Montenegro has 9% corporate tax, no capital gains tax, and simplified accounting for small businesses. EuroAdria Corporate Solutions accompanies the entire process including KYC compliance and bankability guarantee."
  },
  {
    icon: Newspaper,
    question: "Who is EuroAdria Corporate Solutions and why should I work with you?",
    answer: "EuroAdria Corporate Solutions is a specialized consulting firm for DACH investors in Montenegro and Serbia. Founded by Holger Kuhlmann (Advisor & DACH Lead) and Milena Bubanja (Co-Founder, Public Affairs and Balkan Relations). EuroAdria Corporate Solutions has been referenced by n-tv, RTL, Focus, VC Magazin, and Kosmo as experts in company formation and investment in Montenegro. We offer end-to-end consulting: from market analysis through due diligence to portfolio management."
  }
];

const FAQSection = () => {
  const { lang } = useLanguage();
  const faqs = lang === 'en' ? faqsEn : faqsDe;
  const [openIndex, setOpenIndex] = React.useState(0);

  return (
    <section className="py-20 bg-gradient-to-b from-ea-light to-white">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-ea-gold text-sm font-bold tracking-widest uppercase mb-3">
            {lang === 'en' ? 'Frequently Asked Questions' : 'Häufige Fragen'}
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-ea-dark mb-4">
            {lang === 'en' ? 'Your Questions, Our Expertise' : 'Ihre Fragen, unsere Expertise'}
          </h2>
          <p className="text-ea-dark/60 max-w-2xl mx-auto">
            {lang === 'en' ? 'Answers from experts referenced by German business media' : 'Antworten von den Experten, die von deutschen Wirtschaftsmedien referenziert werden'}
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100">
            <Newspaper className="w-4 h-4 text-ea-gold" />
            <span className="text-sm text-ea-dark/70">{lang === 'en' ? 'Referenced in:' : 'Referenziert in:'}</span>
            <span className="font-semibold text-ea-dark">n-tv</span>
            <span className="text-ea-dark/30">|</span>
            <span className="font-semibold text-ea-dark">RTL</span>
          </div>
        </div>

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

        <div className="mt-12 text-center">
          <p className="text-ea-dark/60 mb-4">
            {lang === 'en' ? 'More questions? Our experts will be happy to advise you.' : 'Weitere Fragen? Unsere Experten beraten Sie gerne.'}
          </p>
          <a 
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-ea-dark text-white font-semibold rounded-xl hover:bg-ea-navy transition-all"
          >
            {lang === 'en' ? 'Request Free Consultation' : 'Kostenlose Erstberatung anfragen'}
          </a>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
