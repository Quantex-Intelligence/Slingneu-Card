import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="kyc" />
      <Stack.Screen name="kyc-onboarding" />
      <Stack.Screen name="kyc-submitted" />
      <Stack.Screen name="privacy" />
      <Stack.Screen name="referral-code" />
      <Stack.Screen name="scan-done" />
      <Stack.Screen name="terms" />
    </Stack>
  );
}
