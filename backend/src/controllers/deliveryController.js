import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 📌 Assign delivery person to order
export const assignDelivery = async (req, res) => {
  try {
    const { order_id, delivery_person_id } = req.body;
    const ownerId = req.user?.id;
    console.log('Assigning delivery - Order ID:', order_id, 'Delivery Person ID:', delivery_person_id, 'Owner ID:', ownerId);

    // Check if order exists and is ready for delivery
    const order = await prisma.order.findUnique({
      where: { id: Number(order_id) },
      include: {
        deliveries: true,
        restaurant: true
      }
    });

    if (!order) {
      console.log('Order not found:', order_id);
      return res.status(404).json({ error: "Order not found" });
    }

    // Check if the owner owns this restaurant
    if (order.restaurant.owner_id !== ownerId) {
      console.log('Owner does not own this restaurant:', order.restaurant.owner_id, 'vs', ownerId);
      return res.status(403).json({ error: "You can only assign deliveries for your own restaurants" });
    }

    if (order.status !== 'ready') {
      console.log('Order status is not ready:', order.status);
      return res.status(400).json({ error: "Order is not ready for delivery" });
    }

    if (order.order_type !== 'delivery') {
      console.log('Order type is not delivery:', order.order_type);
      return res.status(400).json({ error: "Order is not a delivery order" });
    }

    // Check if delivery person exists and is active
    const deliveryPerson = await prisma.user.findUnique({
      where: { user_id: Number(delivery_person_id) }
    });

    if (!deliveryPerson || deliveryPerson.role !== 'delivery' || deliveryPerson.status !== 'active') {
      console.log('Invalid delivery person:', deliveryPerson);
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

    console.log('Delivery assigned successfully:', delivery.delivery_id);
    res.status(201).json({
      message: "Delivery assigned successfully",
      delivery
    });
  } catch (error) {
    console.error('Assign delivery error:', error);
    res.status(500).json({ error: "Failed to assign delivery" });
  }
};

// 📌 Reassign delivery person to order
export const reassignDelivery = async (req, res) => {
  try {
    const { delivery_id, new_delivery_person_id } = req.body;

    // Check if delivery exists
    const delivery = await prisma.delivery.findUnique({
      where: { delivery_id: Number(delivery_id) },
      include: { order: true }
    });

    if (!delivery) {
      return res.status(404).json({ error: "Delivery not found" });
    }

    // Check if new delivery person exists and is active
    const newDeliveryPerson = await prisma.user.findUnique({
      where: { user_id: Number(new_delivery_person_id) }
    });

    if (!newDeliveryPerson || newDeliveryPerson.role !== 'delivery' || newDeliveryPerson.status !== 'active') {
      return res.status(400).json({ error: "Invalid delivery person" });
    }

    // Update delivery record
    const updatedDelivery = await prisma.delivery.update({
      where: { delivery_id: Number(delivery_id) },
      data: {
        delivery_person_id: Number(new_delivery_person_id),
        status: 'pending' // Reset status when reassigned
      }
    });

    res.json({
      message: "Delivery reassigned successfully",
      delivery: updatedDelivery
    });
  } catch (error) {
    console.error('Reassign delivery error:', error);
    res.status(500).json({ error: "Failed to reassign delivery" });
  }
};

// 📌 Get available delivery persons
export const getAvailableDeliveryPersons = async (req, res) => {
  try {
    console.log('Fetching available delivery persons for user role:', req.user.role);

    // Check if user is owner or admin
    if (!req.user || (req.user.role !== 'owner' && req.user.role !== 'admin')) {
      return res.status(403).json({ error: "Access denied. Only owners and admins can view delivery persons." });
    }

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

    console.log('Found delivery persons:', deliveryPersons.length);
    res.json(deliveryPersons);
  } catch (error) {
    console.error('Error fetching delivery persons:', error);
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

// 📌 Get deliveries for owner's restaurants (Owner only)
export const getOwnerDeliveries = async (req, res) => {
  try {
    const ownerId = req.user.id;
    console.log('Fetching deliveries for owner ID:', ownerId);

    const deliveries = await prisma.delivery.findMany({
      where: {
        order: {
          restaurant: {
            owner_id: ownerId
          }
        }
      },
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
        },
        delivery_person: {
          select: { user_id: true, name: true, email: true, phone: true }
        }
      },
      orderBy: { updated_at: 'desc' }
    });

    console.log('Found deliveries for owner:', deliveries.length);
    res.json(deliveries);
  } catch (error) {
    console.error('Error fetching owner deliveries:', error);
    res.status(500).json({ error: "Failed to fetch deliveries" });
  }
};