import axios from 'axios';

const api = axios.create({
  baseURL: 'https://localhost:7272/api', // Thay bằng URL Backend của bạn
});

// Tự động đính kèm Token vào Header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;