import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => {
    console.log('🔔 [FCM] Notification handler called');
    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    };
  },
});

export interface NotificationData {
  title: string;
  body: string;
  data?: any;
  sound?: boolean;
  priority?: 'default' | 'normal' | 'high';
}

class NotificationService {
  private static instance: NotificationService;
  private expoPushToken: string | null = null;
  private notificationListener: Notifications.Subscription | null = null;
  private responseListener: Notifications.Subscription | null = null;

  private constructor() {
    console.log('🔔 [FCM] NotificationService instance created');
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      console.log('🔔 [FCM] Creating new NotificationService instance');
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Initialize notification service
  public async initialize(): Promise<void> {
    console.log('🔔 [FCM] Initializing notification service...');
    try {
      // Request permissions
      console.log('🔔 [FCM] Checking notification permissions...');
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      console.log('🔔 [FCM] Existing permission status:', existingStatus);
      
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        console.log('🔔 [FCM] Requesting notification permissions...');
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
        console.log('🔔 [FCM] New permission status:', status);
      }
      
      if (finalStatus !== 'granted') {
        console.log('❌ [FCM] Failed to get push token for push notification!');
        return;
      }

      // Get push token
      console.log('🔔 [FCM] Checking if running on device...');
      console.log('🔔 [FCM] Device.isDevice:', Device.isDevice);
      console.log('🔔 [FCM] Platform.OS:', Platform.OS);
      
      if (Device.isDevice) {
        console.log('🔔 [FCM] Getting Expo push token...');
        console.log('🔔 [FCM] Project ID:', '267bc83f-66e8-4897-bc68-3eeb77d64917');
        
        try {
          const token = await Notifications.getExpoPushTokenAsync({
            projectId: '267bc83f-66e8-4897-bc68-3eeb77d64917', // Your EAS project ID
          });
          
          console.log('✅ [FCM] Expo push token obtained successfully');
          console.log('✅ [FCM] Token data:', token.data);
          console.log('✅ [FCM] Token type:', typeof token.data);
          console.log('✅ [FCM] Token length:', token.data.length);
          console.log('✅ [FCM] Token starts with:', token.data.substring(0, 20) + '...');
          
          this.expoPushToken = token.data;
          await AsyncStorage.setItem('expoPushToken', token.data);
          console.log('✅ [FCM] Token saved to AsyncStorage');
          
          // Log token format for debugging
          if (token.data.startsWith('ExponentPushToken[')) {
            console.log('✅ [FCM] Token format is correct (ExponentPushToken)');
          } else {
            console.log('⚠️ [FCM] Token format might be incorrect');
          }
          
        } catch (tokenError: any) {
          console.error('❌ [FCM] Error getting Expo push token:', tokenError);
          console.error('❌ [FCM] Token error details:', {
            message: tokenError.message,
            code: tokenError.code,
            stack: tokenError.stack
          });
        }
      } else {
        console.log('⚠️ [FCM] Must use physical device for Push Notifications');
        console.log('⚠️ [FCM] Simulator detected - FCM tokens cannot be generated');
        console.log('⚠️ [FCM] Please test on a physical device for FCM functionality');
      }

      // Set up notification listeners
      console.log('🔔 [FCM] Setting up notification listeners...');
      this.setupNotificationListeners();

      // Configure Android channel
      if (Platform.OS === 'android') {
        console.log('🔔 [FCM] Setting up Android notification channel...');
        await this.setupAndroidChannel();
      }
      
      console.log('✅ [FCM] Notification service initialized successfully');
    } catch (error: any) {
      console.error('❌ [FCM] Error initializing notifications:', error);
      console.error('❌ [FCM] Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
    }
  }

  // Set up Android notification channel
  private async setupAndroidChannel(): Promise<void> {
    try {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: 'default',
      });
      console.log('✅ [FCM] Android notification channel created');
    } catch (error) {
      console.error('❌ [FCM] Error creating Android channel:', error);
    }
  }

  // Set up notification listeners
  private setupNotificationListeners(): void {
    console.log('🔔 [FCM] Setting up notification listeners...');
    
    // Foreground notification listener
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('🔔 [FCM] Notification received in foreground:', notification);
      console.log('🔔 [FCM] Notification content:', notification.request.content);
      console.log('🔔 [FCM] Notification data:', notification.request.content.data);
      this.handleForegroundNotification(notification);
    });

    // Background/killed state notification listener
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('🔔 [FCM] Notification response received:', response);
      console.log('🔔 [FCM] Response action identifier:', response.actionIdentifier);
      console.log('🔔 [FCM] Response notification data:', response.notification.request.content.data);
      this.handleNotificationResponse(response);
    });
    
    console.log('✅ [FCM] Notification listeners set up successfully');
  }

  // Handle foreground notifications
  private handleForegroundNotification(notification: Notifications.Notification): void {
    console.log('🔔 [FCM] Handling foreground notification...');
    console.log('🔔 [FCM] Notification title:', notification.request.content.title);
    console.log('🔔 [FCM] Notification body:', notification.request.content.body);
    
    // You can customize how foreground notifications are displayed
    // For example, show a custom alert or update UI
    
    // You can also trigger custom actions based on notification data
    const data = notification.request.content.data;
    console.log('🔔 [FCM] Notification data type:', data?.type);
    
    if (data?.type === 'transaction') {
      console.log('🔔 [FCM] Transaction notification received');
    } else if (data?.type === 'offer') {
      console.log('🔔 [FCM] Offer notification received');
    } else if (data?.type === 'reward') {
      console.log('🔔 [FCM] Reward notification received');
    } else {
      console.log('🔔 [FCM] Unknown notification type:', data?.type);
    }
  }

  // Handle notification responses (when user taps notification)
  private handleNotificationResponse(response: Notifications.NotificationResponse): void {
    console.log('🔔 [FCM] Handling notification response...');
    const data = response.notification.request.content.data;
    console.log('🔔 [FCM] Response data:', data);

    // Navigate based on notification type
    if (data?.type === 'transaction') {
      console.log('🔔 [FCM] Navigating to transactions screen');
      this.navigateToScreen('/transactions');
    } else if (data?.type === 'offer') {
      console.log('🔔 [FCM] Navigating to offers screen');
      this.navigateToScreen('/offer-list');
    } else if (data?.type === 'reward') {
      console.log('🔔 [FCM] Navigating to rewards screen');
      this.navigateToScreen('/rewards');
    } else {
      console.log('🔔 [FCM] No specific navigation for notification type:', data?.type);
    }
  }

  // Navigate to specific screen (you'll need to implement this based on your navigation setup)
  private navigateToScreen(screen: string): void {
    console.log('🔔 [FCM] Attempting to navigate to:', screen);
    // Use expo-router to navigate
    try {
      router.push(screen as any);
      console.log('✅ [FCM] Navigation successful to:', screen);
    } catch (error) {
      console.error('❌ [FCM] Navigation error:', error);
    }
  }

  // Get the current push token
  public async getPushToken(): Promise<string | null> {
    console.log('🔔 [FCM] Getting push token...');
    if (!this.expoPushToken) {
      console.log('🔔 [FCM] Token not in memory, retrieving from storage...');
      this.expoPushToken = await AsyncStorage.getItem('expoPushToken');
      console.log('🔔 [FCM] Token from storage:', this.expoPushToken);
    }
    console.log('✅ [FCM] Current push token:', this.expoPushToken);
    return this.expoPushToken;
  }

  // Send local notification
  public async sendLocalNotification(notification: NotificationData): Promise<void> {
    console.log('🔔 [FCM] Sending local notification:', notification);
    try {
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
          sound: notification.sound ? 'default' : undefined,
          priority: notification.priority || 'default',
        },
        trigger: null, // Send immediately
      });
      console.log('✅ [FCM] Local notification sent successfully with ID:', identifier);
    } catch (error) {
      console.error('❌ [FCM] Error sending local notification:', error);
    }
  }

  // Schedule notification for later
  public async scheduleNotification(
    notification: NotificationData,
    trigger: Notifications.NotificationTriggerInput
  ): Promise<string> {
    console.log('🔔 [FCM] Scheduling notification:', notification);
    console.log('🔔 [FCM] Trigger:', trigger);
    try {
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
          sound: notification.sound ? 'default' : undefined,
          priority: notification.priority || 'default',
        },
        trigger,
      });
      console.log('✅ [FCM] Notification scheduled successfully with ID:', identifier);
      return identifier;
    } catch (error) {
      console.error('❌ [FCM] Error scheduling notification:', error);
      throw error;
    }
  }

  // Cancel scheduled notification
  public async cancelNotification(identifier: string): Promise<void> {
    console.log('🔔 [FCM] Canceling notification with ID:', identifier);
    try {
      await Notifications.cancelScheduledNotificationAsync(identifier);
      console.log('✅ [FCM] Notification canceled successfully');
    } catch (error) {
      console.error('❌ [FCM] Error canceling notification:', error);
    }
  }

  // Cancel all scheduled notifications
  public async cancelAllNotifications(): Promise<void> {
    console.log('🔔 [FCM] Canceling all scheduled notifications...');
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('✅ [FCM] All notifications canceled successfully');
    } catch (error) {
      console.error('❌ [FCM] Error canceling all notifications:', error);
    }
  }

  // Get all scheduled notifications
  public async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    console.log('🔔 [FCM] Getting all scheduled notifications...');
    try {
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      console.log('✅ [FCM] Found scheduled notifications:', notifications.length);
      notifications.forEach((notification, index) => {
        console.log(`🔔 [FCM] Notification ${index + 1}:`, {
          id: notification.identifier,
          title: notification.content.title,
          body: notification.content.body,
          data: notification.content.data,
        });
      });
      return notifications;
    } catch (error) {
      console.error('❌ [FCM] Error getting scheduled notifications:', error);
      return [];
    }
  }

  // Clean up listeners
  public cleanup(): void {
    console.log('🔔 [FCM] Cleaning up notification listeners...');
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
      this.notificationListener = null;
      console.log('✅ [FCM] Foreground listener removed');
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
      this.responseListener = null;
      console.log('✅ [FCM] Response listener removed');
    }
    console.log('✅ [FCM] Cleanup completed');
  }

  // Check if notifications are enabled
  public async areNotificationsEnabled(): Promise<boolean> {
    console.log('🔔 [FCM] Checking if notifications are enabled...');
    const { status } = await Notifications.getPermissionsAsync();
    console.log('🔔 [FCM] Notification permission status:', status);
    const enabled = status === 'granted';
    console.log('✅ [FCM] Notifications enabled:', enabled);
    return enabled;
  }

  // Request notification permissions
  public async requestPermissions(): Promise<boolean> {
    console.log('🔔 [FCM] Requesting notification permissions...');
    const { status } = await Notifications.requestPermissionsAsync();
    console.log('🔔 [FCM] Permission request result:', status);
    const granted = status === 'granted';
    console.log('✅ [FCM] Permissions granted:', granted);
    return granted;
  }

  // Test function to manually generate FCM token
  public async testFCMTokenGeneration(): Promise<void> {
    console.log('🔔 [FCM Test] Testing FCM token generation...');
    
    try {
      console.log('🔔 [FCM Test] Device info:', {
        isDevice: Device.isDevice,
        platform: Platform.OS,
        brand: Device.brand,
        manufacturer: Device.manufacturer,
        modelName: Device.modelName,
        osVersion: Device.osVersion,
      });

      if (!Device.isDevice) {
        console.log('❌ [FCM Test] Cannot generate token on simulator');
        console.log('🔔 [FCM Test] Creating mock token for testing purposes...');
        
        // Create a mock token for testing on emulator
        const mockToken = `ExponentPushToken[MOCK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}]`;
        this.expoPushToken = mockToken;
        await AsyncStorage.setItem('expoPushToken', mockToken);
        
        console.log('✅ [FCM Test] Mock token created for emulator testing:', mockToken);
        console.log('⚠️ [FCM Test] This is a mock token - real FCM requires physical device');
        return;
      }

      console.log('🔔 [FCM Test] Attempting to get Expo push token...');
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: '267bc83f-66e8-4897-bc68-3eeb77d64917',
      });

      console.log('✅ [FCM Test] Token generated successfully!');
      console.log('✅ [FCM Test] Full token:', token.data);
      console.log('✅ [FCM Test] Token format check:', {
        startsWithExponent: token.data.startsWith('ExponentPushToken['),
        length: token.data.length,
        type: typeof token.data,
      });

      // Update the stored token
      this.expoPushToken = token.data;
      await AsyncStorage.setItem('expoPushToken', token.data);
      console.log('✅ [FCM Test] Token saved to storage');

    } catch (error: any) {
      console.error('❌ [FCM Test] Token generation failed:', error);
      console.error('❌ [FCM Test] Error details:', {
        message: error.message,
        code: error.code,
        name: error.name,
      });
      
      // Create a fallback mock token if real token generation fails
      console.log('🔔 [FCM Test] Creating fallback mock token...');
      const fallbackToken = `ExponentPushToken[FALLBACK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}]`;
      this.expoPushToken = fallbackToken;
      await AsyncStorage.setItem('expoPushToken', fallbackToken);
      console.log('✅ [FCM Test] Fallback token created:', fallbackToken);
    }
  }

  // Function to get current token status
  public async getTokenStatus(): Promise<{
    hasToken: boolean;
    token: string | null;
    isMock: boolean;
    deviceInfo: any;
  }> {
    const token = await this.getPushToken();
    const isMock = !!(token?.includes('MOCK_') || token?.includes('FALLBACK_'));
    
    return {
      hasToken: !!token,
      token,
      isMock,
      deviceInfo: {
        isDevice: Device.isDevice,
        platform: Platform.OS,
        brand: Device.brand,
        manufacturer: Device.manufacturer,
        modelName: Device.modelName,
        osVersion: Device.osVersion,
      }
    };
  }
}

export default NotificationService; 