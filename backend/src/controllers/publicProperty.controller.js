const publicPropertyService = require("../services/publicProperty.service");
const ApiResponse = require("../utils/ApiResponse");

class PublicPropertyController {
  /**
   * GET /api/v1/properties
   */
  async getProperties(req, res, next) {
    try {
      const result = await publicPropertyService.getPublicProperties(
        req.query
      );
      return new ApiResponse(
        200,
        "Properties retrieved successfully",
        result
      ).send(res);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/properties/featured
   */
  async getFeatured(req, res, next) {
    try {
      const limit = parseInt(req.query.limit, 10) || 6;
      const result = await publicPropertyService.getFeaturedProperties(limit);
      return new ApiResponse(
        200,
        "Featured properties retrieved successfully",
        result
      ).send(res);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/properties/:id
   */
  async getPropertyById(req, res, next) {
    try {
      const userId = req.user?._id || null;
      const result = await publicPropertyService.getPublicPropertyById(
        req.params.id,
        userId
      );
      return new ApiResponse(200, "Property retrieved successfully", result).send(
        res
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/properties/:id/chat
   */
  async chatWithProperty(req, res, next) {
    try {
      const { question } = req.body;
      const result = await publicPropertyService.chatWithPropertyAI(
        req.params.id,
        question
      );
      return new ApiResponse(
        200,
        "AI answer generated successfully",
        result
      ).send(res);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PublicPropertyController();
