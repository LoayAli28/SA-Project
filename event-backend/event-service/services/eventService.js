const Event = require('../models/Event');
const producer = require('../kafka/producer');

class EventService {
    /* ─────────────────────────────── READ ─────────────────────────────── */

    async getAllEvents() {
        return await Event.find().sort({ createdAt: -1 });
    }

    async getEventById(id) {
        const event = await Event.findById(id);
        if (!event) throw new Error('Event not found');
        return event;
    }

    async getEventsByOrganizer(organizerEmail) {
        return await Event.find({ organizerEmail }).sort({ createdAt: -1 });
    }

    /* ─────────────────────────── CREATE ───────────────────────────────── */

    async createEvent(data) {
        const totalTickets = Number(data.totalTickets || data.maxCapacity || 100);
        if (totalTickets < 1) throw new Error('Total tickets must be at least 1');

        const event = await Event.create({
            title:          data.title,
            description:    data.description || '',
            location:       data.location || '',
            date:           data.startDate || data.date || '',
            price:          Number(data.ticketPrice ?? data.price) || 0,
            organizerEmail: data.organizerEmail,
            category:       data.categoryId || data.category || 'Other',
            totalTickets,
            availableSeats: totalTickets,  // initialise = capacity
        });

        await producer.publishEvent('EventCreated', {
            id:             event._id.toString(),
            title:          event.title,
            organizerEmail: event.organizerEmail,
            organizerId:    event.organizerEmail,
        });

        return event;
    }

    /* ─────────────────────────── UPDATE SEATS ─────────────────────────── */

    /**
     * Atomically decrement availableSeats by 1.
     * Returns the updated event, or throws if already full.
     */
    async decrementSeat(eventId) {
        const event = await Event.findOneAndUpdate(
            { _id: eventId, availableSeats: { $gt: 0 } },
            { $inc: { availableSeats: -1 } },
            { new: true }
        );
        if (!event) throw new Error('No seats available');
        return event;
    }

    /**
     * Atomically increment availableSeats by 1 (on cancellation).
     */
    async incrementSeat(eventId) {
        const event = await Event.findOneAndUpdate(
            { _id: eventId, $expr: { $lt: ['$availableSeats', '$totalTickets'] } },
            { $inc: { availableSeats: 1 } },
            { new: true }
        );
        if (!event) {
            // Edge-case: simply increment without the guard (shouldn't exceed capacity in normal flow)
            return await Event.findByIdAndUpdate(
                eventId,
                { $inc: { availableSeats: 1 } },
                { new: true }
            );
        }
        return event;
    }

    /* ─────────────────────────── DELETE ───────────────────────────────── */

    async deleteEvent(id) {
        const event = await Event.findByIdAndDelete(id);
        if (!event) throw new Error('Event not found');

        await producer.publishEvent('EventDeleted', {
            id:             event._id.toString(),
            title:          event.title,
            organizerEmail: event.organizerEmail,
        });

        return event;
    }

    /* ─────────────────────── DASHBOARD STATS ──────────────────────────── */

    /**
     * Aggregate statistics for a given organiser.
     * Returns: { totalEvents, totalTicketsSold, totalRevenue, events[] }
     */
    async getOrganizerStats(organizerEmail) {
        const events = await Event.find({ organizerEmail }).lean();

        let totalTicketsSold = 0;
        let totalRevenue     = 0;

        const enriched = events.map(e => {
            const sold    = (e.totalTickets || 0) - (e.availableSeats || 0);
            const revenue = sold * (e.price || 0);
            totalTicketsSold += sold;
            totalRevenue     += revenue;
            return {
                ...e,
                ticketsSold:    sold,
                revenue,
                occupancyPct:   e.totalTickets > 0
                    ? Math.round((sold / e.totalTickets) * 100)
                    : 0,
            };
        });

        return {
            totalEvents:      events.length,
            totalTicketsSold,
            totalRevenue,
            events:           enriched,
        };
    }
}

module.exports = new EventService();
