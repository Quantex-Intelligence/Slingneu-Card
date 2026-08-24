const ScratchCard = require("../models/ScratchCard");
const Cashback = require("../models/Cashback");
const User = require("../models/User");

// Create scratch card (check cashback conditions and create if matched)
exports.createScratchCard = async (req, res) => {
  const { userId, amount } = req.body;

  if (!userId || !amount) {
    return res.status(400).json({
      message: "User ID and amount are required."
    });
  }

  if (amount <= 0) {
    return res.status(400).json({
      message: "Amount must be greater than 0."
    });
  }

  try {
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found."
      });
    }

    // Get all active cashback offers
    const activeCashbacks = await Cashback.find({ isActive: true });

    if (activeCashbacks.length === 0) {
      return res.status(200).json({
        success: false,
        message: "No active cashback offers available."
      });
    }

    // Check if user has any previous payments (for first_payment condition)
    const previousPayments = await ScratchCard.find({
      user: userId,
      isUsed: true
    });

    const isFirstPayment = previousPayments.length === 0;

    // Find matching cashback conditions
    let matchedCondition = null;
    let maxCashbackAmount = 0;
    let maxCashbackPercentage = 0;

    for (const cashback of activeCashbacks) {
      for (const condition of cashback.conditions) {
        let shouldApply = false;
        let cashbackAmount = 0;
        let cashbackPercentage = 0;

        switch (condition.type) {
          case 'first_payment':
            if (isFirstPayment) {
              shouldApply = true;
              cashbackAmount = condition.cashbackAmount;
              cashbackPercentage = condition.cashbackPercentage || 0;
            }
            break;

          case 'amount_based':
            if (amount >= (condition.minimumAmount || 0)) {
              shouldApply = true;
              cashbackAmount = condition.cashbackAmount;
              cashbackPercentage = condition.cashbackPercentage || 0;
            }
            break;

          case 'percentage_based':
            if (amount >= (condition.minimumAmount || 0)) {
              shouldApply = true;
              cashbackAmount = condition.cashbackAmount;
              cashbackPercentage = condition.cashbackPercentage || 0;
            }
            break;
        }

        // Apply the condition with highest cashback amount
        if (shouldApply && cashbackAmount > maxCashbackAmount) {
          maxCashbackAmount = cashbackAmount;
          maxCashbackPercentage = cashbackPercentage;
          matchedCondition = {
            type: condition.type,
            description: condition.description,
            minimumAmount: condition.minimumAmount,
          };
        }
      }
    }

    // If no matching condition found
    if (!matchedCondition) {
      return res.status(200).json({
        success: false,
        message: "No cashback conditions matched for this payment."
      });
    }

    // Create scratch card with matched condition
    const scratchCard = new ScratchCard({
      user: userId,
      amount: amount,
      key: true, // Set key to true when cashback condition is matched
      cashbackAmount: maxCashbackAmount,
      cashbackPercentage: maxCashbackPercentage,
      appliedCashbackCondition: matchedCondition,
    });

    await scratchCard.save();

    res.status(201).json({
      message: "Scratch card created successfully with cashback!",
      scratchCard: scratchCard,
      matchedCondition: matchedCondition,
      cashbackAmount: maxCashbackAmount,
      cashbackPercentage: maxCashbackPercentage,
    });

  } catch (error) {
    console.error("Error creating scratch card:", error);
    res.status(500).json({
      message: "An error occurred while creating the scratch card."
    });
  }
};

// Get all scratch cards (Admin only)
exports.getAllScratchCards = async (req, res) => {
  try {
    const scratchCards = await ScratchCard.find({})
      .populate('user', 'name email')
      .select('-__v')
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Scratch cards retrieved successfully",
      count: scratchCards.length,
      scratchCards: scratchCards,
    });
  } catch (error) {
    console.error("Error getting all scratch cards:", error);
    res.status(500).json({
      message: "An error occurred while retrieving scratch cards."
    });
  }
};

// Get scratch cards by user ID
exports.getScratchCardsByUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const scratchCards = await ScratchCard.find({ user: userId })
      .populate('user', 'name email')
      .select('-__v')
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "User scratch cards retrieved successfully",
      count: scratchCards.length,
      scratchCards: scratchCards,
    });
  } catch (error) {
    console.error("Error getting user scratch cards:", error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: "Invalid user ID format." });
    }
    res.status(500).json({
      message: "An error occurred while retrieving user scratch cards."
    });
  }
};

// Get scratch card by ID
exports.getScratchCardById = async (req, res) => {
  const { id } = req.params;

  try {
    const scratchCard = await ScratchCard.findById(id)
      .populate('user', 'name email')
      .select('-__v');

    if (!scratchCard) {
      return res.status(404).json({ message: "Scratch card not found." });
    }

    res.status(200).json({
      message: "Scratch card retrieved successfully",
      scratchCard: scratchCard,
    });
  } catch (error) {
    console.error("Error getting scratch card by ID:", error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: "Invalid scratch card ID format." });
    }
    res.status(500).json({
      message: "An error occurred while retrieving scratch card."
    });
  }
};

// Update scratch card (mark as used)
exports.updateScratchCard = async (req, res) => {
  const { id } = req.params;
  const { isUsed, key } = req.body;

  try {
    const scratchCard = await ScratchCard.findById(id);

    if (!scratchCard) {
      return res.status(404).json({ message: "Scratch card not found." });
    }

    // Update allowed fields
    if (isUsed !== undefined) {
      scratchCard.isUsed = isUsed;
      if (isUsed) {
        scratchCard.usedAt = new Date();
      } else {
        scratchCard.usedAt = null;
      }
    }

    if (key !== undefined) {
      scratchCard.key = key;
    }

    await scratchCard.save();

    res.status(200).json({
      message: "Scratch card updated successfully",
      scratchCard: scratchCard,
    });
  } catch (error) {
    console.error("Error updating scratch card:", error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: "Invalid scratch card ID format." });
    }
    res.status(500).json({
      message: "An error occurred while updating scratch card."
    });
  }
};

// Get scratch card statistics
exports.getScratchCardStats = async (req, res) => {
  try {
    const totalScratchCards = await ScratchCard.countDocuments();
    const usedScratchCards = await ScratchCard.countDocuments({ isUsed: true });
    const activeScratchCards = await ScratchCard.countDocuments({ isActive: true });
    const totalCashbackAmount = await ScratchCard.aggregate([
      { $match: { isUsed: true } },
      { $group: { _id: null, total: { $sum: "$cashbackAmount" } } }
    ]);

    res.status(200).json({
      message: "Scratch card statistics retrieved successfully",
      stats: {
        total: totalScratchCards,
        used: usedScratchCards,
        active: activeScratchCards,
        totalCashbackAmount: totalCashbackAmount[0]?.total || 0,
        unused: totalScratchCards - usedScratchCards,
      },
    });
  } catch (error) {
    console.error("Error getting scratch card stats:", error);
    res.status(500).json({
      message: "An error occurred while retrieving scratch card statistics."
    });
  }
}; 