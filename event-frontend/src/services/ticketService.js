// src/services/ticketService.js
import { ticketApi } from './api';

/* ── Book a ticket ──────────────────────────────────────────── */
export const purchaseTicket = async ({
  eventId,
  eventTitle,
  seat,
  userEmail,
  eventDate,
  eventLocation,
}) => {
  const res = await ticketApi.post('/tickets', {
    eventId,
    seat,
    userId:     userEmail,   // backend field name is `userId` but receives the email
    eventTitle,
  });
  return res;
};

/* ── Get all tickets for the logged-in user ─────────────────── */
export const getMyTickets = async () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (!user.email) return { data: [] };
  const res = await ticketApi.get(`/tickets/user/${encodeURIComponent(user.email)}`);
  // Normalise: backend returns plain array
  const tickets = Array.isArray(res.data) ? res.data : [];
  return {
    data: tickets.map(t => ({
      ticketId:       t._id || t.ticketId,
      eventId:        t.eventId,
      eventTitle:     t.eventTitle,
      seat:           t.seat,
      status:         t.status,
      ticketType:     'General',
      eventStartDate: t.eventDate || t.createdAt,
      eventLocation:  t.eventLocation || '',
      quantity:       1,
    })),
  };
};

/* ── Get a single ticket by ID ──────────────────────────────── */
export const getTicketById = async (ticketId) => {
  const res = await ticketApi.get(`/tickets/${ticketId}`);
  const t   = res.data;
  return {
    data: {
      ticketId:       t._id || t.ticketId,
      eventId:        t.eventId,
      eventTitle:     t.eventTitle,
      seat:           t.seat,
      status:         t.status,
      ticketType:     'General',
      eventStartDate: t.eventDate || t.createdAt,
      eventLocation:  t.eventLocation || '',
    },
  };
};

/* ── Cancel a ticket ────────────────────────────────────────── */
export const cancelTicket = async (ticketId) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const res  = await ticketApi.patch(`/tickets/${ticketId}/cancel`, {
    userEmail: user.email,
  });
  return res;
};

export const scanTicket = () => Promise.resolve({ data: { status: 'CheckedIn' } });