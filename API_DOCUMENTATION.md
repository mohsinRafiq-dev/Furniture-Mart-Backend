# Furniture Mart Backend API Documentation

## Overview

Express.js backend server for Ashraf Furnitures e-commerce platform. Built with TypeScript, featuring CORS, JWT authentication, comprehensive error handling, and a modular middleware stack.

## Server Details

**Base URL**: `http://localhost:5000`  
**Frontend CORS Origin**: `http://localhost:3002`  
**Node Version**: 18+  
**Environment**: Development (with TypeScript watch mode)

## Architecture

### Directory Structure

```
backend/
├── src/
│   ├── config/           # Configuration management
│   │   └── index.ts      # Environment and config constants
│   ├── middleware/       # Express middleware
│   │   ├── auth.ts       # JWT authentication & authorization
│   │   └── errorHandler.ts # Global error handling
│   ├── routes/           # API route handlers
│   │   └── index.ts      # Health check & info routes
│   ├── types/            # TypeScript type definitions
│   │   └── index.ts      # API, User, Product, Category types
│   ├── utils/            # Utility functions
│   │   ├── jwt.ts        # JWT token operations
│   │   └── helpers.ts    # General helpers
│   └── server.ts         # Express app setup and startup
├── dist/                 # Compiled JavaScript
├── package.json
├── tsconfig.json
└── .env                  # Environment variables
```

### Middleware Stack

1. **Helmet** - Security headers protection
2. **CORS** - Cross-origin resource sharing (frontend enabled)
3. **Express.json()** - JSON body parsing (10MB limit)
4. **Express.urlencoded()** - URL-encoded body parsing
5. **Morgan** - HTTP request logging with colored output
6. **Custom Middleware**:
   - `errorHandler` - Global error handling
   - `asyncHandler` - Async function wrapper
   - `authenticate` - JWT token verification
   - `authorize` - Role-based access control

## API Routes

### Health & Info

#### Health Check

```
GET /api/health
```

**Response** (200):

```json
{
  "success": true,
  "message": "Server is running",
  "data": {
    "status": "operational",
    "timestamp": "2024-11-17T10:30:00.000Z",
    "environment": "development",
    "uptime": 123.456,
    "version": "1.0.0"
  }
}
```

#### API Information

```
GET /api/info
```

**Response** (200):

```json
{
  "success": true,
  "message": "API Information",
  "data": {
    "name": "Ashraf Furnitures Backend API",
    "version": "1.0.0",
    "description": "Express backend for Furniture e-commerce platform",
    "endpoints": {
      "health": "GET /api/health",
      "info": "GET /api/info",
      "products": { ... },
      "categories": { ... },
      "auth": { ... }
    }
  }
}
```

### Products (Coming Soon)

```
GET    /api/products           - Get all products
GET    /api/products/:id       - Get product by ID
POST   /api/products           - Create product (admin only)
PUT    /api/products/:id       - Update product (admin only)
DELETE /api/products/:id       - Delete product (admin only)
```

### Categories (Coming Soon)

```
GET    /api/categories         - Get all categories
POST   /api/categories         - Create category (admin only)
PUT    /api/categories/:id     - Update category (admin only)
DELETE /api/categories/:id     - Delete category (admin only)
```

### Authentication (Coming Soon)

```
POST   /api/auth/login         - User login
POST   /api/auth/register      - User registration
POST   /api/auth/refresh       - Refresh JWT token
POST   /api/auth/logout        - User logout
```

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "details": {} // Only in development mode
}
```

### HTTP Status Codes

| Code | Meaning                              |
| ---- | ------------------------------------ |
| 200  | OK - Request successful              |
| 201  | Created - Resource created           |
| 400  | Bad Request - Invalid input          |
| 401  | Unauthorized - Invalid/missing token |
| 403  | Forbidden - Insufficient permissions |
| 404  | Not Found - Route/resource not found |
| 500  | Internal Server Error                |

### Error Types

1. **Validation Errors** (400)

   ```json
   {
     "success": false,
     "message": "Validation error",
     "error": "Field validation failed"
   }
   ```

2. **Authentication Errors** (401)

   ```json
   {
     "success": false,
     "message": "Invalid token"
   }
   ```

3. **Authorization Errors** (403)
   ```json
   {
     "success": false,
     "message": "Insufficient permissions"
   }
   ```

## Authentication

### JWT Token

**Token Claims**:

```typescript
{
  sub: string; // User ID
  email: string; // User email
  name: string; // User name
  role: "admin" | "customer"; // User role
  iat: number; // Issued at (Unix timestamp)
  exp: number; // Expiration (Unix timestamp)
}
```

**Expiration**: 24 hours

**Secret**: Configured in `.env` as `JWT_SECRET`

### Using Tokens

Include JWT token in request header:

```
Authorization: Bearer <token>
```

### Roles

- `admin` - Full access to admin endpoints
- `customer` - Limited access (products, categories, own orders)

## Environment Variables

Create `.env` file in backend directory:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Frontend Configuration
CORS_ORIGIN=http://localhost:3002

# JWT Configuration
JWT_SECRET=ashraf_furniture_mart_secret_key_2024
JWT_EXPIRATION=24h

# Database Configuration (Future)
DB_URI=mongodb://localhost:27017/furniture-mart

# Logging
LOG_LEVEL=combined
```

## Development

### Installation

```bash
cd backend
npm install
```

### Running Development Server

```bash
npm run dev
```

The server runs with file watching enabled via `tsx watch`.

### Building for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## Response Format

All API responses follow a consistent format:

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Paginated Response

```json
{
  "success": true,
  "message": "Data retrieved",
  "data": {
    "data": [...],
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

## Type Definitions

### API Response

```typescript
interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}
```

### User

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "customer";
  createdAt: Date;
  updatedAt: Date;
}
```

### Product

```typescript
interface Product {
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
```

### Category

```typescript
interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  productCount: number;
  createdAt: Date;
  updatedAt: Date;
}
```

## Testing API Endpoints

### cURL Examples

```bash
# Health Check
curl http://localhost:5000/api/health

# API Info
curl http://localhost:5000/api/info

# Authenticated Request
curl -H "Authorization: Bearer <token>" http://localhost:5000/api/protected
```

### Thunder Client / Postman

1. Set base URL to `http://localhost:5000`
2. Create environment variable: `token = <jwt_token>`
3. Use `Authorization: Bearer {{token}}` header

## Logging

Morgan logs all HTTP requests in the format:

```
:remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :colored-status :res[content-length] - :response-time ms ":referrer" ":user-agent"
```

Example:

```
::1 - - [17/Nov/2024:10:30:00 +0000] "GET /api/health HTTP/1.1" 200 156 - 2.345 ms "-" "curl/7.64.1"
```

Status codes are color-coded:

- 🟢 Green (200-299)
- 🔵 Cyan (300-399)
- 🟡 Yellow (400-499)
- 🔴 Red (500+)

## Security Features

1. **Helmet** - HTTP security headers
2. **CORS** - Restricted to frontend origin
3. **JWT** - Secure token-based authentication
4. **Input Validation** - Express validator ready to implement
5. **Error Handling** - Safe error messages without stack traces in production
6. **Rate Limiting** - Ready to implement
7. **Request Size Limits** - 10MB for JSON/URL-encoded bodies

## Future Enhancements

- MongoDB integration
- Product CRUD endpoints
- Category management endpoints
- User authentication endpoints
- Order management
- Payment processing
- File upload handling
- Rate limiting
- Request validation middleware
- Caching with Redis
- API documentation with Swagger

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 5000 (Linux/Mac)
lsof -ti:5000 | xargs kill -9

# Kill process on port 5000 (Windows PowerShell)
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process -Force
```

### CORS Errors

- Check `CORS_ORIGIN` in `.env` matches frontend URL
- Ensure frontend is making requests with correct headers
- Verify `credentials: true` is set in client if needed

### TypeScript Compilation Issues

- Run `npm install` to update dependencies
- Check `tsconfig.json` for path aliases
- Use `tsx watch` for development (automatically configured)

## Support

For questions or issues:

1. Check this documentation
2. Review error logs
3. Check GitHub issues
4. Contact development team

---

**Last Updated**: November 17, 2024  
**Version**: 1.0.0  
**Status**: Production Ready
