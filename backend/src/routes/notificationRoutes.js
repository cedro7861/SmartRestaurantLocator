import express from 'express';
import {
  getNotifications,
  createNotification,
  getAllNotifications,
  deleteNotification
} from '../controllers/notificationController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get notifications for the authenticated user
router.get('/', authenticateToken, getNotifications);

// Admin routes
router.post('/', authenticateToken, createNotification);
router.get('/admin', authenticateToken, getAllNotifications);
router.delete('/:id', authenticateToken, deleteNotification);

export default router;