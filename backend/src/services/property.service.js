const Property = require("../models/Property");
const ApiError = require("../utils/ApiError");
const {
  uploadImageStream,
  deleteCloudinaryImage,
} = require("../utils/cloudinary");

class PropertyService {
  /**
   * Creates a new property listing.
   */
  async createProperty(data, adminId) {
    const property = await Property.create({
      ...data,
      createdBy: adminId,
    });
    return property;
  }

  /**
   * Retrieves all properties for admin panel with pagination, search, and filters.
   */
  async getAdminProperties({
    page = 1,
    limit = 10,
    search,
    status,
    propertyType,
    city,
    minPrice,
    maxPrice,
    bedrooms,
    furnished,
  }) {
    const query = {};

    // Search filter across title, description, address, city
    if (search && search.trim()) {
      query.$text = { $search: search.trim() };
    }

    // Status filter
    if (status) {
      query.status = status;
    }

    // Property Type filter
    if (propertyType) {
      query.propertyType = propertyType;
    }

    // City filter
    if (city) {
      query["location.city"] = new RegExp(city.trim(), "i");
    }

    // Price range
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) query.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) query.price.$lte = Number(maxPrice);
    }

    // Bedrooms
    if (bedrooms !== undefined) {
      query.bedrooms = Number(bedrooms);
    }

    // Furnished
    if (furnished !== undefined) {
      query.furnished = furnished === "true" || furnished === true;
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const [properties, totalProperties] = await Promise.all([
      Property.find(query)
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Property.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalProperties / limitNum) || 1;

    return {
      properties,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalProperties,
        limit: limitNum,
      },
    };
  }

  /**
   * Retrieves full details for a single property.
   */
  async getPropertyById(id) {
    const property = await Property.findById(id).populate(
      "createdBy",
      "name email"
    );
    if (!property) {
      throw new ApiError(404, "Property not found.");
    }
    return property;
  }

  /**
   * Updates an existing property.
   */
  async updateProperty(id, updateData) {
    const property = await Property.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate("createdBy", "name email");

    if (!property) {
      throw new ApiError(404, "Property not found.");
    }
    return property;
  }

  /**
   * Quick status toggle (draft -> published -> unpublished).
   */
  async updatePropertyStatus(id, status) {
    const property = await Property.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!property) {
      throw new ApiError(404, "Property not found.");
    }
    return property;
  }

  /**
   * Deletes a property and cleans up all Cloudinary assets.
   */
  async deleteProperty(id) {
    const property = await Property.findById(id);
    if (!property) {
      throw new ApiError(404, "Property not found.");
    }

    // Delete associated images from Cloudinary
    if (Array.isArray(property.images) && property.images.length > 0) {
      for (const imageUrl of property.images) {
        await deleteCloudinaryImage(imageUrl);
      }
    }

    await Property.findByIdAndDelete(id);
    return true;
  }

  /**
   * Uploads multiple image files to Cloudinary and attaches URLs to property.
   */
  async uploadPropertyImages(propertyId, files = []) {
    const property = await Property.findById(propertyId);
    if (!property) {
      throw new ApiError(404, "Property not found.");
    }

    if (!files || files.length === 0) {
      throw new ApiError(400, "No image files provided for upload.");
    }

    const uploadedUrls = [];
    for (const file of files) {
      const uploadResult = await uploadImageStream(file.buffer, "properties");
      uploadedUrls.push(uploadResult.url);
    }

    // Append new URLs to existing images array
    property.images.push(...uploadedUrls);
    await property.save();

    return {
      propertyId: property._id,
      images: property.images,
      newlyUploaded: uploadedUrls,
    };
  }

  /**
   * Deletes a specific image URL from a property and Cloudinary.
   */
  async deletePropertyImage(propertyId, imageUrl) {
    const property = await Property.findById(propertyId);
    if (!property) {
      throw new ApiError(404, "Property not found.");
    }

    if (!property.images.includes(imageUrl)) {
      throw new ApiError(404, "Image URL not found on this property.");
    }

    // Remove from array
    property.images = property.images.filter((img) => img !== imageUrl);
    await property.save();

    // Delete from Cloudinary
    await deleteCloudinaryImage(imageUrl);

    return {
      propertyId: property._id,
      images: property.images,
    };
  }
}

module.exports = new PropertyService();
