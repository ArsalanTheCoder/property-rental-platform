const favoriteService = require("../services/favorite.service");
const ApiResponse = require("../utils/ApiResponse");

class FavoriteController {
  /**
   * GET /api/v1/favorites
   */
  async getFavorites(req, res, next) {
    try {
      const result = await favoriteService.getUserFavorites(
        req.user._id,
        req.query
      );
      return new ApiResponse(
        200,
        "Favorites retrieved successfully",
        result
      ).send(res);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/favorites/:propertyId
   */
  async addFavorite(req, res, next) {
    try {
      const result = await favoriteService.addFavorite(
        req.user._id,
        req.params.propertyId
      );
      return new ApiResponse(201, "Property added to favorites", result).send(
        res
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/favorites/:propertyId
   */
  async removeFavorite(req, res, next) {
    try {
      const result = await favoriteService.removeFavorite(
        req.user._id,
        req.params.propertyId
      );
      return new ApiResponse(
        200,
        "Property removed from favorites",
        result
      ).send(res);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/favorites/check/:propertyId
   */
  async checkFavorite(req, res, next) {
    try {
      const result = await favoriteService.checkFavoriteStatus(
        req.user._id,
        req.params.propertyId
      );
      return new ApiResponse(200, "Favorite status checked", result).send(res);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new FavoriteController();
