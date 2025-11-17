# Database Seeding Guide

This directory contains scripts to seed the Furniture Mart database with sample categories and products.

## Prerequisites

- MongoDB server running locally or connection string configured in `.env`
- Node.js and npm installed
- Dependencies installed (`npm install`)

## Files

- **seed.json** - Sample data with 6 categories and 10 products
- **scripts/seed.ts** - Script to populate database with seed.json data
- **scripts/clear.ts** - Script to clear all data from database

## Usage

### Seed Database

Run the seed script to insert sample categories and products:

```bash
npm run seed
```

This will:
1. Connect to MongoDB
2. Clear existing data
3. Insert 6 categories
4. Insert 10 products
5. Display statistics

**Output Example:**
```
📡 Connecting to MongoDB at mongodb://localhost:27017/furniture-mart...
✅ Connected to MongoDB successfully!
📖 Reading seed data from .../seed.json...
✅ Seed data loaded successfully!
🧹 Clearing existing data...
✅ Database cleared!

📚 Seeding 6 categories...
✅ 6 categories inserted successfully!
   1. Sofas & Couches (slug: sofas-couches)
   2. Beds & Mattresses (slug: beds-mattresses)
   3. Chairs & Recliners (slug: chairs-recliners)
   4. Tables & Desks (slug: tables-desks)
   5. Storage & Shelving (slug: storage-shelving)
   6. Outdoor Furniture (slug: outdoor-furniture)

🛍️  Seeding 10 products...
✅ 10 products inserted successfully!
   1. Modern Gray Leather Sofa - $1299 (slug: modern-gray-leather-sofa)
   2. Wooden Dining Chair Set - $399 (slug: wooden-dining-chair-set)
   ... (and more)

📊 Database Statistics:
   ✓ Total Categories: 6
   ✓ Total Products: 10

📈 Products per Category:
   Sofas & Couches: 2 products
   Beds & Mattresses: 2 products
   Chairs & Recliners: 2 products
   Tables & Desks: 2 products
   Storage & Shelving: 1 product
   Outdoor Furniture: 1 product

✨ Database seeding completed successfully!
🔌 MongoDB connection closed
```

### Clear Database

To remove all data from the database:

```bash
npm run seed:clear
```

This will delete all categories and products.

## Customizing Seed Data

Edit `seed.json` to customize the seed data:

```json
{
  "categories": [
    {
      "name": "Your Category",
      "description": "Category description",
      "icon": "📦",
      "color": "from-color-500 to-color-500"
    }
  ],
  "products": [
    {
      "name": "Product Name",
      "description": "Product description",
      "price": 999,
      "category": "Your Category",
      "sku": "PROD-001",
      "stock": 10,
      "featured": true,
      "images": [...],
      "variants": [...],
      "specifications": [...],
      "rating": 4.5,
      "reviews": 10
    }
  ]
}
```

## Notes

- **Slug Generation**: Slugs are automatically generated from names during seeding
- **Clear on Seed**: The seed script clears existing data before inserting new data
- **Product Count**: Product counts per category are automatically calculated
- **MongoDB Connection**: Uses `MONGODB_URI` from `.env` or defaults to `mongodb://localhost:27017/furniture-mart`

## Troubleshooting

### MongoDB Connection Failed
- Ensure MongoDB server is running
- Check `MONGODB_URI` in `.env` file
- Verify network connectivity

### File Not Found Errors
- Run scripts from project root directory
- Check that `seed.json` exists in root

### Data Not Inserted
- Check MongoDB logs
- Verify collection permissions
- Ensure models are correctly defined

## API Usage After Seeding

Once seeded, you can access the data via API:

```bash
# List all categories
curl http://localhost:5000/api/categories

# Get category by slug
curl http://localhost:5000/api/categories/slug/sofas-couches

# Search products
curl http://localhost:5000/api/products/search/advanced?search=sofa&featured=true

# Get product by slug
curl http://localhost:5000/api/products/slug/modern-gray-leather-sofa
```
