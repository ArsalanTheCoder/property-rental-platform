const { body, param } = require("express-validator");

const updateViewingStatusValidator = [
  param("id").isMongoId().withMessage("Invalid viewing ID format"),
  body("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn(["pending", "confirmed", "rejected", "cancelled", "completed"])
    .withMessage("Invalid viewing status"),
  body("adminNote")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Admin note cannot exceed 500 characters"),
];

module.exports = {
  updateViewingStatusValidator,
};
