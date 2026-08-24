const { body, param, query } = require("express-validator");

const createPropertyValidator = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Property title is required")
    .isLength({ min: 5, max: 150 })
    .withMessage("Title must be between 5 and 150 characters"),
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Property description is required"),
  body("propertyType")
    .trim()
    .notEmpty()
    .withMessage("Property type is required")
    .isIn([
      "Apartment",
      "House",
      "Villa",
      "Studio",
      "Commercial",
      "Penthouse",
    ])
    .withMessage("Invalid property type"),
  body("price")
    .notEmpty()
    .withMessage("Monthly rent price is required")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),
  body("location.address")
    .trim()
    .notEmpty()
    .withMessage("Location street address is required"),
  body("location.city")
    .trim()
    .notEmpty()
    .withMessage("Location city is required"),
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
  body("amenities")
    .optional()
    .isArray()
    .withMessage("Amenities must be an array of strings"),
  body("furnished")
    .optional()
    .isBoolean()
    .withMessage("Furnished must be a boolean"),
  body("status")
    .optional()
    .isIn(["draft", "pending", "published", "unpublished"])
    .withMessage("Invalid property status"),
];

const updatePropertyValidator = [
  param("id").isMongoId().withMessage("Invalid property ID format"),
  body("title")
    .optional()
    .trim()
    .isLength({ min: 5, max: 150 })
    .withMessage("Title must be between 5 and 150 characters"),
  body("propertyType")
    .optional()
    .isIn([
      "Apartment",
      "House",
      "Villa",
      "Studio",
      "Commercial",
      "Penthouse",
    ])
    .withMessage("Invalid property type"),
  body("price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),
  body("bedrooms")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Bedrooms must be 0 or more"),
  body("bathrooms")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Bathrooms must be at least 1"),
  body("status")
    .optional()
    .isIn(["draft", "pending", "published", "unpublished"])
    .withMessage("Invalid property status"),
];

const propertyStatusValidator = [
  param("id").isMongoId().withMessage("Invalid property ID format"),
  body("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn(["draft", "pending", "published", "unpublished"])
    .withMessage("Invalid property status"),
];

module.exports = {
  createPropertyValidator,
  updatePropertyValidator,
  propertyStatusValidator,
};
