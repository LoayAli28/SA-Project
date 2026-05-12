import React from 'react';
import { useNavigate } from 'react-router-dom';
import "./EventCard.css";

export default function EventCard({ event }) {
  const navigate = useNavigate();

  // MongoDB returns _id; some older payloads may use eventId
  const id = event._id || event.eventId;

  const handleClick = () => navigate(`/events/${id}`);

  // Normalise field names: backend uses `price`, frontend used `ticketPrice`
  const price          = event.price ?? event.ticketPrice ?? 0;
  // Backend uses `availableSeats`, fallback to availableTickets
  const availableSeats = event.availableSeats ?? event.availableTickets ?? 0;
  const isSoldOut      = availableSeats === 0;

  return (
    <div
      className={`card event-card ${isSoldOut ? 'sold-out' : ''}`}
      onClick={handleClick}
    >
      {/* Thumbnail */}
      {event.thumbnailUrl ? (
        <img src={event.thumbnailUrl} alt={event.title} className="event-card-img" />
      ) : (
        <div className="event-card-img" style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: '32px',
        }}>🎪</div>
      )}

      <div className="event-card-body">
        <div className="event-card-badges">
          <span className="badge badge-category">{event.category || event.categoryName || 'Event'}</span>
          {isSoldOut && <span className="badge badge-soldout">Sold Out</span>}
        </div>

        <h3 className="event-card-title">{event.title}</h3>

        <p className="event-card-meta">
          📅 {event.date ? new Date(event.date).toLocaleDateString() :
              event.startDate ? new Date(event.startDate).toLocaleDateString() : '-'}
        </p>

        <p className="event-card-meta">
          📍 {event.location || event.venueName || '-'}
        </p>

        <div className="event-card-footer">
          <span className="price">
            {price === 0 ? 'Free' : `$${price}`}
          </span>
          <span className="tickets">
            {isSoldOut ? 'Sold Out' : `${availableSeats} seats left`}
          </span>
        </div>
      </div>
    </div>
  );
}
