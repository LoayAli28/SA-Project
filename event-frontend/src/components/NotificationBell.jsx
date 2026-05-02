import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import useNotifications from '../hooks/useNotifications';

const TYPE_ICON = {
  TicketPurchased:  '🎫',
  EventApproved:    '✅',
  EventRejected:    '❌',
  OrganizerApproved:'🎉',
  EventReminder:    '⏰',
  NewReview:        '⭐',
  Information:      'ℹ️',
};

export default function NotificationBell() {
  const { user, token } = useAuth();
  const [open, setOpen] = useState(false);
  const dropRef = useRef(null);

  const { notifications, unreadCount, loading, markRead, markAll } =
    useNotifications(user, token);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!user) return null;

  return (
    <div style={{ position: 'relative' }} ref={dropRef}>

      {/* Bell */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: '20px', position: 'relative',
          padding: '4px 8px', lineHeight: 1,
        }}
        title="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: '-4px', right: '0px',
            background: '#ef4444', color: '#fff', fontSize: '10px',
            borderRadius: '50%', minWidth: '18px', height: '18px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 'bold', padding: '0 3px',
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', right: 0, top: '40px',
          background: '#fff', borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          width: '340px', zIndex: 2000,
          border: '1px solid #e5e7eb', overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '12px 16px', borderBottom: '1px solid #f3f4f6',
            background: '#fafafa',
          }}>
            <strong style={{ fontSize: '14px', color: '#111827' }}>
              Notifications {unreadCount > 0 && <span style={{ color: '#6366f1' }}>({unreadCount})</span>}
            </strong>
            {unreadCount > 0 && (
              <button onClick={markAll} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '12px', color: '#6366f1', fontWeight: '600',
              }}>
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#6b7280', fontSize: '13px' }}>
                Loading…
              </div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: '#9ca3af' }}>
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>🔕</div>
                <div style={{ fontSize: '13px' }}>No notifications yet</div>
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => !n.isRead && markRead(n.id)}
                  style={{
                    padding: '11px 16px',
                    borderBottom: '1px solid #f9fafb',
                    background: n.isRead ? '#fff' : '#eef2ff',
                    cursor: n.isRead ? 'default' : 'pointer',
                    display: 'flex', gap: '10px', alignItems: 'flex-start',
                  }}
                >
                  <span style={{ fontSize: '16px', flexShrink: 0, marginTop: '1px' }}>
                    {TYPE_ICON[n.type] || 'ℹ️'}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontWeight: n.isRead ? '400' : '600',
                      fontSize: '13px', color: '#111827',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {n.title}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px', lineHeight: '1.4' }}>
                      {n.message}
                    </div>
                    <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '3px' }}>
                      {new Date(n.createdAt).toLocaleString()}
                    </div>
                  </div>
                  {!n.isRead && (
                    <div style={{
                      width: '8px', height: '8px', borderRadius: '50%',
                      background: '#6366f1', flexShrink: 0, marginTop: '4px',
                    }} />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
