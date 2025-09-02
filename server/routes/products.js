const express = require("express");
const Product = require("../models/Product");
const Category = require("../models/Category");
const { auth, adminAuth } = require("../middleware/auth");

const router = express.Router();

// Get all products (with filters, search, pagination)
router.get("/", async (req, res) => {
  try {
    const { category, featured, search, page = 1, limit = 12 } = req.query;
    let query = {};

    if (category) {
      query.category = category;
    }

    if (featured) {
      query.featured = featured === "true";
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    const products = await Product.find(query)
      .populate("category")
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(query);

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get single product
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category");
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Create product (admin only) - Accepts category name or ObjectId
router.post("/", adminAuth, async (req, res) => {
  try {
    let categoryValue = req.body.category;

    // If category is a string and not a valid ObjectId, treat as name
    if (
      categoryValue &&
      typeof categoryValue === "string" &&
      !/^[0-9a-fA-F]{24}$/.test(categoryValue)
    ) {
      const foundCategory = await Category.findOne({ name: categoryValue });
      if (!foundCategory) {
        return res.status(400).json({ message: "Category not found" });
      }
      categoryValue = foundCategory._id;
    }

    // Create product with the correct category value
    const product = new Product({
      ...req.body,
      category: categoryValue,
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error("Product creation error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Update product (admin only) - Accepts category name or ObjectId
router.put("/:id", adminAuth, async (req, res) => {
  try {
    let categoryValue = req.body.category;

    // If category is a string and not a valid ObjectId, treat as name
    if (
      categoryValue &&
      typeof categoryValue === "string" &&
      !/^[0-9a-fA-F]{24}$/.test(categoryValue)
    ) {
      const foundCategory = await Category.findOne({ name: categoryValue });
      if (!foundCategory) {
        return res.status(400).json({ message: "Category not found" });
      }
      categoryValue = foundCategory._id;
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { ...req.body, category: categoryValue },
      { new: true, runValidators: true }
    );
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    console.error("Product update error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Delete product (admin only)
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Product deletion error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
