import React, { useState, useEffect } from 'react';
import { MessageSquare, User, Mail, Send, Loader2, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { commentsApi } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export const CommentForm = ({ articleId, articleSlug, onCommentSubmitted }) => {
  const [formData, setFormData] = useState({ name: '', email: '', content: '' });
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const { lang } = useLanguage();
  const en = lang === 'en';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus({ type: '', message: '' });
    try {
      await commentsApi.create({ articleId, articleSlug, ...formData });
      setStatus({ type: 'success', message: en ? 'Thank you for your comment! It will be published after review by our team.' : 'Vielen Dank für Ihren Kommentar! Er wird nach Prüfung durch unser Team veröffentlicht.' });
      setFormData({ name: '', email: '', content: '' });
      if (onCommentSubmitted) onCommentSubmitted();
    } catch (err) {
      setStatus({ type: 'error', message: en ? 'Your comment could not be sent. Please try again.' : 'Ihr Kommentar konnte leider nicht gesendet werden. Bitte versuchen Sie es erneut.' });
    } finally { setSubmitting(false); }
  };

  return (
    <div className="bg-white border border-gray-200 p-6 md:p-8 rounded-xl shadow-sm" data-testid="comment-form">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-ea-gold/10 rounded-lg flex items-center justify-center"><MessageSquare className="w-5 h-5 text-ea-gold" /></div>
        <h3 className="text-xl font-semibold text-ea-dark">{en ? 'Leave a Comment' : 'Kommentar hinterlassen'}</h3>
      </div>
      {status.message && (
        <div className={`p-4 rounded-lg mb-6 flex items-start space-x-3 ${status.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`} data-testid="comment-status">
          {status.type === 'success' ? <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />}
          <p className={status.type === 'success' ? 'text-green-700' : 'text-red-700'}>{status.message}</p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-ea-dark/80 text-sm font-medium mb-2"><User className="w-4 h-4 inline mr-2 text-ea-gold" />Name *</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData(p=>({...p, name:e.target.value}))} placeholder={en ? "Your Name" : "Ihr Name"} required className="w-full bg-ea-light border border-gray-200 rounded-lg px-4 py-3 text-ea-dark placeholder-ea-dark/40 focus:outline-none focus:border-ea-gold focus:ring-2 focus:ring-ea-gold/20 transition-colors" data-testid="comment-name-input" />
          </div>
          <div>
            <label className="block text-ea-dark/80 text-sm font-medium mb-2"><Mail className="w-4 h-4 inline mr-2 text-ea-gold" />{en ? 'Email' : 'E-Mail'} * <span className="text-ea-dark/40">({en ? 'will not be published' : 'wird nicht veröffentlicht'})</span></label>
            <input type="email" value={formData.email} onChange={(e) => setFormData(p=>({...p, email:e.target.value}))} placeholder={en ? "your@email.com" : "ihre@email.de"} required className="w-full bg-ea-light border border-gray-200 rounded-lg px-4 py-3 text-ea-dark placeholder-ea-dark/40 focus:outline-none focus:border-ea-gold focus:ring-2 focus:ring-ea-gold/20 transition-colors" data-testid="comment-email-input" />
          </div>
        </div>
        <div>
          <label className="block text-ea-dark/80 text-sm font-medium mb-2"><MessageSquare className="w-4 h-4 inline mr-2 text-ea-gold" />{en ? 'Your Comment' : 'Ihr Kommentar'} *</label>
          <textarea value={formData.content} onChange={(e) => setFormData(p=>({...p, content:e.target.value}))} placeholder={en ? "Share your thoughts, questions or experiences..." : "Teilen Sie Ihre Gedanken, Fragen oder Erfahrungen..."} required rows={5} className="w-full bg-ea-light border border-gray-200 rounded-lg px-4 py-3 text-ea-dark placeholder-ea-dark/40 focus:outline-none focus:border-ea-gold focus:ring-2 focus:ring-ea-gold/20 transition-colors resize-none" data-testid="comment-content-input" />
        </div>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <p className="text-ea-dark/40 text-xs">{en ? '* Required fields. Comments are reviewed before publication.' : '* Pflichtfelder. Kommentare werden vor Veröffentlichung geprüft.'}</p>
          <button type="submit" disabled={submitting} className="px-6 py-3 bg-ea-dark text-white font-semibold rounded-lg hover:bg-ea-navy transition-all flex items-center space-x-2 disabled:opacity-70" data-testid="comment-submit-button">
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            <span>{submitting ? (en ? 'Sending...' : 'Wird gesendet...') : (en ? 'Submit Comment' : 'Kommentar absenden')}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

const Comment = ({ comment }) => {
  const { lang } = useLanguage();
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString(lang === 'en' ? 'en-GB' : 'de-DE', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="bg-ea-light border border-gray-200 p-5 rounded-lg" data-testid={`comment-${comment.id}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-ea-gold/20 flex items-center justify-center"><span className="text-ea-gold font-bold text-lg">{comment.name.charAt(0).toUpperCase()}</span></div>
          <div><p className="text-ea-dark font-medium">{comment.name}</p><p className="text-ea-dark/50 text-xs flex items-center space-x-1"><Clock className="w-3 h-3" /><span>{formatDate(comment.createdAt)}</span></p></div>
        </div>
      </div>
      <p className="text-ea-dark/80 leading-relaxed">{comment.content}</p>
    </div>
  );
};

export const CommentsList = ({ articleId, articleSlug }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { lang } = useLanguage();
  const en = lang === 'en';

  useEffect(() => {
    const fetchComments = async () => {
      try { setLoading(true);
        const useSlug = !articleId || articleId >= 900;
        const data = useSlug && articleSlug ? await commentsApi.getBySlug(articleSlug) : await commentsApi.getByArticle(articleId);
        setComments(data);
      } catch (err) { console.error('Failed to fetch comments:', err); } finally { setLoading(false); }
    };
    if (articleId || articleSlug) fetchComments();
  }, [articleId, articleSlug]);

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 text-ea-gold animate-spin" /></div>;
  if (comments.length === 0) return <div className="text-center py-8"><MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-ea-dark/50">{en ? 'No comments yet. Be the first!' : 'Noch keine Kommentare. Seien Sie der Erste!'}</p></div>;

  return (
    <div className="space-y-4" data-testid="comments-list">
      <p className="text-ea-dark/50 text-sm mb-4">{comments.length} {en ? (comments.length === 1 ? 'Comment' : 'Comments') : (comments.length === 1 ? 'Kommentar' : 'Kommentare')}</p>
      {comments.map((comment) => <Comment key={comment.id} comment={comment} />)}
    </div>
  );
};

const CommentsSection = ({ articleId, articleSlug }) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const { lang } = useLanguage();
  const en = lang === 'en';

  return (
    <div className="mt-16" data-testid="comments-section">
      <h2 className="text-2xl md:text-3xl font-semibold text-ea-dark mb-8">
        {en ? <>Discussion & <span className="text-ea-gold">Comments</span></> : <>Diskussion & <span className="text-ea-gold">Kommentare</span></>}
      </h2>
      <div className="mb-8"><CommentsList key={refreshKey} articleId={articleId} articleSlug={articleSlug} /></div>
      <CommentForm articleId={articleId} articleSlug={articleSlug} onCommentSubmitted={() => setRefreshKey(p=>p+1)} />
    </div>
  );
};

export default CommentsSection;
