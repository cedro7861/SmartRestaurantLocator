import express from "express";
import { authenticateToken, requireRole } from "../middleware/auth.js";
import {
  getUsers,
  getUserById,
  createUser,
  adminCreateUser,
  updateUser,
  deleteUser,
  loginUser,
  updateProfile,
  changePassword,
  requestPasswordReset,
} from "../controllers/userController.js";

const router = express.Router();

// Admin-only routes
router.get("/", authenticateToken, requireRole(['admin']), getUsers);
router.get("/:id", authenticateToken, requireRole(['admin']), getUserById);
router.post("/admin-create", authenticateToken, requireRole(['admin']), adminCreateUser);
router.put("/:id", authenticateToken, requireRole(['admin']), updateUser);
router.delete("/:id", authenticateToken, requireRole(['admin']), deleteUser);

// Public routes
router.post("/", createUser);
router.post("/login", loginUser);
router.post("/forgot-password", requestPasswordReset);

// 📌 Profile route (corrected)
// All authenticated users can update their own profile.
// Removed ":id" to match the frontend API call and rely on req.user.id from the token.
router.put("/profile", authenticateToken, updateProfile);

// 📌 Change password route (corrected)
// All authenticated users can change their own password.
// Removed ":id" to match the frontend API call and rely on req.user.id from the token.
router.put("/change-password", authenticateToken, changePassword);


export default router;