import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import userRoutes from "./src/routes/userRoutes.js";

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());
app.use("/api/users", userRoutes);
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

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
