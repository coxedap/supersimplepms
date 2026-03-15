import axios from 'axios';
import { useToastStore } from '../store/useToastStore';

export const api = axios.create({
  baseURL: '/api',
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || error.message || 'An unexpected error occurred';
    useToastStore.getState().addToast(message, 'error');
    return Promise.reject(error);
  }
);
