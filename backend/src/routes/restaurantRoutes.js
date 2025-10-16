import express from "express";
import { authenticateToken, requireRole } from "../middleware/auth.js";
import { PrismaClient } from "@prisma/client";
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

const prisma = new PrismaClient();

const router = express.Router();

// Public routes (for customers)
router.get("/", getRestaurants);
router.get("/:id", getRestaurantById);

// Admin routes
router.get("/admin/all", authenticateToken, requireRole(['admin']), getAllRestaurants);
router.put("/:id/approve", authenticateToken, requireRole(['admin']), approveRestaurant);
router.put("/:id/reject", authenticateToken, requireRole(['admin']), rejectRestaurant);
router.delete("/:id", authenticateToken, requireRole(['admin']), deleteRestaurant);

// Owner routes
router.get("/owner/:owner_id", authenticateToken, requireRole(['owner']), getOwnerRestaurants);
router.post("/", authenticateToken, requireRole(['owner']), createRestaurant);

// Middleware to check restaurant ownership for updates and deletes
const checkRestaurantOwnership = async (req, res, next) => {
  try {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: Number(req.params.id) }
    });

    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found" });
    }

    if (restaurant.owner_id !== req.user.id) {
      return res.status(403).json({ error: "You can only modify your own restaurants" });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

router.put("/:id", authenticateToken, requireRole(['owner']), checkRestaurantOwnership, updateRestaurant);
router.delete("/:id", authenticateToken, requireRole(['owner']), checkRestaurantOwnership, deleteRestaurant);

export default router;