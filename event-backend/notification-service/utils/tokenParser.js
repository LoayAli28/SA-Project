const { getUserModel } = require('../models/User');

async function extractUserInfo(req) {
    const auth = req.headers['authorization'];
    if (!auth || !auth.startsWith('Bearer ')) return {};

    const raw = auth.replace('Bearer ', '').trim();
    const User = getUserModel();

    // 1. Legacy Token Support
    if (raw.startsWith('token-')) {
        const userId = raw.replace('token-', '');
        try {
            const userDoc = await User.findById(userId).lean();
            return {
                userId,
                userEmail: userDoc?.email || null,
            };
        } catch {
            return { userId, userEmail: null };
        }
    }

    // 2. JWT Support
    try {
        const payload = JSON.parse(Buffer.from(raw.split('.')[1], 'base64').toString());
        const email = payload.email || payload.sub || null;
        const userId = payload.userId || payload.id || payload._id || null;

        if (userId) return { userId, userEmail: email };

        if (email) {
            const userDoc = await User.findOne({ email }).lean();
            return {
                userId: userDoc ? userDoc._id.toString() : email,
                userEmail: email,
            };
        }
    } catch (e) {
        // Fallthrough
    }

    return {};
}

module.exports = { extractUserInfo };
