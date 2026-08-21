const Favorite = require("../models/Favorite");
const Property = require("../models/Property");
const ApiError = require("../utils/ApiError");

class FavoriteService {
  /**
   * Retrieves all saved favorites for a tenant with pagination.
   */
  async getUserFavorites(userId, { page = 1, limit = 10 }) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const [favorites, totalFavorites] = await Promise.all([
      Favorite.find({ userId })
        .populate({
          path: "propertyId",
          match: { status: "published" }, // Only include published properties
          select:
            "title propertyType price location bedrooms bathrooms images availability status",
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Favorite.countDocuments({ userId }),
    ]);

    // Filter out favorites whose property was unpublished/deleted
    const validFavorites = favorites
      .filter((fav) => fav.propertyId !== null)
      .map((fav) => ({
        _id: fav._id,
        property: fav.propertyId,
        createdAt: fav.createdAt,
      }));

    const totalPages = Math.ceil(totalFavorites / limitNum) || 1;

    return {
      favorites: validFavorites,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalFavorites,
        limit: limitNum,
      },
    };
  }

  /**
   * Adds a property to tenant favorites (idempotent upsert).
   */
  async addFavorite(userId, propertyId) {
    const property = await Property.findOne({
      _id: propertyId,
      status: "published",
    });

    if (!property) {
      throw new ApiError(404, "Property not found or unavailable to favorite.");
    }

    await Favorite.findOneAndUpdate(
      { userId, propertyId },
      { userId, propertyId },
      { upsert: true, returnDocument: "after" }
    );

    return {
      isFavorited: true,
      propertyId,
    };
  }

  /**
   * Removes a property from tenant favorites.
   */
  async removeFavorite(userId, propertyId) {
    await Favorite.findOneAndDelete({ userId, propertyId });

    return {
      isFavorited: false,
      propertyId,
    };
  }

  /**
   * Checks if a specific property is favorited by the user.
   */
  async checkFavoriteStatus(userId, propertyId) {
    const exists = await Favorite.exists({ userId, propertyId });

    return {
      propertyId,
      isFavorited: Boolean(exists),
    };
  }
}

module.exports = new FavoriteService();
