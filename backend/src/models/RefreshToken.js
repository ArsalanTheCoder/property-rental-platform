const mongoose = require("mongoose");

const refreshTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // TTL index for automatic session expiry
    },
    revoked: {
      type: Boolean,
      default: false,
      index: true,
    },
    userAgent: {
      type: String,
      default: null,
    },
    ip: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Compound index for querying active sessions for a user
refreshTokenSchema.index({ userId: 1, revoked: 1 });

const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema);

module.exports = RefreshToken;
