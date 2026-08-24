import CardBlockModal from "@/components/CardBlockModal";
import CardManagementModal from "@/components/CardManagementModal";
import PhysicalCardRequestModal from "@/components/PhysicalCardRequestModal";
import TransactionDetailModal from "@/components/TransactionDetailModal";
import Api from "@/config/Api";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import * as Clipboard from "expo-clipboard";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ImageBackground,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";

export default function Card() {
  const { user, token } = useSelector((state: any) => state.auth);
  const router = useRouter();
  const [cardData, setCardData] = useState<any>();
  const [showCardDetails, setShowCardDetails] = useState(false);
  const [showCVV, setShowCVV] = useState(false);
  const [isCardFrozen, setIsCardFrozen] = useState(false);
  const [showCardManagementModal, setShowCardManagementModal] = useState(false);
  const [showCardBlockModal, setShowCardBlockModal] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [showPhysicalCardModal, setShowPhysicalCardModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isViewingCard, setIsViewingCard] = useState(false);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      fetchCardData();
      getRecentTransactions();
    }
  }, [isFocused]);

  const onRefresh = React.useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([fetchCardData(), getRecentTransactions()]);
    } catch (error) {
      console.error("Error refreshing data:", error);
      Alert.alert("Error", "Failed to refresh data. Please try again.");
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const fetchCardData = async () => {
    const response = await Api.call(
      "/api/slingneo/card/list",
      "POST",
      {
        entityId: "TSCSLINGNEO" + user?.phone,
      },
      token
    );
    if (response.status === 200) {
      setCardData(response.data.result || []);
    }
  };

  const getRecentTransactions = async () => {
    const today = new Date();
    const toDate = today.toISOString().split("T")[0];
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const fromDate = lastMonth.toISOString().split("T")[0];

    const entityId = "TSCSLINGNEO" + user?.phone;
    const response = await Api.call(
      `/api/slingneo/transactions/${entityId}?fromDate=${fromDate}&toDate=${toDate}&pageNumber=0&pageSize=10`,
      "GET",
      {},
      token
    );

    if (response.status === 200) {
      setRecentTransactions(response.data.result.reverse() || []);
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

  const copyVirtualCard = async () => {
    if (cardData?.cardList?.[0]) {
      try {
        await Clipboard.setStringAsync(cardData.cardList[0]);
        Alert.alert("Success", "Card number copied to clipboard");
      } catch (error) {
        Alert.alert("Error", "Failed to copy card number");
      }
    }
  };

  const handleChangePin = async () => {
    if (isChangingPin) return;

    setIsChangingPin(true);

    try {
      let body = {
        token: user?.kycDetails?.token,
        kitNo: cardData?.kitList?.[0],
        entityId: "TSCSLINGNEO" + user?.phone,
        appGuid: "123dase",
        business: "TCSLINGNEO",
        callbackUrl: "Slingeo://card-callback",
        dob: user?.kycDetails?.dateInfo?.date || "18091992",
      };

      const response = await Api.call(
        "/api/slingneo/set-pin",
        "POST",
        body,
        token
      );

      console.log("response", response);

      // Check if response contains a URL to navigate to WebView
      if (response.status === 200 && response.data?.result) {
        router.push({
          pathname: "/change-pin-webview",
          params: { url: response.data.result },
        });
      } else if (response.status === 200 && response.data?.result?.result) {
        router.push({
          pathname: "/change-pin-webview",
          params: { url: response.data.result.result },
        });
      } else {
        Alert.alert(
          "Error",
          "Unable to load PIN change page. Please try again."
        );
      }
    } catch (error) {
      console.error("Error changing PIN:", error);
      Alert.alert("Error", "Failed to initiate PIN change. Please try again.");
    } finally {
      setIsChangingPin(false);
    }
  };

  const handleViewCard = async () => {
    if (isViewingCard) return;

    setIsViewingCard(true);

    try {
      let body = {
        token: user?.kycDetails?.token,
        kitNo: cardData?.kitList?.[0],
        entityId: "TSCSLINGNEO" + user?.phone,
        appGuid: "123dase",
        business: "TCSLINGNEO",
        callbackUrl: "Slingeo://card-callback",
        dob: user?.kycDetails?.dateInfo?.date || "18091992",
      };

      const response = await Api.call(
        "/api/slingneo/card/widget",
        "POST",
        body,
        token
      );

      console.log("view card response", response);

      // Check if response contains a URL to navigate to WebView
      if (response.status === 200 && response.data?.result) {
        router.push({
          pathname: "/view-card-webview",
          params: { url: response.data.result },
        });
      } else if (response.status === 200 && response.data?.result?.result) {
        router.push({
          pathname: "/view-card-webview",
          params: { url: response.data.result.result },
        });
      } else {
        Alert.alert(
          "Error",
          "Unable to load card view page. Please try again."
        );
      }
    } catch (error) {
      console.error("Error viewing card:", error);
      Alert.alert("Error", "Failed to load card details. Please try again.");
    } finally {
      setIsViewingCard(false);
    }
  };

  const renderTransactionItem = ({
    item,
    index,
  }: {
    item: any;
    index: number;
  }) => {
    const transaction = item.transaction;
    const date = new Date(transaction.time);
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
              {transaction.type === "CREDIT" ? "+" : "-"}₹{transaction.amount}
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
      <Text style={styles.emptyTitle}>No transactions yet</Text>
      <Text style={styles.emptySubtitle}>
        Start using your card to see your transaction history
      </Text>
    </LinearGradient>
  );

  const renderHeader = () => (
    <>
      {/* Card Display */}
      {cardData?.cardList && (
        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Your SLINGNEO Card</Text>

          <TouchableOpacity
            onPress={handleViewCard}
            activeOpacity={0.8}
            disabled={isViewingCard}
          >
            <ImageBackground
              source={require("../../assets/images/cardBg.jpeg")}
              style={styles.cardContainer}
              resizeMode="contain"
            >
              <View style={styles.cardContent}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    borderRadius: 10,
                  }}
                >
                  {isViewingCard ? (
                    <>
                      <ActivityIndicator size="small" color="#fff" />
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "600",
                          color: "#fff",
                          fontFamily: "SpaceMono-Regular",
                          marginLeft: 8,
                        }}
                      >
                        Loading...
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "600",
                          color: "#fff",
                          fontFamily: "SpaceMono-Regular",
                        }}
                      >
                        View Card
                      </Text>
                      <MaterialCommunityIcons
                        name="chevron-right"
                        size={24}
                        color="white"
                      />
                    </>
                  )}
                </View>
              </View>
            </ImageBackground>
          </TouchableOpacity>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <LinearGradient
              colors={["#f8fafc", "#f1f5f9"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.actionButton}
            >
              <TouchableOpacity
                onPress={() => setShowCardBlockModal(true)}
                style={styles.actionButtonTouchable}
              >
                <Ionicons name="shield-checkmark" size={24} color="#6c56f9" />
                <Text style={styles.actionButtonText}>Card Security</Text>
              </TouchableOpacity>
            </LinearGradient>
            <LinearGradient
              colors={["#f8fafc", "#f1f5f9"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[
                styles.actionButton,
                isChangingPin && styles.disabledActionButton,
              ]}
            >
              <TouchableOpacity
                onPress={handleChangePin}
                disabled={isChangingPin}
                style={styles.actionButtonTouchable}
              >
                {isChangingPin ? (
                  <ActivityIndicator size="small" color="#6c56f9" />
                ) : (
                  <MaterialCommunityIcons
                    name="lock-reset"
                    size={24}
                    color="#6c56f9"
                  />
                )}
                <Text style={styles.actionButtonText}>
                  {isChangingPin ? "Loading..." : "Change PIN"}
                </Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
          <LinearGradient
            colors={["#f8fafc", "#f1f5f9"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.actionButton, { marginTop: 10 }]}
          >
            <TouchableOpacity
              onPress={() => setShowPhysicalCardModal(true)}
              style={styles.actionButtonTouchable}
            >
              <MaterialCommunityIcons
                name="card-account-details"
                size={24}
                color="#6c56f9"
              />
              <Text style={styles.actionButtonText}>Request Physical Card</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      )}

      {/* Recent Transactions Header */}
      <View style={styles.transactionsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Transaction History</Text>
          <TouchableOpacity
            onPress={() => {
              router.push("/transactions");
            }}
          >
            <Text style={styles.seeAllText}>See all</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
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
          <Text style={styles.headerTitle}>My Card</Text>
          <TouchableOpacity
            style={styles.manageButton}
            onPress={() => setShowCardManagementModal(true)}
          >
            <MaterialCommunityIcons name="cog" size={20} color="#fff" />
            <Text style={styles.manageButtonText}>Manage</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor="#6c56f9"
            colors={["#6c56f9"]}
          />
        }
      >
        <FlatList
          data={recentTransactions}
          renderItem={renderTransactionItem}
          keyExtractor={(item, index) => index.toString()}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyTransactions}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        />
      </ScrollView>
      {/* Card Management Modal */}
      <CardManagementModal
        visible={showCardManagementModal}
        onClose={() => setShowCardManagementModal(false)}
        onOpenCardSecurity={() => {
          setShowCardManagementModal(false);
        }}
      />

      {/* Card Block Modal */}
      <CardBlockModal
        visible={showCardBlockModal}
        onClose={() => setShowCardBlockModal(false)}
        cardData={cardData}
      />
      <TransactionDetailModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        transaction={selectedTransaction}
      />
      <PhysicalCardRequestModal
        visible={showPhysicalCardModal}
        onClose={() => setShowPhysicalCardModal(false)}
        token={token}
        user={user}
        cardData={cardData}
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
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "SpaceMono-Regular",
  },
  manageButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  manageButtonText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
    marginLeft: 6,
    fontFamily: "SpaceMono-Regular",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  cardSection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 16,
    fontFamily: "SpaceMono-Regular",
  },
  cardContainer: {
    overflow: "hidden",
    marginBottom: 20,
    height: 230,
  },
  cardContent: {
    padding: 24,
    minHeight: 200,
    justifyContent: "flex-end",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  cardType: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    opacity: 0.9,
    fontFamily: "SpaceMono-Regular",
  },
  cardHeaderActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  freezeIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  freezeText: {
    color: "#ef4444",
    fontSize: 10,
    fontWeight: "600",
    marginLeft: 4,
    fontFamily: "SpaceMono-Regular",
  },
  cardToggleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardNumber: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 2,
    marginBottom: 32,
    fontFamily: "SpaceMono-Regular",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  cardLabel: {
    color: "#fff",
    fontSize: 10,
    opacity: 0.7,
    marginBottom: 4,
    fontFamily: "SpaceMono-Regular",
  },
  cardValue: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "SpaceMono-Regular",
  },
  cardLogo: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  cardLogoText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
    fontFamily: "SpaceMono-Regular",
  },
  cardDetailsContainer: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 16,
    padding: 15,
    marginTop: 20,
  },
  cardDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  cardDetailLabel: {
    color: "#fff",
    fontSize: 12,
    opacity: 0.8,
    fontFamily: "SpaceMono-Regular",
  },
  cardDetailValue: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "SpaceMono-Regular",
  },
  quickActions: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  actionButton: {
    flex: 1,
    minWidth: "30%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionButtonText: {
    color: "#6c56f9",
    fontSize: 10,
    fontWeight: "600",
    marginLeft: 6,
    fontFamily: "SpaceMono-Regular",
  },
  actionButtonTouchable: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  transactionsSection: {
    marginTop: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  seeAllText: {
    color: "#6c56f9",
    fontSize: 10,
    fontWeight: "600",
    fontFamily: "SpaceMono-Regular",
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
    fontFamily: "SpaceMono-Regular",
  },
  transactionDate: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 2,
    fontFamily: "SpaceMono-Regular",
  },
  transactionOrderId: {
    fontSize: 12,
    color: "#94a3b8",
    fontFamily: "SpaceMono-Regular",
  },
  transactionAmount: {
    alignItems: "flex-end",
  },
  transactionAmountText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6,
    fontFamily: "SpaceMono-Regular",
  },
  transactionStatus: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  transactionStatusText: {
    fontSize: 10,
    fontWeight: "600",
    fontFamily: "SpaceMono-Regular",
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
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 8,
    fontFamily: "SpaceMono-Regular",
  },
  emptySubtitle: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 20,
    fontFamily: "SpaceMono-Regular",
  },
  cvvContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  cvvIcon: {
    marginLeft: 8,
  },
  balanceContainer: {
    marginTop: 20,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 3,
  },
  balanceCard: {
    padding: 20,
  },
  balanceContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  balanceLabel: {
    color: "#1e293b",
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "SpaceMono-Regular",
  },
  balanceAmount: {
    color: "#1e293b",
    fontSize: 12,
    fontWeight: "bold",
    fontFamily: "SpaceMono-Regular",
  },
  disabledActionButton: {
    opacity: 0.5,
  },
});
