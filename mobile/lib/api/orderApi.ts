import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_BASE_URL from './apiConfig';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface OrderItem {
  id: number;
  order_id: number;
  item_id: number;
  quantity: number;
  preferences?: string;
  item: {
    id: number;
    name: string;
    price: number;
  };
}

export interface Order {
  id: number;
  customer_id: number;
  restaurant_id: number;
  total_price: number;
  status: string;
  order_time: string;
  customer?: {
    name: string;
    email: string;
    phone?: string;
  };
  restaurant: {
    name: string;
    location?: string;
  };
  order_items: OrderItem[];
}

export const getCustomerOrders = async (): Promise<Order[]> => {
  const response = await api.get('/orders/customer');
  return response.data;
};

export const getOwnerOrders = async (): Promise<Order[]> => {
  const response = await api.get('/orders/owner');
  return response.data;
};

export const createOrder = async (data: {
  restaurant_id: number;
  items: Array<{
    item_id: number;
    quantity: number;
    preferences?: string;
  }>;
}): Promise<Order> => {
  const response = await api.post('/orders', data);
  return response.data;
};

export const updateOrderStatus = async (id: number, status: string): Promise<Order> => {
  const response = await api.put(`/orders/${id}/status`, { status });
  return response.data;
};

export const getAllOrders = async (): Promise<Order[]> => {
  const response = await api.get('/orders/admin');
  return response.data;
};

export const getAvailableDeliveries = async (): Promise<Order[]> => {
  const response = await api.get('/orders/delivery/available');
  return response.data;
};

export const getDeliveryHistory = async (): Promise<Order[]> => {
  const response = await api.get('/orders/delivery/history');
  return response.data;
};