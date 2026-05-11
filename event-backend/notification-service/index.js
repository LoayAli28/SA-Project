const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
const env = require('./config/env');
const notificationRoutes = require('./routes/notificationRoutes');
const errorHandler = require('./middlewares/errorHandler');
const consumerService = require('./kafka/consumer');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
connectDB();

// Kafka connection
consumerService.startConsumer().catch(console.error);

// Routes
app.use('/notifications', notificationRoutes);

// Global Error Handler
app.use(errorHandler);

// Start Server
app.listen(env.PORT, () => {
    console.log(`Notification Service running on internal port ${env.PORT}`);
});