import mongoose, { Schema, Document } from "mongoose";

/**
 * Product Document Interface
 */
export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  stock: number;
  sku: string;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Product Schema
 */
const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: [2, "Product name must be at least 2 characters"],
      maxlength: [100, "Product name cannot exceed 100 characters"],
      index: true,
    },
    description: {
      type: String,
      default: "",
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"],
      validate: {
        validator: (v: number) => v > 0,
        message: "Price must be greater than 0",
      },
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      index: true,
    },
    image: {
      type: String,
      default: "📦",
    },
    stock: {
      type: Number,
      required: [true, "Stock is required"],
      default: 0,
      min: [0, "Stock cannot be negative"],
      validate: {
        validator: Number.isInteger,
        message: "Stock must be an integer",
      },
    },
    sku: {
      type: String,
      required: [true, "SKU is required"],
      unique: true,
      trim: true,
      uppercase: true,
      minlength: [3, "SKU must be at least 3 characters"],
      index: true,
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for common queries
productSchema.index({ category: 1, featured: 1 });
productSchema.index({ name: "text", description: "text" });

/**
 * Product Model
 */
const Product = mongoose.model<IProduct>("Product", productSchema);

export default Product;
