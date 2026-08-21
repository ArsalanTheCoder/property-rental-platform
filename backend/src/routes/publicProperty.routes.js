const express = require("express");
const publicPropertyController = require("../controllers/publicProperty.controller");
const tenantViewingController = require("../controllers/tenantViewing.controller");
const { optionalAuth } = require("../middleware/optionalAuth.middleware");
const { authenticate } = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const { chatbotLimiter } = require("../middleware/rateLimiter.middleware");
const {
  propertyChatValidator,
  submitViewingValidator,
} = require("../validators/tenant.validator");

const router = express.Router();

// 1. Search & Browse published properties
router.get("/", publicPropertyController.getProperties);

// 2. Featured / Curated homepage properties
router.get("/featured", publicPropertyController.getFeatured);

// 3. Single Property Detail (optional auth to attach isFavorited)
router.get("/:id", optionalAuth, publicPropertyController.getPropertyById);

// 4. Grounded AI Property Chatbot
router.post(
  "/:id/chat",
  chatbotLimiter,
  propertyChatValidator,
  validate,
  publicPropertyController.chatWithProperty
);

// 5. Submit Viewing Visit Request for this property (requires authentication)
router.post(
  "/:id/viewings",
  authenticate,
  submitViewingValidator,
  validate,
  tenantViewingController.submitViewing
);

module.exports = router;
