import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import NotificationService from './NotificationService';

const getMessaging = () => {
  if (Platform.OS === 'web') return null;
  try {
    return require('@react-native-firebase/messaging').default;
  } catch (e) {
    return null;
  }
};

export interface FCMNotificationData {
  title: string;
  body: string;
  data?: any;
  sound?: boolean;
  priority?: 'default' | 'normal' | 'high';
}

class FirebaseFCMService {
  private static instance: FirebaseFCMService;
  private fcmToken: string | null = null;
  private messageListener: (() => void) | null = null;
  private notificationListener: (() => void) | null = null;

  private constructor() {
    console.log('🔥 [Firebase FCM] FirebaseFCMService instance created');
  }

  public static getInstance(): FirebaseFCMService {
    if (!FirebaseFCMService.instance) {
      console.log('🔥 [Firebase FCM] Creating new FirebaseFCMService instance');
      FirebaseFCMService.instance = new FirebaseFCMService();
    }
    return FirebaseFCMService.instance;
  }

  // Initialize Firebase FCM service
  public async initialize(): Promise<void> {
    console.log('🔥 [Firebase FCM] Initializing Firebase FCM service...');
    if (Platform.OS === 'web') {
      console.log('🔥 [Firebase FCM] Skipping native FCM initialization on Web platform');
      return;
    }
    try {
      // Request permissions
      console.log('🔥 [Firebase FCM] Requesting notification permissions...');
      const messaging = getMessaging();
      if (!messaging) return;
      const authStatus = await messaging().requestPermission();
      console.log('🔥 [Firebase FCM] Authorization status:', authStatus);
      
      const enabled = 
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('✅ [Firebase FCM] Authorization status:', authStatus);
        
        // Ensure local notifications (expo-notifications) are initialized so we can display
        // foreground banners via local notifications and Android channels are created.
        try {
          await NotificationService.getInstance().initialize();
        } catch (notifInitError) {
          console.error('❌ [Firebase FCM] Failed to initialize NotificationService:', notifInitError);
        }

        // Get FCM token
        await this.getFCMToken();
        
        // Set up message listeners
        this.setupMessageListeners();
        
        console.log('✅ [Firebase FCM] Firebase FCM service initialized successfully');
      } else {
        console.log('❌ [Firebase FCM] Notification permissions not granted');
      }
    } catch (error: any) {
      console.error('❌ [Firebase FCM] Error initializing Firebase FCM:', error);
      console.error('❌ [Firebase FCM] Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
    }
  }

  // Get FCM token
  public async getFCMToken(): Promise<string | null> {
    console.log('🔥 [Firebase FCM] Getting FCM token...');
    const messaging = getMessaging();
    if (!messaging) {
      return null;
    }
    try {
      if (!this.fcmToken) {
        console.log('🔥 [Firebase FCM] Token not in memory, generating new token...');
        
        // Get the token
        const token = await messaging().getToken();
        console.log('✅ [Firebase FCM] FCM token obtained:', token);
        console.log('✅ [Firebase FCM] Token length:', token.length);
        console.log('✅ [Firebase FCM] Token starts with:', token.substring(0, 20) + '...');
        
        this.fcmToken = token;
        await AsyncStorage.setItem('fcmToken', token);
        console.log('✅ [Firebase FCM] Token saved to AsyncStorage');
        
        // Set up token refresh listener
        this.setupTokenRefreshListener();
      } else {
        console.log('🔥 [Firebase FCM] Token found in memory:', this.fcmToken);
      }
      
      return this.fcmToken;
    } catch (error: any) {
      console.error('❌ [Firebase FCM] Error getting FCM token:', error);
      console.error('❌ [Firebase FCM] Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      return null;
    }
  }

  // Set up token refresh listener
  private setupTokenRefreshListener(): void {
    console.log('🔥 [Firebase FCM] Setting up token refresh listener...');
    const messaging = getMessaging();
    if (!messaging) return;
    messaging().onTokenRefresh((token: string) => {
      console.log('🔄 [Firebase FCM] FCM token refreshed:', token);
      this.fcmToken = token;
      AsyncStorage.setItem('fcmToken', token);
    });
  }

  // Set up message listeners
  private setupMessageListeners(): void {
    console.log('🔥 [Firebase FCM] Setting up message listeners...');
    const messaging = getMessaging();
    if (!messaging) return;
    
    // Foreground message listener
    this.messageListener = messaging().onMessage(async (remoteMessage: any) => {
      console.log('🔥 [Firebase FCM] Foreground message received:', remoteMessage);
      console.log('🔥 [Firebase FCM] Message data:', remoteMessage.data);
      console.log('🔥 [Firebase FCM] Message notification:', remoteMessage.notification);
      
      // Handle foreground message
      this.handleForegroundMessage(remoteMessage);
    });

    // Background/quit state message listener
    this.notificationListener = messaging().onNotificationOpenedApp((remoteMessage: any) => {
      console.log('🔥 [Firebase FCM] Background message opened app:', remoteMessage);
      console.log('🔥 [Firebase FCM] Message data:', remoteMessage.data);
      
      // Handle background message
      this.handleBackgroundMessage(remoteMessage);
    });

    // Check if app was opened from a quit state
    messaging()
      .getInitialNotification()
      .then((remoteMessage: any) => {
        if (remoteMessage) {
          console.log('🔥 [Firebase FCM] App opened from quit state:', remoteMessage);
          console.log('🔥 [Firebase FCM] Message data:', remoteMessage.data);
          
          // Handle quit state message
          this.handleQuitStateMessage(remoteMessage);
        }
      });

    console.log('✅ [Firebase FCM] Message listeners set up successfully');
  }

  // Handle foreground message
  private handleForegroundMessage(remoteMessage: any): void {
    console.log('🔥 [Firebase FCM] Handling foreground message...');
    console.log('🔥 [Firebase FCM] Message title:', remoteMessage.notification?.title);
    console.log('🔥 [Firebase FCM] Message body:', remoteMessage.notification?.body);
    console.log('🔥 [Firebase FCM] Message data:', remoteMessage.data);
    
    // Show a local notification so the user sees a banner while app is in foreground
    try {
      const data = remoteMessage?.data || {};
      // Prefer payload's notification title/body when available; otherwise derive from data
      const derivedTitle =
        remoteMessage?.notification?.title ||
        (data?.type === 'TRANSACTION_OTP'
          ? 'Transaction OTP'
          : data?.type === 'transaction'
          ? 'Transaction Update'
          : data?.type === 'offer'
          ? 'New Offer'
          : data?.type === 'reward'
          ? 'Reward Update'
          : 'Notification');

      const derivedBody =
        remoteMessage?.notification?.body ||
        (data?.type === 'TRANSACTION_OTP'
          ? `Enter the OTP to complete your transaction for ${data?.amount || ''}`
          : data?.description || data?.message || '');

      NotificationService.getInstance().sendLocalNotification({
        title: derivedTitle,
        body: derivedBody,
        data,
        sound: true,
        priority: 'high',
      });
      console.log('✅ [Firebase FCM] Presented local notification for foreground message');
    } catch (error) {
      console.error('❌ [Firebase FCM] Failed to present local notification for foreground message:', error);
    }
  }

  // Handle background message
  private handleBackgroundMessage(remoteMessage: any): void {
    console.log('🔥 [Firebase FCM] Handling background message...');
    console.log('🔥 [Firebase FCM] Message data:', remoteMessage.data);
    
    // Navigate based on message data
    const data = remoteMessage.data;
    if (data?.type === 'transaction') {
      console.log('🔥 [Firebase FCM] Navigating to transactions screen');
      // Navigate to transactions screen
    } else if (data?.type === 'offer') {
      console.log('🔥 [Firebase FCM] Navigating to offers screen');
      // Navigate to offers screen
    } else if (data?.type === 'reward') {
      console.log('🔥 [Firebase FCM] Navigating to rewards screen');
      // Navigate to rewards screen
    }
  }

  // Handle quit state message
  private handleQuitStateMessage(remoteMessage: any): void {
    console.log('🔥 [Firebase FCM] Handling quit state message...');
    console.log('🔥 [Firebase FCM] Message data:', remoteMessage.data);
    
    // Handle navigation or other actions
    this.handleBackgroundMessage(remoteMessage);
  }

  // Test FCM token generation
  public async testFCMTokenGeneration(): Promise<void> {
    console.log('🔥 [Firebase FCM Test] Testing FCM token generation...');
    const messaging = getMessaging();
    if (!messaging) {
      console.log('🔥 [Firebase FCM Test] Skipping on web platform');
      return;
    }
    
    try {
      console.log('🔥 [Firebase FCM Test] Platform:', Platform.OS);
      console.log('🔥 [Firebase FCM Test] Firebase app initialized:', messaging().app.name);
      
      // Request permissions
      const authStatus = await messaging().requestPermission();
      console.log('🔥 [Firebase FCM Test] Authorization status:', authStatus);
      
      if (authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL) {
        
        console.log('🔥 [Firebase FCM Test] Getting FCM token...');
        const token = await messaging().getToken();
        
        console.log('✅ [Firebase FCM Test] FCM token generated successfully!');
        console.log('✅ [Firebase FCM Test] Full token:', token);
        console.log('✅ [Firebase FCM Test] Token format check:', {
          length: token.length,
          type: typeof token,
          startsWithFCM: token.length > 100, // FCM tokens are typically long
        });
        
        // Update the stored token
        this.fcmToken = token;
        await AsyncStorage.setItem('fcmToken', token);
        console.log('✅ [Firebase FCM Test] Token saved to storage');
        
      } else {
        console.log('❌ [Firebase FCM Test] Notification permissions not granted');
      }
      
    } catch (error: any) {
      console.error('❌ [Firebase FCM Test] Token generation failed:', error);
      console.error('❌ [Firebase FCM Test] Error details:', {
        message: error.message,
        code: error.code,
        name: error.name,
      });
    }
  }

  // Get current token status
  public async getTokenStatus(): Promise<{
    hasToken: boolean;
    token: string | null;
    isFirebase: boolean;
    platform: string;
  }> {
    const token = await this.getFCMToken();
    const isFirebase = token ? token.length > 100 : false; // FCM tokens are typically long
    
    return {
      hasToken: !!token,
      token,
      isFirebase,
      platform: Platform.OS,
    };
  }

  // Clean up listeners
  public cleanup(): void {
    console.log('🔥 [Firebase FCM] Cleaning up Firebase FCM listeners...');
    if (this.messageListener) {
      this.messageListener();
      this.messageListener = null;
      console.log('✅ [Firebase FCM] Message listener removed');
    }
    if (this.notificationListener) {
      this.notificationListener();
      this.notificationListener = null;
      console.log('✅ [Firebase FCM] Notification listener removed');
    }
    console.log('✅ [Firebase FCM] Cleanup completed');
  }
}

export default FirebaseFCMService; 