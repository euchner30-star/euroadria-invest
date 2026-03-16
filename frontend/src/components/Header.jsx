import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Shield, Map } from 'lucide-react';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
  }, [location]);

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
          <div className="hidden lg:flex items-center gap-6">
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
