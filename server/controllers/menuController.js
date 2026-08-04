import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import MenuItem from '../models/MenuItem.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const seedData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data', 'seedMenu.json'), 'utf8'));

// In-memory fallback if MongoDB connection is not active
let inMemoryMenu = seedData.map((item, index) => ({
  _id: `mem-${index + 1}`,
  ...item
}));

import mongoose from 'mongoose';

export const getMenuItems = async (req, res) => {
  try {
    const { category, search } = req.query;
    let items;

    // Check if MongoDB is connected; if not, immediately use in-memory store in 0ms
    if (mongoose.connection.readyState === 1) {
      try {
        let query = { isAvailable: true };
        if (category && category !== 'All') {
          query.category = category;
        }
        if (search) {
          query.name = { $regex: search, $options: 'i' };
        }
        items = await MenuItem.find(query).sort({ isHealthFocused: -1, name: 1 });
        if (!items || items.length === 0) {
          items = inMemoryMenu;
        }
      } catch (dbErr) {
        items = inMemoryMenu;
      }
    } else {
      items = inMemoryMenu;
    }

    // Apply filters on in-memory items if used
    if (category && category !== 'All') {
      items = items.filter(i => i.category === category);
    }
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(i => i.name.toLowerCase().includes(q) || (i.description && i.description.toLowerCase().includes(q)));
    }

    res.status(200).json({ success: true, count: items.length, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCategories = async (req, res) => {
  try {
    const defaultCategories = [
      "All",
      "Gym Guyz",
      "Momos & Rolls",
      "Pizza Single Topping",
      "Pizza Veg Double Topping",
      "Kidz Pizza",
      "Pizza Veg-1",
      "Pizza Veg-2",
      "Pizza Veg-3",
      "Burgers",
      "Sandwich",
      "Pasta",
      "Fries",
      "Wraps",
      "Shakes",
      "Hot Dessert",
      "Mocktails",
      "Cold Desserts",
      "Breads",
      "Beverages"
    ];
    res.status(200).json({ success: true, data: defaultCategories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
