import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { articlesApi } from '../services/api';
import { themeClusters } from '../data/clusters';
import { Clock, ArrowRight, Search, Loader2, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import SEO from '../components/SEO';

const BlogPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCluster, setSelectedCluster] = useState('All');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isListExpanded, setIsListExpanded] = useState(false);

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

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          article.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCluster = selectedCluster === 'All' || article.cluster === selectedCluster;
    return matchesSearch && matchesCluster;
  });

  // Split articles: first 12 as cards, rest as list
  const featuredArticles = filteredArticles.slice(0, 12);
  const listArticles = filteredArticles.slice(12);

  return (
    <div className="min-h-screen pt-28 pb-20 px-6 bg-white">
      <SEO 
        title="Blog & Insights"
        description="Tiefgehende Analysen, Marktberichte und praktische Guides für erfolgreiche Investments an der Adria."
        url="/blog"
      />
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-semibold text-ea-dark mb-4">
            Insights
          </h1>
          <p className="text-ea-dark/70 text-lg max-w-3xl mx-auto">
            Tiefgehende Analysen, Marktberichte und praktische Guides für erfolgreiche Investments an der Adria
          </p>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-10 h-10 text-ea-gold animate-spin" />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center mb-12">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Theme Clusters Navigation */}
            <div className="mb-8">
              <div className="flex flex-wrap gap-2 justify-center">
                <button
                  onClick={() => setSelectedCluster('All')}
                  data-testid="cluster-filter-all"
                  className={`px-4 py-2 rounded-lg text-sm transition-all font-medium ${
                    selectedCluster === 'All'
                      ? 'bg-ea-dark text-white'
                      : 'bg-ea-light text-ea-dark hover:bg-ea-gold/20'
                  }`}
                >
                  Alle ({articles.length})
                </button>
                {themeClusters.map((cluster) => {
                  const count = articles.filter(a => a.cluster === cluster.id).length;
                  return (
                    <button
                      key={cluster.id}
                      onClick={() => setSelectedCluster(cluster.id)}
                      data-testid={`cluster-filter-${cluster.id}`}
                      className={`px-4 py-2 rounded-lg text-sm transition-all ${
                        selectedCluster === cluster.id
                          ? 'bg-ea-dark text-white font-medium'
                          : 'bg-ea-light text-ea-dark hover:bg-ea-gold/20'
                      }`}
                    >
                      {cluster.name} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Search Bar */}
            <div className="max-w-xl mx-auto mb-12">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-ea-dark/40" />
                <input
                  type="text"
                  placeholder="Artikel durchsuchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  data-testid="blog-search-input"
                  className="w-full bg-ea-light border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-ea-dark placeholder-ea-dark/40 focus:outline-none focus:border-ea-gold focus:ring-2 focus:ring-ea-gold/20 transition-all"
                />
              </div>
            </div>

            {filteredArticles.length === 0 ? (
              <div className="bg-ea-light border border-gray-200 rounded-xl p-12 text-center">
                <p className="text-ea-dark/70 text-lg">Keine Artikel gefunden. Versuchen Sie einen anderen Suchbegriff.</p>
              </div>
            ) : (
              <>
                {/* Featured Articles Grid (12 Cards) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                  {featuredArticles.map((article) => (
                    <Link
                      key={article.id}
                      to={`/blog/${article.slug}`}
                      className="block group"
                      data-testid={`article-card-${article.slug}`}
                    >
                      <article className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full">
                        <div className="relative h-44 overflow-hidden">
                          <img
                            src={article.image}
                            alt={article.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute top-3 left-3">
                            <span className="bg-white/90 backdrop-blur-sm text-xs text-ea-dark px-2.5 py-1 rounded-full font-medium">
                              {article.category}
                            </span>
                          </div>
                        </div>
                        <div className="p-5">
                          <div className="flex items-center space-x-2 mb-2 text-xs text-ea-dark/50">
                            <span>{article.date}</span>
                            <span>•</span>
                            <Clock className="w-3 h-3" />
                            <span>{article.readTime}</span>
                          </div>
                          <h3 className="text-base font-semibold text-ea-dark mb-2 group-hover:text-ea-gold transition-colors line-clamp-2">
                            {article.title}
                          </h3>
                          <div className="flex items-center text-ea-gold text-sm font-medium">
                            <span>Lesen</span>
                            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>

                {/* Remaining Articles as Collapsible List */}
                {listArticles.length > 0 && (
                  <div className="border-t border-gray-200 pt-12">
                    <button
                      onClick={() => setIsListExpanded(!isListExpanded)}
                      className="w-full flex items-center justify-between mb-6 group"
                      data-testid="toggle-article-list"
                    >
                      <h2 className="text-2xl font-semibold text-ea-dark">
                        Weitere <span className="text-ea-gold">Artikel</span>
                        <span className="text-ea-dark/50 text-base font-normal ml-2">({listArticles.length})</span>
                      </h2>
                      <div className="flex items-center gap-2 text-ea-dark/60 group-hover:text-ea-gold transition-colors">
                        <span className="text-sm">{isListExpanded ? 'Einklappen' : 'Alle anzeigen'}</span>
                        {isListExpanded ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </div>
                    </button>
                    
                    {isListExpanded && (
                      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden animate-fadeIn">
                        {listArticles.map((article, index) => (
                          <Link
                            key={article.id}
                            to={`/blog/${article.slug}`}
                            className={`flex items-center justify-between p-4 hover:bg-ea-light transition-colors group ${
                              index !== listArticles.length - 1 ? 'border-b border-gray-100' : ''
                            }`}
                            data-testid={`article-list-${article.slug}`}
                          >
                            <div className="flex-1 min-w-0 pr-4">
                              <div className="flex items-center gap-3 mb-1">
                                <span className="text-xs text-ea-gold font-medium bg-ea-gold/10 px-2 py-0.5 rounded">
                                  {article.category}
                                </span>
                                <span className="text-xs text-ea-dark/40">{article.date}</span>
                              </div>
                              <h3 className="text-ea-dark font-medium group-hover:text-ea-gold transition-colors truncate">
                                {article.title}
                              </h3>
                            </div>
                            <div className="flex items-center gap-2 text-ea-dark/40 group-hover:text-ea-gold transition-colors flex-shrink-0">
                              <Clock className="w-4 h-4" />
                              <span className="text-sm">{article.readTime}</span>
                              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BlogPage;
