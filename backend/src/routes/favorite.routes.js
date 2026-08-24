const express = require("express");
const favoriteController = require("../controllers/favorite.controller");
const { authenticate } = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const {
  favoriteParamValidator,
} = require("../validators/tenant.validator");

const router = express.Router();

// Require tenant authentication on all favorite endpoints
router.use(authenticate);

// 1. List user favorites
router.get("/", favoriteController.getFavorites);

// 2. Check if a property is favorited
router.get(
  "/check/:propertyId",
  favoriteParamValidator,
  validate,
  favoriteController.checkFavorite
);

// 3. Add to favorites
router.post(
  "/:propertyId",
  favoriteParamValidator,
  validate,
  favoriteController.addFavorite
);

// 4. Remove from favorites
router.delete(
  "/:propertyId",
  favoriteParamValidator,
  validate,
  favoriteController.removeFavorite
);

module.exports = router;
