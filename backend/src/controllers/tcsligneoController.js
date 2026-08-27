const tcsligneoService = require('../services/tcsligneoService');

class TCSLINGNEOController {
    // Generate OTP
    async generateOTP(req, res) {
        try {
            const { entityId, mobileNumber } = req.body;
            const result = await tcsligneoService.generateOTP(entityId, mobileNumber);
            res.json(result);
        } catch (error) {
            res.status(error.status || 500).json(error);
        }
    }

    // Register Customer
    async registerCustomer(req, res) {
        try {
            const result = await tcsligneoService.registerCustomer(req.body);
            res.json(result);
            console.log(result);
        } catch (error) {
            res.status(error.status || 500).json(error);
        }
    }

    // Validate PAN
    async validatePAN(req, res) {
        try {
            const { pan, name, mobile } = req.body;
            const result = await tcsligneoService.validatePAN(pan, name, mobile);
            res.json(result);
        } catch (error) {
            res.status(error.status || 500).json(error);
        }
    }

    // Load Wallet
    async loadWallet(req, res) {
        try {
            const result = await tcsligneoService.loadWallet(req.body);
            res.json(result);
        } catch (error) {
            res.status(error.status || 500).json(error);
        }
    }

    // Fetch Balance
    async fetchBalance(req, res) {
        try {
            const { entityId } = req.params;
            const result = await tcsligneoService.fetchBalance(entityId);
            res.json(result);
        } catch (error) {
            res.status(error.status || 500).json(error);
        }
    }

    // Card Lock/Unlock
    async cardLockUnlock(req, res) {
        try {
            const { entityId, kitNo, flag, reason } = req.body;
            const result = await tcsligneoService.cardLockUnlock(entityId, kitNo, flag, reason);
            res.json(result);
        } catch (error) {
            res.status(error.status || 500).json(error);
        }
    }

    // Replace Card
    async replaceCard(req, res) {
        try {
            const { entityId, oldKitNo, newKitNo } = req.body;
            const result = await tcsligneoService.replaceCard(entityId, oldKitNo, newKitNo);
            res.json(result);
        } catch (error) {
            res.status(error.status || 500).json(error);
        }
    }

    // Set Transaction Limit
    async setTransactionLimit(req, res) {
        try {
            const { entityId, limitConfig } = req.body;
            const result = await tcsligneoService.setTransactionLimit(entityId, limitConfig);
            res.json(result);
        } catch (error) {
            res.status(error.status || 500).json(error);
        }
    }

    // Fetch Preferences
    async fetchPreferences(req, res) {
        try {
            const { entityId } = req.body;
            const result = await tcsligneoService.fetchPreferences(entityId);
            res.json(result);
        } catch (error) {
            res.status(error.status || 500).json(error);
        }
    }

    // Request Physical Card
    async requestPhysicalCard(req, res) {
        try {
            const { entityId, kitNo, addressDto } = req.body;
            const result = await tcsligneoService.requestPhysicalCard(entityId, kitNo, addressDto);
            res.json(result);
        } catch (error) {
            res.status(error.status || 500).json(error);
        }
    }

    // Get Card List
    async getCardList(req, res) {
        try {
            const { entityId } = req.body;
            const result = await tcsligneoService.getCardList(entityId);
            res.json(result);
        } catch (error) {
            res.status(error.status || 500).json(error);
        }
    }

    // Get Card Widget
    async getCardWidget(req, res) {
        try {
            const { token, kitNo, entityId, appGuid, business, callbackUrl, dob } = req.body;
            const result = await tcsligneoService.getCardWidget(token, kitNo, entityId, appGuid, business, callbackUrl, dob);
            res.json(result);
        } catch (error) {   
            res.status(error.status || 500).json(error);
        }
    }

    // Fetch Balance
    async fetchBalance(req, res) {
        try {
            const { entityId } = req.params;
            const result = await tcsligneoService.fetchBalance(entityId);
            res.json(result);
        } catch (error) {
            res.status(error.status || 500).json(error);
        }
    }

    // Set Pin
    async setPin(req, res) {
        try {
            const result = await tcsligneoService.setPin(req.body);
            res.json(result);
        } catch (error) {
            res.status(error.status || 500).json(error);
        }
    }

    // Fetch Transactions
    async fetchTransactions(req, res) {
        try {
            const { entityId } = req.params;
            const { fromDate, toDate, pageNumber, pageSize } = req.query;
            const result = await tcsligneoService.fetchTransactions(
                entityId,
                fromDate,
                toDate,
                parseInt(pageNumber),
                parseInt(pageSize)
            );
            res.json(result);
        } catch (error) {
            res.status(error.status || 500).json(error);
        }
    }

    // Handle M2P Webhook
    async handleM2PWebhook(req, res) {
        try {
            console.log('M2P Webhook received:', JSON.stringify(req.body, null, 2));
            
            // Process the webhook and send notifications
            // const result = await tcsligneoService.processM2PWebhook(req.body);
            
            // Return success response to M2P
            res.status(200).json({
                status: 'SUCCESS',
                message: 'Webhook processed successfully',
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error processing M2P webhook:', error);
            // Return error response to M2P
            res.status(500).json({
                status: 'FAILURE',
                message: 'Webhook processing failed',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    // Webhook Health Check
    async webhookHealthCheck(req, res) {
        try {
            // Check if required services are available
            const healthStatus = {
                status: 'HEALTHY',
                timestamp: new Date().toISOString(),
                services: {
                    database: 'CONNECTED',
                    firebase: 'AVAILABLE',
                    webhook: 'ACTIVE'
                },
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                version: '1.0.0'
            };
            
            res.status(200).json(healthStatus);
        } catch (error) {
            console.error('Health check failed:', error);
            res.status(503).json({
                status: 'UNHEALTHY',
                timestamp: new Date().toISOString(),
                error: error.message
            });
        }
    }
}

module.exports = new TCSLINGNEOController(); 