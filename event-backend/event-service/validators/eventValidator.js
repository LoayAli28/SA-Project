const validateEvent = (req, res, next) => {
    const { title, price, ticketPrice, totalTickets, maxCapacity } = req.body;

    if (!title || !title.trim()) {
        return res.status(400).json({ error: 'Title is required' });
    }

    const priceVal = ticketPrice ?? price;
    if (priceVal !== undefined && (isNaN(priceVal) || Number(priceVal) < 0)) {
        return res.status(400).json({ error: 'Price must be a non-negative number' });
    }

    const capacity = totalTickets ?? maxCapacity;
    if (capacity !== undefined && (isNaN(capacity) || Number(capacity) < 1)) {
        return res.status(400).json({ error: 'Total tickets must be at least 1' });
    }

    next();
};

module.exports = { validateEvent };
