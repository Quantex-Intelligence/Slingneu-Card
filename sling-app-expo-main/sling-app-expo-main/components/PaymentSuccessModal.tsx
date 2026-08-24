import { Image, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface PaymentSuccessModalProps {
  visible: boolean;
  onClose: () => void;
  onViewReceipt: () => void;
  scratchCardEarned?: boolean;
  scratchCardHasReward?: boolean;
}

export default function PaymentSuccessModal({
  visible,
  onClose,
  onViewReceipt,
  scratchCardEarned = false,
  scratchCardHasReward = false
}: PaymentSuccessModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Illustration */}
          <View style={styles.illustrationContainer}>
            {/* Replace with your own image or SVG */}
            <Image
              source={require("../assets/images/onboarding/onbonding33.png")}
              style={styles.illustration}
              resizeMode="contain"
            />
          </View>
          {/* Success Message */}
          <Text style={styles.title}>Added Successfully!</Text>
          <Text style={styles.subtitle}>Money added successfully!</Text>

          {/* Scratch Card Notification */}
          {scratchCardEarned && (
            <View style={styles.scratchCardNotification}>
              <Text style={styles.scratchCardIcon}>🎁</Text>
              <Text style={styles.scratchCardTitle}>
                {scratchCardHasReward ? "Bonus Reward Earned!" : "Scratch Card Earned!"}
              </Text>
              <Text style={styles.scratchCardSubtitle}>
                {scratchCardHasReward
                  ? "You earned a scratch card with potential rewards! Check the Rewards section."
                  : "You earned a scratch card! Check the Rewards section to scratch and win!"
                }
              </Text>
            </View>
          )}
          {/* Buttons */}
          <TouchableOpacity style={styles.primaryButton} onPress={onViewReceipt}>
            <Text style={styles.primaryButtonText}>View E-Receipt</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={onClose}>
            <Text style={styles.secondaryButtonText}>Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    width: 320,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  illustrationContainer: {
    marginBottom: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  illustration: {
    width: 100,
    height: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#7C4DFF",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 32,
    textAlign: "center",
  },
  primaryButton: {
    backgroundColor: "#7C4DFF",
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginBottom: 16,
    width: "100%",
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  secondaryButton: {
    backgroundColor: "#E5E7EB",
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 32,
    width: "100%",
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#7C4DFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  // Scratch Card Notification Styles
  scratchCardNotification: {
    backgroundColor: "#f0f9ff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#0ea5e9",
  },
  scratchCardIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  scratchCardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0c4a6e",
    marginBottom: 4,
    textAlign: "center",
  },
  scratchCardSubtitle: {
    fontSize: 14,
    color: "#0369a1",
    textAlign: "center",
    lineHeight: 20,
  },
}); 