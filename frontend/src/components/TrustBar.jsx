import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const TrustBar = () => {
  const { lang } = useLanguage();
  return (
    <section className="py-4 bg-ea-dark border-t border-white/10 border-b border-b-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-4">
            <span className="text-white font-semibold text-base">EuroAdria Corporate Solutions</span>
            <span className="text-xs text-ea-gold bg-ea-gold/10 border border-ea-gold/30 px-3 py-1 rounded-full font-medium">{lang === 'en' ? 'Referenced in n-tv, RTL, Focus, VC Magazin & Kosmo' : 'Referenziert in n-tv, RTL, Focus, VC Magazin & Kosmo'}</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-ea-light/70">
            <a href="https://wa.me/38268559776" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-ea-gold transition-colors">
              <span className="text-white font-medium">+382 68 559 776</span>
            </a>
            <a href="https://wa.me/38268559776" target="_blank" rel="noopener noreferrer" className="hover:text-ea-gold transition-colors">
              <span>WhatsApp</span>
            </a>
            <a href="mailto:office@euroadria.me" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-ea-gold transition-colors">
              <span className="text-white font-medium">office@euroadria.me</span>
            </a>
            <span className="text-ea-light/40 hidden lg:inline">{lang === 'en' ? 'Your direct line to the office' : 'Ihr direkter Draht ins Office'}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustBar;
