import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { purchaseTicket } from '../../services/ticketService';
import { getEvents } from '../../services/eventService';

export default function ParticipantDashboard() {
  const { user } = useAuth();
  const [events, setEvents]                   = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [selectedSeat, setSelectedSeat]       = useState('');
  const [message, setMessage]                 = useState('');
  const [error, setError]                     = useState('');
  const [loading, setLoading]                 = useState(false);
  const [eventsLoading, setEventsLoading]     = useState(true);

  useEffect(() => {
    setEventsLoading(true);
    getEvents()
      .then((res) => {
        const data = res?.data || [];
        setEvents(Array.isArray(data) ? data : []);
      })
      .catch(() => setEvents([]))
      .finally(() => setEventsLoading(false));
  }, []);

  const selectedEvent = events.find(
    (e) => (e._id || e.eventId) === selectedEventId
  );

  // Refresh events list after booking to update seat counts
  const refreshEvents = () => {
    getEvents()
      .then(res => {
        const data = res?.data || [];
        setEvents(Array.isArray(data) ? data : []);
      })
      .catch(() => {});
  };

  const generateSeats = (event) => {
    if (!event) return [];
    const total = event.availableSeats || event.totalTickets || 10;
    const seats = [];
    const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
    let count = 0;
    for (const row of rows) {
      for (let n = 1; n <= 10 && count < total; n++, count++) {
        seats.push(`${row}${n}`);
      }
    }
    return seats;
  };

  const seatOptions = generateSeats(selectedEvent);

  const handleBook = async () => {
    if (!selectedEventId || !selectedSeat) return;
    setMessage('');
    setError('');
    setLoading(true);
    try {
      await purchaseTicket({
        eventId:       selectedEventId,
        eventTitle:    selectedEvent?.title || selectedEventId,
        seat:          selectedSeat,
        userEmail:     user?.email,
        eventDate:     selectedEvent?.date,
        eventLocation: selectedEvent?.location,
      });
      setMessage(`✅ Ticket booked for seat ${selectedSeat}! Your seat has been reserved.`);
      setSelectedEventId('');
      setSelectedSeat('');
      refreshEvents();  // update seat counts
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || err.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  /* ─────────── shared styles ─────────── */
  const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--border)',
    backgroundColor: 'var(--bg-light)',
    color: 'var(--text-main)',
    fontSize: '0.95rem',
    outline: 'none',
    cursor: 'pointer',
    boxSizing: 'border-box',
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '6px',
    color: 'var(--text-muted)',
    fontSize: '0.85rem',
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-dark)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
    }}>
      <div style={{
        backgroundColor: 'var(--bg-card)',
        borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow)',
        padding: '40px',
        width: '100%',
        maxWidth: '520px',
      }}>
        <h2 style={{ color: 'var(--primary)', marginBottom: '8px', fontSize: '1.6rem' }}>
           Book a Ticket
        </h2>

        {user?.email && (
          <p style={{ color: 'var(--text-muted)', marginBottom: '28px', fontSize: '0.9rem' }}>
            Logged in as:{' '}
            <span style={{ color: 'var(--text-main)' }}>{user.email}</span>
          </p>
        )}

        {/* ── Select Event ── */}
        <div style={{ marginBottom: '18px' }}>
          <label style={labelStyle}>Select Event</label>

          {eventsLoading ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading events...</p>
          ) : events.length === 0 ? (
            <p style={{ color: 'var(--danger)', fontSize: '0.9rem' }}>No available events.</p>
          ) : (
            <select
              value={selectedEventId}
              onChange={(e) => { setSelectedEventId(e.target.value); setSelectedSeat(''); }}
              style={{ ...inputStyle, color: selectedEventId ? 'var(--text-main)' : 'var(--text-muted)' }}
            >
              <option value="">-- Choose an event --</option>
              {events.map((ev) => {
                const id    = ev._id || ev.eventId;
                const seats = ev.availableSeats ?? ev.capacity ?? '?';
                return (
                  <option key={id} value={id}>
                    {ev.title} — {seats} seats left
                  </option>
                );
              })}
            </select>
          )}
        </div>

        {/* ── Event Preview ── */}
        {selectedEvent && (
          <div style={{
            marginBottom: '18px',
            padding: '14px 16px',
            backgroundColor: 'var(--bg-light)',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
            fontSize: '0.88rem',
            color: 'var(--text-muted)',
            lineHeight: '1.8',
          }}>
            <strong style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>
              {selectedEvent.title}
            </strong>
            {selectedEvent.category && (
              <div>
                Category:{' '}
                <span style={{ color: 'var(--primary)' }}>{selectedEvent.category}</span>
              </div>
            )}
            {selectedEvent.date && (
              <div>
                Date:{' '}
                {new Date(selectedEvent.date).toLocaleDateString('en-US', {
                  day: '2-digit', month: 'short', year: 'numeric',
                })}
              </div>
            )}
            <div>
              Available Seats:{' '}
              <strong style={{ color: 'var(--success)' }}>
                {selectedEvent.availableSeats ?? selectedEvent.capacity ?? 'N/A'}
              </strong>
            </div>
          </div>
        )}

        {/* ── Choose Seat ── */}
        {selectedEvent && (
          <div style={{ marginBottom: '28px' }}>
            <label style={labelStyle}>Choose Seat</label>
            <select
              value={selectedSeat}
              onChange={(e) => setSelectedSeat(e.target.value)}
              style={{ ...inputStyle, color: selectedSeat ? 'var(--text-main)' : 'var(--text-muted)' }}
            >
              <option value="">-- Pick a seat --</option>
              {seatOptions.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        )}

        {/* ── Book Button ── */}
        <button
          onClick={handleBook}
          disabled={loading || !selectedEventId || !selectedSeat}
          className="btn btn-primary"
          style={{
            width: '100%',
            padding: '13px',
            fontSize: '1rem',
            opacity: (loading || !selectedEventId || !selectedSeat) ? 0.6 : 1,
            cursor: (loading || !selectedEventId || !selectedSeat) ? 'not-allowed' : 'pointer',
          }}
        >
          {loading
            ? 'Booking...'
            : selectedSeat
              ? `Book Ticket — Seat ${selectedSeat}`
              : 'Book Ticket'}
        </button>

        {message && (
          <div style={{
            marginTop: '18px', padding: '12px 16px',
            backgroundColor: 'rgba(40,199,111,0.1)',
            border: '1px solid var(--success)',
            borderRadius: 'var(--radius)',
            color: 'var(--success)', fontSize: '0.9rem',
          }}>
             {message}
          </div>
        )}

        {error && (
          <div style={{
            marginTop: '18px', padding: '12px 16px',
            backgroundColor: 'rgba(234,84,85,0.1)',
            border: '1px solid var(--danger)',
            borderRadius: 'var(--radius)',
            color: 'var(--danger)', fontSize: '0.9rem',
          }}>
             {error}
          </div>
        )}
      </div>
    </div>
  );
}