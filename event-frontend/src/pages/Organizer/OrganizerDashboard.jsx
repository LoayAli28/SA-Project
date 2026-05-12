// src/pages/Organizer/OrganizerDashboard.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getOrganizerStats } from '../../services/eventService';
import { useAuth } from '../../context/AuthContext';
import './OrganizerDashboard.css';

export default function OrganizerDashboard() {
  const { user }                    = useAuth();
  const [stats, setStats]           = useState(null);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const location                    = useLocation();

  const loadData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    
    try {
      const res = await getOrganizerStats();
      // Ensure we have the structure expected
      if (res && res.data) {
        setStats(res.data);
      } else {
        setStats({ totalEvents: 0, totalTicketsSold: 0, totalRevenue: 0, events: [] });
      }
    } catch (err) {
      console.error('[Dashboard] Error fetching stats:', err);
      setStats({ totalEvents: 0, totalTicketsSold: 0, totalRevenue: 0, events: [] });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Refresh on mount and whenever we navigate back to this page
  useEffect(() => {
    loadData();
    
    // Polling for real-time updates (every 20 seconds)
    const interval = setInterval(() => {
      loadData(true);
    }, 20000);
    
    return () => clearInterval(interval);
  }, [loadData, location.key]);

  if (loading) return (
    <div className="page-container flex-center">
      <div className="spinner" />
    </div>
  );

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
          <h1>Organizer Dashboard</h1>
          <p>Real-time analytics for <span className="highlight">{user?.email}</span></p>
        </div>
        <div className="org-header-actions">
           {refreshing && <span className="org-refreshing-tag">Updating Live...</span>}
           <button className="org-refresh-btn" onClick={() => loadData(false)} title="Refresh Now">🔄</button>
           <Link to="/organizer/create" className="org-create-btn">+ New Event</Link>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="org-stats">
        <div className="org-stat-card">
          <div className="org-stat-icon">📅</div>
          <div className="org-stat-content">
            <div className="org-stat-label">Total Events</div>
            <h2 className="org-stat-value">{totalEvents}</h2>
          </div>
        </div>
        <div className="org-stat-card">
          <div className="org-stat-icon">🎟️</div>
          <div className="org-stat-content">
            <div className="org-stat-label">Tickets Sold</div>
            <h2 className="org-stat-value">{totalTicketsSold}</h2>
          </div>
        </div>
        <div className="org-stat-card">
          <div className="org-stat-icon">💰</div>
          <div className="org-stat-content">
            <div className="org-stat-label">Total Revenue</div>
            <h2 className="org-stat-value">${totalRevenue.toLocaleString()}</h2>
          </div>
        </div>
      </div>

      {/* Detailed Performance Table */}
      <div className="org-section-header">
        <h3>Event Breakdown</h3>
        <Link to="/organizer/events" className="org-view-all">Manage All Events →</Link>
      </div>

      <div className="org-analytics">
        {events.length === 0 ? (
          <div className="org-table-empty">
            <p>No event data found for your account.</p>
            <Link to="/organizer/create" className="btn-primary" style={{marginTop:'15px', display:'inline-block'}}>Create First Event</Link>
          </div>
        ) : (
          <div className="org-analytics-grid">
            <div className="org-analytics-head">
              <span>Event</span>
              <span>Tickets Sold</span>
              <span>Revenue</span>
              <span>Occupancy</span>
            </div>
            {events.map(e => (
              <div key={e._id} className="org-analytics-row">
                <div className="org-event-info">
                  <div className="org-analytics-event-name">{e.title}</div>
                  <div className="org-analytics-event-cat">{e.location} • {formatDate(e.date)}</div>
                </div>
                <div className="org-stat-mini">
                  <span className="org-analytics-val">{e.ticketsSold}</span>
                  <span className="org-subtext">booked</span>
                </div>
                <div className="org-stat-mini">
                  <span className="org-analytics-val success">${(e.revenue || 0).toLocaleString()}</span>
                  <span className="org-subtext">gross</span>
                </div>
                <div className="org-progress-container">
                  <div className="org-progress-info">
                    <span>{e.occupancyPct || 0}%</span>
                    <span>{e.totalTickets - e.ticketsSold} remaining</span>
                  </div>
                  <div className="org-progress-bar">
                    <div
                      className="org-progress-fill"
                      style={{ width: `${e.occupancyPct || 0}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}