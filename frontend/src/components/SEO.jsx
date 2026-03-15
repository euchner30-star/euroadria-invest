import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ 
  title, 
  description, 
  image,
  url,
  type = 'website',
  article = null,
  noindex = false
}) => {
  const siteName = 'EuroAdria';
  const baseUrl = 'https://euroadria.me';
  const defaultImage = `${baseUrl}/euroadria-logo.png`;
  
  const fullTitle = title ? `${title} | ${siteName}` : `${siteName} | Investment & Business Beratung für Adria & Balkan`;
  const fullDescription = description || 'Premium Investment & Lifestyle Partner für die Adria-Region. Exklusive Beratung für DACH-Investoren: Immobilien, Unternehmensgründung, Relocation nach Montenegro, Serbien & Kroatien.';
  const fullImage = image || defaultImage;
  const fullUrl = url ? `${baseUrl}${url}` : baseUrl;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={fullDescription} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="de_DE" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={fullImage} />

      {/* Article specific meta tags */}
      {article && (
        <>
          <meta property="article:published_time" content={article.date} />
          <meta property="article:author" content={article.author} />
          <meta property="article:section" content={article.category} />
        </>
      )}
    </Helmet>
  );
};

export default SEO;
