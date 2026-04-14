import React from 'react';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const WhatsAppButton = () => {
  const handleClick = () => {
    // Track WhatsApp click as lead
    const page = window.location.pathname;
    const articleTitle = document.title || '';
    fetch(`${API_URL}/api/track/whatsapp-click`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page, articleTitle })
    }).catch(() => {});
  };

  return (
    <a
      href="https://wa.me/38268559776"
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300 animate-pulse-soft"
      data-testid="whatsapp-float-btn"
      aria-label="WhatsApp Chat"
    >
      <svg viewBox="0 0 32 32" className="w-7 h-7 fill-white">
        <path d="M16.004 0h-.008C7.174 0 0 7.176 0 16c0 3.5 1.128 6.744 3.046 9.378L1.054 31.29l6.118-1.958A15.914 15.914 0 0016.004 32C24.826 32 32 24.822 32 16S24.826 0 16.004 0zm9.31 22.608c-.39 1.1-1.932 2.012-3.182 2.278-.854.18-1.97.324-5.726-1.23-4.804-1.988-7.896-6.868-8.136-7.188-.232-.32-1.9-2.53-1.9-4.826s1.2-3.424 1.628-3.892c.39-.426.922-.604 1.228-.604.148 0 .282.008.402.014.428.018.642.044.924.716.352.838 1.21 2.95 1.316 3.166.108.218.216.508.066.808-.14.306-.264.496-.482.76-.218.264-.426.466-.644.75-.198.248-.422.514-.176.942.246.422 1.094 1.804 2.35 2.922 1.616 1.438 2.978 1.886 3.4 2.094.428.208.676.176.924-.106.254-.29 1.082-1.26 1.37-1.694.282-.428.57-.356.958-.214.392.14 2.498 1.178 2.926 1.392.428.214.714.32.82.5.104.176.104 1.032-.286 2.132z"/>
      </svg>
    </a>
  );
};

export default WhatsAppButton;
