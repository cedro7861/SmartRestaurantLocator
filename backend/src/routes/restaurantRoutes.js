import express from "express";
import { authenticateToken, requireRole } from "../middleware/auth.js";
import {
  getRestaurants,
  getAllRestaurants,
  getOwnerRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  approveRestaurant,
  rejectRestaurant,
} from "../controllers/restaurantController.js";

const router = express.Router();

// Public routes (for customers)
router.get("/", getRestaurants);
router.get("/:id", getRestaurantById);

// Admin routes
router.get("/admin/all", authenticateToken, requireRole(['admin']), getAllRestaurants);
router.put("/:id/approve", authenticateToken, requireRole(['admin']), approveRestaurant);
router.put("/:id/reject", authenticateToken, requireRole(['admin']), rejectRestaurant);

// Owner routes
router.get("/owner/:owner_id", authenticateToken, requireRole(['owner']), getOwnerRestaurants);
router.post("/", authenticateToken, requireRole(['owner']), createRestaurant);
router.put("/:id", authenticateToken, requireRole(['owner']), updateRestaurant);
router.delete("/:id", authenticateToken, requireRole(['owner']), deleteRestaurant);

export default router;