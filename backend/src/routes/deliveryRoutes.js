import express from 'express';
import {
  assignDelivery,
  getAvailableDeliveryPersons,
  updateDeliveryStatus,
  getDeliveryPersonDeliveries,
  getAllDeliveries
} from '../controllers/deliveryController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// 📌 Assign delivery person to order (Owner only)
router.post('/assign', authenticateToken, assignDelivery);

// 📌 Get available delivery persons (Owner/Admin)
router.get('/persons/available', authenticateToken, getAvailableDeliveryPersons);

// 📌 Update delivery status (Delivery person)
router.put('/:id/status', authenticateToken, updateDeliveryStatus);

// 📌 Get deliveries for delivery person
router.get('/person', authenticateToken, getDeliveryPersonDeliveries);

// 📌 Get all deliveries (Admin only)
router.get('/admin/all', authenticateToken, getAllDeliveries);

export default router;