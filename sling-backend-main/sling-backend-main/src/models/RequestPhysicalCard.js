const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  address1: {
    type: String,
    required: true,
    trim: true,
  },
  address2: {
    type: String,
    trim: true,
  },
  city: {
    type: String,
    required: true,
    trim: true,
  },
  state: {
    type: String,
    required: true,
    trim: true,
  },
  country: {
    type: String,
    required: true,
    trim: true,
  },
  pinCode: {
    type: String,
    required: true,
    trim: true,
  },
  aliasName: {
    type: String,
    required: true,
    trim: true,
  },
  fourthLine: {
    type: String,
    trim: true,
  },
});

const requestPhysicalCardSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    rollnumber: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    entityId: {
      type: String,
      required: true,
      trim: true,
    },
    kitNo: {
      type: String,
      required: true,
      trim: true,
    },
    addressDto: {
      address: [addressSchema],
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "PROCESSING", "DELIVERED"],
      default: "PENDING",
      index: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index for user and rollnumber
requestPhysicalCardSchema.index({ user: 1, rollnumber: 1 });

module.exports = mongoose.model("RequestPhysicalCard", requestPhysicalCardSchema); 