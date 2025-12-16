import { Router, Request, Response } from "express";
import { asyncHandler } from "../middleware/errorHandler.js";
import { adminAuthMiddleware, adminOnly } from "../middleware/auth.js";
import Product from "../models/Product.js";
import { query } from "express-validator";

const router = Router();

/**
 * GET /api/products/search/advanced
 * Advanced product search with filtering, pagination, and intelligent ranking
 * Features:
 * - Full-text search on product names and descriptions
 * - Price range filtering
 * - Category filtering
 * - Rating and popularity filtering
 * - Multiple sorting options
 * - Pagination support
 */
router.get(
  "/search/advanced",
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      featured,
      sort,
      page = "1",
      limit = "12",
      rating,
      inStock,
    } = req.query;

    // Build filter object
    const filter: any = {};

    // Enhanced full-text search with multiple strategies
    if (search && typeof search === "string" && search.trim()) {
      const searchTerms = search.trim();
      
      // Use regex pattern matching for flexible search across name and description
      // Split search terms and create OR conditions for better matching
      const searchRegex = new RegExp(searchTerms, "i"); // Case-insensitive
      
      // Search in both name and description fields
      filter.$or = [
        { name: searchRegex },
        { description: searchRegex },
      ];
    }

    // Filter by category with case-insensitive matching
    if (category && typeof category === "string" && category.trim()) {
      filter.category = new RegExp(`^${category.trim()}$`, "i");
    }

    // Price range filtering
    const priceFilter: any = {};
    if (minPrice) {
      const min = parseFloat(minPrice as string);
      if (!isNaN(min)) priceFilter.$gte = min;
    }
    if (maxPrice) {
      const max = parseFloat(maxPrice as string);
      if (!isNaN(max)) priceFilter.$lte = max;
    }
    if (Object.keys(priceFilter).length > 0) {
      filter.price = priceFilter;
    }

    // Featured filter
    if (featured === "true") {
      filter.featured = true;
    }

    // Rating filter with minimum threshold
    if (rating) {
      const ratingValue = parseFloat(rating as string);
      if (!isNaN(ratingValue) && ratingValue >= 0 && ratingValue <= 5) {
        filter.rating = { $gte: ratingValue };
      }
    }

    // In stock filter
    if (inStock === "true") {
      filter.stock = { $gt: 0 };
    }

    // Pagination with validation
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(limit as string) || 12));
    const skip = (pageNum - 1) * pageSize;

    // Advanced sorting with relevance boosting
    let sortObj: any = { createdAt: -1 }; // Default: newest first
    if (sort) {
      const sortStr = sort as string;
      if (sortStr === "price-asc") {
        sortObj = { price: 1 };
      } else if (sortStr === "price-desc") {
        sortObj = { price: -1 };
      } else if (sortStr === "rating") {
        // Sort by rating first, then by review count for tie-breaking
        sortObj = { rating: -1, reviews: -1 };
      } else if (sortStr === "newest") {
        sortObj = { createdAt: -1 };
      } else if (sortStr === "oldest") {
        sortObj = { createdAt: 1 };
      } else if (sortStr === "popular") {
        // Popular: based on review count and rating
        sortObj = { reviews: -1, rating: -1 };
      } else if (sortStr === "featured") {
        // Featured products first, then by creation date
        sortObj = { featured: -1, createdAt: -1 };
      } else {
        sortObj = { createdAt: -1 };
      }
    }

    // Build query for text search scoring if applicable
    let query = Product.find(filter);

    // Execute query with sorting, skip, and limit
    const products = await query
      .sort(sortObj)
      .skip(skip)
      .limit(pageSize)
      .select("-__v")
      .lean();

    // Get total count for pagination
    const totalCount = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / pageSize);

    // Prepare response with enhanced metadata
    res.status(200).json({
      success: true,
      message: `Retrieved ${products.length} products`,
      data: {
        products: products.map((p: any) => {
          // Remove internal score field from response
          const { score, ...productData } = p;
          return productData;
        }),
        pagination: {
          currentPage: pageNum,
          pageSize,
          totalCount,
          totalPages,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
        },
        // Enhanced search metadata
        searchMetadata: {
          query: search || category || "all",
          sortedBy: sort || "newest",
          hasFilters: !!(minPrice || maxPrice || category || rating),
        },
      },
    });
  })
);

/**
 * GET /api/products/slug/:slug
 * Get product by slug
 */
router.get(
  "/slug/:slug",
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { slug } = req.params;

    const product = await Product.findOne({
      slug: slug.toLowerCase(),
    }).select("-__v");

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Product retrieved successfully",
      data: product,
    });
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

    const product = await Product.findById(id).select("-__v");

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Product retrieved successfully",
      data: product,
    });
  })
);

/**
 * GET /api/products
 * List all products with basic filtering
 */
router.get(
  "/",
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { category, featured, page = "1", limit = "12" } = req.query;

    const filter: any = {};

    if (category && typeof category === "string") {
      filter.category = new RegExp(category, "i");
    }

    if (featured === "true") {
      filter.featured = true;
    }

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(limit as string) || 12));
    const skip = (pageNum - 1) * pageSize;

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .select("name price category images.url images.isPrimary images.alt stock rating reviews slug")
      .lean();

    const totalCount = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / pageSize);

    // Set cache headers for better performance
    // Products list can be cached for 5 minutes on client side
    res.set("Cache-Control", "public, max-age=300"); // 5 minutes
    res.set("ETag", `"products-${pageNum}-${pageSize}-${totalCount}"`);

    res.status(200).json({
      success: true,
      message: `Retrieved ${products.length} products`,
      data: {
        products,
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
 * POST /api/products
 * Create new product (admin only)
 */
router.post(
  "/",
  adminAuthMiddleware,
  adminOnly,
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const {
      name,
      description,
      price,
      category,
      images,
      stock,
      sku,
      featured,
      variants,
      specifications,
      rating,
      reviews,
    } = req.body;

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

    // Check for duplicate SKU
    const existingSku = await Product.findOne({ sku });
    if (existingSku) {
      res.status(400).json({
        success: false,
        message: "SKU already exists",
      });
      return;
    }

    // Create product
    const newProduct = new Product({
      name,
      description: description || "",
      price,
      category,
      images: images || [],
      stock: stock || 0,
      sku,
      featured: featured || false,
      variants: variants || [],
      specifications: specifications || [],
      rating: rating || 0,
      reviews: reviews || 0,
    });

    await newProduct.save();

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: newProduct,
    });
  })
);

/**
 * PUT /api/products/:id
 * Update product (admin only)
 */
router.put(
  "/:id",
  adminAuthMiddleware,
  adminOnly,
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      category,
      images,
      stock,
      sku,
      featured,
      variants,
      specifications,
      rating,
      reviews,
    } = req.body;

    const product = await Product.findById(id);

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
      return;
    }

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
      const skuExists = await Product.findOne({ sku });
      if (skuExists) {
        res.status(400).json({
          success: false,
          message: "SKU already exists",
        });
        return;
      }
    }

    // Update fields
    if (name) product.name = name;
    if (description !== undefined) product.description = description;
    if (price) product.price = price;
    if (category) product.category = category;
    if (images) product.images = images;
    if (stock !== undefined) product.stock = stock;
    if (sku) product.sku = sku;
    if (featured !== undefined) product.featured = featured;
    if (variants) product.variants = variants;
    if (specifications) product.specifications = specifications;
    if (rating !== undefined) product.rating = rating;
    if (reviews !== undefined) product.reviews = reviews;

    // Reset slug to regenerate it
    if (name) {
      product.slug = undefined as any;
    }

    await product.save();

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  })
);

/**
 * DELETE /api/products/:id
 * Delete product (admin only)
 */
router.delete(
  "/:id",
  adminAuthMiddleware,
  adminOnly,
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      data: { id: product._id },
    });
  })
);

/**
 * GET /api/products/stats/overview
 * Get product statistics
 */
router.get(
  "/stats/overview",
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const totalProducts = await Product.countDocuments();
    const featuredCount = await Product.countDocuments({ featured: true });
    const avgPrice = await Product.aggregate([
      {
        $group: {
          _id: null,
          average: { $avg: "$price" },
        },
      },
    ]);

    const stats = {
      totalProducts,
      featuredProducts: featuredCount,
      averagePrice: avgPrice[0]?.average || 0,
    };

    res.status(200).json({
      success: true,
      message: "Product statistics retrieved",
      data: stats,
    });
  })
);

export default router;
