// src/services/eventService.js
import { eventApi } from './api';

/* ── All events ─────────────────────────────────────────────── */
export const getEvents    = () => eventApi.get('/events').catch(() => ({ data: [] }));
export const getAllEvents  = () => eventApi.get('/events').catch(() => ({ data: [] }));
export const getEventById = (id) => eventApi.get(`/events/${id}`).catch(() => ({ data: null }));

/* ── Categories (static, no dedicated endpoint needed) ──────── */
const STATIC_CATEGORIES = [
  { categoryId: 'Music',      name: 'Music' },
  { categoryId: 'Sports',     name: 'Sports' },
  { categoryId: 'Conference', name: 'Conference' },
  { categoryId: 'Workshop',   name: 'Workshop' },
  { categoryId: 'Other',      name: 'Other' },
];
export const getCategories = () => ({ data: STATIC_CATEGORIES });

/* ── Organizer-scoped reads ─────────────────────────────────── */
export const getMyEvents = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (!user.email) return Promise.resolve({ data: [] });
  return eventApi
    .get(`/events/organizer/${encodeURIComponent(user.email)}`)
    .catch(() => ({ data: [] }));
};

/**
 * Dashboard statistics for the logged-in organizer.
 * Returns: { totalEvents, totalTicketsSold, totalRevenue, events[] }
 */
export const getOrganizerStats = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (!user.email) return Promise.resolve({ data: { totalEvents: 0, totalTicketsSold: 0, totalRevenue: 0, events: [] } });
  return eventApi
    .get(`/events/organizer/dashboard-stats/${encodeURIComponent(user.email)}`)
    .catch(() => ({ data: { totalEvents: 0, totalTicketsSold: 0, totalRevenue: 0, events: [] } }));
};

/* ── Mutations ──────────────────────────────────────────────── */
export const createEvent = (data) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return eventApi.post('/events', {
    ...data,
    organizerEmail: user.email,
  });
};

export const updateEvent = (id, data) => eventApi.put(`/events/${id}`, data);

export const deleteEvent = (id) => eventApi.delete(`/events/${id}`);

export const uploadThumbnail  = ()          => Promise.resolve({});
export const uploadAttachment = ()          => Promise.resolve({});