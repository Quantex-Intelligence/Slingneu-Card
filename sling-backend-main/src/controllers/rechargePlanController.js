const rechargePlanService = require('../services/rechargePlanService');

class RechargePlanController {
    // Create recharge plan
    async createPlan(req, res) {
        try {
            const result = await rechargePlanService.createPlan(req.body);
            
            if (result.success) {
                return res.status(201).json(result);
            } else {
                return res.status(400).json(result);
            }
        } catch (error) {
            console.error('Create plan controller error:', error);
            return res.status(500).json({
                success: false,
                error: error.message,
                message: 'Internal server error'
            });
        }
    }

    // Update recharge plan
    async updatePlan(req, res) {
        try {
            const { planId } = req.params;
            const result = await rechargePlanService.updatePlan(planId, req.body);
            
            if (result.success) {
                return res.status(200).json(result);
            } else {
                return res.status(404).json(result);
            }
        } catch (error) {
            console.error('Update plan controller error:', error);
            return res.status(500).json({
                success: false,
                error: error.message,
                message: 'Internal server error'
            });
        }
    }

    // Delete recharge plan
    async deletePlan(req, res) {
        try {
            const { planId } = req.params;
            const result = await rechargePlanService.deletePlan(planId);
            
            if (result.success) {
                return res.status(200).json(result);
            } else {
                return res.status(404).json(result);
            }
        } catch (error) {
            console.error('Delete plan controller error:', error);
            return res.status(500).json({
                success: false,
                error: error.message,
                message: 'Internal server error'
            });
        }
    }

    // Get plan by ID
    async getPlanById(req, res) {
        try {
            const { planId } = req.params;
            const result = await rechargePlanService.getPlanById(planId);
            
            if (result.success) {
                return res.status(200).json(result);
            } else {
                return res.status(404).json(result);
            }
        } catch (error) {
            console.error('Get plan controller error:', error);
            return res.status(500).json({
                success: false,
                error: error.message,
                message: 'Internal server error'
            });
        }
    }

    // Get plan by plan ID
    async getPlanByPlanId(req, res) {
        try {
            const { planId } = req.params;
            const result = await rechargePlanService.getPlanByPlanId(planId);
            
            if (result.success) {
                return res.status(200).json(result);
            } else {
                return res.status(404).json(result);
            }
        } catch (error) {
            console.error('Get plan by plan ID controller error:', error);
            return res.status(500).json({
                success: false,
                error: error.message,
                message: 'Internal server error'
            });
        }
    }

    // Get all plans
    async getAllPlans(req, res) {
        try {
            const { 
                operatorCode, 
                circleCode, 
                planType, 
                planCategory, 
                isActive, 
                isPopular, 
                isBestSeller, 
                isSpecialOffer,
                minAmount,
                maxAmount,
                search,
                page = 1, 
                limit = 20 
            } = req.query;

            const filters = {};
            if (operatorCode) filters.operatorCode = operatorCode;
            if (circleCode) filters.circleCode = circleCode;
            if (planType) filters.planType = planType;
            if (planCategory) filters.planCategory = planCategory;
            if (isActive !== undefined) filters.isActive = isActive === 'true';
            if (isPopular !== undefined) filters.isPopular = isPopular === 'true';
            if (isBestSeller !== undefined) filters.isBestSeller = isBestSeller === 'true';
            if (isSpecialOffer !== undefined) filters.isSpecialOffer = isSpecialOffer === 'true';
            if (minAmount) filters.minAmount = parseFloat(minAmount);
            if (maxAmount) filters.maxAmount = parseFloat(maxAmount);
            if (search) filters.search = search;

            const result = await rechargePlanService.getAllPlans(
                filters,
                parseInt(page),
                parseInt(limit)
            );
            
            if (result.success) {
                return res.status(200).json(result);
            } else {
                return res.status(400).json(result);
            }
        } catch (error) {
            console.error('Get all plans controller error:', error);
            return res.status(500).json({
                success: false,
                error: error.message,
                message: 'Internal server error'
            });
        }
    }

    // Get plans by operator and circle
    async getPlansByOperatorAndCircle(req, res) {
        try {
            const { operatorCode } = req.params;
            const { planType, planCategory, minAmount, maxAmount } = req.query;
            const filters = {};
            if (planType) filters.planType = planType;
            if (planCategory) filters.planCategory = planCategory;
            if (minAmount) filters.minAmount = parseFloat(minAmount);
            if (maxAmount) filters.maxAmount = parseFloat(maxAmount);

            const result = await rechargePlanService.getPlansByOperatorAndCircle(
                operatorCode,
                filters
            );
            
            if (result.success) {
                return res.status(200).json(result);
            } else {
                return res.status(400).json(result);
            }
        } catch (error) {
            console.error('Get plans by operator and circle controller error:', error);
            return res.status(500).json({
                success: false,
                error: error.message,
                message: 'Internal server error'
            });
        }
    }

    // Get popular plans
    async getPopularPlans(req, res) {
        try {
            const { limit = 10 } = req.query;
            const result = await rechargePlanService.getPopularPlans(parseInt(limit));
            
            if (result.success) {
                return res.status(200).json(result);
            } else {
                return res.status(400).json(result);
            }
        } catch (error) {
            console.error('Get popular plans controller error:', error);
            return res.status(500).json({
                success: false,
                error: error.message,
                message: 'Internal server error'
            });
        }
    }

    // Get best seller plans
    async getBestSellerPlans(req, res) {
        try {
            const { limit = 10 } = req.query;
            const result = await rechargePlanService.getBestSellerPlans(parseInt(limit));
            
            if (result.success) {
                return res.status(200).json(result);
            } else {
                return res.status(400).json(result);
            }
        } catch (error) {
            console.error('Get best seller plans controller error:', error);
            return res.status(500).json({
                success: false,
                error: error.message,
                message: 'Internal server error'
            });
        }
    }

    // Get special offers
    async getSpecialOffers(req, res) {
        try {
            const { limit = 10 } = req.query;
            const result = await rechargePlanService.getSpecialOffers(parseInt(limit));
            
            if (result.success) {
                return res.status(200).json(result);
            } else {
                return res.status(400).json(result);
            }
        } catch (error) {
            console.error('Get special offers controller error:', error);
            return res.status(500).json({
                success: false,
                error: error.message,
                message: 'Internal server error'
            });
        }
    }

    // Search plans
    async searchPlans(req, res) {
        try {
            const { q: searchTerm } = req.query;
            const { 
                operatorCode, 
                circleCode, 
                planType, 
                planCategory,
                page = 1, 
                limit = 20 
            } = req.query;

            if (!searchTerm) {
                return res.status(400).json({
                    success: false,
                    message: 'Search term is required'
                });
            }

            const filters = {};
            if (operatorCode) filters.operatorCode = operatorCode;
            if (circleCode) filters.circleCode = circleCode;
            if (planType) filters.planType = planType;
            if (planCategory) filters.planCategory = planCategory;

            const result = await rechargePlanService.searchPlans(
                searchTerm,
                filters,
                parseInt(page),
                parseInt(limit)
            );
            
            if (result.success) {
                return res.status(200).json(result);
            } else {
                return res.status(400).json(result);
            }
        } catch (error) {
            console.error('Search plans controller error:', error);
            return res.status(500).json({
                success: false,
                error: error.message,
                message: 'Internal server error'
            });
        }
    }

    // Bulk create plans
    async bulkCreatePlans(req, res) {
        try {
            const { plans } = req.body;
            
            if (!plans || !Array.isArray(plans)) {
                return res.status(400).json({
                    success: false,
                    message: 'Plans array is required'
                });
            }

            const result = await rechargePlanService.bulkCreatePlans(plans);
            return res.status(200).json(result);
        } catch (error) {
            console.error('Bulk create plans controller error:', error);
            return res.status(500).json({
                success: false,
                error: error.message,
                message: 'Internal server error'
            });
        }
    }

    // Get plan statistics
    async getPlanStatistics(req, res) {
        try {
            const result = await rechargePlanService.getPlanStatistics();
            
            if (result.success) {
                return res.status(200).json(result);
            } else {
                return res.status(400).json(result);
            }
        } catch (error) {
            console.error('Get plan statistics controller error:', error);
            return res.status(500).json({
                success: false,
                error: error.message,
                message: 'Internal server error'
            });
        }
    }
}

module.exports = new RechargePlanController(); 