import mongoose, { Schema, Document } from "mongoose";

/**
 * Product Variant Interface
 */
export interface IProductVariant {
  _id?: string;
  name: string; // e.g., "Color", "Size"
  values: string[]; // e.g., ["Red", "Blue", "Green"]
}

/**
 * Product Specification Interface
 */
export interface IProductSpec {
  _id?: string;
  name: string; // e.g., "Material", "Weight"
  value: string; // e.g., "Oak Wood", "25kg"
}

/**
 * Product Image Interface
 */
export interface IProductImage {
  _id?: string;
  url: string;
  alt: string;
  isPrimary: boolean;
}

/**
 * Product Document Interface
 */
export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  category: string;
  images: IProductImage[];
  stock: number;
  sku: string;
  slug: string;
  featured: boolean;
  variants: IProductVariant[];
  specifications: IProductSpec[];
  rating: number;
  reviews: number;
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
    images: {
      type: [
        {
          url: {
            type: String,
            required: [true, "Image URL is required"],
          },
          alt: {
            type: String,
            default: "",
          },
          isPrimary: {
            type: Boolean,
            default: false,
          },
        },
      ],
      default: [],
      validate: {
        validator: (v: IProductImage[]) => v.length <= 10,
        message: "Cannot exceed 10 product images",
      },
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
    slug: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    variants: {
      type: [
        {
          name: {
            type: String,
            required: [true, "Variant name is required"],
          },
          values: {
            type: [String],
            required: [true, "Variant values are required"],
            validate: {
              validator: (v: string[]) => v.length > 0,
              message: "At least one variant value is required",
            },
          },
        },
      ],
      default: [],
    },
    specifications: {
      type: [
        {
          name: {
            type: String,
            required: [true, "Specification name is required"],
          },
          value: {
            type: String,
            required: [true, "Specification value is required"],
          },
        },
      ],
      default: [],
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, "Rating cannot be negative"],
      max: [5, "Rating cannot exceed 5"],
    },
    reviews: {
      type: Number,
      default: 0,
      min: [0, "Review count cannot be negative"],
      validate: {
        validator: Number.isInteger,
        message: "Review count must be an integer",
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index for common queries
productSchema.index({ category: 1, featured: 1 });
productSchema.index({ name: "text", description: "text" });
productSchema.index({ slug: 1 });
productSchema.index({ price: 1 });

/**
 * Auto-generate slug from name before saving
 */
productSchema.pre("save", function (next) {
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
 * Product Model
 */
const Product = mongoose.model<IProduct>("Product", productSchema);

export default Product;
