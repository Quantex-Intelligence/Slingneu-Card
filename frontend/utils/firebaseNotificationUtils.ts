import { Platform } from 'react-native';

export interface FCMNotificationPayload {
  to: string; // FCM token
  notification?: {
    title: string;
    body: string;
    sound?: string;
    badge?: number;
    click_action?: string;
  };
  data?: {
    [key: string]: string;
  };
  priority?: 'normal' | 'high';
  android?: {
    priority?: 'normal' | 'high';
    notification?: {
      sound?: string;
      channel_id?: string;
      priority?: 'default' | 'min' | 'low' | 'high' | 'max';
    };
  };
  apns?: {
    payload?: {
      aps?: {
        sound?: string;
        badge?: number;
        alert?: {
          title?: string;
          body?: string;
        };
      };
    };
  };
}

// Send FCM notification using Firebase Admin SDK (server-side)
export const sendFCMNotification = async (
  fcmToken: string,
  title: string,
  body: string,
  data?: any,
  options?: {
    sound?: boolean;
    priority?: 'normal' | 'high';
    badge?: number;
  }
): Promise<boolean> => {
  console.log('🔥 [FCM Utils] Sending FCM notification...');
  console.log('🔥 [FCM Utils] Token:', fcmToken);
  console.log('🔥 [FCM Utils] Title:', title);
  console.log('🔥 [FCM Utils] Body:', body);
  console.log('🔥 [FCM Utils] Data:', data);
  
  try {
    const payload: FCMNotificationPayload = {
      to: fcmToken,
      notification: {
        title,
        body,
        sound: options?.sound ? 'default' : undefined,
        badge: options?.badge,
      },
      data: data || {},
      priority: options?.priority || 'high',
    };

    // Add platform-specific configurations
    if (Platform.OS === 'android') {
      payload.android = {
        priority: 'high',
        notification: {
          sound: options?.sound ? 'default' : undefined,
          channel_id: 'default',
          priority: 'high',
        },
      };
    } else if (Platform.OS === 'ios') {
      payload.apns = {
        payload: {
          aps: {
            sound: options?.sound ? 'default' : undefined,
            badge: options?.badge,
            alert: {
              title,
              body,
            },
          },
        },
      };
    }

    console.log('🔥 [FCM Utils] FCM payload:', JSON.stringify(payload, null, 2));

    // This would typically be sent from your backend server
    // For now, we'll just log the payload
    console.log('✅ [FCM Utils] FCM notification payload prepared successfully');
    console.log('⚠️ [FCM Utils] Note: This payload should be sent from your backend server');
    
    return true;
  } catch (error) {
    console.error('❌ [FCM Utils] Error sending FCM notification:', error);
    return false;
  }
};

// Send transaction notification
export const sendTransactionNotification = async (
  fcmToken: string,
  transactionData: {
    amount: string;
    type: 'credit' | 'debit';
    description: string;
    transactionId: string;
  }
): Promise<boolean> => {
  const title = `Transaction ${transactionData.type === 'credit' ? 'Received' : 'Completed'}`;
  const body = `${transactionData.type === 'credit' ? '+' : '-'}₹${transactionData.amount} - ${transactionData.description}`;
  
  const data = {
    type: 'transaction',
    transactionId: transactionData.transactionId,
    amount: transactionData.amount,
    transactionType: transactionData.type,
    description: transactionData.description,
  };

  return sendFCMNotification(fcmToken, title, body, data, {
    sound: true,
    priority: 'high',
  });
};

// Send offer notification
export const sendOfferNotification = async (
  fcmToken: string,
  offerData: {
    title: string;
    description: string;
    offerId: string;
    discount?: string;
  }
): Promise<boolean> => {
  const title = `New Offer: ${offerData.title}`;
  const body = offerData.description;
  
  const data = {
    type: 'offer',
    offerId: offerData.offerId,
    title: offerData.title,
    description: offerData.description,
    discount: offerData.discount,
  };

  return sendFCMNotification(fcmToken, title, body, data, {
    sound: true,
    priority: 'normal',
  });
};

// Send reward notification
export const sendRewardNotification = async (
  fcmToken: string,
  rewardData: {
    points: number;
    description: string;
    rewardId: string;
  }
): Promise<boolean> => {
  const title = 'Rewards Earned!';
  const body = `You earned ${rewardData.points} points - ${rewardData.description}`;
  
  const data = {
    type: 'reward',
    rewardId: rewardData.rewardId,
    points: rewardData.points.toString(),
    description: rewardData.description,
  };

  return sendFCMNotification(fcmToken, title, body, data, {
    sound: true,
    priority: 'normal',
  });
};

// Send KYC notification
export const sendKYCNotification = async (
  fcmToken: string,
  kycData: {
    status: 'approved' | 'rejected' | 'pending';
    message: string;
  }
): Promise<boolean> => {
  const title = `KYC ${kycData.status.charAt(0).toUpperCase() + kycData.status.slice(1)}`;
  const body = kycData.message;
  
  const data = {
    type: 'kyc',
    status: kycData.status,
    message: kycData.message,
  };

  return sendFCMNotification(fcmToken, title, body, data, {
    sound: true,
    priority: 'high',
  });
};

// Test FCM notification
export const testFCMNotification = async (fcmToken: string): Promise<boolean> => {
  console.log('🔥 [FCM Utils] Testing FCM notification...');
  
  const title = 'Test Notification';
  const body = 'This is a test notification from Firebase FCM';
  
  const data = {
    type: 'test',
    timestamp: new Date().toISOString(),
    test: 'true',
  };

  return sendFCMNotification(fcmToken, title, body, data, {
    sound: true,
    priority: 'high',
  });
}; 