import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ 
  title, 
  description, 
  image, 
  url, 
  type = 'website',
  article = null,
  service = null,
  faq = null
}) => {
  const siteUrl = 'https://invest.euroadria.me';
  const fullUrl = `${siteUrl}${url}`;
  const fullTitle = title ? `${title} | EuroAdria Corporate Solutions` : 'EuroAdria Corporate Solutions | Investment Intelligence für Adria & Balkan';
  const defaultDescription = 'Premium Investment Intelligence Platform für die Adria-Region. Exklusive Beratung für DACH-Investoren: Immobilien, Firmengründung, Relocation nach Montenegro & Serbien.';
  const metaDescription = description || defaultDescription;
  const metaImage = image || `${siteUrl}/euroadria-logo.png`;

  // Organization schema (shown on all pages)
  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "EuroAdria Corporate Solutions",
    "alternateName": "Montaris & Co. d.o.o.",
    "url": siteUrl,
    "logo": `${siteUrl}/euroadria-logo.png`,
    "description": defaultDescription,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Marka Miljanova 12",
      "addressLocality": "Novi Sad",
      "postalCode": "21000",
      "addressCountry": "RS"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+382-68-559-776",
      "contactType": "customer service",
      "email": "office@euroadria.me",
      "availableLanguage": ["German", "English", "Serbian"]
    },
    "sameAs": [
      "https://www.euroadria.me"
    ]
  };

  // Generate Article structured data
  const articleSchema = article ? {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": metaDescription,
    "image": metaImage,
    "author": {
      "@type": "Person",
      "name": article.author || "EuroAdria Team"
    },
    "publisher": {
      "@type": "Organization",
      "name": "EuroAdria Corporate Solutions",
      "logo": {
        "@type": "ImageObject",
        "url": `${siteUrl}/euroadria-logo.png`
      }
    },
    "datePublished": article.date,
    "dateModified": article.date,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": fullUrl
    },
    "articleSection": article.category,
    "keywords": `${article.category}, Balkan Investment, Montenegro, Serbien, DACH Investoren, EuroAdria`
  } : null;

  // Generate Service structured data
  const serviceSchema = service ? {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": service.name,
    "description": service.description,
    "provider": {
      "@type": "Organization",
      "name": "EuroAdria Corporate Solutions"
    },
    "areaServed": service.areaServed || ["Montenegro", "Serbien"],
    "serviceType": service.type
  } : null;

  // FAQ structured data removed from SEO component to prevent duplication
  // Main FAQ schema is in index.html (single source of truth for Google)

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={metaDescription} />
      <meta name="keywords" content="Investment Balkan, Montenegro Immobilien, Serbien Investment, Firmengründung Montenegro, Due Diligence Balkan, DACH Investoren, Adria Investment, EuroAdria, Serbia Executive Access" />
      <meta name="author" content="EuroAdria Corporate Solutions" />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <link rel="canonical" href={fullUrl} />
      
      {/* Language & Geo Tags */}
      <meta name="language" content="German" />
      <meta name="geo.region" content="RS" />
      <meta name="geo.placename" content="Novi Sad" />
      <meta httpEquiv="content-language" content="de" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type === 'article' ? 'article' : 'website'} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="de_DE" />
      <meta property="og:site_name" content="EuroAdria Corporate Solutions" />
      
      {/* Article specific OG tags */}
      {article && (
        <>
          <meta property="article:published_time" content={article.date} />
          <meta property="article:author" content={article.author} />
          <meta property="article:section" content={article.category} />
          <meta property="article:tag" content={article.category} />
        </>
      )}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />
      <meta name="twitter:site" content="@adriaeuro" />
      <meta name="twitter:creator" content="@adriaeuro" />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(orgSchema)}
      </script>
      {articleSchema && (
        <script type="application/ld+json">
          {JSON.stringify(articleSchema)}
        </script>
      )}
      {serviceSchema && (
        <script type="application/ld+json">
          {JSON.stringify(serviceSchema)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
