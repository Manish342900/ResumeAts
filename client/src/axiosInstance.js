// src/axiosInstance.js
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL:
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:5000/api'
      : 'https://resumeats-1.onrender.com/api',
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // If token is passed in config.headers, use it.
    // Else, fallback to localStorage token
    const token =
      config.headers?.Authorization ||
      `Bearer ${localStorage.getItem('token')}`;

    if (token) {
      config.headers.Authorization = token;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
