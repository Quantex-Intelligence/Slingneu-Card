import { useEffect, useState } from 'react';
import FirebaseFCMService from '../services/FirebaseFCMService';

export const useFirebaseFCM = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    console.log('🔥 [Firebase FCM Hook] useFirebaseFCM hook mounted');
    initializeFirebaseFCM();
    return () => {
      console.log('🔥 [Firebase FCM Hook] useFirebaseFCM hook unmounting, cleaning up...');
      // Cleanup on unmount
      FirebaseFCMService.getInstance().cleanup();
    };
  }, []);

  const initializeFirebaseFCM = async () => {
    console.log('🔥 [Firebase FCM Hook] Initializing Firebase FCM...');
    try {
      const firebaseFCMService = FirebaseFCMService.getInstance();
      await firebaseFCMService.initialize();
      
      const token = await firebaseFCMService.getFCMToken();
      const status = await firebaseFCMService.getTokenStatus();
      
      setFcmToken(token);
      setHasPermission(status.hasToken);
      setIsInitialized(true);
      
      console.log('✅ [Firebase FCM Hook] Firebase FCM initialized successfully');
      console.log('✅ [Firebase FCM Hook] FCM token:', token);
      console.log('✅ [Firebase FCM Hook] Has permission:', status.hasToken);
    } catch (error) {
      console.error('❌ [Firebase FCM Hook] Failed to initialize Firebase FCM:', error);
    }
  };

  const testFCMToken = async () => {
    console.log('🔥 [Firebase FCM Hook] Testing FCM token generation...');
    try {
      const firebaseFCMService = FirebaseFCMService.getInstance();
      await firebaseFCMService.testFCMTokenGeneration();
      
      // Get the updated token
      const newToken = await firebaseFCMService.getFCMToken();
      setFcmToken(newToken);
      console.log('✅ [Firebase FCM Hook] FCM token test completed, new token:', newToken);
    } catch (error) {
      console.error('❌ [Firebase FCM Hook] FCM token test failed:', error);
    }
  };

  const getTokenStatus = async () => {
    console.log('🔥 [Firebase FCM Hook] Getting FCM token status...');
    try {
      const firebaseFCMService = FirebaseFCMService.getInstance();
      const status = await firebaseFCMService.getTokenStatus();
      
      console.log('📊 [Firebase FCM Hook] FCM Token Status:', {
        hasToken: status.hasToken,
        token: status.token,
        isFirebase: status.isFirebase,
        platform: status.platform,
      });
      
      if (status.isFirebase) {
        console.log('✅ [Firebase FCM Hook] Real Firebase FCM token available');
      } else if (status.hasToken) {
        console.log('⚠️ [Firebase FCM Hook] Token available but may not be Firebase FCM');
      } else {
        console.log('❌ [Firebase FCM Hook] No FCM token available');
      }
      
      return status;
    } catch (error) {
      console.error('❌ [Firebase FCM Hook] Failed to get FCM token status:', error);
      return null;
    }
  };

  return {
    isInitialized,
    fcmToken,
    hasPermission,
    testFCMToken,
    getTokenStatus,
  };
}; 