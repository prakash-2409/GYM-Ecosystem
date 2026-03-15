import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('gymstack_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const gymSlug = localStorage.getItem('gymstack_slug');
    if (gymSlug) {
      config.headers['X-Gym-Slug'] = gymSlug;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('gymstack_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
