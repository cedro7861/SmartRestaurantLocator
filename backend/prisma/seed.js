import { PrismaClient } from "../src/generated/prisma/index.js"; // adjust relative path
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

  console.log("✅ Users, restaurants, and menu items seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
