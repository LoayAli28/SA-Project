// src/services/api.js
import axios from 'axios';


const api = axios.create({
  baseURL: 'http://localhost:3001',
});


export const ticketApi = axios.create({
  baseURL: 'http://localhost:3000',
});


export const notifApi = axios.create({
  baseURL: 'http://localhost:3003',
});


export const eventApi = axios.create({
  baseURL: 'http://localhost:3004',
});


const addAuth = (instance) => {
  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
};

addAuth(api);
addAuth(ticketApi);
addAuth(notifApi);
addAuth(eventApi);

export default api;