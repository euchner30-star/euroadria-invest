import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, Building2, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Hero = ({ overlayOpacity = 55, title, subtitle, ctaText }) => {
  const { t } = useLanguage();
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-ea-dark" data-testid="hero-section">
      {/* Video Background */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        poster="/videos/hero-poster.jpg"
        className="absolute inset-0 w-full h-full object-cover"
        data-testid="hero-video-background"
      >
        <source src="/videos/hero-bg.mp4" type="video/mp4" />
      </video>

      {/* Dark gradient overlay */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-ea-dark/70 via-ea-dark/50 to-ea-dark/80" 
        style={{ opacity: overlayOpacity / 100 }}
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-20 sm:pt-24">
        <div className="flex justify-center mb-6 sm:mb-10">
          <img 
            src="/euroadria-logo-white.png" 
            alt="EuroAdria Corporate Solutions" 
            className="h-32 sm:h-48 md:h-64 lg:h-80 w-auto transition-transform duration-500 ease-in-out hover:scale-105"
            fetchpriority="high"
          />
        </div>

        <div className="text-center max-w-4xl mx-auto mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-semibold text-white mb-4 sm:mb-8 leading-tight drop-shadow-lg px-2">
            {title || t('hero.title')}
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-ea-light/90 leading-relaxed max-w-3xl mx-auto drop-shadow-md px-2">
            {subtitle || t('hero.subtitle')}
          </p>
        </div>

        <div className="flex justify-center mb-8 sm:mb-16">
          <Link 
            to="/contact" 
            className="px-6 sm:px-8 py-3 sm:py-4 bg-ea-dark text-white text-sm sm:text-base font-semibold rounded-lg hover:bg-ea-navy transition-all duration-300 hover:shadow-lg inline-flex items-center gap-2"
            data-testid="hero-cta-button"
          >
            {ctaText || t('hero.cta')}
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </Link>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mb-8 sm:mb-12 px-2">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg sm:rounded-xl px-3 sm:px-6 py-2 sm:py-3 flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-ea-gold" />
            <span className="text-white text-xs sm:text-sm font-medium">{t('hero.badge1')}</span>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg sm:rounded-xl px-3 sm:px-6 py-2 sm:py-3 flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-ea-gold" />
            <span className="text-white text-xs sm:text-sm font-medium">{t('hero.badge2')}</span>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg sm:rounded-xl px-3 sm:px-6 py-2 sm:py-3 flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-ea-gold" />
            <span className="text-white text-xs sm:text-sm font-medium">{t('hero.badge3')}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
