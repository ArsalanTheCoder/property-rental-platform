const mongoose = require("mongoose");

const viewingRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Tenant User ID is required"],
      index: true,
    },
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: [true, "Property ID is required"],
      index: true,
    },
    userName: {
      type: String,
      required: [true, "Tenant name is required"],
      trim: true,
    },
    date: {
      type: String, // Format: YYYY-MM-DD
      required: [true, "Viewing date is required"],
      index: true,
    },
    time: {
      type: String, // Format: HH:MM or "14:00"
      required: [true, "Viewing time is required"],
    },
    message: {
      type: String,
      trim: true,
      default: "",
      maxlength: [500, "Message cannot exceed 500 characters"],
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "confirmed", "rejected", "cancelled", "completed"],
        message: "{VALUE} is not a valid viewing status",
      },
      default: "pending",
      index: true,
    },
    adminNote: {
      type: String,
      trim: true,
      default: null,
    },
    leadScore: {
      score: {
        type: Number,
        min: 0,
        max: 100,
        default: null,
      },
      reasoning: {
        type: String,
        default: null,
      },
      evaluatedAt: {
        type: Date,
        default: null,
      },
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

viewingRequestSchema.index({ propertyId: 1, date: 1, time: 1, status: 1 });

const ViewingRequest = mongoose.model("ViewingRequest", viewingRequestSchema);

module.exports = ViewingRequest;
