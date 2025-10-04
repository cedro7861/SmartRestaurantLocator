import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 📌 Get menu items for a restaurant
export const getMenuItems = async (req, res) => {
  try {
    const { restaurant_id } = req.params;

    const menuItems = await prisma.menuItem.findMany({
      where: { restaurant_id: Number(restaurant_id) },
      orderBy: { created_at: 'desc' }
    });

    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch menu items" });
  }
};

// 📌 Get single menu item by ID
export const getMenuItemById = async (req, res) => {
  try {
    const { id } = req.params;

    const menuItem = await prisma.menuItem.findUnique({
      where: { id: Number(id) }
    });

    if (!menuItem) return res.status(404).json({ error: "Menu item not found" });
    res.json(menuItem);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch menu item" });
  }
};

// 📌 Create menu item
export const createMenuItem = async (req, res) => {
  try {
    const { restaurant_id, name, description, price, category, image } = req.body;

    // Verify restaurant ownership
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: Number(restaurant_id) }
    });

    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found" });
    }

    // For now, allow any owner to add items (in production, check ownership)
    const newMenuItem = await prisma.menuItem.create({
      data: {
        restaurant_id: Number(restaurant_id),
        name,
        description: description || null,
        price: parseFloat(price),
        category: category || null,
        image: image || null,
      },
    });

    res.status(201).json({ message: "Menu item created successfully", menuItem: newMenuItem });
  } catch (error) {
    console.error('Create menu item error:', error);
    res.status(500).json({ error: "Failed to create menu item" });
  }
};

// 📌 Update menu item
export const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, image, status } = req.body;

    const updatedMenuItem = await prisma.menuItem.update({
      where: { id: Number(id) },
      data: {
        name,
        description,
        price: price ? parseFloat(price) : undefined,
        category,
        image,
        status: status !== undefined ? Boolean(status) : undefined,
      },
    });

    res.json({ message: "Menu item updated successfully", menuItem: updatedMenuItem });
  } catch (error) {
    res.status(500).json({ error: "Failed to update menu item" });
  }
};

// 📌 Delete menu item
export const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.menuItem.delete({
      where: { id: Number(id) },
    });

    res.json({ message: "Menu item deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete menu item" });
  }
};

// 📌 Get menu items by owner (all restaurants)
export const getOwnerMenuItems = async (req, res) => {
  try {
    const owner_id = req.params.owner_id || req.user?.id;

    if (!owner_id) {
      return res.status(401).json({ error: "Owner ID required" });
    }

    const menuItems = await prisma.menuItem.findMany({
      where: {
        restaurant: {
          owner_id: Number(owner_id)
        }
      },
      include: {
        restaurant: {
          select: { name: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch owner menu items" });
  }
};