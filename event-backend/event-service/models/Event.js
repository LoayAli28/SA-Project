const mongoose = require('mongoose');

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

module.exports = mongoose.model('Event', EventSchema);
