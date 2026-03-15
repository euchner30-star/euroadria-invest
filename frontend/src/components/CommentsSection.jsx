import React, { useState, useEffect } from 'react';
import { MessageSquare, User, Mail, Send, Loader2, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { commentsApi } from '../services/api';

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
    <div className="glass-card p-6 md:p-8 rounded-xl" data-testid="comment-form">
      <div className="flex items-center space-x-3 mb-6">
        <MessageSquare className="w-6 h-6 text-gold" />
        <h3 className="text-xl font-bold text-white">Kommentar hinterlassen</h3>
      </div>

      {status.message && (
        <div className={`p-4 rounded-lg mb-6 flex items-start space-x-3 ${
          status.type === 'success' 
            ? 'bg-green-500/10 border border-green-500/30' 
            : 'bg-red-500/10 border border-red-500/30'
        }`}>
          {status.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          )}
          <p className={status.type === 'success' ? 'text-green-300' : 'text-red-300'}>
            {status.message}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-white/70 text-sm mb-2">
              <User className="w-4 h-4 inline mr-2 text-gold" />
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Ihr Name"
              required
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-gold/50 transition-colors"
              data-testid="comment-name-input"
            />
          </div>
          <div>
            <label className="block text-white/70 text-sm mb-2">
              <Mail className="w-4 h-4 inline mr-2 text-gold" />
              E-Mail * <span className="text-white/40">(wird nicht veröffentlicht)</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="ihre@email.de"
              required
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-gold/50 transition-colors"
              data-testid="comment-email-input"
            />
          </div>
        </div>

        <div>
          <label className="block text-white/70 text-sm mb-2">
            <MessageSquare className="w-4 h-4 inline mr-2 text-gold" />
            Ihr Kommentar *
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => handleChange('content', e.target.value)}
            placeholder="Teilen Sie Ihre Gedanken, Fragen oder Erfahrungen..."
            required
            rows={5}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-gold/50 transition-colors resize-none"
            data-testid="comment-content-input"
          />
        </div>

        <div className="flex items-center justify-between">
          <p className="text-white/40 text-xs">
            * Pflichtfelder. Kommentare werden vor Veröffentlichung geprüft.
          </p>
          <button
            type="submit"
            disabled={submitting}
            className="btn-gold flex items-center space-x-2"
            data-testid="comment-submit-button"
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
            <span>{submitting ? 'Wird gesendet...' : 'Kommentar absenden'}</span>
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
    <div className="glass-card p-5 rounded-lg" data-testid={`comment-${comment.id}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
            <span className="text-gold font-bold text-lg">
              {comment.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-white font-medium">{comment.name}</p>
            <p className="text-white/50 text-xs flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{formatDate(comment.createdAt)}</span>
            </p>
          </div>
        </div>
      </div>
      <p className="text-white/80 leading-relaxed">{comment.content}</p>
    </div>
  );
};

// Comments List Component
export const CommentsList = ({ articleId }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const data = await commentsApi.getByArticle(articleId);
      setComments(data);
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (articleId) {
      fetchComments();
    }
  }, [articleId]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 text-gold animate-spin" />
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-8">
        <MessageSquare className="w-12 h-12 text-white/20 mx-auto mb-3" />
        <p className="text-white/50">Noch keine Kommentare. Seien Sie der Erste!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="comments-list">
      <p className="text-white/60 text-sm mb-4">
        {comments.length} {comments.length === 1 ? 'Kommentar' : 'Kommentare'}
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
      <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-8">
        Diskussion & <span className="text-gold">Kommentare</span>
      </h2>

      {/* Comments List */}
      <div className="mb-8">
        <CommentsList key={refreshKey} articleId={articleId} />
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
