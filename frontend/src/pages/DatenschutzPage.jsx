import React, { useEffect } from 'react';
import { Shield, Mail, Phone, Database, Cookie, Lock, FileText } from 'lucide-react';
import SEO from '../components/SEO';

const DatenschutzPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen pt-28 pb-20 bg-white" data-testid="datenschutz-page">
      <SEO 
        title="Datenschutzerklärung"
        description="Datenschutzerklärung der EuroAdria. Informationen zum Umgang mit Ihren personenbezogenen Daten gemäß DSGVO."
        url="/datenschutz"
      />
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16 animate-fadeIn">
          <p className="text-[#3eb489] text-sm font-semibold tracking-wider uppercase mb-4">Rechtliches</p>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-gray-900 mb-6">
            Datenschutzerklärung
          </h1>
          <div className="section-divider"></div>
        </div>

        {/* Main Content */}
        <div className="space-y-6 animate-slideUp">
          
          {/* 1. Verantwortliche Stelle */}
          <section className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-xl bg-[#3eb489]/10 flex items-center justify-center">
                <Shield className="w-7 h-7 text-[#3eb489]" />
              </div>
              <h2 className="text-2xl font-display font-bold text-gray-900">1. Verantwortliche Stelle</h2>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6 space-y-4">
              <p className="text-gray-700 leading-relaxed">
                Verantwortlich für die Verarbeitung personenbezogener Daten auf dieser Website ist:
              </p>
              <div className="border-l-4 border-[#3eb489] pl-4">
                <p className="text-gray-900 font-semibold mb-1">EuroAdria</p>
                <p className="text-gray-600 leading-relaxed">
                  Montaris & Co. d.o.o. Novi Sad<br />
                  NOVI SAD, MARKA MILJANOVA 12<br />
                  NOVI SAD, Serbien
                </p>
              </div>
              
              <div className="flex flex-wrap gap-6 pt-4">
                <a href="tel:+38268559776" className="flex items-center gap-2 text-gray-600 hover:text-[#3eb489] transition-colors group">
                  <Phone className="w-5 h-5 text-[#3eb489] group-hover:scale-110 transition-transform" />
                  <span>+382 68 559 776</span>
                </a>
                <a href="mailto:office@euroadria.me" className="flex items-center gap-2 text-gray-600 hover:text-[#3eb489] transition-colors group">
                  <Mail className="w-5 h-5 text-[#3eb489] group-hover:scale-110 transition-transform" />
                  <span>office@euroadria.me</span>
                </a>
              </div>
            </div>
          </section>

          {/* 2. Erhebung und Speicherung */}
          <section className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-xl bg-[#3eb489]/10 flex items-center justify-center">
                <Database className="w-7 h-7 text-[#3eb489]" />
              </div>
              <h2 className="text-2xl font-display font-bold text-gray-900">2. Erhebung und Speicherung personenbezogener Daten</h2>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-[#3eb489] mb-4">a) Beim Besuch der Website</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  Beim Aufrufen unserer Website werden durch den auf Ihrem Endgerät zum Einsatz 
                  kommenden Browser automatisch Informationen an den Server unserer Website gesendet.
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4 pl-2">
                  <li>IP-Adresse des anfragenden Rechners</li>
                  <li>Datum und Uhrzeit des Zugriffs</li>
                  <li>Name und URL der abgerufenen Datei</li>
                  <li>Website, von der aus der Zugriff erfolgt (Referrer-URL)</li>
                  <li>Verwendeter Browser und Betriebssystem</li>
                </ul>
                <p className="text-gray-500 text-sm italic">
                  Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO.
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-[#3eb489] mb-4">b) Kontaktaufnahme</h3>
                <p className="text-gray-600 leading-relaxed">
                  Wenn Sie uns über ein Formular oder per E-Mail kontaktieren, verarbeiten wir die von 
                  Ihnen angegebenen personenbezogenen Daten, um Ihre Anfrage zu bearbeiten.
                </p>
                <p className="text-gray-500 text-sm mt-4 italic">
                  Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO.
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-[#3eb489] mb-4">c) Newsletter</h3>
                <p className="text-gray-600 leading-relaxed">
                  Sofern Sie unseren Newsletter abonnieren, verarbeiten wir Ihre E-Mail-Adresse 
                  ausschließlich für den Versand des Newsletters. Ein Widerruf ist jederzeit möglich.
                </p>
                <p className="text-gray-500 text-sm mt-4 italic">
                  Rechtsgrundlage ist Ihre Einwilligung (Art. 6 Abs. 1 lit. a DSGVO).
                </p>
              </div>
            </div>
          </section>

          {/* 3. Weitergabe von Daten */}
          <section className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-6">3. Weitergabe von Daten</h2>
            <div className="bg-gray-50 rounded-xl p-6">
              <p className="text-gray-600 mb-4 leading-relaxed">
                Eine Übermittlung Ihrer Daten an Dritte erfolgt nur, wenn:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 pl-2">
                <li>Sie Ihre ausdrückliche Einwilligung erteilt haben</li>
                <li>Dies zur Erfüllung vertraglicher Verpflichtungen erforderlich ist</li>
                <li>Eine rechtliche Verpflichtung besteht</li>
                <li>Dies zur Wahrung berechtigter Interessen erforderlich ist</li>
              </ul>
            </div>
          </section>

          {/* 4. Cookies */}
          <section className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-xl bg-[#3eb489]/10 flex items-center justify-center">
                <Cookie className="w-7 h-7 text-[#3eb489]" />
              </div>
              <h2 className="text-2xl font-display font-bold text-gray-900">4. Cookies und Tracking</h2>
            </div>
            <div className="bg-gray-50 rounded-xl p-6">
              <p className="text-gray-600 mb-4 leading-relaxed">
                Unsere Website verwendet Cookies, um die Benutzerfreundlichkeit zu verbessern. 
                Über den Cookie-Banner können Sie der Nutzung zustimmen oder diese ablehnen.
              </p>
            </div>
          </section>

          {/* 5. Ihre Rechte */}
          <section className="bg-[#3eb489]/5 border border-[#3eb489]/20 rounded-2xl p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-xl bg-[#3eb489]/15 flex items-center justify-center">
                <FileText className="w-7 h-7 text-[#3eb489]" />
              </div>
              <h2 className="text-2xl font-display font-bold text-gray-900">5. Ihre Rechte</h2>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">Sie haben das Recht:</p>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-[#3eb489] mt-2 flex-shrink-0"></span>
                <span>Auskunft über Ihre verarbeiteten Daten zu verlangen (Art. 15 DSGVO)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-[#3eb489] mt-2 flex-shrink-0"></span>
                <span>Berichtigung unrichtiger Daten zu verlangen (Art. 16 DSGVO)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-[#3eb489] mt-2 flex-shrink-0"></span>
                <span>Löschung Ihrer Daten zu verlangen (Art. 17 DSGVO)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-[#3eb489] mt-2 flex-shrink-0"></span>
                <span>Einschränkung der Verarbeitung zu verlangen (Art. 18 DSGVO)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-[#3eb489] mt-2 flex-shrink-0"></span>
                <span>Datenübertragbarkeit zu verlangen (Art. 20 DSGVO)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-[#3eb489] mt-2 flex-shrink-0"></span>
                <span>Widerspruch gegen die Verarbeitung einzulegen (Art. 21 DSGVO)</span>
              </li>
            </ul>
          </section>

          {/* 6. Datensicherheit */}
          <section className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-xl bg-[#3eb489]/10 flex items-center justify-center">
                <Lock className="w-7 h-7 text-[#3eb489]" />
              </div>
              <h2 className="text-2xl font-display font-bold text-gray-900">6. Datensicherheit</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Wir setzen technische und organisatorische Sicherheitsmaßnahmen ein, um Ihre Daten 
              gegen Manipulation, Verlust oder unbefugten Zugriff zu schützen.
            </p>
          </section>

          {/* 7. Aktualität */}
          <section className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-6">7. Aktualität der Datenschutzerklärung</h2>
            <div className="bg-gray-50 rounded-xl p-6">
              <p className="text-gray-600 leading-relaxed">
                Diese Datenschutzerklärung ist aktuell gültig und hat den Stand <strong className="text-[#3eb489]">März 2026</strong>.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default DatenschutzPage;
