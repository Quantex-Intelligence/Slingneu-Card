import RechargeService, { Transaction } from "@/services/RechargeService";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useState, useCallback } from "react";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import * as Print from "expo-print";
import { LinearGradient } from "expo-linear-gradient";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";

export default function RechargeTransactions() {
  const { user, token } = useSelector((state: any) => state.auth);
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [fromDate, setFromDate] = useState(new Date(new Date().setMonth(new Date().getMonth() - 1)));
  const [toDate, setToDate] = useState(new Date());
  const [isFromDatePickerVisible, setFromDatePickerVisibility] = useState(false);
  const [isToDatePickerVisible, setToDatePickerVisibility] = useState(false);

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [transactions, searchQuery, selectedStatus, fromDate, toDate]);

  // Remove pagination params
  const loadTransactions = async (refresh = false) => {
    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      // Fetch all transactions by setting a high limit
      const response = await RechargeService.getUserTransactions(
        token,
        1,
        1000, // Large limit to fetch all
        selectedStatus || undefined
      );
      setTransactions(response.transactions);
    } catch (error) {
      console.error("Error loading transactions:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterTransactions = () => {
    let filtered = [...transactions];
    
    // Search query filter
    if (searchQuery) {
      filtered = filtered.filter(
        (transaction) =>
          transaction.number.includes(searchQuery) ||
          transaction.orderid.includes(searchQuery) ||
          transaction.operatorcode.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (selectedStatus) {
      filtered = filtered.filter(t => t.status.toLowerCase() === selectedStatus.toLowerCase());
    }

    // Date range filter
    const start = new Date(fromDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(toDate);
    end.setHours(23, 59, 59, 999);

    filtered = filtered.filter(t => {
      const d = t.createdAt ? new Date(t.createdAt) : new Date();
      return d >= start && d <= end;
    });

    setFilteredTransactions(filtered);
  };

  const onRefresh = () => {
    loadTransactions(true);
  };

  // Remove loadMore and pagination logic

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "SUCCESS":
        return "#10b981";
      case "PENDING":
        return "#f59e0b";
      case "FAILED":
        return "#ef4444";
      default:
        return "#6c56f9";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case "SUCCESS":
        return "check-circle";
      case "PENDING":
        return "clock-outline";
      case "FAILED":
        return "close-circle";
      default:
        return "help-circle";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN').format(amount);
  };

  const buildHtml = (rows: any[]) => {
    const tableRows = rows.map(item => {
      const dateObj = item.createdAt ? new Date(item.createdAt) : new Date();
      const dateStr = dateObj.toLocaleDateString("en-GB");
      const timeStr = dateObj.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
      
      return `
        <tr>
          <td>${dateStr}<br/><small style="color: #64748b;">${timeStr}</small></td>
          <td>
            <div style="font-weight: 600;">${item.number}</div>
            <div style="font-size: 10px; color: #94a3b8;">${item.operatorcode}</div>
          </td>
          <td>
            <div style="font-size: 11px;">${item.status}</div>
            <div style="font-size: 9px; color: #94a3b8;">ID: ${item.orderid}</div>
          </td>
          <td style="text-align: right; font-weight: bold;">₹${formatAmount(item.amount)}</td>
        </tr>
      `;
    }).join("");

    return `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #1e293b; background-color: #fff; }
            .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; border-bottom: 2px solid #6c56f9; padding-bottom: 20px; }
            .brand { color: #6c56f9; }
            .brand-name { font-size: 28px; font-weight: 800; letter-spacing: -1px; }
            .brand-tagline { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; }
            .statement-title { text-align: right; }
            .statement-title h1 { margin: 0; font-size: 20px; color: #1e293b; text-transform: uppercase; }
            .statement-title p { margin: 5px 0 0; font-size: 12px; color: #64748b; }
            .user-info { display: flex; justify-content: space-between; margin-bottom: 30px; font-size: 13px; }
            .user-details h3 { margin: 0 0 8px; font-size: 14px; color: #1e293b; }
            .user-details p { margin: 2px 0; color: #64748b; }
            .period-box { background-color: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; }
            .period-box p { margin: 0; font-size: 11px; color: #94a3b8; text-transform: uppercase; }
            .period-box h4 { margin: 5px 0 0; font-size: 14px; color: #1e293b; }
            table { width: 100%; border-collapse: collapse; }
            th { text-align: left; padding: 12px 15px; background-color: #f1f5f9; color: #475569; font-size: 11px; text-transform: uppercase; font-weight: 700; border-bottom: 1px solid #e2e8f0; }
            td { padding: 15px; border-bottom: 1px solid #f1f5f9; font-size: 12px; vertical-align: middle; }
            .footer { margin-top: 50px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px; }
            .footer p { font-size: 11px; color: #94a3b8; margin: 5px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="brand">
              <div class="brand-name">SLING</div>
              <div class="brand-tagline">Recharge History</div>
            </div>
            <div class="statement-title">
              <h1>History</h1>
              <p>Generated on ${new Date().toLocaleDateString("en-GB")}</p>
            </div>
          </div>
          <div class="user-info">
            <div class="user-details">
              <h3>${user?.name || "User"}</h3>
              <p>${user?.phone}</p>
            </div>
            <div class="period-box">
              <p>History Period</p>
              <h4>${fromDate.toLocaleDateString("en-GB")} - ${toDate.toLocaleDateString("en-GB")}</h4>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th style="width: 20%">Date</th>
                <th style="width: 35%">Details</th>
                <th style="width: 25%">Status</th>
                <th style="width: 20%; text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Sling App. Recharge History Report.</p>
          </div>
        </body>
      </html>
    `;
  };

  const exportStatement = async () => {
    try {
      setExporting(true);
      const rows = filteredTransactions.length ? filteredTransactions : transactions;
      if (!rows.length) {
        alert("There are no transactions to export.");
        return;
      }

      const html = buildHtml(rows);
      const { uri } = await Print.printToFileAsync({
        html,
        base64: false
      });

      const fileName = `recharge_history_${fromDate.toISOString().slice(0, 10)}_to_${toDate.toISOString().slice(0, 10)}.pdf`;
      const pdfUri = FileSystem.cacheDirectory + fileName;
      await FileSystem.moveAsync({
        from: uri,
        to: pdfUri
      });

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(pdfUri, {
          mimeType: "application/pdf",
          dialogTitle: "Download History",
          UTI: "com.adobe.pdf",
        });
      } else {
        alert(`History saved to: ${pdfUri}`);
      }
    } catch (e) {
      console.error("Export error", e);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const renderTransactionItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.transactionItem}
      activeOpacity={0.8}
      onPress={() => {}}
    >
      <LinearGradient
        colors={["#fff", "#fafafa"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.transactionCard}
      >
        <View style={styles.transactionHeader}>
          <View style={styles.transactionInfo}>
            <Text style={styles.transactionNumber}>{item.number}</Text>
            <Text style={styles.transactionOperator}>{item.operatorcode}</Text>
          </View>
          <View style={styles.statusContainer}>
            <MaterialCommunityIcons
              name={getStatusIcon(item.status) as any}
              size={16}
              color={getStatusColor(item.status)}
            />
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(item.status) },
              ]}
            >
              {item.status}
            </Text>
          </View>
        </View>

        <View style={styles.transactionDetails}>
          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>Amount</Text>
            <Text style={styles.amountValue}>₹{item.amount}</Text>
          </View>
          <View style={styles.dateContainer}>
            <Text style={styles.dateLabel}>Date</Text>
            <Text style={styles.dateValue}>
              {formatDate(item.createdAt)} • {formatTime(item.createdAt)}
            </Text>
          </View>
        </View>

        <View style={styles.transactionFooter}>
          <Text style={styles.orderId}>Order ID: {item.transactionId}</Text>
          {item.txid && <Text style={styles.txId}>TX ID: {item.txid}</Text>}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <LinearGradient
        colors={["#f1f5f9", "#e2e8f0"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.emptyIconContainer}
      >
        <MaterialCommunityIcons name="receipt" size={48} color="#9ca3af" />
      </LinearGradient>
      <Text style={styles.emptyTitle}>No transactions found</Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery
          ? "Try adjusting your search criteria"
          : "Start making recharges to see your transaction history"}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#6c56f9"
        translucent={true}
      />
      {/* Header */}
      <LinearGradient
        colors={["#6c56f9", "#8b5cf6", "#a855f7"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Recharge History</Text>
          <TouchableOpacity
            onPress={exportStatement}
            disabled={exporting}
            style={styles.downloadButton}
          >
            {exporting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="download-outline" size={22} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>
      
      <View style={styles.datePickerContainer}>
        <TouchableOpacity 
          style={styles.datePickerButton} 
          onPress={() => setFromDatePickerVisibility(true)}
        >
          <MaterialCommunityIcons name="calendar-range" size={18} color="#6c56f9" />
          <View style={styles.dateTextContainer}>
            <Text style={styles.dateLabelText}>From</Text>
            <Text style={styles.dateValueText}>{fromDate.toLocaleDateString("en-GB")}</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.dateSeparator}>
          <MaterialCommunityIcons name="arrow-right" size={16} color="#94a3b8" />
        </View>

        <TouchableOpacity 
          style={styles.datePickerButton} 
          onPress={() => setToDatePickerVisibility(true)}
        >
          <MaterialCommunityIcons name="calendar-check" size={18} color="#6c56f9" />
          <View style={styles.dateTextContainer}>
            <Text style={styles.dateLabelText}>To</Text>
            <Text style={styles.dateValueText}>{toDate.toLocaleDateString("en-GB")}</Text>
          </View>
        </TouchableOpacity>
      </View>

      <DateTimePickerModal
        isVisible={isFromDatePickerVisible}
        mode="date"
        onConfirm={(date) => {
          setFromDatePickerVisibility(false);
          setFromDate(date);
        }}
        onCancel={() => setFromDatePickerVisibility(false)}
        maximumDate={toDate}
      />

      <DateTimePickerModal
        isVisible={isToDatePickerVisible}
        mode="date"
        onConfirm={(date) => {
          setToDatePickerVisibility(false);
          setToDate(date);
        }}
        onCancel={() => setToDatePickerVisibility(false)}
        minimumDate={fromDate}
        maximumDate={new Date()}
      />

      <View style={{ flex: 1 }}>
        {/* Loader for initial load or refresh */}
        {(loading || refreshing) ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", marginTop: 40 }}>
            <ActivityIndicator size="large" color="#6c56f9" />
          </View>
        ) : (
          <FlatList
            data={filteredTransactions}
            renderItem={renderTransactionItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#6c56f9"
                colors={["#6c56f9"]}
              />
            }
            ListEmptyComponent={renderEmptyState}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 16,
  },
  headerSpacer: {
    width: 40,
  },
  downloadButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  transactionItem: {
    marginBottom: 16,
  },
  transactionCard: {
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  transactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 4,
  },
  transactionOperator: {
    fontSize: 14,
    color: "#64748b",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  transactionDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  amountContainer: {
    flex: 1,
  },
  amountLabel: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
  },
  dateContainer: {
    flex: 1,
    alignItems: "flex-end",
  },
  dateLabel: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 14,
    color: "#64748b",
  },
  transactionFooter: {
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 12,
  },
  orderId: {
    fontSize: 12,
    color: "#94a3b8",
    marginBottom: 4,
  },
  txId: {
    fontSize: 12,
    color: "#94a3b8",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyIconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 20,
  },
  loadMoreContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  loadMoreText: {
    marginTop: 8,
    fontSize: 14,
    color: "#64748b",
  },
  datePickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
    gap: 12,
  },
  datePickerButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  dateTextContainer: {
    marginLeft: 8,
  },
  dateLabelText: {
    fontSize: 10,
    color: "#64748b",
    textTransform: "uppercase",
    fontWeight: "600",
  },
  dateValueText: {
    fontSize: 13,
    color: "#1e293b",
    fontWeight: "bold",
  },
  dateSeparator: {
    paddingHorizontal: 2,
  },
});
