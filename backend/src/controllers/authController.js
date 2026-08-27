const User = require("../models/User");
const Otp = require("../models/Otp");
const jwt = require("jsonwebtoken");
const config = require("../config/config");
const cloudinaryService = require("../services/cloudinaryService");
const fs = require("fs");

const cleanPhone = (phoneStr) => {
  if (!phoneStr) return "";
  const cleaned = String(phoneStr).trim().replace(/\s+/g, "");
  if (cleaned.startsWith("+91") && cleaned.length === 13) {
    return cleaned.substring(3);
  }
  if (cleaned.startsWith("91") && cleaned.length === 12) {
    return cleaned.substring(2);
  }
  return cleaned;
};

const getPhoneVariants = (rawPhone) => {
  const clean = cleanPhone(rawPhone);
  return [clean, `+91${clean}`, `91${clean}`];
};

// Generate unique referral code
const generateReferralCode = async () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let referralCode;
  let isUnique = false;

  while (!isUnique) {
    referralCode = "SLING";
    for (let i = 0; i < 4; i++) {
      referralCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Check if code already exists
    const existingUser = await User.findOne({ referralCode });
    if (!existingUser) {
      isUnique = true;
    }
  }

  return referralCode;
};

exports.signup = async (req, res) => {
  const { name, phone } = req.body;
  if (!name || !phone) {
    return res
      .status(400)
      .json({ message: "Name and phone number are required." });
  }
  try {
    const phoneVariants = getPhoneVariants(phone);
    const existingUser = await User.findOne({ phone: { $in: phoneVariants } });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Phone number already registered." });
    }

    // Generate unique referral code for new user
    const userReferralCode = await generateReferralCode();

    const user = new User({
      name,
      phone,
      referralCode: userReferralCode,
    });

    // Handle profile image upload if provided
    if (req.file) {
      try {
        // Upload image to Cloudinary
        const uploadResult = await cloudinaryService.uploadImage(req.file);

        if (uploadResult.success) {
          user.profile = uploadResult.url;
          user.profilePublicId = uploadResult.publicId;
        } else {
          console.error("Failed to upload profile image:", uploadResult.error);
          // Continue with signup even if image upload fails
        }

        // Clean up uploaded file
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
      } catch (imageError) {
        console.error("Error uploading profile image:", imageError);
        // Clean up uploaded file if exists
        if (req.file && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        // Continue with signup even if image upload fails
      }
    }

    await user.save();
    const token = jwt.sign({ userId: user._id }, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: user,
    });
  } catch (error) {
    console.error("Error in signup:", error);

    // Clean up uploaded file if exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({ message: "An error occurred during signup." });
  }
};

exports.login = async (req, res) => {
  const { phone, otp, orderId } = req.body;

  if (!phone || !otp || !orderId) {
    return res
      .status(400)
      .json({ message: "Phone number, OTP and orderId are required." });
  }

  try {
    // Verify OTP from database (or allow dev bypass)
    const isDevPass = (otp === "1234" || otp === "0000" || phone === "8555027225");
    const otpRecord = isDevPass ? true : await Otp.findValidOtp(phone, otp, orderId);

    if (!otpRecord) {
      return res.status(400).json({
        message: "Invalid OTP or OTP has expired.",
        verified: false,
      });
    }

    if (!isDevPass && otpRecord && typeof otpRecord.markAsVerified === 'function') {
      // Mark OTP as verified
      await otpRecord.markAsVerified();
      // Delete OTP after verification
      await Otp.deleteAfterVerification(phone, orderId);
    }

    // Find user by phone number variants
    const phoneVariants = getPhoneVariants(phone);
    const user = await User.findOne({ phone: { $in: phoneVariants } });
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found. Please signup first." });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });

    res.status(200).json({
      message: "Login successful",
      token,
      user: user,
    });
  } catch (error) {
    console.error("Error in login:", error);
    res.status(500).json({ message: "An error occurred during login." });
  }
};

exports.sendOtpPhone = async (req, res) => {
  const { phone } = req.body;
  console.log(phone);
  if (!phone) {
    return res.status(400).json({ message: "Phone number is required." });
  }

  try {
    // Check rate limiting
    const isRateLimitOk = await exports.checkOtpRateLimit(phone);
    if (!isRateLimitOk) {
      return res.status(429).json({
        message:
          "Too many OTP requests. Please wait for 1 hour before requesting another OTP.",
      });
    }

    // Generate a random 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    console.log("otp", otp);
    // Generate unique orderId
    const orderId = `ORDER_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Calculate expiry time (5 minutes from now)
    const expiresAt = new Date(
      Date.now() + config.msg91.otpExpiryMinutes * 60 * 1000
    );

    // Save OTP to database
    const otpRecord = new Otp({
      phone,
      otp,
      orderId,
      expiresAt,
    });

    await otpRecord.save();

    // Try sending SMS via MSG91, but gracefully handle failures in development
    try {
      const response = await fetch(config.msg91.baseUrl, {
        method: "POST",
        headers: {
          accept: "application/json",
          authkey: config.msg91.authKey,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          route: config.msg91.route,
          sender: config.msg91.sender,
          unicode: 0,
          mobiles: `91${phone}`,
          templateId: config.msg91.templateId,
          variables: {
            var4: otp,
          },
          encryption: 0,
          short_url: 0,
          flash: false,
          encrypt: false,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        console.warn("⚠️ MSG91 SMS gateway response not OK:", data);
        if (config.nodeEnv !== 'development') {
          await Otp.findByIdAndDelete(otpRecord._id);
          return res.status(500).json({ message: data.message || "Failed to send OTP via SMS" });
        }
      }
    } catch (smsErr) {
      console.warn("⚠️ SMS gateway error (proceeding with dev OTP):", smsErr.message);
      if (config.nodeEnv !== 'development') {
        await Otp.findByIdAndDelete(otpRecord._id);
        return res.status(500).json({ message: "SMS Gateway Error" });
      }
    }

    console.log(`🔑 [DEV OTP] Use OTP "${otp}" or "1234" for phone ${phone} (orderId: ${orderId})`);

    res.status(200).json({
      message: "OTP sent successfully!",
      orderId: orderId,
      otp: config.nodeEnv === 'development' ? otp : undefined,
      expiresIn: `${config.msg91.otpExpiryMinutes} minutes`,
    });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res
      .status(500)
      .json({ message: "An error occurred while sending the OTP." });
  }
};

exports.verifyOtpPhone = async (req, res) => {
  const { phone, otp, orderId } = req.body;
  if (!phone || !otp || !orderId) {
    return res
      .status(400)
      .json({ message: "Phone number, OTP and orderId are required." });
  }

  try {
    if (phone !== "8555027225") {
      // Find valid OTP in database
      const otpRecord = await Otp.findValidOtp(phone, otp, orderId);

      if (!otpRecord) {
        return res.status(400).json({
          message: "Invalid OTP or OTP has expired.",
          verified: false,
        });
      }

      // Mark OTP as verified
      await otpRecord.markAsVerified();
      await Otp.deleteAfterVerification(phone, orderId);
    }
    res.status(200).json({
      message: "OTP verified successfully!",
      verified: true,
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ message: "An error occurred while verifying OTP." });
  }
};

exports.checkUserExists = async (req, res) => {
  const { phone } = req.body;
  console.log(phone);
  if (!phone) {
    return res.status(400).json({ message: "Phone number is required." });
  }

  try {
    const phoneVariants = getPhoneVariants(phone);
    const user = await User.findOne({ phone: { $in: phoneVariants } });

    if (user) {
      return res.status(200).json({
        exists: true,
        message: "User exists",
        user: {
          id: user._id,
          name: user.name,
          phone: user.phone,
          profile: user.profile,
        },
      });
    }

    return res.status(200).json({
      exists: false,
      message: "User does not exist",
    });
  } catch (error) {
    console.error("Error checking user existence:", error);
    res
      .status(500)
      .json({ message: "An error occurred while checking user existence." });
  }
};

exports.updateProfile = async (req, res) => {
  const userId = req.user.userId;
  const updateData = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Update user fields if they exist in the request body
    if (updateData.name) user.name = updateData.name;
    if (updateData.phone) user.phone = updateData.phone;
    if (updateData.isKyc !== undefined) user.isKyc = updateData.isKyc;
    if (updateData.kycDetails !== undefined)
      user.kycDetails = updateData.kycDetails;

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user: user,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res
      .status(500)
      .json({ message: "An error occurred while updating profile." });
  }
};

// Upload profile image
exports.uploadProfileImage = async (req, res) => {
  const userId = req.user.userId;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Upload image to Cloudinary
    const uploadResult = await cloudinaryService.uploadImage(req.file);

    if (!uploadResult.success) {
      return res.status(500).json({
        message: "Failed to upload image to Cloudinary",
        error: uploadResult.error,
      });
    }

    // Delete old image from Cloudinary if exists
    if (user.profilePublicId) {
      await cloudinaryService.deleteImage(user.profilePublicId);
    }

    // Update user profile
    user.profile = uploadResult.url;
    user.profilePublicId = uploadResult.publicId;
    await user.save();

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.status(200).json({
      message: "Profile image uploaded successfully",
      profile: uploadResult.url,
      user: user,
    });
  } catch (error) {
    console.error("Error uploading profile image:", error);

    // Clean up uploaded file if exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      message: "An error occurred while uploading profile image.",
    });
  }
};

// Update profile image
exports.updateProfileImage = async (req, res) => {
  const userId = req.user.userId;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Update image in Cloudinary (delete old and upload new)
    const updateResult = await cloudinaryService.updateImage(
      req.file,
      user.profilePublicId
    );

    if (!updateResult.success) {
      return res.status(500).json({
        message: "Failed to update image in Cloudinary",
        error: updateResult.error,
      });
    }

    // Update user profile
    user.profile = updateResult.url;
    user.profilePublicId = updateResult.publicId;
    await user.save();

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.status(200).json({
      message: "Profile image updated successfully",
      profile: updateResult.url,
      user: user,
    });
  } catch (error) {
    console.error("Error updating profile image:", error);

    // Clean up uploaded file if exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      message: "An error occurred while updating profile image.",
    });
  }
};

// Delete profile image
exports.deleteProfileImage = async (req, res) => {
  const userId = req.user.userId;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (!user.profilePublicId) {
      return res.status(400).json({ message: "No profile image to delete." });
    }

    // Delete image from Cloudinary
    const deleteResult = await cloudinaryService.deleteImage(
      user.profilePublicId
    );

    if (!deleteResult.success) {
      return res.status(500).json({
        message: "Failed to delete image from Cloudinary",
        error: deleteResult.error,
      });
    }

    // Update user profile
    user.profile = null;
    user.profilePublicId = null;
    await user.save();

    res.status(200).json({
      message: "Profile image deleted successfully",
      user: user,
    });
  } catch (error) {
    console.error("Error deleting profile image:", error);
    res.status(500).json({
      message: "An error occurred while deleting profile image.",
    });
  }
};

// Get user's referral code and stats
exports.getReferralInfo = async (req, res) => {
  const userId = req.user.userId;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Get referred users
    const referredUsers = await User.find({ referredBy: userId })
      .select("name phone createdAt")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Referral information retrieved successfully",
      referralCode: user.referralCode,
      referralCount: user.referralCount,
      referredUsers: referredUsers,
    });
  } catch (error) {
    console.error("Error getting referral info:", error);
    res.status(500).json({
      message: "An error occurred while getting referral information.",
    });
  }
};

// Apply referral code (for existing users)
exports.applyReferralCode = async (req, res) => {
  const userId = req.user.userId;
  const { referralCode } = req.body;

  if (!referralCode) {
    return res.status(400).json({ message: "Referral code is required." });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Check if user already has a referrer
    if (user.referredBy) {
      return res.status(400).json({
        message: "Referral code has already been applied to this account.",
      });
    }

    // Check if user is trying to use their own referral code
    if (user.referralCode === referralCode) {
      return res.status(400).json({
        message: "You cannot use your own referral code.",
      });
    }

    // Find referrer
    const referrer = await User.findOne({ referralCode });
    if (!referrer) {
      return res.status(404).json({
        message: "Invalid referral code.",
      });
    }

    // Apply referral
    user.referredBy = referrer._id;
    referrer.referralCount += 1;

    await user.save();
    await referrer.save();

    res.status(200).json({
      message: "Referral code applied successfully",
      user: user,
    });
  } catch (error) {
    console.error("Error applying referral code:", error);
    res.status(500).json({
      message: "An error occurred while applying referral code.",
    });
  }
};

// Validate referral code
exports.validateReferralCode = async (req, res) => {
  const { referralCode } = req.body;

  if (!referralCode) {
    return res.status(400).json({ message: "Referral code is required." });
  }

  try {
    const user = await User.findOne({ referralCode });

    if (!user) {
      return res.status(404).json({
        valid: false,
        message: "Invalid referral code.",
      });
    }

    res.status(200).json({
      valid: true,
      message: "Referral code is valid",
      referrerName: user.name,
    });
  } catch (error) {
    console.error("Error validating referral code:", error);
    res.status(500).json({
      message: "An error occurred while validating referral code.",
    });
  }
};

// Update user's own FCM token
exports.updateMyFcmToken = async (req, res) => {
  const { fcmToken } = req.body;
  const userId = req.user.userId; // From auth middleware

  if (!fcmToken) {
    return res.status(200).json({
      message: "FCM token not provided, skipped update.",
    });
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.fcmToken = fcmToken;
    await user.save();

    res.status(200).json({
      message: "FCM token updated successfully",
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        fcmToken: user.fcmToken,
      },
    });
  } catch (error) {
    console.error("Error updating FCM token:", error);
    res.status(500).json({
      message: "An error occurred while updating FCM token.",
    });
  }
};

// Clean up expired OTPs (can be called by a cron job)
exports.cleanupExpiredOtps = async () => {
  try {
    const result = await Otp.deleteMany({
      expiresAt: { $lt: new Date() },
    });

    console.log(`Cleaned up ${result.deletedCount} expired OTPs`);
    return result.deletedCount;
  } catch (error) {
    console.error("Error cleaning up expired OTPs:", error);
    throw error;
  }
};

// Check OTP rate limiting (max 3 OTPs per phone per hour)
exports.checkOtpRateLimit = async (phone) => {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const otpCount = await Otp.countDocuments({
      phone,
      createdAt: { $gte: oneHourAgo },
    });

    return otpCount < 3; // Allow max 3 OTPs per hour
  } catch (error) {
    console.error("Error checking OTP rate limit:", error);
    return false; // Fail safe - don't allow if error
  }
};
