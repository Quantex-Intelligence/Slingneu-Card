import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface UserProfileModalProps {
  visible: boolean;
  onClose: () => void;
  user: any;
}

export default function UserProfileModal({
  visible,
  onClose,
  user,
}: UserProfileModalProps) {
  if (!user) return null;

  const copyReferralCode = async () => {
    if (user?.referralCode) {
      try {
        await Clipboard.setStringAsync(user.referralCode);
        Alert.alert("Copied!", "Referral code copied to clipboard.");
      } catch (err) {
        Alert.alert("Error", "Failed to copy referral code.");
      }
    }
  };

  const isKycComplete = Boolean(user?.isKyc);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <LinearGradient
            colors={["#6c56f9", "#8b5cf6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.profileHeader}>
              <Image
                source={{
                  uri:
                    user?.profile ||
                    `https://ui-avatars.com/api/?name=${user?.name || "User"}&background=random`,
                }}
                style={styles.avatar}
              />
              <Text style={styles.name}>{user?.name || "User"}</Text>
              <Text style={styles.phone}>+91 {user?.phone}</Text>
            </View>
          </LinearGradient>

          <View style={styles.body}>
            {/* KYC Status Badge */}
            <View style={styles.card}>
              <View style={styles.row}>
                <MaterialCommunityIcons
                  name={isKycComplete ? "shield-check" : "shield-alert"}
                  size={24}
                  color={isKycComplete ? "#10B981" : "#F59E0B"}
                />
                <View style={styles.rowText}>
                  <Text style={styles.label}>KYC Verification</Text>
                  <Text
                    style={[
                      styles.value,
                      { color: isKycComplete ? "#10B981" : "#F59E0B" },
                    ]}
                  >
                    {isKycComplete ? "Verified Customer" : "KYC Pending"}
                  </Text>
                </View>
                {!isKycComplete && (
                  <TouchableOpacity
                    style={styles.actionPill}
                    onPress={() => {
                      onClose();
                      router.push("/(auth)/kyc-onboarding");
                    }}
                  >
                    <Text style={styles.actionPillText}>Complete KYC</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Referral Code Card */}
            {user?.referralCode && (
              <View style={styles.card}>
                <View style={styles.row}>
                  <MaterialCommunityIcons
                    name="gift-outline"
                    size={24}
                    color="#6366F1"
                  />
                  <View style={styles.rowText}>
                    <Text style={styles.label}>Your Referral Code</Text>
                    <Text style={styles.referralCode}>{user.referralCode}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.copyButton}
                    onPress={copyReferralCode}
                  >
                    <Ionicons name="copy-outline" size={18} color="#6366F1" />
                    <Text style={styles.copyText}>Copy</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Account Details Card */}
            <View style={styles.card}>
              <Text style={styles.cardSectionTitle}>Account Details</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Full Name</Text>
                <Text style={styles.detailValue}>{user?.name || "N/A"}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Mobile Number</Text>
                <Text style={styles.detailValue}>+91 {user?.phone}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>User ID</Text>
                <Text style={styles.detailValue}>
                  {user?._id ? `...${user._id.slice(-8)}` : "N/A"}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "#F8F9FA",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
    maxHeight: "90%",
  },
  header: {
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  closeButton: {
    alignSelf: "flex-end",
    padding: 8,
  },
  profileHeader: {
    alignItems: "center",
    marginTop: -8,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#FFFFFF",
    marginBottom: 10,
  },
  name: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    fontFamily: "SpaceMono-Regular",
  },
  phone: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    marginTop: 2,
    fontFamily: "SpaceMono-Regular",
  },
  body: {
    padding: 20,
    gap: 12,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  rowText: {
    marginLeft: 12,
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: "#6B7280",
    fontFamily: "SpaceMono-Regular",
  },
  value: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 2,
    fontFamily: "SpaceMono-Regular",
  },
  referralCode: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#6366F1",
    letterSpacing: 1,
    marginTop: 2,
    fontFamily: "SpaceMono-Regular",
  },
  actionPill: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  actionPillText: {
    color: "#D97706",
    fontSize: 12,
    fontWeight: "bold",
    fontFamily: "SpaceMono-Regular",
  },
  copyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  copyText: {
    color: "#6366F1",
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "SpaceMono-Regular",
  },
  cardSectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 12,
    fontFamily: "SpaceMono-Regular",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  detailLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontFamily: "SpaceMono-Regular",
  },
  detailValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#111827",
    fontFamily: "SpaceMono-Regular",
  },
});
