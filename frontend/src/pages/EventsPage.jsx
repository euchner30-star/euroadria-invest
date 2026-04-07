import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Clock, ExternalLink, Loader2, ArrowRight } from 'lucide-react';
import SEO from '../components/SEO';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const EventCard = ({ event }) => {
  const eventDate = new Date(event.date);
  const isPast = eventDate < new Date();
  const isCancelled = event.status === 'cancelled';

  const typeColors = {
    'Event': 'bg-ea-gold/10 text-ea-gold border-ea-gold/30',
    'Webinar': 'bg-blue-500/10 text-blue-500 border-blue-500/30',
    'Workshop': 'bg-green-500/10 text-green-500 border-green-500/30'
  };

  return (
    <div
      className={`bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 ${
        isPast || isCancelled ? 'opacity-60' : ''
      }`}
      data-testid={`event-card-${event.id}`}
    >
      {event.image && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4">
            <span className={`text-xs px-3 py-1.5 rounded-full font-medium border ${typeColors[event.type] || typeColors['Event']}`}>
              {event.type}
            </span>
          </div>
          {isCancelled && (
            <div className="absolute top-4 right-4 bg-red-500 text-white text-xs px-3 py-1.5 rounded-full font-bold">
              Abgesagt
            </div>
          )}
        </div>
      )}

      <div className="p-6">
        <div className="flex items-center gap-4 text-xs text-ea-dark/50 mb-3">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {eventDate.toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })}
          </span>
          {event.time && (
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {event.time} Uhr
            </span>
          )}
        </div>

        <h3 className="text-xl font-semibold text-ea-dark mb-2">{event.title}</h3>
        <p className="text-ea-dark/60 text-sm leading-relaxed mb-4">{event.description}</p>

        {event.location && (
          <div className="flex items-center gap-1.5 text-ea-dark/50 text-sm mb-4">
            <MapPin className="w-3.5 h-3.5" />
            {event.location}
          </div>
        )}

        {event.link && !isPast && !isCancelled && (
          <a
            href={event.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-ea-dark text-white font-semibold rounded-lg hover:bg-ea-navy transition-all text-sm"
            data-testid={`event-register-${event.id}`}
          >
            Jetzt anmelden
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}

        {isPast && !isCancelled && (
          <span className="text-ea-dark/40 text-sm font-medium">Vergangenes Event</span>
        )}

        {/* Social Links */}
        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
          <span className="text-xs text-ea-dark/40">Teilen:</span>
          <a href="https://www.facebook.com/share/1Ckiys8xJw/" target="_blank" rel="noopener noreferrer" className="text-ea-dark/30 hover:text-[#1877F2] transition-colors" aria-label="Facebook">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          </a>
          <a href="https://www.instagram.com/euroadria.me" target="_blank" rel="noopener noreferrer" className="text-ea-dark/30 hover:text-[#E4405F] transition-colors" aria-label="Instagram">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
          </a>
          <a href="https://www.linkedin.com/company/euroadria/" target="_blank" rel="noopener noreferrer" className="text-ea-dark/30 hover:text-[#0A66C2] transition-colors" aria-label="LinkedIn">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          </a>
          <a href="https://youtube.com/@euroadriacs" target="_blank" rel="noopener noreferrer" className="text-ea-dark/30 hover:text-[#FF0000] transition-colors" aria-label="YouTube">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
          </a>
        </div>
      </div>
    </div>
  );
};

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch(`${API_URL}/api/events`);
        if (res.ok) {
          const data = await res.json();
          setEvents(data);
        }
      } catch (err) {
        console.error('Failed to fetch events:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const upcomingEvents = events.filter(e => new Date(e.date) >= new Date() && e.status !== 'cancelled');
  const pastEvents = events.filter(e => new Date(e.date) < new Date() || e.status === 'cancelled');

  return (
    <div className="min-h-screen pt-28 bg-white">
      <SEO
        title="Events, Webinare & Workshops"
        description="Aktuelle Events, Workshops und Webinare rund um Firmengründung, Auswanderung und Investments in Montenegro und Serbien."
        url="/events"
      />

      {/* Hero */}
      <section className="py-16 bg-ea-light border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-block bg-ea-gold/10 border border-ea-gold/30 text-sm text-ea-dark px-4 py-2 rounded-full mb-6 font-medium">
            Wissen. Netzwerk. Chancen.
          </div>
          <h1 className="text-4xl sm:text-5xl font-semibold text-ea-dark mb-6 leading-tight">
            EuroAdria Corporate Solutions <span className="text-ea-gold">Events</span>
          </h1>
          <p className="text-ea-dark/70 text-lg max-w-3xl mx-auto leading-relaxed">
            Aktuelle Events, Workshops und Webinare rund um Firmengründung, 
            Auswanderung und Investments in der Adria-Region.
          </p>
        </div>
      </section>

      {/* Events Content */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-10 h-10 text-ea-gold animate-spin" />
            </div>
          ) : events.length === 0 ? (
            /* Empty State / Placeholder */
            <div className="text-center py-16" data-testid="events-empty-state">
              <div className="w-20 h-20 bg-ea-gold/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-10 h-10 text-ea-gold" />
              </div>
              <h2 className="text-2xl font-semibold text-ea-dark mb-4">
                Events & Webinare — <span className="text-ea-gold">coming soon</span>
              </h2>
              <p className="text-ea-dark/60 text-lg max-w-xl mx-auto mb-8">
                Schon bald teilen wir hier exklusive Termine zu Investments, 
                Firmengründung und Auswanderung in Montenegro und Serbien.
              </p>
              <p className="text-ea-dark/40 text-sm mb-8">
                Melden Sie sich für unseren Newsletter an, um als Erster informiert zu werden.
              </p>
              <Link
                to="/contact?betreff=Event-Interesse"
                className="inline-flex items-center gap-2 px-6 py-3 bg-ea-dark text-white font-semibold rounded-lg hover:bg-ea-navy transition-all"
                data-testid="events-notify-btn"
              >
                Interesse bekunden
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <>
              {/* Upcoming Events */}
              {upcomingEvents.length > 0 && (
                <div className="mb-16">
                  <h2 className="text-2xl font-semibold text-ea-dark mb-8">
                    Kommende <span className="text-ea-gold">Events</span>
                  </h2>
                  <div className={`grid gap-8 ${
                    upcomingEvents.length === 1 ? 'grid-cols-1 max-w-lg mx-auto' :
                    upcomingEvents.length === 2 ? 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto' :
                    'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                  }`}>
                    {upcomingEvents.map(event => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                </div>
              )}

              {/* Past Events */}
              {pastEvents.length > 0 && (
                <div>
                  <h2 className="text-2xl font-semibold text-ea-dark/60 mb-8">
                    Vergangene Events
                  </h2>
                  <div className={`grid gap-8 ${
                    pastEvents.length === 1 ? 'grid-cols-1 max-w-lg mx-auto' :
                    pastEvents.length === 2 ? 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto' :
                    'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                  }`}>
                    {pastEvents.map(event => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-ea-dark -mb-px">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-semibold text-white mb-4">
            Eigenes Event <span className="text-ea-gold">planen</span>?
          </h2>
          <p className="text-white/60 text-lg mb-8 max-w-2xl mx-auto">
            Sie möchten ein exklusives Investoren-Event oder Workshop in Montenegro organisieren? 
            Wir unterstützen Sie bei Planung und Durchführung.
          </p>
          <Link
            to="/contact?betreff=Event-Planung"
            className="inline-flex items-center gap-2 px-8 py-4 bg-ea-gold text-ea-dark font-bold rounded-lg hover:bg-ea-gold/90 transition-all text-lg"
            data-testid="events-cta"
          >
            Kontakt aufnehmen
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default EventsPage;
