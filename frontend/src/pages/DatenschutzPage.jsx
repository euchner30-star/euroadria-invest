import React, { useEffect, useState } from 'react';
import SEO from '../components/SEO';

const DatenschutzPage = () => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchContent = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/settings/legal/datenschutz`);
        if (res.ok) {
          const data = await res.json();
          if (data.content) {
            setContent(data.content);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error('Failed to fetch datenschutz:', err);
      }
      setLoading(false);
    };
    fetchContent();
  }, []);

  return (
    <div className="min-h-screen pt-28 pb-20 bg-white" data-testid="datenschutz-page">
      <SEO 
        title="Datenschutzerklärung"
        description="Datenschutzerklärung der EuroAdria. Informationen zum Umgang mit Ihren personenbezogenen Daten gemäß DSGVO."
        url="/datenschutz"
      />
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16 animate-fadeIn">
          <p className="text-ea-gold text-sm font-semibold tracking-wider uppercase mb-4">Rechtliches</p>
          <h1 className="font-semibold text-4xl md:text-5xl lg:text-6xl text-ea-dark mb-6">
            Datenschutzerklärung
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
          <FallbackDatenschutz />
        )}
      </div>
    </div>
  );
};

const FallbackDatenschutz = () => (
  <div className="space-y-6 animate-slideUp">
    <section className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
      <h2 className="text-2xl font-semibold text-ea-dark mb-4">1. Verantwortliche Stelle</h2>
      <div className="bg-ea-light rounded-xl p-6">
        <p className="text-ea-dark/80 leading-relaxed">
          Verantwortlich für die Verarbeitung personenbezogener Daten auf dieser Website ist:
        </p>
        <div className="border-l-4 border-ea-gold pl-4 mt-4">
          <p className="text-ea-dark font-semibold mb-1">EuroAdria</p>
          <p className="text-ea-dark/70 leading-relaxed">
            Montaris & Co. d.o.o. Novi Sad<br />
            NOVI SAD, MARKA MILJANOVA 12<br />
            NOVI SAD, Serbien
          </p>
        </div>
      </div>
    </section>
    <section className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
      <h2 className="text-2xl font-semibold text-ea-dark mb-4">2. Erhebung und Speicherung personenbezogener Daten</h2>
      <p className="text-ea-dark/70 leading-relaxed">
        Beim Aufrufen unserer Website werden durch den auf Ihrem Endgerät zum Einsatz 
        kommenden Browser automatisch Informationen an den Server unserer Website gesendet.
      </p>
    </section>
    <section className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
      <h2 className="text-2xl font-semibold text-ea-dark mb-4">5. Ihre Rechte</h2>
      <p className="text-ea-dark/70 leading-relaxed">
        Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung,
        Datenübertragbarkeit und Widerspruch gemäß DSGVO.
      </p>
    </section>
  </div>
);

export default DatenschutzPage;
