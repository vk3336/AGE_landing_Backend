require("dotenv").config();


const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");

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
const apiKeyMiddleware = require("./middleware/apiKeyMiddleware");

// Location routes
const countryRoutes = require("./routes/country.routes");
const stateRoutes = require("./routes/state.routes");
const cityRoutes = require("./routes/city.routes");
const locationRoutes = require("./routes/location.routes");
const contactRoutes = require("./routes/contactRoutes");
const landingchatRoute = require("./routes/landingchatRoute");

const app = express();
const port = process.env.PORT || 7000;

// --- DB connection
connectDB()
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

const baseUrl = process.env.BASE_URL || "http://localhost:7000";
const apiBasePaths = (process.env.API_BASE_PATHS || "api")
  .split(",")
  .map((p) => p.trim())
  .filter(Boolean);

// --- Compression early
app.use(compression());

// --- CORS (multi-origin)
const allowedOrigins = (process.env.FRONTEND_URLS || "http://localhost:3000")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin(origin, cb) {
      // Allow tools / same-origin (no Origin header) and configured frontends
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      process.env.Role_Management_Key || "x-admin-email",
      process.env.API_KEY_NAME || "x-api-key",
    ],
    maxAge: 86400, // cache preflight for 24h
  })
);

// --- Body parsers
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

// --- Helmet (API-safe settings)
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

/**
 * ✅ HEALTH ENDPOINTS FIRST (no auth, no limits)
 * Mount before rate limiting and API key middleware.
 *
 */

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: Date.now() });
});
// Optional mirrors for infra probes:
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: Date.now() });
});
app.head("/api/health", (req, res) => res.sendStatus(200));
app.head("/health", (req, res) => res.sendStatus(200));

// --- Rate limiting (skip health endpoints)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === "/health" || req.path === "/api/health",
});
app.use(limiter);

// --- Response time header (silent)
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    try {
      res.setHeader("X-Response-Time", `${duration}ms`);
    } catch (_) {}
  });
  next();
});

// --- Warn if required env missing
["MONGODB_URI", "EMAIL_USER", "EMAIL_PASS", "API_SECRET_KEY"].forEach((key) => {
  if (!process.env[key]) {
    console.warn(`Warning: Required environment variable ${key} is missing!`);
  }
});

// --- Light caching
app.use((req, res, next) => {
  if (req.path.includes("/images/") || req.path.includes("/static/")) {
    res.setHeader("Cache-Control", "public, max-age=3600"); // 1h
  } else if (req.method === "GET") {
    res.setHeader("Cache-Control", "public, max-age=300"); // 5m
  }
  next();
});

// --- API key middleware AFTER health
app.use(apiKeyMiddleware);

// --- Route registrar
const registerRoutes = (basePath) => {
  const apiPath = `/${basePath}`;

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

  // Locations
  app.use(`${apiPath}/countries`, countryRoutes);
  app.use(`${apiPath}/states`, stateRoutes);
  app.use(`${apiPath}/cities`, cityRoutes);
  app.use(`${apiPath}/locations`, locationRoutes);
  app.use(`${apiPath}/contacts`, contactRoutes);
  app.use(`${apiPath}/chatbot`, landingchatRoute);
};

// --- Register routes for each base path (e.g., /api)
apiBasePaths.forEach((basePath) => {
  console.log(`Registering API routes for path: /${basePath}`);
  registerRoutes(basePath);
});

// --- Root index
app.get("/", (req, res) => {
  const endpoints = apiBasePaths.map((basePath) => {
    const apiPath = `/${basePath}`;
    return {
      basePath: apiPath,
      endpoints: [
        `${apiPath}/admin`,
        `${apiPath}/category`,
        `${apiPath}/structure`,
        `${apiPath}/content`,
        // add more as needed
      ],
    };
  });

  res.json({
    message: "Welcome to the API",
    availableBasePaths: apiBasePaths.map((p) => `/${p}`),
    endpoints,
  });
});

// --- 404
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

module.exports = app;

// --- Start when run directly
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`Base URL: ${baseUrl}`);
    console.log(`MongoDB URI: ${process.env.MONGODB_URI}`);
  });
}
