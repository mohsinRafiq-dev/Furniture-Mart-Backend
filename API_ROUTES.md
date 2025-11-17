# Ashraf Furnitures - API Documentation

## Base URL

```
http://localhost:5000/api
```

## Health & Info Endpoints

### Health Check

```
GET /health
```

Returns basic server health status.

**Response:**

```json
{
  "success": true,
  "message": "Server is running",
  "data": {
    "status": "operational",
    "timestamp": "2025-11-17T10:30:00.000Z",
    "environment": "development",
    "uptime": 123.45,
    "version": "1.0.0"
  }
}
```

### API Info

```
GET /info
```

Returns complete API documentation and available endpoints.

---

## Products API

### List All Products

```
GET /products
```

**Query Parameters:**

- `category` (string) - Filter by category name
- `featured` (boolean) - Filter by featured status
- `search` (string) - Search by product name or SKU

**Example:**

```
GET /products?category=Sofas&featured=true&search=leather
```

**Response:**

```json
{
  "success": true,
  "message": "Retrieved 3 products",
  "data": [
    {
      "id": "prod-1",
      "name": "Modern Leather Sofa",
      "description": "Premium black leather sofa with modern design",
      "price": 1299,
      "category": "Sofas",
      "image": "🛋️",
      "stock": 12,
      "sku": "SOFA-001",
      "featured": true,
      "createdAt": "2025-11-17T10:00:00.000Z",
      "updatedAt": "2025-11-17T10:00:00.000Z"
    }
  ]
}
```

### Get Single Product

```
GET /products/:id
```

**Response:**

```json
{
  "success": true,
  "message": "Product retrieved successfully",
  "data": {
    "id": "prod-1",
    "name": "Modern Leather Sofa",
    ...
  }
}
```

### Create Product

```
POST /products
```

**Headers:**

```
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "name": "Modern Leather Sofa",
  "description": "Premium black leather sofa",
  "price": 1299,
  "category": "Sofas",
  "image": "🛋️",
  "stock": 12,
  "sku": "SOFA-001",
  "featured": true
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "Product created successfully",
  "data": { ... }
}
```

### Update Product

```
PUT /products/:id
```

**Request Body:** (all fields optional)

```json
{
  "name": "Updated Name",
  "price": 1399,
  "stock": 15
}
```

**Response:**

```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": { ... }
}
```

### Delete Product

```
DELETE /products/:id
```

**Response:**

```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

### Product Statistics

```
GET /products/stats/overview
```

**Response:**

```json
{
  "success": true,
  "message": "Product statistics retrieved",
  "data": {
    "total": 100,
    "featured": 15,
    "lowStock": 8,
    "outOfStock": 2,
    "totalValue": 125000,
    "categories": 8
  }
}
```

---

## Categories API

### List All Categories

```
GET /categories
```

**Response:**

```json
{
  "success": true,
  "message": "Retrieved 6 categories",
  "data": [
    {
      "id": "cat-1",
      "name": "Sofas & Couches",
      "description": "Modern and classic sofas",
      "icon": "🛋️",
      "color": "from-rose-500 to-pink-500",
      "productCount": 24,
      "createdAt": "2025-11-17T10:00:00.000Z",
      "updatedAt": "2025-11-17T10:00:00.000Z"
    }
  ]
}
```

### Get Single Category

```
GET /categories/:id
```

**Response:**

```json
{
  "success": true,
  "message": "Category retrieved successfully",
  "data": { ... }
}
```

### Create Category

```
POST /categories
```

**Request Body:**

```json
{
  "name": "Office Furniture",
  "description": "Modern office desks and chairs",
  "icon": "💼",
  "color": "from-purple-500 to-violet-500"
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "Category created successfully",
  "data": { ... }
}
```

### Update Category

```
PUT /categories/:id
```

**Request Body:** (all fields optional)

```json
{
  "name": "Updated Name",
  "icon": "🪑",
  "color": "from-green-500 to-emerald-500"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Category updated successfully",
  "data": { ... }
}
```

### Delete Category

```
DELETE /categories/:id
```

**Response:**

```json
{
  "success": true,
  "message": "Category deleted successfully"
}
```

### Update Product Count

```
PATCH /categories/:id/product-count
```

**Request Body:**

```json
{
  "count": 30
}
```

**Response:**

```json
{
  "success": true,
  "message": "Category product count updated",
  "data": { ... }
}
```

---

## Error Handling

### 400 Bad Request

```json
{
  "success": false,
  "message": "Missing required fields: name, price, category, sku"
}
```

### 404 Not Found

```json
{
  "success": false,
  "message": "Product not found"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Standard Response Format

All API responses follow this format:

```json
{
  "success": boolean,
  "message": "Human readable message",
  "data": any,
  "error": "Optional error details (development only)"
}
```

---

## Middleware Stack

1. **Helmet** - Secure HTTP headers
2. **CORS** - Cross-origin requests from http://localhost:3002
3. **Body Parser** - JSON (10MB limit)
4. **Morgan** - HTTP request logging with colored output
5. **Error Handler** - Global error handling middleware

---

## Running the Server

```bash
# Development (with auto-reload)
npm run dev

# Production build
npm run build
npm start
```

The server will start on `http://localhost:5000`

---

## Environment Variables

Create a `.env` file in the backend directory:

```env
NODE_ENV=development
PORT=5000
CORS_ORIGIN=http://localhost:3002
JWT_SECRET=your_secret_key_here
JWT_EXPIRATION=24h
DB_URI=mongodb://localhost:27017/furniture-mart
```

---

## TODO - Coming Soon

- [ ] MongoDB integration (replace in-memory store)
- [ ] JWT authentication routes
- [ ] Orders API
- [ ] Users API
- [ ] Payment integration
- [ ] Image upload handling
- [ ] Database migrations
