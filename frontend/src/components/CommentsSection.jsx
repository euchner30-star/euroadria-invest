import React, { useState, useEffect } from 'react';
import { MessageSquare, User, Mail, Send, Loader2, CheckCircle, AlertCircle, Clock, Reply, ChevronDown, ChevronUp } from 'lucide-react';
import { commentsApi } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const formatDate = (dateString, lang) => {
  return new Date(dateString).toLocaleDateString(
    lang === 'en' ? 'en-GB' : 'de-DE',
    { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }
  );
};

// Inline Reply Form
const ReplyForm = ({ articleId, articleSlug, parentId, parentName, onSubmitted, onCancel }) => {
  const [formData, setFormData] = useState({ name: '', email: '', content: '' });
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);
  const { lang } = useLanguage();
  const en = lang === 'en';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);
    try {
      const res = await commentsApi.create({ articleId, articleSlug, parentId, ...formData });
      setStatus({
        type: 'success',
        message: res.autoApproved
          ? (en ? 'Your reply has been published!' : 'Ihre Antwort wurde veroeffentlicht!')
          : (en ? 'Thank you! Your reply will be published after review.' : 'Vielen Dank! Ihre Antwort wird nach Pruefung veroeffentlicht.')
      });
      setFormData({ name: '', email: '', content: '' });
      if (onSubmitted) onSubmitted();
    } catch {
      setStatus({ type: 'error', message: en ? 'Could not send.' : 'Konnte nicht gesendet werden.' });
    } finally { setSubmitting(false); }
  };

  return (
    <div className="mt-3 ml-4 md:ml-8 p-4 bg-white border border-ea-gold/30 rounded-lg" data-testid={'reply-form-' + parentId}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-ea-dark/60">{en ? 'Reply to' : 'Antwort an'} <strong>{parentName}</strong></p>
        <button onClick={onCancel} className="text-xs text-ea-dark/40 hover:text-ea-dark">{en ? 'Cancel' : 'Abbrechen'}</button>
      </div>
      {status && (
        <div className={'p-3 rounded-lg mb-3 flex items-start space-x-2 text-sm ' + (status.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200')}>
          {status.type === 'success' ? <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />}
          <p className={status.type === 'success' ? 'text-green-700' : 'text-red-700'}>{status.message}</p>
        </div>
      )}
      {(!status || status.type === 'error') && (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input type="text" value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="Name *" required className="bg-ea-light border border-gray-200 rounded-lg px-3 py-2 text-sm text-ea-dark focus:outline-none focus:border-ea-gold" data-testid={'reply-name-' + parentId} />
            <input type="email" value={formData.email} onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))} placeholder="E-Mail *" required className="bg-ea-light border border-gray-200 rounded-lg px-3 py-2 text-sm text-ea-dark focus:outline-none focus:border-ea-gold" data-testid={'reply-email-' + parentId} />
          </div>
          <textarea value={formData.content} onChange={(e) => setFormData(p => ({ ...p, content: e.target.value }))} placeholder={en ? 'Your reply...' : 'Ihre Antwort...'} required rows={3} className="w-full bg-ea-light border border-gray-200 rounded-lg px-3 py-2 text-sm text-ea-dark focus:outline-none focus:border-ea-gold resize-none" data-testid={'reply-content-' + parentId} />
          <button type="submit" disabled={submitting} className="px-4 py-2 bg-ea-dark text-white text-sm font-medium rounded-lg hover:bg-ea-navy transition-all flex items-center space-x-2 disabled:opacity-70" data-testid={'reply-submit-' + parentId}>
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>{submitting ? (en ? 'Sending...' : 'Senden...') : (en ? 'Reply' : 'Antworten')}</span>
          </button>
        </form>
      )}
    </div>
  );
};

// Single reply (no nesting)
const ReplyItem = ({ comment, lang }) => (
  <div className="bg-white border-l-2 border-ea-gold/40 p-4 rounded-lg" data-testid={'comment-' + comment.id}>
    <div className="flex items-center space-x-3 mb-2">
      <div className="w-8 h-8 rounded-full bg-ea-gold/30 flex items-center justify-center">
        <span className="text-ea-gold font-bold text-xs">{comment.name.charAt(0).toUpperCase()}</span>
      </div>
      <div>
        <p className="text-ea-dark font-medium text-sm">{comment.name}</p>
        <p className="text-ea-dark/50 text-xs flex items-center space-x-1">
          <Clock className="w-3 h-3" />
          <span>{formatDate(comment.createdAt, lang)}</span>
        </p>
      </div>
    </div>
    <p className="text-ea-dark/80 leading-relaxed text-sm">{comment.content}</p>
  </div>
);

// Top-level comment with reply button + replies
const CommentItem = ({ comment, replies, articleId, articleSlug, onReplySubmitted }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  const { lang } = useLanguage();
  const en = lang === 'en';

  return (
    <div data-testid={'comment-' + comment.id}>
      <div className="bg-ea-light border border-gray-200 p-4 md:p-5 rounded-lg">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-ea-gold/20 flex items-center justify-center">
              <span className="text-ea-gold font-bold text-lg">{comment.name.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <p className="text-ea-dark font-medium">{comment.name}</p>
              <p className="text-ea-dark/50 text-xs flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{formatDate(comment.createdAt, lang)}</span>
              </p>
            </div>
          </div>
        </div>
        <p className="text-ea-dark/80 leading-relaxed">{comment.content}</p>
        <button
          onClick={() => setShowReplyForm(!showReplyForm)}
          className="mt-3 text-xs text-ea-gold hover:text-ea-dark/70 font-medium flex items-center space-x-1 transition-colors"
          data-testid={'reply-btn-' + comment.id}
        >
          <Reply className="w-3.5 h-3.5" />
          <span>{en ? 'Reply' : 'Antworten'}</span>
        </button>
      </div>

      {replies.length > 0 && (
        <div className="ml-4 md:ml-8 mt-2">
          <button
            onClick={() => setShowReplies(!showReplies)}
            className="text-xs text-ea-dark/50 hover:text-ea-dark flex items-center space-x-1 mb-2"
          >
            {showReplies ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            <span>{replies.length} {replies.length === 1 ? (en ? 'Reply' : 'Antwort') : (en ? 'Replies' : 'Antworten')}</span>
          </button>
          {showReplies && (
            <div className="space-y-2">
              {replies.map(r => <ReplyItem key={r.id} comment={r} lang={lang} />)}
            </div>
          )}
        </div>
      )}

      {showReplyForm && (
        <ReplyForm
          articleId={articleId}
          articleSlug={articleSlug}
          parentId={comment.id}
          parentName={comment.name}
          onSubmitted={() => { setShowReplyForm(false); if (onReplySubmitted) onReplySubmitted(); }}
          onCancel={() => setShowReplyForm(false)}
        />
      )}
    </div>
  );
};

export const CommentForm = ({ articleId, articleSlug, onCommentSubmitted }) => {
  const [formData, setFormData] = useState({ name: '', email: '', content: '' });
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);
  const { lang } = useLanguage();
  const en = lang === 'en';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);
    try {
      const res = await commentsApi.create({ articleId, articleSlug, ...formData });
      setStatus({
        type: 'success',
        message: res.autoApproved
          ? (en ? 'Your comment has been published!' : 'Ihr Kommentar wurde veroeffentlicht!')
          : (en ? 'Thank you! It will be published after review.' : 'Vielen Dank! Er wird nach Pruefung veroeffentlicht.')
      });
      setFormData({ name: '', email: '', content: '' });
      if (onCommentSubmitted) onCommentSubmitted();
    } catch {
      setStatus({ type: 'error', message: en ? 'Could not send. Please try again.' : 'Konnte nicht gesendet werden. Bitte erneut versuchen.' });
    } finally { setSubmitting(false); }
  };

  return (
    <div className="bg-white border border-gray-200 p-6 md:p-8 rounded-xl shadow-sm" data-testid="comment-form">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-ea-gold/10 rounded-lg flex items-center justify-center"><MessageSquare className="w-5 h-5 text-ea-gold" /></div>
        <h3 className="text-xl font-semibold text-ea-dark">{en ? 'Leave a Comment' : 'Kommentar hinterlassen'}</h3>
      </div>
      {status && (
        <div className={'p-4 rounded-lg mb-6 flex items-start space-x-3 ' + (status.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200')} data-testid="comment-status">
          {status.type === 'success' ? <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />}
          <p className={status.type === 'success' ? 'text-green-700' : 'text-red-700'}>{status.message}</p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-ea-dark/80 text-sm font-medium mb-2"><User className="w-4 h-4 inline mr-2 text-ea-gold" />Name *</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} placeholder={en ? 'Your Name' : 'Ihr Name'} required className="w-full bg-ea-light border border-gray-200 rounded-lg px-4 py-3 text-ea-dark placeholder-ea-dark/40 focus:outline-none focus:border-ea-gold focus:ring-2 focus:ring-ea-gold/20 transition-colors" data-testid="comment-name-input" />
          </div>
          <div>
            <label className="block text-ea-dark/80 text-sm font-medium mb-2"><Mail className="w-4 h-4 inline mr-2 text-ea-gold" />{en ? 'Email' : 'E-Mail'} * <span className="text-ea-dark/40">({en ? 'will not be published' : 'wird nicht veröffentlicht'})</span></label>
            <input type="email" value={formData.email} onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))} placeholder={en ? 'your@email.com' : 'ihre@email.de'} required className="w-full bg-ea-light border border-gray-200 rounded-lg px-4 py-3 text-ea-dark placeholder-ea-dark/40 focus:outline-none focus:border-ea-gold focus:ring-2 focus:ring-ea-gold/20 transition-colors" data-testid="comment-email-input" />
          </div>
        </div>
        <div>
          <label className="block text-ea-dark/80 text-sm font-medium mb-2"><MessageSquare className="w-4 h-4 inline mr-2 text-ea-gold" />{en ? 'Your Comment' : 'Ihr Kommentar'} *</label>
          <textarea value={formData.content} onChange={(e) => setFormData(p => ({ ...p, content: e.target.value }))} placeholder={en ? 'Share your thoughts, questions or experiences...' : 'Teilen Sie Ihre Gedanken, Fragen oder Erfahrungen...'} required rows={5} className="w-full bg-ea-light border border-gray-200 rounded-lg px-4 py-3 text-ea-dark placeholder-ea-dark/40 focus:outline-none focus:border-ea-gold focus:ring-2 focus:ring-ea-gold/20 transition-colors resize-none" data-testid="comment-content-input" />
        </div>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <p className="text-ea-dark/40 text-xs">{en ? '* Required. Reviewed before publication.' : '* Pflichtfelder. Kommentare werden vor Veroeffentlichung geprueft.'}</p>
          <button type="submit" disabled={submitting} className="px-6 py-3 bg-ea-dark text-white font-semibold rounded-lg hover:bg-ea-navy transition-all flex items-center space-x-2 disabled:opacity-70" data-testid="comment-submit-button">
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            <span>{submitting ? (en ? 'Sending...' : 'Wird gesendet...') : (en ? 'Submit Comment' : 'Kommentar absenden')}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export const CommentsList = ({ articleId, articleSlug }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { lang } = useLanguage();
  const en = lang === 'en';

  const fetchComments = async () => {
    try {
      setLoading(true);
      const useSlug = !articleId || articleId >= 900;
      const data = useSlug && articleSlug ? await commentsApi.getBySlug(articleSlug) : await commentsApi.getByArticle(articleId);
      setComments(data);
    } catch (err) { console.error('Failed to fetch comments:', err); } finally { setLoading(false); }
  };

  useEffect(() => {
    if (articleId || articleSlug) fetchComments();
  }, [articleId, articleSlug]);

  const topLevel = comments.filter(c => !c.parentId);
  const repliesMap = {};
  comments.filter(c => c.parentId).forEach(c => {
    if (!repliesMap[c.parentId]) repliesMap[c.parentId] = [];
    repliesMap[c.parentId].push(c);
  });

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 text-ea-gold animate-spin" /></div>;
  if (comments.length === 0) return <div className="text-center py-8"><MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-ea-dark/50">{en ? 'No comments yet. Be the first!' : 'Noch keine Kommentare. Seien Sie der Erste!'}</p></div>;

  return (
    <div className="space-y-4" data-testid="comments-list">
      <p className="text-ea-dark/50 text-sm mb-4">{comments.length} {comments.length === 1 ? (en ? 'Comment' : 'Kommentar') : (en ? 'Comments' : 'Kommentare')}</p>
      {topLevel.map(comment => (
        <CommentItem
          key={comment.id}
          comment={comment}
          replies={repliesMap[comment.id] || []}
          articleId={articleId}
          articleSlug={articleSlug}
          onReplySubmitted={fetchComments}
        />
      ))}
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
        {en ? <>Discussion &amp; <span className="text-ea-gold">Comments</span></> : <>Diskussion &amp; <span className="text-ea-gold">Kommentare</span></>}
      </h2>
      <div className="mb-8"><CommentsList key={refreshKey} articleId={articleId} articleSlug={articleSlug} /></div>
      <CommentForm articleId={articleId} articleSlug={articleSlug} onCommentSubmitted={() => setRefreshKey(p => p + 1)} />
    </div>
  );
};

export default CommentsSection;
