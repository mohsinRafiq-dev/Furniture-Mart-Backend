import { Router, Request, Response } from "express";
import { asyncHandler } from "../middleware/errorHandler.js";
import { config } from "../config/index.js";
import { ApiResponse } from "../types/index.js";
import productRoutes from "./products.js";
import categoryRoutes from "./categories.js";
import authRoutes from "./auth.js";
import adminRoutes from "./admin.js";
import analyticsRoutes from "./analytics.js";

const router = Router();

/**
 * Health check route
 * GET /api/health
 * Returns server status and configuration
 */
router.get(
  "/health",
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const response: ApiResponse = {
      success: true,
      message: "Server is running",
      data: {
        status: "operational",
        timestamp: new Date().toISOString(),
        environment: config.NODE_ENV,
        uptime: process.uptime(),
        version: "1.0.0",
      },
    };

    res.status(200).json(response);
  })
);

/**
 * Server info route
 * GET /api/info
 * Returns API information and available endpoints
 */
router.get(
  "/info",
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const response: ApiResponse = {
      success: true,
      message: "API Information",
      data: {
        name: "Ashraf Furnitures Backend API",
        version: "1.0.0",
        description: "Express backend for Furniture e-commerce platform",
        endpoints: {
          health: "GET /api/health",
          info: "GET /api/info",
          products: {
            list: "GET /api/products",
            get: "GET /api/products/:id",
            search: "GET /api/products/search/advanced",
          },
          categories: {
            list: "GET /api/categories",
            get: "GET /api/categories/:id",
          },
          auth: {
            login: "POST /api/auth/login",
            refresh: "POST /api/auth/refresh",
            logout: "POST /api/auth/logout",
            profile: "GET /api/auth/me",
          },
          analytics: {
            trackSession: "POST /api/analytics/track-session",
            trackProductView: "POST /api/analytics/track-product-view",
            summary: "GET /api/analytics/summary",
            product: "GET /api/analytics/product/:productId",
          },
          admin: {
            note: "All /api/admin/* routes require JWT authentication",
            products: {
              create: "POST /api/admin/products (requires auth)",
              update: "PUT /api/admin/products/:id (requires auth)",
              delete: "DELETE /api/admin/products/:id (requires auth)",
              bulkDelete: "POST /api/admin/products/bulk-delete (admin only)",
            },
            categories: {
              create: "POST /api/admin/categories (requires auth)",
              update: "PUT /api/admin/categories/:id (requires auth)",
              delete: "DELETE /api/admin/categories/:id (requires auth)",
            },
            profile: {
              get: "GET /api/admin/profile (requires auth)",
              update: "PUT /api/admin/profile (requires auth)",
              activity: "GET /api/admin/profile/activity (admin only)",
            },
            admins: {
              list: "GET /api/admin/admins (admin only)",
              create: "POST /api/admin/admins (admin only)",
              update: "PUT /api/admin/admins/:id (admin only)",
              deactivate: "DELETE /api/admin/admins/:id (admin only)",
            },
            stats: {
              overview: "GET /api/admin/stats/overview (requires auth)",
              products: "GET /api/admin/stats/products (requires auth)",
              orders: "GET /api/admin/stats/orders (requires auth)",
            },
          },
        },
      },
    };

    res.status(200).json(response);
  })
);

/**
 * Mount resource routes
 */
router.use("/products", productRoutes);
router.use("/categories", categoryRoutes);
router.use("/auth", authRoutes);
router.use("/analytics", analyticsRoutes);

/**
 * Mount admin routes (all protected by JWT middleware)
 * All /api/admin/* routes require authentication
 */
router.use("/admin", adminRoutes);

export default router;
