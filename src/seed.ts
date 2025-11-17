import mongoose from "mongoose";
import Product from "./models/Product.js";
import { config } from "./config/index.js";

const SEED_PRODUCTS = [
  // Living Room
  {
    name: "Modern Leather Sofa",
    description: "Premium leather sofa with contemporary design. Comfortable seating for 3-4 people.",
    price: 1299,
    category: "Living Room",
    stock: 15,
    sku: "SOFA-001",
    featured: true,
    images: [
      {
        url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&h=400&fit=crop",
        alt: "Modern Leather Sofa",
        isPrimary: true,
      },
    ],
    rating: 4.8,
    reviews: 124,
  },
  {
    name: "Scandinavian Coffee Table",
    description: "Elegant wooden coffee table with minimalist design. Perfect for living rooms.",
    price: 349,
    category: "Living Room",
    stock: 25,
    sku: "TABLE-001",
    featured: true,
    images: [
      {
        url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&h=400&fit=crop",
        alt: "Scandinavian Coffee Table",
        isPrimary: true,
      },
    ],
    rating: 4.6,
    reviews: 87,
  },
  {
    name: "Contemporary Armchair",
    description: "Single seater armchair with sleek design. Great for reading corners.",
    price: 549,
    category: "Living Room",
    stock: 18,
    sku: "CHAIR-001",
    featured: false,
    images: [
      {
        url: "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=500&h=400&fit=crop",
        alt: "Contemporary Armchair",
        isPrimary: true,
      },
    ],
    rating: 4.5,
    reviews: 63,
  },

  // Bedroom
  {
    name: "Luxury Bed Frame",
    description: "Premium bed frame with upholstered headboard. Available in Queen and King sizes.",
    price: 1699,
    category: "Bedroom",
    stock: 12,
    sku: "BED-001",
    featured: true,
    images: [
      {
        url: "https://images.unsplash.com/photo-1540932239986-310128078ceb?w=500&h=400&fit=crop",
        alt: "Luxury Bed Frame",
        isPrimary: true,
      },
    ],
    rating: 4.9,
    reviews: 156,
  },
  {
    name: "Wooden Nightstand",
    description: "Rustic wooden nightstand with drawer storage. Complements any bedroom style.",
    price: 199,
    category: "Bedroom",
    stock: 30,
    sku: "STAND-001",
    featured: false,
    images: [
      {
        url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=400&fit=crop",
        alt: "Wooden Nightstand",
        isPrimary: true,
      },
    ],
    rating: 4.4,
    reviews: 45,
  },
  {
    name: "Bedroom Wardrobe",
    description: "Spacious wardrobe with hanging space and shelves. Modern design.",
    price: 899,
    category: "Bedroom",
    stock: 8,
    sku: "WARD-001",
    featured: false,
    images: [
      {
        url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=400&fit=crop",
        alt: "Bedroom Wardrobe",
        isPrimary: true,
      },
    ],
    rating: 4.3,
    reviews: 32,
  },

  // Dining
  {
    name: "Minimalist Dining Table",
    description: "Modern dining table with sleek design. Seats 6-8 people comfortably.",
    price: 799,
    category: "Dining",
    stock: 10,
    sku: "DTABLE-001",
    featured: true,
    images: [
      {
        url: "https://images.unsplash.com/photo-1559707264-cd4628902d4a?w=500&h=400&fit=crop",
        alt: "Minimalist Dining Table",
        isPrimary: true,
      },
    ],
    rating: 4.7,
    reviews: 98,
  },
  {
    name: "Dining Chair Set",
    description: "Set of 4 elegant dining chairs. Comfortable seating with modern aesthetics.",
    price: 449,
    category: "Dining",
    stock: 20,
    sku: "DCHAIR-001",
    featured: false,
    images: [
      {
        url: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500&h=400&fit=crop",
        alt: "Dining Chair Set",
        isPrimary: true,
      },
    ],
    rating: 4.5,
    reviews: 72,
  },
  {
    name: "Kitchen Bar Stools",
    description: "Modern bar stools with adjustable height. Perfect for kitchen counters.",
    price: 299,
    category: "Dining",
    stock: 35,
    sku: "BARSTOOL-001",
    featured: false,
    images: [
      {
        url: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500&h=400&fit=crop",
        alt: "Kitchen Bar Stools",
        isPrimary: true,
      },
    ],
    rating: 4.4,
    reviews: 54,
  },

  // Office
  {
    name: "Rustic Wooden Desk",
    description: "Spacious wooden desk for home or office. Great storage and workspace.",
    price: 649,
    category: "Office",
    stock: 14,
    sku: "DESK-001",
    featured: true,
    images: [
      {
        url: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500&h=400&fit=crop",
        alt: "Rustic Wooden Desk",
        isPrimary: true,
      },
    ],
    rating: 4.6,
    reviews: 91,
  },
  {
    name: "Premium Office Chair",
    description: "Ergonomic office chair with lumbar support. All-day comfort.",
    price: 699,
    category: "Office",
    stock: 22,
    sku: "OFFCHAIR-001",
    featured: true,
    images: [
      {
        url: "https://images.unsplash.com/photo-1574180273156-78191ba9b88f?w=500&h=400&fit=crop",
        alt: "Premium Office Chair",
        isPrimary: true,
      },
    ],
    rating: 4.8,
    reviews: 134,
  },
  {
    name: "Office Desk Lamp",
    description: "LED desk lamp with adjustable brightness. Perfect for focused work.",
    price: 79,
    category: "Office",
    stock: 50,
    sku: "LAMP-001",
    featured: false,
    images: [
      {
        url: "https://images.unsplash.com/photo-1565636192335-14c08cf17855?w=500&h=400&fit=crop",
        alt: "Office Desk Lamp",
        isPrimary: true,
      },
    ],
    rating: 4.7,
    reviews: 67,
  },

  // Kitchen
  {
    name: "Modern Kitchen Island",
    description: "Contemporary kitchen island with storage. Great for food prep and dining.",
    price: 599,
    category: "Kitchen",
    stock: 9,
    sku: "ISLAND-001",
    featured: true,
    images: [
      {
        url: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500&h=400&fit=crop",
        alt: "Modern Kitchen Island",
        isPrimary: true,
      },
    ],
    rating: 4.6,
    reviews: 78,
  },
  {
    name: "Wall-mounted Shelves",
    description: "Industrial wall shelves. Perfect for kitchens and dining areas.",
    price: 129,
    category: "Kitchen",
    stock: 40,
    sku: "SHELF-001",
    featured: false,
    images: [
      {
        url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=400&fit=crop",
        alt: "Wall-mounted Shelves",
        isPrimary: true,
      },
    ],
    rating: 4.5,
    reviews: 43,
  },
  {
    name: "Kitchen Pantry Cabinet",
    description: "Spacious pantry cabinet for kitchen storage. Modern white finish.",
    price: 399,
    category: "Kitchen",
    stock: 16,
    sku: "PANTRY-001",
    featured: false,
    images: [
      {
        url: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500&h=400&fit=crop",
        alt: "Kitchen Pantry Cabinet",
        isPrimary: true,
      },
    ],
    rating: 4.4,
    reviews: 35,
  },

  // Storage
  {
    name: "Industrial Bookshelf",
    description: "Tall bookshelf with metal frame. Great for storage and display.",
    price: 449,
    category: "Storage",
    stock: 17,
    sku: "BOOKSHELF-001",
    featured: true,
    images: [
      {
        url: "https://images.unsplash.com/photo-1572496750584-5020b9d1e18d?w=500&h=400&fit=crop",
        alt: "Industrial Bookshelf",
        isPrimary: true,
      },
    ],
    rating: 4.7,
    reviews: 89,
  },
  {
    name: "Storage Chest",
    description: "Decorative storage chest with rustic design. Multi-purpose storage.",
    price: 199,
    category: "Storage",
    stock: 28,
    sku: "CHEST-001",
    featured: false,
    images: [
      {
        url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=400&fit=crop",
        alt: "Storage Chest",
        isPrimary: true,
      },
    ],
    rating: 4.3,
    reviews: 41,
  },
  {
    name: "Corner Cabinet",
    description: "Space-saving corner cabinet. Perfect for living rooms and bedrooms.",
    price: 299,
    category: "Storage",
    stock: 19,
    sku: "CABINET-001",
    featured: false,
    images: [
      {
        url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=400&fit=crop",
        alt: "Corner Cabinet",
        isPrimary: true,
      },
    ],
    rating: 4.5,
    reviews: 52,
  },

  // Outdoor
  {
    name: "Garden Patio Sofa",
    description: "Weather-resistant outdoor sofa. Perfect for gardens and patios.",
    price: 899,
    category: "Outdoor",
    stock: 11,
    sku: "PSOFA-001",
    featured: true,
    images: [
      {
        url: "https://images.unsplash.com/photo-1584622181563-430f63602d4b?w=500&h=400&fit=crop",
        alt: "Garden Patio Sofa",
        isPrimary: true,
      },
    ],
    rating: 4.6,
    reviews: 74,
  },
  {
    name: "Outdoor Dining Set",
    description: "Complete outdoor dining set with 6 chairs. Durable and stylish.",
    price: 1199,
    category: "Outdoor",
    stock: 7,
    sku: "ODINING-001",
    featured: true,
    images: [
      {
        url: "https://images.unsplash.com/photo-1584622181563-430f63602d4b?w=500&h=400&fit=crop",
        alt: "Outdoor Dining Set",
        isPrimary: true,
      },
    ],
    rating: 4.8,
    reviews: 103,
  },
  {
    name: "Garden Lounge Chairs",
    description: "Comfortable outdoor lounge chairs. Perfect for relaxation.",
    price: 349,
    category: "Outdoor",
    stock: 24,
    sku: "LOUNGE-001",
    featured: false,
    images: [
      {
        url: "https://images.unsplash.com/photo-1584622181563-430f63602d4b?w=500&h=400&fit=crop",
        alt: "Garden Lounge Chairs",
        isPrimary: true,
      },
    ],
    rating: 4.5,
    reviews: 61,
  },

  // Lighting
  {
    name: "Pendant Ceiling Light",
    description: "Modern pendant light fixture. Adjustable height. Great for dining areas.",
    price: 129,
    category: "Lighting",
    stock: 32,
    sku: "PENDANT-001",
    featured: true,
    images: [
      {
        url: "https://images.unsplash.com/photo-1565636192335-14c08cf17855?w=500&h=400&fit=crop",
        alt: "Pendant Ceiling Light",
        isPrimary: true,
      },
    ],
    rating: 4.7,
    reviews: 95,
  },
  {
    name: "Floor Standing Lamp",
    description: "Elegant floor lamp with linen shade. Perfect for reading corners.",
    price: 189,
    category: "Lighting",
    stock: 26,
    sku: "FLOOR-001",
    featured: false,
    images: [
      {
        url: "https://images.unsplash.com/photo-1565636192335-14c08cf17855?w=500&h=400&fit=crop",
        alt: "Floor Standing Lamp",
        isPrimary: true,
      },
    ],
    rating: 4.6,
    reviews: 58,
  },
  {
    name: "Wall Sconces",
    description: "Set of 2 wall sconces. Perfect ambient lighting for bedrooms.",
    price: 159,
    category: "Lighting",
    stock: 29,
    sku: "SCONCE-001",
    featured: false,
    images: [
      {
        url: "https://images.unsplash.com/photo-1565636192335-14c08cf17855?w=500&h=400&fit=crop",
        alt: "Wall Sconces",
        isPrimary: true,
      },
    ],
    rating: 4.5,
    reviews: 44,
  },
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.DB_URI);
    console.log("Connected to MongoDB");

    // Check if products already exist
    const existingCount = await Product.countDocuments();
    if (existingCount > 0) {
      console.log(`Database already has ${existingCount} products. Skipping seed.`);
      process.exit(0);
    }

    // Insert seed products
    const result = await Product.insertMany(SEED_PRODUCTS);
    console.log(`✅ Successfully seeded ${result.length} products into the database`);

    // Show products by category
    const categories = new Set(SEED_PRODUCTS.map((p) => p.category));
    for (const category of categories) {
      const count = SEED_PRODUCTS.filter((p) => p.category === category).length;
      console.log(`   - ${category}: ${count} products`);
    }

    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

// Run the seed
seedDatabase();
