import React from 'react';
import { Linkedin, MessageCircle, Mail, Share2, Link2, Check } from 'lucide-react';

const XIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const FacebookIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const ShareButtons = ({ title, url, excerpt, slug, category }) => {
  const [copied, setCopied] = React.useState(false);
  const baseUrl = url || window.location.href;
  
  // Use OG endpoint for sharing — social bots read correct title/image, humans get redirected
  const getShareUrl = (source) => {
    if (slug) {
      return `https://euroadria.me/api/og/blog/${slug}?utm_source=${source}&utm_medium=social&utm_campaign=share`;
    }
    try {
      const u = new URL(baseUrl.startsWith('http') ? baseUrl : 'https://euroadria.me' + baseUrl);
      u.searchParams.set('utm_source', source);
      u.searchParams.set('utm_medium', 'social');
      u.searchParams.set('utm_campaign', 'share');
      return u.toString();
    } catch { return baseUrl; }
  };

  // Short OG URL for clean sharing (ref param gets expanded to utm_source on redirect)
  const ogUrl = (ref) => slug ? `https://euroadria.me/api/og/blog/${slug}?ref=${ref}` : baseUrl;

  // Auto-generate hashtags from category
  const hashtags = React.useMemo(() => {
    const tags = ['#EuroAdria'];
    if (category) {
      const tag = category.replace(/[^a-zA-ZäöüÄÖÜß0-9]/g, '');
      if (tag) tags.unshift(`#${tag}`);
    }
    const topicTags = ['#Investment', '#Balkan'];
    return [...topicTags, ...tags].slice(0, 4).join(' ');
  }, [category]);

  // Build teaser text for social media
  const teaserText = React.useMemo(() => {
    const short = excerpt ? (excerpt.length > 180 ? excerpt.slice(0, 180).trim() + '...' : excerpt) : '';
    return short;
  }, [excerpt]);

  const shareLinks = {
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(ogUrl('li'))}&title=${encodeURIComponent(title || '')}&summary=${encodeURIComponent(teaserText)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(ogUrl('tw'))}&text=${encodeURIComponent(`${title || ''}\n\n${teaserText}\n\n${hashtags}`)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(ogUrl('fb'))}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`*${title || ''}*\n\n${teaserText}\n\n${ogUrl('wa')}`)}`,
    email: `mailto:?subject=${encodeURIComponent(title || '')}&body=${encodeURIComponent(`${title || ''}\n\n${teaserText}\n\n`)}${encodeURIComponent(ogUrl('em'))}`
  };

  const handleShare = (platform) => {
    if (platform === 'email') {
      window.location.href = shareLinks[platform];
    } else if (platform === 'copy') {
      navigator.clipboard.writeText(getShareUrl('copy')).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } else {
      window.open(shareLinks[platform], '_blank', 'width=600,height=400');
    }
  };

  const buttonClass = "flex items-center justify-center w-11 h-11 rounded-lg bg-ea-light border border-gray-200 text-ea-dark/60 hover:bg-ea-dark hover:border-ea-dark hover:text-white transition-all duration-300 hover:-translate-y-0.5";

  return (
    <div className="mt-10 pt-8 border-t border-gray-200" data-testid="share-buttons">
      <div className="flex items-center justify-between flex-wrap gap-6">
        <div className="flex items-center gap-3 text-ea-dark/60">
          <div className="w-10 h-10 rounded-lg bg-ea-gold/10 flex items-center justify-center">
            <Share2 className="w-5 h-5 text-ea-gold" />
          </div>
          <span className="text-sm font-medium">Artikel teilen</span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleShare('linkedin')}
            className={buttonClass}
            title="Auf LinkedIn teilen"
            aria-label="Auf LinkedIn teilen"
            data-testid="share-linkedin"
          >
            <Linkedin className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => handleShare('twitter')}
            className={buttonClass}
            title="Auf X teilen"
            aria-label="Auf X teilen"
            data-testid="share-twitter"
          >
            <XIcon className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => handleShare('facebook')}
            className={buttonClass}
            title="Auf Facebook teilen"
            aria-label="Auf Facebook teilen"
            data-testid="share-facebook"
          >
            <FacebookIcon className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => handleShare('whatsapp')}
            className={buttonClass}
            title="Per WhatsApp teilen"
            aria-label="Per WhatsApp teilen"
            data-testid="share-whatsapp"
          >
            <MessageCircle className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => handleShare('email')}
            className={buttonClass}
            title="Per E-Mail teilen"
            aria-label="Per E-Mail teilen"
            data-testid="share-email"
          >
            <Mail className="w-5 h-5" />
          </button>

          <button
            onClick={() => handleShare('copy')}
            className={`${buttonClass} ${copied ? '!bg-ea-gold !border-ea-gold !text-ea-dark' : ''}`}
            title="Link kopieren"
            aria-label="Link kopieren"
            data-testid="share-copy-link"
          >
            {copied ? <Check className="w-5 h-5" /> : <Link2 className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareButtons;
