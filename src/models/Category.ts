import mongoose, { Schema, Document } from "mongoose";

/**
 * Category Document Interface
 */
export interface ICategory extends Document {
  name: string;
  description: string;
  color: string;
  image: string;
  slug: string;
  productCount: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Category Schema
 */
const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
      trim: true,
      minlength: [2, "Category name must be at least 2 characters"],
      maxlength: [50, "Category name cannot exceed 50 characters"],
      index: true,
    },
    description: {
      type: String,
      default: "",
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    color: {
      type: String,
      required: [true, "Color is required"],
      default: "from-gray-500 to-gray-600",
      validate: {
        validator: (v: string) => v.includes("from-") && v.includes("to-"),
        message: "Color must be a valid Tailwind gradient format",
      },
    },
    image: {
      type: String,
      default: "",
    },
    slug: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    productCount: {
      type: Number,
      default: 0,
      min: [0, "Product count cannot be negative"],
      validate: {
        validator: Number.isInteger,
        message: "Product count must be an integer",
      },
    },
  },
  {
    timestamps: true,
  }
);

// Optimized indexes for common queries
categorySchema.index({ name: 1 });
categorySchema.index({ slug: 1 });
categorySchema.index({ createdAt: -1 }); // For sorting
categorySchema.index({ name: "text", description: "text" }); // For search

/**
 * Auto-generate slug from name before saving
 */
categorySchema.pre("save", function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }
  next();
});

/**
 * Category Model
 */
const Category = mongoose.model<ICategory>("Category", categorySchema);

export default Category;
