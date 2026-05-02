// src/pages/participant/Home.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EventCard from '../../../components/EventCard/EventCard';
import { getAllEvents } from '../../../services/eventService';
import './Home.css';

export default function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getAllEvents({ pageSize: 6 }).then(res => {
      // ServiceResult<PagedResult<EventResponseDto>> → .data.items
      const items = res?.data?.items || [];
      setEvents(items);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">
            DISCOVER & <br />
            ATTEND <span className="highlight">AMAZING</span> <br />
            EVENTS
          </h1>
          <p className="hero-subtitle">
            Explore, book, and enjoy the best events around you.
            Your next unforgettable experience starts here.
          </p>
          <button className="btn-primary" onClick={() => navigate('/events')}>
            Explore Events
          </button>
        </div>
      </section>

      {/* ── Featured Events ── */}
      <section className="events-section">
        <div className="events-section-header">
          <h2 className="events-section-title">
            Featured <span className="highlight">Events</span>
          </h2>
          <button
            className="btn-outline"
            onClick={() => navigate('/events')}
          >
            View All →
          </button>
        </div>

        {loading ? (
          <div className="spinner"></div>
        ) : events.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '30px' }}>
            No events available right now.
          </p>
        ) : (
          <div className="home-cards-grid">
          {Array.isArray(events) ? (
    events.slice(0, 6).map(event => (
      <EventCard key={event.eventId} event={event} />
    ))
  ) : (
    <p>Loading events...</p>
  )}
</div>
        )}
      </section>
    </div>
  );
}