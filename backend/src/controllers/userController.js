import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();

// 📌 Email notification helper functions
const sendAccountChangeNotification = async (user, changes, adminUser) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log("Email notification skipped - SMTP not configured");
    console.log(`Account changes for ${user.email}:`, changes);
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const changesList = changes.map(change => `• ${change}`).join('\n');

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: user.email,
      subject: "Smart Restaurant Locator - Account Information Updated",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4db6ac;">Account Information Updated</h2>
          <p>Hello ${user.name},</p>
          <p>Your account information has been updated by an administrator. Here are the changes made:</p>

          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <pre style="font-family: Arial, sans-serif; white-space: pre-line;">${changesList}</pre>
          </div>

          <p>If you did not expect these changes or have any questions, please contact our support team immediately.</p>

          <p>For security reasons, if you notice any suspicious activity, please change your password immediately.</p>

          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            Smart Restaurant Locator<br>
            This is an automated notification. Please do not reply to this email.
          </p>
        </div>
      `,
    });

    console.log(`Account change notification sent to ${user.email}`);
  } catch (error) {
    console.error("Failed to send account change notification:", error);
    throw error;
  }
};

const sendWelcomeEmail = async (user, generatedPassword, adminUser) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log("Welcome email skipped - SMTP not configured");
    console.log(`Welcome credentials for ${user.email}: Password: ${generatedPassword}`);
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: user.email,
      subject: "Welcome to Smart Restaurant Locator - Your Account Details",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4db6ac;">Welcome to Smart Restaurant Locator!</h2>
          <p>Hello ${user.name},</p>
          <p>Your account has been created successfully. Here are your login credentials:</p>

          <div style="background-color: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4db6ac;">
            <h3 style="margin-top: 0; color: #333;">Your Login Information</h3>
            <p style="margin: 10px 0;"><strong>Email:</strong> ${user.email}</p>
            <p style="margin: 10px 0;"><strong>Password:</strong> <span style="background-color: #fff; padding: 2px 6px; border-radius: 3px; font-family: monospace;">${generatedPassword}</span></p>
            <p style="margin: 10px 0;"><strong>Role:</strong> ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
          </div>

          <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <strong>⚠️ Security Notice:</strong> This is a temporary password. Please change it immediately after your first login for security reasons.
          </div>

          <p>You can now log in to the Smart Restaurant Locator app using the credentials above.</p>

          <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>

          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            Smart Restaurant Locator<br>
            This is an automated message. Please do not reply to this email.<br>
            For support, contact our team through the app.
          </p>
        </div>
      `,
    });

    console.log(`Welcome email with credentials sent to ${user.email}`);
  } catch (error) {
    console.error("Failed to send welcome email:", error);
    throw error;
  }
};

const sendWelcomeEmailForRegistration = async (user) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log("Welcome email skipped - SMTP not configured");
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: user.email,
      subject: "Welcome to Smart Restaurant Locator - Account Created Successfully",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4db6ac;">Welcome to Smart Restaurant Locator!</h2>
          <p>Hello ${user.name},</p>
          <p>Thank you for registering with Smart Restaurant Locator! Your account has been created successfully.</p>

          <div style="background-color: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4db6ac;">
            <h3 style="margin-top: 0; color: #333;">Your Account Information</h3>
            <p style="margin: 10px 0;"><strong>Email:</strong> ${user.email}</p>
            <p style="margin: 10px 0;"><strong>Role:</strong> ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
            <p style="margin: 10px 0;"><strong>Status:</strong> Active</p>
          </div>

          <div style="background-color: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #28a745;">
            <strong>🔐 Security Recommendation:</strong> For your account security, we strongly recommend changing your password immediately. You can do this in your account settings after logging in.
          </div>

          <p>You can now log in to the Smart Restaurant Locator app and start exploring restaurants, placing orders, and enjoying our services.</p>

          <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>

          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            Smart Restaurant Locator<br>
            This is an automated message. Please do not reply to this email.<br>
            For support, contact our team through the app.
          </p>
        </div>
      `,
    });

    console.log(`Welcome email sent to ${user.email}`);
  } catch (error) {
    console.error("Failed to send welcome email:", error);
    throw error;
  }
};

// 📌 Get all users (admin only)
export const getUsers = async (req, res) => {
  try {
    console.log('Get users request from user ID:', req.user?.id, 'Role:', req.user?.role);

    const users = await prisma.user.findMany({
      select: {
        user_id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        created_at: true
        // updated_at: true // Removed - field doesn't exist in schema
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    console.log('Successfully fetched', users.length, 'users');
    res.json(users);
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

// 📌 Get user by ID (admin only)
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { user_id: parseInt(id) },
      select: {
        user_id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        created_at: true,
        updated_at: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Get user by ID error:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

// 📌 Register user (public registration)
export const createUser = async (req, res) => {
  try {
    const { name, email, password, phone, role = 'customer', status = 'active' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return res.status(409).json({ error: "User already exists with this email" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        phone: phone ? phone.trim() : null,
        role,
        status,
      },
      select: {
        user_id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        created_at: true
      }
    });

    // Send welcome email for public registration
    try {
      await sendWelcomeEmailForRegistration(newUser);
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
      // Don't fail registration if email fails
    }

    res.status(201).json({ message: "User created successfully", user: newUser });
  } catch (error) {
    console.error("Create user error:", error);

    if (error.code === 'P2002') {
      return res.status(409).json({ error: "User with this email already exists" });
    }

    res.status(500).json({ error: "Failed to create user" });
  }
};

// 📌 Admin create user (with auto-generated credentials and email notification)
export const adminCreateUser = async (req, res) => {
  try {
    const { name, email, phone, role = 'customer' } = req.body;
    const adminUser = req.user; // Admin creating the user

    if (!name || !email) {
      return res.status(400).json({ error: "Name and email are required" });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return res.status(409).json({ error: "User already exists with this email" });
    }

    // Generate secure random password
    const generatedPassword = crypto.randomBytes(12).toString('hex');
    const hashedPassword = await bcrypt.hash(generatedPassword, 12);

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        phone: phone ? phone.trim() : null,
        role,
        status: 'active', // Admin-created users start as active
      },
      select: {
        user_id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        created_at: true
      }
    });

    // Send welcome email with credentials
    try {
      await sendWelcomeEmail(newUser, generatedPassword, adminUser);
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
      // Don't fail the user creation if email fails
    }

    res.status(201).json({
      message: "User created successfully. Login credentials sent to email.",
      user: newUser
    });
  } catch (error) {
    console.error("Admin create user error:", error);

    if (error.code === 'P2002') {
      return res.status(409).json({ error: "User with this email already exists" });
    }

    res.status(500).json({ error: "Failed to create user" });
  }
};

// 📌 Update user (admin only) - Enhanced with email notifications
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, role, status } = req.body;
    const adminUser = req.user; // Admin making the change

    const existingUser = await prisma.user.findUnique({
      where: { user_id: parseInt(id) }
    });

    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Track changes for email notification
    const changes = [];

    // Check if email is being changed and if it's already taken
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      });
      if (emailExists) {
        return res.status(409).json({ error: "Email already in use by another user" });
      }
      changes.push(`Email changed from ${existingUser.email} to ${email}`);
    }

    // Track other changes
    if (name && name.trim() !== existingUser.name) {
      changes.push(`Name changed from "${existingUser.name}" to "${name.trim()}"`);
    }
    if (phone !== undefined && phone !== existingUser.phone) {
      const oldPhone = existingUser.phone || 'none';
      const newPhone = phone || 'none';
      changes.push(`Phone changed from ${oldPhone} to ${newPhone}`);
    }
    if (role && role !== existingUser.role) {
      changes.push(`Role changed from ${existingUser.role} to ${role}`);
    }
    if (status && status !== existingUser.status) {
      changes.push(`Status changed from ${existingUser.status} to ${status}`);
    }

    const updatedUser = await prisma.user.update({
      where: { user_id: parseInt(id) },
      data: {
        name: name ? name.trim() : existingUser.name,
        email: email ? email.toLowerCase().trim() : existingUser.email,
        phone: phone !== undefined ? (phone ? phone.trim() : null) : existingUser.phone,
        role: role || existingUser.role,
        status: status || existingUser.status,
      },
      select: {
        user_id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        created_at: true
      }
    });

    // Send email notification if there were changes
    if (changes.length > 0) {
      try {
        await sendAccountChangeNotification(updatedUser, changes, adminUser);
      } catch (emailError) {
        console.error("Failed to send account change notification:", emailError);
        // Don't fail the update if email fails
      }
    }

    res.json({
      message: "User updated successfully",
      user: updatedUser,
      changes: changes.length > 0 ? changes : null
    });
  } catch (error) {
    console.error("Update user error:", error);

    if (error.code === 'P2025') {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(500).json({ error: "Failed to update user" });
  }
};

// 📌 DELETE USER FUNCTION - THIS WAS MISSING
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { user_id: parseInt(id) }
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Prevent users from deleting themselves
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: "Cannot delete your own account" });
    }

    await prisma.user.delete({
      where: { user_id: parseInt(id) }
    });

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.status(500).json({ error: "Failed to delete user" });
  }
};

// 📌 Login user
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await prisma.user.findUnique({ 
      where: { email: email.toLowerCase() } 
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ error: "Account is deactivated" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined");
      return res.status(500).json({ error: "Server configuration error" });
    }

    const token = jwt.sign(
      { 
        id: user.user_id, 
        role: user.role, 
        email: user.email 
      },
      process.env.JWT_SECRET,
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
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
};

// 📌 Update profile (authenticated users)
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, phone } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: "Name and email are required" });
    }

    const existingUser = await prisma.user.findUnique({ 
      where: { email: email.toLowerCase() } 
    });
    
    if (existingUser && existingUser.user_id !== userId) {
      return res.status(409).json({ error: "Email already in use by another user" });
    }

    const updatedUser = await prisma.user.update({
      where: { user_id: userId },
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone ? phone.trim() : null,
      },
      select: {
        user_id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        created_at: true,
        // updated_at: true // Removed - field doesn't exist in schema
      }
    });

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined");
      return res.status(500).json({ error: "Server configuration error" });
    }

    const token = jwt.sign(
      { 
        id: updatedUser.user_id, 
        role: updatedUser.role, 
        email: updatedUser.email 
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      message: "Profile updated successfully",
      user: updatedUser,
      token,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.status(500).json({ error: "Failed to update profile" });
  }
};

// 📌 Change password (authenticated users)
export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Both current and new passwords are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters long" });
    }

    const user = await prisma.user.findUnique({ where: { user_id: userId } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ error: "Current password is incorrect" });

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({ error: "New password must be different from current password" });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { user_id: userId },
      data: { password: hashedNewPassword },
    });

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ error: "Failed to change password" });
  }
};

// 📌 Request password reset (send new random password via email)
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const user = await prisma.user.findUnique({ 
      where: { email: email.toLowerCase() } 
    });
    
    if (!user) {
      return res.json({ 
        message: "If an account exists with this email, a password reset email has been sent." 
      });
    }

    const newPassword = crypto.randomBytes(10).toString("hex");
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { user_id: user.user_id },
      data: { password: hashedPassword },
    });

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error("Email configuration missing");
      console.log(`Password reset for ${email}: ${newPassword}`);
      return res.status(500).json({ 
        error: "Password reset functionality temporarily unavailable" 
      });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: "Smart Restaurant Locator – Password Reset",
      html: `
        <h3>Hello ${user.name},</h3>
        <p>Your password has been reset. Your new temporary password is: <b>${newPassword}</b></p>
        <p><strong>Please change your password immediately after logging in for security reasons.</strong></p>
        <br>
        <p>If you didn't request this reset, please contact support immediately.</p>
      `,
    });

    res.json({ 
      message: "If an account exists with this email, a password reset email has been sent." 
    });
  } catch (error) {
    console.error("Password reset request error:", error);
    res.status(500).json({ error: "Failed to process password reset request" });
  }
};