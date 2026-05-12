const express = require('express');
const router  = express.Router();
const eventController = require('../controllers/eventController');
const { validateEvent } = require('../validators/eventValidator');

// ── GET ROUTES ──

// 1. Dashboard Stats (Specific route first)
router.get('/organizer/dashboard-stats/:email', eventController.getOrganizerStats);

// 2. Organizer's Event List
router.get('/organizer/:email', eventController.getByOrganizer);

// 3. Single Event (Parameterized route after specific ones)
router.get('/:id', eventController.getById);

// 4. All Events
router.get('/', eventController.getAll);


// ── MUTATION ROUTES ──

router.post('/', validateEvent,       eventController.create);
router.put('/:id', validateEvent,     eventController.update);
router.delete('/:id',                 eventController.delete);


// ── INTERNAL SEAT MANAGEMENT ──

router.patch('/:id/decrement-seat',   eventController.decrementSeat);
router.patch('/:id/increment-seat',   eventController.incrementSeat);

module.exports = router;
