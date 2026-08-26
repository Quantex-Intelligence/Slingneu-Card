import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface ClaimOfferModalProps {
  visible: boolean;
  onClose: () => void;
  onViewVouchers?: () => void;
  offer: {
    title: string;
    subtitle: string;
    code: string;
    discount: string;
    validity?: string;
  } | null;
}

export default function ClaimOfferModal({
  visible,
  onClose,
  onViewVouchers,
  offer,
}: ClaimOfferModalProps) {
  const [copied, setCopied] = useState(false);

  if (!offer) return null;

  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(offer.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      setCopied(true);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <LinearGradient
            colors={["#FF6B6B", "#FF8E53"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.iconContainer}>
              <Text style={styles.emoji}>🎉</Text>
            </View>
            <Text style={styles.headerTitle}>Offer Claimed!</Text>
            <Text style={styles.headerSubtitle}>
              Your campus discount coupon is ready to use
            </Text>
          </LinearGradient>

          <View style={styles.body}>
            <Text style={styles.offerTitle}>{offer.title}</Text>
            <Text style={styles.offerSubtitle}>{offer.subtitle}</Text>
            <Text style={styles.discountBadge}>{offer.discount}</Text>

            {/* Code Box */}
            <View style={styles.codeContainer}>
              <View style={styles.codeBox}>
                <Text style={styles.codeLabel}>PROMO CODE</Text>
                <Text style={styles.codeText}>{offer.code}</Text>
              </View>
              <TouchableOpacity style={styles.copyButton} onPress={handleCopy}>
                <LinearGradient
                  colors={copied ? ["#10b981", "#059669"] : ["#6c56f9", "#8b5cf6"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.copyGradient}
                >
                  <MaterialCommunityIcons
                    name={copied ? "check" : "content-copy"}
                    size={18}
                    color="#FFFFFF"
                  />
                  <Text style={styles.copyText}>{copied ? "Copied!" : "Copy"}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <Text style={styles.validityText}>
              Valid until: {offer.validity || "Dec 31, 2026"}
            </Text>

            {/* Actions */}
            <View style={styles.actionsContainer}>
              {onViewVouchers && (
                <TouchableOpacity
                  style={styles.viewVouchersButton}
                  onPress={() => {
                    onClose();
                    onViewVouchers();
                  }}
                >
                  <LinearGradient
                    colors={["#6c56f9", "#8b5cf6"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.actionGradient}
                  >
                    <Text style={styles.actionText}>Go to My Vouchers</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.closeModalButton} onPress={onClose}>
                <Text style={styles.closeModalText}>Close</Text>
              </TouchableOpacity>
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
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    width: "100%",
    maxWidth: 380,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    padding: 6,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.25)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  emoji: {
    fontSize: 32,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
    fontFamily: "SpaceMono-Regular",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
    marginTop: 4,
    textAlign: "center",
    fontFamily: "SpaceMono-Regular",
  },
  body: {
    padding: 24,
    alignItems: "center",
  },
  offerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    textAlign: "center",
    fontFamily: "SpaceMono-Regular",
  },
  offerSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
    textAlign: "center",
    fontFamily: "SpaceMono-Regular",
  },
  discountBadge: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FF6B6B",
    backgroundColor: "#FFEFEF",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 12,
    fontFamily: "SpaceMono-Regular",
  },
  codeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
    borderRadius: 16,
    padding: 12,
    width: "100%",
    marginTop: 20,
  },
  codeBox: {
    flex: 1,
  },
  codeLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#9CA3AF",
    letterSpacing: 1,
  },
  codeText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#6c56f9",
    letterSpacing: 1.5,
    marginTop: 2,
    fontFamily: "SpaceMono-Regular",
  },
  copyButton: {
    borderRadius: 10,
    overflow: "hidden",
  },
  copyGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  copyText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "bold",
    fontFamily: "SpaceMono-Regular",
  },
  validityText: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 12,
    fontFamily: "SpaceMono-Regular",
  },
  actionsContainer: {
    width: "100%",
    marginTop: 20,
    gap: 8,
  },
  viewVouchersButton: {
    borderRadius: 14,
    overflow: "hidden",
  },
  actionGradient: {
    paddingVertical: 14,
    alignItems: "center",
  },
  actionText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
    fontFamily: "SpaceMono-Regular",
  },
  closeModalButton: {
    paddingVertical: 12,
    alignItems: "center",
  },
  closeModalText: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "SpaceMono-Regular",
  },
});
