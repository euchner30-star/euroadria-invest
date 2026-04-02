import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Linkedin, Instagram, Facebook, Twitter } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-ea-dark py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img 
                src="/euroadria-logo-white.png" 
                alt="EuroAdria Logo" 
                className="h-20 w-auto"
              />
            </div>
            <p className="text-ea-light/70 text-sm leading-relaxed mb-6">
              <span className="font-semibold text-white">EuroAdria Corporate Solutions</span> ist eine Marke der Montaris & Co. d.o.o. Novi Sad<br />
              NOVI SAD, MARKA MILJANOVA 12, NOVI SAD, Serbien
            </p>
          </div>

          {/* Euroadria Corporate Solutions */}
          <div>
            <h3 className="text-white font-semibold text-base mb-6">Euroadria Corporate Solutions</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-ea-light/70 hover:text-ea-gold transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-ea-light/70 hover:text-ea-gold transition-colors text-sm">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/team" className="text-ea-light/70 hover:text-ea-gold transition-colors text-sm">
                  Über uns
                </Link>
              </li>
              <li>
                <Link to="/serbia-executive" className="text-ea-light/70 hover:text-ea-gold transition-colors text-sm">
                  Serbia Executive
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-ea-light/70 hover:text-ea-gold transition-colors text-sm">
                  Kontakt
                </Link>
              </li>
            </ul>
          </div>

          {/* Rechtliches */}
          <div>
            <h3 className="text-white font-semibold text-base mb-6">Rechtliches</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/impressum" className="text-ea-light/70 hover:text-ea-gold transition-colors text-sm">
                  Impressum
                </Link>
              </li>
              <li>
                <Link to="/datenschutz" className="text-ea-light/70 hover:text-ea-gold transition-colors text-sm">
                  Datenschutz
                </Link>
              </li>
              <li>
                <Link to="/agb" className="text-ea-light/70 hover:text-ea-gold transition-colors text-sm">
                  AGB
                </Link>
              </li>
            </ul>
          </div>

          {/* Kontakt */}
          <div>
            <h3 className="text-white font-semibold text-base mb-6">Kontakt</h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-ea-light/70 flex-shrink-0 mt-0.5" />
                <a href="mailto:office@euroadria.me" target="_blank" rel="noopener noreferrer" className="text-ea-light/70 hover:text-ea-gold transition-colors text-sm">
                  office@euroadria.me
                </a>
              </li>
              <li className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-ea-light/70 flex-shrink-0 mt-0.5" />
                <a href="https://wa.me/38268559776" target="_blank" rel="noopener noreferrer" className="text-ea-light/70 hover:text-ea-gold transition-colors text-sm">
                  +382 68 559 776
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-ea-navy pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Social Links */}
            <div className="flex space-x-4">
              <a
                href="https://www.facebook.com/share/1Ckiys8xJw/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full flex items-center justify-center text-ea-light/70 hover:text-ea-gold transition-all"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://www.instagram.com/euroadria.me"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full flex items-center justify-center text-ea-light/70 hover:text-ea-gold transition-all"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://x.com/adriaeuro"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full flex items-center justify-center text-ea-light/70 hover:text-ea-gold transition-all"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://www.linkedin.com/company/euroadria/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full flex items-center justify-center text-ea-light/70 hover:text-ea-gold transition-all"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>

            <p className="text-ea-light/50 text-sm">
              © {currentYear} EuroAdria Corporate Solutions. Alle Rechte vorbehalten.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
