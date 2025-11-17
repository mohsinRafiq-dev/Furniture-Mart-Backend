# MongoDB & Mongoose Setup

## Overview

The backend uses **MongoDB** as the primary database with **Mongoose** as the ODM (Object Document Mapper) for schema validation and data modeling.

## Features

✅ **Automatic Retry Logic** - Up to 5 retries with configurable delay  
✅ **Connection Pooling** - Min 2, Max 10 connections  
✅ **Health Checks** - Database availability monitoring  
✅ **Graceful Shutdown** - Proper connection cleanup  
✅ **Schema Validation** - Built-in data validation  
✅ **Indexing** - Performance optimization for common queries  
✅ **Event Handlers** - Connection lifecycle monitoring

---

## Installation & Setup

### 1. Install MongoDB

#### Local MongoDB

```bash
# Windows (using Chocolatey)
choco install mongodb-community

# macOS (using Homebrew)
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB service
mongod
```

#### MongoDB Atlas (Cloud)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get connection string: `mongodb+srv://user:password@cluster.mongodb.net/furniture-mart`

### 2. Install Mongoose

```bash
npm install mongoose
npm install --save-dev @types/mongoose
```

### 3. Configure Environment

Create `.env` file:

```env
# Local MongoDB
DB_URI=mongodb://localhost:27017/furniture-mart

# MongoDB Atlas
DB_URI=mongodb+srv://username:password@cluster.mongodb.net/furniture-mart?retryWrites=true&w=majority
```

---

## Connection Function

Located in `src/config/database.ts`

### Usage

```typescript
import { connectDatabase, setupConnectionHandlers } from "./config/database.js";

// Connect with default options
await connectDatabase();

// Connect with custom options
await connectDatabase({
  maxRetries: 10,
  retryDelay: 3000,
  verbose: true,
});

// Setup event handlers
setupConnectionHandlers();
```

### Options

```typescript
interface ConnectionOptions {
  maxRetries?: number; // Default: 5
  retryDelay?: number; // Default: 5000 (ms)
  verbose?: boolean; // Default: isDevelopment
}
```

### Retry Logic

- **Max Retries**: 5 attempts
- **Retry Delay**: 5 seconds between attempts
- **Timeout**: 5 seconds per connection attempt
- **Total Wait**: ~25 seconds for all retries

### Connection Events

```typescript
setupConnectionHandlers(); // Registers these:

// Connected successfully
mongoose.connection.on("connected", () => {
  console.log("✅ Connected to MongoDB");
});

// Connection error
mongoose.connection.on("error", (error) => {
  console.error("❌ Connection error:", error);
});

// Disconnected
mongoose.connection.on("disconnected", () => {
  console.log("⚠️  Disconnected from MongoDB");
});

// Reconnected after disconnect
mongoose.connection.on("reconnected", () => {
  console.log("🔄 Reconnected to MongoDB");
});
```

---

## Mongoose Schemas

### Product Schema

**File**: `src/models/Product.ts`

```typescript
{
  name: String,                 // Required, 2-100 chars
  description: String,          // Max 2000 chars
  price: Number,                // Required, > 0
  category: String,             // Required
  image: String,                // Default: "📦"
  stock: Number,                // Required, >= 0, Integer
  sku: String,                  // Required, Unique
  featured: Boolean,            // Default: false
  createdAt: Date,              // Auto
  updatedAt: Date               // Auto
}
```

**Validations**:

- Name: 2-100 characters, required
- Price: Positive number, required
- Stock: Non-negative integer
- SKU: Unique, uppercase, 3+ characters
- Featured: Indexed for quick lookups

**Indexes**:

- `sku` (unique)
- `category` + `featured`
- `name` + `description` (text search)

### Category Schema

**File**: `src/models/Category.ts`

```typescript
{
  name: String,                 // Required, Unique, 2-50 chars
  description: String,          // Max 500 chars
  icon: String,                 // Required, Default: "📦"
  color: String,                // Tailwind gradient format
  productCount: Number,         // Default: 0
  createdAt: Date,              // Auto
  updatedAt: Date               // Auto
}
```

**Validations**:

- Name: 2-50 characters, unique, required
- Icon: Required
- Color: Must be valid Tailwind gradient (contains "from-" and "to-")
- Product Count: Non-negative integer

**Indexes**:

- `name`

---

## Database Operations

### Using Models

```typescript
import Product from "./models/Product.js";
import Category from "./models/Category.js";

// Create
const product = await Product.create({
  name: "Leather Sofa",
  price: 1299,
  category: "Sofas",
  stock: 10,
  sku: "SOFA-001",
});

// Read
const product = await Product.findById(id);
const products = await Product.find({ featured: true });

// Update
await Product.findByIdAndUpdate(id, { stock: 5 });

// Delete
await Product.findByIdAndDelete(id);

// Query with filters
const products = await Product.find({
  category: "Sofas",
  featured: true,
}).sort({ price: -1 });

// Search
const results = await Product.find({ $text: { $search: "leather sofa" } });

// Count
const count = await Product.countDocuments({ featured: true });
```

---

## Health Check

```typescript
import { checkDatabaseHealth } from "./config/database.js";

const health = await checkDatabaseHealth();
// Returns: {
//   healthy: boolean,
//   message: string,
//   status: string,
//   latency?: number
// }
```

---

## Connection Status

```typescript
import { getConnectionStatus } from "./config/database.js";

const status = getConnectionStatus();
// Returns: {
//   connected: boolean,
//   state: number (0-3),
//   status: string ("disconnected" | "connected" | "connecting" | "disconnecting")
// }
```

---

## Disconnect

```typescript
import { disconnectDatabase } from "./config/database.js";

await disconnectDatabase();
```

---

## MongoDB Connection String Examples

### Local MongoDB

```
mongodb://localhost:27017/furniture-mart
```

### MongoDB with Authentication

```
mongodb://username:password@localhost:27017/furniture-mart
```

### MongoDB Atlas

```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/furniture-mart?retryWrites=true&w=majority
```

### MongoDB Atlas with Options

```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/furniture-mart?retryWrites=true&w=majority&maxPoolSize=10&minPoolSize=2
```

---

## Connection Options

```typescript
{
  serverSelectionTimeoutMS: 5000,    // Timeout for server selection
  socketTimeoutMS: 45000,            // Socket timeout
  family: 4,                         // Use IPv4
  retryWrites: true,                 // Automatic write retries
  w: "majority",                     // Write acknowledgment
  maxPoolSize: 10,                   // Max connections
  minPoolSize: 2                     // Min connections
}
```

---

## Debugging

### Enable Debug Logging

```bash
DEBUG=mongoose:* npm run dev
```

### Check Connection State

```typescript
console.log(mongoose.connection.readyState);
// 0 = disconnected
// 1 = connected
// 2 = connecting
// 3 = disconnecting
```

### Test Connection

```bash
mongosh "mongodb://localhost:27017/furniture-mart"
```

---

## Common Issues

### Connection Timeout

- Check MongoDB service is running
- Verify `DB_URI` is correct
- Check firewall/network settings

### Authentication Failed

- Verify username and password in connection string
- Check user has correct permissions in MongoDB
- For Atlas, ensure IP is whitelisted

### Connection Refused

- MongoDB service not running
- Wrong host/port in connection string
- Check localhost:27017 is accessible

### Duplicate Key Error

- SKU or Category name already exists
- Clean up existing data or drop collection

---

## Performance Tips

1. **Use Indexes** - Already configured for common queries
2. **Connection Pooling** - Min 2, Max 10 connections
3. **Text Search** - Use indexed text fields for search
4. **Pagination** - Use `.limit()` and `.skip()`
5. **Projections** - Select only needed fields

---

## Next Steps

- [ ] Create data seeders for initial data
- [ ] Add aggregation pipelines for analytics
- [ ] Implement caching layer
- [ ] Add backup strategy
- [ ] Setup MongoDB backups/snapshots
