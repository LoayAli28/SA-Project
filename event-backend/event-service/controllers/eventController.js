const eventService = require('../services/eventService');

class EventController {
    async getAll(req, res, next) {
        try {
            const events = await eventService.getAllEvents();
            res.json(events);
        } catch (err) {
            next(err);
        }
    }

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

    async update(req, res, next) {
        try {
            const updatedEvent = await eventService.updateEvent(req.params.id, req.body);
            res.json({ message: 'Event updated successfully', event: updatedEvent });
        } catch (err) {
            if (err.message === 'Event not found') {
                return res.status(404).json({ error: err.message });
            }
            if (err.message.includes('Cannot reduce capacity')) {
                return res.status(400).json({ error: err.message });
            }
            next(err);
        }
    }

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

    async incrementSeat(req, res, next) {
        try {
            const event = await eventService.incrementSeat(req.params.id);
            if (!event) return res.status(404).json({ error: 'Event not found or seat count error' });
            res.json({ availableSeats: event.availableSeats });
        } catch (err) {
            next(err);
        }
    }

    async getByOrganizer(req, res, next) {
        try {
            const events = await eventService.getEventsByOrganizer(req.params.email);
            res.json(events);
        } catch (err) {
            next(err);
        }
    }

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
