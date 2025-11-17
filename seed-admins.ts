import mongoose from "mongoose";
import AdminUser from "./src/models/AdminUser.js";

const MONGODB_URI = "mongodb://localhost:27017/furniture-mart";

const seedAdminUsers = async () => {
  try {
    // Connect to MongoDB
    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Check if admin users already exist
    const existingCount = await AdminUser.countDocuments();
    if (existingCount > 0) {
      console.log(
        `ℹ️  Found ${existingCount} existing admin users. Skipping seed.`
      );
      console.log("💡 To reseed, delete existing admin users first:");
      console.log("   db.adminusers.deleteMany({})");
      await mongoose.disconnect();
      process.exit(0);
    }

    // Admin users to seed
    const adminUsers = [
      {
        name: "Admin User",
        email: "admin@furniture-mart.com",
        password: "Admin@123456",
        role: "admin",
        isActive: true,
      },
      {
        name: "Editor User",
        email: "editor@furniture-mart.com",
        password: "Editor@123456",
        role: "editor",
        isActive: true,
      },
      {
        name: "Viewer User",
        email: "viewer@furniture-mart.com",
        password: "Viewer@123456",
        role: "viewer",
        isActive: true,
      },
    ];

    console.log("🌱 Seeding admin users...");

    for (const user of adminUsers) {
      const newUser = new AdminUser(user);
      await newUser.save();
      console.log(`✅ Created: ${user.email} (${user.role})`);
    }

    console.log("\n✨ Seeding completed successfully!");
    console.log("\n📋 Login Credentials:");
    console.log("-----------------------------------");
    console.log("Admin:");
    console.log("  Email: admin@furniture-mart.com");
    console.log("  Password: Admin@123456");
    console.log("-----------------------------------");
    console.log("Editor:");
    console.log("  Email: editor@furniture-mart.com");
    console.log("  Password: Editor@123456");
    console.log("-----------------------------------");
    console.log("Viewer:");
    console.log("  Email: viewer@furniture-mart.com");
    console.log("  Password: Viewer@123456");
    console.log("-----------------------------------\n");

    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding admin users:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

// Run the seed
seedAdminUsers();
