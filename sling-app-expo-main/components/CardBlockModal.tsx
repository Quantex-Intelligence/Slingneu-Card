import Api from "@/config/Api";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
  Alert,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";

const { width, height } = Dimensions.get("window");

interface CardBlockModalProps {
  visible: boolean;
  onClose: () => void;
  cardData?: any;
}

interface BlockAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  flag: string;
  color: string;
  warning?: string;
}

interface BlockOption {
  id: "replacement" | "refund";
  title: string;
  description: string;
  icon: string;
  color: string;
}

const BLOCK_OPTIONS: BlockOption[] = [
  {
    id: "replacement",
    title: "Card Replacement",
    description: "Issue a new card after blocking",
    icon: "credit-card-refresh",
    color: "#6c56f9",
  },
  {
    id: "refund",
    title: "Refund",
    description: "Refund the remaining balance",
    icon: "cash-refund",
    color: "#10b981",
  },
];

const BLOCK_ACTIONS: BlockAction[] = [
  {
    id: "lock",
    title: "Lock Card",
    description: "Temporarily lock your card for security",
    icon: "lock",
    flag: "L",
    color: "#f59e0b",
  },
  {
    id: "unlock",
    title: "Unlock Card",
    description: "Unlock your card to resume transactions",
    icon: "lock-open",
    flag: "UL",
    color: "#10b981",
  },
  {
    id: "block",
    title: "Block Card",
    description: "Block your card permanently with replacement or refund",
    icon: "block-helper",
    flag: "BL",
    color: "#ef4444",
    warning: "This action is permanent and cannot be undone.",
  },
  {
    id: "close",
    title: "Close Card",
    description: "Close your card (requires new card)",
    icon: "close",
    flag: "BL",
    color: "#ef4444",
    warning: "This action is permanent and cannot be undone. You will need to order a new card.",
  },
];

export default function CardBlockModal({
  visible,
  onClose,
  cardData,
}: CardBlockModalProps) {
  const { user, token } = useSelector((state: any) => state.auth);
  const [selectedAction, setSelectedAction] = useState<BlockAction | null>(null);
  const [blockOption, setBlockOption] = useState<"replacement" | "refund" | null>(null);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleActionSelect = (action: BlockAction) => {
    setSelectedAction(action);
    setBlockOption(null); // Reset block option when selecting new action
    setReason(""); // Reset reason when selecting new action
  };

  const handleSubmit = async () => {
    if (!selectedAction) {
      Alert.alert("Error", "Please select an action.");
      return;
    }

    if (selectedAction.id === "block" && !blockOption) {
      Alert.alert("Error", "Please select whether you want a Replacement or a Refund.");
      return;
    }

    if (!reason.trim()) {
      Alert.alert("Error", "Please provide a reason for this action.");
      return;
    }

    if (reason.length > 30) {
      Alert.alert("Error", "Reason must be 30 characters or less.");
      return;
    }

    if (selectedAction.id === "block") {
      const optionLabel = blockOption === "replacement" ? "Card Replacement" : "Refund";
      Alert.alert(
        "Confirm Permanent Block",
        `Are you sure you want to permanently block your card and request a ${optionLabel}? This action cannot be undone.`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Block Card", style: "destructive", onPress: performAction },
        ]
      );
    } else if (selectedAction.id === "close") {
      Alert.alert(
        "Confirm Permanent Close",
        "Are you sure you want to permanently close your card? This action cannot be undone and you will need to order a new card.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Close Card", style: "destructive", onPress: performAction },
        ]
      );
    } else if (selectedAction.id === "lock") {
      Alert.alert(
        "Lock Card",
        "Are you sure you want to lock your card?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Lock", onPress: performAction },
        ]
      );
    } else if (selectedAction.id === "unlock") {
      Alert.alert(
        "Unlock Card",
        "Are you sure you want to unlock your card?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Unlock", onPress: performAction },
        ]
      );
    } else {
      performAction();
    }
  };

  const performAction = async () => {
    try {
      setLoading(true);

      const entityId = "TSCSLINGNEO" + user?.phone;
      const kitNo = cardData?.kitList?.[0] || "";

      if (!kitNo) {
        Alert.alert("Error", "Card kit number not found.");
        return;
      }

      const requestBody = {
        entityId,
        kitNo,
        flag: selectedAction?.flag,
        reason: selectedAction?.id === "block"
          ? `[${blockOption?.toUpperCase()}] ${reason.trim()}`
          : reason.trim(),
      };

      console.log("Performing card action:", requestBody);

      const response = await Api.call(
        "/api/slingneo/card/lock-unlock",
        "POST",
        requestBody,
        token
      );
      if (response.status === 200) {
        const successMessage =
          selectedAction?.id === "lock" ? "Card locked successfully!" :
            selectedAction?.id === "unlock" ? "Card unlocked successfully!" :
              "Card blocked successfully! You will need to order a new card.";

        Alert.alert("Success", successMessage, [
          { text: "OK", onPress: onClose }
        ]);
      } else {
        Alert.alert("Error", "Failed to perform action. Please try again.");
      }
    } catch (error) {
      console.error("Error performing card action:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedAction(null);
    setBlockOption(null);
    setReason("");
    setLoading(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const renderActionCard = (action: BlockAction) => {
    const isSelected = selectedAction?.id === action.id;

    return (
      <TouchableOpacity
        key={action.id}
        onPress={() => handleActionSelect(action)}
        style={styles.actionCardContainer}
      >
        <LinearGradient
          colors={["#fff", "#fafafa"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.actionCard,
            isSelected && styles.selectedActionCard,
          ]}
        >
          <View style={styles.actionHeader}>
            <LinearGradient
              colors={[action.color, action.color + "CC"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.actionIconContainer}
            >
              <MaterialCommunityIcons
                name={action.icon as any}
                size={24}
                color="#fff"
              />
            </LinearGradient>
            <View style={styles.actionInfo}>
              <Text style={[styles.actionTitle, isSelected && styles.selectedActionText]}>
                {action.title}
              </Text>
              <Text style={[styles.actionDescription, isSelected && styles.selectedActionText]}>
                {action.description}
              </Text>
            </View>
            {isSelected && (
              <View style={styles.selectedIndicator}>
                <Ionicons name="checkmark-circle" size={24} color={action.color} />
              </View>
            )}
          </View>

          {action.warning && isSelected && (
            <View style={styles.warningContainer}>
              <MaterialCommunityIcons name="alert-circle" size={16} color="#ef4444" />
              <Text style={styles.warningText}>{action.warning}</Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const renderBlockOption = (option: BlockOption) => {
    const isSelected = blockOption === option.id;

    return (
      <TouchableOpacity
        key={option.id}
        onPress={() => setBlockOption(option.id)}
        style={styles.blockOptionWrapper}
      >
        <LinearGradient
          colors={isSelected ? ["#f0f9ff", "#e0f2fe"] : ["#fff", "#fafafa"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.blockOptionCard,
            isSelected && styles.selectedBlockOptionCard,
          ]}
        >
          <View style={styles.blockOptionIconContainer}>
            <MaterialCommunityIcons
              name={option.icon as any}
              size={24}
              color={isSelected ? "#6c56f9" : "#64748b"}
            />
          </View>
          <Text style={[styles.blockOptionTitle, isSelected && styles.selectedBlockOptionText]}>
            {option.title}
          </Text>
          <Text style={styles.blockOptionDescription}>
            {option.description}
          </Text>
          {isSelected && (
            <View style={styles.optionSelectedIndicator}>
              <Ionicons name="checkmark-circle" size={16} color="#6c56f9" />
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <LinearGradient
          colors={["#6c56f9", "#8b5cf6", "#a855f7"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Card Security</Text>
            <View style={styles.placeholder} />
          </View>
        </LinearGradient>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Card Info */}
          {cardData?.cardList && (
            <View style={styles.cardInfoSection}>
              <Text style={styles.sectionTitle}>Card Information</Text>
              <LinearGradient
                colors={["#f8fafc", "#f1f5f9"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardInfoCard}
              >
                <View style={styles.cardInfoRow}>
                  <Text style={styles.cardInfoLabel}>Card Number:</Text>
                  <Text style={styles.cardInfoValue}>
                    •••• •••• •••• {cardData.cardList[0]?.slice(-4) || "••••"}
                  </Text>
                </View>
                <View style={styles.cardInfoRow}>
                  <Text style={styles.cardInfoLabel}>Kit Number:</Text>
                  <Text style={styles.cardInfoValue}>
                    {cardData.kitList?.[0] || "N/A"}
                  </Text>
                </View>
                <View style={styles.cardInfoRow}>
                  <Text style={styles.cardInfoLabel}>Card Type:</Text>
                  <Text style={styles.cardInfoValue}>
                    {cardData.cardTypeList?.[0] || "N/A"}
                  </Text>
                </View>
              </LinearGradient>
            </View>
          )}

          {/* Action Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Action</Text>
            <Text style={styles.sectionSubtitle}>
              Choose the security action you want to perform
            </Text>

            {BLOCK_ACTIONS.map(renderActionCard)}
          </View>

          {/* Block Options */}
          {selectedAction?.id === "block" && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Block Options</Text>
              <Text style={styles.sectionSubtitle}>
                Select how you would like to proceed after blocking
              </Text>
              <View style={styles.blockOptionsGrid}>
                {BLOCK_OPTIONS.map(renderBlockOption)}
              </View>
            </View>
          )}

          {/* Reason Input */}
          {selectedAction && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Reason</Text>
              <Text style={styles.sectionSubtitle}>
                Please provide a reason for this action
              </Text>

              <View style={styles.reasonInputContainer}>
                <TextInput
                  style={styles.reasonInput}
                  value={reason}
                  onChangeText={setReason}
                  placeholder="Enter reason (max 30 characters)"
                  maxLength={30}
                  multiline
                  numberOfLines={3}
                />
                <Text style={styles.characterCount}>
                  {reason.length}/30
                </Text>
              </View>
            </View>
          )}

          {/* Submit Button */}
          {selectedAction && (
            <View style={styles.submitButtonContainer}>
              <LinearGradient
                colors={[selectedAction.color, selectedAction.color + "CC"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitButton}
              >
                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={loading}
                  style={styles.submitButtonTouchable}
                >
                  {loading ? (
                    <Text style={styles.submitButtonText}>Processing...</Text>
                  ) : (
                    <>
                      <MaterialCommunityIcons
                        name={selectedAction.icon as any}
                        size={20}
                        color="#fff"
                      />
                      <Text style={styles.submitButtonText}>
                        {selectedAction.title}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </LinearGradient>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  cardInfoSection: {
    marginTop: 24,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 16,
    lineHeight: 20,
  },
  cardInfoCard: {
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardInfoLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  cardInfoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
  },
  actionCardContainer: {
    marginBottom: 12,
  },
  actionCard: {
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  selectedActionCard: {
    borderWidth: 2,
    borderColor: "#6c56f9",
  },
  actionHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  actionInfo: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 2,
  },
  actionDescription: {
    fontSize: 12,
    color: "#64748b",
  },
  selectedActionText: {
    color: "#6c56f9",
  },
  selectedIndicator: {
    marginLeft: 8,
  },
  warningContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#fef2f2",
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  warningText: {
    fontSize: 12,
    color: "#dc2626",
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },
  reasonInputContainer: {
    position: "relative",
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 32,
    fontSize: 16,
    backgroundColor: "#fff",
    textAlignVertical: "top",
  },
  characterCount: {
    position: "absolute",
    bottom: 8,
    right: 12,
    fontSize: 12,
    color: "#9ca3af",
  },
  submitButtonContainer: {
    marginTop: 32,
    marginBottom: 40,
  },
  submitButton: {
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonTouchable: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  blockOptionsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 8,
  },
  blockOptionWrapper: {
    flex: 1,
  },
  blockOptionCard: {
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    height: 140,
    position: "relative",
  },
  selectedBlockOptionCard: {
    borderColor: "#6c56f9",
    backgroundColor: "#f0f9ff",
  },
  blockOptionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  blockOptionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
    textAlign: "center",
    marginBottom: 4,
  },
  blockOptionDescription: {
    fontSize: 10,
    color: "#64748b",
    textAlign: "center",
  },
  selectedBlockOptionText: {
    color: "#6c56f9",
  },
  optionSelectedIndicator: {
    position: "absolute",
    top: 8,
    right: 8,
  },
});