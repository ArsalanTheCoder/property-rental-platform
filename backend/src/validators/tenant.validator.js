const { body, param, query } = require("express-validator");

const propertyChatValidator = [
  param("id").isMongoId().withMessage("Invalid property ID format"),
  body("question")
    .trim()
    .notEmpty()
    .withMessage("Question cannot be empty")
    .isLength({ min: 3, max: 500 })
    .withMessage("Question must be between 3 and 500 characters"),
];

const favoriteParamValidator = [
  param("propertyId").isMongoId().withMessage("Invalid property ID format"),
];

const submitViewingValidator = [
  param("id").isMongoId().withMessage("Invalid property ID format"),
  body("date")
    .trim()
    .notEmpty()
    .withMessage("Viewing date is required")
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage("Date must be in YYYY-MM-DD format"),
  body("time")
    .trim()
    .notEmpty()
    .withMessage("Viewing time is required"),
  body("message")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Message cannot exceed 500 characters"),
];

const cancelViewingValidator = [
  param("id").isMongoId().withMessage("Invalid viewing ID format"),
];

module.exports = {
  propertyChatValidator,
  favoriteParamValidator,
  submitViewingValidator,
  cancelViewingValidator,
};
