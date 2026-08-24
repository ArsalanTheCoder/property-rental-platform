const userService = require("../services/user.service");
const ApiResponse = require("../utils/ApiResponse");

class AdminUserController {
  /**
   * GET /api/v1/admin/users
   */
  async getUsers(req, res, next) {
    try {
      const result = await userService.getAdminUsers(req.query);
      return new ApiResponse(
        200,
        "Users retrieved successfully",
        result
      ).send(res);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/admin/users/:id
   */
  async getUserById(req, res, next) {
    try {
      const result = await userService.getUserById(req.params.id);
      return new ApiResponse(200, "OK", result).send(res);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/admin/users/:id/status
   */
  async updateUserStatus(req, res, next) {
    try {
      const result = await userService.updateUserStatus(
        req.params.id,
        req.body
      );
      return new ApiResponse(
        200,
        "User account status updated successfully",
        result
      ).send(res);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminUserController();
