import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Modal,
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

export default function Signup() {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [whatsappOptIn, setWhatsappOptIn] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [showAgeConfirmation, setShowAgeConfirmation] = useState(false);
  const dispatch = useDispatch();
  const { fcmToken, isInitialized } = useFirebaseFCM();

  const pickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Please grant camera roll permissions to select a profile picture."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Please grant camera permissions to take a photo."
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to take photo. Please try again.");
    }
  };

  const showImagePickerOptions = () => {
    Alert.alert(
      "Profile Picture",
      "Choose how you want to add your profile picture",
      [
        { text: "Take Photo", onPress: takePhoto },
        { text: "Choose from Gallery", onPress: pickImage },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const handleSendOtp = async () => {
    // Show age confirmation modal first
    setShowAgeConfirmation(true);
  };

  const handleAgeConfirmation = async (confirmed: boolean) => {
    setShowAgeConfirmation(false);

    if (!confirmed) {
      Alert.alert(
        "Age Restriction",
        "You must be 18 years or older to create an account. Please come back when you meet the age requirement."
      );
      return;
    }

    try {
      setLoading(true);
      console.log("🔥 [Signup] Sending OTP to:", phoneNumber);

      // Validate phone number format
      if (!phoneNumber || phoneNumber.length !== 10) {
        Alert.alert("Error", "Please enter a valid 10-digit phone number.");
        setLoading(false);
        return;
      }

      // Remove any non-digit characters and ensure it's exactly 10 digits
      const cleanPhoneNumber = phoneNumber.replace(/\D/g, "");
      if (cleanPhoneNumber.length !== 10) {
        Alert.alert("Error", "Please enter a valid 10-digit phone number.");
        setLoading(false);
        return;
      }

      // First check if user exists
      const checkUserResponse = await Api.call("/api/auth/check-user", "POST", {
        phone: cleanPhoneNumber,
      });

      if (checkUserResponse.status === 200 || checkUserResponse.status === 201) {
        if (checkUserResponse.data?.exists) {
          Alert.alert(
            "Error",
            checkUserResponse.data?.message || "An account already exists with this phone number. Please login instead."
          );
          setLoading(false);
          return;
        }

        // If user doesn't exist, send OTP via backend API
        console.log(
          "🔥 [Signup] Sending OTP via backend API to:",
          cleanPhoneNumber
        );
        const sendOtpResponse = await Api.call("/api/auth/send-otp", "POST", {
          phone: cleanPhoneNumber,
        });

        if (sendOtpResponse.status === 200 || sendOtpResponse.status === 201) {
          console.log("✅ [Signup] OTP sent successfully");
          setOrderId(sendOtpResponse.data?.orderId);
          setStep(2);
        } else {
          console.log(
            "❌ [Signup] Failed to send OTP:",
            sendOtpResponse.data?.message || sendOtpResponse.error?.response?.data?.message
          );
          Alert.alert(
            "Error",
            sendOtpResponse.data?.message || sendOtpResponse.error?.response?.data?.message || "Failed to send OTP"
          );
        }
      } else {
        Alert.alert("Error", "Failed to verify user. Please try again.");
      }
    } catch (error) {
      console.error("❌ [Signup] Error sending OTP:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    try {
      setLoading(true);
      console.log("🔥 [Signup] Starting signup process...");
      console.log("🔥 [Signup] Push token:", fcmToken);

      // Verify OTP with backend API
      const verifyOtpResponse = await Api.call("/api/auth/verify-otp", "POST", {
        phone: phoneNumber,
        otp: otp,
        orderId: orderId,
      });

      if (
        verifyOtpResponse.status !== 200 ||
        !verifyOtpResponse.data?.verified
      ) {
        Alert.alert(
          "Error",
          verifyOtpResponse.data?.message || verifyOtpResponse.error?.response?.data?.message || "Invalid OTP"
        );
        return;
      }

      console.log("✅ [Signup] OTP verified successfully");

      // Create FormData for file upload
      const formData = new FormData();
      formData.append("name", name);
      formData.append("phone", phoneNumber);
      formData.append("fcmToken", fcmToken || ""); // Include FCM token

      console.log("🔔 [Signup] FCM token being sent:", fcmToken);

      // Add profile image if selected
      if (profileImage) {
        console.log("🔔 [Signup] Adding profile image to form data");
        const imageUri = profileImage;
        const filename = imageUri.split("/").pop() || "profile.jpg";
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : "image/jpeg";

        formData.append("profile", {
          uri: imageUri,
          name: filename,
          type: type,
        } as any);
      }

      console.log("🔔 [Signup] Sending signup request with form data...");
      const signupResponse = await Api.call(
        "/api/auth/signup",
        "POST",
        formData
      );

      if (signupResponse.status === 201) {
        console.log("✅ [Signup] Signup successful");
        console.log("✅ [Signup] Response data:", signupResponse.data);

        // Update FCM token
        await Api.call(
          "/api/auth/update-fcm-token",
          "PUT",
          {
            fcmToken: fcmToken,
          },
          signupResponse.data.token
        );

        dispatch(
          setCredentials({
            token: signupResponse.data?.token,
            user: signupResponse.data?.user,
          })
        );
        console.log("🔔 [Signup] Navigating to KYC onboarding");
        router.replace("/kyc-onboarding");
      } else {
        console.log(
          "❌ [Signup] Signup failed with status:",
          signupResponse.status
        );
        Alert.alert("Error", signupResponse.data?.message || signupResponse.error?.response?.data?.message || "Failed to create account. Please try again.");
      }
    } catch (error) {
      console.error("❌ [Signup] Signup error:", error);
      Alert.alert("Something went wrong. Please try again.");
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
                <Text style={styles.title}>Create Account</Text>
              </View>

              {step === 1 ? (
                <>
                  {/* Profile Picture Section */}
                  <View style={styles.profileSection}>
                    <TouchableOpacity
                      style={styles.profileImageContainer}
                      onPress={showImagePickerOptions}
                    >
                      {profileImage ? (
                        <Image
                          source={{ uri: profileImage }}
                          style={styles.profileImage}
                        />
                      ) : (
                        <View style={styles.profilePlaceholder}>
                          <Ionicons name="person" size={32} color="#8A8D9F" />
                        </View>
                      )}
                      <View style={styles.cameraIconContainer}>
                        <Ionicons name="camera" size={12} color="#FFFFFF" />
                      </View>
                    </TouchableOpacity>
                    <Text style={styles.profileText}>Add Profile Picture</Text>
                  </View>

                  {/* Name Input */}
                  <View style={styles.inputWrapper}>
                    <Text style={styles.label}>Full Name<Text style={styles.required}> *</Text></Text>
                    <View style={styles.inputContainer}>
                      <Ionicons
                        name="person-outline"
                        size={16}
                        color="#8A8D9F"
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="Enter your full name"
                        value={name}
                        onChangeText={setName}
                        placeholderTextColor="#8A8D9F"
                      />
                    </View>
                  </View>

                  {/* Phone Input */}
                  <View style={styles.inputWrapper}>
                    <Text style={styles.label}>Phone Number<Text style={styles.required}> *</Text></Text>
                    <View style={styles.inputContainer}>
                      <Ionicons
                        name="call-outline"
                        size={16}
                        color="#8A8D9F"
                        style={styles.inputIcon}
                      />
                      <View style={styles.phoneInputWrapper}>
                        <Text style={styles.countryCode}>+91</Text>
                        <TextInput
                          style={styles.phoneInput}
                          placeholder="Enter your phone number"
                          keyboardType="phone-pad"
                          value={phoneNumber}
                          onChangeText={setPhoneNumber}
                          placeholderTextColor="#8A8D9F"
                          maxLength={10}
                        />
                      </View>
                    </View>
                  </View>

                  {/* Continue Button */}
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

                  <TouchableOpacity
                    style={[
                      styles.button,
                      (!name || !phoneNumber || !whatsappOptIn || loading) &&
                      styles.buttonDisabled,
                    ]}
                    onPress={handleSendOtp}
                    disabled={
                      !name || !phoneNumber || !whatsappOptIn || loading
                    }
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
                    <View style={styles.otpIconContainer}>
                      <MaterialCommunityIcons
                        name="shield-lock-outline"
                        size={32}
                        color="#667eea"
                      />
                    </View>
                    <Text style={styles.otpTitle}>Verify Your Phone</Text>
                    <Text style={styles.otpSubtitle}>
                      We've sent a 4-digit code to +91 {phoneNumber}
                    </Text>
                  </View>

                  <View style={styles.inputWrapper}>
                    <Text style={styles.label}>Enter OTP<Text style={styles.required}> *</Text></Text>
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

                  {/* Resend OTP */}
                  <TouchableOpacity style={styles.resendContainer}>
                    <Text style={styles.resendText}>
                      Didn't receive the code?{" "}
                    </Text>
                    <Text style={styles.resendLink}>Resend</Text>
                  </TouchableOpacity>

                  {/* Create Account Button */}
                  <TouchableOpacity
                    style={[
                      styles.button,
                      (!otp || loading) && styles.buttonDisabled,
                    ]}
                    onPress={handleSignup}
                    disabled={!otp || loading}
                  >
                    <Text style={styles.buttonText}>
                      {loading ? "Creating Account..." : "Create Account"}
                    </Text>
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={16}
                      color="#FFFFFF"
                      style={styles.buttonIcon}
                    />
                  </TouchableOpacity>

                  {/* Back to Step 1 */}
                  <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => setStep(1)}
                  >
                    <Ionicons name="arrow-back" size={14} color="#667eea" />
                    <Text style={styles.backButtonText}>Back</Text>
                  </TouchableOpacity>
                </>
              )}

              {/* WhatsApp Opt-in Section */}
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

              {/* Login Link */}
              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => router.push("/login")}>
                  <Text style={styles.loginLink}>Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Age Confirmation Modal */}
      <Modal
        visible={showAgeConfirmation}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAgeConfirmation(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIconContainer}>
                <Ionicons name="shield-checkmark" size={32} color="#667eea" />
              </View>
              <Text style={styles.modalTitle}>Age Verification</Text>
              <Text style={styles.modalSubtitle}>
                You must be 18 years or older to use Sling and issue PPI cards.
              </Text>
            </View>

            <View style={styles.modalContent}>
              <Text style={styles.modalDescription}>
                As per regulatory requirements, PPI cards can only be issued to individuals above 18 years of age. Please confirm that you meet this requirement.
              </Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => handleAgeConfirmation(false)}
              >
                <Text style={styles.modalCancelText}>I'm under 18</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={() => handleAgeConfirmation(true)}
              >
                <Text style={styles.modalConfirmText}>I'm 18 or older</Text>
                <Ionicons
                  name="checkmark"
                  size={16}
                  color="#FFFFFF"
                  style={styles.modalButtonIcon}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    marginTop: height * 0.05,
    marginBottom: 16,
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
  profileSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: 10,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F5F7FA",
  },
  profilePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F5F7FA",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#E8ECF3",
    borderStyle: "dashed",
  },
  cameraIconContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#667eea",
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  profileText: {
    fontSize: 12,
    color: "#8A8D9F",
    fontWeight: "500",
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
  required: {
    color: "#E53E3E",
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
  phoneInputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  countryCode: {
    fontSize: 14,
    color: "#1A1F36",
    fontWeight: "600",
    paddingHorizontal: 6,
    borderRightWidth: 1,
    borderRightColor: "#E8ECF3",
    fontFamily: "SpaceMono-Regular",
  },
  phoneInput: {
    flex: 1,
    padding: 12,
    fontSize: 14,
    color: "#1A1F36",
    fontFamily: "SpaceMono-Regular",
  },
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
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
    marginTop: 12,
    padding: 10,
  },
  backButtonText: {
    color: "#667eea",
    fontWeight: "600",
    fontSize: 12,
    marginLeft: 4,
    fontFamily: "SpaceMono-Regular",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
  },
  loginText: {
    color: "#8A8D9F",
    fontSize: 12,
    fontFamily: "SpaceMono-Regular",
  },
  loginLink: {
    color: "#667eea",
    fontWeight: "600",
    fontSize: 12,
    fontFamily: "SpaceMono-Regular",
  },
  optInSection: {
    marginTop: 20,
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
  // Age Confirmation Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  modalIconContainer: {
    backgroundColor: "#F0F4FF",
    borderRadius: 20,
    padding: 12,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1F36",
    marginBottom: 8,
    textAlign: "center",
    fontFamily: "SpaceMono-Regular",
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#8A8D9F",
    textAlign: "center",
    lineHeight: 20,
    fontFamily: "SpaceMono-Regular",
  },
  modalContent: {
    marginBottom: 24,
  },
  modalDescription: {
    fontSize: 13,
    color: "#4A5568",
    textAlign: "center",
    lineHeight: 18,
    fontFamily: "SpaceMono-Regular",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8ECF3",
  },
  modalCancelText: {
    color: "#8A8D9F",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "SpaceMono-Regular",
  },
  modalConfirmButton: {
    flex: 1,
    backgroundColor: "#667eea",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    shadowColor: "#667eea",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  modalConfirmText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "SpaceMono-Regular",
  },
  modalButtonIcon: {
    marginLeft: 6,
  },
});
