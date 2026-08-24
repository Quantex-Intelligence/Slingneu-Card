const axios = require('axios');
const config = require('../config/config');
const Transaction = require('../models/Transaction');


class CashfreeService {
    constructor() {
        this.baseUrl = config.cashfree.environment === 'PRODUCTION' 
            ? 'https://api.cashfree.com' 
            : 'https://sandbox.cashfree.com';
        this.appId = config.cashfree.appId;
        this.secretKey = config.cashfree.secretKey;
        this.apiVersion = config.cashfree.apiVersion;
    }

    // Generate headers for API requests
    getHeaders() {
        return {
            'x-client-id': this.appId,
            'x-client-secret': this.secretKey,
            'x-api-version': this.apiVersion,
            'Content-Type': 'application/json'
        };
    }

    // Create payment order
    async createOrder(orderData) {
        try {
            const payload = {
                order_id: orderData.order_id,
                order_amount: orderData.order_amount,
                order_currency: orderData.order_currency || 'INR',
                customer_details: {
                    customer_id: orderData.customer_details.customer_id,
                    customer_name: orderData.customer_details.customer_name,
                    customer_email: orderData.customer_details.customer_email,
                    customer_phone: orderData.customer_details.customer_phone
                },
             
                order_note: orderData.order_note || 'Payment for services',
                order_tags: orderData.order_tags || {}
            };

            const response = await axios.post(
                `${this.baseUrl}/pg/orders`,
                payload,
                { headers: this.getHeaders() }
            );

            // Create transaction record
            const transaction = new Transaction({
                transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                orderId: orderData.order_id,
                amount: orderData.order_amount,
                currency: orderData.order_currency || 'INR',
                customerId: orderData.customer_details.customer_id,
                customerName: orderData.customer_details.customer_name,
                customerEmail: orderData.customer_details.customer_email,
                customerPhone: orderData.customer_details.customer_phone,
                status: 'PENDING',
                gateway: 'CASHFREE',
                gatewayOrderId: response.data.order_id,
                description: orderData.order_note || 'Payment for services',
                returnUrl: orderData.order_meta?.return_url,
                notifyUrl: orderData.order_meta?.notify_url,
                paymentUrl: response.data.payment_link,
                tags: orderData.order_tags || {}
            });

            await transaction.save();

            return {
                success: true,
                data: {
                    ...response.data,
                    transactionId: transaction.transactionId
                },
                message: 'Order created successfully'
            };
        } catch (error) {
            console.error('Cashfree create order error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data || error.message,
                message: 'Failed to create order'
            };
        }
    }

    // Get order details
    async getOrder(orderId) {
        try {
            const response = await axios.get(
                `${this.baseUrl}/pg/orders/${orderId}`,
                { headers: this.getHeaders() }
            );

            // Update transaction record if exists
            const transaction = await Transaction.findOne({ orderId });
            if (transaction) {
                transaction.gatewayPaymentId = response.data.payment_id;
                transaction.status = this.mapCashfreeStatus(response.data.order_status);
                if (response.data.payment_details) {
                    transaction.paymentMethod = this.mapPaymentMethod(response.data.payment_details.payment_method);
                }
                await transaction.save();
            }

            return {
                success: true,
                data: response.data,
                message: 'Order details retrieved successfully'
            };
        } catch (error) {
            console.error('Cashfree get order error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data || error.message,
                message: 'Failed to get order details'
            };
        }
    }

    // Verify webhook signature
    verifyWebhookSignature(payload, signature) {
        try {
            const crypto = require('crypto');
            const expectedSignature = crypto
                .createHmac('sha256', config.cashfree.webhookSecret)
                .update(payload)
                .digest('hex');

            return signature === expectedSignature;
        } catch (error) {
            console.error('Webhook signature verification error:', error);
            return false;
        }
    }



    // Get payment methods
    async getPaymentMethods() {
        try {
            const response = await axios.get(
                `${this.baseUrl}/pg/orders/payment-methods`,
                { headers: this.getHeaders() }
            );

            return {
                success: true,
                data: response.data,
                message: 'Payment methods retrieved successfully'
            };
        } catch (error) {
            console.error('Cashfree get payment methods error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data || error.message,
                message: 'Failed to get payment methods'
            };
        }
    }


    // Helper methods for status mapping
    mapCashfreeStatus(cashfreeStatus) {
        const statusMap = {
            'PAID': 'SUCCESS',
            'PENDING': 'PENDING',
            'FAILED': 'FAILED',
            'CANCELLED': 'CANCELLED'
        };
        return statusMap[cashfreeStatus] || 'PENDING';
    }

    mapLinkStatus(cashfreeStatus) {
        const statusMap = {
            'ACTIVE': 'ACTIVE',
            'PAID': 'PAID',
            'EXPIRED': 'EXPIRED',
            'CANCELLED': 'CANCELLED'
        };
        return statusMap[cashfreeStatus] || 'ACTIVE';
    }

    mapRefundStatus(cashfreeStatus) {
        const statusMap = {
            'SUCCESS': 'SUCCESS',
            'PENDING': 'PENDING',
            'FAILED': 'FAILED',
            'CANCELLED': 'CANCELLED'
        };
        return statusMap[cashfreeStatus] || 'PENDING';
    }

    mapSettlementStatus(cashfreeStatus) {
        const statusMap = {
            'SUCCESS': 'PROCESSED',
            'PENDING': 'PENDING',
            'FAILED': 'FAILED',
            'CANCELLED': 'CANCELLED'
        };
        return statusMap[cashfreeStatus] || 'PENDING';
    }

    mapPaymentMethod(paymentMethod) {
        if (!paymentMethod) return { type: 'OTHER' };

        const method = {
            type: paymentMethod.payment_method_type || 'OTHER'
        };

        if (paymentMethod.card_details) {
            method.cardType = paymentMethod.card_details.card_type;
            method.cardNetwork = paymentMethod.card_details.card_network;
            method.cardLast4 = paymentMethod.card_details.card_last4;
        }

        if (paymentMethod.upi_details) {
            method.upiId = paymentMethod.upi_details.upi_id;
        }

        if (paymentMethod.netbanking_details) {
            method.bankName = paymentMethod.netbanking_details.bank_name;
        }

        if (paymentMethod.wallet_details) {
            method.walletName = paymentMethod.wallet_details.wallet_name;
        }

        return method;
    }

    // Update payment status manually
    async updatePaymentStatus(orderId, status, additionalData = {},m2p) {
        try {
            // Find the transaction by orderId
            const transaction = await Transaction.findOne({ orderId });
            
            if (!transaction) {
                return {
                    success: false,
                    error: 'Transaction not found',
                    message: 'No transaction found with the provided order ID'
                };
            }

            // Validate status
            const validStatuses = ['PENDING', 'SUCCESS', 'FAILED', 'CANCELLED', 'REFUNDED', 'PARTIALLY_REFUNDED'];
            if (!validStatuses.includes(status)) {
                return {
                    success: false,
                    error: 'Invalid status',
                    message: 'Invalid payment status provided'
                };
            }

            // Update transaction status
            transaction.status = status;
            transaction.updatedAt = new Date();

            // Add additional data if provided
            if (additionalData.paymentId) {
                transaction.paymentId = additionalData.paymentId;
            }
            if (additionalData.gatewayPaymentId) {
                transaction.gatewayPaymentId = additionalData.gatewayPaymentId;
            }
            if (additionalData.paymentMethod) {
                transaction.paymentMethod = additionalData.paymentMethod;
            }
            if (additionalData.failureReason) {
                transaction.failureReason = additionalData.failureReason;
            }
            if (additionalData.notes) {
                transaction.notes = additionalData.notes;
            }
            if (m2p) {
                transaction.m2p = m2p;
            }

            await transaction.save();

            return {
                success: true,
                data: {
                    transactionId: transaction.transactionId,
                    orderId: transaction.orderId,
                    status: transaction.status,
                    amount: transaction.amount,
                    currency: transaction.currency,
                    updatedAt: transaction.updatedAt
                },
                message: 'Payment status updated successfully'
            };
        } catch (error) {
            console.error('Update payment status error:', error);
            return {
                success: false,
                error: error.message,
                message: 'Failed to update payment status'
            };
        }
    }

    // Update payment status by transaction ID
    async updatePaymentStatusByTransactionId(transactionId, status, additionalData = {}) {
        try {
            // Find the transaction by transactionId
            const transaction = await Transaction.findOne({ transactionId });
            
            if (!transaction) {
                return {
                    success: false,
                    error: 'Transaction not found',
                    message: 'No transaction found with the provided transaction ID'
                };
            }

            // Validate status
            const validStatuses = ['PENDING', 'SUCCESS', 'FAILED', 'CANCELLED', 'REFUNDED', 'PARTIALLY_REFUNDED'];
            if (!validStatuses.includes(status)) {
                return {
                    success: false,
                    error: 'Invalid status',
                    message: 'Invalid payment status provided'
                };
            }

            // Update transaction status
            transaction.status = status;
            transaction.updatedAt = new Date();

            // Add additional data if provided
            if (additionalData.paymentId) {
                transaction.paymentId = additionalData.paymentId;
            }
            if (additionalData.gatewayPaymentId) {
                transaction.gatewayPaymentId = additionalData.gatewayPaymentId;
            }
            if (additionalData.paymentMethod) {
                transaction.paymentMethod = additionalData.paymentMethod;
            }
            if (additionalData.failureReason) {
                transaction.failureReason = additionalData.failureReason;
            }
            if (additionalData.notes) {
                transaction.notes = additionalData.notes;
            }

            await transaction.save();

            return {
                success: true,
                data: {
                    transactionId: transaction.transactionId,
                    orderId: transaction.orderId,
                    status: transaction.status,
                    amount: transaction.amount,
                    currency: transaction.currency,
                    updatedAt: transaction.updatedAt
                },
                message: 'Payment status updated successfully'
            };
        } catch (error) {
            console.error('Update payment status error:', error);
            return {
                success: false,
                error: error.message,
                message: 'Failed to update payment status'
            };
        }
    }

    // Bulk update payment statuses
    async bulkUpdatePaymentStatuses(updates) {
        try {
            const results = [];
            const validStatuses = ['PENDING', 'SUCCESS', 'FAILED', 'CANCELLED', 'REFUNDED', 'PARTIALLY_REFUNDED'];

            for (const update of updates) {
                const { orderId, status, additionalData = {} } = update;

                // Validate status
                if (!validStatuses.includes(status)) {
                    results.push({
                        orderId,
                        success: false,
                        error: 'Invalid status',
                        message: 'Invalid payment status provided'
                    });
                    continue;
                }

                // Find and update transaction
                const transaction = await Transaction.findOne({ orderId });
                
                if (!transaction) {
                    results.push({
                        orderId,
                        success: false,
                        error: 'Transaction not found',
                        message: 'No transaction found with the provided order ID'
                    });
                    continue;
                }

                // Update transaction
                transaction.status = status;
                transaction.updatedAt = new Date();

                // Add additional data if provided
                if (additionalData.paymentId) {
                    transaction.paymentId = additionalData.paymentId;
                }
                if (additionalData.gatewayPaymentId) {
                    transaction.gatewayPaymentId = additionalData.gatewayPaymentId;
                }
                if (additionalData.paymentMethod) {
                    transaction.paymentMethod = additionalData.paymentMethod;
                }
                if (additionalData.failureReason) {
                    transaction.failureReason = additionalData.failureReason;
                }
                if (additionalData.notes) {
                    transaction.notes = additionalData.notes;
                }

                await transaction.save();

                results.push({
                    orderId,
                    success: true,
                    data: {
                        transactionId: transaction.transactionId,
                        orderId: transaction.orderId,
                        status: transaction.status,
                        amount: transaction.amount,
                        currency: transaction.currency,
                        updatedAt: transaction.updatedAt
                    },
                    message: 'Payment status updated successfully'
                });
            }

            return {
                success: true,
                data: results,
                message: 'Bulk update completed'
            };
        } catch (error) {
            console.error('Bulk update payment status error:', error);
            return {
                success: false,
                error: error.message,
                message: 'Failed to perform bulk update'
            };
        }
    }

    // Get transaction by order ID
    async getTransactionByOrderId(orderId) {
        try {
            const transaction = await Transaction.findOne({ orderId });
            
            if (!transaction) {
                return {
                    success: false,
                    error: 'Transaction not found',
                    message: 'No transaction found with the provided order ID'
                };
            }

            return {
                success: true,
                data: transaction,
                message: 'Transaction retrieved successfully'
            };
        } catch (error) {
            console.error('Get transaction error:', error);
            return {
                success: false,
                error: error.message,
                message: 'Failed to get transaction'
            };
        }
    }

    // Get transaction by transaction ID
    async getTransactionByTransactionId(transactionId) {
        try {
            const transaction = await Transaction.findOne({ transactionId });
            
            if (!transaction) {
                return {
                    success: false,
                    error: 'Transaction not found',
                    message: 'No transaction found with the provided transaction ID'
                };
            }

            return {
                success: true,
                data: transaction,
                message: 'Transaction retrieved successfully'
            };
        } catch (error) {
            console.error('Get transaction error:', error);
            return {
                success: false,
                error: error.message,
                message: 'Failed to get transaction'
            };
        }
    }

}

module.exports = new CashfreeService();