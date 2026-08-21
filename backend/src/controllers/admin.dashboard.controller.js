const dashboardService = require("../services/dashboard.service");
const ApiResponse = require("../utils/ApiResponse");

class AdminDashboardController {
  /**
   * GET /api/v1/admin/dashboard/stats
   */
  async getDashboardStats(req, res, next) {
    try {
      const stats = await dashboardService.getDashboardStats();
      return new ApiResponse(
        200,
        "Dashboard statistics retrieved successfully",
        stats
      ).send(res);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminDashboardController();
