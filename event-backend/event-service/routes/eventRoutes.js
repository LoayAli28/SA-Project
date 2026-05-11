const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { validateEvent } = require('../validators/eventValidator');

router.get('/', eventController.getAll);
router.get('/:id', eventController.getById);
router.post('/', validateEvent, eventController.create);
router.delete('/:id', eventController.delete);

module.exports = router;
