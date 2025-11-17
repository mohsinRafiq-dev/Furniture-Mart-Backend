import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

/**
 * Admin User Document Interface
 */
export interface IAdminUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "admin" | "editor" | "viewer";
  isActive: boolean;
  lastLogin: Date | null;
  loginAttempts: number;
  isLocked: boolean;
  lockedUntil: Date | null;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(password: string): Promise<boolean>;
}

/**
 * Admin User Schema
 */
const adminUserSchema = new Schema<IAdminUser>(
  {
    name: {
      type: String,
      required: [true, "Admin name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
      index: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Don't return password by default
    },
    role: {
      type: String,
      enum: {
        values: ["admin", "editor", "viewer"],
        message: "Role must be admin, editor, or viewer",
      },
      default: "editor",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    loginAttempts: {
      type: Number,
      default: 0,
      min: [0, "Login attempts cannot be negative"],
      validate: {
        validator: Number.isInteger,
        message: "Login attempts must be an integer",
      },
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
    lockedUntil: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Hash password before saving
 */
adminUserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

/**
 * Compare password method
 */
adminUserSchema.methods.comparePassword = async function (
  password: string
): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
};

/**
 * Index for common queries
 */
adminUserSchema.index({ email: 1 });
adminUserSchema.index({ isActive: 1 });

/**
 * Admin User Model
 */
const AdminUser = mongoose.model<IAdminUser>("AdminUser", adminUserSchema);

export default AdminUser;
