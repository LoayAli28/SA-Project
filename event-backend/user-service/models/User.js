const mongoose = require('mongoose');
const hashUtil = require('../utils/hash');

const UserSchema = new mongoose.Schema({ 
    email: { type: String, required: true, unique: true }, 
    password: { type: String, required: true },
    firstName: String,
    lastName: String,
    phoneNumber: String,
    role: { type: String, default: 'Participant' },
    organizationName: String,
    createdAt: { type: Date, default: Date.now }
});

// Pre-save hook to hash password before saving to DB
UserSchema.pre('save', async function() {
    if (!this.isModified('password')) return;
    this.password = await hashUtil.hashPassword(this.password);
});

const User = mongoose.model('User', UserSchema, 'users');
module.exports = User;
