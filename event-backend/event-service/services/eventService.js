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
            availableSeats: totalTickets,
        });

        await producer.publishEvent('EventCreated', {
            id:             event._id.toString(),
            title:          event.title,
            organizerEmail: event.organizerEmail,
        });

        return event;
    }

    /* ─────────────────────────── UPDATE ───────────────────────────────── */

    async updateEvent(id, data) {
        const event = await Event.findById(id);
        if (!event) throw new Error('Event not found');

        const oldTotal = event.totalTickets;
        const oldAvail = event.availableSeats;
        const booked   = oldTotal - oldAvail;

        if (data.totalTickets !== undefined) {
            const newTotal = Number(data.totalTickets);
            if (newTotal < booked) {
                throw new Error(`Cannot reduce capacity below already booked seats (${booked})`);
            }
            event.totalTickets = newTotal;
            event.availableSeats = newTotal - booked;
        }

        if (data.title)       event.title = data.title;
        if (data.description) event.description = data.description;
        if (data.location)    event.location = data.location;
        if (data.date)        event.date = data.date;
        if (data.price !== undefined) event.price = Number(data.price);
        if (data.category)    event.category = data.category;

        await event.save();

        await producer.publishEvent('EventUpdated', {
            id:             event._id.toString(),
            title:          event.title,
            organizerEmail: event.organizerEmail,
        });

        return event;
    }

    /* ─────────────────────────── UPDATE SEATS ─────────────────────────── */

    async decrementSeat(eventId) {
        const event = await Event.findOneAndUpdate(
            { _id: eventId, availableSeats: { $gt: 0 } },
            { $inc: { availableSeats: -1 } },
            { new: true }
        );
        if (!event) throw new Error('No seats available');
        return event;
    }

    async incrementSeat(eventId) {
        // Guard against exceeding totalTickets
        const event = await Event.findOneAndUpdate(
            { _id: eventId, $expr: { $lt: ['$availableSeats', '$totalTickets'] } },
            { $inc: { availableSeats: 1 } },
            { new: true }
        );
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

    async getOrganizerStats(organizerEmail) {
        const stats = await Event.aggregate([
            { $match: { organizerEmail } },
            {
                $group: {
                    _id: null,
                    totalEvents:      { $sum: 1 },
                    totalTicketsSold: { $sum: { $subtract: ['$totalTickets', '$availableSeats'] } },
                    totalRevenue:     { $sum: { $multiply: [{ $subtract: ['$totalTickets', '$availableSeats'] }, '$price'] } },
                    events:           { $push: '$$ROOT' }
                }
            }
        ]);

        if (stats.length === 0) {
            return { totalEvents: 0, totalTicketsSold: 0, totalRevenue: 0, events: [] };
        }

        const result = stats[0];
        delete result._id;

        // Add occupancy and ticketsSold to each event
        result.events = result.events.map(e => {
            const sold = e.totalTickets - e.availableSeats;
            return {
                ...e,
                ticketsSold:  sold,
                occupancyPct: e.totalTickets > 0 ? Math.round((sold / e.totalTickets) * 100) : 0,
                revenue:      sold * e.price
            };
        });

        return result;
    }
}

module.exports = new EventService();
