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

    // Check if admins already exist
    const existingAdmin = await AdminUser.findOne({
      $or: [
        { email: process.env.ADMIN_GMAIL_EMAIL },
        { email: process.env.ADMIN_EMAIL },
      ],
    });

    if (existingAdmin) {
      console.log("⚠️  Admin accounts already exist");
      console.log("Skipping seed...\n");
      await mongoose.disconnect();
      process.exit(0);
    }

    // Create two admin users with credentials from .env (all secure, not hardcoded)
    const admins = [
      {
        name: "System Administrator (Gmail)",
        email: process.env.ADMIN_GMAIL_EMAIL || "",
        password: await bcrypt.hash(process.env.ADMIN_GMAIL_PASSWORD || "", 10),
        role: "admin",
        isActive: true,
      },
      {
        name: "System Administrator (Simple Login)",
        email: process.env.ADMIN_EMAIL || "",
        password: await bcrypt.hash(process.env.ADMIN_EMAIL_PASSWORD || "", 10),
        role: "admin",
        isActive: true,
      },
    ];

    console.log("\n🌱 Seeding admin users...\n");

    for (const adminData of admins) {
      const admin = new AdminUser(adminData);
      await admin.save();
      console.log(`✅ Created ADMIN account`);
    }

    console.log("\n📊 Admin Users Created Successfully!\n");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("\n✅ Admin accounts have been seeded from .env configuration");
    console.log("📧 Check your .env file for login credentials");
    console.log("🔐 Credentials are NOT shown here for security reasons");
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
