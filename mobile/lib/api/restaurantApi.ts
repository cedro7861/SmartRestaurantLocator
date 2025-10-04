import axios from 'axios';
import API_BASE_URL from './apiConfig';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export interface Restaurant {
  id: number;
  owner_id: number;
  name: string;
  location?: string;
  contact_info?: string;
  latitude?: number;
  longitude?: number;
  image?: string;
  status: string;
  approved: boolean;
  created_at: string;
  owner: {
    name: string;
    email: string;
    phone?: string;
  };
  menu_items?: MenuItem[];
  _count?: {
    orders: number;
  };
}

export interface MenuItem {
  id: number;
  restaurant_id: number;
  name: string;
  category?: string;
  description?: string;
  price: number;
  image?: string;
  status: boolean;
  created_at: string;
}

export const getRestaurants = async (): Promise<Restaurant[]> => {
  const response = await api.get('/restaurants');
  return response.data;
};

export const getRestaurantById = async (id: number): Promise<Restaurant> => {
  const response = await api.get(`/restaurants/${id}`);
  return response.data;
};

export const getAllRestaurants = async (): Promise<Restaurant[]> => {
  const response = await api.get('/restaurants/admin/all');
  return response.data;
};

export const approveRestaurant = async (id: number): Promise<Restaurant> => {
  const response = await api.put(`/restaurants/${id}/approve`);
  return response.data;
};

export const rejectRestaurant = async (id: number): Promise<Restaurant> => {
  const response = await api.put(`/restaurants/${id}/reject`);
  return response.data;
};

export const getOwnerRestaurants = async (ownerId: number): Promise<Restaurant[]> => {
  const response = await api.get(`/restaurants/owner/${ownerId}`);
  return response.data;
};

export const updateRestaurant = async (id: number, data: Partial<{
  name: string;
  location: string;
  contact_info?: string;
  latitude?: number;
  longitude?: number;
  image?: string;
  status: string;
  approved: boolean;
}>): Promise<Restaurant> => {
  const response = await api.put(`/restaurants/${id}`, data);
  return response.data;
};

export const deleteRestaurant = async (id: number): Promise<void> => {
  await api.delete(`/restaurants/${id}`);
};

export const createRestaurant = async (data: {
  name: string;
  location: string;
  contact_info?: string;
  latitude?: string;
  longitude?: string;
  image?: string;
  owner_id?: number;
}): Promise<Restaurant> => {
  const response = await api.post('/restaurants', data);
  return response.data;
};