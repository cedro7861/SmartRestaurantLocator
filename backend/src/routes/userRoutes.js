import express from "express";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  loginUser,
} from "../controllers/userController.js";

const router = express.Router();

router.get("/", getUsers);
router.get("/:id", getUserById);
router.post("/", createUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

// 📌 Login route
router.post("/login", loginUser);

export default router;
