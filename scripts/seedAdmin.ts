import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import AdminUser from "../src/models/AdminUser.js";
import { config } from "../src/config/index.js";

/**
 * Seed Admin Users
 * Creates test admin accounts in MongoDB
 */
async function seedAdmin() {
  try {
    // Connect to MongoDB
    console.log("\n📦 Connecting to MongoDB...");
    await mongoose.connect(config.DB_URI);
    console.log("✅ Connected to MongoDB");

    // Check if admin already exists
    const existingAdmin = await AdminUser.findOne({
      email: "admin@furniture-mart.com",
    });

    if (existingAdmin) {
      console.log("⚠️  Admin already exists: admin@furniture-mart.com");
      console.log("Skipping seed...\n");
      await mongoose.disconnect();
      process.exit(0);
    }

    // Create admin users
    const admins = [
      {
        name: "System Administrator",
        email: "admin@furniture-mart.com",
        password: await bcrypt.hash("Admin@123456", 10),
        role: "admin",
        isActive: true,
      },
      {
        name: "Content Editor",
        email: "editor@furniture-mart.com",
        password: await bcrypt.hash("Editor@123456", 10),
        role: "editor",
        isActive: true,
      },
      {
        name: "Content Viewer",
        email: "viewer@furniture-mart.com",
        password: await bcrypt.hash("Viewer@123456", 10),
        role: "viewer",
        isActive: true,
      },
    ];

    console.log("\n🌱 Seeding admin users...\n");

    for (const adminData of admins) {
      const admin = new AdminUser(adminData);
      await admin.save();
      console.log(`✅ Created ${adminData.role.toUpperCase()}: ${adminData.email}`);
    }

    console.log("\n📊 Admin Users Created Successfully!\n");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Admin Credentials:\n");
    console.log("1️⃣  ADMIN (Full Access)");
    console.log("   Email: admin@furniture-mart.com");
    console.log("   Password: Admin@123456\n");
    console.log("2️⃣  EDITOR (Content Manager)");
    console.log("   Email: editor@furniture-mart.com");
    console.log("   Password: Editor@123456\n");
    console.log("3️⃣  VIEWER (Read-Only)");
    console.log("   Email: viewer@furniture-mart.com");
    console.log("   Password: Viewer@123456\n");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    // Disconnect
    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB\n");
  } catch (error) {
    console.error("❌ Error seeding admin:", error);
    process.exit(1);
  }
}

// Run seed
seedAdmin();
