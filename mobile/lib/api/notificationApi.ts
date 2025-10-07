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

export interface Notification {
  notification_id: number;
  title: string;
  content: string;
  target_role: string;
  created_at: string;
}

export const getNotifications = async (): Promise<Notification[]> => {
  const response = await api.get('/notifications');
  return response.data;
};

export const createNotification = async (data: { title: string; content: string; target_role: string }): Promise<Notification> => {
  const response = await api.post('/notifications', data);
  return response.data;
};

export const getAllNotifications = async (): Promise<Notification[]> => {
  const response = await api.get('/notifications/admin');
  return response.data;
};

export const deleteNotification = async (id: number): Promise<void> => {
  await api.delete(`/notifications/${id}`);
};