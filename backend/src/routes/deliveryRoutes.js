import express from 'express';
import {
  assignDelivery,
  reassignDelivery,
  getAvailableDeliveryPersons,
  updateDeliveryStatus,
  getDeliveryPersonDeliveries,
  getAllDeliveries,
  getOwnerDeliveries
} from '../controllers/deliveryController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// 📌 Assign delivery person to order (Owner only)
router.post('/assign', authenticateToken, requireRole(['owner']), assignDelivery);

// 📌 Reassign delivery person to order (Owner only)
router.post('/reassign', authenticateToken, requireRole(['owner']), reassignDelivery);

// 📌 Get available delivery persons (Owner/Admin)
router.get('/persons/available', authenticateToken, requireRole(['owner', 'admin']), getAvailableDeliveryPersons);

// 📌 Update delivery status (Delivery person)
router.put('/:id/status', authenticateToken, updateDeliveryStatus);

// 📌 Get deliveries for delivery person
router.get('/person', authenticateToken, getDeliveryPersonDeliveries);

// 📌 Get all deliveries (Admin only)
router.get('/admin/all', authenticateToken, getAllDeliveries);

// 📌 Get deliveries for owner's restaurants (Owner only)
router.get('/owner', authenticateToken, getOwnerDeliveries);

export default router;