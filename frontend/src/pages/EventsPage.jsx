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
            EuroAdria <span className="text-ea-gold">Events</span>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
