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
          select: { name: true, location: true }
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
    const { restaurant_id, items } = req.body;
    const customerId = req.user.id;

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
        order_items: {
          create: orderItems
        }
      },
      include: {
        order_items: {
          include: {
            item: true
          }
        }
      }
    });

    res.status(201).json({ message: "Order created successfully", order });
  } catch (error) {
    res.status(500).json({ error: "Failed to create order" });
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