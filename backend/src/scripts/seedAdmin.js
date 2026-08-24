const mongoose = require("mongoose");
const dns = require("dns");
const config = require("../config");
const User = require("../models/User");
const { hashPassword } = require("../utils/password");

// Fix for Windows DNS resolution failure on mongodb+srv SRV records
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {}

async function seedAdmin() {
  console.log("\n==========================================");
  console.log("  SEEDING MASTER ADMIN ACCOUNT");
  console.log("==========================================\n");

  try {
    if (!config.mongoUri) {
      throw new Error("MONGO_URI is missing in .env");
    }

    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(config.mongoUri);
    console.log("✓ Connected to MongoDB.\n");

    const adminEmail = config.admin.email.trim().toLowerCase();
    const adminPassword = config.admin.password;
    const adminName = config.admin.name.trim();

    console.log(`Checking existing admin for: ${adminEmail}`);
    let adminUser = await User.findOne({ email: adminEmail }).select("+password");

    const hashedPassword = await hashPassword(adminPassword);

    if (adminUser) {
      console.log("Admin account already exists. Updating credentials and permissions...");
      adminUser.name = adminName;
      adminUser.password = hashedPassword;
      adminUser.role = "ADMIN";
      adminUser.isEmailVerified = true;
      adminUser.isActive = true;
      adminUser.isBlocked = false;
      await adminUser.save();
      console.log(`✓ Admin account successfully updated: ${adminEmail}`);
    } else {
      console.log("Creating new Master Admin account...");
      adminUser = await User.create({
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: "ADMIN",
        isEmailVerified: true,
        isActive: true,
        isBlocked: false,
      });
      console.log(`✓ Master Admin account successfully created: ${adminEmail}`);
    }

    console.log("\n------------------------------------------");
    console.log(`  Admin Email:    ${adminEmail}`);
    console.log(`  Admin Name:     ${adminName}`);
    console.log(`  Role:           ADMIN`);
    console.log("------------------------------------------\n");
    console.log("✓ SEEDING COMPLETED SUCCESSFULLY!\n");
  } catch (error) {
    console.error("\n❌ SEEDING FAILED:", error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

seedAdmin();
