import { Platform } from 'react-native';

const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  // When running in a web browser, use relative URL string so Nginx proxies API calls automatically
  if (Platform.OS === 'web' || typeof window !== 'undefined') {
    return '';
  }
  if (__DEV__) {
    return 'http://localhost:3000';
  }
  return 'https://admin.slingneo.in';
};

export const baseUrl = getBaseUrl();
