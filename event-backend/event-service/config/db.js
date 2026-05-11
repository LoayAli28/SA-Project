const mongoose = require('mongoose');
const env = require('./env');

const connectDB = async () => {
    try {
        await mongoose.connect(env.MONGO_URI);
        console.log('Event DB Connected');
    } catch (err) {
        console.error('DB Error:', err);
        process.exit(1);
    }
};

module.exports = connectDB;
