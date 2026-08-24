import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";

interface KYCDetailsStepProps {
  kycInfo: {
    documentType: string;
    documentNo: string;
  };
  onKYCChange: (field: string, value: string) => void;
}

const DOCUMENT_TYPES = [
  { label: "PAN Card", value: "PAN" },
];

export default function KYCDetailsStep({
  kycInfo,
  onKYCChange,
}: KYCDetailsStepProps) {

  const handleDocumentTypeChange = (value: string) => {
    onKYCChange("documentType", value);
  };

  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>KYC Details</Text>

      <View style={styles.inputWrapper}>
        <Text style={styles.label}>Document Type <Text style={styles.required}>*</Text></Text>
        <View style={styles.pickerContainer}>
          <MaterialCommunityIcons
            name="file-document"
            size={24}
            color="#6c56f9"
            style={styles.inputIcon}
          />
          <Picker
            selectedValue={kycInfo.documentType}
            onValueChange={handleDocumentTypeChange}
            style={styles.picker}
            enabled={false}
          >
            {DOCUMENT_TYPES.map((type) => (
              <Picker.Item key={type.value} label={type.label} value={type.value} />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.inputWrapper}>
        <Text style={styles.label}>PAN Number <Text style={styles.required}>*</Text></Text>
        <View style={styles.inputContainer}>
          <MaterialCommunityIcons
            name="card-account-details"
            size={24}
            color="#6c56f9"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Enter PAN number"
            value={kycInfo.documentNo}
            onChangeText={(value) => onKYCChange("documentNo", value.toUpperCase())}
            maxLength={10}
            autoCapitalize="characters"
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
  pickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 10,
    minHeight: 40,
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
  picker: {
    flex: 1,
    color: "#1F2937",
    fontSize: 13,
  },
  input: {
    flex: 1,
    padding: 10,
    fontSize: 13,
    color: "#1F2937",
  },
  placeholder: {
    color: "#9CA3AF",
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#EEF2FF",
    padding: 10,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#7b61ff",
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 11,
    color: "#7b61ff",
    lineHeight: 16,
  },
}); 