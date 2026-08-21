const tenantViewingService = require("../services/tenantViewing.service");
const ApiResponse = require("../utils/ApiResponse");

class TenantViewingController {
  /**
   * POST /api/v1/properties/:id/viewings
   */
  async submitViewing(req, res, next) {
    try {
      const viewing = await tenantViewingService.submitViewingRequest(
        req.user,
        req.params.id,
        req.body
      );
      return new ApiResponse(
        201,
        "Viewing request submitted successfully. The team will review and confirm shortly.",
        { viewing }
      ).send(res);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/viewings/my-requests
   */
  async getMyRequests(req, res, next) {
    try {
      const result = await tenantViewingService.getMyViewingRequests(
        req.user._id,
        req.query
      );
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
   * PATCH /api/v1/viewings/:id/cancel
   */
  async cancelRequest(req, res, next) {
    try {
      const viewing = await tenantViewingService.cancelMyViewingRequest(
        req.user._id,
        req.params.id
      );
      return new ApiResponse(
        200,
        "Viewing request cancelled successfully",
        {
          viewingId: viewing._id,
          status: viewing.status,
        }
      ).send(res);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TenantViewingController();
