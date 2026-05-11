module.exports = {
    PORT: process.env.PORT || 3000,
    MONGO_URI: process.env.MONGO_URI || 'mongodb://event-db:27017/events',
    KAFKA_BROKER: process.env.KAFKA_BROKER || 'kafka:9092'
};
