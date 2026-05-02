const express  = require('express');
const cors     = require('cors');
const kafka    = require('./kafka');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

const userDb = mongoose.createConnection('mongodb://user-db:27017/users');
const User   = userDb.model('User',
  new mongoose.Schema({ email: String }),
  'users'
);


mongoose.connect(process.env.MONGO_URI || 'mongodb://ticket-db:27017/tickets');

const ticketSchema = new mongoose.Schema({
  eventId:    String,
  eventTitle: String,
  seat:       String,
  userId:     String,   // MongoDB _id بتاع الـ use
  userEmail:  String,
  status:     { type: String, default: 'Active' },
  createdAt:  { type: Date, default: Date.now },
});
const Ticket = mongoose.model('Ticket', ticketSchema);

/* ── Kafka producer ── */
const producer = kafka.producer();

async function startKafka() {
  let retries = 10;
  while (retries > 0) {
    try {
      await producer.connect();
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
startKafka();


   
app.post('/tickets', async (req, res) => {
  
  const { eventId, eventTitle, seat, userId } = req.body;

  /* validation */
  if (!userId || !userId.includes('@')) {
    return res.status(400).json({ error: 'Invalid email address' });
  }
  if (!eventId) {
    return res.status(400).json({ error: 'eventId is required' });
  }
  if (!seat) {
    return res.status(400).json({ error: 'seat is required' });
  }

  
  const userDoc = await User.findOne({ email: userId });
  if (!userDoc) {
    return res.status(400).json({ error: 'User not found. Please register first.' });
  }

  /* save ticket in ticket-db */
  let ticket;
  try {
    ticket = await Ticket.create({
      eventId,
      eventTitle: eventTitle || eventId,
      seat,
      userId:    userDoc._id.toString(),
      userEmail: userId,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to save ticket' });
  }

  try {
    await producer.send({
      topic: 'TicketBooked',
      messages: [{
        value: JSON.stringify({
          ticketId:   ticket._id.toString(),
          eventId,
          eventTitle: eventTitle || eventId,
          seat,
          userId:     userDoc._id.toString(),   
          userEmail:  userId,
        }),
      }],
    });
    console.log(`[Kafka] TicketBooked sent → userId: ${userDoc._id}, event: ${eventTitle}, seat: ${seat}`);
  } catch (err) {
    console.error('Kafka send error:', err.message);
  }

  res.json({
    message:  'Ticket booked successfully',
    ticketId: ticket._id,
    seat,
    eventTitle: eventTitle || eventId,
  });
});

app.get('/tickets/user/:userId', async (req, res) => {
  try {
    const tickets = await Ticket.find({ userEmail: req.params.userId })
      .sort({ createdAt: -1 });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log('Ticket Service running'));