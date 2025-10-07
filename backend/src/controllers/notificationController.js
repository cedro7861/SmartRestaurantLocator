import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 📌 Get notifications for the user (based on role)
export const getNotifications = async (req, res) => {
  try {
    const userRole = req.user.role;
    const notifications = await prisma.notification.findMany({
      where: {
        OR: [
          { target_role: userRole },
          { target_role: 'all' }
        ]
      },
      orderBy: { created_at: 'desc' }
    });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

// 📌 Create notification (Admin only)
export const createNotification = async (req, res) => {
  try {
    const { title, content, target_role } = req.body;

    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Only admins can create notifications" });
    }

    const notification = await prisma.notification.create({
      data: {
        title,
        content,
        target_role
      }
    });

    res.status(201).json({ message: "Notification created successfully", notification });
  } catch (error) {
    res.status(500).json({ error: "Failed to create notification" });
  }
};

// 📌 Get all notifications (Admin only)
export const getAllNotifications = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Only admins can view all notifications" });
    }

    const notifications = await prisma.notification.findMany({
      orderBy: { created_at: 'desc' }
    });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

// 📌 Delete notification (Admin only)
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Only admins can delete notifications" });
    }

    await prisma.notification.delete({
      where: { notification_id: Number(id) }
    });

    res.json({ message: "Notification deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete notification" });
  }
};