const eventService = require('../services/eventService');

class EventController {
    /* ── GET /events ───────────────────────────────────────────── */
    async getAll(req, res, next) {
        try {
            const events = await eventService.getAllEvents();
            res.json(events);
        } catch (err) {
            next(err);
        }
    }

    /* ── GET /events/:id ───────────────────────────────────────── */
    async getById(req, res, next) {
        try {
            const event = await eventService.getEventById(req.params.id);
            res.json(event);
        } catch (err) {
            if (err.message === 'Event not found') {
                return res.status(404).json({ error: err.message });
            }
            next(err);
        }
    }

    /* ── POST /events ──────────────────────────────────────────── */
    async create(req, res, next) {
        try {
            const newEvent = await eventService.createEvent(req.body);
            res.status(201).json({ message: 'Event created', event: newEvent });
        } catch (err) {
            if (err.message.startsWith('Total tickets')) {
                return res.status(400).json({ error: err.message });
            }
            next(err);
        }
    }

    /* ── DELETE /events/:id ────────────────────────────────────── */
    async delete(req, res, next) {
        try {
            await eventService.deleteEvent(req.params.id);
            res.json({ message: 'Event deleted successfully' });
        } catch (err) {
            if (err.message === 'Event not found') {
                return res.status(404).json({ error: err.message });
            }
            next(err);
        }
    }

    /* ── PATCH /events/:id/decrement-seat  (called by ticket-service) ── */
    async decrementSeat(req, res, next) {
        try {
            const event = await eventService.decrementSeat(req.params.id);
            res.json({ availableSeats: event.availableSeats });
        } catch (err) {
            if (err.message === 'No seats available') {
                return res.status(409).json({ error: 'Event is fully booked' });
            }
            next(err);
        }
    }

    /* ── PATCH /events/:id/increment-seat  (called on cancellation) ── */
    async incrementSeat(req, res, next) {
        try {
            const event = await eventService.incrementSeat(req.params.id);
            res.json({ availableSeats: event.availableSeats });
        } catch (err) {
            next(err);
        }
    }

    /* ── GET /events/organizer/:email ──────────────────────────── */
    async getByOrganizer(req, res, next) {
        try {
            const events = await eventService.getEventsByOrganizer(req.params.email);
            res.json(events);
        } catch (err) {
            next(err);
        }
    }

    /* ── GET /events/stats/:email  (dashboard aggregation) ─────── */
    async getOrganizerStats(req, res, next) {
        try {
            const stats = await eventService.getOrganizerStats(req.params.email);
            res.json(stats);
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new EventController();
