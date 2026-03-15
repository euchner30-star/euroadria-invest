// DueDiligenceBox Component
import React from 'react';
import { Shield } from 'lucide-react';

export const DueDiligenceBox = ({ title, content }) => {
  return (
    <div className="due-diligence-box my-8">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center">
            <Shield className="w-6 h-6 text-gold" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gold mb-3">{title}</h3>
          <p className="text-white/80 leading-relaxed">{content}</p>
        </div>
      </div>
    </div>
  );
};

// ExpertTipBox Component with Photo Icons
export const ExpertTipBox = ({ author, title, content }) => {
  // Determine photo crop based on author
  const getAuthorPhoto = (authorName) => {
    if (authorName.includes('Holger')) {
      return { 
        src: '/team-photo.jpg',
        position: '30% center', // Left side (Holger)
        initials: 'HK'
      };
    } else if (authorName.includes('Milena')) {
      return {
        src: '/team-photo.jpg',
        position: '70% center', // Right side (Milena)
        initials: 'MB'
      };
    }
    return {
      src: '/team-photo.jpg',
      position: 'center',
      initials: author.split(' ').map(n => n[0]).join('')
    };
  };

  const photoData = getAuthorPhoto(author);

  return (
    <div className="expert-tip-box my-8">
      <div className="flex items-start space-x-3 mb-3">
        <div className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden border-2 border-gold shadow-lg">
          <img 
            src={photoData.src}
            alt={author}
            className="w-full h-full object-cover"
            style={{ objectPosition: photoData.position }}
          />
        </div>
        <div className="flex-1">
          <div className="text-xs text-gold/80 uppercase tracking-wide font-semibold mb-1">
            Expert-Tipp von {author}
          </div>
          <h4 className="text-lg font-bold text-white">{title}</h4>
        </div>
      </div>
      <p className="text-white/80 leading-relaxed pl-15">{content}</p>
    </div>
  );
};

// LeadMagnetBox Component  
export const LeadMagnetBox = () => {
  return (
    <div className="lead-magnet-box my-12">
      <div className="text-center">
        <h3 className="text-3xl font-display font-bold text-white mb-4">
          Kostenloser <span className="text-gold">Praxisleitfaden</span>
        </h3>
        <p className="text-white/80 text-lg mb-6 max-w-2xl mx-auto">
          Laden Sie unseren umfassenden „Praxisleitfaden für DACH-Investoren" herunter. 
          80+ Seiten geballtes Wissen zu Due Diligence, Bankability und rechtlichen Strukturen.
        </p>
        <button className="btn-gold text-lg px-8 py-4">
          Jetzt kostenlos herunterladen
        </button>
        <p className="text-white/50 text-sm mt-4">
          Keine Anmeldung erforderlich • PDF • 8.5 MB
        </p>
      </div>
    </div>
  );
};