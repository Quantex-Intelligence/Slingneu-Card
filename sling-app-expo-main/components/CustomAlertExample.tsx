import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import CustomAlert from "./CustomAlert";
import { useCustomAlert } from "./useCustomAlert";

export default function CustomAlertExample() {
  const { alertVisible, alertConfig, showAlert, hideAlert } = useCustomAlert();

  const showSuccessAlert = () => {
    showAlert(
      "Success!",
      "Your action was completed successfully.",
      "success"
    );
  };

  const showErrorAlert = () => {
    showAlert(
      "Error",
      "Something went wrong. Please try again.",
      "error"
    );
  };

  const showWarningAlert = () => {
    showAlert(
      "Warning",
      "This action cannot be undone. Are you sure?",
      "warning",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Continue", style: "destructive" }
      ]
    );
  };

  const showConfirmAlert = () => {
    showAlert(
      "Confirm Action",
      "Are you sure you want to proceed with this action?",
      "confirm",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Yes, Proceed", onPress: () => console.log("Confirmed!") }
      ]
    );
  };

  const showInfoAlert = () => {
    showAlert(
      "Information",
      "This is an informational message for the user.",
      "info"
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={[styles.button, styles.successButton]} onPress={showSuccessAlert}>
        <Text style={styles.buttonText}>Show Success Alert</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.errorButton]} onPress={showErrorAlert}>
        <Text style={styles.buttonText}>Show Error Alert</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.warningButton]} onPress={showWarningAlert}>
        <Text style={styles.buttonText}>Show Warning Alert</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.confirmButton]} onPress={showConfirmAlert}>
        <Text style={styles.buttonText}>Show Confirm Alert</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.infoButton]} onPress={showInfoAlert}>
        <Text style={styles.buttonText}>Show Info Alert</Text>
      </TouchableOpacity>

      {/* Custom Alert */}
      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        buttons={alertConfig.buttons}
        onClose={hideAlert}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    gap: 16,
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  successButton: {
    backgroundColor: "#10b981",
  },
  errorButton: {
    backgroundColor: "#ef4444",
  },
  warningButton: {
    backgroundColor: "#f59e0b",
  },
  confirmButton: {
    backgroundColor: "#3b82f6",
  },
  infoButton: {
    backgroundColor: "#6b7280",
  },
}); 