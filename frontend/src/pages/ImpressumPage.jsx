import React, { useEffect, useState } from 'react';
import SEO from '../components/SEO';
import { useLanguage } from '../context/LanguageContext';

const ImpressumPage = () => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const { lang } = useLanguage();

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchContent = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/settings/legal/impressum`);
        if (res.ok) {
          const data = await res.json();
          if (data.content) {
            setContent(data.content);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error('Failed to fetch impressum:', err);
      }
      setLoading(false);
    };
    fetchContent();
  }, []);

  return (
    <div className="min-h-screen pt-28 pb-20 bg-white" data-testid="impressum-page">
      <SEO 
        title="Impressum"
        description="Legal Notice - EuroAdria Corporate Solutions. Information pursuant to § 5 TMG."
        url="/impressum"
      />
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16 animate-fadeIn">
          <p className="text-ea-gold text-sm font-semibold tracking-wider uppercase mb-4">{lang === 'en' ? 'Legal' : 'Rechtliches'}</p>
          <h1 className="text-4xl md:text-5xl font-semibold text-ea-dark mb-6">
            {lang === 'en' ? 'Imprint' : 'Impressum'}
          </h1>
          <div className="section-divider"></div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-ea-gold border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : content ? (
          <>
            <div 
              className="legal-content animate-slideUp"
              dangerouslySetInnerHTML={{ __html: content }}
            />
            <style>{`
              .legal-content h2 {
                font-size: 1.5rem;
                font-weight: 600;
                color: #04151F;
                margin-top: 2.5rem;
                margin-bottom: 1rem;
                padding-bottom: 0.75rem;
                border-bottom: 2px solid #C8A96A;
              }
              .legal-content h2:first-child { margin-top: 0; }
              .legal-content h3 {
                font-size: 1.125rem;
                font-weight: 600;
                color: #04151F;
                margin-top: 1.5rem;
                margin-bottom: 0.5rem;
              }
              .legal-content p {
                color: rgba(4, 21, 31, 0.7);
                line-height: 1.8;
                margin-bottom: 1rem;
              }
              .legal-content ul, .legal-content ol {
                color: rgba(4, 21, 31, 0.7);
                line-height: 1.8;
                margin-bottom: 1rem;
                padding-left: 1.5rem;
              }
              .legal-content li { margin-bottom: 0.25rem; }
              .legal-content a {
                color: #C8A96A;
                text-decoration: underline;
              }
              .legal-content a:hover { opacity: 0.8; }
              .legal-content strong { color: #04151F; }
            `}</style>
          </>
        ) : (
          <FallbackImpressum />
        )}
      </div>
    </div>
  );
};

const FallbackImpressum = () => (
  <div className="space-y-6 animate-slideUp">
    <section className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
      <h2 className="text-2xl font-semibold text-ea-dark mb-4">EuroAdria Corporate Solutions</h2>
      <p className="text-ea-dark/60 text-sm mb-4">a brand of Montaris & Co. d.o.o.</p>
      <div className="bg-ea-light rounded-xl p-6 space-y-4">
        <p className="text-ea-dark/80 leading-relaxed">
          <strong className="text-ea-gold block mb-2">Firmensitz:</strong>
          Montaris & Co. d.o.o.<br />
          Marka Miljanova 12<br />
          21000 Novi Sad, Serbien
        </p>
        <div className="pt-4 border-t border-gray-200 space-y-2">
          <p className="text-ea-dark/70">
            <strong>Telefon:</strong>{' '}
            <a href="tel:+38268559776" className="text-ea-gold hover:underline">+382 68 559 776</a>
          </p>
          <p className="text-ea-dark/70">
            <strong>E-Mail:</strong>{' '}
            <a href="mailto:office@euroadria.me" className="text-ea-gold hover:underline">office@euroadria.me</a>
          </p>
          <p className="text-ea-dark/70">
            <strong>Web:</strong>{' '}
            <a href="https://www.euroadria.me" className="text-ea-gold hover:underline">www.euroadria.me</a>
          </p>
          <p className="text-ea-dark/70">
            <strong>Angebotsplattform:</strong>{' '}
            <a href="https://euroadria.me" className="text-ea-gold hover:underline">euroadria.me</a>
          </p>
        </div>
        <div className="pt-4 border-t border-gray-200 space-y-1">
          <p className="text-ea-dark/70"><strong>Registrierungsnummer:</strong> 22147382</p>
          <p className="text-ea-dark/70"><strong>Steuer-ID (PIB):</strong> 115356237</p>
          <p className="text-ea-dark/70"><strong>Geschäftsführerin:</strong> Milena Bubanja</p>
        </div>
      </div>
    </section>
    <section className="bg-ea-gold/5 border border-ea-gold/20 rounded-2xl p-8">
      <h2 className="text-2xl font-semibold text-ea-dark mb-4">Niederlassung Deutschland</h2>
      <p className="text-ea-dark/80 leading-relaxed">
        Speditionsstraße 15a<br />40221 Düsseldorf<br />Deutschland
      </p>
      <p className="text-ea-dark/80 mt-2"><strong className="text-ea-gold">Verantwortlich:</strong> Holger Kuhlmann</p>
    </section>
    <section className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
      <h2 className="text-2xl font-semibold text-ea-dark mb-4">Haftungsausschluss</h2>
      <h3 className="text-lg font-semibold text-ea-dark mb-2">Haftung für Inhalte</h3>
      <p className="text-ea-dark/70 leading-relaxed mb-4">
        Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, 
        Vollständigkeit und Aktualität der Inhalte übernehmen wir jedoch keine Gewähr.
        Als Diensteanbieter sind wir für eigene Inhalte auf diesen Seiten nach den allgemeinen 
        Gesetzen verantwortlich.
      </p>
      <h3 className="text-lg font-semibold text-ea-dark mb-2">Haftung für Links</h3>
      <p className="text-ea-dark/70 leading-relaxed mb-4">
        Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen 
        Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen.
        Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber 
        der Seiten verantwortlich.
      </p>
      <h3 className="text-lg font-semibold text-ea-dark mb-2">Urheberrecht</h3>
      <p className="text-ea-dark/70 leading-relaxed">
        Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen 
        dem Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung 
        außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen 
        Autors bzw. Erstellers.
      </p>
    </section>
  </div>
);

export default ImpressumPage;
