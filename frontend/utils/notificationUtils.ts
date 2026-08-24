import * as Notifications from 'expo-notifications';
import NotificationService, { NotificationData } from '../services/NotificationService';
const { SchedulableTriggerInputTypes } = Notifications;

export const sendTransactionNotification = async (
  title: string = 'Transaction Update',
  body: string = 'Your transaction has been processed successfully',
  data?: any
) => {
  console.log('🔔 [FCM Utils] Sending transaction notification:', { title, body, data });
  const notification: NotificationData = {
    title,
    body,
    data: {
      type: 'transaction',
      ...data,
    },
    sound: true,
    priority: 'high',
  };

  await NotificationService.getInstance().sendLocalNotification(notification);
  console.log('✅ [FCM Utils] Transaction notification sent successfully');
};

export const sendOfferNotification = async (
  title: string = 'New Offer Available',
  body: string = 'Check out this amazing offer just for you!',
  data?: any
) => {
  console.log('🔔 [FCM Utils] Sending offer notification:', { title, body, data });
  const notification: NotificationData = {
    title,
    body,
    data: {
      type: 'offer',
      ...data,
    },
    sound: true,
    priority: 'normal',
  };

  await NotificationService.getInstance().sendLocalNotification(notification);
  console.log('✅ [FCM Utils] Offer notification sent successfully');
};

export const sendRewardNotification = async (
  title: string = 'Reward Earned',
  body: string = 'Congratulations! You have earned a new reward.',
  data?: any
) => {
  console.log('🔔 [FCM Utils] Sending reward notification:', { title, body, data });
  const notification: NotificationData = {
    title,
    body,
    data: {
      type: 'reward',
      ...data,
    },
    sound: true,
    priority: 'high',
  };

  await NotificationService.getInstance().sendLocalNotification(notification);
  console.log('✅ [FCM Utils] Reward notification sent successfully');
};

export const sendWelcomeNotification = async (userName: string) => {
  console.log('🔔 [FCM Utils] Sending welcome notification for user:', userName);
  const notification: NotificationData = {
    title: 'Welcome to Sling!',
    body: `Hi ${userName}, welcome to your financial journey with Sling!`,
    data: {
      type: 'welcome',
      userName,
    },
    sound: true,
    priority: 'normal',
  };

  await NotificationService.getInstance().sendLocalNotification(notification);
  console.log('✅ [FCM Utils] Welcome notification sent successfully');
};

export const sendKYCReminderNotification = async () => {
  console.log('🔔 [FCM Utils] Sending KYC reminder notification');
  const notification: NotificationData = {
    title: 'Complete Your KYC',
    body: 'Complete your KYC verification to unlock all features!',
    data: {
      type: 'kyc_reminder',
    },
    sound: true,
    priority: 'normal',
  };

  await NotificationService.getInstance().sendLocalNotification(notification);
  console.log('✅ [FCM Utils] KYC reminder notification sent successfully');
};

export const scheduleReminderNotification = async (
  title: string,
  body: string,
  delayInSeconds: number
) => {
  console.log('🔔 [FCM Utils] Scheduling reminder notification:', { title, body, delayInSeconds });
  const notification: NotificationData = {
    title,
    body,
    data: {
      type: 'reminder',
    },
    sound: true,
    priority: 'normal',
  };

  const trigger: Notifications.TimeIntervalTriggerInput = {
    type: SchedulableTriggerInputTypes.TIME_INTERVAL,
    seconds: delayInSeconds,
    repeats: false,
  };

  const identifier = await NotificationService.getInstance().scheduleNotification(notification, trigger);
  console.log('✅ [FCM Utils] Reminder notification scheduled successfully with ID:', identifier);
  return identifier;
}; 