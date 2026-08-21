const express = require("express");
const { authenticate } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/authorize.middleware");
const validate = require("../middleware/validate.middleware");
const {
  uploadPropertyImages,
} = require("../middleware/upload.middleware");

// Controllers
const adminPropertyController = require("../controllers/admin.property.controller");
const adminViewingController = require("../controllers/admin.viewing.controller");
const adminUserController = require("../controllers/admin.user.controller");
const adminDashboardController = require("../controllers/admin.dashboard.controller");
const adminAIController = require("../controllers/admin.ai.controller");

// Validators
const {
  createPropertyValidator,
  updatePropertyValidator,
  propertyStatusValidator,
} = require("../validators/property.validator");
const {
  updateViewingStatusValidator,
} = require("../validators/viewing.validator");
const {
  updateUserStatusValidator,
} = require("../validators/user.validator");
const {
  generateDescriptionValidator,
} = require("../validators/ai.validator");

const router = express.Router();

// Enforce authentication & ADMIN role authorization across ALL admin routes
router.use(authenticate, authorize("ADMIN"));

// ─────────────────────────────────────────────
// 1. Dashboard & Overview
// ─────────────────────────────────────────────
router.get("/dashboard/stats", adminDashboardController.getDashboardStats);

// ─────────────────────────────────────────────
// 2. Property Management
// ─────────────────────────────────────────────
router.get("/properties", adminPropertyController.getProperties);
router.post(
  "/properties",
  createPropertyValidator,
  validate,
  adminPropertyController.createProperty
);
router.get("/properties/:id", adminPropertyController.getPropertyById);
router.patch(
  "/properties/:id",
  updatePropertyValidator,
  validate,
  adminPropertyController.updateProperty
);
router.patch(
  "/properties/:id/status",
  propertyStatusValidator,
  validate,
  adminPropertyController.updatePropertyStatus
);
router.delete("/properties/:id", adminPropertyController.deleteProperty);

// Property Images Upload & Deletion
router.post(
  "/properties/:id/images",
  uploadPropertyImages,
  adminPropertyController.uploadImages
);
router.delete(
  "/properties/:id/images",
  adminPropertyController.deleteImage
);

// ─────────────────────────────────────────────
// 3. AI Features
// ─────────────────────────────────────────────
router.post(
  "/ai/generate-description",
  generateDescriptionValidator,
  validate,
  adminAIController.generateDescription
);

// ─────────────────────────────────────────────
// 4. Viewing Request Management & Lead Scoring
// ─────────────────────────────────────────────
router.get("/viewings", adminViewingController.getViewings);
router.get("/viewings/:id", adminViewingController.getViewingById);
router.patch(
  "/viewings/:id/status",
  updateViewingStatusValidator,
  validate,
  adminViewingController.updateViewingStatus
);
router.get(
  "/viewings/:id/lead-score",
  adminViewingController.getLeadScore
);

// ─────────────────────────────────────────────
// 5. User Management & Moderation
// ─────────────────────────────────────────────
router.get("/users", adminUserController.getUsers);
router.get("/users/:id", adminUserController.getUserById);
router.patch(
  "/users/:id/status",
  updateUserStatusValidator,
  validate,
  adminUserController.updateUserStatus
);

module.exports = router;
