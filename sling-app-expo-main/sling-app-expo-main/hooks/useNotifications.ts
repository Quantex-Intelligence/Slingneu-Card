import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import NotificationService, { NotificationData } from '../services/NotificationService';

export const useNotifications = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    console.log('🔔 [FCM Hook] useNotifications hook mounted');
    initializeNotifications();
    return () => {
      console.log('🔔 [FCM Hook] useNotifications hook unmounting, cleaning up...');
      // Cleanup on unmount
      NotificationService.getInstance().cleanup();
    };
  }, []);

  const initializeNotifications = async () => {
    console.log('🔔 [FCM Hook] Initializing notifications...');
    try {
      const notificationService = NotificationService.getInstance();
      await notificationService.initialize();
      
      const token = await notificationService.getPushToken();
      const permission = await notificationService.areNotificationsEnabled();
      
      setPushToken(token);
      setHasPermission(permission);
      setIsInitialized(true);
      
      console.log('✅ [FCM Hook] Notifications initialized successfully');
      console.log('✅ [FCM Hook] Push token:', token);
      console.log('✅ [FCM Hook] Has permission:', permission);
    } catch (error) {
      console.error('❌ [FCM Hook] Failed to initialize notifications:', error);
    }
  };

  const requestPermissions = async (): Promise<boolean> => {
    console.log('🔔 [FCM Hook] Requesting permissions...');
    try {
      const notificationService = NotificationService.getInstance();
      const granted = await notificationService.requestPermissions();
      setHasPermission(granted);
      console.log('✅ [FCM Hook] Permission request result:', granted);
      return granted;
    } catch (error) {
      console.error('❌ [FCM Hook] Failed to request notification permissions:', error);
      return false;
    }
  };

  const sendLocalNotification = async (notification: NotificationData) => {
    console.log('🔔 [FCM Hook] Sending local notification:', notification);
    try {
      const notificationService = NotificationService.getInstance();
      await notificationService.sendLocalNotification(notification);
      console.log('✅ [FCM Hook] Local notification sent successfully');
    } catch (error) {
      console.error('❌ [FCM Hook] Failed to send local notification:', error);
    }
  };

  const scheduleNotification = async (
    notification: NotificationData,
    trigger: any
  ): Promise<string | null> => {
    console.log('🔔 [FCM Hook] Scheduling notification:', notification);
    console.log('🔔 [FCM Hook] Trigger:', trigger);
    try {
      const notificationService = NotificationService.getInstance();
      const identifier = await notificationService.scheduleNotification(notification, trigger);
      console.log('✅ [FCM Hook] Notification scheduled successfully:', identifier);
      return identifier;
    } catch (error) {
      console.error('❌ [FCM Hook] Failed to schedule notification:', error);
      return null;
    }
  };

  const cancelAllNotifications = async () => {
    console.log('🔔 [FCM Hook] Canceling all notifications...');
    try {
      const notificationService = NotificationService.getInstance();
      await notificationService.cancelAllNotifications();
      console.log('✅ [FCM Hook] All notifications canceled successfully');
    } catch (error) {
      console.error('❌ [FCM Hook] Failed to cancel notifications:', error);
    }
  };

  const navigateFromNotification = (screen: string) => {
    console.log('🔔 [FCM Hook] Navigating from notification to:', screen);
    // Use expo-router to navigate
    router.push(screen as any);
  };

  const testFCMToken = async () => {
    console.log('🔔 [FCM Hook] Testing FCM token generation...');
    try {
      const notificationService = NotificationService.getInstance();
      await notificationService.testFCMTokenGeneration();
      
      // Get the updated token
      const newToken = await notificationService.getPushToken();
      setPushToken(newToken);
      console.log('✅ [FCM Hook] Token test completed, new token:', newToken);
    } catch (error) {
      console.error('❌ [FCM Hook] Token test failed:', error);
    }
  };

  const getTokenStatus = async () => {
    console.log('🔔 [FCM Hook] Getting token status...');
    try {
      const notificationService = NotificationService.getInstance();
      const status = await notificationService.getTokenStatus();
      
      console.log('📊 [FCM Hook] Token Status:', {
        hasToken: status.hasToken,
        token: status.token,
        isMock: status.isMock,
        deviceInfo: status.deviceInfo,
      });
      
      if (status.isMock) {
        console.log('⚠️ [FCM Hook] Using mock token - real FCM requires physical device');
      } else if (status.hasToken) {
        console.log('✅ [FCM Hook] Real FCM token available');
      } else {
        console.log('❌ [FCM Hook] No token available');
      }
      
      return status;
    } catch (error) {
      console.error('❌ [FCM Hook] Failed to get token status:', error);
      return null;
    }
  };

  return {
    isInitialized,
    pushToken,
    hasPermission,
    requestPermissions,
    sendLocalNotification,
    scheduleNotification,
    cancelAllNotifications,
    navigateFromNotification,
    testFCMToken,
    getTokenStatus,
  };
}; 