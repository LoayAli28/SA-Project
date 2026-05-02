// src/hooks/useNotifications.js
import { useState, useEffect, useRef, useCallback } from 'react';
import { getNotifications, markAsRead, markAllRead } from '../services/notificationService';

export default function useNotifications(user, token) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [loading, setLoading]             = useState(false);
  const intervalRef                       = useRef(null);
  const prevCountRef                      = useRef(0);

  /*Fetch from notification-service  */
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res  = await getNotifications();
      // notification-service  array  
      const data = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
          ? res.data
          : [];

      setNotifications(data);

      const newUnread = data.filter((n) => !n.isRead).length;
      setUnreadCount(newUnread);

      if (newUnread > prevCountRef.current && prevCountRef.current !== 0) {
        triggerBrowserNotif(data.find((n) => !n.isRead));
      }
      prevCountRef.current = newUnread;

    } catch {
    } finally {
      setLoading(false);
    }
  }, [user]);

  /* ── Polling every 15 s  ── */
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    fetchNotifications();
    intervalRef.current = setInterval(fetchNotifications, 15_000);
    return () => clearInterval(intervalRef.current);
  }, [fetchNotifications, user]);

  /* ── Mark single read ── */
  const handleMarkRead = useCallback(async (id) => {
    // optimistic update 
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    try { await markAsRead(id); } catch {}
  }, []);

  /* ── Mark all read ── */
  const handleMarkAll = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    try { await markAllRead(); } catch {}
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    refresh:  fetchNotifications,
    markRead: handleMarkRead,
    markAll:  handleMarkAll,
  };
}

/* ── Browser Notification ── */
function triggerBrowserNotif(notif) {
  if (!notif) return;
  if (Notification.permission === 'granted') {
    new Notification(notif.title || 'Eventra', {
      body: notif.message,
      icon: '/favicon.ico',
    });
  } else if (Notification.permission === 'default') {
    Notification.requestPermission().then((perm) => {
      if (perm === 'granted') {
        new Notification(notif.title || 'Eventra', {
          body: notif.message,
          icon: '/favicon.ico',
        });
      }
    });
  }
}