// DueDiligenceBox Component
import React from 'react';
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
    <div className="my-8 bg-ea-navy rounded-xl p-6">
      <div className="flex items-start space-x-3 mb-3">
        <div className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden border-2 border-ea-gold shadow-lg">
          <img 
            src={photoSrc}
            alt={author}
            className="w-full h-full object-cover object-top"
          />
        </div>
        <div className="flex-1">
          <div className="text-xs text-ea-gold/80 uppercase tracking-wide font-semibold mb-1">
            Expert-Tipp von {author}
          </div>
          <h4 className="text-lg font-semibold text-white">{title}</h4>
        </div>
      </div>
      <p className="text-ea-light/80 leading-relaxed pl-15">{content}</p>
    </div>
  );
};

// LeadMagnetBox Component  
export const LeadMagnetBox = () => {
  return (
    <div className="my-12 bg-ea-dark rounded-xl p-8 text-center">
      <h3 className="text-2xl md:text-3xl font-semibold text-white mb-4">
        Kostenloser <span className="text-ea-gold">Praxisleitfaden</span>
      </h3>
      <p className="text-ea-light/80 text-lg mb-6 max-w-2xl mx-auto">
        Laden Sie unseren umfassenden „Praxisleitfaden für DACH-Investoren" herunter. 
        80+ Seiten geballtes Wissen zu Due Diligence, Bankability und rechtlichen Strukturen.
      </p>
      <button className="px-8 py-4 bg-ea-gold text-ea-dark font-semibold rounded-lg hover:bg-ea-gold/80 transition-all text-lg">
        Jetzt kostenlos herunterladen
      </button>
      <p className="text-ea-light/50 text-sm mt-4">
        Keine Anmeldung erforderlich • PDF • 8.5 MB
      </p>
    </div>
  );
};
