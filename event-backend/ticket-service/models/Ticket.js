const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  eventId:    { type: String, required: true },
  eventTitle: String,
  seat:       { type: String, required: true }, // we'll stick to 'seat' but ensure it's indexed correctly
  userId:     { type: String, required: true }, // participantId
  userEmail:  { type: String, required: true },
  status:     { type: String, default: 'Active' },
  createdAt:  { type: Date, default: Date.now },
});

// Prevent double booking of same seat for the same event
ticketSchema.index({ eventId: 1, seat: 1 }, { unique: true });

module.exports = mongoose.model('Ticket', ticketSchema);
