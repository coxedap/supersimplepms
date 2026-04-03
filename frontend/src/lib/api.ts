import axios from 'axios';
import { useToastStore } from '../store/useToastStore';
import { useAuthStore } from '../store/useAuthStore';

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // send httpOnly cookie on every request
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    const message = error.response?.data?.error || error.message || 'An unexpected error occurred';
    useToastStore.getState().addToast(message, 'error');
    return Promise.reject(error);
  }
);
