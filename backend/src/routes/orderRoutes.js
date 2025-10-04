import express from "express";
import {
  getCustomerOrders,
  getOwnerOrders,
  createOrder,
  updateOrderStatus,
} from "../controllers/orderController.js";

const router = express.Router();

// Customer routes
router.get("/customer", getCustomerOrders);
router.post("/", createOrder);

// Owner routes
router.get("/owner", getOwnerOrders);
router.put("/:id/status", updateOrderStatus);

export default router;