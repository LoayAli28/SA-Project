// src/pages/organizer/OrganizerDashboard.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMyEvents } from '../../services/eventService';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './OrganizerDashboard.css';

const safeArray = (data) =>
  Array.isArray(data?.items) ? data.items
  : Array.isArray(data) ? data
  : [];

export default function OrganizerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [events, setEvents]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [orgStatus, setOrgStatus] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      await api.get('/auth/me');
      const evRes = await getMyEvents();
      const items = evRes?.data?.items || safeArray(evRes?.data) || [];
      setEvents(items);
      setOrgStatus('approved');
    } catch (err) {
      const msg = err.response?.data?.message || '';
      if (msg.includes('approved')) setOrgStatus('pending');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="page-container flex-center"><div className="spinner" /></div>;

  // ── Pending banner ──────────────────────────────────────────
  if (orgStatus === 'pending') {
    return (
      <div className="page-container">
        <div className="org-pending-banner">
          <div className="org-pending-icon">⏳</div>
          <h2>Account Pending Approval</h2>
          <p>
            Your organizer account is under review by our admin team.
            You'll receive a notification once approved and can start creating events.
          </p>
          <p className="org-pending-user">
            Logged in as: <strong>{user?.fullName}</strong> ({user?.email})
          </p>
        </div>
      </div>
    );
  }

  // ── Stats ───────────────────────────────────────────────────
  const totalEvents  = events.length;
  const ticketsSold  = events.reduce((acc, e) => acc + ((e.maxCapacity || 0) - (e.availableTickets || 0)), 0);
  const pendingCount = events.filter(e => (e.status || '').toLowerCase() === 'pendingapproval').length;
  const totalRevenue = events.reduce((acc, e) => {
    const sold = (e.maxCapacity || 0) - (e.availableTickets || 0);
    return acc + sold * (e.ticketPrice || 0);
  }, 0);

  const getStatusBadge = (status) => {
    if (status === 'Approved')       return <span className="org-badge org-badge-approved">✅ Approved</span>;
    if (status === 'Rejected')       return <span className="org-badge org-badge-rejected">❌ Rejected</span>;
    if (status === 'PendingApproval') return <span className="org-badge org-badge-pending">⏳ Pending</span>;
    return <span className="org-badge org-badge-pending">{status}</span>;
  };

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : '-';

  return (
    <div className="page-container">

      {/* Header */}
      <div className="org-header">
        <div>
          <h1>Event Management</h1>
          <p>Welcome, {user?.fullName}</p>
        </div>
        <Link to="/organizer/create" className="org-create-btn">+ Create Event</Link>
      </div>

      {/* Stats */}
      <div className="org-stats">
        <div className="org-stat-card">
          <div>Total Events</div>
          <h2>{totalEvents}</h2>
        </div>
        <div className="org-stat-card">
          <div>Tickets Sold</div>
          <h2>{ticketsSold}</h2>
        </div>
        <div className="org-stat-card">
          <div>Total Revenue</div>
          <h2>${totalRevenue.toLocaleString()}</h2>
        </div>
        <div className="org-stat-card">
          <div>Pending Review</div>
          <h2>{pendingCount}</h2>
        </div>
      </div>

      {/* Recent Events */}
      <div className="org-section-header">
        <h3>Recent Managed Events</h3>
        <Link to="/organizer/events" className="org-view-all">View All</Link>
      </div>

      <div className="org-events-table">
        {events.length === 0 ? (
          <div className="org-table-empty">
            <p>No events yet. <Link to="/organizer/create">Create your first event →</Link></p>
          </div>
        ) : (
          events.slice(0, 3).map(e => (
            <div key={e.eventId} className="org-table-row">
              <div>
                <div className="org-event-name">{e.title || 'Untitled'}</div>
                <div className="org-event-date">{formatDate(e.startDate)}</div>
              </div>
              <div className="org-event-venue">{e.venueName || e.location || '-'}</div>
              <div>{getStatusBadge(e.status)}</div>
              <div>
                <button
                  className="org-action-btn"
                  onClick={() => navigate(`/organizer/${e.eventId}/edit`)}
                >
                  Edit
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Analytics */}
      {events.length > 0 && (
        <>
          <div className="org-section-header">
            <h3>Event Analytics</h3>
          </div>
          <div className="org-analytics">
            <div className="org-analytics-head">
              <span>Event</span>
              <span>Tickets Sold</span>
              <span>Revenue</span>
              <span>Capacity</span>
            </div>
            {events.map(e => {
              const sold    = (e.maxCapacity || 0) - (e.availableTickets || 0);
              const revenue = sold * (e.ticketPrice || 0);
              const pct     = e.maxCapacity > 0 ? Math.round((sold / e.maxCapacity) * 100) : 0;
              return (
                <div key={e.eventId} className="org-analytics-row">
                  <div>
                    <div className="org-analytics-event-name">{e.title}</div>
                    <div className="org-analytics-event-cat">
                      {e.categoryName || ''}{e.startDate ? ` • ${formatDate(e.startDate)}` : ''}
                    </div>
                  </div>
                  <div>
                    <span className="org-analytics-val orange">{sold}</span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}> / {e.maxCapacity || 0}</span>
                  </div>
                  <div>
                    <span className="org-analytics-val green">${revenue.toLocaleString()}</span>
                  </div>
                  <div className="org-progress-wrap">
                    <div className="org-progress-bar">
                      <div className="org-progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="org-progress-pct">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

    </div>
  );
}