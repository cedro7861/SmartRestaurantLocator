import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import userRoutes from "./src/routes/userRoutes.js";
import restaurantRoutes from "./src/routes/restaurantRoutes.js";
import menuRoutes from "./src/routes/menuRoutes.js";
import orderRoutes from "./src/routes/orderRoutes.js";
import notificationRoutes from "./src/routes/notificationRoutes.js";
import deliveryRoutes from "./src/routes/deliveryRoutes.js";

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3003;

// app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increase limit for larger payloads
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(
  cors({
    origin: "*",
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use("/api/users", userRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/deliveries", deliveryRoutes);
app.use("/api/notifications", notificationRoutes);
// Root test route
app.get("/", (req, res) => {
  res.send("🚀 Server is running successfully!");
});

// Example Prisma route (list all users)
app.get("/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});
