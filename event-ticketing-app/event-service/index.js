const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const kafka = require('./kafka');

const app = express();
app.use(cors({
  origin: true, 
  credentials: true
}));
app.use(express.json());

mongoose.connect('mongodb://event-db:27017/events')
  .then(() => console.log('Event DB Connected'))
  .catch(err => console.error('DB Error:', err));

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  location: String,
  date: String,
  price: { type: Number, default: 0 },
  organizerEmail: String,
  category: { 
    type: String, 
    enum: ['Music', 'Sports', 'Conference', 'Workshop', 'Other'],
    default: 'Music' 
  },
  availableSeats: { type: Number, default: 100 },
  createdAt: { type: Date, default: Date.now },
});

const Event = mongoose.model('Event', EventSchema);

const producer = kafka.producer();

async function startKafka() {
  let retries = 10;
  while (retries > 0) {
    try {
      await producer.connect();
      console.log('Kafka connected');
      return;
    } catch (err) {
      retries--;
      await new Promise(r => setTimeout(r, 5000));
    }
  }
}
startKafka();

// GET all events
app.get('/events', async (req, res) => {
  const events = await Event.find().sort({ createdAt: -1 });
  res.json(events);
});

// GET single event
app.get('/events/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  } catch {
    res.status(404).json({ error: 'Event not found' });
  }
});

// POST create event (Organizer)
app.post('/events', async (req, res) => {
  try {
const { title, description, location, date, price, organizerEmail, availableSeats, categoryId } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    const event = await Event.create({
      title, description, location, date,
      price: price || 0,
      organizerEmail,
      category: categoryId || 'Music',
      availableSeats: availableSeats || 100,
    });

    await producer.send({
      topic: 'EventCreated',
      messages: [{ value: JSON.stringify({ id: event._id, title: event.title }) }],
    }).catch(e => console.error('Kafka error:', e.message));

    res.json({ message: 'Event created', event });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE event
app.delete('/events/:id', async (req, res) => {
  await Event.findByIdAndDelete(req.params.id);
  res.json({ message: 'Event deleted' });
});

app.listen(3000, () => console.log('Event Service running'));