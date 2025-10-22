import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // Hash passwords before inserting
  const users = [
    {
      name: "Admin User",
      email: "admin@srl.com",
      password: await bcrypt.hash("admin123", 10), // ✅ hashed
      phone: "0783000000",
      role: "admin",
      status: "active",
    },
    {
      name: "Manager User",
      email: "manager@srl.com",
      password: await bcrypt.hash("manager123", 10),
      phone: "0783111111",
      role: "owner",
      status: "active",
    },
    {
      name: "Delivery User",
      email: "delivery@srl.com",
      password: await bcrypt.hash("delivery123", 10),
      phone: "0783222222",
      role: "delivery",
      status: "active",
    },
    {
      name: "Customer User",
      email: "customer@srl.com",
      password: await bcrypt.hash("customer123", 10),
      phone: "0783333333",
      role: "customer",
      status: "not_verified",
    },
  ];

  await prisma.user.createMany({
    data: users,
  });

  // Seed restaurants
  const restaurants = [
    {
      owner_id: 2, // manager user
      name: "Pizza Palace",
      location: "Kigali, Rwanda",
      contact_info: "+250 788 123 456",
      latitude: -1.9441,
      longitude: 30.0619,
      status: "open",
      approved: true,
    },
    {
      owner_id: 2,
      name: "Burger Joint",
      location: "Kigali, Rwanda",
      contact_info: "+250 788 654 321",
      latitude: -1.9500,
      longitude: 30.0580,
      status: "open",
      approved: true,
    },
  ];

  await prisma.restaurant.createMany({
    data: restaurants,
  });

  // Seed menu items
  const menuItems = [
    {
      restaurant_id: 1,
      name: "Margherita Pizza",
      description: "Classic pizza with tomato sauce, mozzarella, and basil",
      price: 15.99,
      category: "Pizza",
      status: true,
    },
    {
      restaurant_id: 1,
      name: "Pepperoni Pizza",
      description: "Pizza with pepperoni, tomato sauce, and cheese",
      price: 18.99,
      category: "Pizza",
      status: true,
    },
    {
      restaurant_id: 2,
      name: "Classic Burger",
      description: "Beef patty with lettuce, tomato, and cheese",
      price: 12.99,
      category: "Burgers",
      status: true,
    },
    {
      restaurant_id: 2,
      name: "Chicken Burger",
      description: "Grilled chicken patty with mayo and veggies",
      price: 14.99,
      category: "Burgers",
      status: true,
    },
  ];

  await prisma.menuItem.createMany({
    data: menuItems,
  });

  // Seed sample orders for the customer
  const orders = [
    {
      customer_id: 4, // customer user
      restaurant_id: 1, // Pizza Palace
      total_price: 34.98,
      status: "delivered",
      order_type: "delivery",
      order_time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
    {
      customer_id: 4,
      restaurant_id: 2, // Burger Joint
      total_price: 27.98,
      status: "delivered",
      order_type: "pickup",
      order_time: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    },
    {
      customer_id: 4,
      restaurant_id: 1,
      total_price: 18.99,
      status: "preparing",
      order_type: "delivery",
      order_time: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    },
  ];

  const createdOrders = await prisma.order.createMany({
    data: orders,
  });

  // Seed order items
  const orderItems = [
    {
      order_id: 1,
      item_id: 1, // Margherita Pizza
      quantity: 1,
      preferences: "Extra cheese please",
    },
    {
      order_id: 1,
      item_id: 2, // Pepperoni Pizza
      quantity: 1,
    },
    {
      order_id: 2,
      item_id: 3, // Classic Burger
      quantity: 1,
    },
    {
      order_id: 2,
      item_id: 4, // Chicken Burger
      quantity: 1,
    },
    {
      order_id: 3,
      item_id: 2, // Pepperoni Pizza
      quantity: 1,
      preferences: "No onions",
    },
  ];

  await prisma.orderItem.createMany({
    data: orderItems,
  });

  // Seed delivery for active order
  const deliveries = [
    {
      order_id: 3,
      delivery_person_id: 3, // delivery user
      status: "on_route",
      latitude: -1.9441,
      longitude: 30.0619,
    },
  ];

  await prisma.delivery.createMany({
    data: deliveries,
  });

  // Seed notifications
  const notifications = [
    // Admin notifications
    {
      user_id: 1, // admin user
      title: "Welcome to Smart Restaurant Locator",
      content: "Your admin account has been successfully created. You can now manage users, restaurants, and system settings.",
      target_role: "admin",
      is_read: false,
    },
    {
      user_id: 1,
      title: "New Restaurant Approval Required",
      content: "Pizza Palace restaurant is pending approval. Please review and approve the restaurant registration.",
      target_role: "admin",
      is_read: false,
    },

    // Owner notifications
    {
      user_id: 2, // manager/owner user
      title: "Restaurant Setup Complete",
      content: "Your restaurants 'Pizza Palace' and 'Burger Joint' have been successfully registered and approved.",
      target_role: "owner",
      is_read: false,
    },
    {
      user_id: 2,
      title: "New Order Received",
      content: "You have received a new order for Pepperoni Pizza from customer. Please confirm the order.",
      target_role: "owner",
      is_read: false,
    },
    {
      user_id: 2,
      title: "Delivery Person Assigned",
      content: "Delivery person has been assigned to Order #3. Track the delivery progress in real-time.",
      target_role: "owner",
      is_read: false,
    },

    // Delivery notifications
    {
      user_id: 3, // delivery user
      title: "New Delivery Assignment",
      content: "You have been assigned a new delivery for Order #3. Customer: Customer User, Restaurant: Pizza Palace.",
      target_role: "delivery",
      is_read: false,
    },
    {
      user_id: 3,
      title: "Delivery Started",
      content: "Your delivery for Order #3 is now on route. Please update your location for live tracking.",
      target_role: "delivery",
      is_read: false,
    },

    // Customer notifications
    {
      user_id: 4, // customer user
      title: "Welcome to Smart Restaurant Locator",
      content: "Thank you for joining! Your account is pending verification. Please check your email for verification instructions.",
      target_role: "customer",
      is_read: false,
    },
    {
      user_id: 4,
      title: "Order Confirmed",
      content: "Your order for Pepperoni Pizza from Pizza Palace has been confirmed and is being prepared.",
      target_role: "customer",
      is_read: false,
    },
    {
      user_id: 4,
      title: "Order Out for Delivery",
      content: "Your order from Pizza Palace is now out for delivery. Track your delivery in real-time.",
      target_role: "customer",
      is_read: false,
    },

    // General notifications (no specific user)
    {
      title: "System Maintenance Notice",
      content: "Scheduled maintenance will occur tonight from 2:00 AM to 4:00 AM EAT. Service may be temporarily unavailable.",
      target_role: "all",
      is_read: false,
    },
    {
      title: "New Feature: Live Tracking",
      content: "We now offer real-time delivery tracking! Monitor your orders and deliveries with live location updates.",
      target_role: "all",
      is_read: false,
    },
  ];

  await prisma.notification.createMany({
    data: notifications,
  });

  console.log("✅ Users, restaurants, menu items, orders, deliveries, and notifications seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
