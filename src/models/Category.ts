import mongoose, { Schema, Document } from "mongoose";

/**
 * Category Document Interface
 */
export interface ICategory extends Document {
  name: string;
  description: string;
  icon: string;
  color: string;
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
    icon: {
      type: String,
      required: [true, "Icon is required"],
      default: "📦",
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

// Index for common queries
categorySchema.index({ name: 1 });

/**
 * Category Model
 */
const Category = mongoose.model<ICategory>("Category", categorySchema);

export default Category;
