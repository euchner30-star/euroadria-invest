import React, { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import TeamSection from '../components/TeamSection';
import { LeadMagnetBox } from '../components/ArticleComponents';
import { Link } from 'react-router-dom';
import { articlesApi } from '../services/api';
import { ArrowRight, Clock, Shield, TrendingUp, Award, Loader2 } from 'lucide-react';
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
    <div className="min-h-screen">
      <SEO 
        title="Investment & Business Beratung für Adria & Balkan"
        description="Premium Investment & Lifestyle Partner für die Adria-Region. Exklusive Beratung für DACH-Investoren: Immobilien, Unternehmensgründung, Relocation nach Montenegro, Serbien & Kroatien."
        url="/"
      />
      <Hero />

      {/* Balkan vs EU Section - Prominent */}
      <section className="section-spacing relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="glass-card-strong p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-block glass-card text-sm text-gold px-4 py-2 mb-4 font-medium">
                  Alpha-Potenzial
                </div>
                <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
                  Warum <span className="text-gold">Balkan</span> statt EU?
                </h2>
                <p className="text-white/80 text-lg leading-relaxed mb-6">
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
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center mt-1">
                        <span className="text-gold text-xs font-bold">✓</span>
                      </div>
                      <span className="text-white/70">{point}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/blog/balkans-vs-eu-investing-reality-check" className="btn-gold inline-flex items-center space-x-2">
                  <span>Komplette Analyse lesen</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1517048676732-d65bc937f952"
                  alt="Balkan vs EU Investment"
                  className="rounded-xl shadow-2xl"
                />
                <div className="absolute -bottom-6 -left-6 glass-card p-6 max-w-xs">
                  <div className="text-3xl font-bold text-gold mb-2">60-80%</div>
                  <div className="text-white/80 text-sm">
                    Wertsteigerung in Montenegro nach EU-Beitritt (Croatia-Effect 2013)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Articles Section */}
      <section className="section-spacing relative">
        <div className="max-w-7xl mx-auto px-6">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-display font-bold text-white mb-4 hover-glow">
              Aktuelle <span className="text-gold">Insights</span>
            </h2>
            <p className="text-white/70 text-lg max-w-2xl mx-auto">
              Exklusive Analysen, Marktberichte und Investment-Strategien für die Adria-Region
            </p>
          </div>

          {/* Featured Articles Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="w-10 h-10 text-gold animate-spin" />
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
                  <article className="glass-card-hover h-full overflow-hidden">
                    {/* Article Image */}
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute top-4 left-4">
                        <span className="glass-card text-xs text-white px-3 py-1.5 font-medium">
                          {article.category}
                        </span>
                      </div>
                    </div>

                    {/* Article Content */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-white mb-3 group-hover:text-gold transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-white/70 text-sm leading-relaxed mb-4 line-clamp-3">
                        {article.excerpt}
                      </p>

                      {/* Meta Info */}
                      <div className="flex items-center justify-between text-xs text-white/50">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4" />
                          <span>{article.readTime}</span>
                        </div>
                        <span className="group-hover:text-gold transition-colors flex items-center space-x-1">
                          <span>Weiterlesen</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}

          {/* CTA to Blog */}
          <div className="text-center">
            <Link to="/blog" className="btn-gold inline-flex items-center space-x-2 text-lg">
              <span>Alle Artikel ansehen</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Lead Magnet Section */}
      <section className="section-spacing relative">
        <div className="max-w-4xl mx-auto px-6">
          <LeadMagnetBox />
        </div>
      </section>

      {/* Why EuroAdria Section */}
      <section className="section-spacing relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-display font-bold text-white mb-4">
              Warum <span className="text-gold">EuroAdria</span>?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: 'Forensische Due Diligence',
                description: 'Wir prüfen Eigentumsketten bis 1945, schließen Restitutionsrisiken aus und stellen Bankability sicher. Keine versteckten Überraschungen.'
              },
              {
                icon: TrendingUp,
                title: 'Off-Market Access',
                description: 'Zugang zu Deals, die nie öffentlich werden. Familienbesitz, Restitutionsfälle, distressed Assets – hier liegt das wahre Alpha.'
              },
              {
                icon: Award,
                title: 'Keine Interessenskonflikte',
                description: 'Wir sind keine Makler. Unsere Task Force arbeitet ausschließlich für Ihre Interessen – nur wenn der Deal sicher ist, sind wir erfolgreich.'
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="glass-card-hover p-8 text-center"
              >
                <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="w-8 h-8 text-gold" />
                </div>
                <h3 className="text-2xl font-bold text-gold mb-4">{feature.title}</h3>
                <p className="text-white/70 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <TeamSection />
    </div>
  );
};

export default Home;