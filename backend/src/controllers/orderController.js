import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 📌 Get orders for a customer
export const getCustomerOrders = async (req, res) => {
  try {
    const customerId = req.user.id; // Assuming auth middleware
    const orders = await prisma.order.findMany({
      where: { customer_id: customerId },
      include: {
        restaurant: {
          select: { name: true, location: true, contact_info: true }
        },
        order_items: {
          include: {
            item: true
          }
        }
      },
      orderBy: { order_time: 'desc' }
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

// 📌 Get orders for owner's restaurants
export const getOwnerOrders = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const orders = await prisma.order.findMany({
      where: {
        restaurant: {
          owner_id: ownerId
        }
      },
      include: {
        customer: {
          select: { name: true, email: true, phone: true }
        },
        restaurant: {
          select: { name: true }
        },
        order_items: {
          include: {
            item: true
          }
        }
      },
      orderBy: { order_time: 'desc' }
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

// 📌 Create order
export const createOrder = async (req, res) => {
  try {
    const { restaurant_id, items, order_type } = req.body;
    const customerId = req.user.id;

    // Validate order type
    const validOrderTypes = ['pickup', 'delivery', 'dine_in'];
    if (!order_type || !validOrderTypes.includes(order_type)) {
      return res.status(400).json({ error: "Invalid order type. Must be 'pickup', 'delivery', or 'dine_in'" });
    }

    // Calculate total price
    let totalPrice = 0;
    const orderItems = [];

    for (const item of items) {
      const menuItem = await prisma.menuItem.findUnique({
        where: { id: item.item_id }
      });
      if (!menuItem) {
        return res.status(404).json({ error: `Menu item ${item.item_id} not found` });
      }
      totalPrice += menuItem.price * item.quantity;
      orderItems.push({
        item_id: item.item_id,
        quantity: item.quantity,
        preferences: item.preferences || ''
      });
    }

    const order = await prisma.order.create({
      data: {
        customer_id: customerId,
        restaurant_id: restaurant_id,
        total_price: totalPrice,
        order_type: order_type,
        order_items: {
          create: orderItems
        }
      },
      include: {
        order_items: {
          include: {
            item: true
          }
        },
        deliveries: {
          include: {
            delivery_person: {
              select: { user_id: true, name: true, phone: true }
            }
          }
        }
      }
    });

    res.status(201).json({ message: "Order created successfully", order });
  } catch (error) {
    res.status(500).json({ error: "Failed to create order" });
  }
};

// 📌 Get all orders (Admin only)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        customer: {
          select: { name: true, email: true, phone: true }
        },
        restaurant: {
          select: { name: true, location: true, contact_info: true },
          include: {
            owner: {
              select: { name: true, email: true, phone: true }
            }
          }
        },
        order_items: {
          include: {
            item: true
          }
        }
      },
      orderBy: { order_time: 'desc' }
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

// 📌 Get available deliveries (orders ready for delivery)
export const getAvailableDeliveries = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { status: 'ready' },
      include: {
        customer: {
          select: { name: true, email: true, phone: true }
        },
        restaurant: {
          select: { name: true, location: true, contact_info: true, owner: { select: { name: true, email: true, phone: true } } }
        },
        order_items: {
          include: {
            item: true
          }
        }
      },
      orderBy: { order_time: 'asc' }
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch available deliveries" });
  }
};

// 📌 Get delivery history (delivered orders for the delivery person)
export const getDeliveryHistory = async (req, res) => {
  try {
    const deliveryPersonId = req.user.id;
    const deliveries = await prisma.delivery.findMany({
      where: {
        delivery_person_id: deliveryPersonId,
        status: 'delivered'
      },
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
        }
      },
      orderBy: { order: { order_time: 'desc' } }
    });

    const orders = deliveries.map(d => d.order);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch delivery history" });
  }
};

// 📌 Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedOrder = await prisma.order.update({
      where: { id: Number(id) },
      data: { status },
    });

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ error: "Failed to update order" });
  }
};