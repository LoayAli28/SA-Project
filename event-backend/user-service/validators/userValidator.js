
const validateRegistration = (req, res, next) => {
    const { email, password } = req.body;
    
    if (!email || !email.includes('@')) {
        return res.status(400).json({ error: 'Invalid email address' });
    }
    
    if (!password || password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    next();
};

module.exports = { validateRegistration };
