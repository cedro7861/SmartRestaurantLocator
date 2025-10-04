import axios from 'axios';
import API_BASE_URL from './apiConfig';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export interface MenuItem {
  id: number;
  restaurant_id: number;
  name: string;
  description?: string;
  price: number;
  category?: string;
  image?: string;
  status: boolean;
  created_at: string;
  restaurant?: {
    name: string;
  };
}

export interface CreateMenuItemData {
  restaurant_id: number;
  name: string;
  description?: string;
  price: number;
  category?: string;
  image?: string;
}

export const getMenuItems = async (restaurantId: number): Promise<MenuItem[]> => {
  const response = await api.get(`/menu/restaurant/${restaurantId}`);
  return response.data;
};

export const getOwnerMenuItems = async (ownerId: number): Promise<MenuItem[]> => {
  const response = await api.get(`/menu/owner/${ownerId}`);
  return response.data;
};

export const getMenuItemById = async (id: number): Promise<MenuItem> => {
  const response = await api.get(`/menu/${id}`);
  return response.data;
};

export const createMenuItem = async (data: CreateMenuItemData): Promise<MenuItem> => {
  const response = await api.post('/menu', data);
  return response.data.menuItem;
};

export const updateMenuItem = async (id: number, data: Partial<CreateMenuItemData & { status: boolean }>): Promise<MenuItem> => {
  const response = await api.put(`/menu/${id}`, data);
  return response.data.menuItem;
};

export const deleteMenuItem = async (id: number): Promise<void> => {
  await api.delete(`/menu/${id}`);
};