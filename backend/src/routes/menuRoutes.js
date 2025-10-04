import express from "express";
import {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getOwnerMenuItems,
} from "../controllers/menuController.js";

const router = express.Router();

// Restaurant-specific routes
router.get("/restaurant/:restaurant_id", getMenuItems);

// Owner-specific routes
router.get("/owner/:owner_id", getOwnerMenuItems);

// General CRUD routes
router.get("/:id", getMenuItemById);
router.post("/", createMenuItem);
router.put("/:id", updateMenuItem);
router.delete("/:id", deleteMenuItem);

export default router;