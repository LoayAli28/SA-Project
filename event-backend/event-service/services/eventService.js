const Event = require('../models/Event');
const producer = require('../kafka/producer');

class EventService {
    async getAllEvents() {
        return await Event.find().sort({ createdAt: -1 });
    }

    async getEventById(id) {
        const event = await Event.findById(id);
        if (!event) throw new Error('Event not found');
        return event;
    }

    async createEvent(data) {
        const event = await Event.create({
            title: data.title,
            description: data.description,
            location: data.location,
            date: data.date,
            price: data.price || 0,
            organizerEmail: data.organizerEmail,
            category: data.categoryId || 'Music',
            availableSeats: data.availableSeats || 100,
        });

        // Publish to Kafka
        await producer.publishEvent('EventCreated', { 
            id: event._id.toString(), 
            title: event.title 
        });

        return event;
    }

    async deleteEvent(id) {
        const event = await Event.findByIdAndDelete(id);
        if (!event) throw new Error('Event not found');
        return event;
    }
}

module.exports = new EventService();
