import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';

// This function will be called when the app is in killed state and receives a notification
export async function handleBackgroundNotification(notification: Notifications.Notification) {
  console.log('🔔 [FCM Background] Background notification received:', notification);
  console.log('🔔 [FCM Background] Notification title:', notification.request.content.title);
  console.log('🔔 [FCM Background] Notification body:', notification.request.content.body);
  console.log('🔔 [FCM Background] Notification data:', notification.request.content.data);
  
  // You can perform any background tasks here
  // For example, update local storage, sync data, etc.
  
  const data = notification.request.content.data;
  
  // Store notification data for when app becomes active
  try {
    // You can store this in AsyncStorage or other storage
    console.log('🔔 [FCM Background] Background notification data:', data);
    console.log('🔔 [FCM Background] Notification type:', data?.type);
  } catch (error) {
    console.error('❌ [FCM Background] Error handling background notification:', error);
  }
}

// This function will be called when user taps on notification in killed state
export async function handleNotificationResponse(response: Notifications.NotificationResponse) {
  console.log('🔔 [FCM Background] Notification response in background:', response);
  console.log('🔔 [FCM Background] Response action identifier:', response.actionIdentifier);
  console.log('🔔 [FCM Background] Response notification data:', response.notification.request.content.data);
  
  const data = response.notification.request.content.data;
  console.log('🔔 [FCM Background] Response data type:', data?.type);
  
  // Navigate based on notification type when app becomes active
  if (data?.type === 'transaction') {
    console.log('🔔 [FCM Background] Navigating to transactions screen');
    // Navigate to transactions screen
    router.push('/transactions' as any);
  } else if (data?.type === 'offer') {
    console.log('🔔 [FCM Background] Navigating to offers screen');
    // Navigate to offers screen
    router.push('/offer-list' as any);
  } else if (data?.type === 'reward') {
    console.log('🔔 [FCM Background] Navigating to rewards screen');
    // Navigate to rewards screen
    router.push('/rewards' as any);
  } else {
    console.log('🔔 [FCM Background] No specific navigation for notification type:', data?.type);
  }
}

// Register background notification handlers
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    console.log('🔔 [FCM Background] Background notification handler called');
    console.log('🔔 [FCM Background] Notification:', notification);
    
    // Handle background notification
    await handleBackgroundNotification(notification);
    
    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    };
  },
}); 