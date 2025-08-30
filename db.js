require("dotenv").config();
const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGODB_URI_TEST;

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      // 🚀 ULTRA-FAST DATABASE OPTIMIZATIONS
      maxPoolSize: 100, // Increased connection pool for high traffic
      minPoolSize: 20, // More minimum connections
      serverSelectionTimeoutMS: 2000, // Faster server selection
      socketTimeoutMS: 20000, // Reduced socket timeout
      bufferCommands: true, // Enable buffering for stability
      maxIdleTimeMS: 60000, // Keep connections alive longer
      compressors: ["zlib"], // Enable compression
      zlibCompressionLevel: 6, // Optimal compression level
      retryWrites: true, // Enable retry writes
      retryReads: true, // Enable retry reads
      w: "majority", // Write concern
      readPreference: "primaryPreferred", // Read preference
      // 🚀 ADDITIONAL PERFORMANCE OPTIMIZATIONS
      maxConnecting: 10, // Limit concurrent connection attempts
      heartbeatFrequencyMS: 10000, // Faster heartbeat
      autoIndex: false, // Disable auto-indexing for speed
    });

    // 🚀 CONNECTION POOL MONITORING
    mongoose.connection.on("connected", () => {
      // MongoDB connected
    });

    mongoose.connection.on("error", (err) => {
      // Optionally log to a file or monitoring service
    });

    mongoose.connection.on("disconnected", () => {
      // MongoDB disconnected
    });

    // 🚀 GRACEFUL SHUTDOWN
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      // MongoDB connection closed through app termination
      process.exit(0);
    });
  } catch (error) {
    // Optionally log to a file or monitoring service
    throw error;
  }
};

module.exports = connectDB;
