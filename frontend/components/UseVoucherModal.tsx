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

interface UseVoucherModalProps {
  visible: boolean;
  onClose: () => void;
  onRedeem?: (voucherId: string) => void;
  voucher: {
    id: string;
    title: string;
    subtitle: string;
    value: string;
    code: string;
    color?: string[];
  } | null;
}

export default function UseVoucherModal({
  visible,
  onClose,
  onRedeem,
  voucher,
}: UseVoucherModalProps) {
  const [copied, setCopied] = useState(false);
  const [redeemed, setRedeemed] = useState(false);

  if (!voucher) return null;

  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(voucher.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      setCopied(true);
    }
  };

  const handleRedeem = () => {
    setRedeemed(true);
    if (onRedeem) {
      onRedeem(voucher.id);
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
            colors={voucher.color || ["#6c56f9", "#8b5cf6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.iconContainer}>
              <MaterialCommunityIcons
                name="ticket-percent-outline"
                size={36}
                color="#FFFFFF"
              />
            </View>
            <Text style={styles.headerTitle}>Use Voucher</Text>
            <Text style={styles.headerSubtitle}>
              Present or apply this voucher code at store/checkout
            </Text>
          </LinearGradient>

          <View style={styles.body}>
            <Text style={styles.voucherTitle}>{voucher.title}</Text>
            <Text style={styles.voucherValue}>{voucher.value}</Text>
            <Text style={styles.voucherSubtitle}>{voucher.subtitle}</Text>

            {/* Promo Code Box */}
            <View style={styles.codeContainer}>
              <View style={styles.codeBox}>
                <Text style={styles.codeLabel}>VOUCHER PROMO CODE</Text>
                <Text style={styles.codeText}>{voucher.code}</Text>
              </View>
              <TouchableOpacity style={styles.copyButton} onPress={handleCopy}>
                <LinearGradient
                  colors={copied ? ["#10b981", "#059669"] : ["#6c56f9", "#8b5cf6"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.copyGradient}
                >
                  <MaterialCommunityIcons
                    name={copied ? "check-all" : "content-copy"}
                    size={18}
                    color="#FFFFFF"
                  />
                  <Text style={styles.copyText}>{copied ? "Copied!" : "Copy"}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {copied && (
              <View style={styles.copiedBanner}>
                <MaterialCommunityIcons name="check-circle" size={16} color="#10b981" />
                <Text style={styles.copiedBannerText}>
                  Code copied to clipboard! Ready to paste at checkout.
                </Text>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={styles.redeemButton}
                onPress={handleRedeem}
                disabled={redeemed}
              >
                <LinearGradient
                  colors={redeemed ? ["#9CA3AF", "#6B7280"] : ["#10b981", "#059669"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.redeemGradient}
                >
                  <MaterialCommunityIcons
                    name={redeemed ? "check-circle" : "lightning-bolt"}
                    size={20}
                    color="#FFFFFF"
                  />
                  <Text style={styles.redeemText}>
                    {redeemed ? "Voucher Redeemed" : "Redeem Now"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

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
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.25)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
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
  voucherTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    textAlign: "center",
    fontFamily: "SpaceMono-Regular",
  },
  voucherValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#10b981",
    marginTop: 4,
    fontFamily: "SpaceMono-Regular",
  },
  voucherSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
    textAlign: "center",
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
  copiedBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 12,
    gap: 6,
    width: "100%",
  },
  copiedBannerText: {
    color: "#065F46",
    fontSize: 11,
    fontWeight: "600",
    flex: 1,
    fontFamily: "SpaceMono-Regular",
  },
  actionsContainer: {
    width: "100%",
    marginTop: 20,
    gap: 8,
  },
  redeemButton: {
    borderRadius: 14,
    overflow: "hidden",
  },
  redeemGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    gap: 8,
  },
  redeemText: {
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
