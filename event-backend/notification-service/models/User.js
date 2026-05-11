const mongoose = require('mongoose');
const { getUserDbConnection } = require('../config/db');

const UserSchema = new mongoose.Schema({ 
    email: String, 
    _id: mongoose.Schema.Types.ObjectId 
});

const getUserModel = () => {
    return getUserDbConnection().model('User', UserSchema, 'users');
};

module.exports = { getUserModel };
