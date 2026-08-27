import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { WebView } from "react-native-webview";

export default function WebViewScreen() {
  const router = useRouter();
  const { url, title } = useLocalSearchParams<{ url: string; title?: string }>();
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    if (Platform.OS === "web" && url && url.startsWith("http")) {
      try {
        window.open(url, "_blank");
      } catch (e) {
        console.log("Auto window.open error:", e);
      }
    }
  }, [url]);

  if (!url) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No URL provided</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: title || "Sling Store Redirect",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.headerBack}>
              <Ionicons name="arrow-back" size={24} color="#1A1F36" />
            </TouchableOpacity>
          ),
          headerTitleStyle: {
            fontFamily: "SpaceMono-Regular",
            fontSize: 16,
            color: "#1A1F36",
          },
          headerStyle: {
            backgroundColor: "#FFFFFF",
          },
        }}
      />
      <View style={{ flex: 1 }}>
        {Platform.OS === "web" ? (
          <View style={styles.webRedirectContainer}>
            <View style={styles.webCard}>
              <Ionicons name="open-outline" size={48} color="#6c56f9" />
              <Text style={styles.webTitle}>{title || "Merchant Store"}</Text>
              <Text style={styles.webSubtext}>
                External merchant store pages open in a new secure browser tab for safety.
              </Text>
              <TouchableOpacity
                style={styles.openTabButton}
                onPress={() => window.open(url, "_blank")}
                activeOpacity={0.85}
              >
                <Text style={styles.openTabText}>Open Store Website ↗</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <WebView
            source={{ uri: url }}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
            style={{ flex: 1 }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  headerBack: {
    marginLeft: 10,
    padding: 5,
  },
  loader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: "#E53E3E",
    marginBottom: 20,
    fontFamily: "SpaceMono-Regular",
  },
  webRedirectContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    padding: 24,
  },
  webCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    maxWidth: 480,
    width: "100%",
    shadowColor: "#6c56f9",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  webTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
    fontFamily: "SpaceMono-Regular",
  },
  webSubtext: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
    fontFamily: "SpaceMono-Regular",
  },
  openTabButton: {
    backgroundColor: "#6c56f9",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
  },
  openTabText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
    fontFamily: "SpaceMono-Regular",
  },
  backButton: {
    backgroundColor: "#667eea",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontFamily: "SpaceMono-Regular",
  },
});
