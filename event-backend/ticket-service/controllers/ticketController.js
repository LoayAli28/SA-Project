const ticketService = require('../services/ticketService');

class TicketController {
    async book(req, res, next) {
        try {
            const ticket = await ticketService.bookTicket(req.body);
            res.status(201).json({
                message: 'Ticket booked successfully',
                ticketId: ticket._id,
                seat: ticket.seat,
                eventTitle: ticket.eventTitle,
            });
        } catch (error) {
            if (error.message === 'User not found. Please register first.') {
                return res.status(400).json({ error: error.message });
            }
            next(error);
        }
    }

    async getUserTickets(req, res, next) {
        try {
            const tickets = await ticketService.getUserTickets(req.params.userId);
            res.json(tickets);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new TicketController();
