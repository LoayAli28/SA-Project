const ticketService = require('../services/ticketService');

class TicketController {
    async book(req, res, next) {
        try {
            const ticket = await ticketService.bookTicket(req.body);
            res.status(201).json({
                message:    'Ticket booked successfully',
                ticketId:   ticket._id,
                seat:       ticket.seat,
                eventTitle: ticket.eventTitle,
                status:     ticket.status,
            });
        } catch (err) {
            if (err.message === 'Seat already booked') {
                return res.status(409).json({ error: err.message });
            }
            const knownErrors = [
                'User not found. Please register first.',
                'Event is fully booked',
                'No seats available',
                'Seat reservation failed',
            ];
            if (knownErrors.some(e => err.message.includes(e))) {
                return res.status(400).json({ error: err.message });
            }
            next(err);
        }
    }

    async getUserTickets(req, res, next) {
        try {
            const tickets = await ticketService.getUserTickets(req.params.userId);
            res.json(tickets);
        } catch (err) {
            next(err);
        }
    }

    async getById(req, res, next) {
        try {
            const ticket = await ticketService.getTicketById(req.params.id);
            res.json(ticket);
        } catch (err) {
            if (err.message === 'Ticket not found') {
                return res.status(404).json({ error: err.message });
            }
            next(err);
        }
    }

    async cancel(req, res, next) {
        try {
            const { userEmail } = req.body;
            if (!userEmail) {
                return res.status(400).json({ error: 'userEmail is required' });
            }
            const ticket = await ticketService.cancelTicket(req.params.id, userEmail);
            res.json({ message: 'Ticket cancelled successfully', ticket });
        } catch (err) {
            if (err.message === 'Ticket not found') {
                return res.status(404).json({ error: err.message });
            }
            if (err.message === 'Forbidden') {
                return res.status(403).json({ error: err.message });
            }
            if (err.message === 'Ticket already cancelled') {
                return res.status(409).json({ error: err.message });
            }
            next(err);
        }
    }
}

module.exports = new TicketController();
