const operatorService = require('../services/operatorService');

class OperatorController {
    // Operator endpoints
    async createOperator(req, res) {
        try {
            const result = await operatorService.createOperator(req.body);
            
            if (result.success) {
                return res.status(201).json(result);
            } else {
                return res.status(400).json(result);
            }
        } catch (error) {
            console.error('Create operator controller error:', error);
            return res.status(500).json({
                success: false,
                error: error.message,
                message: 'Internal server error'
            });
        }
    }

    async updateOperator(req, res) {
        try {
            const { operatorId } = req.params;
            const result = await operatorService.updateOperator(operatorId, req.body);
            
            if (result.success) {
                return res.status(200).json(result);
            } else {
                return res.status(404).json(result);
            }
        } catch (error) {
            console.error('Update operator controller error:', error);
            return res.status(500).json({
                success: false,
                error: error.message,
                message: 'Internal server error'
            });
        }
    }

    async deleteOperator(req, res) {
        try {
            const { operatorId } = req.params;
            const result = await operatorService.deleteOperator(operatorId);
            
            if (result.success) {
                return res.status(200).json(result);
            } else {
                return res.status(404).json(result);
            }
        } catch (error) {
            console.error('Delete operator controller error:', error);
            return res.status(500).json({
                success: false,
                error: error.message,
                message: 'Internal server error'
            });
        }
    }

    async getOperatorById(req, res) {
        try {
            const { operatorId } = req.params;
            const result = await operatorService.getOperatorById(operatorId);
            
            if (result.success) {
                return res.status(200).json(result);
            } else {
                return res.status(404).json(result);
            }
        } catch (error) {
            console.error('Get operator controller error:', error);
            return res.status(500).json({
                success: false,
                error: error.message,
                message: 'Internal server error'
            });
        }
    }

    async getAllOperators(req, res) {
        try {
            const { category, isActive, page = 1, limit = 50 } = req.query;
            const result = await operatorService.getAllOperators(
                category, 
                isActive !== undefined ? isActive === 'true' : null,
                parseInt(page),
                parseInt(limit)
            );
            
            if (result.success) {
                return res.status(200).json(result);
            } else {
                return res.status(400).json(result);
            }
        } catch (error) {
            console.error('Get all operators controller error:', error);
            return res.status(500).json({
                success: false,
                error: error.message,
                message: 'Internal server error'
            });
        }
    }

    async getOperatorsByCategory(req, res) {
        try {
            const { category } = req.params;
            const result = await operatorService.getOperatorsByCategory(category);
            
            if (result.success) {
                return res.status(200).json(result);
            } else {
                return res.status(400).json(result);
            }
        } catch (error) {
            console.error('Get operators by category controller error:', error);
            return res.status(500).json({
                success: false,
                error: error.message,
                message: 'Internal server error'
            });
        }
    }

    // Circle Code endpoints
    async createCircleCode(req, res) {
        try {
            const result = await operatorService.createCircleCode(req.body);
            
            if (result.success) {
                return res.status(201).json(result);
            } else {
                return res.status(400).json(result);
            }
        } catch (error) {
            console.error('Create circle code controller error:', error);
            return res.status(500).json({
                success: false,
                error: error.message,
                message: 'Internal server error'
            });
        }
    }

    async updateCircleCode(req, res) {
        try {
            const { circleCodeId } = req.params;
            const result = await operatorService.updateCircleCode(circleCodeId, req.body);
            
            if (result.success) {
                return res.status(200).json(result);
            } else {
                return res.status(404).json(result);
            }
        } catch (error) {
            console.error('Update circle code controller error:', error);
            return res.status(500).json({
                success: false,
                error: error.message,
                message: 'Internal server error'
            });
        }
    }

    async deleteCircleCode(req, res) {
        try {
            const { circleCodeId } = req.params;
            const result = await operatorService.deleteCircleCode(circleCodeId);
            
            if (result.success) {
                return res.status(200).json(result);
            } else {
                return res.status(404).json(result);
            }
        } catch (error) {
            console.error('Delete circle code controller error:', error);
            return res.status(500).json({
                success: false,
                error: error.message,
                message: 'Internal server error'
            });
        }
    }

    async getCircleCodeById(req, res) {
        try {
            const { circleCodeId } = req.params;
            const result = await operatorService.getCircleCodeById(circleCodeId);
            
            if (result.success) {
                return res.status(200).json(result);
            } else {
                return res.status(404).json(result);
            }
        } catch (error) {
            console.error('Get circle code controller error:', error);
            return res.status(500).json({
                success: false,
                error: error.message,
                message: 'Internal server error'
            });
        }
    }

    async getAllCircleCodes(req, res) {
        try {
            const { region, isActive, page = 1, limit = 50 } = req.query;
            const result = await operatorService.getAllCircleCodes(
                region,
                isActive !== undefined ? isActive === 'true' : null,
                parseInt(page),
                parseInt(limit)
            );
            
            if (result.success) {
                return res.status(200).json(result);
            } else {
                return res.status(400).json(result);
            }
        } catch (error) {
            console.error('Get all circle codes controller error:', error);
            return res.status(500).json({
                success: false,
                error: error.message,
                message: 'Internal server error'
            });
        }
    }

    async getCircleCodesByRegion(req, res) {
        try {
            const { region } = req.params;
            const result = await operatorService.getCircleCodesByRegion(region);
            
            if (result.success) {
                return res.status(200).json(result);
            } else {
                return res.status(400).json(result);
            }
        } catch (error) {
            console.error('Get circle codes by region controller error:', error);
            return res.status(500).json({
                success: false,
                error: error.message,
                message: 'Internal server error'
            });
        }
    }

    // Seeding endpoints
    async seedOperators(req, res) {
        try {
            const { operators } = req.body;
            
            if (!operators || !Array.isArray(operators)) {
                return res.status(400).json({
                    success: false,
                    message: 'Operators array is required'
                });
            }

            const result = await operatorService.seedOperators(operators);
            return res.status(200).json(result);
        } catch (error) {
            console.error('Seed operators controller error:', error);
            return res.status(500).json({
                success: false,
                error: error.message,
                message: 'Internal server error'
            });
        }
    }

    async seedCircleCodes(req, res) {
        try {
            const { circleCodes } = req.body;
            
            if (!circleCodes || !Array.isArray(circleCodes)) {
                return res.status(400).json({
                    success: false,
                    message: 'Circle codes array is required'
                });
            }

            const result = await operatorService.seedCircleCodes(circleCodes);
            return res.status(200).json(result);
        } catch (error) {
            console.error('Seed circle codes controller error:', error);
            return res.status(500).json({
                success: false,
                error: error.message,
                message: 'Internal server error'
            });
        }
    }
}

module.exports = new OperatorController(); 