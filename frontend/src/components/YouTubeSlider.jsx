import React from 'react';
import { Play, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';

const videos = [
  {
    id: '228QIsmJOYY',
    title: 'Eisbaden im Durmitor Nationalpark Teil 2',
    views: '10K',
  },
  {
    id: 'H0QATEfW_do',
    title: 'Montenegro verschärft Regeln für Investoren und Auswanderer',
    views: '13K',
  },
  {
    id: 'DnKhmkOFL9U',
    title: 'Serbien Praxischeck: Digitale Signatur für Gründung & Bankkonto',
    views: '5.9K',
  },
  {
    id: 'uban5YIvfUo',
    title: 'Auswandern nach Montenegro - die größten Fehler',
    views: '95',
  },
  {
    id: 'FANbDs5ZazY',
    title: 'Rožaje, die wirtschaftliche Perle des montenegrinischen Nordens',
    views: '477',
  },
  {
    id: '2Ddyp6HiDWI',
    title: 'Žabljak Projekt: Beste Lage im Durmitor Gebirge',
    views: '369',
  },
];

const VideoCard = ({ video }) => {
  const thumbnail = `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`;

  return (
    <a
      href={`https://www.youtube.com/watch?v=${video.id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex-shrink-0 w-[280px] sm:w-[340px] block"
      data-testid={`video-card-${video.id}`}
    >
      <div className="relative overflow-hidden rounded-xl border border-ea-gold/20">
        <img
          src={thumbnail}
          alt={video.title}
          className="w-full h-[170px] sm:h-[190px] object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-ea-dark/30 group-hover:bg-ea-dark/10 transition-all duration-300 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-ea-dark/80 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform border-2 border-ea-gold/40">
            <Play className="w-6 h-6 text-ea-gold ml-1" fill="currentColor" />
          </div>
        </div>
        <div className="absolute top-3 right-3 bg-ea-dark/70 text-ea-gold text-xs font-medium px-2 py-1 rounded-md">
          {video.views} Views
        </div>
      </div>
      <div className="mt-3 px-1">
        <h3 className="text-sm font-semibold text-ea-dark leading-tight line-clamp-2 group-hover:text-ea-gold transition-colors">
          {video.title}
        </h3>
      </div>
    </a>
  );
};

const YouTubeSlider = () => {
  const duplicated = [...videos, ...videos];

  return (
    <section className="py-16 md:py-20 bg-ea-light overflow-hidden" data-testid="youtube-slider-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-ea-gold font-semibold text-sm tracking-wider uppercase mb-2">YouTube Kanal</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-ea-dark">
              Unsere neuesten Videos
            </h2>
          </div>
          <a
            href="https://youtube.com/@euroadriacs"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-ea-dark text-ea-gold font-semibold rounded-lg hover:bg-ea-navy transition-all text-sm border border-ea-gold/20"
            data-testid="youtube-channel-link"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="#D5B781" d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"/>
              <path fill="#04150F" d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
            <span>Kanal abonnieren</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Auto-scrolling marquee - pure CSS */}
      <div className="yt-marquee">
        <div className="yt-marquee-track">
          {duplicated.map((video, i) => (
            <VideoCard key={`${video.id}-${i}`} video={video} />
          ))}
        </div>
      </div>

      {/* Mobile CTA */}
      <div className="sm:hidden mt-6 px-4">
        <a
          href="https://youtube.com/@euroadriacs"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 bg-ea-dark text-ea-gold font-semibold rounded-lg hover:bg-ea-navy transition-all text-sm border border-ea-gold/20"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24">
            <path fill="#D5B781" d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"/>
            <path fill="#04150F" d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
          <span>Kanal abonnieren</span>
        </a>
      </div>
    </section>

export default YouTubeSlider;
