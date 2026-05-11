const User = require('../models/User');
const producer = require('../kafka/producer');
const hashUtil = require('../utils/hash');
const jwtUtil = require('../utils/jwt');

class UserService {
    async registerUser(data) {
        const { email, password, firstName, lastName, phoneNumber, role, organizationName } = data;

        const existing = await User.findOne({ email });
        if (existing) {
            throw new Error('Email already registered');
        }

        const newUser = await User.create({
            email,
            password, // Will be hashed by pre-save hook in Model
            firstName,
            lastName,
            phoneNumber,
            role,
            organizationName
        });

        // Fire-and-forget Kafka publish — do NOT await this.
        // Kafka failures must NEVER block or fail the registration response.
        const userEvent = {
            id: newUser._id.toString(),
            email: newUser.email,
            role: newUser.role,
            fullName: `${firstName} ${lastName}`.trim()
        };
        producer.publishEvent('UserRegistered', userEvent).catch((err) => {
            console.error('[Kafka] Failed to publish UserRegistered (non-fatal):', err.message);
        });

        return newUser;
    }

    async loginUser(email, password) {
        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error('Invalid email or password');
        }

        // Validate password
        const isMatch = await hashUtil.comparePassword(password, user.password);
        if (!isMatch) {
            throw new Error('Invalid email or password');
        }

        // Generate JWT token
        const token = jwtUtil.generateToken(user._id.toString(), user.email, user.role);

        // For backwards compatibility with notification-service, you could also return the old 'token-' + id format 
        // if the frontend relies on it, but the new JWT is better.
        // The old format is fallback supported by notification-service.
        const legacyToken = 'token-' + user._id;

        return {
            user: {
                userId: user._id,
                email: user.email,
                fullName: `${user.firstName} ${user.lastName}`.trim() || email,
                role: user.role
            },
            token: token // Using real JWT now
        };
    }
}

module.exports = new UserService();
