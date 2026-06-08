import axios from 'axios';

const getVisitorId = () => {
  let id = localStorage.getItem('visitor_id');
  if (!id) {
    id = 'v_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem('visitor_id', id);
  }
  return id;
};

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

api.interceptors.request.use(config => {
  config.headers['X-Visitor-Id'] = getVisitorId();
  return config;
});

export const uploadApi = axios.create({
  baseURL: '/api',
  timeout: 5 * 60 * 1000,
});

uploadApi.interceptors.request.use(config => {
  config.headers['X-Visitor-Id'] = getVisitorId();
  return config;
});

export default api;
