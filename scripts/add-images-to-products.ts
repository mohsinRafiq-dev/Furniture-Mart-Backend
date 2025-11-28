import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../src/models/Product.js";

dotenv.config();

/**
 * Migration script to add placeholder images to all products
 */
async function addImagesToProducts() {
  try {
    const mongoUri = process.env.DB_URI || process.env.MONGODB_URI || "mongodb://localhost:27017/furniture-mart";
    console.log(`📡 Connecting to MongoDB at ${mongoUri}...`);

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log("✅ Connected to MongoDB successfully!");

    // Product image mapping - high-quality Unsplash images
    const productImages = {
      "Modern Leather Sofa": [
        {
          url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80",
          alt: "Modern Leather Sofa",
          isPrimary: true,
        },
      ],
      "Scandinavian Coffee Table": [
        {
          url: "https://images.unsplash.com/photo-1532372320572-cda25653675f?auto=format&fit=crop&w=800&q=80",
          alt: "Scandinavian Coffee Table",
          isPrimary: true,
        },
      ],
      "Contemporary Armchair": [
        {
          url: "https://images.unsplash.com/photo-1506584184996-20ca1d64619b?auto=format&fit=crop&w=800&q=80",
          alt: "Contemporary Armchair",
          isPrimary: true,
        },
      ],
      "Queen Size Platform Bed": [
        {
          url: "https://images.unsplash.com/photo-1540932239986-310128078ceb?auto=format&fit=crop&w=800&q=80",
          alt: "Queen Size Platform Bed",
          isPrimary: true,
        },
      ],
      "Minimalist Nightstand": [
        {
          url: "https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&w=800&q=80",
          alt: "Minimalist Nightstand",
          isPrimary: true,
        },
      ],
      "Elegant Desk Lamp": [
        {
          url: "https://images.unsplash.com/photo-1565636192335-14c46fa1120d?auto=format&fit=crop&w=800&q=80",
          alt: "Elegant Desk Lamp",
          isPrimary: true,
        },
      ],
      "Dining Room Table Set": [
        {
          url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
          alt: "Dining Room Table Set",
          isPrimary: true,
        },
      ],
      "Kitchen Pantry Cabinet": [
        {
          url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=80",
          alt: "Kitchen Pantry Cabinet",
          isPrimary: true,
        },
      ],
      "Wall-mounted Shelves": [
        {
          url: "https://images.unsplash.com/photo-1469022563149-aa64dbd37dae?auto=format&fit=crop&w=800&q=80",
          alt: "Wall-mounted Shelves",
          isPrimary: true,
        },
      ],
      "Storage Chest": [
        {
          url: "https://images.unsplash.com/photo-1567841882326-e8c70e8c2e01?auto=format&fit=crop&w=800&q=80",
          alt: "Storage Chest",
          isPrimary: true,
        },
      ],
      "Corner Cabinet": [
        {
          url: "https://images.unsplash.com/photo-1578926078328-123456789012?auto=format&fit=crop&w=800&q=80",
          alt: "Corner Cabinet",
          isPrimary: true,
        },
      ],
      "Industrial Bookshelf": [
        {
          url: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=800&q=80",
          alt: "Industrial Bookshelf",
          isPrimary: true,
        },
      ],
      "Pendant Ceiling Light": [
        {
          url: "https://images.unsplash.com/photo-1565193566173-7cda82f45e65?auto=format&fit=crop&w=800&q=80",
          alt: "Pendant Ceiling Light",
          isPrimary: true,
        },
      ],
      "Floor Standing Lamp": [
        {
          url: "https://images.unsplash.com/photo-1565577673606-b1c4c6a1e45d?auto=format&fit=crop&w=800&q=80",
          alt: "Floor Standing Lamp",
          isPrimary: true,
        },
      ],
      "Wall Sconces": [
        {
          url: "https://images.unsplash.com/photo-1559451255-645dfd6bb5dc?auto=format&fit=crop&w=800&q=80",
          alt: "Wall Sconces",
          isPrimary: true,
        },
      ],
      "Garden Patio Sofa": [
        {
          url: "https://images.unsplash.com/photo-1597584212624-753a47d5b50d?auto=format&fit=crop&w=800&q=80",
          alt: "Garden Patio Sofa",
          isPrimary: true,
        },
      ],
      "Outdoor Dining Set": [
        {
          url: "https://images.unsplash.com/photo-1599599810694-b5ac4dd33e2b?auto=format&fit=crop&w=800&q=80",
          alt: "Outdoor Dining Set",
          isPrimary: true,
        },
      ],
      "Garden Lounge Chairs": [
        {
          url: "https://images.unsplash.com/photo-1598038974396-eb5c5a47b160?auto=format&fit=crop&w=800&q=80",
          alt: "Garden Lounge Chairs",
          isPrimary: true,
        },
      ],
      "Hell Yeah": [
        {
          url: "https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&w=800&q=80",
          alt: "Hell Yeah",
          isPrimary: true,
        },
      ],
    };

    // Fetch all products
    const allProducts = await Product.find({});
    console.log(`📦 Found ${allProducts.length} products to update\n`);

    let updated = 0;
    let skipped = 0;

    for (const product of allProducts) {
      // Check if product already has images
      if (product.images && Array.isArray(product.images) && product.images.length > 0) {
        skipped++;
        continue;
      }

      // Get images from mapping or use default
      let images = productImages[product.name as keyof typeof productImages];

      if (!images) {
        // Use a generic furniture image as fallback
        images = [
          {
            url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80",
            alt: product.name,
            isPrimary: true,
          },
        ];
        console.log(`   ℹ️  ${product.name} - using fallback image`);
      }

      // Update product
      await Product.findByIdAndUpdate(
        product._id,
        { images },
        { new: true }
      );

      updated++;
      console.log(`   ✅ ${product.name} - images added`);
    }

    console.log("\n📊 Migration Summary:");
    console.log(`   ✓ Products updated: ${updated}`);
    console.log(`   ✓ Products skipped (already have images): ${skipped}`);
    console.log(`   ✓ Total processed: ${updated + skipped}`);

    console.log("\n✨ Image migration completed successfully!");

    await mongoose.connection.close();
    console.log("🔌 MongoDB connection closed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during migration:", error);
    process.exit(1);
  }
}

// Run migration script
addImagesToProducts();
