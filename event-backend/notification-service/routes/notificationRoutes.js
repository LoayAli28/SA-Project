const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

router.get('/my', notificationController.getMyNotifications);
router.patch('/:id/read', notificationController.markAsRead);
router.patch('/read-all', notificationController.markAllAsRead);

module.exports = router;
