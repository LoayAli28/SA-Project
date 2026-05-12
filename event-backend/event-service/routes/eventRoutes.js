const express = require('express');
const router  = express.Router();
const eventController = require('../controllers/eventController');
const { validateEvent } = require('../validators/eventValidator');

// Public reads
router.get('/',                       eventController.getAll);
router.get('/:id',                    eventController.getById);

// Organizer-scoped reads
router.get('/organizer/:email',       eventController.getByOrganizer);
router.get('/stats/:email',           eventController.getOrganizerStats);

// Mutations
router.post('/', validateEvent,       eventController.create);
router.delete('/:id',                 eventController.delete);

// Seat management (called internally by ticket-service or directly)
router.patch('/:id/decrement-seat',   eventController.decrementSeat);
router.patch('/:id/increment-seat',   eventController.incrementSeat);

module.exports = router;
