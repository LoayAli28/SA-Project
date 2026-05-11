const { Kafka } = require('kafkajs');
const env = require('../config/env');

class KafkaProducer {
    constructor() {
        this.kafka = new Kafka({
            clientId: 'ticket-service',
            brokers: [env.KAFKA_BROKER]
        });
        this.producer = this.kafka.producer();
    }

    async connect() {
        let retries = 10;
        while (retries > 0) {
            try {
                await this.producer.connect();
                console.log('Kafka Producer connected');
                return;
            } catch (err) {
                retries--;
                console.log(`Kafka not ready, retrying... (${retries} left)`);
                await new Promise(r => setTimeout(r, 5000));
            }
        }
        console.error('Could not connect to Kafka after retries');
    }

    async publishEvent(topic, data) {
        try {
            await this.producer.send({
                topic,
                messages: [{ value: JSON.stringify(data) }],
            });
            console.log(`[Kafka] Published to ${topic}:`, data.ticketId || data.id);
        } catch (err) {
            console.error('Kafka send failed:', err.message);
        }
    }
}

module.exports = new KafkaProducer();
