// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "customer";
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthPayload {
  sub: string;
  email: string;
  name: string;
  role: "admin" | "customer";
  iat: number;
  exp: number;
}

// Product Types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  stock: number;
  sku: string;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  stock: number;
  sku: string;
  featured?: boolean;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {}

// Category Types
export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  productCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCategoryRequest {
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {}

// Error Types
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export interface ValidationError {
  field: string;
  message: string;
}
