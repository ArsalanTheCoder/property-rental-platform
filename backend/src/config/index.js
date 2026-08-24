const dotenv = require("dotenv");
const path = require("path");

// Load .env file from the backend directory
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  mongoUri: process.env.MONGO_URI,
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || "15m",
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || "7d",
  },
  cors: {
    clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
  },
  email: {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT, 10) || 587,
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    from: process.env.EMAIL_FROM || "no-reply@rentalplatform.com",
  },
  clientUrls: {
    verifyEmailUrl:
      process.env.APP_VERIFY_EMAIL_URL || "http://localhost:3000/verify-email",
    resetPasswordUrl:
      process.env.APP_RESET_PASSWORD_URL ||
      "http://localhost:3000/reset-password",
  },
  admin: {
    name: process.env.ADMIN_NAME || "Platform Admin",
    email: process.env.ADMIN_EMAIL || "admin@rentalplatform.com",
    password: process.env.ADMIN_PASSWORD || "AdminSecurePass123!",
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME
      ? process.env.CLOUDINARY_CLOUD_NAME.replace(/["']/g, "").trim()
      : undefined,
    apiKey: process.env.CLOUDINARY_API_KEY
      ? process.env.CLOUDINARY_API_KEY.replace(/["']/g, "").trim()
      : undefined,
    apiSecret: process.env.CLOUDINARY_API_SECRET
      ? process.env.CLOUDINARY_API_SECRET.replace(/["']/g, "").trim()
      : undefined,
  },
  ai: {
    apiKey: process.env.AI_API_KEY,
  },
};

// Validate critical configuration
const requiredConfig = [
  { key: "MONGO_URI", val: config.mongoUri },
  { key: "JWT_ACCESS_SECRET", val: config.jwt.accessSecret },
  { key: "JWT_REFRESH_SECRET", val: config.jwt.refreshSecret },
];

for (const { key, val } of requiredConfig) {
  if (!val) {
    console.warn(`[CONFIG WARNING] Missing environment variable: ${key}`);
  }
}

module.exports = Object.freeze(config);
