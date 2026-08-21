const viewingService = require("../services/viewing.service");
const ApiResponse = require("../utils/ApiResponse");

class AdminViewingController {
  /**
   * GET /api/v1/admin/viewings
   */
  async getViewings(req, res, next) {
    try {
      const result = await viewingService.getAdminViewings(req.query);
      return new ApiResponse(
        200,
        "Viewing requests retrieved successfully",
        result
      ).send(res);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/admin/viewings/:id
   */
  async getViewingById(req, res, next) {
    try {
      const viewing = await viewingService.getViewingById(req.params.id);
      return new ApiResponse(200, "OK", { viewing }).send(res);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/admin/viewings/:id/status
   */
  async updateViewingStatus(req, res, next) {
    try {
      const viewing = await viewingService.updateViewingStatus(
        req.params.id,
        req.body
      );
      return new ApiResponse(
        200,
        `Viewing request status updated to ${req.body.status}`,
        { viewing }
      ).send(res);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/admin/viewings/:id/lead-score
   */
  async getLeadScore(req, res, next) {
    try {
      const result = await viewingService.getOrComputeLeadScore(req.params.id);
      return new ApiResponse(
        200,
        "AI lead score evaluated",
        result
      ).send(res);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminViewingController();
