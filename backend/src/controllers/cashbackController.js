const Cashback = require("../models/Cashback");
const cloudinaryService = require("../services/cloudinaryService");
const fs = require("fs");

// Create cashback (Admin only)
exports.createCashback = async (req, res) => {
  const { title, description, conditions } = req.body;

  if (!title || !description || !conditions) {
    return res.status(400).json({ 
      message: "Title, description, and conditions are required." 
    });
  }

  console.log("req.body", req.body);
  
  // Parse conditions if it's a string (form-data sends JSON as string)
  let parsedConditions = conditions;
  if (typeof conditions === 'string') {
    try {
      parsedConditions = JSON.parse(conditions);
    } catch (error) {
      return res.status(400).json({ 
        message: "Invalid JSON format in conditions field." 
      });
    }
  }

  // Validate conditions
  if (!Array.isArray(parsedConditions) || parsedConditions.length === 0) {
    return res.status(400).json({ 
      message: "At least one condition is required." 
    });
  }

  // Validate each condition
  for (const condition of parsedConditions) {
    if (!condition.type || !condition.description || !condition.cashbackAmount) {
      return res.status(400).json({ 
        message: "Each condition must have type, description, and cashbackAmount." 
      });
    }
  }

  try {
    let imageUrl = null;
    let imagePublicId = null;

    // Handle image upload if provided
    if (req.file) {
      const uploadResult = await cloudinaryService.uploadImage(
        req.file, 
        'cashback-images'
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

    const cashback = new Cashback({
      title,
      description,
      image: imageUrl,
      imagePublicId,
      conditions: parsedConditions,
    });

    await cashback.save();

    res.status(201).json({
      message: "Cashback created successfully",
      cashback: cashback,
    });
  } catch (error) {
    console.error("Error creating cashback:", error);
    
    // Clean up uploaded file if exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      message: "An error occurred while creating the cashback." 
    });
  }
};

// Get all cashbacks (Admin only)
exports.getAllCashbacks = async (req, res) => {
  try {
    const cashbacks = await Cashback.find({})
      .select('-__v')
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Cashbacks retrieved successfully",
      count: cashbacks.length,
      cashbacks: cashbacks,
    });
  } catch (error) {
    console.error("Error getting all cashbacks:", error);
    res.status(500).json({ 
      message: "An error occurred while retrieving cashbacks." 
    });
  }
};

// Get active cashbacks (Public)
exports.getActiveCashbacks = async (req, res) => {
  try {
    const cashbacks = await Cashback.find({ isActive: true })
      .select('-__v')
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Active cashbacks retrieved successfully",
      count: cashbacks.length,
      cashbacks: cashbacks,
    });
  } catch (error) {
    console.error("Error getting active cashbacks:", error);
    res.status(500).json({ 
      message: "An error occurred while retrieving active cashbacks." 
    });
  }
};

// Get cashback by ID (Admin only)
exports.getCashbackById = async (req, res) => {
  const { id } = req.params;

  try {
    const cashback = await Cashback.findById(id)
      .select('-__v');
    
    if (!cashback) {
      return res.status(404).json({ message: "Cashback not found." });
    }

    res.status(200).json({
      message: "Cashback retrieved successfully",
      cashback: cashback,
    });
  } catch (error) {
    console.error("Error getting cashback by ID:", error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: "Invalid cashback ID format." });
    }
    res.status(500).json({ 
      message: "An error occurred while retrieving cashback." 
    });
  }
};

// Get cashback by ID (Public)
exports.getCashbackByIdPublic = async (req, res) => {
  const { id } = req.params;

  try {
    const cashback = await Cashback.findOne({ _id: id, isActive: true })
      .select('-__v');
    
    if (!cashback) {
      return res.status(404).json({ message: "Cashback not found." });
    }

    res.status(200).json({
      message: "Cashback retrieved successfully",
      cashback: cashback,
    });
  } catch (error) {
    console.error("Error getting cashback by ID:", error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: "Invalid cashback ID format." });
    }
    res.status(500).json({ 
      message: "An error occurred while retrieving cashback." 
    });
  }
};

// Update cashback by ID (Admin only)
exports.updateCashbackById = async (req, res) => {
  const { id } = req.params;
  const { title, description, conditions, isActive } = req.body;

  try {
    const cashback = await Cashback.findById(id);
    
    if (!cashback) {
      return res.status(404).json({ message: "Cashback not found." });
    }

    // Parse conditions if it's a string (form-data sends JSON as string)
    let parsedConditions = conditions;
    if (conditions && typeof conditions === 'string') {
      try {
        parsedConditions = JSON.parse(conditions);
      } catch (error) {
        return res.status(400).json({ 
          message: "Invalid JSON format in conditions field." 
        });
      }
    }

    // Validate conditions if provided
    if (parsedConditions) {
      if (!Array.isArray(parsedConditions) || parsedConditions.length === 0) {
        return res.status(400).json({ 
          message: "At least one condition is required." 
        });
      }

      for (const condition of parsedConditions) {
        if (!condition.type || !condition.description || !condition.cashbackAmount) {
          return res.status(400).json({ 
            message: "Each condition must have type, description, and cashbackAmount." 
          });
        }
      }
    }

    let imageUrl = cashback.image;
    let imagePublicId = cashback.imagePublicId;

    // Handle image upload if provided
    if (req.file) {
      const uploadResult = await cloudinaryService.updateImage(
        req.file, 
        cashback.imagePublicId, 
        'cashback-images'
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
    if (title !== undefined) cashback.title = title;
    if (description !== undefined) cashback.description = description;
    if (parsedConditions !== undefined) cashback.conditions = parsedConditions;
    if (isActive !== undefined) cashback.isActive = isActive;
    if (imageUrl !== undefined) cashback.image = imageUrl;
    if (imagePublicId !== undefined) cashback.imagePublicId = imagePublicId;

    await cashback.save();

    res.status(200).json({
      message: "Cashback updated successfully",
      cashback: cashback,
    });
  } catch (error) {
    console.error("Error updating cashback:", error);
    
    // Clean up uploaded file if exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      message: "An error occurred while updating cashback." 
    });
  }
};

// Delete cashback by ID (Admin only)
exports.deleteCashbackById = async (req, res) => {
  const { id } = req.params;

  try {
    const cashback = await Cashback.findById(id);
    
    if (!cashback) {
      return res.status(404).json({ message: "Cashback not found." });
    }

    // Delete image from cloudinary if exists
    if (cashback.imagePublicId) {
      await cloudinaryService.deleteImage(cashback.imagePublicId);
    }

    await Cashback.findByIdAndDelete(id);

    res.status(200).json({
      message: "Cashback deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting cashback:", error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: "Invalid cashback ID format." });
    }
    res.status(500).json({ 
      message: "An error occurred while deleting cashback." 
    });
  }
}; 