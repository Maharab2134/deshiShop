const express = require("express");
const Order = require("../models/Order");
const Product = require("../models/Product");
const { auth, adminAuth } = require("../middleware/auth");

const router = express.Router();

// Get all orders (admin only)
router.get("/", adminAuth, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("items.product", "name images");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get user's orders
router.get("/my-orders", auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.userId }).populate(
      "items.product",
      "name images"
    );
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get single order
router.get("/:id", auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate("items.product", "name images price");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Users can only access their own orders unless they're admin
    if (
      req.user.role !== "admin" &&
      order.user._id.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Create order
router.post("/", auth, async (req, res) => {
  try {
    console.log("Order POST payload:", req.body);

    // For bKash, check required fields
    if (req.body.paymentMethod === "bkash") {
      const missing = [];
      if (!req.body.bkashAccountNumber) missing.push("bkashAccountNumber");
      if (!req.body.bkashTransactionId) missing.push("bkashTransactionId");
      if (!req.body.bkashReferenceId) missing.push("bkashReferenceId");
      if (missing.length) {
        console.log("Missing bKash fields:", missing);
        return res.status(400).json({
          message: `Missing required bKash fields: ${missing.join(", ")}`,
        });
      }
    }

    const order = new Order({
      ...req.body,
      user: req.userId,
    });
    await order.save();
    res.status(201).json(order);
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Update only order status (admin only)
router.put("/:id/status", adminAuth, async (req, res) => {
  try {
    // Accepts { status: "Delivered" } or similar
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const order = await Order.findById(req.params.id).populate("items.product");
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const previousStatus = order.orderStatus;

    // If order is being marked as delivered for the first time, reduce stock
    if (
      status.toLowerCase() === "delivered" &&
      previousStatus.toLowerCase() !== "delivered" &&
      order.items
    ) {
      try {
        for (const item of order.items) {
          if (item.product && item.quantity) {
            const updatedProduct = await Product.findByIdAndUpdate(
              item.product._id,
              { $inc: { stock: -item.quantity } },
              { new: true }
            );
            console.log(
              `Stock updated for product ${item.product._id}: ${updatedProduct.stock}`
            );
          }
        }
      } catch (stockError) {
        console.error("Error updating product stock:", stockError);
        return res.status(500).json({
          message: "Error updating stock",
          error: stockError.message,
        });
      }
    }

    order.orderStatus = status;
    await order.save();

    const updatedOrder = await order.populate(
      "items.product",
      "name images stock"
    );
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// PUT /api/orders/:id/payment-status
router.put("/:id/payment-status", adminAuth, async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    if (!paymentStatus) {
      return res.status(400).json({ message: "Payment status is required" });
    }
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    order.paymentStatus = paymentStatus.toLowerCase(); // store as lowercase
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Delete order (admin only)
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
