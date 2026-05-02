import axios from 'axios';

const eventApi = axios.create({
  baseURL: 'http://localhost:3004',
});

export const getEvents = () => eventApi.get('/events').catch(() => ({ data: [] }));
export const getAllEvents = () => eventApi.get('/events').catch(() => ({ data: [] }));
export const getEventById = (id) => eventApi.get(`/events/${id}`).catch(() => ({ data: null }));
const staticCategories = [
  { categoryId: 'Music', name: 'Music' },
  { categoryId: 'Sports', name: 'Sports' },
  { categoryId: 'Conference', name: 'Conference' },
  { categoryId: 'Workshop', name: 'Workshop' },
  { categoryId: 'Other', name: 'Other' }
];

export const getCategories = () => {
  return { data: staticCategories };
};

export const getMyEvents = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return eventApi.get('/events').then(res => ({
    data: res.data.filter(e => e.organizerEmail === user.email)
  })).catch(() => ({ data: [] }));
};

export const createEvent = (data) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return eventApi.post('/events', { ...data, organizerEmail: user.email });
};

export const deleteEvent = (id) => eventApi.delete(`/events/${id}`);
export const updateEvent = (id, data) => Promise.resolve({ data });
export const uploadThumbnail = () => Promise.resolve({});
export const uploadAttachment = () => Promise.resolve({});