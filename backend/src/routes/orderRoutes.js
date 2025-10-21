import express from "express";
import { authenticateToken, requireRole } from "../middleware/auth.js";
import {
  getCustomerOrders,
  getOwnerOrders,
  getOwnerReadyOrders,
  getAllOrders,
  getAvailableDeliveries,
  getDeliveryHistory,
  createOrder,
  updateOrderStatus,
} from "../controllers/orderController.js";

const router = express.Router();

// Customer routes
router.get("/customer", authenticateToken, getCustomerOrders);
router.post("/", authenticateToken, createOrder);

// Owner routes
router.get("/owner", authenticateToken, requireRole(['owner']), getOwnerOrders);
router.get("/owner/ready", authenticateToken, requireRole(['owner']), getOwnerReadyOrders);
router.put("/:id/status", authenticateToken, requireRole(['owner']), updateOrderStatus);

// Admin routes
router.get("/admin", authenticateToken, requireRole(['admin']), getAllOrders);

// Delivery routes
router.get("/delivery/available", authenticateToken, requireRole(['delivery']), getAvailableDeliveries);
router.get("/delivery/history", authenticateToken, requireRole(['delivery']), getDeliveryHistory);

export default router;