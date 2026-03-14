import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Investments', path: '/investments' },
    { name: 'Blog', path: '/blog' },
    { name: 'Kontakt', path: '/contact' }
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'py-3'
          : 'py-6'
      }`}
    >
      <nav
        className={`max-w-7xl mx-auto px-6 transition-all duration-500 ${
          isScrolled
            ? 'glass-card-strong py-3'
            : 'glass-card py-4'
        }`}
        style={{
          borderRadius: '16px'
        }}
      >
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="text-2xl font-bold font-display text-white tracking-wider hover-glow">
              <span className="text-gold">Euro</span>Adria
            </div>
          </Link>

          {/* Navigation Links */}
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

          {/* CTA Button */}
          <Link
            to="/contact"
            className="hidden md:block btn-gold text-sm"
          >
            Beratung anfragen
          </Link>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-white hover:text-gold transition-colors">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Header;
