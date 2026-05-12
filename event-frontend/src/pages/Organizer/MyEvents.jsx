// src/pages/Organizer/MyEvents.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getMyEvents, deleteEvent } from '../../services/eventService';
import './MyEvents.css';

/*  Toast  */
function Toast({ msg, type, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className={`me-toast me-toast-${type}`}>
      <span>{type === 'success' ? '✓' : '✕'}</span>
      <span>{msg}</span>
    </div>
  );
}

export default function MyEvents() {
  const [events, setEvents]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast]     = useState(null);
  const location              = useLocation();
  const navigate              = useNavigate();

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  /* Load events*/
  useEffect(() => {
    setLoading(true);
    getMyEvents()
      .then(res => {
        const data = res?.data;
        setEvents(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        showToast('Failed to load events', 'error');
        setEvents([]);
      })
      .finally(() => setLoading(false));
  }, [location.key]);

  /* Delete */
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event? This action cannot be undone.')) return;
    try {
      await deleteEvent(id);
      setEvents(prev => prev.filter(e => (e._id || e.id) !== id));
      showToast('Event deleted successfully');
    } catch (err) {
      const msg = err.response?.data?.error || 'Delete failed';
      showToast(msg, 'error');
    }
  };

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : '-';

  if (loading) return (
    <div className="me-page flex-center">
      <div className="spinner" />
    </div>
  );

  return (
    <div className="me-page">

      {/* Header */}
      <div className="me-header">
        <div>
          <h1 className="me-title">My Events</h1>
          <p>{events.length} event{events.length !== 1 ? 's' : ''}</p>
        </div>
        <Link to="/organizer/create" className="me-btn-create">+ Create Event</Link>
      </div>

      {/* Empty */}
      {events.length === 0 ? (
        <div className="me-empty">
          <p>No events found.</p>
          <Link to="/organizer/create">Create your first event →</Link>
        </div>
      ) : (
        <table className="me-table">
          <thead>
            <tr>
              <th>Event</th>
              <th>Date</th>
              <th>Booking Progress</th>
              <th>Revenue</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map(e => {
              const total   = e.totalTickets   || 0;
              const avail   = e.availableSeats ?? total;
              const sold    = total - avail;
              const revenue = sold * (e.price || 0);
              const pct     = total > 0 ? Math.round((sold / total) * 100) : 0;
              const eventId = e._id || e.id;

              return (
                <tr key={eventId}>
                  {/* Event Info */}
                  <td>
                    <div className="me-event-cell">
                      <div className="me-thumb-ph">🎪</div>
                      <div>
                        <div className="me-event-name">{e.title || 'Untitled'}</div>
                        <div className="me-event-meta">
                          <span>📍 {e.location || '-'}</span>
                          <span>🏷 {e.category || '-'}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Date */}
                  <td>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      📅 {formatDate(e.date)}
                    </span>
                  </td>

                  {/* Booking Progress */}
                  <td>
                    <div className="me-bar-wrap">
                      <span className="me-bar-label">{sold} / {total} Tickets Booked</span>
                      <div className="me-bar-track">
                        <div
                          className={`me-bar-fill${pct >= 100 ? ' full' : ''}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {avail} remaining
                      </span>
                    </div>
                  </td>

                  {/* Revenue */}
                  <td>
                    <span className="me-revenue">
                      {e.price === 0 ? 'Free' : `$${revenue.toLocaleString()}`}
                    </span>
                  </td>

                  {/* Actions */}
                  <td>
                    <div className="me-actions">
                      <button
                        className="me-btn-action"
                        onClick={() => navigate(`/organizer/${eventId}/edit`)}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="me-btn-action danger"
                        onClick={() => handleDelete(eventId)}
                      >
                        🗑 Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {toast && (
        <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />
      )}

    </div>
  );
}