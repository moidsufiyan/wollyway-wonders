
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding token
api.interceptors.request.use(
  (config) => {
    const user = localStorage.getItem('user');
    if (user) {
      const { token } = JSON.parse(user);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// API service methods
export const userService = {
  login: async (email: string, password: string) => {
    const { data } = await api.post('/users/login', { email, password });
    return data;
  },
  register: async (name: string, email: string, password: string) => {
    const { data } = await api.post('/users/register', { name, email, password });
    return data;
  },
  getProfile: async () => {
    const { data } = await api.get('/users/profile');
    return data;
  },
  updateProfile: async (userData: any) => {
    const { data } = await api.put('/users/profile', userData);
    return data;
  },
};

export const productService = {
  getProducts: async (params: any = {}) => {
    const { data } = await api.get('/products', { params });
    return data;
  },
  getProductById: async (id: string) => {
    const { data } = await api.get(`/products/${id}`);
    return data;
  },
  createReview: async (productId: string, reviewData: any) => {
    const { data } = await api.post(`/products/${productId}/reviews`, reviewData);
    return data;
  },
  getTopProducts: async () => {
    const { data } = await api.get('/products/top');
    return data;
  },
};

export const orderService = {
  createOrder: async (orderData: any) => {
    const { data } = await api.post('/orders', orderData);
    return data;
  },
  getOrderById: async (id: string) => {
    const { data } = await api.get(`/orders/${id}`);
    return data;
  },
  payOrder: async (id: string, paymentResult: any) => {
    const { data } = await api.put(`/orders/${id}/pay`, paymentResult);
    return data;
  },
  getMyOrders: async () => {
    const { data } = await api.get('/orders/myorders');
    return data;
  },
};

export default api;
