const axios   = require('axios');
const Ticket  = require('../models/Ticket');
const { getUserModel } = require('../models/User');
const producer = require('../kafka/producer');
const env      = require('../config/env');

const eventApi = axios.create({ baseURL: env.EVENT_SERVICE_URL });

class TicketService {
    

    async bookTicket(data) {
        const { eventId, eventTitle, seat, userId } = data;

        // 1. Verify user exists
        const User    = getUserModel();
        const userDoc = await User.findOne({ email: userId });
        if (!userDoc) throw new Error('User not found. Please register first.');

        // 2. Check if seat is already taken (pre-check)
        const existingTicket = await Ticket.findOne({ eventId, seat, status: 'Active' });
        if (existingTicket) {
            throw new Error('Seat already booked');
        }

        // 3. Atomically decrement seat in event-service
        try {
            await eventApi.patch(`/events/${eventId}/decrement-seat`);
        } catch (err) {
            const msg = err.response?.data?.error || 'Seat reservation failed';
            throw new Error(msg);
        }

        // 4. Persist ticket
        try {
            const ticket = await Ticket.create({
                eventId,
                eventTitle: eventTitle || eventId,
                seat,
                userId:    userDoc._id.toString(),
                userEmail: userId,
                status:    'Active',
            });

            // 5. Publish Kafka event
            await producer.publishEvent('TicketBooked', {
                ticketId:   ticket._id.toString(),
                eventId,
                eventTitle: ticket.eventTitle,
                seat,
                userId:     userDoc._id.toString(),
                userEmail:  userId,
            });

            return ticket;
        } catch (err) {
            // If creation fails increment back
            await eventApi.patch(`/events/${eventId}/increment-seat`).catch(console.error);
            
            if (err.code === 11000) {
                throw new Error('Seat already booked');
            }
            throw err;
        }
    }


    async cancelTicket(ticketId, userEmail) {
        const ticket = await Ticket.findById(ticketId);
        if (!ticket)                        throw new Error('Ticket not found');
        if (ticket.userEmail !== userEmail) throw new Error('Forbidden');
        if (ticket.status === 'Cancelled')  throw new Error('Ticket already cancelled');

        ticket.status = 'Cancelled';
        await ticket.save();

        // Restore seat in event-service
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


    async getUserTickets(userEmail) {
        return await Ticket.find({ userEmail }).sort({ createdAt: -1 });
    }

    async getTicketById(ticketId) {
        const ticket = await Ticket.findById(ticketId);
        if (!ticket) throw new Error('Ticket not found');
        return ticket;
    }
}

module.exports = new TicketService();
