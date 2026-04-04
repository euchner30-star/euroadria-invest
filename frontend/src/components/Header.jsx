import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Shield, Map, Building2, ChevronDown, TrendingUp } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isImmobilienOpen, setIsImmobilienOpen] = useState(false);
  const [isMobileImmobilienOpen, setIsMobileImmobilienOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();
  const { t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsImmobilienOpen(false);
    setIsMobileImmobilienOpen(false);
  }, [location]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsImmobilienOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Kategorisierte Regionen für Mega-Menu
  const immobilienCategories = [
    {
      title: 'Premium-Küste',
      color: 'text-amber-500',
      regions: [
        { name: 'Tivat', path: '/investment/standort/Tivat', desc: 'Porto Montenegro' },
        { name: 'Sveti Stefan', path: '/investment/standort/Sveti%20Stefan', desc: 'Ultra-Premium' },
        { name: 'Kotor', path: '/investment/standort/Kotor', desc: 'UNESCO Welterbe' },
        { name: 'Budva', path: '/immobilien/budva', desc: 'Tourismus-Hotspot' },
      ]
    },
    {
      title: 'Aufstrebend',
      color: 'text-green-500',
      regions: [
        { name: 'Buljarica', path: '/investment/standort/Buljarica', desc: '+22% Wachstum' },
        { name: 'Čanj', path: '/investment/standort/%C4%8Canj', desc: 'Erschwinglicher Luxus' },
        { name: 'Ulcinj', path: '/investment/standort/Ulcinj', desc: 'Längste Strände' },
        { name: 'Bar', path: '/investment/standort/Bar', desc: 'Hafen & Logistik' },
      ]
    },
    {
      title: 'Inland & Seen',
      color: 'text-blue-500',
      regions: [
        { name: 'Podgorica', path: '/immobilien/podgorica', desc: 'Hauptstadt' },
        { name: 'Danilovgrad', path: '/investment/standort/Danilovgrad', desc: 'Logistik-Korridor' },
        { name: 'Skutarisee', path: '/investment/standort/Skutarisee', desc: 'Öko-Tourismus' },
        { name: 'Žabljak', path: '/immobilien/zabljak', desc: 'Durmitor' },
      ]
    },
  ];

  // Sekundäre Nav-Items (rechts vom Infrastruktur-Radar)
  const secondaryNavItems = [
    { name: t('nav.blog'), path: '/blog' },
    { name: t('nav.about'), path: '/team' },
    { name: t('nav.contact'), path: '/contact' },
    { name: t('nav.serbiaExecutive'), path: '/serbia-executive', icon: Shield, isExclusive: true },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white shadow-md' 
          : 'bg-white/95'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo mit elegantem Abstand */}
          <Link to="/" className="flex items-center group mr-8">
            <img 
              src="/euroadria-logo.png" 
              alt="EuroAdria Logo" 
              className="h-14 w-auto object-contain transition-transform duration-300 ease-in-out group-hover:scale-110"
            />
          </Link>

          {/* Desktop Navigation - Neue logische Reihenfolge */}
          <div className="hidden lg:flex items-center gap-1 flex-1">
            {/* 1. HOME - Schlicht ganz links */}
            <Link
              to="/"
              className={`text-sm font-semibold tracking-wider transition-colors duration-300 px-4 py-2 rounded-lg ${
                location.pathname === '/'
                  ? 'text-ea-gold'
                  : 'text-ea-dark hover:text-ea-gold'
              }`}
              data-testid="nav-home"
            >
              HOME
            </Link>

            {/* 2. IMMOBILIENANGEBOT Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsImmobilienOpen(!isImmobilienOpen)}
                onMouseEnter={() => setIsImmobilienOpen(true)}
                className={`flex items-center gap-1.5 text-sm font-semibold tracking-wider transition-colors duration-300 px-4 py-2 rounded-lg
                  ${location.pathname.startsWith('/immobilien') 
                    ? 'text-ea-gold bg-ea-gold/10' 
                    : 'text-ea-dark hover:text-ea-gold hover:bg-ea-gold/5'
                  }`}
                data-testid="nav-immobilien-dropdown"
              >
                <Building2 className="w-4 h-4" />
                {t('nav.realEstate')}
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isImmobilienOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Mega Dropdown Menu */}
              {isImmobilienOpen && (
                <div 
                  className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 py-3 z-50"
                  onMouseLeave={() => setIsImmobilienOpen(false)}
                  style={{ width: '420px' }}
                >
                  <div className="grid grid-cols-3 gap-1 px-3">
                    {immobilienCategories.map((category) => (
                      <div key={category.title}>
                        <p className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 ${category.color}`}>
                          {category.title}
                        </p>
                        {category.regions.map((region) => (
                          <Link
                            key={region.path}
                            to={region.path}
                            className="block px-2 py-1.5 rounded-lg hover:bg-ea-gold/10 transition-colors group"
                            onClick={() => setIsImmobilienOpen(false)}
                          >
                            <span className="text-sm font-medium text-ea-dark group-hover:text-ea-gold">{region.name}</span>
                            <span className="block text-[10px] text-ea-dark/40">{region.desc}</span>
                          </Link>
                        ))}
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-100 mt-2 pt-2 px-3">
                    <Link 
                      to="/investment" 
                      className="flex items-center justify-center gap-2 text-xs font-semibold text-ea-gold hover:text-ea-dark transition-colors py-1"
                      onClick={() => setIsImmobilienOpen(false)}
                    >
                      <TrendingUp className="w-3 h-3" />
                      Alle 22 Standorte im Dashboard →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* 3. INFRASTRUKTUR-RADAR - Hervorgehoben */}
            <Link
              to="/infrastruktur-radar"
              className={`flex items-center gap-2 text-sm font-semibold tracking-wider transition-colors duration-300 px-4 py-2 rounded-lg border border-ea-gold/30 ${
                location.pathname === '/infrastruktur-radar'
                  ? 'bg-ea-gold/20 text-ea-dark'
                  : 'bg-ea-gold/10 text-ea-dark hover:bg-ea-gold/20'
              }`}
              data-testid="nav-infrastruktur-radar"
            >
              <Map className="w-4 h-4 text-ea-gold" />
              {t('nav.infrastructure')}
              <span className="text-[10px] bg-ea-gold text-white px-1.5 py-0.5 rounded-full font-bold">{t('nav.new')}</span>
            </Link>

            {/* 4. INVESTMENT INTELLIGENCE */}
            <Link
              to="/investment"
              className={`flex items-center gap-2 text-sm font-semibold tracking-wider transition-colors duration-300 px-4 py-2 rounded-lg border border-green-500/30 ${
                location.pathname.startsWith('/investment')
                  ? 'bg-green-500/20 text-ea-dark'
                  : 'bg-green-500/10 text-ea-dark hover:bg-green-500/20'
              }`}
              data-testid="nav-investment"
            >
              <TrendingUp className="w-4 h-4 text-green-500" />
              INVESTMENT
              <span className="text-[10px] bg-green-500 text-white px-1.5 py-0.5 rounded-full font-bold">V12</span>
            </Link>

            {/* Flexible Lücke */}
            <div className="flex-1"></div>

            {/* Sekundäre Navigation */}
            {secondaryNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm font-semibold tracking-wider transition-colors duration-300 px-3 py-2 rounded-lg ${
                  item.isExclusive
                    ? 'flex items-center gap-2 bg-ea-gold/10 border border-ea-gold/30 text-ea-dark hover:bg-ea-gold/20'
                    : location.pathname === item.path
                      ? 'text-ea-gold'
                      : 'text-ea-dark hover:text-ea-gold'
                }`}
                data-testid={item.isExclusive ? 'nav-serbia-executive' : undefined}
              >
                {item.icon && <item.icon className="w-4 h-4 text-ea-gold" />}
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-2 ml-4">
            <Link
              to="/contact"
              className="px-3 py-2 bg-ea-dark text-white text-sm font-semibold tracking-wider rounded-lg hover:bg-ea-navy transition-all duration-300"
              data-testid="header-cta-button"
            >
              {t('nav.ctaButton')}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden text-ea-dark hover:text-ea-gold transition-colors p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu - Gleiche logische Reihenfolge */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-4 pt-4 border-t border-gray-200 animate-fadeIn">
            <div className="flex flex-col gap-2">
              {/* 1. HOME */}
              <Link
                to="/"
                className={`text-base font-semibold tracking-wide transition-all duration-300 rounded-lg px-4 py-3 ${
                  location.pathname === '/'
                    ? 'text-ea-gold bg-ea-light'
                    : 'text-ea-dark hover:text-ea-gold hover:bg-ea-light'
                }`}
              >
                HOME
              </Link>

              {/* 2. Mobile Immobilienangebot */}
              <div>
                <button
                  onClick={() => setIsMobileImmobilienOpen(!isMobileImmobilienOpen)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-300 ${
                    location.pathname.startsWith('/immobilien')
                      ? 'bg-ea-gold/10 text-ea-gold'
                      : 'text-ea-dark hover:bg-ea-light'
                  }`}
                  data-testid="mobile-immobilien-dropdown"
                >
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-ea-gold" />
                    <span className="font-semibold tracking-wide">{t('nav.realEstate')}</span>
                  </div>
                  <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isMobileImmobilienOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isMobileImmobilienOpen && (
                  <div className="ml-4 mt-2 space-y-3">
                    {immobilienCategories.map((category) => (
                      <div key={category.title}>
                        <p className={`text-[10px] font-bold uppercase tracking-wider px-3 ${category.color}`}>
                          {category.title}
                        </p>
                        <div className="grid grid-cols-2 gap-1 mt-1">
                          {category.regions.map((region) => (
                            <Link
                              key={region.path}
                              to={region.path}
                              className="block py-1.5 px-3 rounded-lg text-ea-dark hover:bg-ea-gold/10 transition-colors"
                            >
                              <span className="font-medium text-sm">{region.name}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                    <Link 
                      to="/investment" 
                      className="flex items-center gap-2 text-xs font-semibold text-ea-gold px-3 pt-2"
                    >
                      <TrendingUp className="w-3 h-3" />
                      {t('nav.allLocationsMobile')} →
                    </Link>
                  </div>
                )}
              </div>

              {/* 3. INFRASTRUKTUR-RADAR */}
              <Link
                to="/infrastruktur-radar"
                className="flex items-center gap-3 border border-ea-gold/30 bg-ea-gold/10 text-ea-dark text-base font-semibold tracking-wide rounded-lg px-4 py-3"
              >
                <Map className="w-5 h-5 text-ea-gold" />
                {t('nav.infrastructure')}
                <span className="text-[10px] bg-ea-gold text-ea-dark px-1.5 py-0.5 rounded font-bold ml-auto">{t('nav.new')}</span>
              </Link>

              {/* 4. INVESTMENT DASHBOARD */}
              <Link
                to="/investment"
                className="flex items-center gap-3 border border-green-500/30 bg-green-500/10 text-ea-dark text-base font-semibold tracking-wide rounded-lg px-4 py-3"
              >
                <TrendingUp className="w-5 h-5 text-green-500" />
                INVESTMENT
                <span className="text-[10px] bg-green-500 text-white px-1.5 py-0.5 rounded font-bold ml-auto">V12</span>
              </Link>

              {/* Sekundäre Nav-Items */}
              {secondaryNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-base font-semibold tracking-wide transition-all duration-300 rounded-lg px-4 py-3 ${
                    item.isExclusive
                      ? 'flex items-center gap-3 border border-ea-gold/30 bg-ea-gold/10 text-ea-dark'
                      : location.pathname === item.path
                        ? 'text-ea-gold bg-ea-light'
                        : 'text-ea-dark hover:text-ea-gold hover:bg-ea-light'
                  }`}
                >
                  {item.icon && <item.icon className="w-5 h-5 text-ea-gold" />}
                  {item.name}
                </Link>
              ))}

              <Link
                to="/contact"
                className="mt-2 px-4 py-3 bg-ea-dark text-white text-base font-semibold rounded-lg text-center hover:bg-ea-navy"
              >
                {t('nav.ctaButtonMobile')}
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
     