const cashfreeService = require('../services/cashfreeService');
const User = require('../models/User');

class CashfreeController {
    // Create payment order
    async createOrder(req, res) {
        try {
            const {
                order_amount,
                order_id,
            } = req.body;

            // Get user details from token
            const userId = req.user?.userId;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            // Fetch user details from database
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Validation
            if (!order_amount || !order_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields: order_amount, order_id'
                });
            }

            const orderData = {
                order_amount,
                order_currency: "INR",
                order_id,
                customer_details: {
                    customer_id: user._id.toString(),
                    customer_phone: user.phone,
                    customer_name: user.name,
                    customer_email: user.email || `${user.phone}@temp.com` // Fallback email if not available
                },
            };

            const result = await cashfreeService.createOrder(orderData);

            if (result.success) {
                res.status(201).json({
                    success: true,
                    message: result.message,
                    data: result.data
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: result.message,
                    error: result.error
                });
            }
        } catch (error) {
            console.error('Create order controller error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Get order details
    async getOrder(req, res) {
        try {
            const { orderId } = req.params;

            if (!orderId) {
                return res.status(400).json({
                    success: false,
                    message: 'Order ID is required'
                });
            }

            const result = await cashfreeService.getOrder(orderId);

            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: result.message,
                    data: result.data
                });
            } else {
                res.status(404).json({
                    success: false,
                    message: result.message,
                    error: result.error
                });
            }
        } catch (error) {
            console.error('Get order controller error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Create payment link
    async createPaymentLink(req, res) {
        try {
            const {
                linkId,
                amount,
                currency,
                purpose,
                autoReminders,
                sendSms,
                sendEmail,
                expiryTime,
                notes
            } = req.body;

            // Get user details from token
            const userId = req.user?.userId;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            // Fetch user details from database
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Validation
            if (!linkId || !amount) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields: linkId, amount'
                });
            }

            const paymentData = {
                linkId,
                amount,
                currency,
                purpose,
                customerPhone: user.phone,
                customerEmail: user.email || `${user.phone}@temp.com`, // Fallback email if not available
                customerName: user.name,
                autoReminders,
                sendSms,
                sendEmail,
                expiryTime,
                notes,
                createdBy: user._id
            };

            const result = await cashfreeService.createPaymentLink(paymentData);

            if (result.success) {
                res.status(201).json({
                    success: true,
                    message: result.message,
                    data: result.data
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: result.message,
                    error: result.error
                });
            }
        } catch (error) {
            console.error('Create payment link controller error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Get payment link details
    async getPaymentLink(req, res) {
        try {
            const { linkId } = req.params;

            if (!linkId) {
                return res.status(400).json({
                    success: false,
                    message: 'Link ID is required'
                });
            }

            const result = await cashfreeService.getPaymentLink(linkId);

            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: result.message,
                    data: result.data
                });
            } else {
                res.status(404).json({
                    success: false,
                    message: result.message,
                    error: result.error
                });
            }
        } catch (error) {
            console.error('Get payment link controller error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Process refund
    async refundPayment(req, res) {
        try {
            const { orderId } = req.params;
            const { amount, note, refundId } = req.body;

            // Validation
            if (!orderId || !amount || !refundId) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields: orderId, amount, refundId'
                });
            }

            const refundData = {
                orderId,
                amount,
                note,
                refundId
            };

            const result = await cashfreeService.refundPayment(refundData);

            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: result.message,
                    data: result.data
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: result.message,
                    error: result.error
                });
            }
        } catch (error) {
            console.error('Refund payment controller error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Get refund details
    async getRefund(req, res) {
        try {
            const { orderId, refundId } = req.params;

            if (!orderId || !refundId) {
                return res.status(400).json({
                    success: false,
                    message: 'Order ID and Refund ID are required'
                });
            }

            const result = await cashfreeService.getRefund(orderId, refundId);

            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: result.message,
                    data: result.data
                });
            } else {
                res.status(404).json({
                    success: false,
                    message: result.message,
                    error: result.error
                });
            }
        } catch (error) {
            console.error('Get refund controller error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Webhook handler
    async webhookHandler(req, res) {
        try {
            const signature = req.headers['x-webhook-signature'];
            const payload = JSON.stringify(req.body);

            // Verify webhook signature
            const isValidSignature = cashfreeService.verifyWebhookSignature(payload, signature);

            if (!isValidSignature) {
                console.error('Invalid webhook signature');
                return res.status(401).json({
                    success: false,
                    message: 'Invalid webhook signature'
                });
            }

            const webhookData = req.body;
            console.log('Webhook received:', webhookData);

            // Process webhook data
            const result = await cashfreeService.processWebhook(webhookData);

            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: 'Webhook processed successfully'
                });
            } else {
                console.error('Webhook processing failed:', result.error);
                res.status(500).json({
                    success: false,
                    message: 'Webhook processing failed',
                    error: result.error
                });
            }
        } catch (error) {
            console.error('Webhook handler error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Get payment methods
    async getPaymentMethods(req, res) {
        try {
            const result = await cashfreeService.getPaymentMethods();

            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: result.message,
                    data: result.data
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: result.message,
                    error: result.error
                });
            }
        } catch (error) {
            console.error('Get payment methods controller error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Get settlements
    async getSettlements(req, res) {
        try {
            const { fromDate, toDate, status } = req.query;

            // Validation
            if (!fromDate || !toDate) {
                return res.status(400).json({
                    success: false,
                    message: 'fromDate and toDate are required'
                });
            }

            const settlementData = {
                fromDate,
                toDate,
                status
            };

            const result = await cashfreeService.getSettlements(settlementData);

            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: result.message,
                    data: result.data
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: result.message,
                    error: result.error
                });
            }
        } catch (error) {
            console.error('Get settlements controller error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Get user's payment links
    async getUserPaymentLinks(req, res) {
        try {
            // Get user details from token
            const userId = req.user?.userId;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            const result = await cashfreeService.getUserPaymentLinks(userId);

            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: result.message,
                    data: result.data
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: result.message,
                    error: result.error
                });
            }
        } catch (error) {
            console.error('Get user payment links controller error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Update payment status by order ID
    async updatePaymentStatus(req, res) {
        try {
            const { orderId } = req.params;
            const { 
                status, 
                paymentId, 
                gatewayPaymentId, 
                paymentMethod, 
                failureReason, 
                notes 
            } = req.body;

            // Validation
            if (!orderId || !status) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields: orderId, status'
                });
            }

            const additionalData = {};
            if (paymentId) additionalData.paymentId = paymentId;
            if (gatewayPaymentId) additionalData.gatewayPaymentId = gatewayPaymentId;
            if (paymentMethod) additionalData.paymentMethod = paymentMethod;
            if (failureReason) additionalData.failureReason = failureReason;
            if (notes) additionalData.notes = notes;

            const result = await cashfreeService.updatePaymentStatus(orderId, status, additionalData);

            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: result.message,
                    data: result.data
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: result.message,
                    error: result.error
                });
            }
        } catch (error) {
            console.error('Update payment status controller error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Update payment status by transaction ID
    async updatePaymentStatusByTransactionId(req, res) {
        try {
            const { transactionId } = req.params;
            const { 
                status, 
                paymentId, 
                gatewayPaymentId, 
                paymentMethod, 
                failureReason, 
                notes 
            } = req.body;

            // Validation
            if (!transactionId || !status) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields: transactionId, status'
                });
            }

            const additionalData = {};
            if (paymentId) additionalData.paymentId = paymentId;
            if (gatewayPaymentId) additionalData.gatewayPaymentId = gatewayPaymentId;
            if (paymentMethod) additionalData.paymentMethod = paymentMethod;
            if (failureReason) additionalData.failureReason = failureReason;
            if (notes) additionalData.notes = notes;

            const result = await cashfreeService.updatePaymentStatusByTransactionId(transactionId, status, additionalData);

            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: result.message,
                    data: result.data
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: result.message,
                    error: result.error
                });
            }
        } catch (error) {
            console.error('Update payment status by transaction ID controller error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Bulk update payment statuses
    async bulkUpdatePaymentStatuses(req, res) {
        try {
            const { updates } = req.body;

            // Validation
            if (!updates || !Array.isArray(updates) || updates.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required field: updates (array)'
                });
            }

            // Validate each update object
            for (const update of updates) {
                if (!update.orderId || !update.status) {
                    return res.status(400).json({
                        success: false,
                        message: 'Each update must contain orderId and status'
                    });
                }
            }

            const result = await cashfreeService.bulkUpdatePaymentStatuses(updates);

            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: result.message,
                    data: result.data
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: result.message,
                    error: result.error
                });
            }
        } catch (error) {
            console.error('Bulk update payment statuses controller error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Get transaction by order ID
    async getTransactionByOrderId(req, res) {
        try {
            const { orderId } = req.params;

            if (!orderId) {
                return res.status(400).json({
                    success: false,
                    message: 'Order ID is required'
                });
            }

            const result = await cashfreeService.getTransactionByOrderId(orderId);

            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: result.message,
                    data: result.data
                });
            } else {
                res.status(404).json({
                    success: false,
                    message: result.message,
                    error: result.error
                });
            }
        } catch (error) {
            console.error('Get transaction by order ID controller error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Get transaction by transaction ID
    async getTransactionByTransactionId(req, res) {
        try {
            const { transactionId } = req.params;

            if (!transactionId) {
                return res.status(400).json({
                    success: false,
                    message: 'Transaction ID is required'
                });
            }

            const result = await cashfreeService.getTransactionByTransactionId(transactionId);

            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: result.message,
                    data: result.data
                });
            } else {
                res.status(404).json({
                    success: false,
                    message: result.message,
                    error: result.error
                });
            }
        } catch (error) {
            console.error('Get transaction by transaction ID controller error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Get all transactions with filters
    async getTransactions(req, res) {
        try {
            const { 
                status, 
                userId, 
                customerId, 
                startDate, 
                endDate, 
                page = 1, 
                limit = 10 
            } = req.query;

            // Build filter object
            const filter = {};
            
            if (status) filter.status = status;
            if (userId) filter.userId = userId;
            if (customerId) filter.customerId = customerId;
            
            if (startDate || endDate) {
                filter.createdAt = {};
                if (startDate) filter.createdAt.$gte = new Date(startDate);
                if (endDate) filter.createdAt.$lte = new Date(endDate);
            }

            // Calculate pagination
            const skip = (parseInt(page) - 1) * parseInt(limit);
            
            // Get transactions with pagination
            const transactions = await Transaction.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit));

            // Get total count
            const totalCount = await Transaction.countDocuments(filter);

            res.status(200).json({
                success: true,
                message: 'Transactions retrieved successfully',
                data: {
                    transactions,
                    pagination: {
                        currentPage: parseInt(page),
                        totalPages: Math.ceil(totalCount / parseInt(limit)),
                        totalCount,
                        limit: parseInt(limit)
                    }
                }
            });
        } catch (error) {
            console.error('Get transactions controller error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

}

module.exports = new CashfreeController();