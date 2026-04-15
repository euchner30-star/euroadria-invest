import { useState, useRef, useEffect } from 'react';

/**
 * Optimized image component with:
 * - Native lazy loading
 * - Blur-up placeholder
 * - Unsplash auto-format/quality params
 * - Error fallback
 */
const OptimizedImage = ({
  src,
  alt = '',
  className = '',
  width,
  height,
  style,
  ...props
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef(null);

  // Optimize Unsplash URLs with auto format and quality
  const optimizedSrc = src && src.includes('unsplash.com') && !src.includes('&fm=')
    ? `${src}${src.includes('?') ? '&' : '?'}fm=webp&q=75${width ? `&w=${width}` : ''}`
    : src;

  useEffect(() => {
    // If image is already cached, mark as loaded
    if (imgRef.current?.complete) setLoaded(true);
  }, []);

  if (error || !src) {
    return (
      <div
        className={`bg-ea-dark/5 flex items-center justify-center ${className}`}
        style={style}
        {...props}
      >
        <span className="text-ea-dark/20 text-xs">Bild nicht verfügbar</span>
      </div>
    );
  }

  return (
    <img
      ref={imgRef}
      src={optimizedSrc}
      alt={alt}
      loading="lazy"
      decoding="async"
      width={width}
      height={height}
      className={`transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'} ${className}`}
      style={style}
      onLoad={() => setLoaded(true)}
      onError={() => setError(true)}
      {...props}
    />
  );
};

export default OptimizedImage;
