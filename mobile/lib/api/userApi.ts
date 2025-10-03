import axios from 'axios';
import API_BASE_URL from './apiConfig';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export interface User {
  id: number;
  name: string;
  email: string;
  // Add other fields as per your schema
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: string;
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