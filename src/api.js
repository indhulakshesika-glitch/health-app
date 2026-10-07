import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  me: () => API.get('/auth/me'),
};

export const medicineAPI = {
  getAll: () => API.get('/medicines'),
  getOne: (id) => API.get(`/medicines/${id}`),
  create: (data) => API.post('/medicines', data),
  update: (id, data) => API.put(`/medicines/${id}`, data),
  delete: (id) => API.delete(`/medicines/${id}`),
};

export const logsAPI = {
  getToday: () => API.get('/logs/today'),
  getHistory: (days) => API.get(`/logs/history?days=${days}`),
  updateStatus: (id, status) => API.patch(`/logs/${id}/status`, { status }),
};

export const healthAPI = {
  getAll: (params) => API.get('/health', { params }),
  getStats: (params) => API.get('/health/stats', { params }),
  create: (data) => API.post('/health', data),
  delete: (id) => API.delete(`/health/${id}`),
};

export const dashboardAPI = {
  get: () => API.get('/dashboard'),
};

export default API;
