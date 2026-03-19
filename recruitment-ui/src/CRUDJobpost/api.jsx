import axios from 'axios';

const api = axios.create({
  // Sử dụng biến môi trường từ file .env.development hoặc .env.production
  baseURL: import.meta.env.VITE_API_BASE_URL, 
});

// Tự động đính kèm Token vào Header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;