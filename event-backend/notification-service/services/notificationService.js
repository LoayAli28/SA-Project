const Notification = require('../models/Notification');

class NotificationService {
    async getMyNotifications(userId, userEmail) {
        const orConditions = [];
        if (userId) orConditions.push({ userId });
        if (userEmail) orConditions.push({ userEmail });

        if (orConditions.length === 0) return [];

        return await Notification.find({ $or: orConditions })
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();
    }

    async markAsRead(id) {
        return await Notification.findByIdAndUpdate(id, { isRead: true });
    }

    async markAllAsRead(userId, userEmail) {
        const orConditions = [];
        if (userId) orConditions.push({ userId });
        if (userEmail) orConditions.push({ userEmail });

        if (orConditions.length === 0) return;

        return await Notification.updateMany(
            { $or: orConditions, isRead: false },
            { isRead: true }
        );
    }

    async createNotification(data) {
        if (!data.userId && !data.userEmail) return null;
        return await Notification.create({
            userId: data.userId || data.userEmail,
            userEmail: data.userEmail || '',
            type: data.type || 'Information',
            title: data.title,
            message: data.message,
            relatedId: data.relatedId || null,
        });
    }
}

module.exports = new NotificationService();
