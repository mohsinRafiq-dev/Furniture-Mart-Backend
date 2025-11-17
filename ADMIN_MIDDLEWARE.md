# Admin JWT Middleware Documentation

## Overview

All routes under `/api/admin/*` are protected by JWT authentication middleware. The middleware verifies JWT tokens and returns **401 Unauthorized** if the token is missing or invalid.

## Architecture

### Route Structure

```
/api/admin
├── /products (POST, PUT, DELETE)
├── /categories (POST, PUT, DELETE)
├── /profile (GET, PUT)
├── /admins (GET, POST, PUT, DELETE) - admin only
└── /stats (GET) - overview, products, orders
```

### Middleware Flow

```
Request to /api/admin/*
  ↓
adminAuthMiddleware (verify JWT)
  ↓
✓ Valid token → Attach admin info to request
✗ Invalid/missing → Return 401
  ↓
Role-based middleware (if needed)
  ↓
Route handler
```

## Middleware Details

### `adminAuthMiddleware`

Verifies JWT token from Authorization header and attaches admin info to request.

**Location**: `src/middleware/auth.ts`

**Behavior**:

- Checks for `Authorization: Bearer <token>` header
- Returns **401** if header is missing
- Returns **401** if token is invalid or expired
- Returns **500** on internal errors
- Attaches `req.adminId`, `req.email`, `req.role` on success

**Response on Missing Token**:

```json
{
  "success": false,
  "message": "Missing or invalid authorization header"
}
```

Status: **401 Unauthorized**

**Response on Invalid Token**:

```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

Status: **401 Unauthorized**

### `adminOnly`

Additional middleware that restricts access to **admin role only**.

**Usage**: `router.delete("/admins/:id", adminOnly, handler)`

**Returns 403** if user role is not "admin".

### `editorOrAdmin`

Additional middleware that allows **admin** and **editor** roles.

**Usage**: `router.post("/products", editorOrAdmin, handler)`

**Returns 403** if user role is not "admin" or "editor".

## Endpoints

### Products (Editor+)

#### Create Product

```
POST /api/admin/products
Authorization: Bearer <access_token>

Required role: admin, editor, viewer (auth required)
```

**Returns 401** if:

- Authorization header missing
- Token is invalid/expired

**Returns 403** if:

- User role is "viewer"

#### Update Product

```
PUT /api/admin/products/:id
Authorization: Bearer <access_token>

Required role: admin, editor
```

#### Delete Product

```
DELETE /api/admin/products/:id
Authorization: Bearer <access_token>

Required role: admin, editor
```

#### Bulk Delete (Admin Only)

```
POST /api/admin/products/bulk-delete
Authorization: Bearer <access_token>

Required role: admin
```

### Categories (Editor+)

#### Create Category

```
POST /api/admin/categories
Authorization: Bearer <access_token>

Required role: admin, editor
```

#### Update Category

```
PUT /api/admin/categories/:id
Authorization: Bearer <access_token>

Required role: admin, editor
```

#### Delete Category

```
DELETE /api/admin/categories/:id
Authorization: Bearer <access_token>

Required role: admin, editor
```

### Profile (All Roles)

#### Get Current Profile

```
GET /api/admin/profile
Authorization: Bearer <access_token>

Required role: any (admin, editor, viewer)
```

**Returns**: Current admin's profile information

#### Update Profile

```
PUT /api/admin/profile
Authorization: Bearer <access_token>

Required role: any (admin, editor, viewer)
```

#### Activity Log (Admin Only)

```
GET /api/admin/profile/activity
Authorization: Bearer <access_token>

Required role: admin
```

### Admin Management (Admin Only)

#### List All Admins

```
GET /api/admin/admins
Authorization: Bearer <access_token>

Required role: admin
```

**Returns 401** if token missing/invalid
**Returns 403** if role is not "admin"

#### Create Admin

```
POST /api/admin/admins
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "New Admin",
  "email": "admin@example.com",
  "password": "securepassword",
  "role": "editor"
}

Required role: admin
```

#### Update Admin

```
PUT /api/admin/admins/:id
Authorization: Bearer <access_token>

Required role: admin
```

#### Deactivate Admin

```
DELETE /api/admin/admins/:id
Authorization: Bearer <access_token>

Required role: admin
```

### Statistics (Editor+)

#### Dashboard Overview

```
GET /api/admin/stats/overview
Authorization: Bearer <access_token>

Required role: admin, editor
```

#### Product Statistics

```
GET /api/admin/stats/products
Authorization: Bearer <access_token>

Required role: admin, editor
```

#### Order Statistics

```
GET /api/admin/stats/orders
Authorization: Bearer <access_token>

Required role: admin, editor
```

## Error Responses

### 401 Unauthorized

**Cause**: Missing or invalid JWT token

```json
{
  "success": false,
  "message": "Missing or invalid authorization header"
}
```

**How to fix**:

1. Ensure `Authorization` header is set
2. Format: `Authorization: Bearer <token>`
3. Get token from `/api/auth/login`

### 403 Forbidden

**Cause**: User role doesn't have required permissions

```json
{
  "success": false,
  "message": "Forbidden: Required role(s) admin. Your role: editor"
}
```

**How to fix**:

1. Use admin account for admin-only routes
2. Editor accounts can only modify products/categories
3. Check role in auth token

## Testing with cURL

### Get Admin Token

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'
```

### Access Protected Route

```bash
curl -X GET http://localhost:5000/api/admin/profile \
  -H "Authorization: Bearer <access_token>"
```

### Missing Token (Should Get 401)

```bash
curl -X GET http://localhost:5000/api/admin/profile
# Response: 401 Unauthorized
```

### Invalid Token (Should Get 401)

```bash
curl -X GET http://localhost:5000/api/admin/profile \
  -H "Authorization: Bearer invalid_token"
# Response: 401 Unauthorized
```

## Testing with Postman

1. **Create Environment**:

   - Variable: `base_url` = `http://localhost:5000`
   - Variable: `token` = (empty initially)

2. **Login Request**:

   - Method: POST
   - URL: `{{base_url}}/api/auth/login`
   - Body (JSON):
     ```json
     {
       "email": "admin@example.com",
       "password": "password123"
     }
     ```
   - Tests Tab: Save token
     ```javascript
     const response = pm.response.json();
     pm.environment.set("token", response.data.accessToken);
     ```

3. **Admin Request**:
   - Method: GET
   - URL: `{{base_url}}/api/admin/profile`
   - Headers:
     - Key: `Authorization`
     - Value: `Bearer {{token}}`

## Token Information

### Access Token

- **Lifetime**: 24 hours
- **Usage**: All `/api/admin/*` routes
- **Format**: JWT (Header.Payload.Signature)
- **Location**: Response from `/api/auth/login`

### Refresh Token

- **Lifetime**: 7 days
- **Usage**: `/api/auth/refresh` to get new access token
- **Location**: Response from `/api/auth/login`

## Security Best Practices

1. **Store Tokens Securely**

   - Use httpOnly cookies (server-side recommended)
   - Never expose in localStorage or session storage for sensitive data

2. **Token Expiration**

   - Access tokens expire in 24 hours
   - Use refresh tokens to get new access tokens
   - Refresh endpoint: `POST /api/auth/refresh`

3. **Password Security**

   - Passwords are hashed with bcryptjs
   - Account locks after 5 failed login attempts for 15 minutes

4. **HTTPS in Production**
   - Always use HTTPS when transmitting tokens
   - Set secure flag on cookies

## Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Admin Dashboard (Frontend)                                   │
└────────────────────┬────────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
    ┌─────────────┐     ┌──────────────┐
    │ Login       │     │ Access Token │
    │ POST /auth/ │     │ (from Login) │
    │ login       │     │              │
    └────┬────────┘     └──────┬───────┘
         │                     │
         ▼                     ▼
    ┌──────────────┐    ┌────────────────────────┐
    │ Credentials  │    │ Request Admin Route    │
    │ email,pass   │    │ GET /api/admin/profile │
    └──────┬───────┘    │ Headers:               │
           │            │ Authorization: Bearer  │
           ▼            │ <token>                │
    ┌──────────────┐    └────────┬───────────────┘
    │ MongoDB      │             │
    │ Find Admin   │             ▼
    │ Match Pass   │      ┌─────────────────────┐
    └──────┬───────┘      │ adminAuthMiddleware │
           │              │ Verify JWT Token    │
           ▼              └────────┬────────────┘
    ┌──────────────┐              │
    │ Generate JWT │       ┌──────┴──────┐
    │ Access Token │       │             │
    └──────┬───────┘    ✓ Valid    ✗ Invalid
           │             │          │
           ▼             ▼          ▼
    ┌──────────────────┐  ┌──────────────┐
    │ Return Token     │  │ 401 Status   │
    │ + Refresh Token  │  │ Error JSON   │
    └──────────────────┘  └──────────────┘
                               │
                               ▼
                          Return Error
```

## Implementation Summary

✅ **Middleware Installed**:

- All `/api/admin/*` routes protected
- `adminAuthMiddleware` verifies JWT
- Role-based access control
- 401 on missing/invalid token
- 403 on insufficient permissions

✅ **Routes Protected**:

- Product CRUD (editor+)
- Category CRUD (editor+)
- Admin profile management (all roles)
- Admin management (admin only)
- Statistics (editor+)

✅ **Error Handling**:

- Clear 401 response for auth failures
- Clear 403 response for permission failures
- Detailed error messages

## Next Steps

1. **Implement Protected Route Handlers**

   - Replace placeholder handlers in `src/routes/admin.ts`
   - Connect to actual database operations

2. **Add Request Validation**

   - Use `express-validator` for request validation
   - Validate request body/params

3. **Add Activity Logging**

   - Log all admin actions
   - Track modifications for audit trail

4. **Frontend Integration**
   - Send token in Authorization header
   - Handle 401/403 responses
   - Redirect to login on auth failure
