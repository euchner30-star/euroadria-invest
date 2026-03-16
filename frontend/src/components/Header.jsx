import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Shield, Map, Building2, ChevronDown } from 'lucide-react';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isImmobilienOpen, setIsImmobilienOpen] = useState(false);
  const [isMobileImmobilienOpen, setIsMobileImmobilienOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();

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

  const immobilienRegions = [
    { name: 'Skadar-Lake', path: '/immobilien/skadar-lake', description: 'Naturparadies am See' },
    { name: 'Žabljak', path: '/immobilien/zabljak', description: 'Bergresort Durmitor' },
    { name: 'Budva', path: '/immobilien/budva', description: 'Küstenmetropole' },
    { name: 'Nikšić', path: '/immobilien/niksic', description: 'Industriezentrum' },
  ];

  const navItems = [
    { name: 'HOME', path: '/' },
    { name: 'INFRASTRUKTUR-RADAR', path: '/infrastruktur-radar', icon: Map, isNew: true },
    { name: 'BLOG', path: '/blog' },
    { name: 'ÜBER UNS', path: '/team' },
    { name: 'KONTAKT', path: '/contact' },
    { name: 'SERBIA EXECUTIVE', path: '/serbia-executive', icon: Shield, isExclusive: true },
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
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img 
              src="/euroadria-logo.png" 
              alt="EuroAdria Logo" 
              className="h-10 w-auto object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Immobilienangebot Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsImmobilienOpen(!isImmobilienOpen)}
                onMouseEnter={() => setIsImmobilienOpen(true)}
                className={`flex items-center gap-1.5 text-sm font-semibold tracking-wider transition-colors duration-300 px-3 py-2 rounded-lg
                  ${location.pathname.startsWith('/immobilien') 
                    ? 'text-ea-gold bg-ea-gold/10' 
                    : 'text-ea-dark hover:text-ea-gold hover:bg-ea-gold/5'
                  }`}
                data-testid="nav-immobilien-dropdown"
              >
                <Building2 className="w-4 h-4" />
                IMMOBILIENANGEBOT
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isImmobilienOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Dropdown Menu */}
              {isImmobilienOpen && (
                <div 
                  className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50"
                  onMouseLeave={() => setIsImmobilienOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-xs font-semibold text-ea-gold uppercase tracking-wider">Regionen in Montenegro</p>
                  </div>
                  {immobilienRegions.map((region) => (
                    <Link
                      key={region.path}
                      to={region.path}
                      className="flex flex-col px-4 py-3 hover:bg-ea-gold/5 transition-colors"
                      data-testid={`nav-immobilien-${region.name.toLowerCase()}`}
                    >
                      <span className="text-sm font-semibold text-ea-dark">{region.name}</span>
                      <span className="text-xs text-ea-dark/50">{region.description}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm font-semibold tracking-wider transition-colors duration-300 ${
                  item.isExclusive || item.isNew
                    ? 'flex items-center gap-2 px-3 py-2 bg-ea-gold/10 border border-ea-gold/30 rounded-lg text-ea-dark hover:bg-ea-gold/20'
                    : location.pathname === item.path
                      ? 'text-ea-gold'
                      : 'text-ea-dark hover:text-ea-gold'
                }`}
                data-testid={item.isExclusive ? 'nav-serbia-executive' : item.isNew ? 'nav-infrastruktur-radar' : undefined}
              >
                {item.icon && <item.icon className="w-4 h-4 text-ea-gold" />}
                {item.name}
                {item.isNew && <span className="text-[10px] bg-ea-gold text-ea-dark px-1.5 py-0.5 rounded font-bold">NEU</span>}
              </Link>
            ))}
          </div>

          {/* Desktop CTA Button - Navy wie euroadria.me */}
          <Link
            to="/contact"
            className="hidden lg:block px-6 py-3 bg-ea-dark text-white text-sm font-semibold rounded-lg hover:bg-ea-navy transition-all duration-300 hover:shadow-lg"
            data-testid="header-cta-button"
          >
            Jetzt Beratung anfragen
          </Link>

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

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-4 pt-4 border-t border-gray-200 animate-fadeIn">
            <div className="flex flex-col gap-2">
              {/* Mobile Immobilienangebot */}
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
                    <span className="font-semibold tracking-wide">IMMOBILIENANGEBOT</span>
                  </div>
                  <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isMobileImmobilienOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isMobileImmobilienOpen && (
                  <div className="ml-6 mt-1 space-y-1 border-l-2 border-ea-gold/30 pl-4">
                    {immobilienRegions.map((region) => (
                      <Link
                        key={region.path}
                        to={region.path}
                        className="block py-2 px-3 rounded-lg text-ea-dark hover:bg-ea-gold/10 transition-colors"
                      >
                        <span className="font-medium">{region.name}</span>
                        <span className="text-xs text-ea-dark/50 block">{region.description}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-base font-semibold tracking-wide transition-all duration-300 rounded-lg px-4 py-3 ${
                    item.isExclusive || item.isNew
                      ? 'flex items-center gap-3 border border-ea-gold/30 bg-ea-gold/10 text-ea-dark'
                      : location.pathname === item.path
                        ? 'text-ea-gold bg-ea-light'
                        : 'text-ea-dark hover:text-ea-gold hover:bg-ea-light'
                  }`}
                >
                  {item.icon && <item.icon className="w-5 h-5 text-ea-gold" />}
                  {item.name}
                  {item.isNew && <span className="text-[10px] bg-ea-gold text-ea-dark px-1.5 py-0.5 rounded font-bold ml-auto">NEU</span>}
                </Link>
              ))}
              <Link
                to="/contact"
                className="mt-2 px-4 py-3 bg-ea-dark text-white text-base font-semibold rounded-lg text-center hover:bg-ea-navy"
              >
                Jetzt Beratung anfragen
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
