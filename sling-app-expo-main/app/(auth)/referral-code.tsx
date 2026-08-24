import { RootState } from "@/store/store";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, Stack } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";
import CustomAlert from "../../components/CustomAlert";
import { useCustomAlert } from "../../components/useCustomAlert";
import Api from "../../config/Api";

const { height } = Dimensions.get("window");

export default function ReferralCode() {
  const [referralCode, setReferralCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { token,user } = useSelector((state: RootState) => state.auth);
  
  // Custom alert hook
  const { alertVisible, alertConfig, showAlert, hideAlert } = useCustomAlert();

  const handleApplyReferral = async () => {
    if (!referralCode.trim()) {
      showAlert("Error", "Please enter a referral code", "error");
      return;
    }

    try {
      setLoading(true);
      const response = await Api.call(
        "/api/auth/apply-referral",
        "POST",
        { referralCode: referralCode.trim() },
        token
      );
      if (response.status === 200) {
        addMoney( "TSCSLINGNEO" + user?.phone+referralCode.trim());
      } else {
        showAlert(
          "Error", 
          response.error?.response?.data?.message || "Failed to apply referral code. Please try again.",
          "error"
        );
      }
    } catch (error) {
      showAlert("Error", "Something went wrong. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    showAlert(
      "Skip Referral Code",
      "Are you sure you want to skip adding a referral code? You can add it later from your profile.",
      "confirm",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Skip", onPress: () => router.replace("/home") }
      ]
    );
  };

  const addMoney = async (orderID: string) => {
    console.log("orderID",orderID);
    
    // Generate a random string for externalTransactionId
    const generateRandomString = (length: number) => {
      const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };
    
    let body = {
      amount:2,
      businessEntityId: "TSCSLINGNEO" + user?.phone,
      fromEntityId: "TCSLINGNEO",
      businessType: "TSCSLINGNEO" + user?.phone,
      description: "Referral Code",
      toEntityId: "TSCSLINGNEO" + user?.phone,
      productId: "GENERAL",
      fromProductId: "BUSINESS",
      transactionOrigin: "MOBILE",
      externalTransactionId: "TCBALERT" + generateRandomString(7),
      transactionType: "CASHBACK_B2C",
    };
    await Api.call(
      "/api/slingneo/load-wallet",
      "POST",
      body,
      token
    );
    console.log("response");
    showAlert(
      "Success",
      "Referral code applied successfully!",
      "success",
      [
        {
          text: "Continue",
          onPress: () => router.replace("/home")
        }
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <LinearGradient
        colors={["#4F46E5", "#7C3AED"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      >
        <View style={styles.patternOverlay} />
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.logoWrapper}>
            <MaterialCommunityIcons name="gift" size={40} color="#4F46E5" />
            <Text style={styles.appName}>SLING</Text>
          </View>
          <Text style={styles.tagline}>Add Referral Code</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.infoCard}>
            <MaterialCommunityIcons name="information" size={24} color="#4F46E5" />
            <Text style={styles.infoText}>
              Enter a referral code to get exclusive benefits and rewards!
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Referral Code</Text>
            <TextInput
              style={styles.input}
              value={referralCode}
              onChangeText={setReferralCode}
              placeholder="Enter referral code"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={10}
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.skipButton]}
              onPress={handleSkip}
            >
              <Text style={styles.skipButtonText}>Skip for now</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.applyButton,
                (!referralCode.trim() || loading) && styles.buttonDisabled
              ]}
              onPress={handleApplyReferral}
              disabled={!referralCode.trim() || loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.applyButtonText}>Apply Code</Text>
                  <MaterialCommunityIcons
                    name="check"
                    size={20}
                    color="#FFFFFF"
                  />
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Custom Alert */}
      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        buttons={alertConfig.buttons}
        onClose={hideAlert}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: height * 0.35,
  },
  patternOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    opacity: 0.1,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  logoContainer: {
    alignItems: "center",
    marginTop: height * 0.04,
    backgroundColor: "#FFFFFF",
    padding: 24,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  logoWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 16,
    backgroundColor: "#EEF2FF",
  },
  appName: {
    fontSize: 36,
    fontWeight: "800",
    color: "#4F46E5",
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 16,
    color: "#4F46E5",
    marginTop: 8,
    fontWeight: "600",
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  formContainer: {
    flex: 1,
    marginTop: 24,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F9FF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#1E40AF",
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#374151",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  skipButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  skipButtonText: {
    color: "#6B7280",
    fontSize: 16,
    fontWeight: "600",
  },
  applyButton: {
    backgroundColor: "#4F46E5",
  },
  applyButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonDisabled: {
    backgroundColor: "#9CA3AF",
    opacity: 0.7,
  },
}); 