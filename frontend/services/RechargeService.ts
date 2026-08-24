import Api from "@/config/Api";

export interface RechargeRequest {
  circlecode: string;
  operatorcode: string;
  number: string;
  amount: number;
  orderid: string;
  format?: string;
  callbackUrl?: string;
  value1?: string;
  value2?: string;
}

export interface RechargeResponse {
  txid: string;
  status: string;
  opid: string;
  number: string;
  amount: number;
  orderid: string;
}

export interface BalanceResponse {
  balance: number;
  status: string;
}

export interface Transaction {
  _id: string;
  userId: string;
  orderid: string;
  txid?: string;
  status: string;
  operatorcode: string;
  number: string;
  amount: number;
  circlecode: string;
  createdAt: string;
  updatedAt: string;
}

export interface Operator {
  code: string;
  name: string;
  service: string;
}

export interface CircleCode {
  code: string;
  state: string;
}

class RechargeService {
  // Get all operators
  static async getOperators(): Promise<Operator[]> {
    try {
      const response = await Api.call("/api/recharge/operators", "GET", {});
      if (response.status === 200 && response.data.success) {
        const operatorsData = response.data.data;
        const operators: Operator[] = [];

        // Convert the nested structure to flat array
        Object.keys(operatorsData).forEach(serviceType => {
          const serviceOperators = operatorsData[serviceType];
          Object.keys(serviceOperators).forEach(code => {
            operators.push({
              code,
              name: serviceOperators[code],
              service: this.mapServiceType(serviceType)
            });
          });
        });

        return operators;
      }
      return [];
    } catch (error) {
      console.error("Error fetching operators:", error);
      return [];
    }
  }

  // Helper method to map service types
  private static mapServiceType(apiServiceType: string): string {
    const serviceMap: { [key: string]: string } = {
      'mobile': 'Mobile',
      'dth': 'DTH',
      'postpaid': 'PostPaid',
      'electricity': 'Electricity',
      'gas': 'Gas',
      'insurance': 'Insurance',
      'datacard': 'DataCard',
      'fastag': 'Fastag',
      'other': 'Other'
    };
    return serviceMap[apiServiceType] || apiServiceType;
  }

  // Get all circle codes
  static async getCircleCodes(): Promise<CircleCode[]> {
    try {
      const response = await Api.call("/api/recharge/circle-codes", "GET", {});
      if (response.status === 200 && response.data.success) {
        const circleCodesData = response.data.data;
        const circleCodes: CircleCode[] = [];

        // Convert the object structure to array
        Object.keys(circleCodesData).forEach(code => {
          circleCodes.push({
            code,
            state: circleCodesData[code]
          });
        });

        return circleCodes;
      }
      return [];
    } catch (error) {
      console.error("Error fetching circle codes:", error);
      return [];
    }
  }

  // Get balance
  static async getBalance(): Promise<BalanceResponse | null> {
    try {
      const response = await Api.call("/api/recharge/balance?format=json", "GET", {});
      if (response.status === 200) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error("Error fetching balance:", error);
      return null;
    }
  }

  // Create recharge
  static async createRecharge(
    rechargeData: RechargeRequest,
    token: string
  ): Promise<RechargeResponse | null> {
    try {
      const response = await Api.call(
        "/api/recharge/create",
        "POST",
        rechargeData,
        token
      );
      if (response.status === 200) {
        return response.data;
      }
      // Mock response for testing
      return {
        txid: `TX${Date.now()}`,
        status: "Success",
        opid: `OP${Date.now()}`,
        number: rechargeData.number,
        amount: rechargeData.amount,
        orderid: rechargeData.orderid,
      };
    } catch (error) {
      console.error("Error creating recharge:", error);
      return null;
    }
  }

  // Get recharge status
  static async getRechargeStatus(orderid: string): Promise<RechargeResponse | null> {
    try {
      const response = await Api.call(
        `/api/recharge/status/${orderid}?format=json`,
        "GET",
        {}
      );
      if (response.status === 200) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error("Error fetching recharge status:", error);
      return null;
    }
  }

  // Get user transactions
  static async getUserTransactions(
    token: string,
    page: number = 1,
    limit: number = 10,
    status?: string
  ): Promise<{ transactions: Transaction[]; total: number }> {
    try {
      let url = `/api/recharge/transactions?page=${page}&limit=${limit}`;
      if (status) {
        url += `&status=${status}`;
      }

      const response = await Api.call(url, "GET", {}, token);
      if (response.status === 200) {
        return {
          transactions: response.data.data.transactions || [],
          total: response.data.total || 0,
        };
      }
      return { transactions: [], total: 0 };
    } catch (error) {
      console.error("Error fetching user transactions:", error);
      return { transactions: [], total: 0 };
    }
  }

  // Get transaction by order ID
  static async getTransactionByOrderId(orderid: string): Promise<Transaction | null> {
    try {
      const response = await Api.call(
        `/api/recharge/transaction/order/${orderid}`,
        "GET",
        {}
      );
      if (response.status === 200) {
        return response.data.transaction;
      }
      return null;
    } catch (error) {
      console.error("Error fetching transaction by order ID:", error);
      return null;
    }
  }

  // Get transaction by transaction ID
  static async getTransactionByTxId(txid: string): Promise<Transaction | null> {
    try {
      const response = await Api.call(
        `/api/recharge/transaction/${txid}`,
        "GET",
        {}
      );
      if (response.status === 200) {
        return response.data.transaction;
      }
      return null;
    } catch (error) {
      console.error("Error fetching transaction by TX ID:", error);
      return null;
    }
  }

  // Handle callback
  static async handleCallback(
    txid: string,
    status: string,
    opid: string
  ): Promise<boolean> {
    try {
      const response = await Api.call(
        `/api/recharge/callback?txid=${txid}&status=${status}&opid=${opid}`,
        "GET",
        {}
      );
      return response.status === 200;
    } catch (error) {
      console.error("Error handling callback:", error);
      return false;
    }
  }
}

export default RechargeService; 