import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
    Dimensions,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width, height } = Dimensions.get("window");

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: "default" | "cancel" | "destructive";
}

export interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  buttons?: AlertButton[];
  type?: "success" | "error" | "warning" | "info" | "confirm";
  onClose?: () => void;
}

export default function CustomAlert({
  visible,
  title,
  message,
  buttons = [{ text: "OK" }],
  type = "info",
  onClose,
}: CustomAlertProps) {
  const getAlertConfig = () => {
    switch (type) {
      case "success":
        return {
          icon: "checkmark-circle",
          iconColor: "#10b981",
          gradientColors: ["#10b981", "#059669"] as const,
          backgroundColor: "#ecfdf5",
          borderColor: "#a7f3d0",
        };
      case "error":
        return {
          icon: "close-circle",
          iconColor: "#ef4444",
          gradientColors: ["#ef4444", "#dc2626"] as const,
          backgroundColor: "#fef2f2",
          borderColor: "#fecaca",
        };
      case "warning":
        return {
          icon: "alert-circle",
          iconColor: "#f59e0b",
          gradientColors: ["#f59e0b", "#d97706"] as const,
          backgroundColor: "#fffbeb",
          borderColor: "#fed7aa",
        };
      case "confirm":
        return {
          icon: "help-circle",
          iconColor: "#3b82f6",
          gradientColors: ["#3b82f6", "#2563eb"] as const,
          backgroundColor: "#eff6ff",
          borderColor: "#bfdbfe",
        };
      default:
        return {
          icon: "information",
          iconColor: "#6b7280",
          gradientColors: ["#6b7280", "#4b5563"] as const,
          backgroundColor: "#f9fafb",
          borderColor: "#d1d5db",
        };
    }
  };

  const config = getAlertConfig();

  const handleButtonPress = (button: AlertButton) => {
    if (button.onPress) {
      button.onPress();
    }
    if (onClose) {
      onClose();
    }
  };

  const renderButton = (button: AlertButton, index: number) => {
    const isPrimary = button.style === "destructive" || 
                     (buttons.length === 1) || 
                     (index === buttons.length - 1 && buttons.length > 1);
    
    const isCancel = button.style === "cancel";
    
    if (isPrimary) {
      return (
        <TouchableOpacity
          key={index}
          style={styles.primaryButton}
          onPress={() => handleButtonPress(button)}
        >
          <LinearGradient
            colors={config.gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.primaryButtonGradient}
          >
            <Text style={styles.primaryButtonText}>{button.text}</Text>
          </LinearGradient>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.secondaryButton,
          isCancel && styles.cancelButton
        ]}
        onPress={() => handleButtonPress(button)}
      >
        <Text style={[
          styles.secondaryButtonText,
          isCancel && styles.cancelButtonText
        ]}>
          {button.text}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <LinearGradient
            colors={["#ffffff", "#fafafa"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.alertCard, { borderColor: config.borderColor }]}
          >
            {/* Icon */}
            <View style={[styles.iconContainer, { backgroundColor: config.backgroundColor }]}>
              <MaterialCommunityIcons
                name={config.icon as any}
                size={32}
                color={config.iconColor}
              />
            </View>

            {/* Content */}
            <View style={styles.content}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.message}>{message}</Text>
            </View>

            {/* Buttons */}
            <View style={[
              styles.buttonContainer,
              buttons.length > 2 && styles.buttonContainerVertical
            ]}>
              {buttons.map((button, index) => renderButton(button, index))}
            </View>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  container: {
    width: "100%",
    maxWidth: 320,
    alignItems: "center",
  },
  alertCard: {
    width: "100%",
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 16,
  },
  content: {
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
    textAlign: "center",
    marginBottom: 8,
    lineHeight: 28,
  },
  message: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 24,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
  },
  buttonContainerVertical: {
    flexDirection: "column",
  },
  primaryButton: {
    flex: 1,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonGradient: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  secondaryButtonText: {
    color: "#374151",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButton: {
    backgroundColor: "#fef2f2",
    borderColor: "#fecaca",
  },
  cancelButtonText: {
    color: "#dc2626",
  },
}); 