import React from 'react';
import { ChevronDown, Shield, Percent, Flag, Newspaper } from 'lucide-react';

const FAQSection = () => {
  const faqs = [
    {
      icon: Shield,
      question: "Wie sicher ist eine Firmengründung oder Immobilien-Investment in Montenegro?",
      answer: `Montenegro bietet ein stabiles Rechtssystem nach europäischem Vorbild. Als EU-Beitrittskandidat hat das Land bereits zahlreiche EU-Richtlinien übernommen. Bei EuroAdria – referenziert in deutschen Wirtschaftsmedien wie n-tv und RTL – führen wir für jeden Mandanten eine umfassende Due Diligence durch, um maximale Rechtssicherheit zu gewährleisten. Unser Team aus deutschen und montenegrinischen Experten begleitet Sie durch den gesamten Prozess.`
    },
    {
      icon: Percent,
      question: "Welche Steuervorteile bietet Montenegro für Unternehmer und Investoren?",
      answer: `Montenegro hat mit nur 9% eine der niedrigsten Körperschaftsteuern in Europa – verglichen mit 15-30% in Deutschland. Zusätzlich gibt es keine Erbschaftsteuer, niedrige Sozialabgaben und attraktive Abschreibungsmodelle für Immobilien. Als von n-tv und RTL referenzierte Experten beraten wir Sie individuell zu Ihrer optimalen Steuerstruktur unter Berücksichtigung von DBA-Abkommen und EU-Regularien.`
    },
    {
      icon: Flag,
      question: "Wann tritt Montenegro der EU bei und was bedeutet das für Investoren?",
      answer: `Montenegro ist seit 2012 offizieller EU-Beitrittskandidat und hat bereits 33 von 35 Verhandlungskapiteln eröffnet. Der EU-Beitritt wird bis 2028 erwartet. Für Investoren bedeutet dies: Immobilien und Unternehmen, die heute zu günstigen Preisen erworben werden, profitieren von der erwarteten Wertsteigerung durch den EU-Beitritt. EuroAdria – als Experten-Quelle in führenden deutschen Medien wie n-tv und RTL – unterstützt Sie dabei, diese einmalige Opportunität zu nutzen.`
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
            Ihre Fragen – Unsere Expertise
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

      {/* FAQ Schema for SEO */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map(faq => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.answer
          }
        }))
      })}} />
    </section>
  );
};

export default FAQSection;
