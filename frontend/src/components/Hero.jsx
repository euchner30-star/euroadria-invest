import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, Building2, Sparkles } from 'lucide-react';

const DEFAULT_HERO_IMAGE = '';

const Hero = ({ backgroundImage, overlayOpacity = 50 }) => {
  const heroImage = backgroundImage || '';
  
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden" data-testid="hero-section">
      {/* Background Image with overlay like euroadria.me */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${heroImage})`,
        }}
        data-testid="hero-background"
      />
      
      {/* Dark overlay - configurable opacity */}
      <div 
        className="absolute inset-0 bg-ea-dark" 
        style={{ opacity: overlayOpacity / 100 }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24">
        {/* Logo Section - Weißes Logo für Hauptseite */}
        <div className="flex justify-center mb-10">
          <img 
            src="/euroadria-logo-white.png" 
            alt="EuroAdria - Shaping the Adriatic's Future" 
            className="h-52 md:h-72 w-auto cursor-pointer transition-transform duration-500 ease-in-out hover:scale-110"
          />
        </div>

        {/* Main Headline - wie euroadria.me */}
        <div className="text-center max-w-4xl mx-auto mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-white mb-8 leading-tight">
            Firmengründung, Aufenthalt & Investments in Montenegro und Serbien
          </h1>
          <p className="text-lg md:text-xl text-ea-light/90 leading-relaxed max-w-3xl mx-auto">
            EuroAdria ist Ihre Brücke zu erfolgreichen Investitionen, rechtssicherer Auswanderung und internationaler Unternehmensstrukturierung, sowohl in der Adria-Region als auch in Asien. Wir sind Ihr Trusted Advisor für alle unternehmerischen und privaten Vorhaben im Ausland.
          </p>
        </div>

        {/* CTA Button - Navy wie euroadria.me */}
        <div className="flex justify-center mb-16">
          <Link 
            to="/contact" 
            className="px-8 py-4 bg-ea-dark text-white text-base font-semibold rounded-lg hover:bg-ea-navy transition-all duration-300 hover:shadow-lg inline-flex items-center gap-2"
            data-testid="hero-cta-button"
          >
            Jetzt Beratung anfragen
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-6 py-3 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-ea-gold" />
            <span className="text-white text-sm font-medium">Premium Investments</span>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-6 py-3 flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-ea-gold" />
            <span className="text-white text-sm font-medium">Luxus-Immobilien</span>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-6 py-3 flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-ea-gold" />
            <span className="text-white text-sm font-medium">Adriatic Lifestyle</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
