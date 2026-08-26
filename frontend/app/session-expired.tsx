import { logout } from "@/store/slices/authSlice";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useDispatch } from "react-redux";

export default function SessionExpiredScreen() {
  const dispatch = useDispatch();

  const handleLoginAgain = () => {
    dispatch(logout());
    router.replace("/(auth)/login");
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#6c56f9", "#8b5cf6", "#a855f7"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="clock-alert-outline" size={64} color="#6c56f9" />
          </View>
          <Text style={styles.title}>Session Expired</Text>
          <Text style={styles.subtitle}>
            Your session has expired due to inactivity or security rules. Please sign in again to continue.
          </Text>
          <TouchableOpacity style={styles.button} onPress={handleLoginAgain} activeOpacity={0.9}>
            <LinearGradient
              colors={["#6c56f9", "#8b5cf6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Sign In Again</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  content: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
    fontFamily: "SpaceMono-Regular",
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 28,
    fontFamily: "SpaceMono-Regular",
  },
  button: {
    width: "100%",
    borderRadius: 14,
    overflow: "hidden",
  },
  buttonGradient: {
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "SpaceMono-Regular",
  },
});
