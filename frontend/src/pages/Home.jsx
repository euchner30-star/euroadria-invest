import React, { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import { Link } from 'react-router-dom';
import { articlesApi } from '../services/api';
import { ArrowRight, Clock, Shield, TrendingUp, Award, Loader2, CheckCircle } from 'lucide-react';
import SEO from '../components/SEO';

const Home = () => {
  const [featuredArticles, setFeaturedArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const data = await articlesApi.getFeatured(3);
        setFeaturedArticles(data);
      } catch (err) {
        console.error('Failed to fetch featured articles:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <SEO 
        title="Investment & Business Beratung für Adria & Balkan"
        description="Premium Investment & Lifestyle Partner für die Adria-Region. Exklusive Beratung für DACH-Investoren."
        url="/"
      />
      <Hero />

      {/* Welcome Section - wie euroadria.me */}
      <section className="py-8 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <span className="text-ea-dark font-semibold text-lg">EuroAdria Corporate Solutions</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-ea-dark/70">
              <a href="https://wa.me/38268559776" className="flex items-center gap-2 hover:text-ea-gold transition-colors">
                <span>+382 68 559 776</span>
                <span className="text-xs text-ea-dark/50">WhatsApp</span>
              </a>
              <a href="mailto:office@euroadria.me" className="flex items-center gap-2 hover:text-ea-gold transition-colors">
                <span>office@euroadria.me</span>
                <span className="text-xs text-ea-dark/50">Ihr direkter Draht ins Office</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Balkan vs EU Section - mit korrekten Farben */}
      <section className="py-20 bg-ea-light">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-8 md:p-12 shadow-sm">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-block bg-ea-gold/10 border border-ea-gold/30 text-sm text-ea-dark px-4 py-2 rounded-full mb-4 font-medium">
                  Alpha-Potenzial
                </div>
                <h2 className="text-3xl md:text-4xl font-semibold text-ea-dark mb-6 leading-tight">
                  Warum <span className="text-ea-gold">Balkan</span> statt EU?
                </h2>
                <p className="text-ea-dark/70 text-lg leading-relaxed mb-6">
                  Während EU-Märkte Stabilität bei komprimierten Renditen bieten (4-6%), 
                  lockt der Balkan mit strukturierten Wachstumsinvestments und zweistelligen Zielrenditen.
                </p>
                <ul className="space-y-4 mb-8">
                  {[
                    'Konvergenz-Arbitrage vor EU-Beitritt (Montenegro 2028)',
                    'Forensische Due Diligence statt Spekulation',
                    'Bankability nach internationalen Standards',
                    'Off-Market Access durch lokales Netzwerk'
                  ].map((point, idx) => (
                    <li key={idx} className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-ea-gold flex-shrink-0 mt-0.5" />
                      <span className="text-ea-dark/70">{point}</span>
                    </li>
                  ))}
                </ul>
                <Link 
                  to="/blog" 
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-ea-dark text-white font-semibold rounded-lg hover:bg-ea-navy transition-all"
                  data-testid="balkan-section-cta"
                >
                  <span>Komplette Analyse lesen</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1517048676732-d65bc937f952"
                  alt="Balkan vs EU Investment"
                  className="rounded-xl shadow-lg"
                />
                <div className="absolute -bottom-6 -left-6 bg-white border border-gray-200 rounded-xl p-6 shadow-lg max-w-xs">
                  <div className="text-3xl font-bold text-ea-gold mb-2">60-80%</div>
                  <div className="text-ea-dark/70 text-sm">
                    Wertsteigerung in Montenegro nach EU-Beitritt
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Articles */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-semibold text-ea-dark mb-4">
              Aktuelle <span className="text-ea-gold">Insights</span>
            </h2>
            <p className="text-ea-dark/70 text-lg max-w-2xl mx-auto">
              Exklusive Analysen, Marktberichte und Investment-Strategien für die Adria-Region
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="w-10 h-10 text-ea-gold animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {featuredArticles.map((article) => (
                <Link
                  key={article.id}
                  to={`/blog/${article.slug}`}
                  className="group"
                  data-testid={`featured-article-${article.slug}`}
                >
                  <article className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="bg-white/90 backdrop-blur-sm text-xs text-ea-dark px-3 py-1.5 rounded-full font-medium">
                          {article.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center space-x-2 text-xs text-ea-dark/50 mb-3">
                        <Clock className="w-3 h-3" />
                        <span>{article.readTime}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-ea-dark mb-2 group-hover:text-ea-gold transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-ea-dark/70 text-sm line-clamp-2 mb-4">
                        {article.excerpt}
                      </p>
                      <div className="flex items-center text-ea-gold text-sm font-medium">
                        <span>Weiterlesen</span>
                        <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}

          <div className="text-center">
            <Link
              to="/blog"
              className="inline-flex items-center space-x-2 px-8 py-4 bg-ea-dark text-white font-semibold rounded-lg hover:bg-ea-navy transition-all"
              data-testid="view-all-articles-button"
            >
              <span>Alle Artikel ansehen</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-16 bg-ea-light border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Shield, title: 'Vertrauenswürdig', desc: 'Geprüfte Due Diligence' },
              { icon: TrendingUp, title: 'Rendite-Fokus', desc: 'Zweistellige Zielrenditen' },
              { icon: Award, title: 'Expertise', desc: '15+ Jahre Erfahrung' },
              { icon: Shield, title: 'Sicherheit', desc: 'Asset Protection' }
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="w-14 h-14 bg-ea-gold/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-7 h-7 text-ea-gold" />
                </div>
                <h3 className="text-ea-dark font-semibold mb-1">{item.title}</h3>
                <p className="text-ea-dark/50 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Section - wie euroadria.me */}
      <section className="py-20 bg-ea-dark relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1554155845-440a0ec58d3b)'
          }}
        />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <div className="flex justify-center mb-6">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-6 h-6 text-ea-gold" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.746,1.464l3.11,6.3L22.81,8.776a.831.831,0,0,1,.461,1.418l-5.033,4.9,1.188,6.926a.832.832,0,0,1-1.207.877L12,19.632,5.78,22.9a.833.833,0,0,1-1.207-.878L5.761,15.1l-5.033-4.9a.831.831,0,0,1,.461-1.418L8.143,7.765l3.11-6.3A.833.833,0,0,1,12.746,1.464Z"/>
              </svg>
            ))}
          </div>
          <blockquote className="text-xl md:text-2xl text-ea-light font-semibold leading-relaxed mb-6">
            „Dank EuroAdria konnte ich meine Firmengründung in Montenegro schnell, sicher und komplett stressfrei umsetzen. Ich habe mich bestens betreut gefühlt und kann EuroAdria jedem Unternehmer und Investor wärmstens empfehlen."
          </blockquote>
          <p className="text-ea-light/70">
            Maximilian R., Unternehmer aus Deutschland
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-semibold text-ea-dark mb-6">
            Bereit für Ihre <span className="text-ea-gold">Investition</span>?
          </h2>
          <p className="text-ea-dark/70 text-lg mb-8 max-w-2xl mx-auto">
            Vereinbaren Sie ein unverbindliches Erstgespräch mit unseren Experten und 
            entdecken Sie die Möglichkeiten am Balkan.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/contact"
              className="px-8 py-4 bg-ea-dark text-white font-semibold rounded-lg hover:bg-ea-navy transition-all"
              data-testid="cta-consultation-button"
            >
              Kostenlose Beratung anfragen
            </Link>
            <Link
              to="/serbia-executive"
              className="px-8 py-4 bg-ea-gold text-ea-dark font-semibold rounded-lg hover:bg-ea-gold/80 transition-all flex items-center gap-2"
              data-testid="cta-serbia-button"
            >
              <Shield className="w-5 h-5" />
              Serbia Executive Access
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
