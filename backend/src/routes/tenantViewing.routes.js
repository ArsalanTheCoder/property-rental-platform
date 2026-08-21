const express = require("express");
const tenantViewingController = require("../controllers/tenantViewing.controller");
const { authenticate } = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const {
  cancelViewingValidator,
} = require("../validators/tenant.validator");

const router = express.Router();

// Require tenant authentication on all viewing inquiry tracking endpoints
router.use(authenticate);

// 1. Get logged-in tenant's viewing request history
router.get("/my-requests", tenantViewingController.getMyRequests);

// 2. Cancel a pending viewing request
router.patch(
  "/:id/cancel",
  cancelViewingValidator,
  validate,
  tenantViewingController.cancelRequest
);

module.exports = router;
