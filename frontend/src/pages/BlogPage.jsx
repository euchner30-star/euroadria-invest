import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { articlesApi } from '../services/api';
import { themeClusters } from '../data/clusters';
import { Clock, ArrowRight, Search, Loader2 } from 'lucide-react';
import SEO from '../components/SEO';

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

  const filteredArticles = allArticles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          article.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCluster = selectedCluster === 'All' || article.cluster === selectedCluster;
    return matchesSearch && matchesCluster;
  });

  return (
    <div className="min-h-screen pt-28 pb-20 px-6 bg-white">
      <SEO 
        title="Blog & Insights"
        description="Tiefgehende Analysen, Marktberichte und praktische Guides für erfolgreiche Investments an der Adria."
        url="/blog"
      />
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-display font-bold text-[#3eb489] mb-6">
            Insights
          </h1>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            Tiefgehende Analysen, Marktberichte und praktische Guides für erfolgreiche Investments an der Adria
          </p>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-10 h-10 text-[#3eb489] animate-spin" />
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
            <div className="mb-12">
              <div className="flex flex-wrap gap-3 justify-center">
                <button
                  onClick={() => setSelectedCluster('All')}
                  data-testid="cluster-filter-all"
                  className={`px-5 py-3 rounded-xl text-center transition-all font-medium ${
                    selectedCluster === 'All'
                      ? 'bg-[#3eb489] text-white shadow-md'
                      : 'bg-white border border-gray-200 text-gray-700 hover:border-[#3eb489] hover:text-[#3eb489]'
                  }`}
                >
                  <div>Alle</div>
                  <div className="text-xs mt-0.5 opacity-80">{allArticles.length} Artikel</div>
                </button>
                {themeClusters.map((cluster) => {
                  const count = allArticles.filter(a => a.cluster === cluster.id).length;
                  return (
                    <button
                      key={cluster.id}
                      onClick={() => setSelectedCluster(cluster.id)}
                      data-testid={`cluster-filter-${cluster.id}`}
                      className={`px-5 py-3 rounded-xl text-center transition-all ${
                        selectedCluster === cluster.id
                          ? 'bg-[#3eb489] text-white shadow-md font-medium'
                          : 'bg-white border border-gray-200 text-gray-700 hover:border-[#3eb489] hover:text-[#3eb489]'
                      }`}
                    >
                      <div className="text-sm font-medium">{cluster.name}</div>
                      <div className="text-xs mt-0.5 opacity-80">{count} Artikel</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Search Bar */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 mb-12 shadow-sm">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Artikel durchsuchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-12 pr-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#3eb489] focus:ring-2 focus:ring-[#3eb489]/20 transition-all"
                />
              </div>
            </div>

            {/* Section Title */}
            <h2 className="text-3xl font-display font-bold text-[#3eb489] mb-8">
              {selectedCluster !== 'All' 
                ? `${themeClusters.find(c => c.id === selectedCluster)?.name}`
                : 'Articles'
              }
            </h2>

            {filteredArticles.length === 0 ? (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-12 text-center">
                <p className="text-gray-600 text-lg">Keine Artikel gefunden. Versuchen Sie einen anderen Suchbegriff.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredArticles.map((article) => (
                  <Link
                    key={article.id}
                    to={`/blog/${article.slug}`}
                    className="block group"
                  >
                    <article className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full">
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={article.image}
                          alt={article.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute top-4 left-4">
                          <span className="bg-white/90 backdrop-blur-sm text-xs text-gray-700 px-3 py-1.5 rounded-full font-medium shadow-sm">
                            {article.category}
                          </span>
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="flex items-center space-x-3 mb-3 text-xs text-gray-500">
                          <span>{article.date}</span>
                          <span>•</span>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{article.readTime}</span>
                          </div>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#3eb489] transition-colors line-clamp-2">
                          {article.title}
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 mb-4">
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
          </>
        )}
      </div>
    </div>
  );
};

export default BlogPage;
