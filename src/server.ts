import express, { Express } from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import routes from "./routes/index.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { config } from "./config/index.js";

// Initialize Express app
const app: Express = express();

// ============================================================================
// SECURITY MIDDLEWARE
// ============================================================================

// Helmet - Secure HTTP headers
app.use(helmet());

// CORS - Allow requests from frontend
app.use(
  cors({
    origin: config.CORS_ORIGIN,
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
  app.listen(config.PORT, () => {
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
    console.log("📚 API Documentation:");
    console.log(`   Health Check: GET http://localhost:${config.PORT}/api/health`);
    console.log(`   API Info: GET http://localhost:${config.PORT}/api/info`);
    console.log("\n");
  });

  // Handle graceful shutdown
  process.on("SIGTERM", () => {
    console.log("SIGTERM received. Shutting down gracefully...");
    process.exit(0);
  });

  process.on("SIGINT", () => {
    console.log("\nSIGINT received. Shutting down gracefully...");
    process.exit(0);
  });
};

// Start the server
startServer();

export default app;
