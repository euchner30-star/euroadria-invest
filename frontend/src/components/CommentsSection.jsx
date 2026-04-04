import React, { useState, useEffect } from 'react';
import { MessageSquare, User, Mail, Send, Loader2, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { commentsApi } from '../services/api';
import T from './T';

// Comment Form Component
export const CommentForm = ({ articleId, articleSlug, onCommentSubmitted }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    content: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      await commentsApi.create({
        articleId,
        articleSlug,
        ...formData
      });
      
      setStatus({ 
        type: 'success', 
        message: 'Vielen Dank für Ihren Kommentar! Er wird nach Prüfung durch unser Team veröffentlicht.' 
      });
      setFormData({ name: '', email: '', content: '' });
      
      if (onCommentSubmitted) {
        onCommentSubmitted();
      }
    } catch (err) {
      setStatus({ 
        type: 'error', 
        message: 'Ihr Kommentar konnte leider nicht gesendet werden. Bitte versuchen Sie es erneut.' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 p-6 md:p-8 rounded-xl shadow-sm" data-testid="comment-form">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-ea-gold/10 rounded-lg flex items-center justify-center">
          <MessageSquare className="w-5 h-5 text-ea-gold" />
        </div>
        <h3 className="text-xl font-semibold text-ea-dark"><T>Kommentar hinterlassen</T></h3>
      </div>

      {status.message && (
        <div className={`p-4 rounded-lg mb-6 flex items-start space-x-3 ${
          status.type === 'success' 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`} data-testid="comment-status">
          {status.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          )}
          <p className={status.type === 'success' ? 'text-green-700' : 'text-red-700'}>
            {status.message}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-ea-dark/80 text-sm font-medium mb-2">
              <User className="w-4 h-4 inline mr-2 text-ea-gold" />
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Ihr Name"
              required
              className="w-full bg-ea-light border border-gray-200 rounded-lg px-4 py-3 text-ea-dark placeholder-ea-dark/40 focus:outline-none focus:border-ea-gold focus:ring-2 focus:ring-ea-gold/20 transition-colors"
              data-testid="comment-name-input"
            />
          </div>
          <div>
            <label className="block text-ea-dark/80 text-sm font-medium mb-2">
              <Mail className="w-4 h-4 inline mr-2 text-ea-gold" />
              E-Mail * <span className="text-ea-dark/40">(wird nicht veröffentlicht)</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="ihre@email.de"
              required
              className="w-full bg-ea-light border border-gray-200 rounded-lg px-4 py-3 text-ea-dark placeholder-ea-dark/40 focus:outline-none focus:border-ea-gold focus:ring-2 focus:ring-ea-gold/20 transition-colors"
              data-testid="comment-email-input"
            />
          </div>
        </div>

        <div>
          <label className="block text-ea-dark/80 text-sm font-medium mb-2">
            <MessageSquare className="w-4 h-4 inline mr-2 text-ea-gold" />
            Ihr Kommentar *
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => handleChange('content', e.target.value)}
            placeholder="Teilen Sie Ihre Gedanken, Fragen oder Erfahrungen..."
            required
            rows={5}
            className="w-full bg-ea-light border border-gray-200 rounded-lg px-4 py-3 text-ea-dark placeholder-ea-dark/40 focus:outline-none focus:border-ea-gold focus:ring-2 focus:ring-ea-gold/20 transition-colors resize-none"
            data-testid="comment-content-input"
          />
        </div>

        <div className="flex items-center justify-between flex-wrap gap-4">
          <p className="text-ea-dark/40 text-xs">
            * Pflichtfelder. Kommentare werden vor Veröffentlichung geprüft.
          </p>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 bg-ea-dark text-white font-semibold rounded-lg hover:bg-ea-navy transition-all flex items-center space-x-2 disabled:opacity-70"
            data-testid="comment-submit-button"
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
            <span>{submitting ? <T>Wird gesendet...</T> : <T>Kommentar absenden</T>}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

// Single Comment Display
const Comment = ({ comment }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-ea-light border border-gray-200 p-5 rounded-lg" data-testid={`comment-${comment.id}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-ea-gold/20 flex items-center justify-center">
            <span className="text-ea-gold font-bold text-lg">
              {comment.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-ea-dark font-medium">{comment.name}</p>
            <p className="text-ea-dark/50 text-xs flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{formatDate(comment.createdAt)}</span>
            </p>
          </div>
        </div>
      </div>
      <p className="text-ea-dark/80 leading-relaxed">{comment.content}</p>
    </div>
  );
};

// Comments List Component
export const CommentsList = ({ articleId, articleSlug }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = async () => {
    try {
      setLoading(true);
      // Use slug-based endpoint if articleId is not a valid DB id (e.g., 999 for static pages)
      const useSlug = !articleId || articleId >= 900;
      const data = useSlug && articleSlug 
        ? await commentsApi.getBySlug(articleSlug)
        : await commentsApi.getByArticle(articleId);
      setComments(data);
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (articleId || articleSlug) {
      fetchComments();
    }
  }, [articleId, articleSlug]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 text-ea-gold animate-spin" />
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-8">
        <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-ea-dark/50">Noch keine Kommentare. Seien Sie der Erste!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="comments-list">
      <p className="text-ea-dark/50 text-sm mb-4">
        {comments.length} {comments.length === 1 ? <T>Kommentar</T> : <T>Kommentare</T>}
      </p>
      {comments.map((comment) => (
        <Comment key={comment.id} comment={comment} />
      ))}
    </div>
  );
};

// Main Comments Section Component
const CommentsSection = ({ articleId, articleSlug }) => {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCommentSubmitted = () => {
    // Optionally refresh comments list after submission
    // setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="mt-16" data-testid="comments-section">
      <h2 className="text-2xl md:text-3xl font-semibold text-ea-dark mb-8">
        Diskussion & <span className="text-ea-gold">Kommentare</span>
      </h2>

      {/* Comments List */}
      <div className="mb-8">
        <CommentsList key={refreshKey} articleId={articleId} articleSlug={articleSlug} />
      </div>

      {/* Comment Form */}
      <CommentForm 
        articleId={articleId} 
        articleSlug={articleSlug}
        onCommentSubmitted={handleCommentSubmitted}
      />
    </div>
  );
};

export default CommentsSection;
