module.exports = {
    PORT: process.env.PORT || 3000,
    MONGO_URI: process.env.MONGO_URI || 'mongodb://user-db:27017/users',
    KAFKA_BROKER: process.env.KAFKA_BROKER || 'kafka:9092',
    JWT_SECRET: process.env.JWT_SECRET || 'supersecretkey123'
};
