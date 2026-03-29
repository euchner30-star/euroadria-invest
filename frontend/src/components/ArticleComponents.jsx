// DueDiligenceBox Component
import React, { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';

export const DueDiligenceBox = ({ title, content }) => {
  return (
    <div className="my-8 bg-ea-light border border-ea-gold/20 rounded-xl p-6">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-ea-gold/20 flex items-center justify-center">
            <Shield className="w-6 h-6 text-ea-gold" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-ea-gold mb-3">{title}</h3>
          <p className="text-ea-dark/80 leading-relaxed">{content}</p>
        </div>
      </div>
    </div>
  );
};

// ExpertTipBox Component with Photo Icons
export const ExpertTipBox = ({ author, title, content }) => {
  // Use individual photos based on author name
  const getAuthorPhoto = (authorName) => {
    if (authorName.includes('Holger')) {
      return '/holger-kuhlmann.jpg';
    } else if (authorName.includes('Milena')) {
      return '/milena-bubanja.jpg';
    }
    return '/team-photo.jpg';
  };

  const photoSrc = getAuthorPhoto(author);

  return (
    <div className="my-6 md:my-8 bg-ea-navy rounded-xl p-4 md:p-6">
      <div className="flex items-start space-x-3 mb-3">
        <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-ea-gold shadow-lg">
          <img 
            src={photoSrc}
            alt={author}
            className="w-full h-full object-cover object-top"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-ea-gold/80 uppercase tracking-wide font-semibold mb-1">
            Expert-Tipp von {author}
          </div>
          <h4 className="text-base md:text-lg font-semibold text-white">{title}</h4>
        </div>
      </div>
      <p className="text-ea-light/80 leading-relaxed text-sm md:text-base">{content}</p>
    </div>
  );
};

// LeadMagnetBox Component  
export const LeadMagnetBox = () => {
  const [downloadUrl, setDownloadUrl] = useState('');

  useEffect(() => {
    fetch(`${process.env.REACT_APP_BACKEND_URL || ''}/api/settings/downloads`)
      .then(res => res.json())
      .then(data => setDownloadUrl(data.praxisleitfaden_url || ''))
      .catch(() => {});
  }, []);

  const buttonContent = (
    <>Jetzt kostenlos herunterladen</>
  );

  return (
    <div className="my-8 md:my-12 bg-ea-dark rounded-xl p-6 md:p-8 text-center">
      <h3 className="text-xl md:text-2xl lg:text-3xl font-semibold text-white mb-3 md:mb-4">
        Kostenloser <span className="text-ea-gold">Praxisleitfaden</span>
      </h3>
      <p className="text-ea-light/80 text-sm md:text-lg mb-4 md:mb-6 max-w-2xl mx-auto">
        Laden Sie unseren umfassenden „Praxisleitfaden für DACH-Investoren" herunter. 
        80+ Seiten geballtes Wissen zu Due Diligence, Bankability und rechtlichen Strukturen.
      </p>
      {downloadUrl ? (
        <a
          href={downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-6 py-3 md:px-8 md:py-4 bg-ea-gold text-ea-dark font-semibold rounded-lg hover:bg-ea-gold/80 transition-all text-sm md:text-lg"
          data-testid="praxisleitfaden-download-btn"
        >
          {buttonContent}
        </a>
      ) : (
        <button 
          className="px-6 py-3 md:px-8 md:py-4 bg-ea-gold text-ea-dark font-semibold rounded-lg hover:bg-ea-gold/80 transition-all text-sm md:text-lg"
          data-testid="praxisleitfaden-download-btn"
        >
          {buttonContent}
        </button>
      )}
      <p className="text-ea-light/50 text-xs md:text-sm mt-3 md:mt-4">
        Keine Anmeldung erforderlich • PDF • 8.5 MB
      </p>
    </div>
  );
};
