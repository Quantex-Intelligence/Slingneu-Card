const Operator = require('../models/Operator');
const CircleCode = require('../models/CircleCode');

class OperatorService {
    // Operator methods
    async createOperator(operatorData) {
        try {
            const operator = new Operator(operatorData);
            await operator.save();
            return {
                success: true,
                data: operator,
                message: 'Operator created successfully'
            };
        } catch (error) {
            console.error('Create operator error:', error);
            return {
                success: false,
                error: error.message,
                message: 'Failed to create operator'
            };
        }
    }

    async updateOperator(operatorId, updateData) {
        try {
            const operator = await Operator.findByIdAndUpdate(
                operatorId,
                updateData,
                { new: true, runValidators: true }
            );
            
            if (!operator) {
                return {
                    success: false,
                    message: 'Operator not found'
                };
            }

            return {
                success: true,
                data: operator,
                message: 'Operator updated successfully'
            };
        } catch (error) {
            console.error('Update operator error:', error);
            return {
                success: false,
                error: error.message,
                message: 'Failed to update operator'
            };
        }
    }

    async deleteOperator(operatorId) {
        try {
            const operator = await Operator.findByIdAndDelete(operatorId);
            
            if (!operator) {
                return {
                    success: false,
                    message: 'Operator not found'
                };
            }

            return {
                success: true,
                message: 'Operator deleted successfully'
            };
        } catch (error) {
            console.error('Delete operator error:', error);
            return {
                success: false,
                error: error.message,
                message: 'Failed to delete operator'
            };
        }
    }

    async getOperatorById(operatorId) {
        try {
            const operator = await Operator.findById(operatorId);
            
            if (!operator) {
                return {
                    success: false,
                    message: 'Operator not found'
                };
            }

            return {
                success: true,
                data: operator,
                message: 'Operator retrieved successfully'
            };
        } catch (error) {
            console.error('Get operator error:', error);
            return {
                success: false,
                error: error.message,
                message: 'Failed to get operator'
            };
        }
    }

    async getAllOperators(category = null, isActive = null, page = 1, limit = 50) {
        try {
            const skip = (page - 1) * limit;
            const filter = {};
            
            if (category) filter.category = category;
            if (isActive !== null) filter.isActive = isActive;

            const operators = await Operator.find(filter)
                .sort({ category: 1, name: 1 })

            const total = await Operator.countDocuments(filter);

            return {
                success: true,
                data: {
                    operators,
                    pagination: {
                        page,
                        limit,
                        total,
                        pages: Math.ceil(total / limit)
                    }
                },
                message: 'Operators retrieved successfully'
            };
        } catch (error) {
            console.error('Get all operators error:', error);
            return {
                success: false,
                error: error.message,
                message: 'Failed to get operators'
            };
        }
    }

    async getOperatorsByCategory(category) {
        try {
            const operators = await Operator.find({ 
                category, 
                isActive: true 
            }).sort({ name: 1 });

            return {
                success: true,
                data: operators,
                message: 'Operators retrieved successfully'
            };
        } catch (error) {
            console.error('Get operators by category error:', error);
            return {
                success: false,
                error: error.message,
                message: 'Failed to get operators'
            };
        }
    }

    // Circle Code methods
    async createCircleCode(circleCodeData) {
        try {
            const circleCode = new CircleCode(circleCodeData);
            await circleCode.save();
            return {
                success: true,
                data: circleCode,
                message: 'Circle code created successfully'
            };
        } catch (error) {
            console.error('Create circle code error:', error);
            return {
                success: false,
                error: error.message,
                message: 'Failed to create circle code'
            };
        }
    }

    async updateCircleCode(circleCodeId, updateData) {
        try {
            const circleCode = await CircleCode.findByIdAndUpdate(
                circleCodeId,
                updateData,
                { new: true, runValidators: true }
            );
            
            if (!circleCode) {
                return {
                    success: false,
                    message: 'Circle code not found'
                };
            }

            return {
                success: true,
                data: circleCode,
                message: 'Circle code updated successfully'
            };
        } catch (error) {
            console.error('Update circle code error:', error);
            return {
                success: false,
                error: error.message,
                message: 'Failed to update circle code'
            };
        }
    }

    async deleteCircleCode(circleCodeId) {
        try {
            const circleCode = await CircleCode.findByIdAndDelete(circleCodeId);
            
            if (!circleCode) {
                return {
                    success: false,
                    message: 'Circle code not found'
                };
            }

            return {
                success: true,
                message: 'Circle code deleted successfully'
            };
        } catch (error) {
            console.error('Delete circle code error:', error);
            return {
                success: false,
                error: error.message,
                message: 'Failed to delete circle code'
            };
        }
    }

    async getCircleCodeById(circleCodeId) {
        try {
            const circleCode = await CircleCode.findById(circleCodeId);
            
            if (!circleCode) {
                return {
                    success: false,
                    message: 'Circle code not found'
                };
            }

            return {
                success: true,
                data: circleCode,
                message: 'Circle code retrieved successfully'
            };
        } catch (error) {
            console.error('Get circle code error:', error);
            return {
                success: false,
                error: error.message,
                message: 'Failed to get circle code'
            };
        }
    }

    async getAllCircleCodes(region = null, isActive = null, page = 1, limit = 50) {
        try {
            const skip = (page - 1) * limit;
            const filter = {};
            
            if (region) filter.region = region;
            if (isActive !== null) filter.isActive = isActive;

            const circleCodes = await CircleCode.find(filter)
                .sort({ state: 1, name: 1 })
                .skip(skip)
                .limit(limit);

            const total = await CircleCode.countDocuments(filter);

            return {
                success: true,
                data: {
                    circleCodes,
                    pagination: {
                        page,
                        limit,
                        total,
                        pages: Math.ceil(total / limit)
                    }
                },
                message: 'Circle codes retrieved successfully'
            };
        } catch (error) {
            console.error('Get all circle codes error:', error);
            return {
                success: false,
                error: error.message,
                message: 'Failed to get circle codes'
            };
        }
    }

    async getCircleCodesByRegion(region) {
        try {
            const circleCodes = await CircleCode.find({ 
                region, 
                isActive: true 
            }).sort({ state: 1, name: 1 });

            return {
                success: true,
                data: circleCodes,
                message: 'Circle codes retrieved successfully'
            };
        } catch (error) {
            console.error('Get circle codes by region error:', error);
            return {
                success: false,
                error: error.message,
                message: 'Failed to get circle codes'
            };
        }
    }

    // Bulk operations for initial data seeding
    async seedOperators(operatorsData) {
        try {
            const results = [];
            for (const operatorData of operatorsData) {
                try {
                    const operator = new Operator(operatorData);
                    await operator.save();
                    results.push({ success: true, data: operator });
                } catch (error) {
                    if (error.code === 11000) { // Duplicate key error
                        results.push({ success: false, error: 'Operator already exists' });
                    } else {
                        results.push({ success: false, error: error.message });
                    }
                }
            }
            return {
                success: true,
                data: results,
                message: 'Operators seeding completed'
            };
        } catch (error) {
            console.error('Seed operators error:', error);
            return {
                success: false,
                error: error.message,
                message: 'Failed to seed operators'
            };
        }
    }

    async seedCircleCodes(circleCodesData) {
        try {
            const results = [];
            for (const circleCodeData of circleCodesData) {
                try {
                    const circleCode = new CircleCode(circleCodeData);
                    await circleCode.save();
                    results.push({ success: true, data: circleCode });
                } catch (error) {
                    if (error.code === 11000) { // Duplicate key error
                        results.push({ success: false, error: 'Circle code already exists' });
                    } else {
                        results.push({ success: false, error: error.message });
                    }
                }
            }
            return {
                success: true,
                data: results,
                message: 'Circle codes seeding completed'
            };
        } catch (error) {
            console.error('Seed circle codes error:', error);
            return {
                success: false,
                error: error.message,
                message: 'Failed to seed circle codes'
            };
        }
    }
}

module.exports = new OperatorService(); 