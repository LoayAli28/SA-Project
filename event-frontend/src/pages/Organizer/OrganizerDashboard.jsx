// src/pages/Organizer/OrganizerDashboard.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getOrganizerStats } from '../../services/eventService';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './OrganizerDashboard.css';

export default function OrganizerDashboard() {
  const { user }                    = useAuth();
  const [stats, setStats]           = useState(null);
  const [loading, setLoading]       = useState(true);
  const [orgStatus, setOrgStatus]   = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      await api.get('/auth/me');
      const res  = await getOrganizerStats();
      setStats(res.data);
      setOrgStatus('approved');
    } catch (err) {
      const msg = err.response?.data?.message || '';
      if (msg.includes('approved')) setOrgStatus('pending');
      setStats({ totalEvents: 0, totalTicketsSold: 0, totalRevenue: 0, events: [] });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="page-container flex-center"><div className="spinner" /></div>;

  /* ── Pending banner ─────────────────────────────────────────── */
  if (orgStatus === 'pending') {
    return (
      <div className="page-container">
        <div className="org-pending-banner">
          <div className="org-pending-icon">⏳</div>
          <h2>Account Pending Approval</h2>
          <p>Your organizer account is under review. You'll be notified once approved.</p>
          <p className="org-pending-user">
            Logged in as: <strong>{user?.fullName}</strong> ({user?.email})
          </p>
        </div>
      </div>
    );
  }

  const {
    totalEvents       = 0,
    totalTicketsSold  = 0,
    totalRevenue      = 0,
    events            = [],
  } = stats || {};

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
          <h2>{totalTicketsSold}</h2>
        </div>
        <div className="org-stat-card">
          <div>Total Revenue</div>
          <h2>${totalRevenue.toLocaleString()}</h2>
        </div>
        <div className="org-stat-card">
          <div>Active Events</div>
          <h2>{events.length}</h2>
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
            <div key={e._id} className="org-table-row">
              <div>
                <div className="org-event-name">{e.title || 'Untitled'}</div>
                <div className="org-event-date">{formatDate(e.date)}</div>
              </div>
              <div className="org-event-venue">{e.location || '-'}</div>
              <div>
                <span className="org-badge org-badge-approved">
                  {e.ticketsSold} / {e.totalTickets} booked
                </span>
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
              <span>Occupancy</span>
            </div>
            {events.map(e => (
              <div key={e._id} className="org-analytics-row">
                <div>
                  <div className="org-analytics-event-name">{e.title}</div>
                  <div className="org-analytics-event-cat">
                    {e.category}{e.date ? ` • ${formatDate(e.date)}` : ''}
                  </div>
                </div>
                <div>
                  <span className="org-analytics-val orange">{e.ticketsSold}</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {' '}/ {e.totalTickets}
                  </span>
                </div>
                <div>
                  <span className="org-analytics-val green">${(e.revenue || 0).toLocaleString()}</span>
                </div>
                <div className="org-progress-wrap">
                  <div className="org-progress-bar">
                    <div
                      className="org-progress-fill"
                      style={{ width: `${e.occupancyPct || 0}%` }}
                    />
                  </div>
                  <span className="org-progress-pct">{e.occupancyPct || 0}%</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

    </div>
  );
}