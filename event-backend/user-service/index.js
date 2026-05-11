const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const env = require('./config/env');
const userRoutes = require('./routes/userRoutes');
const errorHandler = require('./middlewares/errorHandler');
const producer = require('./kafka/producer');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
connectDB();

// Kafka connection
producer.connect().catch(console.error);

// Routes
app.use('/User', userRoutes);

// Global Error Handler
app.use(errorHandler);

// Start Server
app.listen(env.PORT, () => {
    console.log(`User Service running on internal port ${env.PORT}`);
});