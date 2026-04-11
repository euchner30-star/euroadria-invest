// Content Parser Utility - Handles both HTML and Markdown content
export const parseContentToHTML = (content) => {
  if (!content) return '';
  
  // If content is already HTML (from WYSIWYG editor), pass through directly
  const hasHtmlTags = /<(h[1-6]|p|div|b|strong|em|i|ul|ol|li|blockquote|a|br)\b/i.test(content);
  if (hasHtmlTags) {
    return content;
  }
  
  // Otherwise, convert Markdown to HTML
  let html = content;
  
  // Convert headers - ### to <h3>, ## to <h2>
  html = html.replace(/^### (.+)$/gm, '<h3 class="text-xl font-semibold text-ea-dark mt-8 mb-4">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 class="text-2xl font-semibold text-ea-dark mt-10 mb-5">$1</h2>');
  
  // Convert bold **text** to <strong>
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-ea-dark">$1</strong>');
  
  // Convert italic *text* to <em>
  html = html.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');
  
  // Convert bullet points - to <ul><li>
  html = html.replace(/^- (.+)$/gm, '<li class="ml-4 mb-2">$1</li>');
  html = html.replace(/(<li[^>]*>.*<\/li>\n?)+/g, '<ul class="list-disc list-inside my-4 space-y-2">$&</ul>');
  
  // Convert numbered lists 1. 2. etc to <ol><li>
  html = html.replace(/^\d+\. (.+)$/gm, '<li class="ml-4 mb-2">$1</li>');
  
  // Convert paragraphs
  html = html.replace(/\n\n/g, '</p><p class="mb-4">');
  html = html.replace(/\n/g, '<br />');
  
  // Wrap in paragraph if not already
  if (!html.startsWith('<')) {
    html = `<p class="mb-4">${html}</p>`;
  }
  
  return html;
};

// Extract key facts for GEO optimization
export const extractKeyFacts = (content, category) => {
  const facts = [];
  
  // Extract percentages and numbers
  const percentMatch = content.match(/(\d+(?:,\d+)?(?:\.\d+)?)\s*%/g);
  if (percentMatch) {
    percentMatch.forEach(p => facts.push(p));
  }
  
  // Extract EUR amounts
  const eurMatch = content.match(/(?:€|EUR)\s*[\d.,]+(?:\s*(?:Mio|Mrd|Million|Milliarde))?/gi);
  if (eurMatch) {
    eurMatch.forEach(e => facts.push(e));
  }
  
  return facts;
};

// Generate internal links based on content
export const generateInternalLinks = (content, currentSlug) => {
  const linkMappings = {
    'montenegro': '/blog?cluster=montenegro-regionen',
    'serbien': '/serbia-executive',
    'firmengründung': '/blog?cluster=business-setup',
    'due diligence': '/blog?cluster=recht-compliance',
    'immobilien': '/blog?cluster=montenegro-regionen',
    'investment': '/blog?cluster=makro-strategie',
    'steuer': '/blog?cluster=recht-compliance',
    'relocation': '/blog?cluster=lifestyle-relocation'
  };
  
  let linkedContent = content;
  
  Object.entries(linkMappings).forEach(([keyword, url]) => {
    const regex = new RegExp(`\\b(${keyword})\\b(?![^<]*>)`, 'gi');
    // Only link first occurrence
    let replaced = false;
    linkedContent = linkedContent.replace(regex, (match) => {
      if (!replaced) {
        replaced = true;
        return `<a href="${url}" class="text-ea-gold hover:underline">${match}</a>`;
      }
      return match;
    });
  });
  
  return linkedContent;
};

// Clean slug for SEO-friendly URLs
export const cleanSlug = (slug) => {
  return slug
    .toLowerCase()
    .replace(/[^a-z0-9äöüß-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

// Generate meta description from content
export const generateMetaDescription = (content, maxLength = 160) => {
  // Remove markdown and HTML
  let text = content
    .replace(/[#*`]/g, '')
    .replace(/<[^>]*>/g, '')
    .replace(/\n+/g, ' ')
    .trim();
  
  if (text.length > maxLength) {
    text = text.substring(0, maxLength - 3) + '...';
  }
  
  return text;
};
