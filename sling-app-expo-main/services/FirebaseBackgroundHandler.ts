import { Platform } from 'react-native';

let messaging: any = () => null;

// Register background handler (only on native platforms)
if (Platform.OS !== 'web') {
  try {
    messaging = require('@react-native-firebase/messaging').default;
    messaging().setBackgroundMessageHandler(async (remoteMessage: any) => {
      console.log('🔥 [Firebase Background] Background message received:', remoteMessage);
      console.log('🔥 [Firebase Background] Message data:', remoteMessage.data);
      console.log('🔥 [Firebase Background] Message notification:', remoteMessage.notification);
      
      // Handle background message
      handleBackgroundMessage(remoteMessage);
    });
  } catch (error) {
    console.warn('🔥 [Firebase Background] Failed to register background handler:', error);
  }
}

// Handle background message
function handleBackgroundMessage(remoteMessage: any) {
  console.log('🔥 [Firebase Background] Processing background message...');
  
  const data = remoteMessage.data;
  const notification = remoteMessage.notification;
  
  console.log('🔥 [Firebase Background] Message type:', data?.type);
  console.log('🔥 [Firebase Background] Message title:', notification?.title);
  console.log('🔥 [Firebase Background] Message body:', notification?.body);
  
  // Handle different types of notifications
  switch (data?.type) {
    case 'transaction':
      console.log('🔥 [Firebase Background] Transaction notification received');
      break;
      
    case 'offer':
      console.log('🔥 [Firebase Background] Offer notification received');
      break;
      
    case 'reward':
      console.log('🔥 [Firebase Background] Reward notification received');
      break;
      
    case 'kyc':
      console.log('🔥 [Firebase Background] KYC notification received');
      break;
      
    default:
      console.log('🔥 [Firebase Background] Unknown notification type:', data?.type);
      break;
  }
  
  console.log('✅ [Firebase Background] Background message processed successfully');
}

export default messaging; 