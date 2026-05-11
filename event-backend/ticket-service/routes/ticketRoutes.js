const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const { validateBooking } = require('../validators/ticketValidator');

router.post('/', validateBooking, ticketController.book);
router.get('/user/:userId', ticketController.getUserTickets);

module.exports = router;
