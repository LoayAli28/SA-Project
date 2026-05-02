import React from 'react';
import { useNavigate } from 'react-router-dom';
import "./EventCard.css";

export default function EventCard({ event }) {
  const navigate = useNavigate();

  // Support both /events/:id and /event-details/:id routes
  const handleClick = () => navigate(`/events/${event.eventId}`);

  const stars = Math.round(event.averageRating || 0);

  return (
    <div
      className={`card event-card ${event.availableTickets === 0 ? "sold-out" : ""}`}
      onClick={handleClick}
    >
      {/* Thumbnail */}
      {event.thumbnailUrl ? (
        <img src={event.thumbnailUrl} alt={event.title} className="event-card-img" />
      ) : (
        <div className="event-card-img" style={{
          background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display:'flex', alignItems:'center', justifyContent:'center',
          color:'#fff', fontSize:'32px'
        }}>🎪</div>
      )}

      <div className="event-card-body">
        <div className="event-card-badges">
          <span className="badge badge-category">{event.categoryName || 'Event'}</span>
          {event.availableTickets === 0 && (
            <span className="badge badge-soldout">Sold Out</span>
          )}
          {event.status && event.status !== 'Approved' && (
            <span className="badge" style={{background:'#fef3c7', color:'#92400e'}}>
              {event.status}
            </span>
          )}
        </div>

        <h3 className="event-card-title">{event.title}</h3>

        {/* Rating */}
        {event.averageRating > 0 && (
          <div className="rating">
            {'⭐'.repeat(Math.min(stars, 5))}
            <span style={{fontSize:'12px', marginLeft:'4px', color:'#6b7280'}}>
              ({event.averageRating.toFixed(1)})
            </span>
          </div>
        )}

        <p className="event-card-meta">
          📅 {event.startDate ? new Date(event.startDate).toLocaleDateString() : '-'}
        </p>

        <p className="event-card-meta">
          📍 {event.venueName || event.location || '-'}
        </p>

        <p className="event-card-meta" style={{fontSize:'12px', color:'#6b7280'}}>
          🏢 {event.organizerName}
        </p>

        <div className="event-card-footer">
          <span className="price">
            {event.ticketPrice === 0 ? 'Free' : `$${event.ticketPrice}`}
          </span>
          <span className="tickets">
            {event.availableTickets > 0 ? `${event.availableTickets} left` : 'Sold Out'}
          </span>
        </div>
      </div>
    </div>
  );
}
