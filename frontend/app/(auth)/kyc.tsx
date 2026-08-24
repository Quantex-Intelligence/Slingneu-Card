import { setUser } from "@/store/slices/authSlice";
import { RootState } from "@/store/store";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, Stack } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
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
import { useDispatch, useSelector } from "react-redux";
import {
  AddressStep,
  CommunicationStep,
  KYCDetailsStep,
  PersonalInfoStep,
  StepIndicator,
} from "../../components/KYCSteps";
import Api from "../../config/Api";
import { isAbove18 } from "../../utils/ageValidation";
import { validatePAN } from "../../utils/panValidation";

const { height } = Dimensions.get("window");

const STEPS = {
  PERSONAL_INFO: 0,
  ADDRESS: 1,
  KYC_DETAILS: 2,
  COMMUNICATION: 3,
};

export default function Kyc() {
  const [currentStep, setCurrentStep] = useState(STEPS.PERSONAL_INFO);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const { user, token } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  // Form state
  const [formData, setFormData] = useState({
    entityId: "TSCSLINGNEO" + user?.phone || "",
    channelName: "MIN_KYC",
    entityType: "CUSTOMER",
    businessType: "TCSLINGNEO",
    businessId: "TSCSLINGNEO" + user?.phone || "",
    title: "",
    otp: "",
    firstName: user?.name?.split(" ")[0] || "",
    middleName: "",
    lastName: user?.name?.split(" ").slice(1).join(" ") || "",
    gender: "",
    isNRICustomer: false,
    isMinor: false,
    isDependant: false,
    maritalStatus: "",
    countryCode: "91",
    employmentIndustry: "INFORMATION_TECHNOLOGY",
    employmentType: "",
    plasticCode: "TYPE1",
    addressInfo: [
      {
        addressCategory: "PERMANENT",
        address1: "",
        address2: "",
        address3: "",
        city: "",
        state: "",
        country: "INDIA",
        pinCode: "",
      },
    ],
    communicationInfo: [
      {
        contactNo: "+91" + user?.phone || "",
        notification: true,
        emailId: "",
      },
    ],
    kitInfo: [
      {
        cardType: "VIRTUAL",
        cardCategory: "PREPAID",
        cardRegStatus: "ACTIVE",
        aliasName: "",
        kitNo: "",
      },
    ],
    kycInfo: [
      {
        documentType: "PAN",
        documentNo: "",
      },
    ],
    dateInfo: [
      {
        dateType: "DOB",
        date: "",
      },
    ],
  });

  const handleInputChange = (
    field: string,
    value: string | { dateType: string; date: string }[]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddressChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      addressInfo: [
        {
          ...prev.addressInfo[0],
          [field]: value,
        },
      ],
    }));
  };

  const handleCommunicationChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      communicationInfo: [
        {
          ...prev.communicationInfo[0],
          [field]: value,
        },
      ],
    }));
  };

  const handleKYCChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      kycInfo: [
        {
          ...prev.kycInfo[0],
          [field]: value,
        },
      ],
    }));
  };

  const handleKitInfoChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      kitInfo: [
        {
          ...prev.kitInfo[0],
          [field]: value,
        },
      ],
    }));
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case STEPS.PERSONAL_INFO:
        return (
          formData.title &&
          formData.firstName &&
          formData.gender &&
          formData.employmentType &&
          formData.dateInfo[0].date &&
          isAbove18(formData.dateInfo[0].date) &&
          (formData.kitInfo[0].cardType === "VIRTUAL" ||
            (formData.kitInfo[0].cardType === "PHYSICAL" && formData.kitInfo[0].kitNo))
        );
      case STEPS.ADDRESS:
        return (
          formData.addressInfo[0].address1 &&
          formData.addressInfo[0].city &&
          formData.addressInfo[0].state &&
          formData.addressInfo[0].pinCode
        );
      case STEPS.COMMUNICATION:
        return formData.communicationInfo[0].emailId && formData.otp;
      case STEPS.KYC_DETAILS:
        return (
          Boolean(formData.kycInfo[0].documentType) &&
          Boolean(formData.kycInfo[0].documentNo) &&
          (formData.kycInfo[0].documentType !== "PAN"
            ? formData.kycInfo[0].documentNo.length >= 8
            : (validatePAN(formData.kycInfo[0].documentNo) || formData.kycInfo[0].documentNo.length >= 8))
        );
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      // Prepare the payload based on card type
      const payload = { ...formData };

      if (formData.kitInfo[0].cardType === "PHYSICAL") {
        // For PHYSICAL card, include both cardType and kitNo
        payload.kitInfo = [
          {
            ...formData.kitInfo[0],
            cardType: "PHYSICAL",
            kitNo: formData.kitInfo[0].kitNo,
          },
        ];
      } else {
        // For VIRTUAL card, only include cardType
        payload.kitInfo = [
          {
            ...formData.kitInfo[0],
            cardType: "VIRTUAL",
            kitNo: "", // Empty string for virtual cards
          },
        ];
      }

      const response = await Api.call(
        "/api/slingneo/register",
        "POST",
        payload
      );
      if (response.status === 200 || response.status === 201) {
        let kycData = {
          ...formData,
          ...response?.data.result,
        };
        let body = { kycDetails: kycData, isKyc: true };

        let profileResponse = await Api.call(
          "/api/auth/update-profile",
          "PUT",
          body,
          token
        );
        if (profileResponse.status === 200 || profileResponse.status === 201) {
          dispatch(setUser(profileResponse.data.user));
          router.replace("/kyc-submitted");
        } else {
          Alert.alert("Error", profileResponse.data?.message || profileResponse.error?.response?.data?.message || "Failed to update profile. Please try again.");
        }
      } else {
        Alert.alert("Error", response.data?.message || response.error?.response?.data?.message || "Registration failed. Please try again.");
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = async () => {
    if (currentStep === STEPS.COMMUNICATION) {
      if (!formData.communicationInfo[0].emailId || !formData.otp) {
        Alert.alert("Validation Error", "Please enter your Email and OTP to proceed.");
        return;
      }
    }

    if (currentStep === STEPS.PERSONAL_INFO) {
      if (!(formData.title && formData.firstName && formData.gender && formData.employmentType && formData.dateInfo[0].date)) {
        Alert.alert("Validation Error", "Please fill all required fields before proceeding.");
        return;
      }
      if (!isAbove18(formData.dateInfo[0].date)) {
        Alert.alert("Age Restriction", "You must be 18 years or older to apply for a PPI card.");
        return;
      }
    }

    if (!validateCurrentStep()) {
      Alert.alert(
        "Validation Error",
        "Please fill all required fields before proceeding."
      );
      return;
    }

    if (currentStep === STEPS.KYC_DETAILS && formData.kycInfo[0].documentType === "PAN") {
      try {
        setLoading(true);
        const response = await Api.call("/api/slingneo/validate-pan", "POST", {
          pan: formData.kycInfo[0].documentNo,
          name: `${formData.firstName} ${formData.lastName}`,
          mobile: user?.phone,
        });

        if (response.status === 200 || response.status === 201) {
          // Successfully verified, auto-fill the form with verified data
          const verifiedData = response.data?.data?.panPlusData;
          if (verifiedData) {
            const splitName = verifiedData.userFullNameSplit || [];
            const firstName = splitName[0] || "";
            const lastName = splitName[splitName.length - 1] || "";
            
            // Convert DD-MM-YYYY to YYYY-MM-DD
            let formattedDob = "";
            if (verifiedData.userDob && verifiedData.userDob.includes('-')) {
              formattedDob = verifiedData.userDob.split('-').reverse().join('-');
            }

            setFormData(prev => ({
              ...prev,
              firstName: firstName || prev.firstName,
              lastName: lastName || prev.lastName,
              dateInfo: formattedDob ? [{
                dateType: "DOB",
                date: formattedDob
              }] : prev.dateInfo
            }));
          }
        }
      } catch (error: any) {
        console.warn("PAN validation notice:", error?.message);
      } finally {
        setLoading(false);
      }
    }

    if (currentStep < Object.keys(STEPS).length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      Alert.alert(
        "Go Back",
        "Are you sure you want to go back? Your data might be lost.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Go Back", onPress: () => setCurrentStep(currentStep - 1) },
        ]
      );
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case STEPS.COMMUNICATION:
        return (
          <CommunicationStep
            communicationInfo={formData.communicationInfo[0]}
            otp={formData.otp}
            onCommunicationChange={handleCommunicationChange}
            onOtpChange={(value) => handleInputChange("otp", value)}
          />
        );
      case STEPS.PERSONAL_INFO:
        return (
          <View style={styles.stepContainer}>
            {/* Card Type Selection */}
            <View style={styles.cardTypeContainer}>
              <Text style={styles.sectionTitle}>Card Type</Text>
              <View style={styles.radioContainer}>
                <TouchableOpacity
                  style={[
                    styles.radioButton,
                    formData.kitInfo[0].cardType === "VIRTUAL" && styles.radioButtonSelected,
                  ]}
                  onPress={() => handleKitInfoChange("cardType", "VIRTUAL")}
                >
                  <View style={[
                    styles.radioCircle,
                    formData.kitInfo[0].cardType === "VIRTUAL" && styles.radioCircleSelected,
                  ]}>
                    {formData.kitInfo[0].cardType === "VIRTUAL" && (
                      <View style={styles.radioCircleInner} />
                    )}
                  </View>
                  <Text style={styles.radioLabel}>Virtual Card</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.radioButton,
                    formData.kitInfo[0].cardType === "PHYSICAL" && styles.radioButtonSelected,
                  ]}
                  onPress={() => handleKitInfoChange("cardType", "PHYSICAL")}
                >
                  <View style={[
                    styles.radioCircle,
                    formData.kitInfo[0].cardType === "PHYSICAL" && styles.radioCircleSelected,
                  ]}>
                    {formData.kitInfo[0].cardType === "PHYSICAL" && (
                      <View style={styles.radioCircleInner} />
                    )}
                  </View>
                  <Text style={styles.radioLabel}>Physical Card</Text>
                </TouchableOpacity>
              </View>

              {/* Kit Number Input for Physical Card */}
              {formData.kitInfo[0].cardType === "PHYSICAL" && (
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Kit Number *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter your kit number"
                    value={formData.kitInfo[0].kitNo}
                    onChangeText={(text) => handleKitInfoChange("kitNo", text)}
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              )}
            </View>

            <PersonalInfoStep
              formData={{
                title: formData.title,
                firstName: formData.firstName,
                lastName: formData.lastName,
                gender: formData.gender,
                maritalStatus: formData.maritalStatus,
                employmentType: formData.employmentType,
                dateInfo: formData.dateInfo,
              }}
              onInputChange={handleInputChange}
              isDatePickerVisible={isDatePickerVisible}
              setDatePickerVisible={setDatePickerVisible}
            />
          </View>
        );
      case STEPS.ADDRESS:
        return (
          <AddressStep
            addressInfo={formData.addressInfo[0]}
            onAddressChange={handleAddressChange}
          />
        );
      case STEPS.KYC_DETAILS:
        return (
          <KYCDetailsStep
            kycInfo={formData.kycInfo[0]}
            onKYCChange={handleKYCChange}
          />
        );
      default:
        return null;
    }
  };

  useEffect(() => {
    if (currentStep === STEPS.COMMUNICATION) {
      sendRequest();
    }
  }, [currentStep]);

  const sendRequest = async () => {
    try {
      setLoading(true);
      await Api.call("/api/slingneo/generate-otp", "POST", {
        mobileNumber: "+91" + user?.phone,
        entityId: "TSCSLINGNEO" + user?.phone,
      });
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitting) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={["#4F46E5", "#7C3AED"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.loadingBackground}
        >
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={styles.loadingText}>
              Verifying your KYC, please wait...
            </Text>
            <View style={styles.progressBar}>
              <Animated.View style={styles.progressFill} />
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  }

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
          <Image
            source={require("../../assets/images/icon.png")}
            style={{
              width: 80,
              height: 80,
              resizeMode: "contain",
            }}
          />
          <Text style={styles.tagline}>Complete Your KYC</Text>
        </View>

        <Animated.View style={[styles.formContainer]}>
          <StepIndicator currentStep={currentStep} />

          <ScrollView
            style={styles.stepContent}
            showsVerticalScrollIndicator={false}
          >
            {renderCurrentStep()}
          </ScrollView>

          <View style={styles.buttonContainer}>
            {currentStep > 0 && (
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={handleBack}
              >
                <MaterialCommunityIcons
                  name="arrow-left"
                  size={20}
                  color="#4F46E5"
                />
                <Text style={styles.secondaryButtonText}>Back</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.button,
                (!validateCurrentStep() || loading) && styles.buttonDisabled,
              ]}
              onPress={handleNext}
              disabled={!validateCurrentStep() || loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.buttonText}>
                    {currentStep === Object.keys(STEPS).length - 1
                      ? "Submit"
                      : "Next"}
                  </Text>
                  <MaterialCommunityIcons
                    name={
                      currentStep === Object.keys(STEPS).length - 1
                        ? "check"
                        : "arrow-right"
                    }
                    size={20}
                    color="#FFFFFF"
                  />
                </>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
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
    height: height * 0.28,
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
    padding: 10,
    borderRadius: 24,
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
    marginTop: 5,
  },
  stepContent: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
    padding: 10,
    borderRadius: 16,
  },
  button: {
    backgroundColor: "#4F46E5",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    flex: 1,
    marginLeft: 12,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  secondaryButton: {
    backgroundColor: "#FFFFFF",
    marginLeft: 0,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonDisabled: {
    backgroundColor: "#9CA3AF",
    opacity: 0.7,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButtonText: {
    color: "#4F46E5",
  },
  stepContainer: {
    flex: 1,
  },
  cardTypeContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8, // reduced from 12
    padding: 8, // reduced from 16
    marginBottom: 8, // reduced from 16
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 }, // reduced shadow
    shadowOpacity: 0.08, // reduced shadow
    shadowRadius: 2, // reduced shadow
    elevation: 1, // reduced shadow
  },
  sectionTitle: {
    fontSize: 14, // reduced from 16
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6, // reduced from 12
  },
  radioContainer: {
    gap: 6, // reduced from 12
  },
  radioButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4, // reduced from 8
  },
  radioButtonSelected: {
    backgroundColor: "#EEF2FF",
    borderRadius: 6, // reduced from 8
    paddingHorizontal: 4, // reduced from 8
  },
  radioCircle: {
    width: 16, // reduced from 20
    height: 16, // reduced from 20
    borderRadius: 8, // reduced from 10
    borderWidth: 2,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8, // reduced from 12
  },
  radioCircleSelected: {
    borderColor: "#4F46E5",
  },
  radioCircleInner: {
    width: 6, // reduced from 8
    height: 6, // reduced from 8
    borderRadius: 3, // reduced from 4
    backgroundColor: "#4F46E5",
  },
  radioLabel: {
    fontSize: 12, // reduced from 14
    fontWeight: "500",
    color: "#374151",
  },
  inputContainer: {
    marginTop: 8, // reduced from 16
  },
  inputLabel: {
    fontSize: 12, // reduced from 14
    fontWeight: "500",
    color: "#374151",
    marginBottom: 4, // reduced from 8
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 6, // reduced from 8
    paddingHorizontal: 8, // reduced from 12
    paddingVertical: 8, // reduced from 12
    fontSize: 12, // reduced from 14
    color: "#374151",
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
  },
  loadingBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContent: {
    alignItems: "center",
    padding: 40,
  },
  loadingText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 20,
    textAlign: "center",
  },
  progressBar: {
    width: 200,
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 2,
    marginTop: 20,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 2,
    width: "80%",
  },
});
