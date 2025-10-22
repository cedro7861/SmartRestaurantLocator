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

export interface User {
  user_id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  phone?: string;
  // Add other fields as per your schema
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: string;
  status?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export const getUsers = async (): Promise<User[]> => {
  const response = await api.get('/users');
  return response.data;
};

export const getUserById = async (id: number): Promise<User> => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

export const createUser = async (userData: CreateUserData): Promise<User> => {
  const response = await api.post('/users', userData);
  return response.data;
};

export const updateUser = async (id: number, userData: Partial<CreateUserData>): Promise<User> => {
  const response = await api.put(`/users/${id}`, userData);
  return response.data;
};

export const deleteUser = async (id: number): Promise<void> => {
  await api.delete(`/users/${id}`);
};

export const loginUser = async (loginData: LoginData): Promise<any> => {
  const response = await api.post('/users/login', loginData);
  return response.data;
};

export const updateProfile = async (data: {
  name?: string;
  email?: string;
  phone?: string;
}): Promise<{ message: string; user: any; token: string }> => {
  const response = await api.put('/users/profile', data);
  return response.data;
};

export const changePassword = async (data: {
  currentPassword: string;
  newPassword: string;
}): Promise<any> => {
  const response = await api.put('/users/change-password', data);
  return response.data;
};

export const requestPasswordReset = async (data: {
  email: string;
}): Promise<any> => {
  const response = await api.post('/users/forgot-password', data);
  return response.data;
};