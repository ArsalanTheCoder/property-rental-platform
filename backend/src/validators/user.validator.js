const { body, param } = require("express-validator");

const updateUserStatusValidator = [
  param("id").isMongoId().withMessage("Invalid user ID format"),
  body("isBlocked")
    .optional()
    .isBoolean()
    .withMessage("isBlocked must be a boolean"),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
];

module.exports = {
  updateUserStatusValidator,
};
