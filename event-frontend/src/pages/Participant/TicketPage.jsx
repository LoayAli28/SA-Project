// src/pages/participant/TicketPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTicketById, cancelTicket } from '../../services/ticketService';
import ReviewForm from '../../components/ReviewForm';
import "./TicketPage.css";

/* ── QR Code Canvas ── */
function QRCode({ data, size = 200 }) {
  const canvasRef = React.useRef(null);

  useEffect(() => {
    if (!data || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');
    canvas.width  = size;
    canvas.height = size;

    const gridSize = 21;
    const cellSize = size / gridSize;
    const bytes    = [];
    for (let i = 0; i < data.length; i++) bytes.push(data.charCodeAt(i));

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    const drawFinder = (x, y) => {
      ctx.fillStyle = '#111827';
      ctx.fillRect(x * cellSize, y * cellSize, 7 * cellSize, 7 * cellSize);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect((x + 1) * cellSize, (y + 1) * cellSize, 5 * cellSize, 5 * cellSize);
      ctx.fillStyle = '#111827';
      ctx.fillRect((x + 2) * cellSize, (y + 2) * cellSize, 3 * cellSize, 3 * cellSize);
    };
    drawFinder(0, 0);
    drawFinder(gridSize - 7, 0);
    drawFinder(0, gridSize - 7);

    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        const inFinder = (r < 8 && c < 8) || (r < 8 && c >= gridSize - 8) || (r >= gridSize - 8 && c < 8);
        if (inFinder) continue;
        const idx = (r * gridSize + c) % bytes.length;
        const bit = (bytes[idx] >> ((r + c) % 8)) & 1;
        if (bit) {
          ctx.fillStyle = '#111827';
          ctx.fillRect(c * cellSize + 1, r * cellSize + 1, cellSize - 1, cellSize - 1);
        }
      }
    }
  }, [data, size]);

  return (
    <div className="ticket-qr-canvas-wrap">
      <canvas ref={canvasRef} style={{ display: 'block' }} />
      <p className="ticket-qr-canvas-label">{data}</p>
    </div>
  );
}

export default function TicketPage() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [ticket,     setTicket]     = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [canceling,  setCanceling]  = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [reviewDone, setReviewDone] = useState(false);

  useEffect(() => {
    getTicketById(id)
      .then(res => setTicket(res?.data || res))
      .catch(() => setTicket(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this ticket?')) return;
    setCanceling(true);
    try {
      await cancelTicket(ticket.ticketId);
      setTicket(prev => ({ ...prev, status: 'Cancelled' }));
    } catch (err) {
      alert(err.response?.data?.message || 'Cancel failed');
    } finally {
      setCanceling(false);
    }
  };

  if (loading) return <div className="page-container flex-center"><div className="spinner" /></div>;

  if (!ticket) return (
    <div className="page-container flex-center ticket-notfound">
      <h2>Ticket Not Found</h2>
      <button className="btn btn-primary" onClick={() => navigate('/my-tickets')}>Back to My Tickets</button>
    </div>
  );

  const isActive    = ticket.status === 'Active';
  const isCheckedIn = ticket.status === 'CheckedIn';
  const isCancelled = ticket.status === 'Cancelled';

  const statusMap = {
    Active:    'active',
    CheckedIn: 'checkedin',
    Cancelled: 'cancelled',
    Expired:   'expired',
  };

  const statusLabels = {
    Active:    '✓ ACTIVE',
    CheckedIn: '✓ CHECKED IN',
    Cancelled: '✕ CANCELLED',
    Expired:   'EXPIRED',
  };

  const statusClass = statusMap[ticket.status] || 'expired';
  const statusLabel = statusLabels[ticket.status] || ticket.status;
  const qrToken     = ticket.qrCodeData || ticket.ticketId?.replace(/-/g, '') || 'INVALID';

  return (
    <div className="ticket-page">
      <div className="ticket-page-inner">

        {/* Main Ticket Card */}
        <div className="ticket-main-card">

          {/* Orange Header — just the title, like the screenshot */}
          <div className="ticket-main-header">
            <h2 className="ticket-event-title">{ticket.eventTitle}</h2>
          </div>

          {/* Body */}
          <div className="ticket-main-body">

            {/* Status badge — shown inside body */}
            <div className={`ticket-status-badge ${statusClass}`}>{statusLabel}</div>

            {/* Location & Date — centered, like screenshot */}
            <div className="ticket-meta-row2">
              <span>📍 {ticket.eventLocation || '—'}</span>
            </div>
            <div className="ticket-meta-row">
              <span>
                📅 {ticket.eventStartDate
                  ? new Date(ticket.eventStartDate).toLocaleString('en-US', {
                      month: 'numeric', day: 'numeric', year: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })
                  : '—'}
              </span>
            </div>

            {/* QR Code — big and centered like screenshot */}
            <div className="ticket-qr-area">
              {isCancelled ? (
                <div className="ticket-cancelled-qr">
                  ❌ Ticket Cancelled
                  <span>QR code is no longer valid</span>
                </div>
              ) : isCheckedIn ? (
                <div className="ticket-qr-inner">
                  <QRCode data={qrToken} size={190} />
                  <div className="ticket-checkedin-notice">
                    ✅ Checked in at {ticket.checkedInAt ? new Date(ticket.checkedInAt).toLocaleTimeString() : '—'}
                  </div>
                </div>
              ) : (
                <QRCode data={qrToken} size={200} />
              )}
            </div>

            {/* Ticket ID & Price — like screenshot */}
            <div className="ticket-meta-row">
              <span>Ticket ID: <strong>{ticket.ticketId}</strong></span>
            </div>
            <div className="ticket-meta-row2">
              <span>Ticket Type: <strong>{ticket.ticketType || 'General'}</strong></span>
            </div>
            <div className="ticket-meta-row2">
              <span>Price: <strong>{ticket.price === 0 ? 'Free' : `$${ticket.price}`}</strong></span>
            </div>

            {ticket.checkedInAt && (
              <div className="ticket-purchase-time">
                Purchased: {ticket.purchasedAt ? new Date(ticket.purchasedAt).toLocaleString() : '—'}
              </div>
            )}

            {/* Divider before buttons */}
            <hr className="ticket-inner-sep" />

            {/* Action Buttons — inside the card, like screenshot */}
            <div className="ticket-actions">
              {isActive && (
                <button className="ticket-cancel-action" onClick={handleCancel} disabled={canceling}>
                  {canceling ? 'Canceling…' : '✕ Cancel Ticket'}
                </button>
              )}
              <button className="ticket-back-btn" onClick={() => navigate('/my-tickets')}>
                ← Back to My Tickets
              </button>
            </div>

          </div>
        </div>

        {/* Review Section */}
        {isCheckedIn && !reviewDone && (
          <div className="ticket-review-section">
            <div className="ticket-review-header">
              <div className="ticket-review-icon">⭐</div>
              <h3>How was the event?</h3>
              <p>You attended — share your experience!</p>
            </div>
            {showReview ? (
              <ReviewForm eventId={ticket.eventId} onReviewAdded={() => setReviewDone(true)} />
            ) : (
              <button className="ticket-write-review-btn" onClick={() => setShowReview(true)}>
                Write a Review
              </button>
            )}
          </div>
        )}

        {reviewDone && (
          <div className="ticket-review-done">✅ Thanks for your review!</div>
        )}

      </div>
    </div>
  );
}