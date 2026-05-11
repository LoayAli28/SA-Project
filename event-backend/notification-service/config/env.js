module.exports = {
    PORT: process.env.PORT || 3000,
    MONGO_URI: process.env.MONGO_URI || 'mongodb://notification-db:27017/notifications',
    USER_DB_URI: process.env.USER_DB_URI || 'mongodb://user-db:27017/users',
    KAFKA_BROKER: process.env.KAFKA_BROKER || 'kafka:9092'
};
