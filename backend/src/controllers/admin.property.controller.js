const propertyService = require("../services/property.service");
const ApiResponse = require("../utils/ApiResponse");

class AdminPropertyController {
  /**
   * POST /api/v1/admin/properties
   */
  async createProperty(req, res, next) {
    try {
      const property = await propertyService.createProperty(
        req.body,
        req.user._id
      );
      return new ApiResponse(
        201,
        "Property created successfully",
        { property }
      ).send(res);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/admin/properties
   */
  async getProperties(req, res, next) {
    try {
      const result = await propertyService.getAdminProperties(req.query);
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
   * GET /api/v1/admin/properties/:id
   */
  async getPropertyById(req, res, next) {
    try {
      const property = await propertyService.getPropertyById(req.params.id);
      return new ApiResponse(200, "OK", { property }).send(res);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/admin/properties/:id
   */
  async updateProperty(req, res, next) {
    try {
      const property = await propertyService.updateProperty(
        req.params.id,
        req.body
      );
      return new ApiResponse(
        200,
        "Property updated successfully",
        { property }
      ).send(res);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/admin/properties/:id/status
   */
  async updatePropertyStatus(req, res, next) {
    try {
      const property = await propertyService.updatePropertyStatus(
        req.params.id,
        req.body.status
      );
      return new ApiResponse(
        200,
        `Property status updated to ${req.body.status}`,
        {
          propertyId: property._id,
          status: property.status,
        }
      ).send(res);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/admin/properties/:id
   */
  async deleteProperty(req, res, next) {
    try {
      await propertyService.deleteProperty(req.params.id);
      return new ApiResponse(
        200,
        "Property and associated assets deleted successfully",
        null
      ).send(res);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/admin/properties/:id/images
   */
  async uploadImages(req, res, next) {
    try {
      const files = req.files || [];
      const result = await propertyService.uploadPropertyImages(
        req.params.id,
        files
      );
      return new ApiResponse(
        200,
        "Images uploaded successfully",
        result
      ).send(res);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/admin/properties/:id/images
   */
  async deleteImage(req, res, next) {
    try {
      const { imageUrl } = req.body;
      const result = await propertyService.deletePropertyImage(
        req.params.id,
        imageUrl
      );
      return new ApiResponse(
        200,
        "Image removed successfully",
        result
      ).send(res);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminPropertyController();
