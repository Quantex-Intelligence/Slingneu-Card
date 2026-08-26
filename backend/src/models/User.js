const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    profile: {
      type: String,
      default: null,
    },
    profilePublicId: {
      type: String,
      default: null,
    },
    fcmToken: {
      type: String,
      default: null,
    },
    isKyc: {
      type: Boolean,
      default: false,
    },
    kycDetails: {
      type: Object,
      default: {},
    },
    // M2P Integration fields
    entityId: {
      type: String,
      default: null,
      index: true,
    },
    walletBalance: {
      type: Number,
      default: 0,
    },
    // Referral code fields
    referralCode: {
      type: String,
      unique: true,
      sparse: true,
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    referralCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
