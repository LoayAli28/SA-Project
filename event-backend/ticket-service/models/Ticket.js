const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  eventId:    String,
  eventTitle: String,
  seat:       String,
  userId:     String,
  userEmail:  String,
  status:     { type: String, default: 'Active' },
  createdAt:  { type: Date, default: Date.now },
});

module.exports = mongoose.model('Ticket', ticketSchema);
