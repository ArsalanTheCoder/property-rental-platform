const ViewingRequest = require("../models/ViewingRequest");
const Property = require("../models/Property");
const aiService = require("./ai.service");
const ApiError = require("../utils/ApiError");

class TenantViewingService {
  /**
   * Submits a physical viewing visit request for a property.
   */
  async submitViewingRequest(user, propertyId, { date, time, message }) {
    const property = await Property.findOne({
      _id: propertyId,
      status: "published",
    });

    if (!property) {
      throw new ApiError(
        404,
        "Property not found or unavailable for viewings."
      );
    }

    if (!property.availability) {
      throw new ApiError(
        400,
        "This property is currently marked as occupied or rented."
      );
    }

    // Automatically evaluate AI Lead Score on submission
    const leadScore = await aiService.calculateLeadScore({
      tenantName: user.name,
      email: user.email,
      message: message || "",
      viewingDate: date,
      viewingTime: time,
      propertyPrice: property.price,
    });

    const viewing = await ViewingRequest.create({
      userId: user._id,
      propertyId: property._id,
      userName: user.name,
      date,
      time,
      message: message || "",
      status: "pending",
      leadScore,
    });

    return viewing;
  }

  /**
   * Retrieves all viewing requests submitted by the logged-in tenant.
   */
  async getMyViewingRequests(userId, { page = 1, limit = 10, status }) {
    const query = { userId };

    if (status) {
      query.status = status;
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const [viewings, totalViewings] = await Promise.all([
      ViewingRequest.find(query)
        .populate({
          path: "propertyId",
          select: "title price location images propertyType",
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      ViewingRequest.countDocuments(query),
    ]);

    const formattedViewings = viewings.map((v) => ({
      _id: v._id,
      property: v.propertyId,
      date: v.date,
      time: v.time,
      message: v.message,
      status: v.status,
      adminNote: v.adminNote,
      createdAt: v.createdAt,
    }));

    const totalPages = Math.ceil(totalViewings / limitNum) || 1;

    return {
      viewings: formattedViewings,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalViewings,
        limit: limitNum,
      },
    };
  }

  /**
   * Cancels a pending viewing request submitted by the tenant.
   */
  async cancelMyViewingRequest(userId, viewingId) {
    const viewing = await ViewingRequest.findOne({
      _id: viewingId,
      userId,
    });

    if (!viewing) {
      throw new ApiError(404, "Viewing request not found.");
    }

    if (viewing.status === "cancelled") {
      return viewing;
    }

    if (viewing.status === "completed") {
      throw new ApiError(
        400,
        "Cannot cancel a viewing that has already been completed."
      );
    }

    viewing.status = "cancelled";
    await viewing.save();

    return viewing;
  }
}

module.exports = new TenantViewingService();
