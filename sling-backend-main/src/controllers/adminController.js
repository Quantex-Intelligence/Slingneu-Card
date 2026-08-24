const User = require("../models/User");
const Otp = require("../models/Otp");
const jwt = require("jsonwebtoken");
const config = require("../config/config");
const cloudinaryService = require("../services/cloudinaryService");
const firebaseService = require("../services/firebaseService");
const Coupon = require("../models/Coupon");
const Transaction = require('../models/Transaction');
const RequestPhysicalCard = require('../models/RequestPhysicalCard');

// Send OTP for admin login
exports.sendOtpForAdmin = async (req, res) => {
  const { phone } = req.body;
  
  if (!phone) {
    return res.status(400).json({ message: "Phone number is required." });
  }

  try {
    // Check if user exists and has admin role
    const user = await User.findOne({ phone });
    
    if (!user) {
      return res.status(404).json({ 
        message: "User not found. Please contact administrator to create admin account." 
      });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ 
        message: "Access denied. Admin privileges required." 
      });
    }

    // Check rate limiting
    const isRateLimitOk = await exports.checkOtpRateLimit(phone);
    if (!isRateLimitOk) {
      return res.status(429).json({ 
        message: "Too many OTP requests. Please wait for 1 hour before requesting another OTP." 
      });
    }

    // Generate a random 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    
    // Generate unique orderId
    const orderId = `ADMIN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Calculate expiry time (5 minutes from now)
    const expiresAt = new Date(Date.now() + config.msg91.otpExpiryMinutes * 60 * 1000);
    
    // Save OTP to database
    const otpRecord = new Otp({
      phone,
      otp,
      orderId,
      expiresAt
    });
    
    await otpRecord.save();
    
    // Send OTP via MSG91 SMS
    const response = await fetch(config.msg91.baseUrl, {
      method: "POST",
      headers: {
        "accept": "application/json",
        "authkey": config.msg91.authKey,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        route: config.msg91.route,
        sender: config.msg91.sender,
        unicode: 0,
        mobiles: `91${phone}`,
        templateId: config.msg91.templateId,
        variables: {
          var4: otp
        },
        encryption: 0,
        short_url: 0,
        flash: false,
        encrypt: false
      })
    });

    const data = await response.json();

    if (!response.ok) {
      // If SMS sending fails, delete the OTP record
      await Otp.findByIdAndDelete(otpRecord._id);
      throw new Error(data.message || "Failed to send OTP");
    }

    res.status(200).json({ 
      message: "OTP sent successfully to admin!", 
      orderId: orderId,
      expiresIn: `${config.msg91.otpExpiryMinutes} minutes`
    });
  } catch (error) {
    console.error("Error sending OTP for admin:", error);
    res.status(500).json({ 
      message: "An error occurred while sending the OTP." 
    });
  }
};

// Admin-specific login
exports.adminLogin = async (req, res) => {
  const { phone, otp, orderId } = req.body;

  if (!phone || !otp || !orderId) {
    return res
      .status(400)
      .json({ message: "Phone number, OTP and orderId are required." });
  }

  try {
    // Verify OTP from database
    const otpRecord = await Otp.findValidOtp(phone, otp, orderId);
    
    if (!otpRecord) {
      return res.status(400).json({ 
        message: "Invalid OTP or OTP has expired.",
        verified: false
      });
    }

    // Mark OTP as verified
    await otpRecord.markAsVerified();
    
    // Delete OTP after verification
    await Otp.deleteAfterVerification(phone, orderId);

    // Find user by phone number
    const user = await User.findOne({ phone });
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found. Please signup first." });
    }

    // Check if user has admin role
    if (user.role !== 'admin') {
      return res
        .status(403)
        .json({ message: "Access denied. Admin privileges required." });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });

    res.status(200).json({
      message: "Admin login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        profile: user.profile,
      },
    });
  } catch (error) {
    console.error("Error in admin login:", error);
    res.status(500).json({ message: "An error occurred during admin login." });
  }
};

// Check OTP rate limiting (max 3 OTPs per phone per hour)
exports.checkOtpRateLimit = async (phone) => {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    const otpCount = await Otp.countDocuments({
      phone,
      createdAt: { $gte: oneHourAgo }
    });
    
    return otpCount < 3; // Allow max 3 OTPs per hour
  } catch (error) {
    console.error("Error checking OTP rate limit:", error);
    return false; // Fail safe - don't allow if error
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select('-__v')
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Users retrieved successfully",
      count: users.length,
      users: users,
    });
  } catch (error) {
    console.error("Error getting all users:", error);
    res.status(500).json({ 
      message: "An error occurred while retrieving users." 
    });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id).select('-__v');
    
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({
      message: "User retrieved successfully",
      user: user,
    });
  } catch (error) {
    console.error("Error getting user by ID:", error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: "Invalid user ID format." });
    }
    res.status(500).json({ 
      message: "An error occurred while retrieving user." 
    });
  }
};

// Update user by ID
exports.updateUserById = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Update allowed fields
    const allowedFields = ['name', 'phone', 'role', 'isKyc', 'kycDetails', 'fcmToken'];
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        user[field] = updateData[field];
      }
    });

    await user.save();

    res.status(200).json({
      message: "User updated successfully",
      user: user,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: "Phone number already exists." 
      });
    }
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: "Invalid user ID format." });
    }
    res.status(500).json({ 
      message: "An error occurred while updating user." 
    });
  }
};

// Delete user by ID
exports.deleteUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Delete profile image from Cloudinary if exists
    if (user.profilePublicId) {
      try {
        await cloudinaryService.deleteImage(user.profilePublicId);
      } catch (cloudinaryError) {
        console.error("Error deleting profile image from Cloudinary:", cloudinaryError);
        // Continue with user deletion even if image deletion fails
      }
    }

    await User.findByIdAndDelete(id);

    res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: "Invalid user ID format." });
    }
    res.status(500).json({ 
      message: "An error occurred while deleting user." 
    });
  }
};

// Search users with filters
exports.searchUsers = async (req, res) => {
  const { 
    search, 
    role, 
    isKyc, 
    page = 1, 
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  try {
    const query = {};
    
    // Search by name or phone
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filter by role
    if (role) {
      query.role = role;
    }
    
    // Filter by KYC status
    if (isKyc !== undefined) {
      query.isKyc = isKyc === 'true';
    }

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const users = await User.find(query)
      .select('-__v')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.status(200).json({
      message: "Users retrieved successfully",
      users: users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalUsers: total,
        usersPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({ 
      message: "An error occurred while searching users." 
    });
  }
};

// Send notification to all users
exports.sendNotificationToAllUsers = async (req, res) => {
  const { title, body, data } = req.body;

  if (!title || !body) {
    return res.status(400).json({ 
      message: "Title and body are required for notifications." 
    });
  }

  try {
    // Get all users with FCM tokens
    const users = await User.find({ 
      fcmToken: { $exists: true, $ne: null, $ne: '' } 
    }).select('fcmToken name');

    if (users.length === 0) {
      return res.status(404).json({ 
        message: "No users with FCM tokens found." 
      });
    }

    const fcmTokens = users.map(user => user.fcmToken);
    
    // Send notification to all users
    const response = await firebaseService.sendNotificationToUsers(
      fcmTokens, 
      title, 
      body, 
      data || {}
    );

    res.status(200).json({
      message: "Notification sent successfully",
      totalUsers: users.length,
      successfulDeliveries: response.successCount,
      failedDeliveries: response.failureCount,
      response: response
    });
  } catch (error) {
    console.error("Error sending notification to all users:", error);
    res.status(500).json({ 
      message: "An error occurred while sending notifications.",
      error: error.message 
    });
  }
};

// Send notification to specific users
exports.sendNotificationToUsers = async (req, res) => {
  const { userIds, title, body, data } = req.body;

  if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
    return res.status(400).json({ 
      message: "User IDs array is required and must not be empty." 
    });
  }

  if (!title || !body) {
    return res.status(400).json({ 
      message: "Title and body are required for notifications." 
    });
  }

  try {
    // Get users with FCM tokens
    const users = await User.find({ 
      _id: { $in: userIds },
      fcmToken: { $exists: true, $ne: null, $ne: '' } 
    }).select('fcmToken name');

    if (users.length === 0) {
      return res.status(404).json({ 
        message: "No users with FCM tokens found from the provided IDs." 
      });
    }

    const fcmTokens = users.map(user => user.fcmToken);
    
    // Send notification to selected users
    const response = await firebaseService.sendNotificationToUsers(
      fcmTokens, 
      title, 
      body, 
      data || {}
    );

    res.status(200).json({
      message: "Notification sent successfully",
      totalUsers: users.length,
      successfulDeliveries: response.successCount,
      failedDeliveries: response.failureCount,
      users: users.map(user => ({ id: user._id, name: user.name })),
      response: response
    });
  } catch (error) {
    console.error("Error sending notification to users:", error);
    res.status(500).json({ 
      message: "An error occurred while sending notifications.",
      error: error.message 
    });
  }
};

// Update user FCM token
exports.updateUserFcmToken = async (req, res) => {
  const { id } = req.params;
  const { fcmToken } = req.body;

  if (!fcmToken) {
    return res.status(400).json({ 
      message: "FCM token is required." 
    });
  }

  try {
    const user = await User.findById(id);
    
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
        fcmToken: user.fcmToken
      }
    });
  } catch (error) {
    console.error("Error updating user FCM token:", error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: "Invalid user ID format." });
    }
    res.status(500).json({ 
      message: "An error occurred while updating FCM token." 
    });
  }
};

// Get notification statistics
exports.getNotificationStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const usersWithFcmToken = await User.countDocuments({ 
      fcmToken: { $exists: true, $ne: null, $ne: '' } 
    });
    const usersWithoutFcmToken = totalUsers - usersWithFcmToken;

    res.status(200).json({
      message: "Notification statistics retrieved successfully",
      stats: {
        totalUsers,
        usersWithFcmToken,
        usersWithoutFcmToken,
        fcmTokenPercentage: totalUsers > 0 ? ((usersWithFcmToken / totalUsers) * 100).toFixed(2) : 0
      }
    });
  } catch (error) {
    console.error("Error getting notification stats:", error);
    res.status(500).json({ 
      message: "An error occurred while retrieving notification statistics." 
    });
  }
};

// Dashboard API - Get comprehensive statistics and lists
exports.getDashboardStats = async (req, res) => {
  try {
    // Get counts
    const totalUsers = await User.countDocuments({});
    const totalCoupons = await Coupon.countDocuments({});
    const totalTransactions = await Transaction.countDocuments({});
    
    // Get counts by status
    const activeCoupons = await Coupon.countDocuments({ isActive: true });
    const inactiveCoupons = await Coupon.countDocuments({ isActive: false });
    
    const pendingTransactions = await Transaction.countDocuments({ status: "PENDING" });
    const successfulTransactions = await Transaction.countDocuments({ status: "SUCCESS" });
    const failedTransactions = await Transaction.countDocuments({ status: "FAILED" });
    const cancelledTransactions = await Transaction.countDocuments({ status: "CANCELLED" });
    const refundedTransactions = await Transaction.countDocuments({ status: "REFUNDED" });
    
    // Get KYC statistics
    const kycCompletedUsers = await User.countDocuments({ isKyc: true });
    const kycPendingUsers = await User.countDocuments({ isKyc: false });
    
    // Get referral statistics
    const usersWithReferrals = await User.countDocuments({ referralCount: { $gt: 0 } });
    
    // Get recent data (last 10 records)
    const recentUsers = await User.find({})
      .select('name phone role isKyc createdAt')
      .sort({ createdAt: -1 })
      .limit(10);
    
    const recentCoupons = await Coupon.find({})
      .select('title couponCode isActive createdAt')
      .sort({ createdAt: -1 })
      .limit(10);
    
    const recentTransactions = await Transaction.find({})
      .populate('userId', 'name phone')
      .select('transactionId orderId amount status createdAt')
      .sort({ createdAt: -1 })
      .limit(10);
    
    // Get payment statistics
    const totalAmount = await Transaction.aggregate([
      { $match: { status: "SUCCESS" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    
    const totalAmountValue = totalAmount.length > 0 ? totalAmount[0].total : 0;
    
    // Get monthly statistics for the current year
    const currentYear = new Date().getFullYear();
    const monthlyStats = await Transaction.aggregate([
      {
        $match: {
          status: "SUCCESS",
          createdAt: {
            $gte: new Date(currentYear, 0, 1),
            $lt: new Date(currentYear + 1, 0, 1)
          }
        }
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Format monthly stats
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const monthData = monthlyStats.find(stat => stat._id === i + 1);
      return {
        month: i + 1,
        monthName: new Date(currentYear, i).toLocaleString('default', { month: 'short' }),
        count: monthData ? monthData.count : 0,
        totalAmount: monthData ? monthData.totalAmount : 0
      };
    });

    res.status(200).json({
      message: "Dashboard statistics retrieved successfully",
      stats: {
        counts: {
          totalUsers,
          totalCoupons,
          totalTransactions,
          activeCoupons,
          inactiveCoupons,
          kycCompletedUsers,
          kycPendingUsers,
          usersWithReferrals
        },
        transactions: {
          pending: pendingTransactions,
          successful: successfulTransactions,
          failed: failedTransactions,
          cancelled: cancelledTransactions,
          refunded: refundedTransactions
        },
        financial: {
          totalAmount: totalAmountValue,
          monthlyStats: monthlyData
        }
      },
      recentData: {
        users: recentUsers,
        coupons: recentCoupons,
        transactions: recentTransactions
      }
    });
  } catch (error) {
    console.error("Error getting dashboard stats:", error);
    res.status(500).json({ 
      message: "An error occurred while retrieving dashboard statistics." 
    });
  }
};

// Get detailed lists for dashboard
exports.getDashboardLists = async (req, res) => {
  try {
    const { type, page = 1, limit = 20, status, search } = req.query;
    const skip = (page - 1) * limit;
    
    let query = {};
    let sort = { createdAt: -1 };
    
    // Apply filters based on type and status
    if (status) {
      if (type === 'coupons') {
        query.isActive = status === 'active';
      } else if (type === 'transactions') {
        query.status = status.toUpperCase();
      } else if (type === 'users') {
        query.isKyc = status === 'kyc_completed';
      }
    }
    
    // Apply search filter
    if (search) {
      if (type === 'users') {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } }
        ];
      } else if (type === 'coupons') {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { couponCode: { $regex: search, $options: 'i' } }
        ];
      } else if (type === 'transactions') {
        query.$or = [
          { transactionId: { $regex: search, $options: 'i' } },
          { orderId: { $regex: search, $options: 'i' } }
        ];
      }
    }
    
    let data, total;
    
    switch (type) {
      case 'users':
        data = await User.find(query)
          .select('name phone role isKyc referralCount createdAt')
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit));
        total = await User.countDocuments(query);
        break;
        
      case 'coupons':
        data = await Coupon.find(query)
          .select('title description couponCode isActive createdAt')
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit));
        total = await Coupon.countDocuments(query);
        break;
        
      case 'transactions':
        data = await Transaction.find(query)
          .populate('userId', 'name phone')
          .select('transactionId orderId paymentId amount currency status createdAt')
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit));
        total = await Transaction.countDocuments(query);
        break;
        
      default:
        return res.status(400).json({ message: "Invalid type parameter. Use 'users', 'coupons', or 'transactions'" });
    }
    
    res.status(200).json({
      message: `${type} list retrieved successfully`,
      data,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error("Error getting dashboard lists:", error);
    res.status(500).json({ 
      message: "An error occurred while retrieving dashboard lists." 
    });
  }
}; 




exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({});
    res.status(200).json({ transactions });
  } catch (error) {
    console.error("Error getting all transactions:", error);
    res.status(500).json({ message: "An error occurred while retrieving transactions." });
  }
};

// Get all physical card requests
exports.getAllPhysicalCardRequests = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    const query = {};
    
    // Filter by status
    if (status) {
      query.status = status.toUpperCase();
    }
    
    // Search by rollnumber, entityId, or kitNo
    if (search) {
      query.$or = [
        { rollnumber: { $regex: search, $options: 'i' } },
        { entityId: { $regex: search, $options: 'i' } },
        { kitNo: { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
    
    const requests = await RequestPhysicalCard.find(query)
      .populate('user', 'name phone')
      .select('-__v')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await RequestPhysicalCard.countDocuments(query);
    
    res.status(200).json({
      message: "Physical card requests retrieved successfully",
      requests,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalRequests: total,
        requestsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error("Error getting all physical card requests:", error);
    res.status(500).json({ 
      message: "An error occurred while retrieving physical card requests." 
    });
  }
};

// Get physical card request by ID
exports.getPhysicalCardRequestById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const request = await RequestPhysicalCard.findById(id)
      .populate('user', 'name phone');
    
    if (!request) {
      return res.status(404).json({ message: "Physical card request not found." });
    }
    
    res.status(200).json({
      message: "Physical card request retrieved successfully",
      request
    });
  } catch (error) {
    console.error("Error getting physical card request by ID:", error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: "Invalid request ID format." });
    }
    res.status(500).json({ 
      message: "An error occurred while retrieving physical card request." 
    });
  }
};

// Update physical card request by ID
exports.updatePhysicalCardRequest = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  
  try {
    const request = await RequestPhysicalCard.findById(id);
    
    if (!request) {
      return res.status(404).json({ message: "Physical card request not found." });
    }
    
    // Update allowed fields
    const allowedFields = ['status', 'notes', 'entityId', 'kitNo', 'addressDto'];
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        request[field] = updateData[field];
      }
    });
    
    await request.save();
    
    // Populate user data for response
    await request.populate('user', 'name phone');
    
    res.status(200).json({
      message: "Physical card request updated successfully",
      request
    });
  } catch (error) {
    console.error("Error updating physical card request:", error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: "Invalid request ID format." });
    }
    res.status(500).json({ 
      message: "An error occurred while updating physical card request." 
    });
  }
};

// Delete physical card request by ID
exports.deletePhysicalCardRequest = async (req, res) => {
  const { id } = req.params;
  
  try {
    const request = await RequestPhysicalCard.findById(id);
    
    if (!request) {
      return res.status(404).json({ message: "Physical card request not found." });
    }
    
    await RequestPhysicalCard.findByIdAndDelete(id);
    
    res.status(200).json({
      message: "Physical card request deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting physical card request:", error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: "Invalid request ID format." });
    }
    res.status(500).json({ 
      message: "An error occurred while deleting physical card request." 
    });
  }
};