// src/services/authService.js
import api from './api';

export const registerUser = (data) => api.post('/User/register', {
  email: data.email,
  password: data.password,
  firstName: data.firstName,
  lastName: data.lastName,
  phoneNumber: data.phoneNumber || '',
  role: data.role || 'Participant',
  organizationName: data.organizationName || '',
});

export const loginUser = (data) => api.post('/User/login', {
  email: data.email,
  password: data.password,
});