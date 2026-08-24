import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, Text, TextInput, View } from "react-native";

interface CommunicationStepProps {
  communicationInfo: {
    contactNo: string;
    emailId: string;
  };
  otp: string;
  onCommunicationChange: (field: string, value: string) => void;
  onOtpChange: (value: string) => void;
}

export default function CommunicationStep({
  communicationInfo,
  otp,
  onCommunicationChange,
  onOtpChange,
}: CommunicationStepProps) {
  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Communication Details</Text>

      <View style={styles.inputWrapper}>
        <Text style={styles.label}>Phone Number <Text style={styles.required}>*</Text></Text>
        <View style={styles.inputContainer}>
          <MaterialCommunityIcons
            name="phone"
            size={24}
            color="#6c56f9"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Enter phone number"
            value={communicationInfo.contactNo}
            onChangeText={(value) =>
              onCommunicationChange("contactNo", value)
            }
            keyboardType="phone-pad"
          />
        </View>
      </View>

      <View style={styles.inputWrapper}>
        <Text style={styles.label}>OTP <Text style={styles.required}>*</Text></Text>
        <View style={styles.inputContainer}>
          <MaterialCommunityIcons
            name="key"
            size={24}
            color="#6c56f9"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Enter OTP"
            value={otp}
            onChangeText={(value) => onOtpChange(value)}
            keyboardType="numeric"
            maxLength={6}
          />
        </View>
      </View>

      <View style={styles.inputWrapper}>
        <Text style={styles.label}>Email <Text style={styles.required}>*</Text></Text>
        <View style={styles.inputContainer}>
          <MaterialCommunityIcons
            name="email"
            size={24}
            color="#6c56f9"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Enter email address"
            value={communicationInfo.emailId}
            onChangeText={(value) =>
              onCommunicationChange("emailId", value)
            }
            keyboardType="email-address"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stepContainer: {
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    shadowColor: "#7b61ff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 4,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#7b61ff",
    marginBottom: 16,
    textAlign: "center",
  },
  inputWrapper: {
    marginBottom: 12,
  },
  label: {
    fontSize: 11,
    color: "#7b61ff",
    marginBottom: 4,
    fontWeight: "600",
  },
  required: {
    color: "#EF4444",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 10,
    minHeight: 40,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    padding: 10,
    fontSize: 13,
    color: "#1F2937",
  },
}); 