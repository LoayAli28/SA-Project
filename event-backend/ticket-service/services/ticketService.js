const Ticket = require('../models/Ticket');
const { getUserModel } = require('../models/User');
const producer = require('../kafka/producer');

class TicketService {
    async bookTicket(data) {
        const { eventId, eventTitle, seat, userId } = data;

        // Verify user exists in the user-db
        const User = getUserModel();
        const userDoc = await User.findOne({ email: userId });
        
        if (!userDoc) {
            throw new Error('User not found. Please register first.');
        }

        // Save ticket
        const ticket = await Ticket.create({
            eventId,
            eventTitle: eventTitle || eventId,
            seat,
            userId: userDoc._id.toString(),
            userEmail: userId,
        });

        // Publish to Kafka
        const eventData = {
            ticketId: ticket._id.toString(),
            eventId,
            eventTitle: eventTitle || eventId,
            seat,
            userId: userDoc._id.toString(),   
            userEmail: userId,
        };

        await producer.publishEvent('TicketBooked', eventData);

        return ticket;
    }

    async getUserTickets(userEmail) {
        return await Ticket.find({ userEmail }).sort({ createdAt: -1 });
    }
}

module.exports = new TicketService();
