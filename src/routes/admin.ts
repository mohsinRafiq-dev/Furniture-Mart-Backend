/**
 * Admin Routes
 * All routes under /api/admin require JWT authentication
 * Middleware: adminAuthMiddleware
 */

import { Router } from "express";
import { adminAuthMiddleware, adminOnly, editorOrAdmin } from "../middleware/auth.js";

const router = Router();

/**
 * ============================================================================
 * ADMIN MIDDLEWARE - ALL ROUTES REQUIRE AUTHENTICATION
 * ============================================================================
 * All routes registered after this middleware require a valid JWT token
 * in the Authorization header: Authorization: Bearer <token>
 * 
 * Returns 401 if:
 * - Authorization header is missing
 * - Token is missing or invalid
 * - Token is expired
 */
router.use(adminAuthMiddleware);

/**
 * ============================================================================
 * PRODUCT ADMIN ROUTES
 * ============================================================================
 * POST   /api/admin/products           - Create product (admin/editor)
 * PUT    /api/admin/products/:id       - Update product (admin/editor)
 * DELETE /api/admin/products/:id       - Delete product (admin/editor)
 * POST   /api/admin/products/bulk-delete - Bulk delete (admin only)
 */

// Product create endpoint (editor+)
router.post("/products", editorOrAdmin, async (req, res) => {
  res.status(200).json({
    success: true,
    message: "POST /api/admin/products - Create product (protected)",
    user: {
      adminId: (req as any).adminId,
      email: (req as any).email,
      role: (req as any).role,
    },
  });
});

// Product update endpoint (editor+)
router.put("/products/:id", editorOrAdmin, async (req, res) => {
  res.status(200).json({
    success: true,
    message: "PUT /api/admin/products/:id - Update product (protected)",
    productId: req.params.id,
    user: {
      adminId: (req as any).adminId,
      email: (req as any).email,
      role: (req as any).role,
    },
  });
});

// Product delete endpoint (editor+)
router.delete("/products/:id", editorOrAdmin, async (req, res) => {
  res.status(200).json({
    success: true,
    message: "DELETE /api/admin/products/:id - Delete product (protected)",
    productId: req.params.id,
    user: {
      adminId: (req as any).adminId,
      email: (req as any).email,
      role: (req as any).role,
    },
  });
});

// Bulk delete products endpoint (admin only)
router.post("/products/bulk-delete", adminOnly, async (req, res) => {
  res.status(200).json({
    success: true,
    message: "POST /api/admin/products/bulk-delete - Bulk delete (admin only)",
    user: {
      adminId: (req as any).adminId,
      email: (req as any).email,
      role: (req as any).role,
    },
  });
});

/**
 * ============================================================================
 * CATEGORY ADMIN ROUTES
 * ============================================================================
 * POST   /api/admin/categories        - Create category (admin/editor)
 * PUT    /api/admin/categories/:id    - Update category (admin/editor)
 * DELETE /api/admin/categories/:id    - Delete category (admin/editor)
 */

// Category create endpoint (editor+)
router.post("/categories", editorOrAdmin, async (req, res) => {
  res.status(200).json({
    success: true,
    message: "POST /api/admin/categories - Create category (protected)",
    user: {
      adminId: (req as any).adminId,
      email: (req as any).email,
      role: (req as any).role,
    },
  });
});

// Category update endpoint (editor+)
router.put("/categories/:id", editorOrAdmin, async (req, res) => {
  res.status(200).json({
    success: true,
    message: "PUT /api/admin/categories/:id - Update category (protected)",
    categoryId: req.params.id,
    user: {
      adminId: (req as any).adminId,
      email: (req as any).email,
      role: (req as any).role,
    },
  });
});

// Category delete endpoint (editor+)
router.delete("/categories/:id", editorOrAdmin, async (req, res) => {
  res.status(200).json({
    success: true,
    message: "DELETE /api/admin/categories/:id - Delete category (protected)",
    categoryId: req.params.id,
    user: {
      adminId: (req as any).adminId,
      email: (req as any).email,
      role: (req as any).role,
    },
  });
});

/**
 * ============================================================================
 * ADMIN PROFILE ROUTES
 * ============================================================================
 * GET    /api/admin/profile          - Get current admin profile (all roles)
 * PUT    /api/admin/profile          - Update own profile (all roles)
 * GET    /api/admin/profile/activity - Get admin activity log (admin only)
 */

// Get current admin profile (any authenticated admin)
router.get("/profile", async (req, res) => {
  res.status(200).json({
    success: true,
    message: "GET /api/admin/profile - Current admin profile",
    user: {
      adminId: (req as any).adminId,
      email: (req as any).email,
      role: (req as any).role,
    },
  });
});

// Update own profile (any authenticated admin)
router.put("/profile", async (req, res) => {
  res.status(200).json({
    success: true,
    message: "PUT /api/admin/profile - Update profile (protected)",
    user: {
      adminId: (req as any).adminId,
      email: (req as any).email,
      role: (req as any).role,
    },
  });
});

// Get admin activity log (admin only)
router.get("/profile/activity", adminOnly, async (req, res) => {
  res.status(200).json({
    success: true,
    message: "GET /api/admin/profile/activity - Admin activity log (admin only)",
    user: {
      adminId: (req as any).adminId,
      email: (req as any).email,
      role: (req as any).role,
    },
  });
});

/**
 * ============================================================================
 * ADMIN MANAGEMENT ROUTES (admin only)
 * ============================================================================
 * GET    /api/admin/admins            - List all admins (admin only)
 * POST   /api/admin/admins            - Create new admin (admin only)
 * PUT    /api/admin/admins/:id        - Update admin (admin only)
 * DELETE /api/admin/admins/:id        - Deactivate admin (admin only)
 */

// List all admins (admin only)
router.get("/admins", adminOnly, async (req, res) => {
  res.status(200).json({
    success: true,
    message: "GET /api/admin/admins - List all admins (admin only)",
    user: {
      adminId: (req as any).adminId,
      email: (req as any).email,
      role: (req as any).role,
    },
  });
});

// Create new admin (admin only)
router.post("/admins", adminOnly, async (req, res) => {
  res.status(200).json({
    success: true,
    message: "POST /api/admin/admins - Create new admin (admin only)",
    user: {
      adminId: (req as any).adminId,
      email: (req as any).email,
      role: (req as any).role,
    },
  });
});

// Update admin (admin only)
router.put("/admins/:id", adminOnly, async (req, res) => {
  res.status(200).json({
    success: true,
    message: "PUT /api/admin/admins/:id - Update admin (admin only)",
    adminId: req.params.id,
    user: {
      adminId: (req as any).adminId,
      email: (req as any).email,
      role: (req as any).role,
    },
  });
});

// Deactivate admin (admin only)
router.delete("/admins/:id", adminOnly, async (req, res) => {
  res.status(200).json({
    success: true,
    message: "DELETE /api/admin/admins/:id - Deactivate admin (admin only)",
    adminId: req.params.id,
    user: {
      adminId: (req as any).adminId,
      email: (req as any).email,
      role: (req as any).role,
    },
  });
});

/**
 * ============================================================================
 * ANALYTICS & STATISTICS ROUTES
 * ============================================================================
 * GET    /api/admin/stats/overview    - Dashboard overview stats (editor+)
 * GET    /api/admin/stats/products    - Product statistics (editor+)
 * GET    /api/admin/stats/orders      - Order statistics (editor+)
 */

// Dashboard overview stats (editor+)
router.get("/stats/overview", editorOrAdmin, async (req, res) => {
  res.status(200).json({
    success: true,
    message: "GET /api/admin/stats/overview - Dashboard overview",
    user: {
      adminId: (req as any).adminId,
      email: (req as any).email,
      role: (req as any).role,
    },
  });
});

// Product statistics (editor+)
router.get("/stats/products", editorOrAdmin, async (req, res) => {
  res.status(200).json({
    success: true,
    message: "GET /api/admin/stats/products - Product statistics",
    user: {
      adminId: (req as any).adminId,
      email: (req as any).email,
      role: (req as any).role,
    },
  });
});

// Order statistics (editor+)
router.get("/stats/orders", editorOrAdmin, async (req, res) => {
  res.status(200).json({
    success: true,
    message: "GET /api/admin/stats/orders - Order statistics",
    user: {
      adminId: (req as any).adminId,
      email: (req as any).email,
      role: (req as any).role,
    },
  });
});

export default router;
