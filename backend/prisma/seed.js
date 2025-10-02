import { PrismaClient } from "../src/generated/prisma/index.js"; // adjust relative path
const prisma = new PrismaClient();
async function main() {
  // Create multiple users
  await prisma.user.createMany({
    data: [
      {
        name: "Admin User",
        email: "admin@seedsafe.com",
        password: "admin123", // in production, hash passwords!
        phone: "0783000000",
        role: "admin",
        status: "active",
      },
      {
        name: "Manager User",
        email: "manager@seedsafe.com",
        password: "manager123",
        phone: "0783111111",
        role: "owner",
        status: "active",
      },
      {
        name: "Delivery User",
        email: "delivery@seedsafe.com",
        password: "delivery123",
        phone: "0783222222",
        role: "delivery",
        status: "active",
      },
      {
        name: "Customer User",
        email: "customer@seedsafe.com",
        password: "customer123",
        phone: "0783333333",
        role: "customer",
        status: "not_verified",
      },
    ],
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
