import React from 'react';
import { Newspaper, ExternalLink } from 'lucide-react';

const MediaBadge = ({ variant = 'default' }) => {
  const mediaLinks = [
    {
      name: 'n-tv',
      url: 'https://unternehmen.n-tv.de/unternehmensgruendung-montenegro.html',
      topic: 'Unternehmensgruendung'
    },
    {
      name: 'RTL',
      url: 'https://unternehmen.rtl.de/auswandern-montenegro.html',
      topic: 'Auswandern'
    }
  ];

  if (variant === 'compact') {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-ea-gold/10 border border-ea-gold/20 rounded-full">
        <Newspaper className="w-3.5 h-3.5 text-ea-gold" />
        <span className="text-xs font-medium text-ea-dark">
          Referenziert in n-tv & RTL
        </span>
      </div>
    );
  }

  if (variant === 'hero') {
    return (
      <div className="flex flex-col sm:flex-row items-center gap-3 mt-6">
        <span className="text-sm text-white/60">Bekannt aus:</span>
        <div className="flex items-center gap-4">
          {mediaLinks.map((media) => (
            <a
              key={media.name}
              href={media.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-all group"
            >
              <span className="font-bold text-white">{media.name}</span>
              <ExternalLink className="w-3 h-3 text-white/50 group-hover:text-ea-gold" />
            </a>
          ))}
        </div>
      </div>
    );
  }

  // Default variant - full card
  return (
    <div className="bg-gradient-to-r from-ea-dark to-ea-navy rounded-2xl p-6 border border-ea-gold/20" data-testid="media-badge">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-ea-gold/20 rounded-lg">
          <Newspaper className="w-5 h-5 text-ea-gold" />
        </div>
        <div>
          <p className="text-white font-semibold">Referenzierte Experten</p>
          <p className="text-white/60 text-sm">in deutschen Wirtschaftsmedien</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {mediaLinks.map((media) => (
          <a
            key={media.name}
            href={media.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all group"
          >
            <div>
              <p className="font-bold text-white">{media.name}</p>
              <p className="text-xs text-white/50">{media.topic}</p>
            </div>
            <ExternalLink className="w-4 h-4 text-white/30 group-hover:text-ea-gold" />
          </a>
        ))}
      </div>
    </div>
  );
};

export default MediaBadge;
