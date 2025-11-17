import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Category from "../src/models/Category.js";
import Product from "../src/models/Product.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Seed database with categories and products
 */
async function seedDatabase() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/furniture-mart";
    console.log(`📡 Connecting to MongoDB at ${mongoUri}...`);

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log("✅ Connected to MongoDB successfully!");

    // Read seed file
    const seedFilePath = path.join(__dirname, "seed.json");
    console.log(`📖 Reading seed data from ${seedFilePath}...`);

    if (!fs.existsSync(seedFilePath)) {
      throw new Error(`Seed file not found at ${seedFilePath}`);
    }

    const seedData = JSON.parse(fs.readFileSync(seedFilePath, "utf-8"));
    console.log(`✅ Seed data loaded successfully!`);

    // Clear existing data
    console.log("🧹 Clearing existing data...");
    await Category.deleteMany({});
    await Product.deleteMany({});
    console.log("✅ Database cleared!");

    // Seed categories
    console.log(`\n📚 Seeding ${seedData.categories.length} categories...`);
    const categories = await Category.insertMany(seedData.categories);
    console.log(`✅ ${categories.length} categories inserted successfully!`);

    // Display seeded categories
    categories.forEach((cat: any, index: number) => {
      console.log(`   ${index + 1}. ${cat.name} (slug: ${cat.slug})`);
    });

    // Seed products
    console.log(`\n🛍️  Seeding ${seedData.products.length} products...`);
    const products = await Product.insertMany(seedData.products);
    console.log(`✅ ${products.length} products inserted successfully!`);

    // Display seeded products
    products.forEach((prod: any, index: number) => {
      console.log(
        `   ${index + 1}. ${prod.name} - $${prod.price} (slug: ${prod.slug})`
      );
    });

    // Display statistics
    console.log("\n📊 Database Statistics:");
    console.log(`   ✓ Total Categories: ${categories.length}`);
    console.log(`   ✓ Total Products: ${products.length}`);

    // Calculate stats
    const categoryStats = await Promise.all(
      categories.map(async (category: any) => {
        const count = await Product.countDocuments({
          category: category.name,
        });
        return { name: category.name, count };
      })
    );

    console.log("\n📈 Products per Category:");
    categoryStats.forEach((stat: any) => {
      console.log(`   ${stat.name}: ${stat.count} products`);
    });

    console.log("\n✨ Database seeding completed successfully!");

    await mongoose.connection.close();
    console.log("🔌 MongoDB connection closed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

// Run seed script
seedDatabase();
