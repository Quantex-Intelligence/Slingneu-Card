const mongoose = require("mongoose");

const cashbackSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      default: null,
    },
    imagePublicId: {
      type: String,
      default: null,
    },
    conditions: [
      {
        type: {
          type: String,
          enum: ['first_payment', 'amount_based', 'percentage_based'],
          required: true,
        },
        description: {
          type: String,
          required: true,
          trim: true,
        },
        cashbackAmount: {
          type: Number,
          required: true,
        },
        cashbackPercentage: {
          type: Number,
          default: null,
        },
        minimumAmount: {
          type: Number,
          default: null,
        },
        maximumAmount: {
          type: Number,
          default: null,
        },
      }
    ],
    isActive: {
      type: Boolean,
      default: true,
    }
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
cashbackSchema.index({ isActive: 1 });
cashbackSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Cashback", cashbackSchema); 