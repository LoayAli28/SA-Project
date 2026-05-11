const validateEvent = (req, res, next) => {
    const { title, price } = req.body;
    
    if (!title) {
        return res.status(400).json({ error: 'Title is required' });
    }
    
    if (price && isNaN(price)) {
        return res.status(400).json({ error: 'Price must be a number' });
    }

    next();
};

module.exports = { validateEvent };
