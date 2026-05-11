const notificationService = require('../services/notificationService');
const { extractUserInfo } = require('../utils/tokenParser');

class NotificationController {
    async getMyNotifications(req, res, next) {
        try {
            const { userId, userEmail } = await extractUserInfo(req);
            
            if (!userId && !userEmail) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const notifications = await notificationService.getMyNotifications(userId, userEmail);

            res.json(notifications.map(n => ({
                id: n._id,
                userId: n.userId,
                type: n.type,
                title: n.title,
                message: n.message,
                isRead: n.isRead,
                relatedId: n.relatedId,
                createdAt: n.createdAt,
            })));
        } catch (error) {
            next(error);
        }
    }

    async markAsRead(req, res, next) {
        try {
            await notificationService.markAsRead(req.params.id);
            res.json({ success: true });
        } catch (error) {
            next(error);
        }
    }

    async markAllAsRead(req, res, next) {
        try {
            const { userId, userEmail } = await extractUserInfo(req);
            
            if (!userId && !userEmail) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            await notificationService.markAllAsRead(userId, userEmail);
            res.json({ success: true });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new NotificationController();
