const validateBooking = (req, res, next) => {
    const { eventId, seat, userId } = req.body;
    
    if (!userId || !userId.includes('@')) {
        return res.status(400).json({ error: 'Invalid email address' });
    }
    if (!eventId) {
        return res.status(400).json({ error: 'eventId is required' });
    }
    if (!seat) {
        return res.status(400).json({ error: 'seat is required' });
    }

    next();
};

module.exports = { validateBooking };
