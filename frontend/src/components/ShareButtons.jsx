import React from 'react';
import { Linkedin, MessageCircle, Mail, Share2 } from 'lucide-react';

// Custom X (Twitter) icon since Lucide doesn't have the new X logo
const XIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

// Facebook icon
const FacebookIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const ShareButtons = ({ title, url, excerpt }) => {
  const encodedUrl = encodeURIComponent(url || window.location.href);
  const encodedTitle = encodeURIComponent(title || '');
  const encodedExcerpt = encodeURIComponent(excerpt || '');

  const shareLinks = {
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedExcerpt}%0A%0AMehr%20lesen:%20${encodedUrl}`
  };

  const handleShare = (platform) => {
    if (platform === 'email') {
      window.location.href = shareLinks[platform];
    } else {
      window.open(shareLinks[platform], '_blank', 'width=600,height=400');
    }
  };

  const buttonClasses = "p-3 rounded-lg bg-white/5 border border-white/10 hover:border-gold/50 hover:bg-gold/10 transition-all duration-300 group";
  const iconClasses = "w-5 h-5 text-white/70 group-hover:text-gold transition-colors";

  return (
    <div className="mt-10 pt-8 border-t border-white/10" data-testid="share-buttons">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center space-x-2 text-white/60">
          <Share2 className="w-5 h-5 text-gold" />
          <span className="text-sm font-medium">Artikel teilen:</span>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleShare('linkedin')}
            className={buttonClasses}
            title="Auf LinkedIn teilen"
            aria-label="Auf LinkedIn teilen"
            data-testid="share-linkedin"
          >
            <Linkedin className={iconClasses} />
          </button>
          
          <button
            onClick={() => handleShare('twitter')}
            className={buttonClasses}
            title="Auf X teilen"
            aria-label="Auf X teilen"
            data-testid="share-twitter"
          >
            <XIcon className={iconClasses} />
          </button>
          
          <button
            onClick={() => handleShare('facebook')}
            className={buttonClasses}
            title="Auf Facebook teilen"
            aria-label="Auf Facebook teilen"
            data-testid="share-facebook"
          >
            <FacebookIcon className={iconClasses} />
          </button>
          
          <button
            onClick={() => handleShare('whatsapp')}
            className={buttonClasses}
            title="Per WhatsApp teilen"
            aria-label="Per WhatsApp teilen"
            data-testid="share-whatsapp"
          >
            <MessageCircle className={iconClasses} />
          </button>
          
          <button
            onClick={() => handleShare('email')}
            className={buttonClasses}
            title="Per E-Mail teilen"
            aria-label="Per E-Mail teilen"
            data-testid="share-email"
          >
            <Mail className={iconClasses} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareButtons;
