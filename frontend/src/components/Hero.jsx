import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, Building2, Sparkles } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1554155845-440a0ec58d3b)',
          filter: 'brightness(0.4)'
        }}
      />

      {/* Gradient Overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
        {/* Main Logo and Tagline */}
        <div className="mb-8 animate-fadeIn">
          <h1 className="text-7xl md:text-8xl lg:text-9xl font-display font-bold text-white mb-6 tracking-tight hover-glow">
            <span className="text-gold">Euro</span>Adria
          </h1>
          <div className="flex items-center justify-center space-x-4 text-xl md:text-2xl text-white/90 font-light tracking-widest">
            <span className="hover:text-gold transition-colors cursor-default">Business</span>
            <span className="text-gold">•</span>
            <span className="hover:text-gold transition-colors cursor-default">Invest</span>
            <span className="text-gold">•</span>
            <span className="hover:text-gold transition-colors cursor-default">Lifestyle</span>
          </div>
        </div>

        {/* Description */}
        <div className="glass-card max-w-3xl mx-auto mb-12 p-8 animate-slideUp">
          <p className="text-lg md:text-xl text-white/90 leading-relaxed font-light">
            Ihr exklusiver Partner für Investments, Business und Lifestyle an der Adria. 
            Entdecken Sie einzigartige Chancen auf dem Balkan mit erstklassiger Expertise.
          </p>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
          <div className="glass-card px-6 py-3 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-gold" />
            <span className="text-white text-sm font-medium">Premium Investments</span>
          </div>
          <div className="glass-card px-6 py-3 flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-gold" />
            <span className="text-white text-sm font-medium">Luxus-Immobilien</span>
          </div>
          <div className="glass-card px-6 py-3 flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-gold" />
            <span className="text-white text-sm font-medium">Adriatic Lifestyle</span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/blog" className="btn-gold text-lg px-10 py-4 group">
            Entdecken Sie unsere Insights
            <ArrowRight className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/contact"
            className="glass-card px-10 py-4 text-white hover:text-gold transition-all duration-300 font-medium text-lg border border-white/20 hover:border-gold/50"
          >
            Kostenlose Beratung
          </Link>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-gold rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
