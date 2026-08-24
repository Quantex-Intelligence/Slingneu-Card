const Coupon = require("../models/Coupon");
const cloudinaryService = require("../services/cloudinaryService");
const fs = require("fs");

// Create coupon (Admin only)
exports.createCoupon = async (req, res) => {
  const { title, description, couponCode, link } = req.body;

  if (!title || !description || !couponCode) {
    return res.status(400).json({ 
      message: "Title, description, and coupon code are required." 
    });
  }

  try {
    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({ 
      couponCode: couponCode.toUpperCase() 
    });
    
    if (existingCoupon) {
      return res.status(400).json({ 
        message: "Coupon code already exists." 
      });
    }

    let imageUrl = null;
    let imagePublicId = null;

    // Handle image upload if provided
    if (req.file) {
      const uploadResult = await cloudinaryService.uploadImage(
        req.file, 
        'coupon-images'
      );

      if (!uploadResult.success) {
        return res.status(500).json({ 
          message: "Failed to upload image." 
        });
      }

      imageUrl = uploadResult.url;
      imagePublicId = uploadResult.publicId;

      // Delete local file after upload
      fs.unlinkSync(req.file.path);
    }

    const coupon = new Coupon({
      title,
      description,
      couponCode: couponCode.toUpperCase(),
      image: imageUrl,
      imagePublicId,
      link,
    });

    await coupon.save();

    res.status(201).json({
      message: "Coupon created successfully",
      coupon: coupon,
    });
  } catch (error) {
    console.error("Error creating coupon:", error);
    
    // Clean up uploaded file if exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    if (error.code === 11000) {
      return res.status(400).json({ 
        message: "Coupon code already exists." 
      });
    }
    
    res.status(500).json({ 
      message: "An error occurred while creating the coupon." 
    });
  }
};

// Get all coupons (Admin only)
exports.getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({})
      .select('-__v')
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Coupons retrieved successfully",
      count: coupons.length,
      coupons: coupons,
    });
  } catch (error) {
    console.error("Error getting all coupons:", error);
    res.status(500).json({ 
      message: "An error occurred while retrieving coupons." 
    });
  }
};

// Get coupon by ID (Admin only)
exports.getCouponById = async (req, res) => {
  const { id } = req.params;

  try {
    const coupon = await Coupon.findById(id)
      .select('-__v');
    
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found." });
    }

    res.status(200).json({
      message: "Coupon retrieved successfully",
      coupon: coupon,
    });
  } catch (error) {
    console.error("Error getting coupon by ID:", error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: "Invalid coupon ID format." });
    }
    res.status(500).json({ 
      message: "An error occurred while retrieving coupon." 
    });
  }
};

// Update coupon by ID (Admin only)
exports.updateCouponById = async (req, res) => {
  const { id } = req.params;
  const { title, description, couponCode, isActive, link } = req.body;

  try {
    const coupon = await Coupon.findById(id);
    
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found." });
    }

    // Check if new coupon code conflicts with existing one
    if (couponCode && couponCode.toUpperCase() !== coupon.couponCode) {
      const existingCoupon = await Coupon.findOne({ 
        couponCode: couponCode.toUpperCase(),
        _id: { $ne: id }
      });
      
      if (existingCoupon) {
        return res.status(400).json({ 
          message: "Coupon code already exists." 
        });
      }
    }

    let imageUrl = coupon.image;
    let imagePublicId = coupon.imagePublicId;

    // Handle image upload if provided
    if (req.file) {
      const uploadResult = await cloudinaryService.updateImage(
        req.file, 
        coupon.imagePublicId, 
        'coupon-images'
      );

      if (!uploadResult.success) {
        return res.status(500).json({ 
          message: "Failed to upload image." 
        });
      }

      imageUrl = uploadResult.url;
      imagePublicId = uploadResult.publicId;

      // Delete local file after upload
      fs.unlinkSync(req.file.path);
    }

    // Update allowed fields
    if (title !== undefined) coupon.title = title;
    if (description !== undefined) coupon.description = description;
    if (couponCode !== undefined) coupon.couponCode = couponCode.toUpperCase();
    if (isActive !== undefined) coupon.isActive = isActive;
    if (link !== undefined) coupon.link = link;
    if (imageUrl !== undefined) coupon.image = imageUrl;
    if (imagePublicId !== undefined) coupon.imagePublicId = imagePublicId;

    await coupon.save();

    res.status(200).json({
      message: "Coupon updated successfully",
      coupon: coupon,
    });
  } catch (error) {
    console.error("Error updating coupon:", error);
    
    // Clean up uploaded file if exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    if (error.code === 11000) {
      return res.status(400).json({ 
        message: "Coupon code already exists." 
      });
    }
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: "Invalid coupon ID format." });
    }
    res.status(500).json({ 
      message: "An error occurred while updating coupon." 
    });
  }
};

// Delete coupon by ID (Admin only)
exports.deleteCouponById = async (req, res) => {
  const { id } = req.params;

  try {
    const coupon = await Coupon.findById(id);
    
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found." });
    }

    // Delete image from Cloudinary if exists
    if (coupon.imagePublicId) {
      try {
        await cloudinaryService.deleteImage(coupon.imagePublicId);
      } catch (cloudinaryError) {
        console.error("Error deleting image from Cloudinary:", cloudinaryError);
        // Continue with coupon deletion even if image deletion fails
      }
    }

    await Coupon.findByIdAndDelete(id);

    res.status(200).json({
      message: "Coupon deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting coupon:", error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: "Invalid coupon ID format." });
    }
    res.status(500).json({ 
      message: "An error occurred while deleting coupon." 
    });
  }
};

// Search coupons with filters (Admin only)
exports.searchCoupons = async (req, res) => {
  const { 
    search, 
    isActive, 
    page = 1, 
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  try {
    const query = {};
    
    // Search by title, description, or coupon code
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { couponCode: { $regex: search, $options: 'i' } }
      ];
    }
    
 

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const coupons = await Coupon.find(query)
      .select('-__v')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Coupon.countDocuments(query);

    res.status(200).json({
      message: "Coupons retrieved successfully",
      coupons: coupons,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalCoupons: total,
        couponsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error("Error searching coupons:", error);
    res.status(500).json({ 
      message: "An error occurred while searching coupons." 
    });
  }
};

// Public endpoints (no authentication required)

// Get all active coupons (Public)
exports.getActiveCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({ isActive: true })
      .select('title description couponCode image link createdAt')
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Active coupons retrieved successfully",
      count: coupons.length,
      coupons: coupons,
    });
  } catch (error) {
    console.error("Error getting active coupons:", error);
    res.status(500).json({ 
      message: "An error occurred while retrieving coupons." 
    });
  }
};

// Get coupon by code (Public)
exports.getCouponByCode = async (req, res) => {
  const { code } = req.params;

  try {
    const coupon = await Coupon.findOne({ 
      couponCode: code.toUpperCase(),
      isActive: true 
    }).select('title description couponCode image link createdAt');
    
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found or inactive." });
    }

    res.status(200).json({
      message: "Coupon retrieved successfully",
      coupon: coupon,
    });
  } catch (error) {
    console.error("Error getting coupon by code:", error);
    res.status(500).json({ 
      message: "An error occurred while retrieving coupon." 
    });
  }
}; 