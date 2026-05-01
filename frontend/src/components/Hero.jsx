import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, Building2, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Hero = ({ backgroundImage, overlayOpacity = 50, title, subtitle, ctaText, backgroundImagePosition }) => {
  const heroImage = backgroundImage || '';
  const { t } = useLanguage();

  // Optimize Unsplash URLs for faster LCP
  const optimizedHeroImage = heroImage && heroImage.includes('unsplash.com') && !heroImage.includes('&fm=')
    ? `${heroImage}${heroImage.includes('?') ? '&' : '?'}fm=webp&q=75&w=1920`
    : heroImage;

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-ea-dark" data-testid="hero-section">
      {/* Background Image - eager load for LCP */}
      {optimizedHeroImage && (
        <img
          src={optimizedHeroImage}
          alt=""
          fetchpriority="high"
          decoding="sync"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: `center ${backgroundImagePosition ?? 50}%` }}
          data-testid="hero-background"
        />
      )}
      
      {/* Dark overlay */}
      <div 
        className="absolute inset-0 bg-ea-dark" 
        style={{ opacity: overlayOpacity / 100 }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24">
        <div className="flex justify-center mb-10">
          <img 
            src="/euroadria-logo-white.png" 
            alt="EuroAdria Corporate Solutions - Shaping the Adriatic's Future" 
            className="h-64 md:h-96 w-auto cursor-pointer transition-transform duration-500 ease-in-out hover:scale-110"
            fetchpriority="high"
          />
        </div>

        <div className="text-center max-w-4xl mx-auto mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-white mb-8 leading-tight">
            {title || t('hero.title')}
          </h1>
          <p className="text-lg md:text-xl text-ea-light/90 leading-relaxed max-w-3xl mx-auto">
            {subtitle || t('hero.subtitle')}
          </p>
        </div>

        <div className="flex justify-center mb-16">
          <Link 
            to="/contact" 
            className="px-8 py-4 bg-ea-dark text-white text-base font-semibold rounded-lg hover:bg-ea-navy transition-all duration-300 hover:shadow-lg inline-flex items-center gap-2"
            data-testid="hero-cta-button"
          >
            {ctaText || t('hero.cta')}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-6 py-3 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-ea-gold" />
            <span className="text-white text-sm font-medium">{t('hero.badge1')}</span>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-6 py-3 flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-ea-gold" />
            <span className="text-white text-sm font-medium">{t('hero.badge2')}</span>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-6 py-3 flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-ea-gold" />
            <span className="text-white text-sm font-medium">{t('hero.badge3')}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
