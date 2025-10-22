import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 📌 Get orders for a customer
export const getCustomerOrders = async (req, res) => {
  try {
    const customerId = req.user?.id;

    if (!customerId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const orders = await prisma.order.findMany({
      where: { customer_id: customerId },
      select: {
        id: true,
        customer_id: true,
        restaurant_id: true,
        total_price: true,
        status: true,
        order_type: true,
        order_time: true,
        restaurant: {
          select: {
            name: true,
            location: true,
            contact_info: true,
            latitude: true,
            longitude: true,
            status: true,
            owner: { select: { name: true, phone: true } },
          },
        },
        order_items: {
          select: {
            id: true,
            item_id: true,
            quantity: true,
            preferences: true,
            item: {
              select: {
                id: true,
                name: true,
                price: true,
                description: true,
              },
            },
          },
        },
        deliveries: {
          where: {
            status: {
              in: ['pending', 'on_route', 'delivered']
            }
          },
          select: {
            delivery_id: true,
            status: true,
            latitude: true,
            longitude: true,
            delivery_person: {
              select: { user_id: true, name: true, phone: true },
            },
          },
        },
      },
      orderBy: { order_time: "desc" },
    });

    return res.json(orders ?? []);
  } catch (error) {
    console.error("Error fetching customer orders:", error);
    return res.status(500).json({
      error: "Failed to fetch orders",
      message: "Unable to load your order history. Please try again later.",
    });
  }
};

// 📌 Get orders for owner's restaurants
export const getOwnerOrders = async (req, res) => {
  try {
    const ownerId = req.user?.id;

    if (!ownerId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    console.log('Fetching orders for owner ID:', ownerId);

    // First, check if the owner has any restaurants
    const restaurants = await prisma.restaurant.findMany({
      where: { owner_id: ownerId },
      select: { id: true, name: true }
    });
    console.log('Owner restaurants:', restaurants);

    if (restaurants.length === 0) {
      console.log('Owner has no restaurants, returning empty array');
      return res.json([]);
    }

    const orders = await prisma.order.findMany({
      where: {
        restaurant: {
          owner_id: ownerId
        }
      },
      select: {
        id: true,
        customer_id: true,
        restaurant_id: true,
        total_price: true,
        status: true,
        order_type: true,
        order_time: true,
        customer: {
          select: { name: true, email: true, phone: true },
        },
        restaurant: {
          select: { name: true, location: true, contact_info: true, status: true },
        },
        order_items: {
          select: {
            id: true,
            item_id: true,
            quantity: true,
            preferences: true,
            item: {
              select: {
                id: true,
                name: true,
                price: true,
                description: true,
              },
            },
          },
        },
        deliveries: {
          select: {
            delivery_id: true,
            status: true,
            latitude: true,
            longitude: true,
            delivery_person: {
              select: { user_id: true, name: true, phone: true },
            },
          },
        },
      },
      orderBy: { order_time: "desc" },
    });

    console.log('Found orders:', orders.length);
    console.log('Orders data:', orders);

    // Ensure we return an array even if no orders found
    return res.json(orders || []);
  } catch (error) {
    console.error("Error fetching owner orders:", error);
    return res.status(500).json({
      error: "Failed to fetch orders",
      message: "Unable to load restaurant orders. Please try again later.",
    });
  }
};

// 📌 Create order
export const createOrder = async (req, res) => {
  try {
    const { restaurant_id, items, order_type } = req.body;
    const customerId = req.user?.id;

    if (!customerId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const validOrderTypes = ["pickup", "delivery", "dine_in"];
    if (!validOrderTypes.includes(order_type)) {
      return res.status(400).json({
        error: "Invalid order type. Must be 'pickup', 'delivery', or 'dine_in'",
      });
    }

    let totalPrice = 0;
    const orderItems = [];

    for (const item of items) {
      const menuItem = await prisma.menuItem.findUnique({
        where: { id: item.item_id },
      });

      if (!menuItem) {
        return res.status(404).json({ error: `Menu item ${item.item_id} not found` });
      }

      totalPrice += menuItem.price * item.quantity;
      orderItems.push({
        item_id: item.item_id,
        quantity: item.quantity,
        preferences: item.preferences || "",
      });
    }

    const order = await prisma.order.create({
      data: {
        customer_id: customerId,
        restaurant_id,
        total_price: totalPrice,
        order_type,
        order_items: { create: orderItems },
      },
      select: {
        id: true,
        customer_id: true,
        restaurant_id: true,
        total_price: true,
        status: true,
        order_type: true,
        order_time: true,
        order_items: {
          select: {
            id: true,
            item_id: true,
            quantity: true,
            preferences: true,
            item: {
              select: {
                id: true,
                name: true,
                price: true,
              },
            },
          },
        },
        deliveries: {
          select: {
            delivery_id: true,
            status: true,
            latitude: true,
            longitude: true,
            delivery_person: {
              select: {
                user_id: true,
                name: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    return res.status(201).json({ message: "Order created successfully", order });
  } catch (error) {
    console.error("Error creating order:", error);
    return res.status(500).json({ error: "Failed to create order" });
  }
};

// 📌 Admin — Get all orders
export const getAllOrders = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    const orders = await prisma.order.findMany({
      select: {
        id: true,
        customer_id: true,
        restaurant_id: true,
        total_price: true,
        status: true,
        order_type: true,
        order_time: true,
        customer: { select: { name: true, email: true, phone: true } },
        restaurant: {
          select: {
            name: true,
            location: true,
            contact_info: true,
            latitude: true,
            longitude: true,
            status: true,
            owner: {
              select: { name: true, email: true, phone: true }
            },
          },
        },
        order_items: {
          select: {
            id: true,
            item_id: true,
            quantity: true,
            preferences: true,
            item: {
              select: {
                id: true,
                name: true,
                price: true,
                description: true
              }
            },
          },
        },
        deliveries: {
          where: {
            status: {
              in: ['pending', 'on_route', 'delivered']
            }
          },
          select: {
            delivery_id: true,
            status: true,
            latitude: true,
            longitude: true,
            delivery_person: {
              select: { user_id: true, name: true, phone: true },
            },
          },
        },
      },
      orderBy: { order_time: "desc" },
    });

    return res.json(orders ?? []);
  } catch (error) {
    console.error("Error fetching all orders:", error);
    return res.status(500).json({
      error: "Failed to fetch orders",
      message: "Unable to load system orders. Please try again later.",
    });
  }
};

// 📌 Get orders ready for delivery (for owners)
export const getOwnerReadyOrders = async (req, res) => {
  try {
    const ownerId = req.user?.id;

    if (!ownerId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const orders = await prisma.order.findMany({
      where: {
        status: 'ready',
        order_type: 'delivery',
        restaurant: {
          owner_id: ownerId
        }
      },
      select: {
        id: true,
        customer_id: true,
        restaurant_id: true,
        total_price: true,
        status: true,
        order_type: true,
        order_time: true,
        customer: {
          select: { name: true, email: true, phone: true }
        },
        restaurant: {
          select: {
            name: true,
            location: true,
            contact_info: true,
            latitude: true,
            longitude: true,
            status: true,
          },
        },
        order_items: {
          select: {
            id: true,
            item_id: true,
            quantity: true,
            preferences: true,
            item: {
              select: { id: true, name: true, price: true, description: true }
            },
          },
        },
      },
      orderBy: { order_time: 'asc' }
    });

    return res.json(orders ?? []);
  } catch (error) {
    console.error("Error fetching owner ready orders:", error);
    return res.status(500).json({
      error: "Failed to fetch ready orders",
      message: "Unable to load orders ready for delivery. Please try again later.",
    });
  }
};

// 📌 Get delivery history
export const getDeliveryHistory = async (req, res) => {
  try {
    const deliveryPersonId = req.user?.id;

    if (!deliveryPersonId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const deliveries = await prisma.delivery.findMany({
      where: { delivery_person_id: deliveryPersonId, status: "delivered" },
      select: {
        order: {
          select: {
            id: true,
            customer_id: true,
            restaurant_id: true,
            total_price: true,
            status: true,
            order_type: true,
            order_time: true,
            customer: {
              select: { name: true, email: true, phone: true }
            },
            restaurant: {
              select: {
                name: true,
                location: true,
                contact_info: true,
                latitude: true,
                longitude: true,
                status: true,
              },
            },
            order_items: {
              select: {
                id: true,
                item_id: true,
                quantity: true,
                preferences: true,
                item: {
                  select: { id: true, name: true, price: true, description: true }
                },
              },
            },
          },
        },
      },
      orderBy: { order: { order_time: "desc" } },
    });

    const orders = deliveries.map((d) => d.order);
    return res.json(orders ?? []);
  } catch (error) {
    console.error("Error fetching delivery history:", error);
    return res.status(500).json({
      error: "Failed to fetch delivery history",
      message: error.message,
    });
  }
};

// 📌 Get available deliveries (orders ready for delivery)
export const getAvailableDeliveries = async (req, res) => {
  try {
    // Check if user exists and is authenticated
    if (!req.user || req.user.role !== 'delivery') {
      return res.status(403).json({ error: "Delivery person access required" });
    }

    const orders = await prisma.order.findMany({
      where: { status: 'ready' },
      select: {
        id: true,
        customer_id: true,
        restaurant_id: true,
        total_price: true,
        status: true,
        order_type: true,
        order_time: true,
        customer: {
          select: { name: true, email: true, phone: true }
        },
        restaurant: {
          select: {
            name: true,
            location: true,
            contact_info: true,
            latitude: true,
            longitude: true,
            status: true,
            owner: {
              select: { name: true, email: true, phone: true }
            }
          }
        },
        order_items: {
          select: {
            id: true,
            item_id: true,
            quantity: true,
            preferences: true,
            item: {
              select: {
                id: true,
                name: true,
                price: true,
                description: true
              }
            }
          }
        }
      },
      orderBy: { order_time: 'asc' }
    });

    // Return empty array if no deliveries available (not an error)
    return res.json(orders ?? []);
  } catch (error) {
    console.error('Error fetching available deliveries:', error);
    return res.status(500).json({
      error: "Failed to fetch available deliveries",
      message: "Unable to load available deliveries. Please try again later."
    });
  }
};

// 📌 Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = [
      "pending",
      "confirmed",
      "preparing",
      "ready",
      "delivering",
      "delivered",
      "cancelled",
      "rejected",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid order status" });
    }

    const existingOrder = await prisma.order.findUnique({
      where: { id: Number(id) },
    });

    if (!existingOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: Number(id) },
      data: { status },
    });

    return res.json(updatedOrder);
  } catch (error) {
    console.error("Error updating order status:", error);
    return res.status(500).json({
      error: "Failed to update order",
      message: error.message,
    });
  }
};