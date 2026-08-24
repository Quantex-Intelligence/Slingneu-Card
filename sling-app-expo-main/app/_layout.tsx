import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
import "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Provider, useSelector } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { useFirebaseFCM } from "../hooks/useFirebaseFCM";
import "../services/FirebaseBackgroundHandler";
import { persistor, RootState, store } from "../store/store";

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { user } = useSelector((state: RootState) => state.auth);
  const { isInitialized } = useFirebaseFCM();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="index" />
        ) : user.isKyc === false ? (
          <Stack.Screen name="kyc-onboarding" />
        ) : (
          <Stack.Screen name="home" />
        )}
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) {
    return null;
  }

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SafeAreaView style={{ flex: 1 }}>
          <RootLayoutNav />
        </SafeAreaView>
      </PersistGate>
    </Provider>
  );
}
