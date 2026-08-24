const mongoose = require("mongoose");

const scratchCardSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    key: {
      type: Boolean,
      default: false,
    },
    cashbackAmount: {
      type: Number,
      default: 0,
    },
    cashbackPercentage: {
      type: Number,
      default: 0,
    },
    appliedCashbackCondition: {
      type: {
        type: String,
        enum: ['first_payment', 'amount_based', 'percentage_based'],
      },
      description: String,
      minimumAmount: Number,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
    usedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
scratchCardSchema.index({ user: 1 });
scratchCardSchema.index({ isActive: 1 });
scratchCardSchema.index({ isUsed: 1 });
scratchCardSchema.index({ createdAt: -1 });

module.exports = mongoose.model("ScratchCard", scratchCardSchema); 