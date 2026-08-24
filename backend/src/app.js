const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const config = require("./config");
const authRoutes = require("./routes/auth.routes");
const adminRoutes = require("./routes/admin.routes");
const publicPropertyRoutes = require("./routes/publicProperty.routes");
const favoriteRoutes = require("./routes/favorite.routes");
const tenantViewingRoutes = require("./routes/tenantViewing.routes");
const errorHandler = require("./middleware/error.middleware");
const ApiError = require("./utils/ApiError");

const app = express();

// Trust proxy for rate-limit and IP detection if deployed behind proxy/load balancer
app.set("trust proxy", 1);

// Dynamic CORS configuration allowing localhost ports and local development origins
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);

    const isLocalhost =
      origin.startsWith("http://localhost:") ||
      origin.startsWith("http://127.0.0.1:") ||
      origin.startsWith("http://192.168.") ||
      origin === "http://localhost:3000" ||
      origin === "http://localhost:5173" ||
      origin === "http://localhost:5174" ||
      origin === "http://localhost:5175";

    if (isLocalhost || origin === config.cors.clientOrigin) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));

// Parsing middlewares
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    statusCode: 200,
    success: true,
    message: "Property Rental API is running",
  });
});

// Mount feature routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/properties", publicPropertyRoutes);
app.use("/api/v1/favorites", favoriteRoutes);
app.use("/api/v1/viewings", tenantViewingRoutes);

// Catch-all 404 handler for undefined routes
app.use((req, res, next) => {
  next(new ApiError(404, `Route ${req.originalUrl} not found`));
});

// Centralized error handling middleware
app.use(errorHandler);

module.exports = app;