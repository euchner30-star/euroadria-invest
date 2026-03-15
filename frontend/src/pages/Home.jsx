import React, { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import TeamSection from '../components/TeamSection';
import { LeadMagnetBox } from '../components/ArticleComponents';
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

      {/* Balkan vs EU Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-8 md:p-12 shadow-sm">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-block bg-[#3eb489]/10 border border-[#3eb489]/30 text-sm text-[#3eb489] px-4 py-2 rounded-full mb-4 font-medium">
                  Alpha-Potenzial
                </div>
                <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-6">
                  Warum <span className="text-[#3eb489]">Balkan</span> statt EU?
                </h2>
                <p className="text-gray-600 text-lg leading-relaxed mb-6">
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
                      <CheckCircle className="w-5 h-5 text-[#3eb489] flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">{point}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/blog/balkans-vs-eu-investing-reality-check" className="inline-flex items-center space-x-2 px-6 py-3 bg-[#3eb489] text-white font-semibold rounded-lg hover:bg-[#35a07a] transition-all">
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
                  <div className="text-3xl font-bold text-[#3eb489] mb-2">60-80%</div>
                  <div className="text-gray-600 text-sm">
                    Wertsteigerung in Montenegro nach EU-Beitritt
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Articles */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-4">
              Aktuelle <span className="text-[#3eb489]">Insights</span>
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Exklusive Analysen, Marktberichte und Investment-Strategien für die Adria-Region
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="w-10 h-10 text-[#3eb489] animate-spin" />
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
                        <span className="bg-white/90 backdrop-blur-sm text-xs text-gray-700 px-3 py-1.5 rounded-full font-medium">
                          {article.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center space-x-2 text-xs text-gray-500 mb-3">
                        <Clock className="w-3 h-3" />
                        <span>{article.readTime}</span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#3eb489] transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                        {article.excerpt}
                      </p>
                      <div className="flex items-center text-[#3eb489] text-sm font-medium">
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
              className="inline-flex items-center space-x-2 px-8 py-4 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-all"
            >
              <span>Alle Artikel ansehen</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-16 bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Shield, title: 'Vertrauenswürdig', desc: 'Geprüfte Due Diligence' },
              { icon: TrendingUp, title: 'Rendite-Fokus', desc: 'Zweistellige Zielrenditen' },
              { icon: Award, title: 'Expertise', desc: '15+ Jahre Erfahrung' },
              { icon: Shield, title: 'Sicherheit', desc: 'Asset Protection' }
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="w-14 h-14 bg-[#3eb489]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-7 h-7 text-[#3eb489]" />
                </div>
                <h3 className="text-gray-900 font-semibold mb-1">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-display font-bold text-gray-900 mb-6">
            Bereit für Ihre <span className="text-[#3eb489]">Investition</span>?
          </h2>
          <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
            Vereinbaren Sie ein unverbindliches Erstgespräch mit unseren Experten und 
            entdecken Sie die Möglichkeiten am Balkan.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/contact"
              className="px-8 py-4 bg-[#3eb489] text-white font-semibold rounded-lg hover:bg-[#35a07a] transition-all"
            >
              Kostenlose Beratung anfragen
            </Link>
            <Link
              to="/serbia-executive"
              className="px-8 py-4 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-all flex items-center gap-2"
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
