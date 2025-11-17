import { Router, Request, Response } from "express";
import { asyncHandler } from "../middleware/errorHandler.js";
import { ApiResponse, Product, CreateProductRequest } from "../types/index.js";

const router = Router();

// In-memory database (replace with MongoDB later)
interface ProductStore {
  [key: string]: Product;
}

const products: ProductStore = {
  "prod-1": {
    id: "prod-1",
    name: "Modern Leather Sofa",
    description: "Premium black leather sofa with modern design",
    price: 1299,
    category: "Sofas",
    image: "🛋️",
    stock: 12,
    sku: "SOFA-001",
    featured: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  "prod-2": {
    id: "prod-2",
    name: "Wooden Dining Chair",
    description: "Classic wooden dining chair with cushion",
    price: 249,
    category: "Chairs",
    image: "🪑",
    stock: 45,
    sku: "CHAIR-001",
    featured: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  "prod-3": {
    id: "prod-3",
    name: "Platform Bed Frame",
    description: "Modern platform bed frame with storage",
    price: 699,
    category: "Beds",
    image: "🛏️",
    stock: 8,
    sku: "BED-001",
    featured: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
};

/**
 * GET /api/products
 * Get all products with optional filtering
 */
router.get(
  "/",
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { category, featured, search } = req.query;

    let productList = Object.values(products);

    // Filter by category
    if (category && typeof category === "string") {
      productList = productList.filter((p) =>
        p.category.toLowerCase().includes(category.toLowerCase())
      );
    }

    // Filter by featured
    if (featured === "true") {
      productList = productList.filter((p) => p.featured);
    }

    // Search by name or SKU
    if (search && typeof search === "string") {
      productList = productList.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.sku.toLowerCase().includes(search.toLowerCase())
      );
    }

    const response: ApiResponse<Product[]> = {
      success: true,
      message: `Retrieved ${productList.length} products`,
      data: productList,
    };

    res.status(200).json(response);
  })
);

/**
 * GET /api/products/:id
 * Get product by ID
 */
router.get(
  "/:id",
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const product = products[id];

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
      return;
    }

    const response: ApiResponse<Product> = {
      success: true,
      message: "Product retrieved successfully",
      data: product,
    };

    res.status(200).json(response);
  })
);

/**
 * POST /api/products
 * Create new product (admin only)
 */
router.post(
  "/",
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { name, description, price, category, image, stock, sku, featured } =
      req.body as CreateProductRequest;

    // Validation
    if (!name || !price || !category || !sku) {
      res.status(400).json({
        success: false,
        message: "Missing required fields: name, price, category, sku",
      });
      return;
    }

    if (typeof price !== "number" || price <= 0) {
      res.status(400).json({
        success: false,
        message: "Price must be a positive number",
      });
      return;
    }

    if (typeof stock !== "number" || stock < 0) {
      res.status(400).json({
        success: false,
        message: "Stock must be a non-negative number",
      });
      return;
    }

    // Check for duplicate SKU
    const skuExists = Object.values(products).some((p) => p.sku === sku);
    if (skuExists) {
      res.status(400).json({
        success: false,
        message: "SKU already exists",
      });
      return;
    }

    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      name,
      description: description || "",
      price,
      category,
      image: image || "📦",
      stock: stock || 0,
      sku,
      featured: featured || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    products[newProduct.id] = newProduct;

    const response: ApiResponse<Product> = {
      success: true,
      message: "Product created successfully",
      data: newProduct,
    };

    res.status(201).json(response);
  })
);

/**
 * PUT /api/products/:id
 * Update product (admin only)
 */
router.put(
  "/:id",
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const product = products[id];

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
      return;
    }

    const { name, description, price, category, image, stock, sku, featured } =
      req.body;

    // Validate price if provided
    if (price !== undefined) {
      if (typeof price !== "number" || price <= 0) {
        res.status(400).json({
          success: false,
          message: "Price must be a positive number",
        });
        return;
      }
    }

    // Validate stock if provided
    if (stock !== undefined) {
      if (typeof stock !== "number" || stock < 0) {
        res.status(400).json({
          success: false,
          message: "Stock must be a non-negative number",
        });
        return;
      }
    }

    // Check for duplicate SKU (if SKU is being changed)
    if (sku && sku !== product.sku) {
      const skuExists = Object.values(products).some((p) => p.sku === sku);
      if (skuExists) {
        res.status(400).json({
          success: false,
          message: "SKU already exists",
        });
        return;
      }
    }

    // Update fields
    const updatedProduct: Product = {
      ...product,
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(price && { price }),
      ...(category && { category }),
      ...(image && { image }),
      ...(stock !== undefined && { stock }),
      ...(sku && { sku }),
      ...(featured !== undefined && { featured }),
      updatedAt: new Date(),
    };

    products[id] = updatedProduct;

    const response: ApiResponse<Product> = {
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    };

    res.status(200).json(response);
  })
);

/**
 * DELETE /api/products/:id
 * Delete product (admin only)
 */
router.delete(
  "/:id",
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    if (!products[id]) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
      return;
    }

    delete products[id];

    const response: ApiResponse = {
      success: true,
      message: "Product deleted successfully",
    };

    res.status(200).json(response);
  })
);

/**
 * GET /api/products/stats/overview
 * Get product statistics
 */
router.get(
  "/stats/overview",
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const productList = Object.values(products);

    const stats = {
      total: productList.length,
      featured: productList.filter((p) => p.featured).length,
      lowStock: productList.filter((p) => p.stock > 0 && p.stock <= 10).length,
      outOfStock: productList.filter((p) => p.stock === 0).length,
      totalValue: productList.reduce((sum, p) => sum + p.price * p.stock, 0),
      categories: Array.from(new Set(productList.map((p) => p.category))).length,
    };

    const response: ApiResponse = {
      success: true,
      message: "Product statistics retrieved",
      data: stats,
    };

    res.status(200).json(response);
  })
);

export default router;
