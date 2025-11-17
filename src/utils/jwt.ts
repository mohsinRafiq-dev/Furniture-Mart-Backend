import jwt from "jsonwebtoken";
import { config } from "../config/index.js";

/**
 * JWT Payload Interface for Admin Authentication
 */
export interface AdminAuthPayload {
  adminId: string;
  email: string;
  role: "admin" | "editor" | "viewer";
  iat?: number;
  exp?: number;
}

/**
 * JWT Configuration
 */
const JWT_SECRET = process.env.JWT_SECRET || "furniture-mart-secret-key-2024";
const JWT_EXPIRY = 24 * 60 * 60; // 24 hours in seconds
const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || "furniture-mart-refresh-secret-key";
const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60; // 7 days in seconds

/**
 * Generate Admin Access Token
 */
export const generateAccessToken = (
  adminId: string,
  email: string,
  role: "admin" | "editor" | "viewer"
): string => {
  try {
    const payload: AdminAuthPayload = {
      adminId,
      email,
      role,
    };
    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRY,
      algorithm: "HS256",
    });
    return token;
  } catch (error) {
    throw new Error(`Failed to generate access token: ${error}`);
  }
};

/**
 * Generate Refresh Token
 */
export const generateRefreshToken = (
  adminId: string,
  email: string,
  role: "admin" | "editor" | "viewer"
): string => {
  try {
    const payload: AdminAuthPayload = {
      adminId,
      email,
      role,
    };
    const token = jwt.sign(payload, REFRESH_TOKEN_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRY,
      algorithm: "HS256",
    });
    return token;
  } catch (error) {
    throw new Error(`Failed to generate refresh token: ${error}`);
  }
};

/**
 * Verify Access Token
 */
export const verifyAccessToken = (token: string): AdminAuthPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ["HS256"],
    }) as AdminAuthPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.error("❌ Access token expired");
      return null;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      console.error("❌ Invalid access token:", error.message);
      return null;
    }
    console.error("❌ Token verification failed:", error);
    return null;
  }
};

/**
 * Verify Refresh Token
 */
export const verifyRefreshToken = (token: string): AdminAuthPayload | null => {
  try {
    const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET, {
      algorithms: ["HS256"],
    }) as AdminAuthPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.error("❌ Refresh token expired");
      return null;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      console.error("❌ Invalid refresh token:", error.message);
      return null;
    }
    console.error("❌ Token verification failed:", error);
    return null;
  }
};

/**
 * Decode Token Without Verification
 */
export const decodeToken = (token: string): AdminAuthPayload | null => {
  try {
    const decoded = jwt.decode(token) as AdminAuthPayload | null;
    return decoded;
  } catch (error) {
    console.error("❌ Failed to decode token:", error);
    return null;
  }
};

/**
 * Legacy functions for backward compatibility
 */
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface AuthPayload {
  sub: string;
  email: string;
  name: string;
  role: string;
  iat: number;
  exp: number;
}

/**
 * Generate JWT token (legacy)
 */
export const generateToken = (user: User): string => {
  const payload: AuthPayload = {
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
  };

  return jwt.sign(payload, config.JWT_SECRET);
};

/**
 * Verify JWT token (legacy)
 */
export const verifyToken = (token: string): AuthPayload => {
  return jwt.verify(token, config.JWT_SECRET) as AuthPayload;
};
