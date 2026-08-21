const app = require("./app");
const config = require("./config");
const connectDB = require("./config/db");

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("[UNCAUGHT EXCEPTION]", err);
  process.exit(1);
});

// Connect to MongoDB and start HTTP Server
const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(config.port, () => {
      console.log(
        `[SERVER] Rental Platform API running on port ${config.port} in ${config.nodeEnv} mode`
      );
    });

    // Handle unhandled promise rejections
    process.on("unhandledRejection", (err) => {
      console.error("[UNHANDLED REJECTION]", err);
      server.close(() => {
        process.exit(1);
      });
    });
  } catch (error) {
    console.error("[STARTUP ERROR] Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();