import mongoose, { Schema, Document } from "mongoose";

/**
 * Audit Log Document Interface
 */
export interface IAuditLog extends Document {
  action: string; // "login_attempt", "login_success", "login_failed", "logout", etc.
  email: string;
  ipAddress: string;
  userAgent: string;
  status: "success" | "failed" | "blocked"; // success, failed, blocked (by rate limit/lock)
  reason?: string; // Why it failed or was blocked
  timestamp: Date;
}

/**
 * Audit Log Schema
 */
const auditLogSchema = new Schema<IAuditLog>(
  {
    action: {
      type: String,
      required: true,
      enum: ["login_attempt", "login_success", "login_failed", "logout", "token_refresh", "google_oauth"],
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    ipAddress: {
      type: String,
      default: "unknown",
    },
    userAgent: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["success", "failed", "blocked"],
      default: "failed",
    },
    reason: {
      type: String,
      default: "",
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
      expires: 90 * 24 * 60 * 60, // Auto-delete after 90 days
    },
  },
  {
    timestamps: false,
  }
);

/**
 * Create indexes for common queries
 */
auditLogSchema.index({ email: 1, timestamp: -1 });
auditLogSchema.index({ ipAddress: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });

/**
 * Audit Log Model
 */
const AuditLog = mongoose.model<IAuditLog>("AuditLog", auditLogSchema);

export default AuditLog;
