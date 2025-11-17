import { Router, Request, Response } from "express";
import { asyncHandler } from "../middleware/errorHandler.js";
import { adminAuthMiddleware, adminOnly } from "../middleware/auth.js";
import Category from "../models/Category.js";
import Product from "../models/Product.js";

const router = Router();

/**
 * GET /api/categories/slug/:slug
 * Get category by slug
 */
router.get(
  "/slug/:slug",
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { slug } = req.params;

    const category = await Category.findOne({
      slug: slug.toLowerCase(),
    }).select("-__v");

    if (!category) {
      res.status(404).json({
        success: false,
        message: "Category not found",
      });
      return;
    }

    // Get product count for this category
    const productCount = await Product.countDocuments({
      category: category.name,
    });

    const response = {
      ...category.toObject(),
      productCount,
    };

    res.status(200).json({
      success: true,
      message: "Category retrieved successfully",
      data: response,
    });
  })
);

/**
 * GET /api/categories/:id
 * Get category by ID
 */
router.get(
  "/:id",
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    const category = await Category.findById(id).select("-__v");

    if (!category) {
      res.status(404).json({
        success: false,
        message: "Category not found",
      });
      return;
    }

    // Get product count for this category
    const productCount = await Product.countDocuments({
      category: category.name,
    });

    const response = {
      ...category.toObject(),
      productCount,
    };

    res.status(200).json({
      success: true,
      message: "Category retrieved successfully",
      data: response,
    });
  })
);

/**
 * GET /api/categories
 * Get all categories with optional sorting and search
 */
router.get(
  "/",
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { sort, search, page = "1", limit = "20" } = req.query;

    const filter: any = {};

    // Search by name
    if (search && typeof search === "string") {
      filter.$or = [
        { name: new RegExp(search, "i") },
        { description: new RegExp(search, "i") },
      ];
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(limit as string) || 20));
    const skip = (pageNum - 1) * pageSize;

    // Sorting
    let sortObj: any = { createdAt: -1 }; // Default: newest first
    if (sort) {
      const sortStr = sort as string;
      if (sortStr === "name-asc") sortObj = { name: 1 };
      else if (sortStr === "name-desc") sortObj = { name: -1 };
      else if (sortStr === "newest") sortObj = { createdAt: -1 };
      else if (sortStr === "oldest") sortObj = { createdAt: 1 };
    }

    // Get categories
    const categories = await Category.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(pageSize)
      .select("-__v");

    // Enrich with product counts
    const enrichedCategories = await Promise.all(
      categories.map(async (category) => {
        const productCount = await Product.countDocuments({
          category: category.name,
        });
        return {
          ...category.toObject(),
          productCount,
        };
      })
    );

    const totalCount = await Category.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / pageSize);

    res.status(200).json({
      success: true,
      message: `Retrieved ${enrichedCategories.length} categories`,
      data: {
        categories: enrichedCategories,
        pagination: {
          currentPage: pageNum,
          pageSize,
          totalCount,
          totalPages,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
        },
      },
    });
  })
);

/**
 * POST /api/categories
 * Create new category (admin only)
 */
router.post(
  "/",
  adminAuthMiddleware,
  adminOnly,
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { name, description, icon, color } = req.body;

    // Validation
    if (!name || !icon || !color) {
      res.status(400).json({
        success: false,
        message: "Missing required fields: name, icon, color",
      });
      return;
    }

    if (name.length < 2 || name.length > 50) {
      res.status(400).json({
        success: false,
        message: "Category name must be between 2 and 50 characters",
      });
      return;
    }

    if (description && description.length > 500) {
      res.status(400).json({
        success: false,
        message: "Description cannot exceed 500 characters",
      });
      return;
    }

    // Validate color format
    if (!color.includes("from-") || !color.includes("to-")) {
      res.status(400).json({
        success: false,
        message: "Color must be a valid Tailwind gradient format (e.g., 'from-red-500 to-pink-500')",
      });
      return;
    }

    // Check for duplicate name
    const existingCategory = await Category.findOne({
      name: new RegExp(`^${name}$`, "i"),
    });

    if (existingCategory) {
      res.status(400).json({
        success: false,
        message: "Category with this name already exists",
      });
      return;
    }

    // Create category
    const newCategory = new Category({
      name,
      description: description || "",
      icon,
      color,
      productCount: 0,
    });

    await newCategory.save();

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: {
        ...newCategory.toObject(),
        productCount: 0,
      },
    });
  })
);

/**
 * PUT /api/categories/:id
 * Update category (admin only)
 */
router.put(
  "/:id",
  adminAuthMiddleware,
  adminOnly,
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { name, description, icon, color } = req.body;

    const category = await Category.findById(id);

    if (!category) {
      res.status(404).json({
        success: false,
        message: "Category not found",
      });
      return;
    }

    // Validate name if provided
    if (name) {
      if (name.length < 2 || name.length > 50) {
        res.status(400).json({
          success: false,
          message: "Category name must be between 2 and 50 characters",
        });
        return;
      }

      // Check for duplicate name (excluding current category)
      const nameExists = await Category.findOne({
        _id: { $ne: id },
        name: new RegExp(`^${name}$`, "i"),
      });

      if (nameExists) {
        res.status(400).json({
          success: false,
          message: "Category with this name already exists",
        });
        return;
      }
    }

    // Validate description if provided
    if (description !== undefined && description.length > 500) {
      res.status(400).json({
        success: false,
        message: "Description cannot exceed 500 characters",
      });
      return;
    }

    // Validate color if provided
    if (color) {
      if (!color.includes("from-") || !color.includes("to-")) {
        res.status(400).json({
          success: false,
          message: "Color must be a valid Tailwind gradient format",
        });
        return;
      }
    }

    // Update fields
    if (name) {
      category.name = name;
      category.slug = undefined as any; // Reset slug to regenerate
    }
    if (description !== undefined) category.description = description;
    if (icon) category.icon = icon;
    if (color) category.color = color;

    await category.save();

    // Get product count
    const productCount = await Product.countDocuments({
      category: category.name,
    });

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: {
        ...category.toObject(),
        productCount,
      },
    });
  })
);

/**
 * DELETE /api/categories/:id
 * Delete category (admin only)
 */
router.delete(
  "/:id",
  adminAuthMiddleware,
  adminOnly,
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    const category = await Category.findById(id);

    if (!category) {
      res.status(404).json({
        success: false,
        message: "Category not found",
      });
      return;
    }

    // Check if category has products
    const productCount = await Product.countDocuments({
      category: category.name,
    });

    if (productCount > 0) {
      res.status(400).json({
        success: false,
        message: `Cannot delete category with ${productCount} product(s). Please reassign or delete products first.`,
      });
      return;
    }

    await Category.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
      data: { id: category._id },
    });
  })
);

/**
 * GET /api/categories/stats/overview
 * Get category statistics
 */
router.get(
  "/stats/overview",
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const totalCategories = await Category.countDocuments();

    // Get categories with product count
    const categories = await Category.find().select("name");

    const categoryStats = await Promise.all(
      categories.map(async (category) => {
        const productCount = await Product.countDocuments({
          category: category.name,
        });
        return {
          name: category.name,
          productCount,
        };
      })
    );

    const totalProducts = categoryStats.reduce((sum, cat) => sum + cat.productCount, 0);

    res.status(200).json({
      success: true,
      message: "Category statistics retrieved",
      data: {
        totalCategories,
        totalProducts,
        categories: categoryStats.sort((a, b) => b.productCount - a.productCount),
      },
    });
  })
);

/**
 * PATCH /api/categories/:id/product-count
 * Update product count for category (internal use)
 */
router.patch(
  "/:id/product-count",
  adminAuthMiddleware,
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    const category = await Category.findById(id);

    if (!category) {
      res.status(404).json({
        success: false,
        message: "Category not found",
      });
      return;
    }

    // Auto-calculate product count
    const productCount = await Product.countDocuments({
      category: category.name,
    });

    category.productCount = productCount;
    await category.save();

    res.status(200).json({
      success: true,
      message: "Product count updated successfully",
      data: {
        ...category.toObject(),
        productCount,
      },
    });
  })
);

export default router;
