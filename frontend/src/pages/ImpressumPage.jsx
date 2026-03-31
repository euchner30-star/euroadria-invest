import React, { useEffect, useState } from 'react';
import SEO from '../components/SEO';

const ImpressumPage = () => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

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
        description="Impressum der EuroAdria - Investment & Business Beratung. Angaben gemäß § 5 TMG."
        url="/impressum"
      />
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16 animate-fadeIn">
          <p className="text-ea-gold text-sm font-semibold tracking-wider uppercase mb-4">Rechtliches</p>
          <h1 className="text-4xl md:text-5xl font-semibold text-ea-dark mb-6">
            Impressum
          </h1>
          <div className="section-divider"></div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-ea-gold border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : content ? (
          <div 
            className="legal-content prose prose-lg max-w-none animate-slideUp"
            dangerouslySetInnerHTML={{ __html: content }}
          />
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
      <div className="bg-ea-light rounded-xl p-6 space-y-4">
        <p className="text-ea-dark/80 leading-relaxed">
          <strong className="text-ea-gold block mb-2">Firmensitz:</strong>
          Montaris & Co. d.o.o. Novi Sad<br />
          NOVI SAD, MARKA MILJANOVA 12<br />
          NOVI SAD, Serbien
        </p>
        <div className="flex flex-wrap gap-6 pt-6 border-t border-gray-200">
          <a href="https://wa.me/38268559776" target="_blank" rel="noopener noreferrer" className="text-ea-dark/70 hover:text-ea-gold transition-colors">
            +382 68 559 776
          </a>
          <a href="mailto:office@euroadria.me" target="_blank" rel="noopener noreferrer" className="text-ea-dark/70 hover:text-ea-gold transition-colors">
            office@euroadria.me
          </a>
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
      <p className="text-ea-dark/70 leading-relaxed">
        Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, 
        Vollständigkeit und Aktualität der Inhalte übernehmen wir jedoch keine Gewähr.
      </p>
    </section>
  </div>
);

export default ImpressumPage;
