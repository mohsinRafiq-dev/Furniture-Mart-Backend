import express, { Express } from "express";
import cors from "cors";
import compression from "compression";
import morgan from "morgan";
import helmet from "helmet";
import routes from "./routes/index.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { config } from "./config/index.js";
import {
  connectDatabase,
  setupConnectionHandlers,
  disconnectDatabase,
} from "./config/database.js";
import { initCloudinary } from "./utils/imageOptimizer.js";

// Initialize Express app
const app: Express = express();

// ============================================================================
// SECURITY MIDDLEWARE
// ============================================================================

// Helmet - Secure HTTP headers
app.use(helmet());

// Compression - Enable gzip compression for responses
app.use(compression());

// CORS - Allow requests from frontend
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      const allowedOrigins = config.ALLOWED_ORIGINS as (string | RegExp)[];
      
      // Check if origin matches any allowed origin
      const isAllowed = allowedOrigins.some(allowed => {
        if (typeof allowed === 'string') {
          return origin === allowed;
        }
        return (allowed as RegExp).test(origin);
      });

      if (isAllowed) {
        callback(null, true);
      } else {
        // In production, allow all origins for public API
        // Remove this log in production for performance
        if (process.env.NODE_ENV === "development") {
          console.warn(`CORS not in whitelist for origin: ${origin}, but allowing anyway`);
        }
        callback(null, true); // Allow anyway for public API
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400, // 24 hours
  })
);

// ============================================================================
// BODY PARSING MIDDLEWARE
// ============================================================================

// Parse JSON request bodies
app.use(express.json({ limit: "10mb" }));

// Parse URL-encoded request bodies
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// ============================================================================
// LOGGING MIDDLEWARE
// ============================================================================

// Morgan HTTP request logger
// Skip logs for health checks in development
morgan.token("colored-status", (req, res) => {
  const status = res.statusCode;
  let color = "\x1b[32m"; // Green for 200-299
  if (status >= 300 && status < 400) color = "\x1b[36m"; // Cyan for 300-399
  if (status >= 400 && status < 500) color = "\x1b[33m"; // Yellow for 400-499
  if (status >= 500) color = "\x1b[31m"; // Red for 500+
  return `${color}${status}\x1b[0m`;
});

const morganFormat =
  ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :colored-status :res[content-length] - :response-time ms ":referrer" ":user-agent"';

app.use(
  morgan(morganFormat, {
    skip: (req) => config.isDevelopment && req.url === "/api/health",
  })
);

// ============================================================================
// CACHING MIDDLEWARE
// ============================================================================

// Add cache headers for GET requests (5 minutes for products/categories, 1 hour for static)
app.use((req, res, next) => {
  if (req.method === "GET") {
    // Cache product and category data for 5 minutes
    if (req.path.includes("/products") || req.path.includes("/categories")) {
      res.set("Cache-Control", "public, max-age=300"); // 5 minutes
    }
    // Cache other GET requests for 1 hour
    else {
      res.set("Cache-Control", "public, max-age=3600"); // 1 hour
    }
  } else {
    // Don't cache POST/PUT/DELETE requests
    res.set("Cache-Control", "no-cache, no-store, must-revalidate");
  }
  next();
});

// ============================================================================
// API ROUTES
// ============================================================================

// Mount routes
app.use("/api", routes);

// Health check endpoint (can be hit frequently by load balancers)
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// ============================================================================
// ERROR HANDLING MIDDLEWARE
// ============================================================================

// 404 handler for undefined routes
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// ============================================================================
// SERVER STARTUP
// ============================================================================

const startServer = (): void => {
  app.listen(config.PORT, async () => {
    console.log("\n");
    console.log("╔════════════════════════════════════════════════════════════╗");
    console.log("║                   Ashraf Furnitures                         ║");
    console.log("║                   Backend Server                            ║");
    console.log("╚════════════════════════════════════════════════════════════╝");
    console.log("\n");
    console.log(`🚀 Server started successfully!`);
    console.log(`📡 Environment: ${config.NODE_ENV.toUpperCase()}`);
    console.log(`🔗 URL: http://localhost:${config.PORT}`);
    console.log(`🌐 CORS Origin: ${config.CORS_ORIGIN}`);
    console.log("\n");

    // Initialize Cloudinary for image optimization
    initCloudinary();
    console.log("\n");

    // Connect to MongoDB
    try {
      await connectDatabase({
        maxRetries: 5,
        retryDelay: 5000,
        verbose: true,
      });

      // Setup connection event handlers
      setupConnectionHandlers();

      console.log("📚 API Documentation:");
      console.log(`   Health Check: GET http://localhost:${config.PORT}/api/health`);
      console.log(`   API Info: GET http://localhost:${config.PORT}/api/info`);
      console.log("\n");
    } catch (error) {
      console.error("❌ Failed to connect to MongoDB");
      console.error(error);
      process.exit(1);
    }
  });

  // Handle graceful shutdown
  process.on("SIGTERM", async () => {
    console.log("SIGTERM received. Shutting down gracefully...");
    await disconnectDatabase();
    process.exit(0);
  });

  process.on("SIGINT", async () => {
    console.log("\nSIGINT received. Shutting down gracefully...");
    await disconnectDatabase();
    process.exit(0);
  });
};

// Start the server
startServer();

export default app;
