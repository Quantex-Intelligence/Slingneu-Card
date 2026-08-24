const admin = require('firebase-admin');
const config = require('../config/config');
const path = require('path');

// Initialize Firebase Admin SDK
let firebaseApp;

try {
  // First try to load from config
  if (config.firebase && config.firebase.serviceAccount) {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(config.firebase.serviceAccount),
    });
    console.log('✅ Firebase initialized with config credentials');
  } else {
    // Try to load from JSON file
    const serviceAccountPath = path.join(__dirname, '../../FirebaseAdminsdk.json');
    try {
      const serviceAccount = require(serviceAccountPath);
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('✅ Firebase initialized with JSON file credentials');
    } catch (fileError) {
      // Try environment variable for Google Application Credentials
      if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        firebaseApp = admin.initializeApp();
        console.log('✅ Firebase initialized with GOOGLE_APPLICATION_CREDENTIALS');
      } else {
        // Initialize with default credentials (for development)
        firebaseApp = admin.initializeApp();
        console.log('✅ Firebase initialized with default credentials');
      }
    }
  }
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
  // Continue without Firebase if initialization fails
}

// Send notification to a single user
const sendNotificationToUser = async (fcmToken, title, body, data = {}) => {
  if (!firebaseApp || !fcmToken) {
    throw new Error('Firebase not initialized or FCM token not provided');
  }

  // FCM requires data values to be strings only. Coerce all values safely.
  const sanitizedData = Object.fromEntries(
    Object.entries(data || {}).map(([key, value]) => {
      if (value === null || value === undefined) return [key, ''];
      if (typeof value === 'string') return [key, value];
      // Convert non-primitive objects/arrays to JSON string; primitives to String
      if (typeof value === 'object') return [key, JSON.stringify(value)];
      return [key, String(value)];
    })
  );

  const message = {
    token: fcmToken,
    notification: {
      title: title,
      body: body,
    },
    data: sanitizedData,
    android: {
      notification: {
        sound: 'default',
        priority: 'high',
      },
    },
    apns: {
      payload: {
        aps: {
          sound: 'default',
          badge: 1,
        },
      },
    },
  };

  try {
    const response = await firebaseApp.messaging().send(message);
    console.log('Successfully sent notification:', response);
    return response;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};

// Send notification to multiple users
const sendNotificationToUsers = async (fcmTokens, title, body, data = {}) => {
  if (!firebaseApp || !fcmTokens || fcmTokens.length === 0) {
    throw new Error('Firebase not initialized or FCM tokens not provided');
  }

  // Filter out null/undefined tokens
  const validTokens = fcmTokens.filter(token => token && token.trim() !== '');
  
  if (validTokens.length === 0) {
    throw new Error('No valid FCM tokens provided');
  }

  // FCM requires data values to be strings only. Coerce all values safely.
  const sanitizedData = Object.fromEntries(
    Object.entries(data || {}).map(([key, value]) => {
      if (value === null || value === undefined) return [key, ''];
      if (typeof value === 'string') return [key, value];
      if (typeof value === 'object') return [key, JSON.stringify(value)];
      return [key, String(value)];
    })
  );

  const message = {
    notification: {
      title: title,
      body: body,
    },
    data: sanitizedData,
    android: {
      notification: {
        sound: 'default',
        priority: 'high',
      },
    },
    apns: {
      payload: {
        aps: {
          sound: 'default',
          badge: 1,
        },
      },
    },
    tokens: validTokens,
  };

  try {
    const response = await firebaseApp.messaging().sendEachForMulticast(message);
    console.log('Successfully sent notifications:', response);
    return response;
  } catch (error) {
    console.error('Error sending notifications:', error);
    throw error;
  }
};

// Send notification to all users (topic-based)
const sendNotificationToTopic = async (topic, title, body, data = {}) => {
  if (!firebaseApp) {
    throw new Error('Firebase not initialized');
  }

  // FCM requires data values to be strings only. Coerce all values safely.
  const sanitizedData = Object.fromEntries(
    Object.entries(data || {}).map(([key, value]) => {
      if (value === null || value === undefined) return [key, ''];
      if (typeof value === 'string') return [key, value];
      if (typeof value === 'object') return [key, JSON.stringify(value)];
      return [key, String(value)];
    })
  );

  const message = {
    notification: {
      title: title,
      body: body,
    },
    data: sanitizedData,
    android: {
      notification: {
        sound: 'default',
        priority: 'high',
      },
    },
    apns: {
      payload: {
        aps: {
          sound: 'default',
          badge: 1,
        },
      },
    },
    topic: topic,
  };

  try {
    const response = await firebaseApp.messaging().send(message);
    console.log('Successfully sent topic notification:', response);
    return response;
  } catch (error) {
    console.error('Error sending topic notification:', error);
    throw error;
  }
};

// Test Firebase connection
const testFirebaseConnection = async () => {
  if (!firebaseApp) {
    throw new Error('Firebase not initialized');
  }

  try {
    // Try to get project info to test connection
    const projectId = firebaseApp.options.projectId;
    console.log('✅ Firebase connected successfully. Project ID:', projectId);
    return { success: true, projectId };
  } catch (error) {
    console.error('❌ Firebase connection test failed:', error);
    throw error;
  }
};

module.exports = {
  sendNotificationToUser,
  sendNotificationToUsers,
  sendNotificationToTopic,
  testFirebaseConnection,
  firebaseApp,
}; 