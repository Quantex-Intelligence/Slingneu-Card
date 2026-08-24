import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch } from "react-redux";
import Api from "../../config/Api";
import { useFirebaseFCM } from "../../hooks/useFirebaseFCM";
import { setCredentials } from "../../store/slices/authSlice";

const { width, height } = Dimensions.get("window");

export default function Login() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [whatsappOptIn, setWhatsappOptIn] = useState(false);
  const [orderId, setOrderId] = useState("");
  const dispatch = useDispatch();
  const { fcmToken, isInitialized, testFCMToken, getTokenStatus } =
    useFirebaseFCM();

  // Log token status when component mounts
  useEffect(() => {
    const logTokenStatus = async () => {
      console.log(
        "🔥 [Firebase FCM Login] Component mounted, checking FCM token status..."
      );
      const status = await getTokenStatus();
      if (status) {
        console.log("📊 [Firebase FCM Login] Initial FCM token status:", {
          hasToken: status.hasToken,
          isFirebase: status.isFirebase,
          tokenPreview: status.token
            ? `${status.token.substring(0, 20)}...`
            : "null",
          platform: status.platform,
        });
      }
    };

    logTokenStatus();
  }, []);

  const handleSendOtp = async () => {
    try {
      setLoading(true);
      console.log("🔥 [Login] Sending OTP to:", phoneNumber);

      // First check if user exists
      const checkUserResponse = await Api.call("/api/auth/check-user", "POST", {
        phone: phoneNumber,
      });

      if (checkUserResponse.status === 200 || checkUserResponse.status === 201) {
        if (!checkUserResponse.data?.exists) {
          Alert.alert(
            "Error",
            checkUserResponse.data?.message || "No account found with this phone number. Please sign up first."
          );
          setLoading(false);
          return;
        }

        // If user exists, send OTP via backend API
        const sendOtpResponse = await Api.call("/api/auth/send-otp", "POST", {
          phone: phoneNumber,
        });

        if (sendOtpResponse.status === 200 || sendOtpResponse.status === 201) {
          console.log("✅ [Login] OTP sent successfully");
          setOrderId(sendOtpResponse.data?.orderId);
          setShowOtpInput(true);
        } else {
          console.log(
            "❌ [Login] Failed to send OTP:",
            sendOtpResponse.data?.message || sendOtpResponse.error?.response?.data?.message
          );
          Alert.alert("Error", sendOtpResponse.data?.message || sendOtpResponse.error?.response?.data?.message || "Failed to send OTP");
        }
      } else {
        Alert.alert("Error", "Failed to verify user. Please try again.");
      }
    } catch (error) {
      console.error("❌ [Login] Error sending OTP:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      setLoading(true);
      console.log("🔥 [Login] Starting login process...");
      console.log("🔥 [Login] Push token:", fcmToken);


      const loginData = {
        phone: phoneNumber,
        otp: otp,
        orderId: orderId,
        fcmToken: fcmToken,
      };

      const response = await Api.call("/api/auth/login", "POST", loginData);

      // Update FCM token after successful login
      if (response.status === 200 || response.status === 201) {
        await Api.call(
          "/api/auth/update-fcm-token",
          "PUT",
          {
            fcmToken: fcmToken,
          },
          response.data.token
        );

        console.log("✅ [Login] Login successful");
        console.log("✅ [Login] Response data:", response.data);

        dispatch(
          setCredentials({
            token: response.data?.token,
            user: response.data?.user,
          })
        );

        if (!response.data.user.isKyc) {
          console.log(
            "🔥 [Login] User needs KYC, navigating to KYC onboarding"
          );
          router.replace("/kyc-onboarding");
        } else {
          console.log(
            "🔥 [Login] User KYC complete, navigating to home"
          );
          router.replace("/home");
        }
      } else {
        Alert.alert("Error", response.data?.message || response.error?.response?.data?.message || "Invalid OTP");
      }
    } catch (error) {
      console.error("❌ [Login] Login error:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
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
        colors={["#667eea", "#764ba2"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      >
        <View style={styles.patternOverlay} />
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Header Section */}
          <View style={styles.headerSection}>
            <Image
              source={require("../../assets/images/icon.png")}
              style={{
                width: 80,
                height: 80,
                resizeMode: "contain",
              }}
            />
          </View>

          {/* Form Section */}
          <View style={{ flex: 1, justifyContent: "center" }}>
            <View style={styles.formContainer}>
              <View style={styles.formHeader}>
                <Text style={styles.title}>Welcome Back</Text>
                <Text style={styles.subtitle}>
                  Sign in to continue your journey
                </Text>
              </View>

              {!showOtpInput ? (
                <>
                  {/* Phone Input */}
                  <View style={styles.inputWrapper}>
                    <Text style={styles.label}>Phone Number</Text>
                    <View style={styles.inputContainer}>
                      <Ionicons
                        name="call-outline"
                        size={16}
                        color="#8A8D9F"
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="Enter your phone number"
                        keyboardType="phone-pad"
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                        placeholderTextColor="#8A8D9F"
                        maxLength={10}
                      />
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.checkboxContainer}
                    onPress={() => setWhatsappOptIn(!whatsappOptIn)}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        whatsappOptIn && styles.checkboxChecked,
                      ]}
                    >
                      {whatsappOptIn && (
                        <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                      )}
                    </View>
                    <Text style={styles.checkboxText}>
                      I agree to receive updates via WhatsApp
                    </Text>
                  </TouchableOpacity>

                  <View style={styles.optInSection}>
                    <View style={styles.termsContainer}>
                      <Text style={styles.termsText}>
                        By proceeding, you agree to our transcorp{" "}
                        <Text
                          style={styles.termsLink}
                          onPress={() =>
                            router.push({
                              pathname: "/webview",
                              params: {
                                url: "https://transcorpint.com/ppi-policies-and-tc/",
                                title: "Terms & Conditions",
                              },
                            })
                          }
                        >
                          Terms & Conditions
                        </Text>
                      </Text>
                    </View>
                  </View>
                  {/* Continue Button */}
                  <TouchableOpacity
                    style={[
                      styles.button,
                      (!phoneNumber || !whatsappOptIn || loading) &&
                      styles.buttonDisabled,
                    ]}
                    onPress={handleSendOtp}
                    disabled={!phoneNumber || !whatsappOptIn || loading}
                  >
                    <Text style={styles.buttonText}>
                      {loading ? "Sending OTP..." : "Continue"}
                    </Text>
                    <Ionicons
                      name="arrow-forward"
                      size={16}
                      color="#FFFFFF"
                      style={styles.buttonIcon}
                    />
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  {/* OTP Section */}
                  <View style={styles.otpSection}>
                    <Text style={styles.otpTitle}>Verify Your Phone</Text>
                    <Text style={styles.otpSubtitle}>
                      We've sent a 4-digit code to {phoneNumber}
                    </Text>
                  </View>

                  {/* OTP Input */}
                  <View style={styles.inputWrapper}>
                    <Text style={styles.label}>Enter OTP</Text>
                    <View style={styles.inputContainer}>
                      <MaterialCommunityIcons
                        name="shield-lock-outline"
                        size={16}
                        color="#8A8D9F"
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="Enter 4-digit OTP"
                        keyboardType="number-pad"
                        value={otp}
                        onChangeText={setOtp}
                        placeholderTextColor="#8A8D9F"
                        maxLength={4}
                      />
                    </View>
                  </View>

                  {/* Login Button */}
                  <TouchableOpacity
                    style={[
                      styles.button,
                      (!otp || loading) && styles.buttonDisabled,
                    ]}
                    onPress={handleLogin}
                    disabled={!otp || loading}
                  >
                    <Text style={styles.buttonText}>
                      {loading ? "Verifying..." : "Verify & Login"}
                    </Text>
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={16}
                      color="#FFFFFF"
                      style={styles.buttonIcon}
                    />
                  </TouchableOpacity>

                  {/* Resend OTP Section */}
                  <View style={styles.resendContainer}>
                    <Text style={styles.resendText}>
                      Didn't receive the code?{" "}
                    </Text>
                    <TouchableOpacity
                      onPress={handleSendOtp}
                      disabled={loading}
                    >
                      <Text style={styles.resendLink}>Resend OTP</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Back to Phone Input */}
                  <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => setShowOtpInput(false)}
                  >
                    <Ionicons name="arrow-back" size={14} color="#667eea" />
                    <Text style={styles.backButtonText}>Back</Text>
                  </TouchableOpacity>
                </>
              )}

              {/* WhatsApp Opt-in Section */}


              {/* Sign Up Link */}
              <View style={styles.registerContainer}>
                <Text style={styles.registerText}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => router.push("/signup")}>
                  <Text style={styles.registerLink}>Sign Up</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.activateCardButton}
                onPress={() => router.push("/signup")}
              >
                <Text style={styles.activateCardButtonText}>
                  Activate Your Card
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: height,
  },
  patternOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    opacity: 0.1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  headerSection: {
    alignItems: "center",
    marginTop: 30,
  },
  logoContainer: {
    alignItems: "center",
  },
  logoWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    padding: 12,
    borderRadius: 16,
    backdropFilter: "blur(10px)",
  },
  appName: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 2,
    fontFamily: "SpaceMono-Regular",
  },
  tagline: {
    fontSize: 14,
    color: "#FFFFFF",
    marginTop: 10,
    opacity: 0.9,
    fontWeight: "500",
    fontFamily: "SpaceMono-Regular",
  },
  formContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  formHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1A1F36",
    marginBottom: 6,
    fontFamily: "SpaceMono-Regular",
  },
  subtitle: {
    fontSize: 14,
    color: "#8A8D9F",
    textAlign: "center",
    fontFamily: "SpaceMono-Regular",
  },
  otpSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  otpIconContainer: {
    backgroundColor: "#F0F4FF",
    borderRadius: 20,
    padding: 12,
    marginBottom: 12,
  },
  otpTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1F36",
    marginBottom: 6,
    fontFamily: "SpaceMono-Regular",
  },
  otpSubtitle: {
    fontSize: 12,
    color: "#8A8D9F",
    textAlign: "center",
    lineHeight: 18,
    fontFamily: "SpaceMono-Regular",
  },
  inputWrapper: {
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    color: "#1A1F36",
    marginBottom: 6,
    fontWeight: "600",
    fontFamily: "SpaceMono-Regular",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8ECF3",
  },
  inputIcon: {
    padding: 12,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 14,
    color: "#1A1F36",
    fontFamily: "SpaceMono-Regular",
  },
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
    marginTop: 5,
  },
  resendText: {
    color: "#8A8D9F",
    fontSize: 12,
    fontFamily: "SpaceMono-Regular",
  },
  resendLink: {
    color: "#667eea",
    fontWeight: "600",
    fontSize: 12,
    fontFamily: "SpaceMono-Regular",
  },
  button: {
    backgroundColor: "#667eea",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 6,
    flexDirection: "row",
    justifyContent: "center",
    shadowColor: "#667eea",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: "#8A8D9F",
    opacity: 0.7,
  },
  buttonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "SpaceMono-Regular",
  },
  buttonIcon: {
    marginLeft: 6,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonText: {
    color: "#667eea",
    fontWeight: "600",
    fontSize: 12,
    marginLeft: 4,
    fontFamily: "SpaceMono-Regular",
  },

  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12,
  },
  registerText: {
    color: "#8A8D9F",
    fontSize: 12,
    fontFamily: "SpaceMono-Regular",
  },
  registerLink: {
    color: "#667eea",
    fontWeight: "600",
    fontSize: 12,
    fontFamily: "SpaceMono-Regular",
  },
  optInSection: {
  },
  optInHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  optInTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1F36",
    marginLeft: 6,
    flex: 1,
    fontFamily: "SpaceMono-Regular",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderWidth: 2,
    borderColor: "#8A8D9F",
    borderRadius: 3,
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: "#667eea",
    borderColor: "#667eea",
  },
  checkboxText: {
    color: "#4A5568",
    fontSize: 12,
    flex: 1,
    fontFamily: "SpaceMono-Regular",
  },
  termsContainer: {
    alignItems: "center",
  },
  termsText: {
    color: "#8A8D9F",
    fontSize: 10,
    textAlign: "center",
    lineHeight: 16,
    fontFamily: "SpaceMono-Regular",
  },
  termsLink: {
    color: "#667eea",
    fontWeight: "600",
    fontSize: 10,
    fontFamily: "SpaceMono-Regular",
  },
  activateCardContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    alignItems: "center",
  },
  activateCardButton: {
    backgroundColor: "#764ba2",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#764ba2",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 2,
    marginTop: 20
  },
  activateCardButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "SpaceMono-Regular",
  },
});
