import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 📌 Get all restaurants (for customers - only approved and open)
export const getRestaurants = async (req, res) => {
  try {
    const restaurants = await prisma.restaurant.findMany({
      where: { approved: true, status: 'open' },
      include: {
        owner: {
          select: { name: true, email: true }
        }
      }
    });
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch restaurants" });
  }
};

// 📌 Get all restaurants for admin (including pending approval)
export const getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await prisma.restaurant.findMany({
      include: {
        owner: {
          select: { name: true, email: true, phone: true }
        },
        _count: {
          select: { orders: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch restaurants" });
  }
};

// 📌 Get restaurants by owner
export const getOwnerRestaurants = async (req, res) => {
  try {
    const owner_id = req.params.owner_id || req.user?.id;

    if (!owner_id) {
      return res.status(401).json({ error: "Owner ID required" });
    }

    const restaurants = await prisma.restaurant.findMany({
      where: { owner_id: Number(owner_id) },
      include: {
        _count: {
          select: { orders: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch owner restaurants" });
  }
};

// 📌 Get single restaurant by ID
export const getRestaurantById = async (req, res) => {
  try {
    const { id } = req.params;
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: Number(id) },
      include: {
        owner: {
          select: { name: true, email: true, phone: true }
        },
        menu_items: true
      }
    });

    if (!restaurant) return res.status(404).json({ error: "Restaurant not found" });
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch restaurant" });
  }
};

// 📌 Create restaurant (for owners)
export const createRestaurant = async (req, res) => {
  try {
    const { name, location, contact_info, latitude, longitude, image, owner_id } = req.body;

    // For now, use provided owner_id or default to 2 (manager from seed)
    const final_owner_id = owner_id || 2;

    const newRestaurant = await prisma.restaurant.create({
      data: {
        owner_id: final_owner_id,
        name,
        location,
        contact_info,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        image: image || null,
      },
    });

    res.status(201).json({ message: "Restaurant created successfully", restaurant: newRestaurant });
  } catch (error) {
    console.error('Create restaurant error:', error);
    res.status(500).json({ error: "Failed to create restaurant" });
  }
};

// 📌 Update restaurant
export const updateRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, location, contact_info, latitude, longitude, image, status, approved } = req.body;

    const updatedRestaurant = await prisma.restaurant.update({
      where: { id: Number(id) },
      data: {
        name,
        location,
        contact_info,
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined,
        image,
        status,
        approved
      },
    });

    res.json(updatedRestaurant);
  } catch (error) {
    res.status(500).json({ error: "Failed to update restaurant" });
  }
};

// 📌 Approve restaurant
export const approveRestaurant = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedRestaurant = await prisma.restaurant.update({
      where: { id: Number(id) },
      data: { approved: true },
    });

    res.json({ message: "Restaurant approved successfully", restaurant: updatedRestaurant });
  } catch (error) {
    res.status(500).json({ error: "Failed to approve restaurant" });
  }
};

// 📌 Reject restaurant
export const rejectRestaurant = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedRestaurant = await prisma.restaurant.update({
      where: { id: Number(id) },
      data: { approved: false },
    });

    res.json({ message: "Restaurant rejected", restaurant: updatedRestaurant });
  } catch (error) {
    res.status(500).json({ error: "Failed to reject restaurant" });
  }
};

// 📌 Delete restaurant
export const deleteRestaurant = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.restaurant.delete({
      where: { id: Number(id) },
    });

    res.json({ message: "Restaurant deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete restaurant" });
  }
};