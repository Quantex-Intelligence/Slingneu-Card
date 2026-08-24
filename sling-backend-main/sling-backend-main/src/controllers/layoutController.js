const Layout = require("../models/Layout");
const cloudinaryService = require("../services/cloudinaryService");
const fs = require("fs");

// Create layout (Admin only)
exports.createLayout = async (req, res) => {
  const { type, title, description } = req.body;


  try {
    const images = [];

    // Handle multiple image uploads
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        
        const uploadResult = await cloudinaryService.uploadImage(
          file, 
          'layout-images'
        );

        if (!uploadResult.success) {
          // Clean up already uploaded files
          for (let j = 0; j < i; j++) {
            if (images[j] && images[j].publicId) {
              await cloudinaryService.deleteImage(images[j].publicId);
            }
          }
          return res.status(500).json({ 
            message: `Failed to upload image ${i + 1}.` 
          });
        }

        images.push({
          url: uploadResult.url,
          publicId: uploadResult.publicId,
          alt: req.body[`alt_${i}`] || "",
          order: i,
        });

        // Delete local file after upload
        fs.unlinkSync(file.path);
      }
    }

    const layout = new Layout({
      type,
      title,
      description: description || "",
      images,
      createdBy: req.user.userId,
    });

    await layout.save();

    res.status(201).json({
      message: "Layout created successfully",
      layout: layout,
    });
  } catch (error) {
    console.error("Error creating layout:", error);
    
    // Clean up uploaded files if exists
    if (req.files) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: error.message 
      });
    }
    
    res.status(500).json({ 
      message: "An error occurred while creating the layout." 
    });
  }
};

// Get all layouts (Public access)
exports.getAllLayouts = async (req, res) => {
  try {
    console.log("check")
    const { type, isActive, page = 1, limit = 10 } = req.query;
    console.log("req.query",req.query)
    
    const filter = {};


    const skip = (page - 1) * limit;
    
    const layouts = await Layout.find(filter)
      .populate('createdBy', 'name phone')
      .select('-__v')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Layout.countDocuments(filter);

    res.status(200).json({
      message: "Layouts retrieved successfully",
      count: layouts.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      layouts: layouts,
    });
  } catch (error) {
    console.error("Error getting all layouts:", error);
    res.status(500).json({ 
      message: "An error occurred while retrieving layouts." 
    });
  }
};

// Get layout by ID (Public access)
exports.getLayoutById = async (req, res) => {
  const { id } = req.params;

  try {
    const filter = { _id: id };
    
    // For public access, only show active layouts unless user is admin
    if (!req.user || !req.adminUser) {
      filter.isActive = true;
    }
    
    const layout = await Layout.findOne(filter)
      .populate('createdBy', 'name phone')
      .select('-__v');
    
    if (!layout) {
      return res.status(404).json({ message: "Layout not found." });
    }

    res.status(200).json({
      message: "Layout retrieved successfully",
      layout: layout,
    });
  } catch (error) {
    console.error("Error getting layout by ID:", error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: "Invalid layout ID format." });
    }
    res.status(500).json({ 
      message: "An error occurred while retrieving layout." 
    });
  }
};

// Update layout by ID (Admin only)
exports.updateLayoutById = async (req, res) => {
  const { id } = req.params;
  const { type, title, description, isActive } = req.body;

  try {
    const layout = await Layout.findById(id);
    
    if (!layout) {
      return res.status(404).json({ message: "Layout not found." });
    }

    const newImages = [];

    // Handle new image uploads if provided
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        
        const uploadResult = await cloudinaryService.uploadImage(
          file, 
          'layout-images'
        );

        if (!uploadResult.success) {
          // Clean up already uploaded files
          for (let j = 0; j < i; j++) {
            if (newImages[j] && newImages[j].publicId) {
              await cloudinaryService.deleteImage(newImages[j].publicId);
            }
          }
          return res.status(500).json({ 
            message: `Failed to upload image ${i + 1}.` 
          });
        }

        newImages.push({
          url: uploadResult.url,
          publicId: uploadResult.publicId,
          alt: req.body[`alt_${i}`] || "",
          order: layout.images.length + i,
        });

        // Delete local file after upload
        fs.unlinkSync(file.path);
      }
    }

    // Update allowed fields
    if (type !== undefined) layout.type = type;
    if (title !== undefined) layout.title = title;
    if (description !== undefined) layout.description = description;
    if (isActive !== undefined) layout.isActive = isActive;
    
    // Add new images to existing ones
    if (newImages.length > 0) {
      layout.images = [...layout.images, ...newImages];
    }

    await layout.save();

    res.status(200).json({
      message: "Layout updated successfully",
      layout: layout,
    });
  } catch (error) {
    console.error("Error updating layout:", error);
    
    // Clean up uploaded files if exists
    if (req.files) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: error.message 
      });
    }
    
    res.status(500).json({ 
      message: "An error occurred while updating the layout." 
    });
  }
};

// Delete layout by ID (Admin only)
exports.deleteLayoutById = async (req, res) => {
  const { id } = req.params;

  try {
    const layout = await Layout.findById(id);
    
    if (!layout) {
      return res.status(404).json({ message: "Layout not found." });
    }

    // Delete all images from cloudinary
    for (const image of layout.images) {
      if (image.publicId) {
        await cloudinaryService.deleteImage(image.publicId);
      }
    }

    await Layout.findByIdAndDelete(id);

    res.status(200).json({
      message: "Layout deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting layout:", error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: "Invalid layout ID format." });
    }
    res.status(500).json({ 
      message: "An error occurred while deleting the layout." 
    });
  }
};

// Delete specific image from layout (Admin only)
exports.deleteImageFromLayout = async (req, res) => {
  const { id, imageIndex } = req.params;

  try {
    const layout = await Layout.findById(id);
    
    if (!layout) {
      return res.status(404).json({ message: "Layout not found." });
    }

    const index = parseInt(imageIndex);
    if (index < 0 || index >= layout.images.length) {
      return res.status(400).json({ message: "Invalid image index." });
    }

    const imageToDelete = layout.images[index];
    
    // Delete image from cloudinary
    if (imageToDelete.publicId) {
      await cloudinaryService.deleteImage(imageToDelete.publicId);
    }

    // Remove image from array
    layout.images.splice(index, 1);

    // Reorder remaining images
    layout.images.forEach((image, i) => {
      image.order = i;
    });

    await layout.save();

    res.status(200).json({
      message: "Image deleted successfully",
      layout: layout,
    });
  } catch (error) {
    console.error("Error deleting image from layout:", error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: "Invalid layout ID format." });
    }
    res.status(500).json({ 
      message: "An error occurred while deleting the image." 
    });
  }
};

// Get layouts by type (Public)
exports.getLayoutsByType = async (req, res) => {
  const { type } = req.params;

  try {
    const layouts = await Layout.find({ 
      type: type, 
      isActive: true 
    })
      .select('-__v')
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Layouts retrieved successfully",
      count: layouts.length,
      layouts: layouts,
    });
  } catch (error) {
    console.error("Error getting layouts by type:", error);
    res.status(500).json({ 
      message: "An error occurred while retrieving layouts." 
    });
  }
}; 