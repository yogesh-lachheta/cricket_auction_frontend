import axios from 'axios';
import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import toast from 'react-hot-toast';

// Base URL from environment variable or default
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

// Create axios instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage
    const token = localStorage.getItem('access_token');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle different error statuses
    if (error.response) {
      const status = error.response.status;
      const data: any = error.response.data;

      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          toast.error('Session expired. Please login again.');
          break;

        case 403:
          // Forbidden - user doesn't have permission
          toast.error(data?.detail || 'You do not have permission to perform this action.');
          break;

        case 404:
          // Not found
          toast.error(data?.detail || 'Resource not found.');
          break;

        case 422:
          // Validation error
          const validationErrors = data?.detail;
          if (Array.isArray(validationErrors)) {
            validationErrors.forEach((err: any) => {
              toast.error(`${err.loc?.join(' → ')}: ${err.msg}`);
            });
          } else {
            toast.error(data?.detail || 'Validation error.');
          }
          break;

        case 500:
          // Server error
          toast.error('Server error. Please try again later.');
          break;

        default:
          toast.error(data?.detail || 'An error occurred.');
      }
    } else if (error.request) {
      // Request made but no response
      toast.error('Network error. Please check your connection.');
    } else {
      // Something else happened
      toast.error('An unexpected error occurred.');
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
