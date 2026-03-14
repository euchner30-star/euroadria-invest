import React from 'react';
import Hero from '../components/Hero';
import { Link } from 'react-router-dom';
import { getFeaturedArticles } from '../data/mockArticles';
import { ArrowRight, Clock } from 'lucide-react';

const Home = () => {
  const featuredArticles = getFeaturedArticles().slice(0, 3);

  return (
    <div className="min-h-screen">
      <Hero />

      {/* Featured Articles Section */}
      <section className="relative py-24 px-6">
        <div className="max-w-7xl mx-auto">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {featuredArticles.map((article) => (
              <Link
                key={article.id}
                to={`/blog/${article.slug}`}
                className="group"
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

          {/* CTA to Blog */}
          <div className="text-center">
            <Link to="/blog" className="btn-gold inline-flex items-center space-x-2 text-lg">
              <span>Alle Artikel ansehen</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Why EuroAdria Section */}
      <section className="relative py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-display font-bold text-white mb-4">
              Warum <span className="text-gold">EuroAdria</span>?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Expertise',
                description: 'Über 15 Jahre Erfahrung in Balkan-Investments mit tiefem Marktverständnis und lokalen Partnernetzwerken.'
              },
              {
                title: 'Exklusivität',
                description: 'Zugang zu Off-Market-Deals und Premium-Properties, die der breiten Masse nicht zugänglich sind.'
              },
              {
                title: 'Vertrauen',
                description: 'Vollständige Transparenz, lückenlose Due Diligence und persönliche Betreuung während des gesamten Prozesses.'
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="glass-card-hover p-8 text-center"
              >
                <h3 className="text-2xl font-bold text-gold mb-4">{feature.title}</h3>
                <p className="text-white/70 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
