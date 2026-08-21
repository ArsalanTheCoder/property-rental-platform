const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Property title is required"],
      trim: true,
      minlength: [5, "Title must be at least 5 characters"],
      maxlength: [150, "Title cannot exceed 150 characters"],
      index: true,
    },
    description: {
      type: String,
      required: [true, "Property description is required"],
      trim: true,
    },
    propertyType: {
      type: String,
      required: [true, "Property type is required"],
      enum: {
        values: [
          "Apartment",
          "House",
          "Villa",
          "Studio",
          "Commercial",
          "Penthouse",
        ],
        message: "{VALUE} is not a supported property type",
      },
      index: true,
    },
    price: {
      type: Number,
      required: [true, "Monthly rent price is required"],
      min: [0, "Price cannot be negative"],
      index: true,
    },
    location: {
      address: {
        type: String,
        required: [true, "Street address / area is required"],
        trim: true,
      },
      city: {
        type: String,
        required: [true, "City is required"],
        trim: true,
        index: true,
      },
    },
    bedrooms: {
      type: Number,
      required: [true, "Number of bedrooms is required"],
      min: [0, "Bedrooms cannot be negative"],
      index: true,
    },
    bathrooms: {
      type: Number,
      required: [true, "Number of bathrooms is required"],
      min: [1, "At least 1 bathroom is required"],
    },
    amenities: {
      type: [String],
      default: [],
      index: true,
    },
    furnished: {
      type: Boolean,
      default: false,
      index: true,
    },
    images: {
      type: [String], // Array of Cloudinary CDN image URLs
      default: [],
    },
    availability: {
      type: Boolean,
      default: true,
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ["draft", "pending", "published", "unpublished"],
        message: "{VALUE} is not a valid property status",
      },
      default: "draft",
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound and text indexes for search & multi-field filtering
propertySchema.index({
  title: "text",
  description: "text",
  "location.address": "text",
  "location.city": "text",
});

propertySchema.index({ status: 1, price: 1, propertyType: 1, "location.city": 1 });

const Property = mongoose.model("Property", propertySchema);

module.exports = Property;
