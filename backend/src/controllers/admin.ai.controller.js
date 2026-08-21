const aiService = require("../services/ai.service");
const ApiResponse = require("../utils/ApiResponse");

class AdminAIController {
  /**
   * POST /api/v1/admin/ai/generate-description
   */
  async generateDescription(req, res, next) {
    try {
      const result = await aiService.generatePropertyDescription(req.body);
      return new ApiResponse(
        200,
        "AI content generated successfully",
        result
      ).send(res);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminAIController();
