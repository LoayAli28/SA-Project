const mongoose = require('mongoose');
const { getUserDbConnection } = require('../config/db');

// We use the secondary connection to query the User DB directly
const UserSchema = new mongoose.Schema({ email: String });

// Get the model bound to the user-db connection
const getUserModel = () => {
    const conn = getUserDbConnection();
    return conn.models.User || conn.model('User', UserSchema, 'users');
};

module.exports = { getUserModel };
