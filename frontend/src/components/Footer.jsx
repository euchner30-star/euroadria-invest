import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Linkedin, Instagram, Facebook } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative py-16 mt-20">
      {/* Background with blur */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div>
            <div className="text-3xl font-bold font-display text-white mb-4">
              <span className="text-gold">Euro</span>Adria
            </div>
            <p className="text-white/70 text-sm leading-relaxed mb-4">
              Premium Investment & Lifestyle Partner für die Adria-Region. 
              Expertise, Vertrauen, Exklusivität.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-white hover:text-gold transition-all hover:scale-110"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-white hover:text-gold transition-all hover:scale-110"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-white hover:text-gold transition-all hover:scale-110"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-gold font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-white/70 hover:text-gold transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/investments" className="text-white/70 hover:text-gold transition-colors text-sm">
                  Investments
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-white/70 hover:text-gold transition-colors text-sm">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-white/70 hover:text-gold transition-colors text-sm">
                  Kontakt
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-gold font-semibold text-lg mb-4">Services</h3>
            <ul className="space-y-3">
              <li>
                <span className="text-white/70 text-sm">Immobilien-Investment</span>
              </li>
              <li>
                <span className="text-white/70 text-sm">Yacht-Investment</span>
              </li>
              <li>
                <span className="text-white/70 text-sm">Business-Consulting</span>
              </li>
              <li>
                <span className="text-white/70 text-sm">Lifestyle-Beratung</span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-gold font-semibold text-lg mb-4">Kontakt</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3 text-white/70 text-sm">
                <Mail className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                <span>info@euroadria.com</span>
              </li>
              <li className="flex items-start space-x-3 text-white/70 text-sm">
                <Phone className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                <span>+49 (0) 123 456789</span>
              </li>
              <li className="flex items-start space-x-3 text-white/70 text-sm">
                <MapPin className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                <span>München, Deutschland</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-white/50 text-sm">
              © {currentYear} EuroAdria. Alle Rechte vorbehalten.
            </p>
            <div className="flex space-x-6">
              <Link
                to="/impressum"
                className="text-white/50 hover:text-gold transition-colors text-sm"
              >
                Impressum
              </Link>
              <Link
                to="/datenschutz"
                className="text-white/50 hover:text-gold transition-colors text-sm"
              >
                Datenschutz
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
