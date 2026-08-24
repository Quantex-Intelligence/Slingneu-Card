import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

interface AddressStepProps {
  addressInfo: {
    address1: string;
    address2: string;
    address3: string;
    city: string;
    state: string;
    pinCode: string;
  };
  onAddressChange: (field: string, value: string) => void;
}

export default function AddressStep({
  addressInfo,
  onAddressChange,
}: AddressStepProps) {
  const handleCopyAddress = () => {
    if (addressInfo.address1) {
      onAddressChange("address2", addressInfo.address1);
      onAddressChange("address3", addressInfo.address1);
    }
  };

  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Address Information</Text>

      <View style={styles.inputWrapper}>
        <Text style={styles.label}>Address Line 1 <Text style={styles.required}>*</Text></Text>
        <View style={styles.inputContainer}>
          <MaterialCommunityIcons
            name="home"
            size={24}
            color="#6c56f9"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Enter address line 1"
            value={addressInfo.address1}
            onChangeText={(value) => onAddressChange("address1", value)}
          />
        </View>
      </View>

      <View style={styles.inputWrapper}>
        <Text style={styles.label}>Address Line 2</Text>
        <View style={styles.inputContainer}>
          <MaterialCommunityIcons
            name="home-city"
            size={24}
            color="#6c56f9"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Enter address line 2"
            value={addressInfo.address2}
            onChangeText={(value) => onAddressChange("address2", value)}
          />
        </View>
      </View>

      <View style={styles.inputWrapper}>
        <Text style={styles.label}>Address Line 3</Text>
        <View style={styles.inputContainer}>
          <MaterialCommunityIcons
            name="office-building"
            size={24}
            color="#6c56f9"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Enter address line 3"
            value={addressInfo.address3}
            onChangeText={(value) => onAddressChange("address3", value)}
          />
        </View>
      </View>

      <TouchableOpacity
        style={styles.copyButton}
        onPress={handleCopyAddress}
        disabled={!addressInfo.address1}
      >
        <MaterialCommunityIcons
          name="content-copy"
          size={20}
          color={addressInfo.address1 ? "#4F46E5" : "#9CA3AF"}
        />
        <Text style={[
          styles.copyButtonText,
          !addressInfo.address1 && styles.copyButtonTextDisabled
        ]}>
          Copy Address Line 1 to Line 2 and 3
        </Text>
      </TouchableOpacity>

      <View style={styles.inputWrapper}>
        <Text style={styles.label}>City <Text style={styles.required}>*</Text></Text>
        <View style={styles.inputContainer}>
          <MaterialCommunityIcons
            name="city"
            size={24}
            color="#6c56f9"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Enter city"
            value={addressInfo.city}
            onChangeText={(value) => onAddressChange("city", value)}
          />
        </View>
      </View>

      <View style={styles.inputWrapper}>
        <Text style={styles.label}>State <Text style={styles.required}>*</Text></Text>
        <View style={styles.inputContainer}>
          <MaterialCommunityIcons
            name="map-marker"
            size={24}
            color="#6c56f9"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Enter state"
            value={addressInfo.state}
            onChangeText={(value) => onAddressChange("state", value)}
          />
        </View>
      </View>

      <View style={styles.inputWrapper}>
        <Text style={styles.label}>PIN Code <Text style={styles.required}>*</Text></Text>
        <View style={styles.inputContainer}>
          <MaterialCommunityIcons
            name="map-marker-radius"
            size={24}
            color="#6c56f9"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Enter PIN code"
            value={addressInfo.pinCode}
            onChangeText={(value) => onAddressChange("pinCode", value)}
            keyboardType="numeric"
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
  copyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF2FF",
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 12,
    gap: 6,
  },
  copyButtonText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#7b61ff",
  },
  copyButtonTextDisabled: {
    color: "#9CA3AF",
  },
}); 