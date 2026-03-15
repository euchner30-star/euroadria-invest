import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, Building2, Sparkles } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with overlay like euroadria.me */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1554155845-440a0ec58d3b)',
        }}
      />
      
      {/* Dark overlay - 15% like euroadria.me */}
      <div className="absolute inset-0 bg-ea-dark/50" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24">
        {/* Logo Section */}
        <div className="flex justify-center mb-8">
          <img 
            src="/euroadria-logo.png" 
            alt="EuroAdria Logo" 
            className="h-24 w-auto"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
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

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-ea-gold rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
