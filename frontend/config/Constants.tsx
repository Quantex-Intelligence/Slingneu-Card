const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  // Fallback to local backend in development mode
  if (__DEV__) {
    return 'http://localhost:3000';
  }
  return 'https://admin.slingneo.in';
};

export const baseUrl = getBaseUrl();
