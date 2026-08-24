const config = require('../config/config');

class SMSService {
  constructor() {
    this.baseURL = config.msg91.baseUrl;
    this.authKey = config.msg91.authKey;
    this.sender = config.msg91.sender;
    this.route = config.msg91.route;
  }

  // Send SMS using MSG91
  async sendSMS(phone, templateId, variables = {}) {
    try {
      // Clean phone number (remove +91 or 91 prefix if present)
      const cleanPhone = phone.replace(/^\+91/, "").replace(/^91/, "");

      const response = await fetch(this.baseURL, {
        method: "POST",
        headers: {
          "accept": "application/json",
          "authkey": this.authKey,
          "content-type": "application/json"
        },
        body: JSON.stringify({
          route: this.route,
          sender: this.sender,
          unicode: 0,
          mobiles: `91${cleanPhone}`,
          templateId: templateId,
          variables: variables,
          encryption: 0,
          short_url: 0,
          flash: false,
          encrypt: false
        })
      });

      const result = await response.json();

      if (result.type === 'success') {
        console.log(`SMS sent successfully to ${phone} using template ${templateId}`);
        return { success: true, messageId: result.message_id };
      } else {
        console.error(`SMS failed for ${phone}:`, result.message);
        return { success: false, error: result.message };
      }
    } catch (error) {
      console.error(`Error sending SMS to ${phone}:`, error);
      return { success: false, error: error.message };
    }
  }

  // Send card closure reminder
  async sendCardClosureReminder(phone, customerName, balance, expiryDate) {
    const templateId = "1207175645620547802"; // Card_Closure_Reminder_Templete
    return await this.sendSMS(phone, templateId, {
      var: customerName,
      var2: balance,
      var3: expiryDate
    });
  }

  // Send card unblocked notification
  async sendCardUnblocked(phone, cardEnding) {
    const templateId = "1207175649631108322"; // customer_cardstatus_update_unb
    return await this.sendSMS(phone, templateId, {
      var: cardEnding
    });
  }

  // Send security credentials failed notification
  async sendSecurityCredentialsFailed(phone, amount, cardEnding) {
    const templateId = "1207175640625342709"; // security_credentials_failed
    return await this.sendSMS(phone, templateId, {
      var: amount,
      var2: cardEnding
    });
  }

  // Send PIN attempt exceeded notification
  async sendPinAttemptExceeded(phone, cardEnding) {
    const templateId = "1207175640835012463"; // pin_attempt_exceeded
    return await this.sendSMS(phone, templateId, {
      var: cardEnding
    });
  }

  // Send POS transaction notification
  async sendPOSTransaction(phone, amount, merchantName, balance) {
    const templateId = "1207175640002678858"; // pos_sender
    return await this.sendSMS(phone, templateId, {
      var: amount,
      var2: merchantName,
      var3: balance
    });
  }

  // Send card activation notification
  async sendCardActivation(phone, customerName, cardEnding) {
    const templateId = "1207175640286853908"; // customer_registered/Card_Activ
    return await this.sendSMS(phone, templateId, {
      var: customerName,
      var2: cardEnding
    });
  }

  // Send transaction reversal notification
  async sendTransactionReversal(phone, amount, cardEnding, balance) {
    const templateId = "1207175640871398435"; // pos_sender_reversal
    return await this.sendSMS(phone, templateId, {
      var: amount,
      var2: cardEnding,
      var3: balance
    });
  }

  // Send card update notification
  async sendCardUpdate(phone, cardEnding) {
    const templateId = "1207175640898321290"; // 1207175640898321290
    return await this.sendSMS(phone, templateId, {
      var: cardEnding
    });
  }

  // Send money received notification
  async sendMoneyReceived(phone, amount, balance) {
    const templateId = "1207176939178335430"; // m2c_receiver_registered
    return await this.sendSMS(phone, templateId, {
      var: amount,
      var3: balance
    });
  }

  // Send invalid PIN notification
  async sendInvalidPin(phone, amount, cardEnding) {
    const templateId = "1207175620327710861"; // invalid_pin
    return await this.sendSMS(phone, templateId, {
      var: amount,
      var2: cardEnding
    });
  }

  // Send transaction OTP
  async sendTransactionOTP(phone, otp, amount) {
    console.log("phone, otp, amount", phone, otp, amount)
    const templateId = "1207175611122558480"; // transaction/Spend_otp
    return await this.sendSMS(phone, templateId, {
      var3: otp,
      var1: amount
    });
  }

  // Send registration/KYC OTP
  async sendRegistrationOTP(phone, otp) {
    const templateId = "68ad564ed9f9ba7fe94e8175"; // Registeration_otp_/_KYC_otp
    return await this.sendSMS(phone, templateId, {
      var: otp
    });
  }

  // Send card closure confirmation
  async sendCardClosureConfirmation(phone, customerName) {
    const templateId = "68b52c97d673ed749d035f23"; // Card_Closure_confirmation_Temp
    return await this.sendSMS(phone, templateId, {
      var: customerName
    });
  }

  // Generic method to send SMS based on event type
  async sendEventSMS(phone, eventType, data = {}) {
    console.log("phone, eventType, data", phone, eventType, data)
    try {
      switch (eventType) {
        case 'CARD_CLOSURE_REMINDER':
          return await this.sendCardClosureReminder(
            phone,
            data.customerName,
            data.balance,
            data.expiryDate
          );

        case 'CARD_UNBLOCKED':
          return await this.sendCardUnblocked(phone, data.cardEnding);

        case 'SECURITY_CREDENTIALS_FAILED':
          return await this.sendSecurityCredentialsFailed(
            phone,
            data.amount,
            data.cardEnding
          );

        case 'PIN_ATTEMPT_EXCEEDED':
          return await this.sendPinAttemptExceeded(phone, data.cardEnding);

        case 'POS_TRANSACTION':
          return await this.sendPOSTransaction(
            phone,
            data.amount,
            data.merchantName,
            data.balance
          );

        case 'CARD_ACTIVATION':
          return await this.sendCardActivation(
            phone,
            data.customerName,
            data.cardEnding
          );

        case 'TRANSACTION_REVERSAL':
          return await this.sendTransactionReversal(
            phone,
            data.amount,
            data.cardEnding,
            data.balance
          );

        case 'CARD_UPDATE':
          return await this.sendCardUpdate(phone, data.cardEnding);

        case 'MONEY_RECEIVED':
          return await this.sendMoneyReceived(phone, data.amount, data.balance);

        case 'INVALID_PIN':
          return await this.sendInvalidPin(phone, data.amount, data.cardEnding);

        case 'TRANSACTION_OTP':
          return await this.sendTransactionOTP(phone, data.otp, data.amount);

        case 'REGISTRATION_OTP':
          return await this.sendRegistrationOTP(phone, data.otp);

        case 'CARD_CLOSURE_CONFIRMATION':
          return await this.sendCardClosureConfirmation(phone, data.customerName);

        default:
          console.log(`Unknown event type: ${eventType}`);
          return { success: false, error: 'Unknown event type' };
      }
    } catch (error) {
      console.error(`Error sending event SMS for ${eventType}:`, error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new SMSService();
