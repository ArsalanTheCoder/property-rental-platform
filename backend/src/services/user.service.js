const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");
const ViewingRequest = require("../models/ViewingRequest");
const ApiError = require("../utils/ApiError");

class UserService {
  /**
   * Retrieves tenant users for admin panel with search, filters, and pagination.
   */
  async getAdminUsers({
    page = 1,
    limit = 10,
    search,
    isBlocked,
    isEmailVerified,
    role = "TENANT",
  }) {
    const query = {};

    if (role) {
      query.role = role;
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      query.$or = [{ name: regex }, { email: regex }];
    }

    if (isBlocked !== undefined) {
      query.isBlocked = isBlocked === "true" || isBlocked === true;
    }

    if (isEmailVerified !== undefined) {
      query.isEmailVerified =
        isEmailVerified === "true" || isEmailVerified === true;
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const [users, totalUsers] = await Promise.all([
      User.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      User.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalUsers / limitNum) || 1;

    return {
      users,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalUsers,
        limit: limitNum,
      },
    };
  }

  /**
   * Retrieves single user details with viewing history metrics.
   */
  async getUserById(id) {
    const user = await User.findById(id);
    if (!user) {
      throw new ApiError(404, "User not found.");
    }

    const totalViewings = await ViewingRequest.countDocuments({ userId: id });

    return {
      user,
      metrics: {
        totalViewings,
      },
    };
  }

  /**
   * Updates user account moderation status (block/unblock, activate/deactivate).
   * If blocked, revokes all active refresh token sessions immediately.
   */
  async updateUserStatus(id, { isBlocked, isActive }) {
    const user = await User.findById(id);
    if (!user) {
      throw new ApiError(404, "User not found.");
    }

    if (isBlocked !== undefined) {
      user.isBlocked = isBlocked;
    }

    if (isActive !== undefined) {
      user.isActive = isActive;
    }

    await user.save();

    // If user is blocked or deactivated, invalidate all active sessions
    if (user.isBlocked || !user.isActive) {
      await RefreshToken.updateMany(
        { userId: user._id, revoked: false },
        { revoked: true }
      );
    }

    return {
      userId: user._id,
      isBlocked: user.isBlocked,
      isActive: user.isActive,
    };
  }
}

module.exports = new UserService();
