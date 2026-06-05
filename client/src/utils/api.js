import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

export const uploadApi = axios.create({
  baseURL: '/api',
  timeout: 5 * 60 * 1000,
});

export default api;
