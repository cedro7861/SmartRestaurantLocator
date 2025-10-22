import express from "express";
import { authenticateToken, requireRole } from "../middleware/auth.js";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  loginUser,
  updateProfile,
  changePassword,
  requestPasswordReset,
} from "../controllers/userController.js";

const router = express.Router();

router.get("/", authenticateToken, requireRole(['admin']), getUsers);
router.get("/:id", authenticateToken, getUserById);
router.post("/", createUser);
router.put("/:id", authenticateToken, requireRole(['admin']), updateUser);
router.delete("/:id", authenticateToken, requireRole(['admin']), deleteUser);

// 📌 Login route
router.post("/login", loginUser);

// 📌 Profile routes
router.put("/profile", authenticateToken, updateProfile);

// 📌 Change password route
router.put("/change-password", authenticateToken, changePassword);

// 📌 Forgot password route
router.post("/forgot-password", requestPasswordReset);

export default router;
