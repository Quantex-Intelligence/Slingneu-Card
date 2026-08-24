import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";

const TITLES = ["Mr", "Mrs", "Ms", "Dr"];
const GENDERS = ["MALE", "FEMALE", "OTHER"];
const MARITAL_STATUSES = ["SINGLE", "MARRIED", "DIVORCED", "WIDOWED"];
const EMPLOYMENT_TYPES = [
  "EMPLOYED",
  "SELF_EMPLOYED",
  "BUSINESS",
  "STUDENT",
  "RETIRED",
  "UNEMPLOYED",
];

interface PersonalInfoStepProps {
  formData: {
    title: string;
    firstName: string;
    lastName: string;
    gender: string;
    maritalStatus: string;
    employmentType: string;
    dateInfo: { dateType: string; date: string }[];
  };
  onInputChange: (field: string, value: string | { dateType: string; date: string }[]) => void;
  isDatePickerVisible: boolean;
  setDatePickerVisible: (visible: boolean) => void;
}

export default function PersonalInfoStep({
  formData,
  onInputChange,
  isDatePickerVisible,
  setDatePickerVisible,
}: PersonalInfoStepProps) {
  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Personal Information</Text>


      <View style={styles.inputWrapper}>
        <Text style={styles.label}>Title <Text style={styles.required}>*</Text></Text>
        <View style={styles.inputContainer}>
          <MaterialCommunityIcons
            name="account-tie"
            size={24}
            color="#6c56f9"
            style={styles.inputIcon}
          />
          <Picker
            selectedValue={formData.title}
            onValueChange={(value) => onInputChange("title", value)}
            style={styles.picker}
          >
            <Picker.Item label="Select Title" value="" />
            {TITLES.map((title) => (
              <Picker.Item key={title} label={title} value={title} />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.inputWrapper}>
        <Text style={styles.label}>First Name <Text style={styles.required}>*</Text></Text>
        <View style={styles.inputContainer}>
          <MaterialCommunityIcons
            name="account"
            size={24}
            color="#6c56f9"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Enter first name"
            value={formData.firstName}
            onChangeText={(value) => onInputChange("firstName", value)}
            placeholderTextColor={"black"}

          />
        </View>
      </View>

      <View style={styles.inputWrapper}>
        <Text style={styles.label}>Last Name <Text style={styles.required}>*</Text></Text>
        <View style={styles.inputContainer}>
          <MaterialCommunityIcons
            name="account"
            size={24}
            color="#6c56f9"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Enter last name"
            value={formData.lastName}
            onChangeText={(value) => onInputChange("lastName", value)}
            placeholderTextColor={"black"}
          />
        </View>
      </View>

      <View style={styles.inputWrapper}>
        <Text style={styles.label}>Gender <Text style={styles.required}>*</Text></Text>
        <View style={styles.inputContainer}>
          <MaterialCommunityIcons
            name="gender-male-female"
            size={24}
            color="#6c56f9"
            style={styles.inputIcon}
          />
          <Picker
            selectedValue={formData.gender}
            onValueChange={(value) => onInputChange("gender", value)}
            style={styles.picker}
          >
            <Picker.Item label="Select Gender" value="" />
            {GENDERS.map((gender) => (
              <Picker.Item key={gender} label={gender} value={gender} />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.inputWrapper}>
        <Text style={styles.label}>Marital Status</Text>
        <View style={styles.inputContainer}>
          <MaterialCommunityIcons
            name="heart"
            size={24}
            color="#6c56f9"
            style={styles.inputIcon}
          />
          <Picker
            selectedValue={formData.maritalStatus}
            onValueChange={(value) => onInputChange("maritalStatus", value)}
            style={styles.picker}
          >
            <Picker.Item label="Select Marital Status" value="" />
            {MARITAL_STATUSES.map((status) => (
              <Picker.Item key={status} label={status} value={status} />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.inputWrapper}>
        <Text style={styles.label}>Employment Type <Text style={styles.required}>*</Text></Text>
        <View style={styles.inputContainer}>
          <MaterialCommunityIcons
            name="briefcase"
            size={24}
            color="#6c56f9"
            style={styles.inputIcon}
          />
          <Picker
            selectedValue={formData.employmentType}
            onValueChange={(value) => onInputChange("employmentType", value)}
            style={styles.picker}
          >
            <Picker.Item label="Select Employment Type" value="" />
            {EMPLOYMENT_TYPES.map((type) => (
              <Picker.Item key={type} label={type} value={type} />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.inputWrapper}>
        <Text style={styles.label}>Date of Birth (Must be 18 or older) <Text style={styles.required}>*</Text></Text>
        <TouchableOpacity
          style={styles.inputContainer}
          onPress={() => setDatePickerVisible(true)}
        >
          <MaterialCommunityIcons
            name="calendar"
            size={24}
            color="#6c56f9"
            style={styles.inputIcon}
          />
          <Text
            style={[
              styles.input,
              !formData.dateInfo[0].date && styles.placeholder,
            ]}
          >
            {formData.dateInfo[0].date || "Select Date of Birth"}
          </Text>
        </TouchableOpacity>
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={(date) => {
            setDatePickerVisible(false);
            onInputChange("dateInfo", [
              {
                dateType: "DOB",
                date: date.toISOString().split("T")[0],
              },
            ]);
          }}
          onCancel={() => setDatePickerVisible(false)}
          maximumDate={new Date(new Date().setFullYear(new Date().getFullYear() - 18))}
        />
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
    padding: 14,
    fontSize: 13,
    color: "#1F2937",
  },
  picker: {
    flex: 1,
    width: "100%",
    color: "#1F2937",
    fontSize: 13,
  },
  placeholder: {
    color: "#9CA3AF",
  },
}); 