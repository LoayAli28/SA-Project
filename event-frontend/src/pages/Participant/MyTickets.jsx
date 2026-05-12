import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyTickets, cancelTicket } from '../../services/ticketService';
import './MyTickets.css';

const statusLabel = (status) => {
  if (!status) return { label: 'Unknown', cls: 'unknown' };
  const s = status.toLowerCase();
  if (s === 'active')    return { label: 'Upcoming',   cls: 'upcoming'  };
  if (s === 'checkedin') return { label: 'Checked In', cls: 'checkedin' };
  if (s === 'cancelled') return { label: 'Cancelled',  cls: 'cancelled' };
  if (s === 'expired')   return { label: 'Completed',  cls: 'completed' };
  return { label: status, cls: 'upcoming' };
};

const PLACEHOLDER_GRADIENTS = [
  'linear-gradient(135deg, #1a0a2e 0%, #4b1a6e 50%, #ff6b35 100%)',
  'linear-gradient(135deg, #0d2b1a 0%, #1a5c2e 50%, #8bc34a 100%)',
  'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #e94560 100%)',
];

export default function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getMyTickets()
      .then((res) => {
        const data = Array.isArray(res?.data) ? res.data
          : Array.isArray(res) ? res : [];
        setTickets(data);
      })
      .catch(() => setTickets([]))
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (ticketId) => {
    if (!window.confirm('Cancel this ticket? Your seat will be released.')) return;
    try {
      await cancelTicket(ticketId);
      setTickets((prev) =>
        prev.map((t) =>
          t.ticketId === ticketId ? { ...t, status: 'Cancelled' } : t
        )
      );
    } catch (err) {
      alert(err.response?.data?.error || err.response?.data?.message || 'Cancel failed');
    }
  };

  if (loading) return (
    <div className="page-container flex-center">
      <div className="spinner" />
    </div>
  );

  if (tickets.length === 0) {
    return (
      <div className="page-container">
        <div className="tickets-page-header">
          <h1>MY TICKETS</h1>
          <p>View and manage your upcoming event entries.</p>
        </div>
        <div className="tickets-empty">
          <h3>No Tickets Found</h3>
          <p>You haven't booked any tickets yet.</p>
          <button className="btn btn-primary" onClick={() => navigate('/participant')}>
            Book a Ticket
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">

      {/* Page Header */}
      <div className="tickets-page-header">
        <h1>MY TICKETS</h1>
        <p>View and manage your upcoming event entries.</p>
      </div>

      {/* Ticket Cards Grid */}
      <div className="tickets-grid">
        {tickets.map((t, idx) => {
          const { label, cls } = statusLabel(t.status);
          const gradient = PLACEHOLDER_GRADIENTS[idx % PLACEHOLDER_GRADIENTS.length];

          return (
            <div key={t.ticketId} className="ticket-card">

              {/*  */}
              <div className="ticket-card-cover">
                {t.eventImageUrl ? (
                  <img src={t.eventImageUrl} alt={t.eventTitle} className="ticket-card-img" />
                ) : (
                  <div className="ticket-card-img-placeholder" style={{ background: gradient }}>
                    {/*     */}
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '12px',
                      gap: '6px',
                    }}>
                      <span style={{
                        fontSize: '1rem',
                        fontWeight: 800,
                        color: '#fff',
                        textAlign: 'center',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        textShadow: '0 2px 8px rgba(0,0,0,0.5)',
                      }}>
                        {t.eventTitle || 'Event'}
                      </span>
                      {t.seat && (
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: 'rgba(255,255,255,0.85)',
                          backgroundColor: 'rgba(0,0,0,0.35)',
                          padding: '3px 12px',
                          borderRadius: '99px',
                          letterSpacing: '2px',
                        }}>
                          SEAT {t.seat}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="ticket-card-body">

                {/* Status + ticket count */}
                <div className="ticket-card-top-row">
                  <span className={`status-badge ${cls}`}>{label}</span>
                  <span className="ticket-count">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    1 Ticket
                  </span>
                </div>

                {/* Event Title */}
                <div className="ticket-card-title">
                  {t.eventTitle || 'Unknown Event'}
                </div>

                {/* Seat Badge */}
                {t.seat && (
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    backgroundColor: 'rgba(255,122,0,0.12)',
                    border: '1px solid rgba(255,122,0,0.35)',
                    borderRadius: '99px',
                    padding: '3px 10px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: 'var(--primary)',
                    letterSpacing: '0.8px',
                    marginBottom: '2px',
                    width: 'fit-content',
                  }}>
                    🪑 Seat {t.seat}
                  </div>
                )}

                {/* Meta: date & location */}
                <div className="ticket-card-meta">
                  {t.eventStartDate
                    ? new Date(t.eventStartDate).toLocaleDateString('en-US', {
                        month: 'short', day: '2-digit', year: 'numeric',
                      })
                    : '-'}
                  {t.eventLocation ? ` • ${t.eventLocation}` : ''}
                </div>

                {/* Footer */}
                <div className="ticket-card-footer">
                  <span className="ticket-card-id">
                    ID: {t.ticketId
                      ? `EH-${String(t.ticketId).slice(-4).padStart(4, '0')}`
                      : '-'}
                  </span>
                  {t.status === 'Active' && (
                    <button
                      className="ticket-card-action"
                      onClick={() => handleCancel(t.ticketId)}
                    >
                      Cancel Ticket
                    </button>
                  )}
                </div>

              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}