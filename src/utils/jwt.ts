import jwt from "jsonwebtoken";
import { config } from "../config/index.js";
import { User, AuthPayload } from "../types/index.js";

/**
 * Generate JWT token
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
 * Verify JWT token
 */
export const verifyToken = (token: string): AuthPayload => {
  return jwt.verify(token, config.JWT_SECRET) as AuthPayload;
};

/**
 * Decode JWT token (without verification)
 */
export const decodeToken = (token: string): AuthPayload | null => {
  try {
    return jwt.decode(token) as AuthPayload;
  } catch {
    return null;
  }
};
