import express from "express";
import { authenticateToken, requireRole } from "../middleware/auth.js";
import {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getOwnerMenuItems,
} from "../controllers/menuController.js";

const router = express.Router();

// Restaurant-specific routes (public for customers)
router.get("/restaurant/:restaurant_id", getMenuItems);

// Owner-specific routes
router.get("/owner/:owner_id", authenticateToken, requireRole(['owner']), getOwnerMenuItems);

// General CRUD routes
router.get("/:id", getMenuItemById);
router.post("/", authenticateToken, requireRole(['owner']), createMenuItem);
router.put("/:id", authenticateToken, requireRole(['owner']), updateMenuItem);
router.delete("/:id", authenticateToken, requireRole(['owner']), deleteMenuItem);

export default router;