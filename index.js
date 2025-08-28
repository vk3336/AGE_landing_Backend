require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const app = express();

const connectDB = require("./db");
const adminRoutes = require("./routes/adminRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const structureRoutes = require("./routes/structureRoutes");
const contentRoutes = require("./routes/contentRoutes");
const designRoutes = require("./routes/designRoutes");
const finishRoutes = require("./routes/finishRoutes");
const suitableforRoutes = require("./routes/suitableforRoutes");
const vendorRoutes = require("./routes/vendorRoutes");
const groupcodeRoutes = require("./routes/groupcodeRoutes");
const colorRoutes = require("./routes/colorRoutes");
const substructureRoutes = require("./routes/substructureRoutes");
const subfinishRoutes = require("./routes/subfinishRoutes");
const subsuitableRoutes = require("./routes/subsuitableRoutes");
const productRoutes = require("./routes/productRoutes");
const seoRoutes = require("./routes/seoRoutes");
const motifRoutes = require("./routes/motifRoutes");
const roleManagementRoutes = require("./routes/roleManagementRoutes");
const staticSeoRoutes = require("./routes/staticSeoRoutes");
const userRoutes = require("./routes/userRoutes");
const apiKeyMiddleware = require("./middleware/apiKeyMiddleware"); // Import the new middleware

// Location routes
const countryRoutes = require("./routes/country.routes");
const stateRoutes = require("./routes/state.routes");
const cityRoutes = require("./routes/city.routes");
const locationRoutes = require("./routes/location.routes");
const contactRoutes = require("./routes/contactRoutes");

const port = process.env.PORT || 7000;

// Enhanced DB connection with logging
connectDB().then(() => {
  console.log('MongoDB connected successfully');
}).catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

const baseUrl = process.env.BASE_URL || "http://localhost:7000";
const apiBasePaths = (process.env.API_BASE_PATHS || "api")
  .split(",")
  .map((path) => path.trim());

// 🚀 ULTRA-FAST COMPRESSION
app.use(compression());

// 🚀 RATE LIMITING for stability
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// 🚀 ULTRA-FAST MIDDLEWARE OPTIMIZATIONS
// Support multiple frontend URLs
const allowedOrigins = (
  process.env.FRONTEND_URLS || "http://localhost:3000"
).split(",");

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      process.env.Role_Management_Key || "x-admin-email",
      process.env.API_KEY_NAME || "x-api-key",
    ],
    maxAge: 86400, // 24 hours cache
  })
);

// 🚀 OPTIMIZED BODY PARSER
app.use(
  bodyParser.json({
    limit: "10mb",
    strict: true,
  })
);
app.use(
  bodyParser.urlencoded({
    extended: true,
    limit: "10mb",
    parameterLimit: 1000,
  })
);

// 🚀 SECURITY WITH PERFORMANCE
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// Apply API Key Middleware
app.use(apiKeyMiddleware);

// 🚀 RESPONSE TIME MONITORING (silent)
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    try {
      res.setHeader("X-Response-Time", `${duration}ms`);
    } catch (error) {
      // Ignore header setting errors
    }
    // Silent monitoring - no console logs
  });
  next();
});

// Warn if required .env variables are missing
const requiredEnv = [
  "MONGODB_URI",
  "EMAIL_USER",
  "EMAIL_PASS",
  "API_SECRET_KEY",
];
requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    console.warn(`Warning: Required environment variable ${key} is missing!`);
  }
});

// 🚀 CACHE HEADERS for better performance
app.use((req, res, next) => {
  // Cache static assets for 1 hour
  if (req.path.includes("/images/") || req.path.includes("/static/")) {
    res.setHeader("Cache-Control", "public, max-age=3600");
  }
  // Cache API responses for 5 minutes
  else if (req.method === "GET") {
    res.setHeader("Cache-Control", "public, max-age=300");
  }
  next();
});

// Function to register routes for a specific base path
const registerRoutes = (basePath) => {
  const apiPath = `/${basePath}`;

  // Main routes
  app.use(`${apiPath}/admin`, adminRoutes);
  app.use(`${apiPath}/category`, categoryRoutes);
  app.use(`${apiPath}/structure`, structureRoutes);
  app.use(`${apiPath}/content`, contentRoutes);
  app.use(`${apiPath}/design`, designRoutes);
  app.use(`${apiPath}/finish`, finishRoutes);
  app.use(`${apiPath}/suitablefor`, suitableforRoutes);
  app.use(`${apiPath}/vendor`, vendorRoutes);
  app.use(`${apiPath}/groupcode`, groupcodeRoutes);
  app.use(`${apiPath}/color`, colorRoutes);
  app.use(`${apiPath}/substructure`, substructureRoutes);
  app.use(`${apiPath}/subfinish`, subfinishRoutes);
  app.use(`${apiPath}/subsuitable`, subsuitableRoutes);
  app.use(`${apiPath}/product`, productRoutes);
  app.use(`${apiPath}/seo`, seoRoutes);
  app.use(`${apiPath}/motif`, motifRoutes);
  app.use(`${apiPath}/roles`, roleManagementRoutes);
  app.use(`${apiPath}/static-seo`, staticSeoRoutes);
  app.use(`${apiPath}/users`, userRoutes);
  // Location routes
  app.use(`${apiPath}/countries`, countryRoutes);
  app.use(`${apiPath}/states`, stateRoutes);
  app.use(`${apiPath}/cities`, cityRoutes);
  app.use(`${apiPath}/locations`, locationRoutes);
  app.use(`${apiPath}/contacts`, contactRoutes);
};

// Register routes for all base paths
apiBasePaths.forEach((basePath) => {
  if (basePath) {
    // Skip empty paths
    console.log(`Registering API routes for path: /${basePath}`);
    registerRoutes(basePath);
  }
});

app.get("/", (req, res) => {
  const endpoints = [];

  // Add sample endpoints for each base path
  apiBasePaths.forEach((basePath) => {
    if (basePath) {
      const apiPath = `/${basePath}`;
      endpoints.push({
        basePath: apiPath,
        endpoints: [
          `${apiPath}/admin`,
          `${apiPath}/category`,
          `${apiPath}/structure`,
          `${apiPath}/content`,
          // Add other endpoints as needed
        ],
      });
    }
  });

  res.json({
    message: "Welcome to the API",
    availableBasePaths: apiBasePaths.map((p) => `/${p}`),
    endpoints: endpoints,
  });
});

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

module.exports = app;

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`Base URL: ${baseUrl}`);
    console.log(`MongoDB URI: ${process.env.MONGODB_URI}`);
  });
}
