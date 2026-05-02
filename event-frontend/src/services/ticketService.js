// src/services/ticketService.js
import { ticketApi } from './api';

/* ── localStorage helpers ── */
const KEY = 'myTickets';
const loadTickets = () => {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
  catch { return []; }
};
const saveTickets = (tickets) => localStorage.setItem(KEY, JSON.stringify(tickets));


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
    userId:     userEmail,
    eventTitle,             
  });

  const ticketId = res.data?._id || res.data?.ticketId || Date.now();

  const tickets = loadTickets();
  tickets.push({
    ticketId,
    eventId,
    eventTitle:     eventTitle    || eventId,
    seat,
    status:         'Active',
    ticketType:     'General',
    eventStartDate: eventDate     || new Date().toISOString(),
    eventLocation:  eventLocation || 'TBD',
    quantity:       1,
  });
  saveTickets(tickets);

  return res;
};

export const getMyTickets = async () => ({ data: loadTickets() });

export const cancelTicket = async (ticketId) => {
  const tickets = loadTickets();
  const t = tickets.find((t) => t.ticketId == ticketId);
  if (t) t.status = 'Cancelled';
  saveTickets(tickets);
  return { data: { message: 'Cancelled' } };
};

export const getTicketById = async (ticketId) => ({
  data: loadTickets().find((t) => t.ticketId == ticketId) || { ticketId, status: 'Active' },
});

export const scanTicket = () => Promise.resolve({ data: { status: 'CheckedIn' } });