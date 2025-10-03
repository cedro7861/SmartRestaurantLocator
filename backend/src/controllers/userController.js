import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// 📌 Register user (hash password before saving)
export const createUser = async (req, res) => {
  try {
    const { name, email, password, phone, role, status } = req.body;

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        role,
        status,
      },
    });

    res
      .status(201)
      .json({ message: "User created successfully", user: newUser });
  } catch (error) {
    res.status(500).json({ error: "Failed to create user" });
  }
};

// 📌 Login user (verify password + return JWT token)
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // generate JWT token
    const token = jwt.sign(
      { id: user.user_id, role: user.role, email: user.email },
      process.env.JWT_SECRET || "supersecretkey", // set JWT_SECRET in .env
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
};

// 📌 Get all users
export const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

// 📌 Get single user by ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { user_id: Number(id) },
    });

    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

// 📌 Update user
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, role, status } = req.body;

    const updatedUser = await prisma.user.update({
      where: { user_id: Number(id) },
      data: { name, email, phone, role, status },
    });

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: "Failed to update user" });
  }
};

// 📌 Delete user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.user.delete({
      where: { user_id: Number(id) },
    });

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete user" });
  }
};
