const RequestPhysicalCard = require('../models/RequestPhysicalCard');
const User = require('../models/User');

// Create a new physical card request
exports.createPhysicalCardRequest = async (req, res) => {
  const userId = req.user.userId;
  const { rollnumber, entityId, kitNo, addressDto } = req.body;

  // Validate required fields
  if (!rollnumber || !entityId || !kitNo || !addressDto) {
    return res.status(400).json({
      message: "rollnumber, entityId, kitNo, and addressDto are required."
    });
  }

  // Validate address structure
  if (!addressDto.address || !Array.isArray(addressDto.address) || addressDto.address.length === 0) {
    return res.status(400).json({
      message: "addressDto.address must be a non-empty array."
    });
  }

  try {
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Check if user already has a pending request
    const existingRequest = await RequestPhysicalCard.findOne({
      user: userId,
      status: { $in: ['PENDING', 'APPROVED', 'PROCESSING'] }
    });

    if (existingRequest) {
      return res.status(400).json({
        message: "You already have a pending physical card request. Please wait for it to be processed.",
        existingRequest: {
          id: existingRequest._id,
          status: existingRequest.status,
          createdAt: existingRequest.createdAt
        }
      });
    }

    // Create new request
    const newRequest = new RequestPhysicalCard({
      user: userId,
      rollnumber,
      entityId,
      kitNo,
      addressDto,
      status: 'PENDING'
    });

    await newRequest.save();

    // Populate user data for response
    await newRequest.populate('user', 'name phone');

    res.status(201).json({
      message: "Physical card request created successfully",
      request: newRequest
    });
  } catch (error) {
    console.error("Error creating physical card request:", error);
    res.status(500).json({
      message: "An error occurred while creating the physical card request."
    });
  }
};

// Get user's physical card requests
exports.getMyPhysicalCardRequests = async (req, res) => {
  const userId = req.user.userId;
  const { page = 1, limit = 10, status } = req.query;

  try {
    const query = { user: userId };
    
    // Filter by status if provided
    if (status) {
      query.status = status.toUpperCase();
    }

    const skip = (page - 1) * limit;
    
    const requests = await RequestPhysicalCard.find(query)
      .select('-__v')
      .sort({ createdAt: -1 })
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
    console.error("Error getting user's physical card requests:", error);
    res.status(500).json({
      message: "An error occurred while retrieving physical card requests."
    });
  }
};

// Get specific physical card request by ID (user can only see their own)
exports.getMyPhysicalCardRequestById = async (req, res) => {
  const userId = req.user.userId;
  const { id } = req.params;

  try {
    const request = await RequestPhysicalCard.findOne({
      _id: id,
      user: userId
    });

    if (!request) {
      return res.status(404).json({
        message: "Physical card request not found or access denied."
      });
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
      message: "An error occurred while retrieving the physical card request."
    });
  }
};

// Cancel user's physical card request (only if status is PENDING)
exports.cancelPhysicalCardRequest = async (req, res) => {
  const userId = req.user.userId;
  const { id } = req.params;

  try {
    const request = await RequestPhysicalCard.findOne({
      _id: id,
      user: userId
    });

    if (!request) {
      return res.status(404).json({
        message: "Physical card request not found or access denied."
      });
    }

    // Only allow cancellation if status is PENDING
    if (request.status !== 'PENDING') {
      return res.status(400).json({
        message: "Cannot cancel request. Only pending requests can be cancelled."
      });
    }

    // Update status to cancelled (you might want to add CANCELLED to the enum)
    request.status = 'REJECTED';
    request.notes = request.notes ? `${request.notes} (Cancelled by user)` : 'Cancelled by user';
    await request.save();

    res.status(200).json({
      message: "Physical card request cancelled successfully",
      request
    });
  } catch (error) {
    console.error("Error cancelling physical card request:", error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: "Invalid request ID format." });
    }
    res.status(500).json({
      message: "An error occurred while cancelling the physical card request."
    });
  }
};

// Get physical card request statistics for user
exports.getMyPhysicalCardStats = async (req, res) => {
  const userId = req.user.userId;

  try {
    const stats = await RequestPhysicalCard.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Format stats
    const statusCounts = {
      PENDING: 0,
      APPROVED: 0,
      REJECTED: 0,
      PROCESSING: 0,
      DELIVERED: 0
    };

    stats.forEach(stat => {
      statusCounts[stat._id] = stat.count;
    });

    const totalRequests = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);

    res.status(200).json({
      message: "Physical card request statistics retrieved successfully",
      stats: {
        totalRequests,
        statusCounts
      }
    });
  } catch (error) {
    console.error("Error getting physical card request statistics:", error);
    res.status(500).json({
      message: "An error occurred while retrieving physical card request statistics."
    });
  }
}; 