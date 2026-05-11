const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI || 'mongodb://user-db:27017/users';
        await mongoose.connect(uri);
        console.log(`MongoDB Connected successfully → ${uri}`);
    } catch (err) {
        console.error('MongoDB Connection Error:', err);
        process.exit(1);
    }
};

module.exports = connectDB;
