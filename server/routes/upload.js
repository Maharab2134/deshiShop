const express = require("express");
const router = express.Router();
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
const { auth, adminAuth } = require("../middleware/auth");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure product image storage
const productStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "deshishop/products",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
    transformation: [{ width: 1000, height: 1000, crop: "limit" }],
  },
});

// Configure avatar image storage
const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "deshishop/avatars",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [
      { width: 500, height: 500, crop: "fill", gravity: "face" },
    ],
  },
});

// Configure category image storage
const categoryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "deshishop/categories",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
    transformation: [{ width: 800, height: 800, crop: "limit" }],
  },
});

// Create multer instances
const uploadProduct = multer({
  storage: productStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 2 * 1024 * 1024 },
});

const uploadCategory = multer({
  storage: categoryStorage,
  limits: { fileSize: 3 * 1024 * 1024 },
});

// Upload single product image (Admin only)
router.post(
  "/product",
  auth,
  adminAuth,
  uploadProduct.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      res.json({
        success: true,
        imageUrl: req.file.path,
        publicId: req.file.filename,
      });
    } catch (error) {
      console.error("Error uploading product image:", error);
      res
        .status(500)
        .json({ message: "Error uploading image", error: error.message });
    }
  }
);

// Upload multiple product images (Admin only)
router.post(
  "/products",
  auth,
  adminAuth,
  uploadProduct.array("images", 5),
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      const imageData = req.files.map((file) => ({
        imageUrl: file.path,
        publicId: file.filename,
      }));

      res.json({
        success: true,
        images: imageData,
      });
    } catch (error) {
      console.error("Error uploading product images:", error);
      res
        .status(500)
        .json({ message: "Error uploading images", error: error.message });
    }
  }
);

// Upload user avatar (Authenticated users)
router.post(
  "/avatar",
  auth,
  uploadAvatar.single("avatar"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      res.json({
        success: true,
        imageUrl: req.file.path,
        publicId: req.file.filename,
      });
    } catch (error) {
      console.error("Error uploading avatar:", error);
      res
        .status(500)
        .json({ message: "Error uploading avatar", error: error.message });
    }
  }
);

// Upload category image (Admin only)
router.post(
  "/category",
  auth,
  adminAuth,
  uploadCategory.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      res.json({
        success: true,
        imageUrl: req.file.path,
        publicId: req.file.filename,
      });
    } catch (error) {
      console.error("Error uploading category image:", error);
      res
        .status(500)
        .json({ message: "Error uploading image", error: error.message });
    }
  }
);

// Delete image from Cloudinary (Admin only)
router.delete("/delete/:publicId", auth, adminAuth, async (req, res) => {
  try {
    const publicId = req.params.publicId.replace(/--/g, "/");

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === "ok" || result.result === "not found") {
      res.json({
        success: true,
        message: "Image deleted successfully",
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Failed to delete image",
      });
    }
  } catch (error) {
    console.error("Error deleting image:", error);
    res
      .status(500)
      .json({ message: "Error deleting image", error: error.message });
  }
});

module.exports = router;
