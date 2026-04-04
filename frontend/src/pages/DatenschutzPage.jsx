import React, { useEffect, useState } from 'react';
import SEO from '../components/SEO';
import { useLanguage } from '../context/LanguageContext';

const DatenschutzPage = () => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const { lang } = useLanguage();

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchContent = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/settings/legal/datenschutz`);
        if (res.ok) {
          const data = await res.json();
          if (data.content) {
            setContent(data.content);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error('Failed to fetch datenschutz:', err);
      }
      setLoading(false);
    };
    fetchContent();
  }, []);

  return (
    <div className="min-h-screen pt-28 pb-20 bg-white" data-testid="datenschutz-page">
      <SEO 
        title="Datenschutzerklärung"
        description="Datenschutzerklärung der EuroAdria. Informationen zum Umgang mit Ihren personenbezogenen Daten gemäß DSGVO."
        url="/datenschutz"
      />
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16 animate-fadeIn">
          <p className="text-ea-gold text-sm font-semibold tracking-wider uppercase mb-4">{lang === 'en' ? 'Legal' : 'Rechtliches'}</p>
          <h1 className="font-semibold text-4xl md:text-5xl lg:text-6xl text-ea-dark mb-6">
            {lang === 'en' ? 'Privacy Policy' : 'Datenschutzerklärung'}
          </h1>
          <div className="section-divider"></div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-ea-gold border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : content ? (
          <>
            <div 
              className="legal-content animate-slideUp"
              dangerouslySetInnerHTML={{ __html: content }}
            />
            <style>{`
              .legal-content h2 {
                font-size: 1.5rem;
                font-weight: 600;
                color: #04151F;
                margin-top: 2.5rem;
                margin-bottom: 1rem;
                padding-bottom: 0.75rem;
                border-bottom: 2px solid #C8A96A;
              }
              .legal-content h2:first-child { margin-top: 0; }
              .legal-content h3 {
                font-size: 1.125rem;
                font-weight: 600;
                color: #04151F;
                margin-top: 1.5rem;
                margin-bottom: 0.5rem;
              }
              .legal-content p {
                color: rgba(4, 21, 31, 0.7);
                line-height: 1.8;
                margin-bottom: 1rem;
              }
              .legal-content ul, .legal-content ol {
                color: rgba(4, 21, 31, 0.7);
                line-height: 1.8;
                margin-bottom: 1rem;
                padding-left: 1.5rem;
              }
              .legal-content li { margin-bottom: 0.25rem; }
              .legal-content a {
                color: #C8A96A;
                text-decoration: underline;
              }
              .legal-content a:hover { opacity: 0.8; }
              .legal-content strong { color: #04151F; }
            `}</style>
          </>
        ) : (
          <FallbackDatenschutz />
        )}
      </div>
    </div>
  );
};

const FallbackDatenschutz = () => (
  <div className="space-y-6 animate-slideUp">
    <section className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
      <h2 className="text-2xl font-semibold text-ea-dark mb-4">1. Verantwortliche Stelle</h2>
      <div className="bg-ea-light rounded-xl p-6">
        <p className="text-ea-dark/80 leading-relaxed">
          Verantwortlich für die Verarbeitung personenbezogener Daten auf dieser Website ist:
        </p>
        <div className="border-l-4 border-ea-gold pl-4 mt-4">
          <p className="text-ea-dark font-semibold mb-1">EuroAdria Corporate Solutions</p>
          <p className="text-ea-dark/70 leading-relaxed">
            Montaris & Co. d.o.o.<br />
            Marka Miljanova 12<br />
            21000 Novi Sad, Serbien
          </p>
          <p className="text-ea-dark/70 leading-relaxed mt-2">
            Telefon: <a href="tel:+38268559776" className="text-ea-gold hover:underline">+382 68 559 776</a><br />
            E-Mail: <a href="mailto:office@euroadria.me" className="text-ea-gold hover:underline">office@euroadria.me</a><br />
            Website: <a href="https://invest.euroadria.me" className="text-ea-gold hover:underline">invest.euroadria.me</a>
          </p>
        </div>
      </div>
    </section>
    <section className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
      <h2 className="text-2xl font-semibold text-ea-dark mb-4">2. Erhebung und Speicherung personenbezogener Daten</h2>
      <h3 className="text-lg font-semibold text-ea-dark mb-2">a) Beim Besuch der Website</h3>
      <p className="text-ea-dark/70 leading-relaxed mb-4">
        Beim Aufrufen unserer Website werden durch den auf Ihrem Endgerät zum Einsatz 
        kommenden Browser automatisch Informationen an den Server unserer Website gesendet. 
        Diese Informationen werden temporär in einem sog. Logfile gespeichert. Folgende Informationen werden dabei 
        ohne Ihr Zutun erfasst und bis zur automatisierten Löschung gespeichert:
      </p>
      <ul className="list-disc list-inside text-ea-dark/70 leading-relaxed mb-4 space-y-1">
        <li>IP-Adresse des anfragenden Rechners (anonymisiert)</li>
        <li>Datum und Uhrzeit des Zugriffs</li>
        <li>Name und URL der abgerufenen Datei</li>
        <li>Website, von der aus der Zugriff erfolgt (Referrer-URL)</li>
        <li>Verwendeter Browser und ggf. das Betriebssystem Ihres Rechners</li>
      </ul>
      <h3 className="text-lg font-semibold text-ea-dark mb-2">b) Bei Nutzung unseres Kontaktformulars</h3>
      <p className="text-ea-dark/70 leading-relaxed">
        Bei Fragen jeglicher Art bieten wir Ihnen die Möglichkeit, mit uns über ein auf der Website bereitgestelltes 
        Formular Kontakt aufzunehmen. Dabei sind die Angabe Ihres Namens und einer gültigen E-Mail-Adresse erforderlich, 
        damit wir wissen, von wem die Anfrage stammt und um diese beantworten zu können. 
        Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO.
      </p>
    </section>
    <section className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
      <h2 className="text-2xl font-semibold text-ea-dark mb-4">3. Cookies und Tracking</h2>
      <p className="text-ea-dark/70 leading-relaxed mb-4">
        Unsere Website verwendet Cookies. Cookies sind kleine Textdateien, die auf Ihrem Endgerät gespeichert werden 
        und die Ihr Browser speichert. Sie dienen dazu, unser Angebot nutzerfreundlicher und effektiver zu gestalten.
      </p>
      <p className="text-ea-dark/70 leading-relaxed">
        Wir verwenden sogenannte „Session-Cookies", die nach Ende Ihres Besuchs automatisch gelöscht werden, 
        sowie technisch notwendige Cookies für die Grundfunktionen der Website. Sie können Ihre Browser-Einstellung 
        entsprechend Ihren Wünschen konfigurieren und z.B. die Annahme von Cookies ablehnen.
      </p>
    </section>
    <section className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
      <h2 className="text-2xl font-semibold text-ea-dark mb-4">4. Newsletter</h2>
      <p className="text-ea-dark/70 leading-relaxed mb-4">
        Mit Ihrer Einwilligung können Sie unseren Newsletter abonnieren, mit dem wir Sie über aktuelle 
        Investment-Chancen und Neuigkeiten informieren. Für die Anmeldung verwenden wir das sog. Double-Opt-In-Verfahren. 
        Die von Ihnen angegebene E-Mail-Adresse wird über den Dienst Brevo (Sendinblue GmbH) verarbeitet.
      </p>
      <p className="text-ea-dark/70 leading-relaxed">
        Sie können den Newsletter jederzeit über den in jeder Newsletter-Mail enthaltenen Abmeldelink 
        oder über unsere <a href="/newsletter/abmelden" className="text-ea-gold hover:underline">Abmeldeseite</a> abbestellen. 
        Rechtsgrundlage ist Ihre Einwilligung gemäß Art. 6 Abs. 1 lit. a DSGVO.
      </p>
    </section>
    <section className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
      <h2 className="text-2xl font-semibold text-ea-dark mb-4">5. Ihre Rechte</h2>
      <p className="text-ea-dark/70 leading-relaxed mb-4">
        Sie haben gegenüber uns folgende Rechte hinsichtlich der Sie betreffenden personenbezogenen Daten:
      </p>
      <ul className="list-disc list-inside text-ea-dark/70 leading-relaxed mb-4 space-y-1">
        <li>Recht auf Auskunft (Art. 15 DSGVO)</li>
        <li>Recht auf Berichtigung (Art. 16 DSGVO)</li>
        <li>Recht auf Löschung (Art. 17 DSGVO)</li>
        <li>Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
        <li>Recht auf Datenübertragbarkeit (Art. 20 DSGVO)</li>
        <li>Recht auf Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)</li>
      </ul>
      <p className="text-ea-dark/70 leading-relaxed">
        Sie haben zudem das Recht, sich bei einer Datenschutz-Aufsichtsbehörde über die Verarbeitung 
        Ihrer personenbezogenen Daten durch uns zu beschweren.
      </p>
    </section>
    <section className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
      <h2 className="text-2xl font-semibold text-ea-dark mb-4">6. Datensicherheit</h2>
      <p className="text-ea-dark/70 leading-relaxed">
        Wir verwenden innerhalb des Website-Besuchs das verbreitete SSL-Verfahren (Secure Socket Layer) 
        in Verbindung mit der jeweils höchsten Verschlüsselungsstufe, die von Ihrem Browser unterstützt wird. 
        Ob eine einzelne Seite unseres Internetauftrittes verschlüsselt übertragen wird, erkennen Sie an der 
        geschlossenen Darstellung des Schlüssel- beziehungsweise Schloss-Symbols in der Statusleiste Ihres Browsers.
      </p>
    </section>
    <section className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
      <h2 className="text-2xl font-semibold text-ea-dark mb-4">7. Aktualität und Änderung dieser Datenschutzerklärung</h2>
      <p className="text-ea-dark/70 leading-relaxed">
        Diese Datenschutzerklärung ist aktuell gültig und hat den Stand April 2026. 
        Durch die Weiterentwicklung unserer Website oder aufgrund geänderter gesetzlicher bzw. behördlicher 
        Vorgaben kann es notwendig werden, diese Datenschutzerklärung zu ändern.
      </p>
    </section>
  </div>
);

export default DatenschutzPage;
