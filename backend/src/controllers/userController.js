import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";

// 📌 Register user (hash password before saving)
export const createUser = async (req, res) => {
  try {
    const { name, email, password, phone, role = 'customer', status } = req.body;

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
      { expiresIn: "24h" }
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

// 📌 Update profile
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming auth middleware
    const { name, email, phone } = req.body;

    // Validate required fields
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: "Name is required" });
    }

    if (!email || email.trim() === '') {
      return res.status(400).json({ error: "Email is required" });
    }

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser && existingUser.user_id !== userId) {
        return res.status(400).json({ error: "Email is already in use" });
      }
    }

    // Update profile
    const updatedUser = await prisma.user.update({
      where: { user_id: userId },
      data: {
        name: name.trim(),
        email: email.trim(),
        phone: phone ? phone.trim() : null
      },
      select: {
        user_id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
      },
    });

    // Generate new JWT token with updated user info
    const token = jwt.sign(
      { id: updatedUser.user_id, role: updatedUser.role, email: updatedUser.email },
      process.env.JWT_SECRET || "supersecretkey",
      { expiresIn: "24h" }
    );

    res.json({
      message: "Profile updated successfully",
      user: updatedUser,
      token: token
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: "Failed to update profile" });
  }
};

// 📌 Change password
export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id; // Authenticated user ID from middleware
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current password and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters long" });
    }

    // Get current user
    const user = await prisma.user.findUnique({
      where: { user_id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    // Check if new password is different from current
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({ error: "New password must be different from current password" });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { user_id: userId },
      data: { password: hashedNewPassword },
    });

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: "Failed to change password" });
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

// 📌 Request password reset
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Always return success message for security (don't reveal if email exists)
    if (!user) {
      return res.json({
        message: "If an account with this email exists, we have sent you a new password."
      });
    }

    // Generate new random password
    const newPassword = crypto.randomBytes(8).toString('hex'); // 16 character random password

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password in database
    await prisma.user.update({
      where: { user_id: user.user_id },
      data: { password: hashedPassword },
    });

    // Create email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Email content
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: 'New Password - Smart Restaurant Locator',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4db6ac;">Password Reset</h2>
          <p>Hello ${user.name},</p>
          <p>You requested a password reset for your Smart Restaurant Locator account.</p>
          <p>Your new password is: <strong>${newPassword}</strong></p>
          <p><strong>Please change this password after logging in for security reasons.</strong></p>
          <p>If you didn't request this password reset, please contact our support team immediately.</p>
          <p>For security reasons, never share this email with anyone.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            Smart Restaurant Locator<br>
            If you have any questions, contact our support team.
          </p>
        </div>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.json({
      message: "If an account with this email exists, we have sent you a new password."
    });

  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ error: "Failed to process password reset request" });
  }
};
