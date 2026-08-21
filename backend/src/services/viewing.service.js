const ViewingRequest = require("../models/ViewingRequest");
const User = require("../models/User");
const Property = require("../models/Property");
const aiService = require("./ai.service");
const ApiError = require("../utils/ApiError");

class ViewingService {
  /**
   * Retrieves all viewing requests for admin panel with filtering & pagination.
   */
  async getAdminViewings({ page = 1, limit = 10, status, propertyId, date }) {
    const query = {};

    if (status) {
      query.status = status;
    }

    if (propertyId) {
      query.propertyId = propertyId;
    }

    if (date) {
      query.date = date;
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const [viewings, totalViewings] = await Promise.all([
      ViewingRequest.find(query)
        .populate("userId", "name email isEmailVerified")
        .populate("propertyId", "title price location images status")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      ViewingRequest.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalViewings / limitNum) || 1;

    return {
      viewings,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalViewings,
        limit: limitNum,
      },
    };
  }

  /**
   * Retrieves single viewing request details.
   */
  async getViewingById(id) {
    const viewing = await ViewingRequest.findById(id)
      .populate("userId", "name email isEmailVerified createdAt")
      .populate("propertyId", "title description price location images availability status");

    if (!viewing) {
      throw new ApiError(404, "Viewing request not found.");
    }
    return viewing;
  }

  /**
   * Updates viewing request status (confirmed, rejected, completed, cancelled) and admin notes.
   */
  async updateViewingStatus(id, { status, adminNote }) {
    const viewing = await ViewingRequest.findById(id);
    if (!viewing) {
      throw new ApiError(404, "Viewing request not found.");
    }

    if (status) {
      viewing.status = status;
    }

    if (adminNote !== undefined) {
      viewing.adminNote = adminNote;
    }

    await viewing.save();
    return viewing;
  }

  /**
   * Evaluates or retrieves the AI Lead Score for a viewing request.
   */
  async getOrComputeLeadScore(id) {
    const viewing = await ViewingRequest.findById(id)
      .populate("userId", "name email isEmailVerified")
      .populate("propertyId", "price title");

    if (!viewing) {
      throw new ApiError(404, "Viewing request not found.");
    }

    // Return existing score if already evaluated
    if (viewing.leadScore && viewing.leadScore.score !== null) {
      return {
        viewingId: viewing._id,
        leadScore: viewing.leadScore,
      };
    }

    // Compute new AI Lead Score
    const evaluation = await aiService.calculateLeadScore({
      tenantName: viewing.userName || viewing.userId?.name,
      email: viewing.userId?.email,
      message: viewing.message || "",
      viewingDate: viewing.date,
      viewingTime: viewing.time,
      propertyPrice: viewing.propertyId?.price,
    });

    viewing.leadScore = evaluation;
    await viewing.save();

    return {
      viewingId: viewing._id,
      leadScore: viewing.leadScore,
    };
  }
}

module.exports = new ViewingService();
