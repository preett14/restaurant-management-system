const Menu = require("../models/Menu");

exports.getMenu = async (req, res) => {
  try {
    const menu = await Menu.find().sort({ createdAt: -1 });
    return res.status(200).json(menu);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.createMenuItem = async (req, res) => {
  try {
    const { name, description, price, category, isAvailable } = req.body;

    if (!name || !description || price === undefined) {
      return res.status(400).json({ message: "Name, description, and price are required" });
    }

    const menuItem = await Menu.create({ name, description, price, category, isAvailable });
    return res.status(201).json({ message: "Menu item created", menuItem });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedItem = await Menu.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    return res.status(200).json({ message: "Menu item updated", menuItem: updatedItem });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedItem = await Menu.findByIdAndDelete(id);
    if (!deletedItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    return res.status(200).json({ message: "Menu item deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
