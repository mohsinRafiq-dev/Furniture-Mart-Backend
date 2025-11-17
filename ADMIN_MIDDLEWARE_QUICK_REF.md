# JWT Admin Middleware - Quick Reference

## What Was Added

✅ **JWT Middleware Protection** for `/api/admin/*` routes
- All admin routes require valid JWT token
- Returns **401** if token missing or invalid
- Returns **403** if insufficient permissions

## File Changes

### Created
- `src/routes/admin.ts` (296 lines) - All admin routes with JWT protection

### Modified
- `src/routes/index.ts` - Added admin router mount with JWT middleware
- `ADMIN_MIDDLEWARE.md` - Comprehensive documentation

## How It Works

```typescript
// router.use(adminAuthMiddleware) is called for ALL /api/admin/* routes
// This middleware:
// 1. Checks Authorization header
// 2. Extracts Bearer token
// 3. Verifies JWT signature
// 4. Attaches admin info to request (adminId, email, role)
// 5. Calls next() if valid, returns 401 if invalid
```

## Protected Routes

All routes under `/api/admin/*` require JWT:

### Product Management (Editor+)
```
POST   /api/admin/products              ← Create
PUT    /api/admin/products/:id          ← Update
DELETE /api/admin/products/:id          ← Delete
POST   /api/admin/products/bulk-delete  ← Bulk delete (admin only)
```

### Category Management (Editor+)
```
POST   /api/admin/categories            ← Create
PUT    /api/admin/categories/:id        ← Update
DELETE /api/admin/categories/:id        ← Delete
```

### Admin Profile (All Roles)
```
GET    /api/admin/profile               ← Get current profile
PUT    /api/admin/profile               ← Update profile
GET    /api/admin/profile/activity      ← Activity log (admin only)
```

### Admin Management (Admin Only)
```
GET    /api/admin/admins                ← List admins
POST   /api/admin/admins                ← Create admin
PUT    /api/admin/admins/:id            ← Update admin
DELETE /api/admin/admins/:id            ← Deactivate admin
```

### Statistics (Editor+)
```
GET    /api/admin/stats/overview        ← Dashboard stats
GET    /api/admin/stats/products        ← Product stats
GET    /api/admin/stats/orders          ← Order stats
```

## Error Responses

### Missing Token - 401
```bash
curl -X GET http://localhost:5000/api/admin/products
```
Response:
```json
{
  "success": false,
  "message": "Missing or invalid authorization header"
}
```

### Invalid Token - 401
```bash
curl -X GET http://localhost:5000/api/admin/products \
  -H "Authorization: Bearer invalid_token"
```
Response:
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

### Insufficient Permissions - 403
```bash
# As viewer (not authorized for products)
curl -X POST http://localhost:5000/api/admin/products \
  -H "Authorization: Bearer <viewer_token>"
```
Response:
```json
{
  "success": false,
  "message": "Forbidden: Required role(s) admin, editor. Your role: viewer"
}
```

## Usage Example

### Get Token
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "admin": {
      "id": "...",
      "name": "Admin Name",
      "email": "admin@example.com",
      "role": "admin"
    }
  }
}
```

### Use Token for Admin Route
```bash
curl -X GET http://localhost:5000/api/admin/profile \
  -H "Authorization: Bearer eyJhbGc..."
```

Response:
```json
{
  "success": true,
  "message": "GET /api/admin/profile - Current admin profile",
  "user": {
    "adminId": "...",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

## Testing Scenarios

| Scenario | Token | Endpoint | Result |
|----------|-------|----------|--------|
| No token | ❌ | `/api/admin/products` | 401 ✗ |
| Valid admin | ✅ | `/api/admin/products` (POST) | 200 ✓ |
| Valid editor | ✅ | `/api/admin/products` (POST) | 200 ✓ |
| Valid viewer | ✅ | `/api/admin/products` (POST) | 403 ✗ |
| Valid any role | ✅ | `/api/admin/profile` (GET) | 200 ✓ |
| Valid editor | ✅ | `/api/admin/admins` (GET) | 403 ✗ |
| Valid admin | ✅ | `/api/admin/admins` (GET) | 200 ✓ |

## Middleware Chain

```
Request arrives at /api/admin/*
  ↓
adminAuthMiddleware runs
  ├─ Check Authorization header
  ├─ Extract Bearer token
  ├─ Verify JWT signature
  ├─ Valid? → Attach req.adminId, req.email, req.role
  └─ Invalid? → Return 401, stop execution
  ↓
Route handler receives request
  ├─ Has req.adminId, req.email, req.role attached
  └─ Can access authenticated user info
  ↓
Optional: Role-based middleware (adminOnly, editorOrAdmin)
  ├─ Check req.role against allowed roles
  ├─ Has required role? → Continue to handler
  └─ Wrong role? → Return 403, stop execution
  ↓
Route handler processes request
  ↓
Response sent back to client
```

## Code Example

### In Route Handler
```typescript
router.get("/admin/profile", async (req, res) => {
  // adminAuthMiddleware already verified token
  // req.adminId, req.email, req.role are set
  
  const adminId = (req as any).adminId;  // From JWT
  const email = (req as any).email;
  const role = (req as any).role;
  
  // Use this info to fetch admin from database
  const admin = await AdminUser.findById(adminId);
  
  res.json({ success: true, data: { admin } });
});
```

### Custom Route Protection
```typescript
// Admin only
router.delete("/admins/:id", adminOnly, (req, res) => {
  // Only admin role can reach here
});

// Editor or Admin
router.post("/products", editorOrAdmin, (req, res) => {
  // Admin and editor roles can reach here
});
```

## Security Flow

```
┌─────────────────────────────────┐
│ Request to /api/admin/products  │
│ Headers:                        │
│ Authorization: Bearer <token>   │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│ adminAuthMiddleware             │
│ 1. Extract token from header    │
│ 2. Verify JWT signature         │
│ 3. Check expiration             │
└────────┬────────────────────────┘
         │
    ┌────┴────┐
    │          │
    ▼          ▼
 Valid      Invalid
    │          │
    ▼          ▼
  ✓ Set    ✗ Return 401
  adminId
  email
  role
    │          │
    ▼          ▼
 Continue    Stop
 to next
 middleware
```

## Environment Variables

From `.env`:
```env
JWT_SECRET=your_secret_key
JWT_ACCESS_EXPIRY=24h
JWT_REFRESH_EXPIRY=7d
```

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| 401 on valid token | Token expired | Use refresh endpoint to get new token |
| 401 always | Wrong header format | Use `Authorization: Bearer <token>` |
| 403 Forbidden | Wrong role | Login with admin/editor account |
| 500 error | JWT_SECRET not set | Set JWT_SECRET in .env |

## Next Steps

1. ✅ JWT middleware implemented
2. ✅ Admin routes protected
3. ✅ Error handling (401/403) added
4. ⏳ Implement route handlers (replace placeholders with DB logic)
5. ⏳ Add request validation with express-validator
6. ⏳ Add activity logging
7. ⏳ Frontend integration with token management

## Documentation

Full documentation: `ADMIN_MIDDLEWARE.md`

Contains:
- Detailed middleware explanation
- All endpoint specifications
- Error response formats
- Testing examples (cURL, Postman)
- Security best practices
- Implementation flow diagrams
