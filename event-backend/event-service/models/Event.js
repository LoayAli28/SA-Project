const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title:          { type: String, required: true },
  description:    { type: String, default: '' },
  location:       { type: String, default: '' },
  date:           { type: String },
  price:          { type: Number, default: 0, min: 0 },
  organizerEmail: { type: String, required: true },
  category: {
    type: String,
    enum: ['Music', 'Sports', 'Conference', 'Workshop', 'Other'],
    default: 'Music',
  },
  totalTickets:   { type: Number, default: 100, min: 1 },
  availableSeats: { type: Number, default: 100, min: 0 },
  createdAt:      { type: Date, default: Date.now },
});

module.exports = mongoose.model('Event', EventSchema);
