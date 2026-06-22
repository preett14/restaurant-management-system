const Menu = require("../models/Menu");
const Order = require("../models/Order");

exports.placeOrder = async (req, res) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Order items are required" });
    }

    const normalizedItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const { menuItemId, quantity } = item;

      if (!menuItemId || !quantity || quantity < 1) {
        return res.status(400).json({ message: "Each item must include valid menuItemId and quantity" });
      }

      const menuItem = await Menu.findById(menuItemId);
      if (!menuItem) {
        return res.status(404).json({ message: `Menu item not found: ${menuItemId}` });
      }

      if (!menuItem.isAvailable) {
        return res.status(400).json({ message: `${menuItem.name} is currently unavailable` });
      }

      const linePrice = menuItem.price * quantity;
      totalAmount += linePrice;

      normalizedItems.push({
        menuItem: menuItem._id,
        quantity,
        price: menuItem.price,
      });
    }

    const order = await Order.create({
      user: req.user._id,
      items: normalizedItems,
      totalAmount,
    });

    return res.status(201).json({
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("items.menuItem", "name description price")
      .sort({ createdAt: -1 });

    return res.status(200).json(orders);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
