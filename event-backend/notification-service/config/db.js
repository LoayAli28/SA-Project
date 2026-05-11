const mongoose = require('mongoose');
const env = require('./env');

let userDbConnection;

const connectDB = async () => {
    try {
        await mongoose.connect(env.MONGO_URI);
        console.log('Notification DB Connected');

        userDbConnection = mongoose.createConnection(env.USER_DB_URI);
        console.log('User DB Connected (Read-Only)');
    } catch (err) {
        console.error('DB Error:', err);
        process.exit(1);
    }
};

const getUserDbConnection = () => {
    if (!userDbConnection) {
        userDbConnection = mongoose.createConnection(env.USER_DB_URI);
    }
    return userDbConnection;
};

module.exports = { connectDB, getUserDbConnection };
