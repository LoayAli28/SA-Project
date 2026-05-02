// src/pages/organizer/MyEvents.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getMyEvents, deleteEvent } from '../../services/eventService';
import './MyEvents.css';

// ── Toast ──────────────────────────────────────────────────────
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

// ── Helper ─────────────────────────────────────────────────────
const safeArray = (data) =>
  Array.isArray(data)          ? data
  : Array.isArray(data?.data)  ? data.data
  : Array.isArray(data?.items) ? data.items
  : Array.isArray(data?.data?.data) ? data.data.data
  : [];

export default function MyEvents() {
  const [events, setEvents]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [toast, setToast]             = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  // ── Load events ────────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    getMyEvents()
      .then((res) => {
        const items = res?.data?.items;
        setEvents(Array.isArray(items) ? items : safeArray(res));
        setLoading(false);
      })
      .catch(() => {
        showToast('Failed to load events', 'error');
        setEvents([]);
        setLoading(false);
      });
  }, [location.key]);

  // ── Delete ─────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      await deleteEvent(id);
      setEvents(prev => safeArray(prev).filter(e => e.eventId !== id));
      showToast('Event deleted');
    } catch {
      showToast('Delete failed', 'error');
    }
  };

  const safeEvents = safeArray(events);
  const filtered   = statusFilter === 'All'
    ? safeEvents
    : safeEvents.filter(e => e.status === statusFilter);

  const getStatusBadge = (e) => {
    if (e.status === 'Approved')        return <span className="me-badge-approved">✅ Approved</span>;
    if (e.status === 'Rejected')        return <span className="me-badge-rejected">❌ Rejected</span>;
    if (e.status === 'PendingApproval') return <span className="me-badge-pending">⏳ Pending</span>;
    return <span className="me-badge-pending">{e.status || '-'}</span>;
  };

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
          <p>{safeEvents.length} events</p>
        </div>
        <Link to="/organizer/create" className="me-btn-create">+ Create Event</Link>
      </div>

      {/* Filter */}
     

      {/* Empty */}
      {filtered.length === 0 ? (
        <div className="me-empty">
          <p>No events found.</p>
          <Link to="/organizer/create">Create your first event →</Link>
        </div>
      ) : (
        <table className="me-table">
          <thead>
            <tr>
              <th>Event</th>
              <th>Status</th>
              <th>Tickets</th>
              <th>Revenue</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(e => {
              const sold    = (e.maxCapacity || 0) - (e.availableTickets || 0);
              const revenue = sold * (e.ticketPrice || 0);
              const pct     = e.maxCapacity > 0 ? Math.round((sold / e.maxCapacity) * 100) : 0;

              return (
                <tr key={e.eventId || e.id}>
                  {/* Event Info */}
                  <td>
                    <div className="me-event-cell">
                      {e.thumbnailUrl
                        ? <img src={e.thumbnailUrl} alt={e.title} className="me-thumb" />
                        : <div className="me-thumb-ph">🎪</div>
                      }
                      <div>
                        <div className="me-event-name">{e.title || 'Untitled'}</div>
                        <div className="me-event-meta">
                          <span>📅 {e.startDate ? new Date(e.startDate).toLocaleDateString() : '-'}</span>
                          <span>📍 {e.venueName || '-'}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td>
                    {getStatusBadge(e)}
                    {e.status === 'Rejected' && e.rejectionReason && (
                      <div className="me-rejection-reason">Reason: {e.rejectionReason}</div>
                    )}
                  </td>

                  {/* Tickets */}
                  <td>
                    <div className="me-bar-wrap">
                      <span className="me-bar-label">{sold} / {e.maxCapacity || 0}</span>
                      <div className="me-bar-track">
                        <div
                          className={`me-bar-fill${pct >= 100 ? ' full' : ''}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Revenue */}
                  <td>
                    <span className="me-revenue">
                      {e.ticketPrice === 0 ? 'Free' : `$${revenue.toLocaleString()}`}
                    </span>
                  </td>

                  {/* Actions */}
                  <td>
                    <div className="me-actions">
                      <button
                        className="me-btn-action"
                        onClick={() => navigate(`/organizer/${e.eventId}/edit`)}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="me-btn-action danger"
                        onClick={() => handleDelete(e.eventId)}
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