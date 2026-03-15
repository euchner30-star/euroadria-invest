import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

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

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Investments', path: '/investments' },
    { name: 'Blog', path: '/blog' },
    { name: 'Kontakt', path: '/contact' }
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? 'py-3' : 'py-6'
      }`}
    >
      <nav
        className={`max-w-7xl mx-auto px-6 transition-all duration-500 ${
          isScrolled ? 'glass-card-strong py-3' : 'glass-card py-4'
        }`}
        style={{ borderRadius: '16px' }}
      >
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <img 
              src="/euroadria-logo.png" 
              alt="EuroAdria Logo" 
              className="h-12 w-auto transition-transform duration-300 group-hover:scale-105"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`relative text-sm font-medium tracking-wide transition-all duration-300 ${
                  location.pathname === item.path
                    ? 'text-gold'
                    : 'text-white hover:text-gold'
                }`}
              >
                {item.name}
                {location.pathname === item.path && (
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gold rounded-full"></span>
                )}
              </Link>
            ))}
          </div>

          {/* Desktop CTA Button */}
          <Link
            to="/contact"
            className="hidden md:block btn-gold text-sm"
          >
            Beratung anfragen
          </Link>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-white hover:text-gold transition-colors p-2"
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
          <div className="md:hidden mt-4 pt-4 border-t border-white/10 animate-fadeIn">
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-base font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'text-gold'
                      : 'text-white hover:text-gold'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              <Link
                to="/contact"
                className="btn-gold text-sm text-center mt-2"
              >
                Beratung anfragen
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
