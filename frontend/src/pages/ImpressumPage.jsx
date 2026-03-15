import React, { useEffect } from 'react';
import { Mail, Phone, MapPin, Building2, User, Globe } from 'lucide-react';
import SEO from '../components/SEO';

const ImpressumPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen pt-28 pb-20 bg-white" data-testid="impressum-page">
      <SEO 
        title="Impressum"
        description="Impressum der EuroAdria - Investment & Business Beratung. Angaben gemäß § 5 TMG."
        url="/impressum"
      />
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16 animate-fadeIn">
          <p className="text-[#3eb489] text-sm font-semibold tracking-wider uppercase mb-4">Rechtliches</p>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-gray-900 mb-6">
            Impressum
          </h1>
          <div className="section-divider"></div>
        </div>

        {/* Main Content */}
        <div className="space-y-6 animate-slideUp">
          
          {/* Company Information */}
          <section className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-xl bg-[#3eb489]/10 flex items-center justify-center">
                <Building2 className="w-7 h-7 text-[#3eb489]" />
              </div>
              <h2 className="text-2xl font-display font-bold text-gray-900">EuroAdria Corporate Solutions</h2>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6 space-y-4">
              <p className="text-gray-700 leading-relaxed">
                <strong className="text-[#3eb489] block mb-2">Firmensitz:</strong>
                Montaris & Co. d.o.o. Novi Sad<br />
                NOVI SAD, MARKA MILJANOVA 12<br />
                NOVI SAD, Serbien
              </p>
              
              <div className="flex flex-wrap gap-6 pt-6 border-t border-gray-200">
                <a href="tel:+38268559776" className="flex items-center gap-2 text-gray-600 hover:text-[#3eb489] transition-colors group">
                  <Phone className="w-5 h-5 text-[#3eb489] group-hover:scale-110 transition-transform" />
                  <span>+382 68 559 776</span>
                </a>
                <a href="mailto:office@euroadria.me" className="flex items-center gap-2 text-gray-600 hover:text-[#3eb489] transition-colors group">
                  <Mail className="w-5 h-5 text-[#3eb489] group-hover:scale-110 transition-transform" />
                  <span>office@euroadria.me</span>
                </a>
                <a href="https://www.euroadria.me" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-600 hover:text-[#3eb489] transition-colors group">
                  <Globe className="w-5 h-5 text-[#3eb489] group-hover:scale-110 transition-transform" />
                  <span>www.euroadria.me</span>
                </a>
              </div>
            </div>
          </section>

          {/* German Branch */}
          <section className="bg-[#3eb489]/5 border border-[#3eb489]/20 rounded-2xl p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-xl bg-[#3eb489]/15 flex items-center justify-center">
                <MapPin className="w-7 h-7 text-[#3eb489]" />
              </div>
              <h2 className="text-2xl font-display font-bold text-gray-900">Niederlassung Deutschland</h2>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                <strong className="text-[#3eb489] block mb-2">Adresse:</strong>
                Speditionsstraße 15a<br />
                40221 Düsseldorf<br />
                Deutschland
              </p>
              <p className="text-gray-700">
                <strong className="text-[#3eb489]">Verantwortlich:</strong> Holger Kuhlmann
              </p>
            </div>
          </section>

          {/* Vertretungsberechtigt */}
          <section className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-xl bg-[#3eb489]/10 flex items-center justify-center">
                <User className="w-7 h-7 text-[#3eb489]" />
              </div>
              <h2 className="text-2xl font-display font-bold text-gray-900">Vertretungsberechtigt</h2>
            </div>
            
            <p className="text-gray-700 leading-relaxed">
              Montaris & Co. d.o.o. Novi Sad, vertreten durch die Geschäftsführung
            </p>
          </section>

          {/* Verantwortlich für Inhalt */}
          <section className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            <h3 className="text-xl font-display font-bold text-[#3eb489] mb-4">
              Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV (Deutschland)
            </h3>
            <p className="text-gray-700">Holger Kuhlmann</p>
          </section>

          {/* Haftungsausschluss */}
          <section className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-6">Haftungsausschluss</h2>
            
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, 
                Vollständigkeit und Aktualität der Inhalte übernehmen wir jedoch keine Gewähr. Als 
                Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten 
                nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als 
                Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde 
                Informationen zu überwachen oder nach Umständen zu forschen, die auf eine 
                rechtswidrige Tätigkeit hinweisen.
              </p>
              
              <p>
                Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach 
                den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung 
                ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung 
                möglich. Bei Bekanntwerden entsprechender Rechtsverletzungen werden wir diese 
                Inhalte umgehend entfernen.
              </p>
            </div>
          </section>

          {/* Haftung für Links */}
          <section className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-6">Haftung für Links</h2>
            <p className="text-gray-600 leading-relaxed">
              Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir 
              keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine 
              Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige 
              Anbieter oder Betreiber der Seiten verantwortlich. Bei Bekanntwerden von 
              Rechtsverletzungen werden wir derartige Links umgehend entfernen.
            </p>
          </section>

          {/* Urheberrecht */}
          <section className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-6">Urheberrecht</h2>
            <p className="text-gray-600 leading-relaxed">
              Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten 
              unterliegen dem Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und 
              jede Art der Verwertung außerhalb der Grenzen des Urheberrechts bedürfen der 
              schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers. Downloads und 
              Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ImpressumPage;
