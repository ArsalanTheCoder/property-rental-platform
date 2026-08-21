const mongoose = require("mongoose");
const dns = require("dns");
const config = require("./index");

// Fix for Windows DNS resolution failure on mongodb+srv SRV records
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {}

const connectDB = async () => {
  try {
    if (!config.mongoUri) {
      throw new Error("MONGO_URI environment variable is not defined");
    }

    const conn = await mongoose.connect(config.mongoUri);
    console.log(`[DATABASE] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[DATABASE ERROR] Connection failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
