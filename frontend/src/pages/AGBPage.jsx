import React, { useEffect, useState } from 'react';
import SEO from '../components/SEO';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const AGBPage = () => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchContent = async () => {
      try {
        const res = await fetch(`${API_URL}/api/settings/legal/agb`);
        if (res.ok) {
          const data = await res.json();
          if (data.content) {
            setContent(data.content);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error('Failed to fetch AGB:', err);
      }
      setLoading(false);
    };
    fetchContent();
  }, []);

  return (
    <div className="min-h-screen pt-28 pb-20 bg-white" data-testid="agb-page">
      <SEO 
        title="Allgemeine Geschäftsbedingungen (AGB)"
        description="Allgemeine Geschäftsbedingungen der EuroAdria Corporate Solutions. Montaris & Co. d.o.o., Novi Sad, Serbien."
        url="/agb"
      />
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16 animate-fadeIn">
          <p className="text-ea-gold text-sm font-semibold tracking-wider uppercase mb-4">Rechtliches</p>
          <h1 className="text-4xl md:text-5xl font-semibold text-ea-dark mb-6">
            Allgemeine Geschäftsbedingungen
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
          <div className="text-center py-12 text-ea-dark/50">
            <p>Die AGB werden derzeit aktualisiert. Bitte kontaktieren Sie uns bei Fragen.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AGBPage;
