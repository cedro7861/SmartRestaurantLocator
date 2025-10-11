import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 📌 Assign delivery person to order
export const assignDelivery = async (req, res) => {
  try {
    const { order_id, delivery_person_id } = req.body;

    // Check if order exists and is ready for delivery
    const order = await prisma.order.findUnique({
      where: { id: Number(order_id) },
      include: { deliveries: true }
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.status !== 'ready') {
      return res.status(400).json({ error: "Order is not ready for delivery" });
    }

    if (order.order_type !== 'delivery') {
      return res.status(400).json({ error: "Order is not a delivery order" });
    }

    // Check if delivery person exists and is active
    const deliveryPerson = await prisma.user.findUnique({
      where: { user_id: Number(delivery_person_id) }
    });

    if (!deliveryPerson || deliveryPerson.role !== 'delivery' || deliveryPerson.status !== 'active') {
      return res.status(400).json({ error: "Invalid delivery person" });
    }

    // Create delivery record
    const delivery = await prisma.delivery.create({
      data: {
        order_id: Number(order_id),
        delivery_person_id: Number(delivery_person_id),
        status: 'pending'
      }
    });

    // Update order status to delivering
    await prisma.order.update({
      where: { id: Number(order_id) },
      data: { status: 'delivering' }
    });

    res.status(201).json({
      message: "Delivery assigned successfully",
      delivery
    });
  } catch (error) {
    console.error('Assign delivery error:', error);
    res.status(500).json({ error: "Failed to assign delivery" });
  }
};

// 📌 Get available delivery persons
export const getAvailableDeliveryPersons = async (req, res) => {
  try {
    const deliveryPersons = await prisma.user.findMany({
      where: {
        role: 'delivery',
        status: 'active'
      },
      select: {
        user_id: true,
        name: true,
        email: true,
        phone: true
      }
    });

    res.json(deliveryPersons);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch delivery persons" });
  }
};

// 📌 Update delivery status
export const updateDeliveryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, latitude, longitude } = req.body;

    const validStatuses = ['pending', 'on_route', 'delivered'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid delivery status" });
    }

    const delivery = await prisma.delivery.update({
      where: { delivery_id: Number(id) },
      data: {
        status,
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined,
        updated_at: new Date()
      }
    });

    // If delivery is completed, update order status
    if (status === 'delivered') {
      await prisma.order.update({
        where: { id: delivery.order_id },
        data: { status: 'delivered' }
      });
    }

    res.json(delivery);
  } catch (error) {
    res.status(500).json({ error: "Failed to update delivery status" });
  }
};

// 📌 Get deliveries for a delivery person
export const getDeliveryPersonDeliveries = async (req, res) => {
  try {
    const deliveryPersonId = req.user.id;
    console.log('Fetching deliveries for delivery person ID:', deliveryPersonId);

    const deliveries = await prisma.delivery.findMany({
      where: { delivery_person_id: deliveryPersonId },
      include: {
        order: {
          include: {
            customer: {
              select: { name: true, email: true, phone: true }
            },
            restaurant: {
              select: { name: true, location: true, contact_info: true, latitude: true, longitude: true }
            },
            order_items: {
              include: {
                item: true
              }
            }
          }
        }
      },
      orderBy: { updated_at: 'desc' }
    });

    console.log('Found deliveries:', deliveries.length);
    deliveries.forEach((delivery, index) => {
      console.log(`Delivery ${index + 1}: ID=${delivery.delivery_id}, Status=${delivery.status}, Order ID=${delivery.order_id}`);
    });

    res.json(deliveries);
  } catch (error) {
    console.error('Error fetching deliveries:', error);
    res.status(500).json({ error: "Failed to fetch deliveries" });
  }
};

// 📌 Get all deliveries (Admin only)
export const getAllDeliveries = async (req, res) => {
  try {
    const deliveries = await prisma.delivery.findMany({
      include: {
        order: {
          include: {
            customer: {
              select: { name: true, email: true, phone: true }
            },
            restaurant: {
              select: { name: true, location: true, contact_info: true }
            },
            order_items: {
              include: {
                item: true
              }
            }
          }
        },
        delivery_person: {
          select: { user_id: true, name: true, email: true, phone: true }
        }
      },
      orderBy: { updated_at: 'desc' }
    });

    res.json(deliveries);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch deliveries" });
  }
};