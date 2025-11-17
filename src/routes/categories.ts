import { Router, Request, Response } from "express";
import { asyncHandler } from "../middleware/errorHandler.js";
import { ApiResponse, Category, CreateCategoryRequest } from "../types/index.js";

const router = Router();

// In-memory database (replace with MongoDB later)
interface CategoryStore {
  [key: string]: Category;
}

const categories: CategoryStore = {
  "cat-1": {
    id: "cat-1",
    name: "Sofas & Couches",
    description: "Modern and classic sofas for every space",
    icon: "🛋️",
    color: "from-rose-500 to-pink-500",
    productCount: 24,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  "cat-2": {
    id: "cat-2",
    name: "Beds & Mattresses",
    description: "Comfortable beds and premium mattresses",
    icon: "🛏️",
    color: "from-blue-500 to-cyan-500",
    productCount: 18,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  "cat-3": {
    id: "cat-3",
    name: "Chairs & Recliners",
    description: "Ergonomic and stylish chairs",
    icon: "🪑",
    color: "from-green-500 to-emerald-500",
    productCount: 32,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  "cat-4": {
    id: "cat-4",
    name: "Tables & Desks",
    description: "Functional tables and work desks",
    icon: "💼",
    color: "from-purple-500 to-violet-500",
    productCount: 15,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  "cat-5": {
    id: "cat-5",
    name: "Storage Solutions",
    description: "Cabinets, shelves, and organization",
    icon: "🗄️",
    color: "from-indigo-500 to-blue-500",
    productCount: 28,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  "cat-6": {
    id: "cat-6",
    name: "Lighting",
    description: "Lamps, chandeliers, and ambient lighting",
    icon: "💡",
    color: "from-yellow-500 to-orange-500",
    productCount: 22,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
};

/**
 * GET /api/categories
 * Get all categories
 */
router.get(
  "/",
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const categoryList = Object.values(categories).sort(
      (a, b) => b.productCount - a.productCount
    );

    const response: ApiResponse<Category[]> = {
      success: true,
      message: `Retrieved ${categoryList.length} categories`,
      data: categoryList,
    };

    res.status(200).json(response);
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
    const category = categories[id];

    if (!category) {
      res.status(404).json({
        success: false,
        message: "Category not found",
      });
      return;
    }

    const response: ApiResponse<Category> = {
      success: true,
      message: "Category retrieved successfully",
      data: category,
    };

    res.status(200).json(response);
  })
);

/**
 * POST /api/categories
 * Create new category (admin only)
 */
router.post(
  "/",
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { name, description, icon, color } =
      req.body as CreateCategoryRequest;

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

    if (description && description.length > 200) {
      res.status(400).json({
        success: false,
        message: "Description must be less than 200 characters",
      });
      return;
    }

    // Check for duplicate name
    const nameExists = Object.values(categories).some(
      (c) => c.name.toLowerCase() === name.toLowerCase()
    );
    if (nameExists) {
      res.status(400).json({
        success: false,
        message: "Category with this name already exists",
      });
      return;
    }

    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      name,
      description: description || "",
      icon,
      color,
      productCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    categories[newCategory.id] = newCategory;

    const response: ApiResponse<Category> = {
      success: true,
      message: "Category created successfully",
      data: newCategory,
    };

    res.status(201).json(response);
  })
);

/**
 * PUT /api/categories/:id
 * Update category (admin only)
 */
router.put(
  "/:id",
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const category = categories[id];

    if (!category) {
      res.status(404).json({
        success: false,
        message: "Category not found",
      });
      return;
    }

    const { name, description, icon, color } = req.body;

    // Validate name if provided
    if (name) {
      if (name.length < 2 || name.length > 50) {
        res.status(400).json({
          success: false,
          message: "Category name must be between 2 and 50 characters",
        });
        return;
      }

      // Check for duplicate name
      const nameExists = Object.values(categories).some(
        (c) => c.name.toLowerCase() === name.toLowerCase() && c.id !== id
      );
      if (nameExists) {
        res.status(400).json({
          success: false,
          message: "Category with this name already exists",
        });
        return;
      }
    }

    // Validate description if provided
    if (description && description.length > 200) {
      res.status(400).json({
        success: false,
        message: "Description must be less than 200 characters",
      });
      return;
    }

    // Update fields
    const updatedCategory: Category = {
      ...category,
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(icon && { icon }),
      ...(color && { color }),
      updatedAt: new Date(),
    };

    categories[id] = updatedCategory;

    const response: ApiResponse<Category> = {
      success: true,
      message: "Category updated successfully",
      data: updatedCategory,
    };

    res.status(200).json(response);
  })
);

/**
 * DELETE /api/categories/:id
 * Delete category (admin only)
 */
router.delete(
  "/:id",
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    if (!categories[id]) {
      res.status(404).json({
        success: false,
        message: "Category not found",
      });
      return;
    }

    delete categories[id];

    const response: ApiResponse = {
      success: true,
      message: "Category deleted successfully",
    };

    res.status(200).json(response);
  })
);

/**
 * PATCH /api/categories/:id/product-count
 * Update product count for category
 */
router.patch(
  "/:id/product-count",
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { count } = req.body;

    const category = categories[id];

    if (!category) {
      res.status(404).json({
        success: false,
        message: "Category not found",
      });
      return;
    }

    if (typeof count !== "number" || count < 0) {
      res.status(400).json({
        success: false,
        message: "Count must be a non-negative number",
      });
      return;
    }

    category.productCount = count;
    category.updatedAt = new Date();

    const response: ApiResponse<Category> = {
      success: true,
      message: "Category product count updated",
      data: category,
    };

    res.status(200).json(response);
  })
);

export default router;
