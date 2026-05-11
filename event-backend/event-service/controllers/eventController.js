const eventService = require('../services/eventService');

class EventController {
    async getAll(req, res, next) {
        try {
            const events = await eventService.getAllEvents();
            res.json(events);
        } catch (error) {
            next(error);
        }
    }

    async getById(req, res, next) {
        try {
            const event = await eventService.getEventById(req.params.id);
            res.json(event);
        } catch (error) {
            if (error.message === 'Event not found') {
                return res.status(404).json({ error: error.message });
            }
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            const newEvent = await eventService.createEvent(req.body);
            res.status(201).json({ message: 'Event created', event: newEvent });
        } catch (error) {
            next(error);
        }
    }

    async delete(req, res, next) {
        try {
            await eventService.deleteEvent(req.params.id);
            res.json({ message: 'Event deleted' });
        } catch (error) {
            if (error.message === 'Event not found') {
                return res.status(404).json({ error: error.message });
            }
            next(error);
        }
    }
}

module.exports = new EventController();
