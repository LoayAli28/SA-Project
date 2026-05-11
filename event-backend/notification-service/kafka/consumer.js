const { Kafka } = require('kafkajs');
const env = require('../config/env');
const notificationService = require('../services/notificationService');

class KafkaConsumerService {
    constructor() {
        this.kafka = new Kafka({
            clientId: 'notification-service',
            brokers: [env.KAFKA_BROKER]
        });
        this.consumer = this.kafka.consumer({ groupId: 'notification-group' });
    }

    async startConsumer() {
        let retries = 10;
        while (retries > 0) {
            try {
                await this.consumer.connect();
                console.log('[Kafka] Consumer connected');
                break;
            } catch (err) {
                retries--;
                console.log(`[Kafka] Not ready, retrying... (${retries} left)`);
                await new Promise(r => setTimeout(r, 5000));
            }
        }

        await this.consumer.subscribe({ topic: 'TicketBooked', fromBeginning: false });
        await this.consumer.subscribe({ topic: 'TicketCancelled', fromBeginning: false });
        await this.consumer.subscribe({ topic: 'UserRegistered', fromBeginning: false });
        await this.consumer.subscribe({ topic: 'EventCreated', fromBeginning: false });

        await this.consumer.run({
            eachMessage: async ({ topic, message }) => {
                try {
                    const data = JSON.parse(message.value.toString());
                    console.log(`[Kafka] ${topic}:`, data);
                    await this.routeMessage(topic, data);
                } catch (err) {
                    console.error(`[Kafka] Error in ${topic}:`, err.message);
                }
            },
        });

        console.log('[Kafka] Listening on: TicketBooked, TicketCancelled, UserRegistered, EventCreated');
    }

    async routeMessage(topic, data) {
        switch (topic) {
            case 'TicketBooked':
                await notificationService.createNotification({
                    userId: data.userId || data.userEmail,
                    userEmail: data.userEmail || '',
                    type: 'TicketPurchased',
                    title: 'Ticket Booked!',
                    message: `Your ticket for "${data.eventTitle || data.eventId}" — Seat ${data.seat} has been confirmed.`,
                    relatedId: data.ticketId || data.eventId,
                });
                break;
            case 'TicketCancelled':
                await notificationService.createNotification({
                    userId: data.userId || data.userEmail,
                    userEmail: data.userEmail || '',
                    type: 'Information',
                    title: 'Ticket Cancelled',
                    message: `Your ticket for "${data.eventTitle}" (Seat ${data.seat}) has been cancelled.`,
                    relatedId: data.ticketId,
                });
                break;
            case 'UserRegistered':
                const userId = data.id || data.userId;
                const email = data.email;
                await notificationService.createNotification({
                    userId: userId || email,
                    userEmail: email || '',
                    type: 'Information',
                    title: 'Welcome to Eventra!',
                    message: `Hi ${data.fullName || email}, your account has been created successfully.`,
                    relatedId: userId,
                });
                break;
            case 'EventCreated':
                const organizerId = data.organizerId || data.id;
                await notificationService.createNotification({
                    userId: organizerId,
                    userEmail: data.organizerEmail || '',
                    type: 'EventApproved',
                    title: 'Event Created',
                    message: `Your event "${data.title}" has been created successfully.`,
                    relatedId: data.eventId || data.id,
                });
                break;
        }
    }
}

module.exports = new KafkaConsumerService();
