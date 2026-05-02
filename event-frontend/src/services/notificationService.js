// src/services/notificationService.js
import { notifApi } from './api';


export const getNotifications = async () => {
  const res = await notifApi.get('/notifications/my');
  return res.data;
};

export const markAsRead = async (id) => {
  const res = await notifApi.patch(`/notifications/${id}/read`);
  return res.data;
};


export const markAllRead = async () => {
  const res = await notifApi.patch('/notifications/read-all');
  return res.data;
};

export const notifyEventUpdate = async (eventId, eventTitle) => {
  const res = await notifApi.post(
    `/notifications/event-updated/${eventId}?title=${encodeURIComponent(eventTitle)}`
  );
  return res.data;
};