import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
    Modal,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const TransactionDetailModal = ({ visible, onClose, transaction }: any) => {
  if (!transaction) {
    return null;
  }

  const copyToClipboard = async () => {
    if (transaction.txRef) {
      await Clipboard.setStringAsync(transaction.txRef.toString());
      alert("Copied to clipboard!");
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "CREDIT":
        return "arrow-down";
      case "DEBIT":
        return "arrow-up";
      default:
        return "swap-horizontal";
    }
  };

  const getTransactionColor = (type: string) => {
    return type === "CREDIT" ? "#10b981" : "#ef4444";
  };

  const rawDate = transaction.time || transaction.date || transaction.createdAt || transaction.timestamp;
  const date = rawDate ? new Date(rawDate) : new Date();
  const formattedTime = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#1e293b" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Transaction Details</Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.content}>
            <LinearGradient
              colors={["#fff", "#fafafa"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.transactionCard}
            >
              <View style={styles.cardHeader}>
                <LinearGradient
                  colors={
                    transaction.type === "CREDIT"
                      ? ["#dcfce7", "#bbf7d0"]
                      : ["#fee2e2", "#fecaca"]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.transactionIconContainer}
                >
                  <MaterialCommunityIcons
                    name={getTransactionIcon(transaction.type)}
                    size={24}
                    color={getTransactionColor(transaction.type)}
                  />
                </LinearGradient>
                <View style={styles.titleContainer}>
                  <Text style={styles.transactionType}>{transaction.type}</Text>
                  <Text style={styles.transactionDate}>
                    {`${date.toLocaleString("default", {
                      month: "short",
                    })} ${date.getDate()}, ${formattedTime}`}
                  </Text>
                </View>
                <View style={styles.amountContainer}>
                  <Text
                    style={[
                      styles.transactionAmount,
                      { color: getTransactionColor(transaction.type) },
                    ]}
                  >
                    {transaction.type === "CREDIT" ? "+ " : "- "}₹
                    {transaction.amount}
                  </Text>
                  {transaction.balance && (
                    <Text style={styles.balanceText}>
                      Balance: ₹{transaction.balance}
                    </Text>
                  )}
                </View>
              </View>
              <View style={styles.separator} />

              <View style={styles.detailsContainer}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Transaction remark</Text>
                  <Text style={styles.detailValue}>
                    {transaction.description ||
                      transaction.beneficiaryName ||
                      "N/A"}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Transaction ID</Text>
                  <View style={styles.transactionIdContainer}>
                    <Text style={styles.detailValue}>{transaction.txRef}</Text>
                    <TouchableOpacity onPress={copyToClipboard}>
                      <Text style={styles.copyText}>Copy</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    backgroundColor: "#f8fafc",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  transactionCard: {
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  transactionIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  titleContainer: {
    flex: 1,
    marginLeft: 16,
  },
  transactionType: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    textTransform: "capitalize",
  },
  transactionDate: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 4,
  },
  amountContainer: {
    alignItems: "flex-end",
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: "bold",
  },
  balanceText: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 4,
  },
  separator: {
    height: 1,
    backgroundColor: "#e2e8f0",
    marginVertical: 20,
  },
  detailsContainer: {},
  detailRow: {
    marginBottom: 20,
  },
  detailLabel: {
    fontSize: 16,
    color: "#64748b",
    marginBottom: 8,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
  },
  transactionIdContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  copyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6c56f9",
  },
});

export default TransactionDetailModal; 