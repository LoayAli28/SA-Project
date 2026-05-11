const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const env = require('./config/env');
const eventRoutes = require('./routes/eventRoutes');
const errorHandler = require('./middlewares/errorHandler');
const producer = require('./kafka/producer');

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Database connection
connectDB();

// Kafka connection
producer.connect().catch(console.error);

// Routes
app.use('/events', eventRoutes);

// Global Error Handler
app.use(errorHandler);

// Start Server
app.listen(env.PORT, () => {
    console.log(`Event Service running on port ${env.PORT}`);
});