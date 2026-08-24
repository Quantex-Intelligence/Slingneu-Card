const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    index: true
  },
  otp: {
    type: String,
    required: true
  },
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 } // Auto-delete expired documents
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create compound index for phone and orderId
otpSchema.index({ phone: 1, orderId: 1 });

// Method to check if OTP is expired
otpSchema.methods.isExpired = function() {
  return new Date() > this.expiresAt;
};

// Method to mark OTP as verified
otpSchema.methods.markAsVerified = function() {
  this.isVerified = true;
  return this.save();
};

// Static method to find valid OTP
otpSchema.statics.findValidOtp = function(phone, otp, orderId) {
  return this.findOne({
    phone,
    otp,
    orderId,
    isVerified: false,
    expiresAt: { $gt: new Date() }
  });
};

// Static method to delete OTP after verification
otpSchema.statics.deleteAfterVerification = function(phone, orderId) {
  return this.deleteOne({ phone, orderId });
};

module.exports = mongoose.model('Otp', otpSchema);
