import mongoose from "mongoose";
import Category from "./src/models/Category.js";

const categoryImages = {
  "Living Room":
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIyNCIgZmlsbD0iI2Y1YjA0ZCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjMwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxpdmluZyBSb29tPC90ZXh0Pjwvc3ZnPg==",
  Bedroom:
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIyNCIgZmlsbD0iI2Y1ZGU3ZiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjMwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkJlZHJvb208L3RleHQ+PC9zdmc+",
  Dining:
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIyNCIgZmlsbD0iI2ZmZTBiMiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjMwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkRpbmluZzwvdGV4dD48L3N2Zz4=",
  Office:
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIyNCIgZmlsbD0iIzY1YzBiYSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjMwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk9mZmljZTwvdGV4dD48L3N2Zz4=",
  Outdoor:
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIyNCIgZmlsbD0iIzRiYWY5YyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjMwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk91dGRvb3I8L3RleHQ+PC9zdmc+",
  Accessories:
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIyNCIgZmlsbD0iI2ZmY2EyOCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjMwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkFjY2Vzc29yaWVzPC90ZXh0Pjwvc3ZnPg==",
};

(async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/furniture-mart");
    console.log("✓ MongoDB connected");

    for (const [categoryName, imageData] of Object.entries(categoryImages)) {
      const result = await Category.findOneAndUpdate(
        { name: categoryName },
        { image: imageData },
        { new: true }
      );
      if (result) {
        console.log(`✓ Updated ${categoryName} with image`);
      } else {
        console.log(`✗ Category not found: ${categoryName}`);
      }
    }

    console.log("\n✓ All categories updated with images!");
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("✗ Error:", error.message);
    process.exit(1);
  }
})();
