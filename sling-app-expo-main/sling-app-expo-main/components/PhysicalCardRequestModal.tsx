import Api from "@/config/Api";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface PhysicalCardRequestModalProps {
  visible: boolean;
  onClose: () => void;
  token: string;
  user: any;
  cardData: any;
}

export default function PhysicalCardRequestModal({
  visible,
  onClose,
  token,
  user,
  cardData,
}: PhysicalCardRequestModalProps) {
  const [formData, setFormData] = useState({
    title: "DELIVERY",
    address1: "",
    address2: "",
    city: "",
    state: "",
    country: "India",
    pinCode: "",
    aliasName: "",
    rollNumber: "",
    fourthLine: " ",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    const requiredFields = [
      "address1",
      "city",
      "state",
      "pinCode",
      "aliasName",
      "rollNumber",
    ];
    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData].trim()) {
        Alert.alert(
          "Error",
          `Please fill in ${field.replace(/([A-Z])/g, " $1").toLowerCase()}`
        );
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const requestBody = {
        entityId: "TSCSLINGNEO" + user?.phone,
        kitNo: cardData?.kitList?.[0],
        addressDto: {
          address: [formData],
        },
      };
      console.log(requestBody);
      
      // First API call to /api/slingneo/card/physical
      const response = await Api.call(
        "/api/slingneo/card/physical",
        "POST",
        requestBody,
        token
      );
      
      if (response.status === 200) {
        // Second API call to /api/physical-cards/create
        const createRequestBody = {
          rollnumber: formData.rollNumber,
          entityId: "TSCSLINGNEO" + user?.phone,
          kitNo: cardData?.kitList?.[0],
          addressDto: {
            address: [formData],
          },
        };
        
        try {
          const createResponse = await Api.call(
            "/api/physical-cards/create",
            "POST",
            createRequestBody,
            token
          );
          
          if (createResponse.status === 201) {
            Alert.alert(
              "Success",
              "Physical card request submitted successfully!",
              [{ text: "OK", onPress: onClose }]
            );
            // Reset form
            setFormData({
              title: "DELIVERY",
              address1: "",
              address2: "",
              city: "",
              state: "",
              country: "India",
              pinCode: "",
              aliasName: "",
              rollNumber: "",
              fourthLine: " ",
            });
          } else {
            Alert.alert(
              "Warning",
              "Card request submitted but tracking failed. Please contact support.",
              [{ text: "OK", onPress: onClose }]
            );
          }
        } catch (createError) {
          console.error("Error creating physical card request:", createError);
          Alert.alert(
            "Warning",
            "Card request submitted but tracking failed. Please contact support.",
            [{ text: "OK", onPress: onClose }]
          );
        }
      } else {
        Alert.alert(
          "Error",
          response.data?.message || "Failed to submit request"
        );
      }
    } catch (error) {
      console.error("Error requesting physical card:", error);
      Alert.alert("Error", "Failed to submit request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "DELIVERY",
      address1: "",
      address2: "",
      city: "",
      state: "",
      country: "India",
      pinCode: "",
      aliasName: "",
      rollNumber: "",
      fourthLine: " ",
    });
  };

  const styles = StyleSheet.create({
    modalContent: {
      flex: 1,
      backgroundColor: "#fff",
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 24,
      paddingVertical: 20,
      paddingTop: 10,
      borderBottomWidth: 1,
      borderBottomColor: "#e2e8f0",
      backgroundColor: "#fff",
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: "#1e293b",
    },
    closeButton: {
      padding: 4,
    },
    scrollView: {
      flex: 1,
    },
    description: {
      fontSize: 14,
      color: "#64748b",
      lineHeight: 20,
      paddingHorizontal: 24,
      paddingVertical: 16,
    },
    formContainer: {
      paddingHorizontal: 24,
      paddingBottom: 24,
    },
    inputGroup: {
      marginBottom: 20,
    },
    label: {
      fontSize: 14,
      fontWeight: "600",
      color: "#374151",
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: "#d1d5db",
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      color: "#1f2937",
      backgroundColor: "#fff",
    },
    disabledInput: {
      backgroundColor: "#f3f4f6",
      color: "#6b7280",
    },
    row: {
      flexDirection: "row",
      gap: 12,
    },
    halfWidth: {
      flex: 1,
    },
    buttonContainer: {
      flexDirection: "row",
      gap: 12,
      paddingHorizontal: 24,
      paddingBottom: 32,
    },
    cancelButton: {
      flex: 1,
      borderWidth: 1,
      borderColor: "#d1d5db",
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: "center",
      backgroundColor: "#fff",
    },
    cancelButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: "#6b7280",
    },
    submitButton: {
      flex: 2,
      backgroundColor: "#6c56f9",
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: "center",
    },
    submitButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: "#fff",
    },
    disabledButton: {
      opacity: 0.6,
    },
  });

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <LinearGradient colors={["#fff", "#f8fafc"]} style={styles.modalContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Request Physical Card</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialCommunityIcons name="close" size={24} color="#64748b" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.description}>
            Please provide your delivery address details to request a physical
            card.
          </Text>

          {/* Form Fields */}
          <View style={styles.formContainer}>

            {/* Alias Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.aliasName}
                onChangeText={(text) => handleInputChange("aliasName", text)}
                placeholder="Enter your full name"
                placeholderTextColor="#94a3b8"
              />
            </View>

            {/* Roll Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Roll Number *</Text>
              <TextInput
                style={styles.input}
                value={formData.rollNumber}
                onChangeText={(text) => handleInputChange("rollNumber", text)}
                placeholder="Enter your roll number"
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
              />
            </View>

            {/* Address Line 1 */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Address Line 1 *</Text>
              <TextInput
                style={styles.input}
                value={formData.address1}
                onChangeText={(text) => handleInputChange("address1", text)}
                placeholder="House/Flat number, Street name"
                placeholderTextColor="#94a3b8"
              />
            </View>

            {/* Address Line 2 */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Address Line 2</Text>
              <TextInput
                style={styles.input}
                value={formData.address2}
                onChangeText={(text) => handleInputChange("address2", text)}
                placeholder="Area, Landmark (optional)"
                placeholderTextColor="#94a3b8"
              />
            </View>

            {/* City and State Row */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>City *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.city}
                  onChangeText={(text) => handleInputChange("city", text)}
                  placeholder="Enter city"
                  placeholderTextColor="#94a3b8"
                />
              </View>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>State *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.state}
                  onChangeText={(text) => handleInputChange("state", text)}
                  placeholder="Enter state"
                  placeholderTextColor="#94a3b8"
                />
              </View>
            </View>

            {/* Country and PIN Code Row */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Country</Text>
                <TextInput
                  style={[styles.input, styles.disabledInput]}
                  value={formData.country}
                  editable={false}
                  placeholderTextColor="#94a3b8"
                />
              </View>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>PIN Code *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.pinCode}
                  onChangeText={(text) => handleInputChange("pinCode", text)}
                  placeholder="Enter PIN code"
                  placeholderTextColor="#94a3b8"
                  keyboardType="numeric"
                  maxLength={6}
                />
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                resetForm();
                onClose();
              }}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Submit Request</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </Modal>
  );
}
