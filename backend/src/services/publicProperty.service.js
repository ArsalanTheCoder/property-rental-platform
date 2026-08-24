const Property = require("../models/Property");
const Favorite = require("../models/Favorite");
const aiService = require("./ai.service");
const ApiError = require("../utils/ApiError");

class PublicPropertyService {
  /**
   * Search and filter published properties for public discovery.
   */
  async getPublicProperties({
    page = 1,
    limit = 12,
    search,
    city,
    propertyType,
    minPrice,
    maxPrice,
    bedrooms,
    bathrooms,
    furnished,
    amenities,
    sort = "newest",
  }) {
    // Strictly enforce published status for public discovery
    const query = { status: "published" };

    // Search query across title, description, address, city
    if (search && search.trim()) {
      query.$text = { $search: search.trim() };
    }

    // City filter
    if (city && city.trim()) {
      query["location.city"] = new RegExp(city.trim(), "i");
    }

    // Property Type
    if (propertyType) {
      query.propertyType = propertyType;
    }

    // Price Bounds
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) query.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) query.price.$lte = Number(maxPrice);
    }

    // Bedrooms & Bathrooms
    if (bedrooms !== undefined) {
      query.bedrooms = Number(bedrooms);
    }
    if (bathrooms !== undefined) {
      query.bathrooms = Number(bathrooms);
    }

    // Furnished status
    if (furnished !== undefined) {
      query.furnished = furnished === "true" || furnished === true;
    }

    // Amenities (supports comma-separated string e.g. "Parking,Generator")
    if (amenities) {
      const amenitiesList = Array.isArray(amenities)
        ? amenities
        : amenities.split(",").map((a) => a.trim());
      query.amenities = { $all: amenitiesList };
    }

    // Sorting logic
    let sortOptions = { createdAt: -1 }; // default newest
    if (sort === "price_asc") sortOptions = { price: 1 };
    else if (sort === "price_desc") sortOptions = { price: -1 };
    else if (sort === "bedrooms_desc") sortOptions = { bedrooms: -1 };

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    const [properties, totalProperties] = await Promise.all([
      Property.find(query)
        .select("-createdBy")
        .sort(sortOptions)
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
   * Retrieves featured / top published properties for landing page hero banners.
   */
  async getFeaturedProperties(limit = 6) {
    const limitNum = Math.max(1, Math.min(20, parseInt(limit, 10) || 6));
    const properties = await Property.find({
      status: "published",
      availability: true,
    })
      .select("-createdBy")
      .sort({ createdAt: -1 })
      .limit(limitNum);

    return { properties };
  }

  /**
   * Retrieves single public property details with optional favorite check.
   */
  async getPublicPropertyById(id, userId = null) {
    const property = await Property.findOne({
      _id: id,
      status: "published",
    }).select("-createdBy");

    if (!property) {
      throw new ApiError(404, "Property not found or unavailable.");
    }

    const propertyObj = property.toObject();

    // If tenant is logged in, check if they have favorited this property
    if (userId) {
      const isFav = await Favorite.exists({ userId, propertyId: id });
      propertyObj.isFavorited = Boolean(isFav);
    } else {
      propertyObj.isFavorited = false;
    }

    return { property: propertyObj };
  }

  /**
   * Grounded AI Chatbot answering questions based on the listing context.
   */
  async chatWithPropertyAI(propertyId, question) {
    const property = await Property.findOne({
      _id: propertyId,
      status: "published",
    });

    if (!property) {
      throw new ApiError(404, "Property not found or unavailable.");
    }

    const result = await aiService.answerPropertyQuestion({
      propertyContext: property,
      question,
    });

    return {
      propertyId: property._id,
      question,
      answer: result.answer,
    };
  }
}

module.exports = new PublicPropertyService();
