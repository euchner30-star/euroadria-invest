import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Linkedin, Instagram, Facebook } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 py-16 mt-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded bg-[#3eb489] flex items-center justify-center">
                <span className="text-white font-bold text-xl">E</span>
              </div>
              <span className="text-white font-semibold text-xl">EuroAdria</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              EuroAdria Corporate Solutions ist eine Marke der Montaris & Co. d.o.o. Novi Sad
            </p>
            <div className="flex space-x-3">
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-[#3eb489] hover:text-white transition-all"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-[#3eb489] hover:text-white transition-all"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-[#3eb489] hover:text-white transition-all"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Rechtliches */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-6">Rechtliches</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/impressum" className="text-gray-400 hover:text-[#3eb489] transition-colors text-sm">
                  Impressum
                </Link>
              </li>
              <li>
                <Link to="/datenschutz" className="text-gray-400 hover:text-[#3eb489] transition-colors text-sm">
                  Datenschutz
                </Link>
              </li>
            </ul>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-6">Navigation</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-gray-400 hover:text-[#3eb489] transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-400 hover:text-[#3eb489] transition-colors text-sm">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/team" className="text-gray-400 hover:text-[#3eb489] transition-colors text-sm">
                  Über uns
                </Link>
              </li>
              <li>
                <Link to="/serbia-executive" className="text-gray-400 hover:text-[#3eb489] transition-colors text-sm">
                  Serbia Executive
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-[#3eb489] transition-colors text-sm">
                  Kontakt
                </Link>
              </li>
            </ul>
          </div>

          {/* Kontakt */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-6">Kontakt</h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-[#3eb489] flex-shrink-0 mt-0.5" />
                <a href="mailto:office@euroadria.me" className="text-gray-400 hover:text-[#3eb489] transition-colors text-sm">
                  office@euroadria.me
                </a>
              </li>
              <li className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-[#3eb489] flex-shrink-0 mt-0.5" />
                <a href="tel:+38268559776" className="text-gray-400 hover:text-[#3eb489] transition-colors text-sm">
                  +382 68 559 776
                </a>
              </li>
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-[#3eb489] flex-shrink-0 mt-0.5" />
                <span className="text-gray-400 text-sm">
                  Speditionsstraße 15a<br />
                  40221 Düsseldorf
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-500 text-sm">
              © {currentYear} EuroAdria Corporate Solutions. Alle Rechte vorbehalten.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
