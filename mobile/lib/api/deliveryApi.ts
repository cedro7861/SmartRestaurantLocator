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

export interface DeliveryPerson {
  user_id: number;
  name: string;
  email: string;
  phone?: string;
}

export interface Delivery {
  delivery_id: number;
  order_id: number;
  delivery_person_id: number;
  latitude?: number;
  longitude?: number;
  status: 'pending' | 'on_route' | 'delivered';
  updated_at: string;
  order: {
    id: number;
    customer: {
      name: string;
      email: string;
      phone?: string;
    };
    restaurant: {
      name: string;
      location?: string;
      contact_info?: string;
      latitude?: string;
      longitude?: string;
    };
    order_items: Array<{
      id: number;
      quantity: number;
      preferences?: string;
      item: {
        id: number;
        name: string;
        price: number;
      };
    }>;
    total_price: number;
    order_type: 'pickup' | 'delivery' | 'dine_in';
    order_time: string;
  };
  delivery_person?: {
    user_id: number;
    name: string;
    email: string;
    phone?: string;
  };
}

// 📌 Assign delivery person to order
export const assignDelivery = async (data: {
  order_id: number;
  delivery_person_id: number;
}): Promise<any> => {
  const response = await api.post('/deliveries/assign', data);
  return response.data;
};

// 📌 Reassign delivery person to order
export const reassignDelivery = async (data: {
  delivery_id: number;
  new_delivery_person_id: number;
}): Promise<any> => {
  const response = await api.post('/deliveries/reassign', data);
  return response.data;
};

// 📌 Get available delivery persons
export const getAvailableDeliveryPersons = async (): Promise<DeliveryPerson[]> => {
  const response = await api.get('/deliveries/persons/available');
  return response.data;
};

// 📌 Update delivery status
export const updateDeliveryStatus = async (
  deliveryId: number,
  data: {
    status: 'pending' | 'on_route' | 'delivered';
    latitude?: number;
    longitude?: number;
  }
): Promise<Delivery> => {
  const response = await api.put(`/deliveries/${deliveryId}/status`, data);
  return response.data;
};

// 📌 Get deliveries for delivery person
export const getDeliveryPersonDeliveries = async (): Promise<Delivery[]> => {
  const response = await api.get('/deliveries/person');
  return response.data;
};

// 📌 Get all deliveries (Admin)
export const getAllDeliveries = async (): Promise<Delivery[]> => {
  const response = await api.get('/deliveries/admin/all');
  return response.data;
};

// 📌 Get deliveries for owner's restaurants (Owner)
export const getOwnerDeliveries = async (): Promise<Delivery[]> => {
  const response = await api.get('/deliveries/owner');
  return response.data;
};