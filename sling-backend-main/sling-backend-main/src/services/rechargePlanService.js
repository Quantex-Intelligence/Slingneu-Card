const RechargePlan = require("../models/RechargePlan");
const Operator = require("../models/Operator");
const CircleCode = require("../models/CircleCode");

class RechargePlanService {
  // Create recharge plan
  async createPlan(planData) {
    try {
      // Validate operator and circle code
      const operator = await Operator.findOne({
        code: planData.operatorCode,
        isActive: true,
      });
      const circleCode = await CircleCode.findOne({
        code: planData.circleCode,
        isActive: true,
      });

      if (!operator) {
        return {
          success: false,
          error: "Invalid operator code",
          message: "Operator not found or inactive",
        };
      }

      // Set operator and circle names
      planData.operatorName = operator.name;

      const plan = new RechargePlan(planData);
      await plan.save();

      return {
        success: true,
        data: plan.getFormattedResponse(),
        message: "Recharge plan created successfully",
      };
    } catch (error) {
      console.error("Create plan error:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to create recharge plan",
      };
    }
  }

  // Update recharge plan
  async updatePlan(planId, updateData) {
    try {
      // If operator or circle code is being updated, validate them
      if (updateData.operatorCode) {
        const operator = await Operator.findOne({
          code: updateData.operatorCode,
          isActive: true,
        });
        if (!operator) {
          return {
            success: false,
            error: "Invalid operator code",
            message: "Operator not found or inactive",
          };
        }
        updateData.operatorName = operator.name;
      }

      if (updateData.circleCode) {
        const circleCode = await CircleCode.findOne({
          code: updateData.circleCode,
          isActive: true,
        });
        if (!circleCode) {
          return {
            success: false,
            error: "Invalid circle code",
            message: "Circle code not found or inactive",
          };
        }
        updateData.circleName = circleCode.name;
      }

      const plan = await RechargePlan.findByIdAndUpdate(planId, updateData, {
        new: true,
        runValidators: true,
      });

      if (!plan) {
        return {
          success: false,
          message: "Recharge plan not found",
        };
      }

      return {
        success: true,
        data: plan.getFormattedResponse(),
        message: "Recharge plan updated successfully",
      };
    } catch (error) {
      console.error("Update plan error:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to update recharge plan",
      };
    }
  }

  // Delete recharge plan
  async deletePlan(planId) {
    try {
      const plan = await RechargePlan.findByIdAndDelete(planId);

      if (!plan) {
        return {
          success: false,
          message: "Recharge plan not found",
        };
      }

      return {
        success: true,
        message: "Recharge plan deleted successfully",
      };
    } catch (error) {
      console.error("Delete plan error:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to delete recharge plan",
      };
    }
  }

  // Get plan by ID
  async getPlanById(planId) {
    try {
      const plan = await RechargePlan.findById(planId);

      if (!plan) {
        return {
          success: false,
          message: "Recharge plan not found",
        };
      }

      return {
        success: true,
        data: plan.getFormattedResponse(),
        message: "Recharge plan retrieved successfully",
      };
    } catch (error) {
      console.error("Get plan error:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to get recharge plan",
      };
    }
  }

  // Get plan by plan ID
  async getPlanByPlanId(planId) {
    try {
      const plan = await RechargePlan.findOne({ planId });

      if (!plan) {
        return {
          success: false,
          message: "Recharge plan not found",
        };
      }

      return {
        success: true,
        data: plan.getFormattedResponse(),
        message: "Recharge plan retrieved successfully",
      };
    } catch (error) {
      console.error("Get plan error:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to get recharge plan",
      };
    }
  }

  // Get all plans with filters
  async getAllPlans(filters = {}, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;
      const query = {};

      // Apply filters
      if (filters.operatorCode) query.operatorCode = filters.operatorCode;
      if (filters.circleCode) query.circleCode = filters.circleCode;
      if (filters.planType) query.planType = filters.planType;
      if (filters.planCategory) query.planCategory = filters.planCategory;
      if (filters.isActive !== undefined) query.isActive = filters.isActive;
      if (filters.isPopular !== undefined) query.isPopular = filters.isPopular;
      if (filters.isBestSeller !== undefined)
        query.isBestSeller = filters.isBestSeller;
      if (filters.isSpecialOffer !== undefined)
        query.isSpecialOffer = filters.isSpecialOffer;
      if (filters.minAmount) query.amount = { $gte: filters.minAmount };
      if (filters.maxAmount)
        query.amount = { ...query.amount, $lte: filters.maxAmount };
      if (filters.search) {
        query.$or = [
          { planName: { $regex: filters.search, $options: "i" } },
          { description: { $regex: filters.search, $options: "i" } },
          { operatorName: { $regex: filters.search, $options: "i" } },
        ];
      }

      const plans = await RechargePlan.find(query).sort({
        sortOrder: 1,
        priority: -1,
        amount: 1,
      });

      const total = await RechargePlan.countDocuments(query);

      const formattedPlans = plans.map((plan) => plan.getFormattedResponse());

      return {
        success: true,
        data: {
          plans: formattedPlans,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        },
        message: "Recharge plans retrieved successfully",
      };
    } catch (error) {
      console.error("Get all plans error:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to get recharge plans",
      };
    }
  }

  // Get plans by operator and circle
  async getPlansByOperatorAndCircle(operatorCode, filters = {}) {
    try {
      const query = {
        operatorCode,
        isActive: true,
        ...filters,
      };

      const plans = await RechargePlan.find(query);
      const formattedPlans = plans.map((plan) => plan.getFormattedResponse());

      return {
        success: true,
        data: formattedPlans,
        message: "Recharge plans retrieved successfully",
      };
    } catch (error) {
      console.error("Get plans by operator and circle error:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to get recharge plans",
      };
    }
  }

  // Get popular plans
  async getPopularPlans(limit = 10) {
    try {
      const plans = await RechargePlan.find({
        isPopular: true,
        isActive: true,
      })
        .sort({ priority: -1, amount: 1 })
        .limit(limit);

      const formattedPlans = plans.map((plan) => plan.getFormattedResponse());

      return {
        success: true,
        data: formattedPlans,
        message: "Popular plans retrieved successfully",
      };
    } catch (error) {
      console.error("Get popular plans error:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to get popular plans",
      };
    }
  }

  // Get best seller plans
  async getBestSellerPlans(limit = 10) {
    try {
      const plans = await RechargePlan.find({
        isBestSeller: true,
        isActive: true,
      })
        .sort({ priority: -1, amount: 1 })
        .limit(limit);

      const formattedPlans = plans.map((plan) => plan.getFormattedResponse());

      return {
        success: true,
        data: formattedPlans,
        message: "Best seller plans retrieved successfully",
      };
    } catch (error) {
      console.error("Get best seller plans error:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to get best seller plans",
      };
    }
  }

  // Get special offers
  async getSpecialOffers(limit = 10) {
    try {
      const plans = await RechargePlan.find({
        isSpecialOffer: true,
        isActive: true,
        offerValidTill: { $gte: new Date() },
      })
        .sort({ priority: -1, amount: 1 })
        .limit(limit);

      const formattedPlans = plans.map((plan) => plan.getFormattedResponse());

      return {
        success: true,
        data: formattedPlans,
        message: "Special offers retrieved successfully",
      };
    } catch (error) {
      console.error("Get special offers error:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to get special offers",
      };
    }
  }

  // Search plans
  async searchPlans(searchTerm, filters = {}, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;
      const query = {
        isActive: true,
        $or: [
          { planName: { $regex: searchTerm, $options: "i" } },
          { description: { $regex: searchTerm, $options: "i" } },
          { operatorName: { $regex: searchTerm, $options: "i" } },
          { circleName: { $regex: searchTerm, $options: "i" } },
          { tags: { $in: [new RegExp(searchTerm, "i")] } },
        ],
        ...filters,
      };

      const plans = await RechargePlan.find(query)
        .sort({ sortOrder: 1, priority: -1, amount: 1 })
        .skip(skip)
        .limit(limit);

      const total = await RechargePlan.countDocuments(query);

      const formattedPlans = plans.map((plan) => plan.getFormattedResponse());

      return {
        success: true,
        data: {
          plans: formattedPlans,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        },
        message: "Search results retrieved successfully",
      };
    } catch (error) {
      console.error("Search plans error:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to search plans",
      };
    }
  }

  // Bulk create plans
  async bulkCreatePlans(plansData) {
    try {
      const results = [];

      for (const planData of plansData) {
        try {
          // Validate operator and circle code
          const operator = await Operator.findOne({
            code: planData.operatorCode,
            isActive: true,
          });
          const circleCode = await CircleCode.findOne({
            code: planData.circleCode,
            isActive: true,
          });

          if (!operator) {
            results.push({
              success: false,
              error: `Invalid operator code: ${planData.operatorCode}`,
            });
            continue;
          }

          if (!circleCode) {
            results.push({
              success: false,
              error: `Invalid circle code: ${planData.circleCode}`,
            });
            continue;
          }

          // Set operator and circle names
          planData.operatorName = operator.name;
          planData.circleName = circleCode.name;

          const plan = new RechargePlan(planData);
          await plan.save();

          results.push({
            success: true,
            data: plan.getFormattedResponse(),
          });
        } catch (error) {
          results.push({
            success: false,
            error: error.message,
          });
        }
      }

      return {
        success: true,
        data: results,
        message: "Bulk plan creation completed",
      };
    } catch (error) {
      console.error("Bulk create plans error:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to bulk create plans",
      };
    }
  }

  // Get plan statistics
  async getPlanStatistics() {
    try {
      const stats = await RechargePlan.aggregate([
        {
          $group: {
            _id: null,
            totalPlans: { $sum: 1 },
            activePlans: { $sum: { $cond: ["$isActive", 1, 0] } },
            popularPlans: { $sum: { $cond: ["$isPopular", 1, 0] } },
            bestSellerPlans: { $sum: { $cond: ["$isBestSeller", 1, 0] } },
            specialOffers: { $sum: { $cond: ["$isSpecialOffer", 1, 0] } },
            avgAmount: { $avg: "$amount" },
            minAmount: { $min: "$amount" },
            maxAmount: { $max: "$amount" },
          },
        },
      ]);

      const planTypeStats = await RechargePlan.aggregate([
        {
          $group: {
            _id: "$planType",
            count: { $sum: 1 },
          },
        },
      ]);

      const operatorStats = await RechargePlan.aggregate([
        {
          $group: {
            _id: "$operatorCode",
            operatorName: { $first: "$operatorName" },
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]);

      return {
        success: true,
        data: {
          overall: stats[0] || {},
          byPlanType: planTypeStats,
          byOperator: operatorStats,
        },
        message: "Plan statistics retrieved successfully",
      };
    } catch (error) {
      console.error("Get plan statistics error:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to get plan statistics",
      };
    }
  }
}

module.exports = new RechargePlanService();
