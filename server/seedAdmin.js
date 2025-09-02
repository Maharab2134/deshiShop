const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
require("dotenv").config();

const createNewAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Delete existing admin if exists
    await User.deleteOne({ email: "admin@gmail.com" });

    // Create new admin user with proper password hashing
    const adminUser = new User({
      name: "Admin User",
      email: "admin@gmail.com",
      password: "admin123", // This will be hashed by the pre-save hook
      role: "admin",
      phone: "+1234567890",
      address: "Admin Address",
    });

    await adminUser.save();

    console.log("✅ New admin user created successfully");
    console.log("Email: admin@gmail.com");
    console.log("Password: admin123");

    // Verify the password works
    const verifiedUser = await User.findOne({ email: "admin@gmail.com" });
    const isMatch = await verifiedUser.comparePassword("admin123");
    console.log("✅ Password verification:", isMatch);
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

createNewAdmin();
