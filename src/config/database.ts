import mongoose, { Connection, ConnectOptions } from "mongoose";
import { config } from "./index.js";

interface ConnectionOptions {
  maxRetries?: number;
  retryDelay?: number;
  verbose?: boolean;
}

let connectionRetries = 0;
let isConnecting = false;

/**
 * Connect to MongoDB with retry logic
 * @param options Connection options with retry configuration
 * @returns Promise<Connection> Mongoose connection instance
 */
export const connectDatabase = async (
  options: ConnectionOptions = {}
): Promise<Connection> => {
  const {
    maxRetries = 5,
    retryDelay = 5000,
    verbose = config.isDevelopment,
  } = options;

  // Prevent multiple simultaneous connection attempts
  if (isConnecting) {
    return new Promise((resolve, reject) => {
      const checkConnection = setInterval(() => {
        if (mongoose.connection.readyState === 1) {
          clearInterval(checkConnection);
          resolve(mongoose.connection);
        }
      }, 1000);

      setTimeout(() => {
        clearInterval(checkConnection);
        reject(new Error("Database connection timeout"));
      }, 30000);
    });
  }

  isConnecting = true;

  try {
    if (verbose) {
      console.log("\n📦 Database Connection Started");
      console.log("================================");
    }

    // Check if already connected
    if (mongoose.connection.readyState === 1) {
      if (verbose) {
        console.log("✅ Already connected to MongoDB");
      }
      isConnecting = false;
      return mongoose.connection;
    }

    if (!config.DB_URI) {
      throw new Error("DB_URI environment variable is not set");
    }

    // Setup mongoose connection options
    const mongooseOptions: ConnectOptions = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4, // Use IPv4
      retryWrites: true,
      w: "majority",
      maxPoolSize: 10,
      minPoolSize: 2,
    };

    if (verbose) {
      console.log(`🔗 Connecting to: ${config.DB_URI}`);
      console.log(`⚙️  Max Retries: ${maxRetries}`);
      console.log(`⏱️  Retry Delay: ${retryDelay}ms`);
    }

    // Attempt connection with retry logic
    while (connectionRetries < maxRetries) {
      try {
        if (verbose && connectionRetries > 0) {
          console.log(
            `\n🔄 Retry attempt ${connectionRetries + 1}/${maxRetries}...`
          );
        }

        await mongoose.connect(config.DB_URI, mongooseOptions);

        if (verbose) {
          console.log("\n✅ MongoDB Connected Successfully!");
          console.log(`📊 Connection State: ${mongoose.connection.readyState}`);
          console.log(`🏢 Database: ${mongoose.connection.name}`);
          console.log(`🖥️  Host: ${mongoose.connection.host}`);
          console.log("================================\n");
        }

        connectionRetries = 0;
        isConnecting = false;
        return mongoose.connection;
      } catch (error) {
        connectionRetries++;

        if (connectionRetries >= maxRetries) {
          throw error;
        }

        if (verbose) {
          console.log(`⚠️  Connection failed. Retrying in ${retryDelay}ms...`);
          console.log(`   Error: ${(error as Error).message}`);
        }

        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      }
    }

    throw new Error("Failed to connect to MongoDB after maximum retries");
  } catch (error) {
    connectionRetries = 0;
    isConnecting = false;

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("\n❌ MongoDB Connection Failed");
    console.error("================================");
    console.error(`Error: ${errorMessage}`);
    console.error(`URI: ${config.DB_URI}`);
    console.error("================================\n");

    throw error;
  }
};

/**
 * Disconnect from MongoDB gracefully
 */
export const disconnectDatabase = async (): Promise<void> => {
  try {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log("✅ MongoDB disconnected successfully");
    }
  } catch (error) {
    console.error("❌ Error disconnecting from MongoDB:", error);
    throw error;
  }
};

/**
 * Get database connection status
 */
export const getConnectionStatus = (): {
  connected: boolean;
  state: number;
  status: string;
} => {
  const state = mongoose.connection.readyState;
  const statusMap: { [key: number]: string } = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  return {
    connected: state === 1,
    state,
    status: statusMap[state] || "unknown",
  };
};

/**
 * Healthcheck for database
 */
export const checkDatabaseHealth = async (): Promise<{
  healthy: boolean;
  message: string;
  status: string;
  latency?: number;
}> => {
  try {
    const start = Date.now();
    await mongoose.connection.db?.admin().ping();
    const latency = Date.now() - start;

    return {
      healthy: true,
      message: "Database is healthy",
      status: "operational",
      latency,
    };
  } catch (error) {
    return {
      healthy: false,
      message: `Database health check failed: ${(error as Error).message}`,
      status: "unhealthy",
    };
  }
};

/**
 * Handle connection events
 */
export const setupConnectionHandlers = (): void => {
  mongoose.connection.on("connected", () => {
    console.log("✅ Mongoose connected to MongoDB");
  });

  mongoose.connection.on("error", (error) => {
    console.error("❌ Mongoose connection error:", error);
  });

  mongoose.connection.on("disconnected", () => {
    console.log("⚠️  Mongoose disconnected from MongoDB");
  });

  mongoose.connection.on("reconnected", () => {
    console.log("🔄 Mongoose reconnected to MongoDB");
  });
};

export default connectDatabase;
