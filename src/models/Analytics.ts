import mongoose, { Schema, Document } from "mongoose";

// Visitor Session
export interface IVisitorSession extends Document {
  sessionId: string;
  ipAddress: string;
  userAgent: string;
  startTime: Date;
  endTime?: Date;
  pageViews: number;
  referrer?: string;
  country?: string;
  city?: string;
  deviceType: "mobile" | "tablet" | "desktop";
  source: "direct" | "search" | "social" | "referral" | "other";
}

// Product View
export interface IProductView extends Document {
  productId: string;
  productName: string;
  sessionId: string;
  userId?: string;
  viewedAt: Date;
  timeSpent: number; // in seconds
  action: "view" | "add_to_cart" | "purchase" | "wishlist";
}

// Daily Analytics Summary
export interface IDailyAnalytics extends Document {
  date: Date;
  totalVisitors: number;
  totalPageViews: number;
  totalSessions: number;
  averageTimeOnSite: number; // in seconds
  bounceRate: number; // percentage
  conversionRate: number; // percentage
  topProducts: Array<{
    productId: string;
    productName: string;
    views: number;
    purchases: number;
  }>;
  trafficSources: {
    direct: number;
    search: number;
    social: number;
    referral: number;
    other: number;
  };
}

// Visitor Session Schema
const visitorSessionSchema = new Schema<IVisitorSession>(
  {
    sessionId: { type: String, unique: true, required: true, index: true },
    ipAddress: { type: String, required: true },
    userAgent: { type: String },
    startTime: { type: Date, default: Date.now, index: true },
    endTime: { type: Date },
    pageViews: { type: Number, default: 0 },
    referrer: { type: String },
    country: { type: String },
    city: { type: String },
    deviceType: {
      type: String,
      enum: ["mobile", "tablet", "desktop"],
      default: "desktop",
    },
    source: {
      type: String,
      enum: ["direct", "search", "social", "referral", "other"],
      default: "direct",
    },
  },
  { timestamps: true }
);

// Product View Schema
const productViewSchema = new Schema<IProductView>(
  {
    productId: { type: String, required: true, index: true },
    productName: { type: String, required: true },
    sessionId: { type: String, required: true, index: true },
    userId: { type: String },
    viewedAt: { type: Date, default: Date.now, index: true },
    timeSpent: { type: Number, default: 0 },
    action: {
      type: String,
      enum: ["view", "add_to_cart", "purchase", "wishlist"],
      default: "view",
    },
  },
  { timestamps: true }
);

// Daily Analytics Schema
const dailyAnalyticsSchema = new Schema<IDailyAnalytics>(
  {
    date: { type: Date, required: true, unique: true, index: true },
    totalVisitors: { type: Number, default: 0 },
    totalPageViews: { type: Number, default: 0 },
    totalSessions: { type: Number, default: 0 },
    averageTimeOnSite: { type: Number, default: 0 },
    bounceRate: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 },
    topProducts: [
      {
        productId: String,
        productName: String,
        views: Number,
        purchases: Number,
      },
    ],
    trafficSources: {
      direct: { type: Number, default: 0 },
      search: { type: Number, default: 0 },
      social: { type: Number, default: 0 },
      referral: { type: Number, default: 0 },
      other: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

// Create indexes for better query performance
visitorSessionSchema.index({ startTime: -1 });
productViewSchema.index({ viewedAt: -1 });
productViewSchema.index({ productId: 1, viewedAt: -1 });

const VisitorSession = mongoose.model<IVisitorSession>(
  "VisitorSession",
  visitorSessionSchema
);
const ProductView = mongoose.model<IProductView>(
  "ProductView",
  productViewSchema
);
const DailyAnalytics = mongoose.model<IDailyAnalytics>(
  "DailyAnalytics",
  dailyAnalyticsSchema
);

export { VisitorSession, ProductView, DailyAnalytics };
