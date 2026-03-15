import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { articlesApi } from '../services/api';
import { themeClusters } from '../data/clusters';
import { Clock, ArrowRight, Search, Loader2 } from 'lucide-react';

const BlogPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCluster, setSelectedCluster] = useState('All');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const data = await articlesApi.getAll();
        setArticles(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch articles:', err);
        setError('Artikel konnten nicht geladen werden.');
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  const featuredArticles = articles.filter(a => a.featured);
  const allArticles = articles;

  // Filter articles
  const filteredArticles = allArticles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          article.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCluster = selectedCluster === 'All' || article.cluster === selectedCluster;
    return matchesSearch && matchesCluster;
  });

  return (
    <div className="min-h-screen pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-16">
          <h1 className="text-6xl md:text-7xl font-display font-bold text-white mb-6 hover-glow">
            EuroAdria <span className="text-gold">Insights</span>
          </h1>
          <p className="text-white/70 text-xl max-w-3xl mx-auto">
            Tiefgehende Analysen, Marktberichte und praktische Guides für erfolgreiche Investments an der Adria
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-10 h-10 text-gold animate-spin" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="glass-card p-8 text-center mb-12">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Theme Clusters Navigation */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-6">Themen-Cluster</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
                <button
                  onClick={() => setSelectedCluster('All')}
                  data-testid="cluster-filter-all"
                  className={`p-4 rounded-lg text-center transition-all ${
                    selectedCluster === 'All'
                      ? 'bg-gold text-navy font-semibold'
                      : 'glass-card text-white hover:border-gold/30'
                  }`}
                >
                  <div className="font-medium">Alle</div>
                  <div className="text-xs mt-1 opacity-80">{allArticles.length} Artikel</div>
                </button>
                {themeClusters.map((cluster) => {
                  const count = allArticles.filter(a => a.cluster === cluster.id).length;
                  return (
                    <button
                      key={cluster.id}
                      onClick={() => setSelectedCluster(cluster.id)}
                      data-testid={`cluster-filter-${cluster.id}`}
                      className={`p-4 rounded-lg text-center transition-all ${
                        selectedCluster === cluster.id
                          ? 'bg-gold text-navy font-semibold'
                          : 'glass-card text-white hover:border-gold/30'
                      }`}
                    >
                      <div className="font-medium text-sm">{cluster.name}</div>
                      <div className="text-xs mt-1 opacity-80">{count} Artikel</div>
                    </button>
                  );
                })}
              </div>
            </div>

        {/* Search Bar */}
        <div className="glass-card p-6 mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
            <input
              type="text"
              placeholder="Artikel durchsuchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-12 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-gold/50 transition-all"
            />
          </div>
        </div>

        {/* Featured Articles Section */}
        {selectedCluster === 'All' && !searchTerm && (
          <div className="mb-20">
            <h2 className="text-4xl font-display font-bold text-white mb-8">
              Featured <span className="text-gold">Articles</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredArticles.map((article) => (
                <Link
                  key={article.id}
                  to={`/blog/${article.slug}`}
                  className="group"
                >
                  <article className="glass-card-hover h-full overflow-hidden">
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
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-white mb-3 group-hover:text-gold transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-white/70 text-sm leading-relaxed mb-4 line-clamp-3">
                        {article.excerpt}
                      </p>
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
          </div>
        )}

        {/* All Articles List */}
        <div>
          <h2 className="text-4xl font-display font-bold text-white mb-8">
            {selectedCluster !== 'All' 
              ? `${themeClusters.find(c => c.id === selectedCluster)?.name} Artikel`
              : 'Alle Artikel'
            }
          </h2>

          {filteredArticles.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <p className="text-white/70 text-lg">Keine Artikel gefunden. Versuchen Sie einen anderen Suchbegriff.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredArticles.map((article) => (
                <Link
                  key={article.id}
                  to={`/blog/${article.slug}`}
                  className="block group"
                >
                  <article className="glass-card-hover p-6 flex flex-col md:flex-row gap-6">
                    {/* Article Image */}
                    <div className="w-full md:w-48 h-32 flex-shrink-0 rounded-lg overflow-hidden">
                      <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>

                    {/* Article Content */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-xs text-gold font-medium">{article.category}</span>
                        <span className="text-white/30">•</span>
                        <span className="text-xs text-white/50">{article.date}</span>
                        <span className="text-white/30">•</span>
                        <div className="flex items-center space-x-1 text-xs text-white/50">
                          <Clock className="w-3 h-3" />
                          <span>{article.readTime}</span>
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-gold transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-white/70 text-sm leading-relaxed line-clamp-2">
                        {article.excerpt}
                      </p>
                    </div>

                    {/* Arrow */}
                    <div className="flex items-center">
                      <ArrowRight className="w-6 h-6 text-gold opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </div>
        </>
        )}
      </div>
    </div>
  );
};

export default BlogPage;