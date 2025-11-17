import { Router, Request, Response } from "express";
import { asyncHandler } from "../middleware/errorHandler.js";
import { config } from "../config/index.js";
import { ApiResponse } from "../types/index.js";
import productRoutes from "./products.js";
import categoryRoutes from "./categories.js";

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
            create: "POST /api/products (admin only)",
            update: "PUT /api/products/:id (admin only)",
            delete: "DELETE /api/products/:id (admin only)",
          },
          categories: {
            list: "GET /api/categories",
            create: "POST /api/categories (admin only)",
            update: "PUT /api/categories/:id (admin only)",
            delete: "DELETE /api/categories/:id (admin only)",
          },
          auth: {
            login: "POST /api/auth/login",
            register: "POST /api/auth/register",
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

export default router;
