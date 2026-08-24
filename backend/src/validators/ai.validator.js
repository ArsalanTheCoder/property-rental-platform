const { body } = require("express-validator");

const generateDescriptionValidator = [
  body("propertyType")
    .trim()
    .notEmpty()
    .withMessage("Property type is required"),
  body("city")
    .trim()
    .notEmpty()
    .withMessage("City is required"),
  body("bedrooms")
    .notEmpty()
    .withMessage("Bedrooms count is required")
    .isInt({ min: 0 })
    .withMessage("Bedrooms must be 0 or more"),
  body("bathrooms")
    .notEmpty()
    .withMessage("Bathrooms count is required")
    .isInt({ min: 1 })
    .withMessage("Bathrooms must be at least 1"),
  body("price")
    .notEmpty()
    .withMessage("Price is required")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),
  body("amenities")
    .optional()
    .isArray()
    .withMessage("Amenities must be an array of strings"),
  body("furnished")
    .optional()
    .isBoolean()
    .withMessage("Furnished must be a boolean"),
  body("rawNotes")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Raw notes cannot exceed 1000 characters"),
];

module.exports = {
  generateDescriptionValidator,
};
