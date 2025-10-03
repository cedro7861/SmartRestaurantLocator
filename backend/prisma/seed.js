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

  console.log("✅ Users seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
