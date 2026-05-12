const axios   = require('axios');
const Ticket  = require('../models/Ticket');
const { getUserModel } = require('../models/User');
const producer = require('../kafka/producer');
const env      = require('../config/env');

const eventApi = axios.create({ baseURL: env.EVENT_SERVICE_URL });

class TicketService {
    /* ─────────────────────────── BOOK ─────────────────────────── */

    async bookTicket(data) {
        const { eventId, eventTitle, seat, userId } = data;

        // 1. Verify user exists
        const User    = getUserModel();
        const userDoc = await User.findOne({ email: userId });
        if (!userDoc) throw new Error('User not found. Please register first.');

        // 2. Atomically decrement seat in event-service
        try {
            await eventApi.patch(`/events/${eventId}/decrement-seat`);
        } catch (err) {
            const msg = err.response?.data?.error || 'Seat reservation failed';
            throw new Error(msg);
        }

        // 3. Persist ticket
        const ticket = await Ticket.create({
            eventId,
            eventTitle: eventTitle || eventId,
            seat,
            userId:    userDoc._id.toString(),
            userEmail: userId,
            status:    'Active',
        });

        // 4. Publish Kafka event
        await producer.publishEvent('TicketBooked', {
            ticketId:   ticket._id.toString(),
            eventId,
            eventTitle: ticket.eventTitle,
            seat,
            userId:     userDoc._id.toString(),
            userEmail:  userId,
        });

        return ticket;
    }

    /* ─────────────────────────── CANCEL ───────────────────────── */

    async cancelTicket(ticketId, userEmail) {
        const ticket = await Ticket.findById(ticketId);
        if (!ticket)                        throw new Error('Ticket not found');
        if (ticket.userEmail !== userEmail) throw new Error('Forbidden');
        if (ticket.status === 'Cancelled')  throw new Error('Ticket already cancelled');

        ticket.status = 'Cancelled';
        await ticket.save();

        // Restore seat in event-service (best-effort, non-fatal)
        try {
            await eventApi.patch(`/events/${ticket.eventId}/increment-seat`);
        } catch (err) {
            console.error('[TicketService] incrementSeat failed (non-fatal):', err.message);
        }

        // Publish Kafka event
        await producer.publishEvent('TicketCancelled', {
            ticketId:   ticket._id.toString(),
            eventId:    ticket.eventId,
            eventTitle: ticket.eventTitle,
            seat:       ticket.seat,
            userId:     ticket.userId,
            userEmail:  ticket.userEmail,
        });

        return ticket;
    }

    /* ─────────────────────────── READS ────────────────────────── */

    async getUserTickets(userEmail) {
        return await Ticket.find({ userEmail }).sort({ createdAt: -1 });
    }

    async getTicketById(ticketId) {
        const ticket = await Ticket.findById(ticketId);
        if (!ticket) throw new Error('Ticket not found');
        return ticket;
    }

    /* ──────────────── STATS PER EVENT (for organizer) ─────────── */

    async countByEvent(eventId) {
        return await Ticket.countDocuments({ eventId, status: { $ne: 'Cancelled' } });
    }
}

module.exports = new TicketService();
