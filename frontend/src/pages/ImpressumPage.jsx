import React, { useEffect } from 'react';
import { Mail, Phone, MapPin, Building2, User, Globe } from 'lucide-react';
import SEO from '../components/SEO';

const ImpressumPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen pt-32 pb-20" data-testid="impressum-page">
      <SEO 
        title="Impressum"
        description="Impressum der EuroAdria - Investment & Business Beratung. Angaben gemäß § 5 TMG."
        url="/impressum"
      />
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl md:text-5xl text-white mb-4">
            Impressum
          </h1>
          <div className="w-24 h-1 bg-gold mx-auto"></div>
        </div>

        {/* Main Content Card */}
        <div className="glass-card p-8 md:p-12 rounded-2xl space-y-10">
          
          {/* Company Information */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Building2 className="w-6 h-6 text-gold" />
              <h2 className="text-2xl font-semibold text-white">EuroAdria Corporate Solutions</h2>
            </div>
            
            <div className="bg-white/5 rounded-xl p-6 space-y-4">
              <p className="text-white/80">
                <strong className="text-gold">Firmensitz:</strong><br />
                Montaris & Co. d.o.o. Novi Sad<br />
                NOVI SAD, MARKA MILJANOVA 12<br />
                NOVI SAD, Serbien
              </p>
              
              <div className="flex flex-wrap gap-6 pt-4 border-t border-white/10">
                <a href="tel:+38268559776" className="flex items-center gap-2 text-white/70 hover:text-gold transition-colors">
                  <Phone className="w-5 h-5 text-gold" />
                  <span>+382 68 559 776</span>
                </a>
                <a href="mailto:office@euroadria.me" className="flex items-center gap-2 text-white/70 hover:text-gold transition-colors">
                  <Mail className="w-5 h-5 text-gold" />
                  <span>office@euroadria.me</span>
                </a>
                <a href="https://www.euroadria.me" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white/70 hover:text-gold transition-colors">
                  <Globe className="w-5 h-5 text-gold" />
                  <span>www.euroadria.me</span>
                </a>
              </div>
            </div>
          </section>

          {/* German Branch - Niederlassung Deutschland */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <MapPin className="w-6 h-6 text-gold" />
              <h2 className="text-2xl font-semibold text-white">Niederlassung Deutschland</h2>
            </div>
            
            <div className="bg-gold/10 border border-gold/30 rounded-xl p-6">
              <p className="text-white/90">
                <strong className="text-gold">Adresse:</strong><br />
                Speditionsstraße 15a<br />
                40221 Düsseldorf<br />
                Deutschland
              </p>
              <p className="text-white/80 mt-4">
                <strong className="text-gold">Verantwortlich:</strong> Holger Kuhlmann
              </p>
            </div>
          </section>

          {/* Vertretungsberechtigt */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <User className="w-6 h-6 text-gold" />
              <h2 className="text-2xl font-semibold text-white">Vertretungsberechtigt</h2>
            </div>
            
            <div className="bg-white/5 rounded-xl p-6">
              <p className="text-white/80">
                Montaris & Co. d.o.o. Novi Sad, vertreten durch die Geschäftsführung
              </p>
            </div>
          </section>

          {/* Verantwortlich für Inhalt */}
          <section>
            <h2 className="text-xl font-semibold text-gold mb-4">
              Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV (Deutschland)
            </h2>
            <p className="text-white/80">Holger Kuhlmann</p>
          </section>

          {/* Divider */}
          <div className="border-t border-white/10 pt-10">
            <h2 className="text-2xl font-semibold text-white mb-6">Haftungsausschluss</h2>
            
            <div className="space-y-6 text-white/70 leading-relaxed">
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
          </div>

          {/* Haftung für Links */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-6">Haftung für Links</h2>
            <p className="text-white/70 leading-relaxed">
              Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir 
              keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine 
              Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige 
              Anbieter oder Betreiber der Seiten verantwortlich. Bei Bekanntwerden von 
              Rechtsverletzungen werden wir derartige Links umgehend entfernen.
            </p>
          </section>

          {/* Urheberrecht */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-6">Urheberrecht</h2>
            <p className="text-white/70 leading-relaxed">
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
