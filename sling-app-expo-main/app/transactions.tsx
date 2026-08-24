import TransactionDetailModal from "@/components/TransactionDetailModal";
import Api from "@/config/Api";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useSelector } from "react-redux";
import * as Print from "expo-print";

export default function Transactions() {
  const { user, token } = useSelector((state: any) => state.auth);
  const router = useRouter();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pageNumber, setPageNumber] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("ALL");
  const [exporting, setExporting] = useState(false);
  const [fromDate, setFromDate] = useState(new Date(new Date().setMonth(new Date().getMonth() - 1)));
  const [toDate, setToDate] = useState(new Date());
  const [isFromDatePickerVisible, setFromDatePickerVisibility] = useState(false);
  const [isToDatePickerVisible, setToDatePickerVisibility] = useState(false);

  const filters = [
    { key: "ALL", label: "All", icon: "swap-horizontal" },
    { key: "CREDIT", label: "Received", icon: "arrow-down" },
    { key: "DEBIT", label: "Sent", icon: "arrow-up" },
  ];

  useEffect(() => {
    fetchTransactions(true);
  }, [fromDate, toDate]);

  useEffect(() => {
    filterTransactions();
  }, [transactions, searchQuery, selectedFilter]);

  const fetchTransactions = async (reset = false) => {
    if (loading) return;

    setLoading(true);
    const currentPage = reset ? 0 : pageNumber;

    try {
      const toDateStr = toDate.toISOString().split("T")[0];
      const fromDateStr = fromDate.toISOString().split("T")[0];

      const entityId = "TSCSLINGNEO" + user?.phone;
      const response = await Api.call(
        `/api/slingneo/transactions/${entityId}?fromDate=${fromDateStr}&toDate=${toDateStr}&pageNumber=${currentPage}&pageSize=20`,
        "GET",
        {},
        token
      );

      if (response.status === 200) {
        const newTransactions = response.data.result || [];
        if (reset) {
          setTransactions(newTransactions);
          setPageNumber(0);
        } else {
          setTransactions(prev => [...prev, ...newTransactions]);
          setPageNumber(currentPage + 1);
        }
        setHasMore(newTransactions.length === 20);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to fetch transactions");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterTransactions = () => {
    let filtered = [...transactions];

    // Filter by type
    if (selectedFilter !== "ALL") {
      filtered = filtered.filter(item =>
        item.transaction?.type === selectedFilter
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => {
        const transaction = item.transaction;
        return (
          transaction?.description?.toLowerCase().includes(query) ||
          transaction?.beneficiaryName?.toLowerCase().includes(query) ||
          transaction?.amount?.toString().includes(query) ||
          transaction?.txRef?.toString().includes(query)
        );
      });
    }

    setFilteredTransactions(filtered);
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchTransactions(true);
  }, []);

  const loadMore = () => {
    if (hasMore && !loading) {
      fetchTransactions(false);
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

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN').format(amount);
  };

  const renderTransactionItem = ({
    item,
    index,
  }: {
    item: any;
    index: number;
  }) => {
    const transaction = item.transaction;
    // Robust date handling
    const rawDate = transaction.time || transaction.date || transaction.createdAt || transaction.timestamp;
    const date = rawDate ? new Date(rawDate) : new Date();

    const formattedDate = date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const formattedTime = date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <TouchableOpacity
        onPress={() => {
          setSelectedTransaction(item.transaction);
          setIsModalVisible(true);
        }}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={["#fff", "#fafafa"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.transactionItem}
        >
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
              size={20}
              color={getTransactionColor(transaction.type)}
            />
          </LinearGradient>
          <View style={styles.transactionDetails}>
            <Text style={styles.transactionTitle}>
              {transaction.description ||
                transaction.beneficiaryName ||
                "Transaction"}
            </Text>
            <Text style={styles.transactionDate}>
              {formattedDate} • {formattedTime}
            </Text>
            <Text style={styles.transactionOrderId}>
              ID: ***{transaction.txRef?.toString().slice(-4) || "N/A"}
            </Text>
          </View>
          <View style={styles.transactionAmount}>
            <Text
              style={[
                styles.transactionAmountText,
                {
                  color: getTransactionColor(transaction.type),
                },
              ]}
            >
              {transaction.type === "CREDIT" ? "+" : "-"}₹{formatAmount(transaction.amount)}
            </Text>
            <LinearGradient
              colors={
                transaction.type === "CREDIT"
                  ? ["#dcfce7", "#bbf7d0"]
                  : ["#fee2e2", "#fecaca"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.transactionStatus}
            >
              <Text
                style={[
                  styles.transactionStatusText,
                  {
                    color:
                      transaction.type === "CREDIT" ? "#059669" : "#dc2626",
                  },
                ]}
              >
                {transaction.type === "CREDIT" ? "Received" : "Sent"}
              </Text>
            </LinearGradient>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const renderEmptyTransactions = () => (
    <LinearGradient
      colors={["#fff", "#fafafa"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.emptyTransactions}
    >
      <LinearGradient
        colors={["#f1f5f9", "#e2e8f0"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.emptyIconContainer}
      >
        <MaterialCommunityIcons name="bank-outline" size={48} color="#9ca3af" />
      </LinearGradient>
      <Text style={styles.emptyTitle}>
        {searchQuery ? "No matching transactions" : "No transactions yet"}
      </Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery
          ? "Try adjusting your search or filters"
          : "Start using your card to see your transaction history"
        }
      </Text>
    </LinearGradient>
  );

  const renderFilterButton = (filter: any) => (
    <TouchableOpacity
      key={filter.key}
      onPress={() => setSelectedFilter(filter.key)}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={
          selectedFilter === filter.key
            ? ["#6c56f9", "#8b5cf6"]
            : ["#f8fafc", "#f1f5f9"]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.filterButton}
      >
        <MaterialCommunityIcons
          name={filter.icon as any}
          size={16}
          color={selectedFilter === filter.key ? "#fff" : "#6c56f9"}
        />
        <Text
          style={[
            styles.filterButtonText,
            {
              color: selectedFilter === filter.key ? "#fff" : "#6c56f9",
            },
          ]}
        >
          {filter.label}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color="#6c56f9" />
        <Text style={styles.loadingText}>Loading more transactions...</Text>
      </View>
    );
  };

  const buildHtml = (rows: any[]) => {
    const tableRows = rows.map(item => {
      const t = item.transaction || {};
      const rawDate = t.time || t.date || t.createdAt || t.timestamp;
      const dateObj = rawDate ? new Date(rawDate) : new Date();
      const dateStr = dateObj.toLocaleDateString("en-GB");
      const timeStr = dateObj.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
      const amount = t.amount != null ? t.amount : 0;
      const isCredit = t.type === "CREDIT";
      
      return `
        <tr>
          <td>${dateStr}<br/><small style="color: #64748b;">${timeStr}</small></td>
          <td>
            <div style="font-weight: 600;">${t.description || t.beneficiaryName || "Transaction"}</div>
            <div style="font-size: 10px; color: #94a3b8;">Ref: ${t.txRef || "N/A"}</div>
          </td>
          <td style="text-align: right; color: ${isCredit ? "#10b981" : "#ef4444"}; font-weight: bold;">
            ${isCredit ? "+" : "-"} ₹${formatAmount(amount)}
          </td>
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
            td { padding: 15px; border-bottom: 1px solid #f1f5f9; font-size: 13px; vertical-align: middle; }
            .footer { margin-top: 50px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px; }
            .footer p { font-size: 11px; color: #94a3b8; margin: 5px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="brand">
              <div class="brand-name">SLING</div>
              <div class="brand-tagline">Card Statement</div>
            </div>
            <div class="statement-title">
              <h1>Statement</h1>
              <p>Generated on ${new Date().toLocaleDateString("en-GB")}</p>
            </div>
          </div>
          <div class="user-info">
            <div class="user-details">
              <h3>${user?.name || "Account Holder"}</h3>
              <p>${user?.phone}</p>
              <p>Member since ${new Date(user?.createdAt || Date.now()).getFullYear()}</p>
            </div>
            <div class="period-box">
              <p>Statement Period</p>
              <h4>${fromDate.toLocaleDateString("en-GB")} - ${toDate.toLocaleDateString("en-GB")}</h4>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th style="width: 20%">Date</th>
                <th style="width: 55%">Description</th>
                <th style="width: 25%; text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
          <div class="footer">
            <p>Important: This is a system-generated statement and does not require a physical signature.</p>
            <p>&copy; ${new Date().getFullYear()} Sling Card. All rights reserved.</p>
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
        Alert.alert("No Data", "There are no transactions to export.");
        return;
      }

      const html = buildHtml(rows);
      const { uri } = await Print.printToFileAsync({
        html,
        base64: false
      });

      const fileName = `sling_statement_${fromDate.toISOString().slice(0, 10)}_to_${toDate.toISOString().slice(0, 10)}.pdf`;
      const pdfUri = FileSystem.cacheDirectory + fileName;
      await FileSystem.moveAsync({
        from: uri,
        to: pdfUri
      });

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(pdfUri, {
          mimeType: "application/pdf",
          dialogTitle: "Download Statement",
          UTI: "com.adobe.pdf",
        });
      } else {
        Alert.alert("Exported", `Statement saved to: ${pdfUri}`);
      }
    } catch (e) {
      console.error("Export error", e);
      Alert.alert("Error", "Failed to generate PDF. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const renderHeader = () => (
    <View>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <LinearGradient
          colors={["#fff", "#fafafa"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.searchBar}
        >
          <MaterialCommunityIcons name="magnify" size={20} color="#9ca3af" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search transactions..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <MaterialCommunityIcons name="close" size={20} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </LinearGradient>
      </View>

      {/* Date Range Picker Section */}
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

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {filters.map(renderFilterButton)}
        </ScrollView>
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
          <Text style={styles.headerTitle}>Transaction History</Text>
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

      {/* Transactions List */}
      <FlatList
        data={filteredTransactions}
        renderItem={renderTransactionItem}
        keyExtractor={(item, index) => index.toString()}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyTransactions}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.1}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#6c56f9"
            colors={["#6c56f9"]}
            progressBackgroundColor="#ffffff"
          />
        }
      />

      {/* Transaction Detail Modal */}
      <TransactionDetailModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        transaction={selectedTransaction}
      />
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
    flex: 1,
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
  searchContainer: {
    paddingVertical: 16,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: "#1e293b",
  },
  filterContainer: {
    // paddingHorizontal: 20,
    paddingBottom: 16,
  },
  filterScroll: {
    gap: 12,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  transactionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 2,
  },
  transactionOrderId: {
    fontSize: 12,
    color: "#94a3b8",
  },
  transactionAmount: {
    alignItems: "flex-end",
  },
  transactionAmountText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6,
  },
  transactionStatus: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  transactionStatusText: {
    fontSize: 10,
    fontWeight: "600",
  },
  emptyTransactions: {
    alignItems: "center",
    paddingVertical: 48,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
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
  loadingFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  loadingText: {
    marginLeft: 12,
    fontSize: 14,
    color: "#64748b",
  },
  datePickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
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