const Property = require("../models/Property");
const ViewingRequest = require("../models/ViewingRequest");
const User = require("../models/User");

class DashboardService {
  /**
   * Computes high-level platform statistics and recent activities for the Admin dashboard.
   */
  async getDashboardStats() {
    const [
      // Properties
      totalProperties,
      publishedProperties,
      draftProperties,
      unpublishedProperties,
      availableProperties,
      rentedProperties,

      // Viewings
      totalViewings,
      pendingViewings,
      confirmedViewings,
      completedViewings,
      rejectedViewings,

      // Users
      totalTenants,
      verifiedTenants,
      blockedTenants,

      // Recent Viewings
      recentViewings,
    ] = await Promise.all([
      // Property Counts
      Property.countDocuments(),
      Property.countDocuments({ status: "published" }),
      Property.countDocuments({ status: "draft" }),
      Property.countDocuments({ status: "unpublished" }),
      Property.countDocuments({ status: "published", availability: true }),
      Property.countDocuments({ availability: false }),

      // Viewing Counts
      ViewingRequest.countDocuments(),
      ViewingRequest.countDocuments({ status: "pending" }),
      ViewingRequest.countDocuments({ status: "confirmed" }),
      ViewingRequest.countDocuments({ status: "completed" }),
      ViewingRequest.countDocuments({ status: "rejected" }),

      // User Counts
      User.countDocuments({ role: "TENANT" }),
      User.countDocuments({ role: "TENANT", isEmailVerified: true }),
      User.countDocuments({ role: "TENANT", isBlocked: true }),

      // Recent 5 Viewing Requests
      ViewingRequest.find()
        .populate("propertyId", "title price location status")
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    return {
      properties: {
        total: totalProperties,
        published: publishedProperties,
        draft: draftProperties,
        unpublished: unpublishedProperties,
        available: availableProperties,
        rented: rentedProperties,
      },
      viewings: {
        total: totalViewings,
        pending: pendingViewings,
        confirmed: confirmedViewings,
        completed: completedViewings,
        rejected: rejectedViewings,
      },
      users: {
        totalTenants,
        verifiedTenants,
        blockedTenants,
      },
      recentViewings,
    };
  }
}

module.exports = new DashboardService();
