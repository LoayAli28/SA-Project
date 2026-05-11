const jwt = require('jsonwebtoken');
const env = require('../config/env');

const generateToken = (userId, email, role) => {
    return jwt.sign(
        { userId, email, role },
        env.JWT_SECRET,
        { expiresIn: '24h' }
    );
};

module.exports = { generateToken };
