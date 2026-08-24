const rechargeService = require("../services/rechargeService");
const RechargeTransaction = require("../models/RechargeTransaction");
const { default: mongoose } = require("mongoose");

class RechargeController {
  // Create recharge
  async createRecharge(req, res) {
    try {
      const {
        circlecode,
        operatorcode,
        number,
        amount,
        orderid,
        format = "json",
        value1,
        value2,
        callbackUrl,
      } = req.body;

      // Validate required fields
      if (!circlecode || !operatorcode || !number || !amount || !orderid) {
        return res.status(400).json({
          success: false,
          message:
            "Missing required parameters: circlecode, operatorcode, number, amount, orderid",
        });
      }

      // Validate amount
      if (amount <= 0) {
        return res.status(400).json({
          success: false,
          message: "Amount must be greater than 0",
        });
      }

      // Add user ID if authenticated
      const rechargeData = {
        circlecode,
        operatorcode,
        number,
        amount,
        orderid,
        format,
        value1,
        value2,
      };

      const result = await rechargeService.createRecharge(rechargeData);
      if (result.success) {
        // Update callback URL if provided
        if (callbackUrl && result.data.transactionId) {
          await RechargeTransaction.findOneAndUpdate(
            { transactionId: result.data.transactionId },
            { callbackUrl }
          );
        }

        // Add user ID if authenticated
        if (req.user) {
          await RechargeTransaction.findOneAndUpdate(
            { transactionId: result.data.transactionId },
            { userId: req.user.userId }
          );
        }

        return res.status(201).json({
          success: true,
          message: result.message,
          data: result.data,
        });
      } else {
        return res.status(400).json({
          success: false,
          message: result.message,
          error: result.error,
        });
      }
    } catch (error) {
      console.error("Create recharge error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  // Get balance
  async getBalance(req, res) {
    try {
      const { format = "json" } = req.query;

      const result = await rechargeService.getBalance(format);

      if (result.success) {
        return res.status(200).json({
          success: true,
          message: result.message,
          data: result.data,
        });
      } else {
        return res.status(400).json({
          success: false,
          message: result.message,
          error: result.error,
        });
      }
    } catch (error) {
      console.error("Get balance error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  // Get recharge status
  async getRechargeStatus(req, res) {
    try {
      const { orderid } = req.params;
      const { format = "json" } = req.query;

      if (!orderid) {
        return res.status(400).json({
          success: false,
          message: "Order ID is required",
        });
      }

      const result = await rechargeService.getRechargeStatus(orderid, format);

      if (result.success) {
        return res.status(200).json({
          success: true,
          message: result.message,
          data: result.data,
        });
      } else {
        return res.status(400).json({
          success: false,
          message: result.message,
          error: result.error,
        });
      }
    } catch (error) {
      console.error("Get recharge status error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  // Get operators list
  async getOperators(req, res) {
    try {
      const result = await rechargeService.getOperators();

      if (result.success) {
        return res.status(200).json({
          success: true,
          message: result.message,
          data: result.data,
        });
      } else {
        return res.status(400).json({
          success: false,
          message: result.message,
          error: result.error,
        });
      }
    } catch (error) {
      console.error("Get operators error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  // Get circle codes
  async getCircleCodes(req, res) {
    try {
      const result = await rechargeService.getCircleCodes();

      if (result.success) {
        return res.status(200).json({
          success: true,
          message: result.message,
          data: result.data,
        });
      } else {
        return res.status(400).json({
          success: false,
          message: result.message,
          error: result.error,
        });
      }
    } catch (error) {
      console.error("Get circle codes error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  // Get transaction by order ID
  async getTransactionByOrderId(req, res) {
    try {
      const { orderid } = req.params;

      if (!orderid) {
        return res.status(400).json({
          success: false,
          message: "Order ID is required",
        });
      }

      const result = await rechargeService.getTransactionByOrderId(orderid);

      if (result.success) {
        if (result.data) {
          return res.status(200).json({
            success: true,
            message: result.message,
            data: result.data.getFormattedResponse(),
          });
        } else {
          return res.status(404).json({
            success: false,
            message: "Transaction not found",
          });
        }
      } else {
        return res.status(400).json({
          success: false,
          message: result.message,
          error: result.error,
        });
      }
    } catch (error) {
      console.error("Get transaction error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
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
          message: "Transaction ID is required",
        });
      }

      const result = await rechargeService.getTransactionByTransactionId(
        transactionId
      );

      if (result.success) {
        if (result.data) {
          return res.status(200).json({
            success: true,
            message: result.message,
            data: result.data.getFormattedResponse(),
          });
        } else {
          return res.status(404).json({
            success: false,
            message: "Transaction not found",
          });
        }
      } else {
        return res.status(400).json({
          success: false,
          message: result.message,
          error: result.error,
        });
      }
    } catch (error) {
      console.error("Get transaction error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  // Get all transactions with pagination
  async getAllTransactions(req, res) {
    try {
      const { page = 1, limit = 10, status } = req.query;

      // Validate pagination parameters
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);

      if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid pagination parameters. Page must be >= 1, limit must be between 1 and 100",
        });
      }

      const result = await rechargeService.getAllTransactions(
        pageNum,
        limitNum,
        status
      );

      if (result.success) {
        // Format transactions
        const formattedTransactions = result.data.transactions.map(
          (transaction) => transaction.getFormattedResponse()
        );

        return res.status(200).json({
          success: true,
          message: result.message,
          data: {
            transactions: formattedTransactions,
            pagination: result.data.pagination,
          },
        });
      } else {
        return res.status(400).json({
          success: false,
          message: result.message,
          error: result.error,
        });
      }
    } catch (error) {
      console.error("Get all transactions error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  // Get user transactions
  async getUserTransactions(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      const filter = { userId: req.user.userId };
      const transactions = await RechargeTransaction.find(filter).sort({
        createdAt: -1,
      });

      const total = await RechargeTransaction.countDocuments(filter);

      const formattedTransactions = transactions.map((transaction) =>
        transaction.getFormattedResponse()
      );

      return res.status(200).json({
        success: true,
        message: "User transactions retrieved successfully",
        data: {
          transactions: formattedTransactions,
          pagination: {
            total,
          },
        },
      });
    } catch (error) {
      console.error("Get user transactions error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  // Get statistics
  async getStatistics(req, res) {
    try {
      const stats = await RechargeTransaction.getStatistics();

      return res.status(200).json({
        success: true,
        message: "Statistics retrieved successfully",
        data: stats,
      });
    } catch (error) {
      console.error("Get statistics error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  // Callback handler for status updates
  async handleCallback(req, res) {
    try {
      const { txid, status, opid } = req.query;

      if (!txid || !status) {
        return res.status(400).json({
          success: false,
          message: "Missing required parameters: txid, status",
        });
      }

      // Find and update transaction
      const transaction = await RechargeTransaction.findOne({ orderId: txid });

      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: "Transaction not found",
        });
      }

      // Update transaction status
      await transaction.updateStatus(status, opid);

      // If callback URL is configured, you can make additional calls here
      if (transaction.callbackUrl) {
        // Make callback to configured URL
        // This is optional and depends on your requirements
      }

      return res.status(200).json({
        success: true,
        message: "Callback processed successfully",
        data: {
          transactionId: transaction.transactionId,
          orderId: transaction.orderId,
          status: transaction.status,
          operatorId: transaction.operatorId,
        },
      });
    } catch (error) {
      console.error("Callback handler error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }
}

module.exports = new RechargeController();
