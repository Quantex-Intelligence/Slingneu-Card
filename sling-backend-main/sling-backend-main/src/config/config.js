require("dotenv").config();

module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  mongodb: {
    uri: process.env.MONGODB_URI || "mongodb://localhost:27017/sling-backend",
  },
  jwt: {
    secret: process.env.JWT_SECRET || "your-secret-key",
    expiresIn: "7d",
  },
  otpless: {
    clientId: process.env.OTPLESS_CLIENT_ID,
    clientSecret: process.env.OTPLESS_CLIENT_SECRET,
  },
  msg91: {
    authKey: process.env.MSG91_AUTH_KEY || "329379A4BqO3LCRX064be4f2eP1",
    sender: process.env.MSG91_SENDER || "PAYVOY",
    route: process.env.MSG91_ROUTE || 4,
    templateId: process.env.MSG91_TEMPLATE_ID || "68ad564ed9f9ba7fe94e8175",
    baseUrl: "https://control.msg91.com/api/v5/sms/sendSms",
    otpExpiryMinutes: process.env.OTP_EXPIRY_MINUTES || 5
  },
  slingneo: {
    baseUrl: process.env.TCSLINGNEO_BASE_URL,
    tenant: process.env.TCSLINGNEO_TENANT,
    partnerId: process.env.TCSLINGNEO_PARTNER_ID,
    partnerToken: process.env.TCSLINGNEO_PARTNER_TOKEN,
    encryption: {
      enabled: process.env.ENCRYPTION_ENABLED === 'true' || true,
      privateKeyPath: process.env.PRIVATE_KEY_PATH || './keys/slingneo.p8',
      m2pPublicKeyPath: process.env.M2P_PUBLIC_KEY_PATH || './keys/m2psolutions_pub.cer',
    }
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
  cashfree: {
    appId: process.env.CASHFREE_APP_ID,
    secretKey: process.env.CASHFREE_SECRET_KEY,
    apiVersion: process.env.CASHFREE_API_VERSION || "2022-09-01",
    environment: process.env.CASHFREE_ENVIRONMENT || "TEST",
    webhookSecret: process.env.CASHFREE_WEBHOOK_SECRET,
  },
  a1topup: {
    username: process.env.A1TOPUP_USERNAME,
    password: process.env.A1TOPUP_PASSWORD,
  },
  firebase: {
    serviceAccount: {
      type: "service_account",
      project_id: "slingneomobile",
      private_key_id: "a30eac5f19e9f3d317b28b3ffca1a22fc9949913",
      private_key:
        "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCv+eNH4HW4zlcw\nXo6FJBLSiaTaHs1ayNRWG5NmiWcYGRjmTZH4LYNbCydK1q7Vs8ueDpVp3+rC8Jd9\nSwVDuvaVngUY+UUK+wDZStPhx0roXb4N1Ydys5sCrR/jgCbAZBLNq/KGplt4SM/N\nw3fMRdtZ1kIJKTtCTOd5+oTUkmJSgjYg7zhIst24ELVE2l5m6FFm+mo7owppHh9S\nH4Wl1zcS9lEUOxHBF5e7BlqBP1TAKn2Zg5RkAXDxaegqWtP5HpalYwi6sfkprI31\niMxPtI+B9Tikezmv3p5QwWFZluD9+qIF0ESIotgXZRkGt33+hws0sO9fUyP3milI\njve4hhcvAgMBAAECggEANsLCUVmuCIZdZ3XlT9U77jxbCm1PZhLc0LbgFaZoaH1W\n3EQDSoGPQMOlxIot+d5rXJIZOMsvWN5Zpem0h7EkjsaPu4fGTnZxeyzn5niH/Os+\n+zsZXT463IhXRgpZBMGfgFUjsXcPO80crWFIZE7QxZIBFqy3/hfEaJbmwueSpS3P\n0JYXluSiv4L0IaY77mzmi3lwQzZ4ggZ4bR2bqOsoiTCXOtJ8q/IpHXA659mTFPZi\nW15z3M2eE6NDOoeFXGH8y/pPu2ATIXKVROx+O/wttdewd/TGTXKAEdWVDWtxhlwZ\nWb/5DJQWNtrrgGZl9qvDaZpitQ9bLY0iRcqiAACyYQKBgQDbv2Fx8QoXEgzwY4Y8\n4QlEi/hp++Qd/Va5TKh/db/3DuF2JYYImjlfrdkAO19lb7+xpVi1KpX6eg+ceCKy\ncIm2iafyVP6JS3NT3RjzLEttEB2UzGTgUE1fzpLniRNjOVBXrd50XKWkKXRuH/Kk\nHqVB6ml0Q5ZR5WGr0MYe85GxFwKBgQDNAec/kGt5GJMTRuAfwdzhBEgF9wGU+PwQ\nZFaAvvSchmoofY+CbkHmNnvaXBy0Dv/H48nfz6HOEYIgiuUO+1i7rkhItmRmFTut\nowWWZvBoCWLe6+4aFGqwNO/AWSGRenu/o1HOaFQIValWrmiVhi8I3XMipM/5GUV4\nyWQTghCpqQKBgAt6OH26CDviPnjDyfweCNzirqvicyy50bDF9zsJDGi8Bzyjgxep\n7ns32lCvyTDEIHAH4dU8jy7Q90XF5JILXLYDBJmcpNrI7RIhRy9UTfA5WkIuVsp8\nhz4MzRF40GFrWe3qb+cF+8TSQXmLA6Jc02bY9n8TFKPcZjiSI/bz49UrAoGANHIu\nNMa/l+U/iwjwwW8ZEL/FpTEByJjB83eX4av4bCq+8cjdc+K9HSYHHV+/QBkuOnb9\n6DH4FP3JqoWd/+0xUCJP/7oZiTwZXlx8S3PeQN9V2e3FpgpfGOESDMVAnzUUf3xK\nq2FpThCMF87alpYTZlMw50X+pp1edn4fChaWKLECgYBjLf3Q6tNWbi55M6yLGyf1\n/F9Gh/1LX3FUWSMZfkGwmNkGfXYOP8xWjeIJTSzdfVwTT3Ro0Nf4aItfrCyE69XY\npxxN51BbjX8EPvojsimak18pC7Zc7ZwgSHAx1daCg/Ob2GRgAF241ZPr0cbKk/8C\ns3CQEszFTA6A2Qw22xv2tQ==\n-----END PRIVATE KEY-----\n",
      client_email:
        "firebase-adminsdk-fbsvc@slingneomobile.iam.gserviceaccount.com",
      client_id: "108572494052348154380",
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url:
        "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40slingneomobile.iam.gserviceaccount.com",
      universe_domain: "googleapis.com",
    },
  },
  instantpay: {
    baseUrl: process.env.INSTANTPAY_BASE_URL || "https://api.instantpay.in",
    clientId: process.env.INSTANTPAY_CLIENT_ID || "YWY3OTAzYzNlM2ExZTJlOeVjy0SNwMC4Z4KIvNxw19I=",
    clientSecret: process.env.INSTANTPAY_CLIENT_SECRET || "2935f5c2fc26c196640488dbfb40551b8f8ca469a4415c1c915cc7a36681ef28",
    authCode: process.env.INSTANTPAY_AUTH_CODE || "1",
    endpointIp: process.env.INSTANTPAY_ENDPOINT_IP || "15.207.51.26"
  },
};
