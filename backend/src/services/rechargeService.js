const axios = require('axios');
const config = require('../config/config');
const RechargeTransaction = require('../models/RechargeTransaction');
const Operator = require('../models/Operator');
const CircleCode = require('../models/CircleCode');

class RechargeService {
    constructor() {
        this.baseUrl = 'https://business.a1topup.com';
        this.username = config.a1topup?.username;
        this.password = config.a1topup?.password;
    }

    // Generate headers for API requests
    getHeaders() {
        return {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
    }

    // Create recharge order
    async createRecharge(rechargeData) {
        try {
            const {
                circlecode,
                operatorcode,
                number,
                amount,
                orderid,
                format = 'json',
                value1,
                value2
            } = rechargeData;

            // Validate required parameters
            if (!circlecode || !operatorcode || !number || !amount || !orderid) {
                throw new Error('Missing required parameters: circlecode, operatorcode, number, amount, orderid');
            }

            // Build query parameters
            const params = new URLSearchParams({
                username: this.username,
                pwd: this.password,
                circlecode,
                operatorcode,
                number,
                amount,
                orderid,
                format
            });

            // Add optional parameters if provided
            if (value1) params.append('value1', value1);
            if (value2) params.append('value2', value2);

            const response = await axios.get(
                `${this.baseUrl}/recharge/api?${params.toString()}`,
                { headers: this.getHeaders() }
            );
console.log("response",response)
            let parsedResponse;
            if (format === 'json') {
                parsedResponse = response.data;
            } else if (format === 'csv') {
                // Parse CSV response
                const csvData = response.data;
                const parts = csvData.split(',');
                parsedResponse = {
                    txid: parts[0],
                    status: parts[1],
                    opid: parts[2],
                    number: parts[3],
                    amount: parts[4],
                    orderid: parts[5]
                };
            } else if (format === 'xml') {
                // For XML, we'll return the raw response for now
                parsedResponse = { raw: response.data };
            }

            // Helper function to normalize status
            const normalizeStatus = (status) => {
                if (!status) return 'PENDING';
                const upperStatus = status.toUpperCase();
                if (['PENDING', 'SUCCESS', 'FAILED', 'PROCESSING'].includes(upperStatus)) {
                    return upperStatus;
                }
                return 'PENDING';
            };

            // Create recharge transaction record
            const rechargeTransaction = new RechargeTransaction({
                transactionId: parsedResponse.txid || `RECHARGE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                orderId: orderid,
                circleCode: circlecode,
                operatorCode: operatorcode,
                number,
                amount,
                status: normalizeStatus(parsedResponse.status),
                operatorId: parsedResponse.opid,
                format,
                value1,
                value2,
                response: parsedResponse
            });

            await rechargeTransaction.save();

            return {
                success: true,
                data: {
                    ...parsedResponse,
                    transactionId: rechargeTransaction.transactionId
                },
                message: 'Recharge initiated successfully'
            };
        } catch (error) {
            console.error('Recharge service error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data || error.message,
                message: 'Failed to initiate recharge'
            };
        }
    }

    // Get balance
    async getBalance(format = 'json') {
        try {
            const params = new URLSearchParams({
                username: this.username,
                pwd: this.password,
                format
            });

            const response = await axios.get(
                `${this.baseUrl}/recharge/balance?${params.toString()}`,
                { headers: this.getHeaders() }
            );

            return {
                success: true,
                data: response.data,
                message: 'Balance retrieved successfully'
            };
        } catch (error) {
            console.error('Balance check error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data || error.message,
                message: 'Failed to get balance'
            };
        }
    }

    // Get recharge status
    async getRechargeStatus(orderId, format = 'json') {
        try {
            const params = new URLSearchParams({
                username: this.username,
                pwd: this.password,
                orderid: orderId,
                format
            });

            const response = await axios.get(
                `${this.baseUrl}/recharge/status?${params.toString()}`,
                { headers: this.getHeaders() }
            );

            // Helper function to normalize status
            const normalizeStatus = (status) => {
                if (!status) return 'PENDING';
                const upperStatus = status.toUpperCase();
                if (['PENDING', 'SUCCESS', 'FAILED', 'PROCESSING'].includes(upperStatus)) {
                    return upperStatus;
                }
                return 'PENDING';
            };

            // Update transaction record if exists
            const transaction = await RechargeTransaction.findOne({ orderId });
            if (transaction) {
                transaction.status = normalizeStatus(response.data.status) || transaction.status;
                transaction.operatorId = response.data.opid || transaction.operatorId;
                transaction.lastChecked = new Date();
                await transaction.save();
            }

            return {
                success: true,
                data: response.data,
                message: 'Status retrieved successfully'
            };
        } catch (error) {
            console.error('Status check error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data || error.message,
                message: 'Failed to get status'
            };
        }
    }

    // Get operators list
    async getOperators() {
        try {
            const operators = await Operator.find({ isActive: true }).sort({ category: 1, name: 1 });
            
            // Group operators by category
            const groupedOperators = {};
            operators.forEach(operator => {
                if (!groupedOperators[operator.category]) {
                    groupedOperators[operator.category] = {};
                }
                groupedOperators[operator.category][operator.code] = operator.name;
            });

            return {
                success: true,
                data: groupedOperators,
                message: 'Operators retrieved successfully'
            };
        } catch (error) {
            console.error('Get operators error:', error);
            return {
                success: false,
                error: error.message,
                message: 'Failed to get operators'
            };
        }
    }

    // Get circle codes
    async getCircleCodes() {
        try {
            const circleCodes = await CircleCode.find({ isActive: true }).sort({ state: 1, name: 1 });
            
            // Convert to the expected format
            const circleCodesMap = {};
            circleCodes.forEach(circleCode => {
                circleCodesMap[circleCode.code] = circleCode.name;
            });

            return {
                success: true,
                data: circleCodesMap,
                message: 'Circle codes retrieved successfully'
            };
        } catch (error) {
            console.error('Get circle codes error:', error);
            return {
                success: false,
                error: error.message,
                message: 'Failed to get circle codes'
            };
        }
    }

    // Get transaction by order ID
    async getTransactionByOrderId(orderId) {
        try {
            const transaction = await RechargeTransaction.findOne({ orderId });
            return {
                success: true,
                data: transaction,
                message: transaction ? 'Transaction found' : 'Transaction not found'
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
            const transaction = await RechargeTransaction.findOne({ transactionId });
            return {
                success: true,
                data: transaction,
                message: transaction ? 'Transaction found' : 'Transaction not found'
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

    // Get all transactions with pagination
    async getAllTransactions(page = 1, limit = 10, status = null) {
        try {
            const skip = (page - 1) * limit;
            const filter = status ? { status } : {};
            
            const transactions = await RechargeTransaction.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);

            const total = await RechargeTransaction.countDocuments(filter);

            return {
                success: true,
                data: {
                    transactions,
                    pagination: {
                        page,
                        limit,
                        total,
                        pages: Math.ceil(total / limit)
                    }
                },
                message: 'Transactions retrieved successfully'
            };
        } catch (error) {
            console.error('Get all transactions error:', error);
            return {
                success: false,
                error: error.message,
                message: 'Failed to get transactions'
            };
        }
    }
}

module.exports = new RechargeService(); 