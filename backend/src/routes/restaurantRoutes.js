import express from "express";
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
router.get("/admin/all", getAllRestaurants);
router.put("/:id/approve", approveRestaurant);
router.put("/:id/reject", rejectRestaurant);

// Owner routes
router.get("/owner/:owner_id", getOwnerRestaurants);
router.post("/", createRestaurant);
router.put("/:id", updateRestaurant);
router.delete("/:id", deleteRestaurant);

export default router;