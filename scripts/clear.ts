import mongoose from "mongoose";
import dotenv from "dotenv";
import Category from "../src/models/Category.js";
import Product from "../src/models/Product.js";

dotenv.config();

/**
 * Clear all data from database
 */
async function clearDatabase() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/furniture-mart";
    console.log(`📡 Connecting to MongoDB at ${mongoUri}...`);

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log("✅ Connected to MongoDB successfully!");

    // Clear data
    console.log("🧹 Clearing all data...");

    const categoryResult = await Category.deleteMany({});
    console.log(`✅ Deleted ${categoryResult.deletedCount} categories`);

    const productResult = await Product.deleteMany({});
    console.log(`✅ Deleted ${productResult.deletedCount} products`);

    console.log("\n✨ Database cleared successfully!");

    await mongoose.connection.close();
    console.log("🔌 MongoDB connection closed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error clearing database:", error);
    process.exit(1);
  }
}

// Run clear script
clearDatabase();
