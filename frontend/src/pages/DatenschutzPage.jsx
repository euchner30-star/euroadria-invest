import React from 'react';
import { Shield, Mail, Phone, Database, Cookie, Lock, FileText } from 'lucide-react';

const DatenschutzPage = () => {
  return (
    <div className="min-h-screen pt-32 pb-20" data-testid="datenschutz-page">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl md:text-5xl text-white mb-4">
            Datenschutzerklärung
          </h1>
          <div className="w-24 h-1 bg-gold mx-auto"></div>
        </div>

        {/* Main Content Card */}
        <div className="glass-card p-8 md:p-12 rounded-2xl space-y-10">
          
          {/* 1. Verantwortliche Stelle */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-6 h-6 text-gold" />
              <h2 className="text-2xl font-semibold text-white">1. Verantwortliche Stelle</h2>
            </div>
            
            <div className="bg-white/5 rounded-xl p-6 space-y-4">
              <p className="text-white/80">
                Verantwortlich für die Verarbeitung personenbezogener Daten auf dieser Website ist:
              </p>
              <div className="border-l-2 border-gold pl-4">
                <p className="text-white/90 font-medium">EuroAdria</p>
                <p className="text-white/70">
                  Montaris & Co. d.o.o. Novi Sad<br />
                  NOVI SAD, MARKA MILJANOVA 12<br />
                  NOVI SAD, Serbien
                </p>
              </div>
              
              <div className="flex flex-wrap gap-6 pt-4">
                <a href="tel:+38268559776" className="flex items-center gap-2 text-white/70 hover:text-gold transition-colors">
                  <Phone className="w-5 h-5 text-gold" />
                  <span>+382 68 559 776</span>
                </a>
                <a href="mailto:office@euroadria.me" className="flex items-center gap-2 text-white/70 hover:text-gold transition-colors">
                  <Mail className="w-5 h-5 text-gold" />
                  <span>office@euroadria.me</span>
                </a>
              </div>
            </div>
          </section>

          {/* 2. Erhebung und Speicherung */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Database className="w-6 h-6 text-gold" />
              <h2 className="text-2xl font-semibold text-white">2. Erhebung und Speicherung personenbezogener Daten</h2>
            </div>
            
            <div className="space-y-6">
              {/* a) Beim Besuch der Website */}
              <div className="bg-white/5 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gold mb-4">a) Beim Besuch der Website</h3>
                <p className="text-white/70 mb-4">
                  Beim Aufrufen unserer Website werden durch den auf Ihrem Endgerät zum Einsatz 
                  kommenden Browser automatisch Informationen an den Server unserer Website gesendet. 
                  Diese Informationen werden temporär in einem sogenannten Logfile gespeichert:
                </p>
                <ul className="list-disc list-inside text-white/70 space-y-1 mb-4">
                  <li>IP-Adresse des anfragenden Rechners</li>
                  <li>Datum und Uhrzeit des Zugriffs</li>
                  <li>Name und URL der abgerufenen Datei</li>
                  <li>Website, von der aus der Zugriff erfolgt (Referrer-URL)</li>
                  <li>Verwendeter Browser und ggf. das Betriebssystem Ihres Rechners sowie der Name Ihres Access-Providers</li>
                </ul>
                <p className="text-white/70 mb-2">Die genannten Daten werden zu folgenden Zwecken verarbeitet:</p>
                <ul className="list-disc list-inside text-white/70 space-y-1">
                  <li>Sicherstellung eines reibungslosen Verbindungsaufbaus</li>
                  <li>Gewährleistung einer komfortablen Nutzung unserer Website</li>
                  <li>Auswertung der Systemsicherheit und -stabilität</li>
                  <li>Weitere administrative Zwecke</li>
                </ul>
                <p className="text-white/60 text-sm mt-4 italic">
                  Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO.
                </p>
              </div>

              {/* b) Kontaktaufnahme */}
              <div className="bg-white/5 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gold mb-4">b) Kontaktaufnahme</h3>
                <p className="text-white/70">
                  Wenn Sie uns über ein Formular oder per E-Mail kontaktieren, verarbeiten wir die von 
                  Ihnen angegebenen personenbezogenen Daten (z. B. Name, E-Mail-Adresse, Nachrichtentext), 
                  um Ihre Anfrage zu bearbeiten.
                </p>
                <p className="text-white/60 text-sm mt-4 italic">
                  Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO.
                </p>
              </div>

              {/* c) Newsletter */}
              <div className="bg-white/5 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gold mb-4">c) Newsletter</h3>
                <p className="text-white/70">
                  Sofern Sie unseren Newsletter abonnieren, verarbeiten wir Ihre E-Mail-Adresse 
                  ausschließlich für den Versand des Newsletters. Ein Widerruf ist jederzeit möglich.
                </p>
                <p className="text-white/60 text-sm mt-4 italic">
                  Rechtsgrundlage ist Ihre Einwilligung (Art. 6 Abs. 1 lit. a DSGVO).
                </p>
              </div>

              {/* d) YouTube und Social Media */}
              <div className="bg-white/5 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gold mb-4">d) YouTube und Social Media</h3>
                <p className="text-white/70">
                  Unsere Website kann Links oder eingebettete Inhalte (z. B. Videos) von YouTube und 
                  anderen sozialen Netzwerken enthalten. Mit deren Aufruf gelten die 
                  Datenschutzrichtlinien der jeweiligen Anbieter.
                </p>
              </div>
            </div>
          </section>

          {/* 3. Weitergabe von Daten */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-6">3. Weitergabe von Daten</h2>
            <div className="bg-white/5 rounded-xl p-6">
              <p className="text-white/70 mb-4">
                Eine Übermittlung Ihrer Daten an Dritte erfolgt nur, wenn:
              </p>
              <ul className="list-disc list-inside text-white/70 space-y-2">
                <li>Sie Ihre ausdrückliche Einwilligung erteilt haben (Art. 6 Abs. 1 lit. a DSGVO)</li>
                <li>Dies zur Erfüllung vertraglicher Verpflichtungen erforderlich ist (Art. 6 Abs. 1 lit. b DSGVO)</li>
                <li>Eine rechtliche Verpflichtung besteht (Art. 6 Abs. 1 lit. c DSGVO)</li>
                <li>Dies zur Wahrung berechtigter Interessen erforderlich ist (Art. 6 Abs. 1 lit. f DSGVO)</li>
              </ul>
            </div>
          </section>

          {/* 4. Cookies und Tracking */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Cookie className="w-6 h-6 text-gold" />
              <h2 className="text-2xl font-semibold text-white">4. Cookies und Tracking</h2>
            </div>
            <div className="bg-white/5 rounded-xl p-6">
              <p className="text-white/70 mb-4">
                Unsere Website verwendet Cookies, um die Benutzerfreundlichkeit zu verbessern. 
                Über den Cookie-Banner können Sie der Nutzung zustimmen oder diese ablehnen.
              </p>
              <p className="text-white/70">
                Wir behalten uns vor, Web-Analyse-Dienste (z. B. Google Analytics) einzusetzen. 
                In diesem Fall erfolgt eine gesonderte Information.
              </p>
            </div>
          </section>

          {/* 5. Ihre Rechte */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-6 h-6 text-gold" />
              <h2 className="text-2xl font-semibold text-white">5. Ihre Rechte</h2>
            </div>
            <div className="bg-gold/10 border border-gold/30 rounded-xl p-6">
              <p className="text-white/80 mb-4">Sie haben das Recht:</p>
              <ul className="space-y-3 text-white/70">
                <li className="flex items-start gap-2">
                  <span className="text-gold">•</span>
                  <span>Auskunft über Ihre verarbeiteten Daten zu verlangen (Art. 15 DSGVO)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gold">•</span>
                  <span>Berichtigung unrichtiger Daten zu verlangen (Art. 16 DSGVO)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gold">•</span>
                  <span>Löschung Ihrer Daten zu verlangen (Art. 17 DSGVO)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gold">•</span>
                  <span>Einschränkung der Verarbeitung zu verlangen (Art. 18 DSGVO)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gold">•</span>
                  <span>Datenübertragbarkeit zu verlangen (Art. 20 DSGVO)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gold">•</span>
                  <span>Widerspruch gegen die Verarbeitung einzulegen (Art. 21 DSGVO)</span>
                </li>
              </ul>
              <p className="text-white/60 text-sm mt-4">
                Anfragen hierzu richten Sie bitte an die oben genannte verantwortliche Stelle.
              </p>
            </div>
          </section>

          {/* 6. Datensicherheit */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Lock className="w-6 h-6 text-gold" />
              <h2 className="text-2xl font-semibold text-white">6. Datensicherheit</h2>
            </div>
            <p className="text-white/70 leading-relaxed">
              Wir setzen technische und organisatorische Sicherheitsmaßnahmen ein, um Ihre Daten 
              gegen Manipulation, Verlust oder unbefugten Zugriff zu schützen.
            </p>
          </section>

          {/* 7. Aktualität */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-6">7. Aktualität der Datenschutzerklärung</h2>
            <div className="bg-white/5 rounded-xl p-6">
              <p className="text-white/70">
                Diese Datenschutzerklärung ist aktuell gültig und hat den Stand <strong className="text-gold">August 2025</strong>.
              </p>
              <p className="text-white/70 mt-4">
                Wir behalten uns vor, diese Erklärung bei Bedarf zu ändern, um sie rechtlichen 
                Vorgaben oder technischen Entwicklungen anzupassen.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default DatenschutzPage;
