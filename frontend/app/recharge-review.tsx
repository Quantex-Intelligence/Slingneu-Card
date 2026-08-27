import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import {
  CFDropCheckoutPayment,
  CFEnvironment,
  CFSession,
  CFThemeBuilder,
} from "cashfree-pg-api-contract";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { CFPaymentGatewayService } from "react-native-cashfree-pg-sdk";
import Api from "../config/Api";
import { useAppSelector } from "../store/hooks";

export default function RechargeReviewScreen() {
  const router = useRouter();
  const { service, number, operator, circle, plan, amount } =
    useLocalSearchParams();
  let operatorData: any = {};
  let circleData: any = {};
  let planData: any = {};

  try {
    if (typeof operator === "string" && operator.trim().startsWith("{")) {
      operatorData = JSON.parse(operator);
    } else if (operator && typeof operator === "object") {
      operatorData = operator;
    }
  } catch (e) {
    operatorData = { name: "Airtel", code: "AIRTEL" };
  }

  try {
    if (typeof circle === "string" && circle.trim().startsWith("{")) {
      circleData = JSON.parse(circle);
    } else if (circle && typeof circle === "object") {
      circleData = circle;
    }
  } catch (e) {
    circleData = { name: "Delhi & NCR", code: "DL" };
  }

  try {
    if (typeof plan === "string" && plan.trim().startsWith("{")) {
      planData = JSON.parse(plan);
    } else if (plan && typeof plan === "object") {
      planData = plan;
    }
  } catch (e) {
    planData = { planName: "Unlimited 1.5GB/Day", amount: amount || 299 };
  }


  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const user = useAppSelector((state) => state.auth.user);
  const token = useAppSelector((state) => state.auth.token);
  const currentAmountRef = useRef(amount as string);
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    // Update ref whenever amount changes
    currentAmountRef.current = amount as string;
  }, [amount]);

  useEffect(() => {
    // Set up payment callback when component mounts (native only)
    if (Platform.OS !== "web") {
      try {
        CFPaymentGatewayService.setCallback({
          async onVerify(orderID) {
            console.log("Payment verified for orderID:", orderID);
            // Process recharge after successful payment
            await processRecharge(orderID);
          },
          onError(error, orderID) {
            console.log("Payment error:", error, "for order:", orderID);
            setLoading(false);
            setError("Payment failed. Please try again.");
            Alert.alert(
              "Payment Failed",
              "Payment was not completed. Please try again.",
              [{ text: "OK" }]
            );
          },
        });
      } catch (e) {
        console.warn("Cashfree SDK not available on this platform", e);
      }
    }

    // Clean up callback when component unmounts
    return () => {
      if (Platform.OS !== "web") {
        try {
          CFPaymentGatewayService.removeCallback();
        } catch (e) {}
      }
    };
  }, []);

  const processRecharge = async (orderID: string) => {
    try {
      const rechargeOrderId = `RECHARGE_${Date.now()}_${Math.floor(
        Math.random() * 10000
      )}`;
      const body = {
        circlecode: circleData.code,
        operatorcode: operatorData.code,
        number,
        amount: Number(amount),
        orderid: rechargeOrderId,
        format: "json",
        callbackUrl: "https://your-domain.com/callback",
        paymentOrderId: orderID, // Link payment order with recharge
      };
      const res = await Api.call("/api/recharge/create", "POST", body, token);
      if (res?.status === 200 || res?.status === 201) {
        setSuccess(true);
        setTimeout(() => {
          router.replace("/recharge-transactions" as any);
        }, 1500);
      } else {
        setError(res?.data?.message || "Recharge failed. Please try again.");
      }
    } catch (e) {
      setError("Recharge failed. Please try again.");
    }
    setLoading(false);
  };

  const handlePay = async () => {
    setLoading(true);
    setError("");
    setSuccess(false);
    
    try {
      // Create Cashfree order first
      const body = {
        order_amount: amount,
        order_id: `RECHARGE_PAY_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
      };
      setOrderId(body.order_id);
      
      const res = await Api.call("/api/cashfree/orders", "POST", body, token);
      
      if (res?.status === 200 || res?.status === 201) {
        if (Platform.OS === "web") {
          await processRecharge(body.order_id);
          return;
        }

        try {
          const session = new CFSession(
            res.data.data.payment_session_id,
            res.data.data.order_id,
            CFEnvironment.SANDBOX
          );
          const theme = new CFThemeBuilder()
            .setNavigationBarBackgroundColor("#6c56f9")
            .setNavigationBarTextColor("#FFFFFF")
            .setButtonBackgroundColor("#6c56f9")
            .setButtonTextColor("#FFFFFF")
            .setPrimaryTextColor("#212121")
            .setSecondaryTextColor("#757575")
            .build();
          const dropPayment = new CFDropCheckoutPayment(session, null, theme);
          CFPaymentGatewayService.doPayment(dropPayment);
        } catch (e: any) {
          setLoading(false);
          Alert.alert("Error", "Failed to initiate payment. Please try again.");
        }
      } else {
        setLoading(false);
        Alert.alert("Error", "Failed to create payment order. Please try again.");
      }
    } catch (error) {
      setLoading(false);
      Alert.alert("Error", "Failed to process payment. Please try again.");
    }
  };

  const handleBack = () => {
    try {
      if (Platform.OS === "web") {
        router.push({
          pathname: "/recharge-plan",
          params: { service, number, operator, circle }
        } as any);
      } else if (router.canGoBack()) {
        router.back();
      } else {
        router.push({
          pathname: "/recharge-plan",
          params: { service, number, operator, circle }
        } as any);
      }
    } catch (e) {
      router.push("/recharge" as any);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#6c56f9"
        translucent={true}
      />
      <LinearGradient
        colors={["#6c56f9", "#8b5cf6", "#a855f7"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Review & Pay</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Recharge Summary</Text>
          <View style={styles.summaryRow}>
            <MaterialCommunityIcons
              name="cellphone"
              size={18}
              color="#6c56f9"
              style={styles.summaryIcon}
            />
            <Text style={styles.summaryLabel}>Service:</Text>
            <Text style={styles.summaryValue}>{service}</Text>
          </View>
          <View style={styles.summaryRow}>
            <MaterialCommunityIcons
              name="account"
              size={18}
              color="#6c56f9"
              style={styles.summaryIcon}
            />
            <Text style={styles.summaryLabel}>Number/ID:</Text>
            <Text style={styles.summaryValue}>{number}</Text>
          </View>
          <View style={styles.summaryRow}>
            <MaterialCommunityIcons
              name="cellphone-wireless"
              size={18}
              color="#6c56f9"
              style={styles.summaryIcon}
            />
            <Text style={styles.summaryLabel}>Operator:</Text>
            <Text style={styles.summaryValue}>
              {operatorData?.name || operator}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <MaterialCommunityIcons
              name="map-marker"
              size={18}
              color="#6c56f9"
              style={styles.summaryIcon}
            />
            <Text style={styles.summaryLabel}>Circle:</Text>
            <Text style={styles.summaryValue}>
              {circleData?.name || circle}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <MaterialCommunityIcons
              name="file-document"
              size={18}
              color="#6c56f9"
              style={styles.summaryIcon}
            />
            <Text style={styles.summaryLabel}>Plan:</Text>
            <Text style={styles.summaryValue}>
              {planData?.planName || plan}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <MaterialCommunityIcons
              name="currency-inr"
              size={18}
              color="#6c56f9"
              style={styles.summaryIcon}
            />
            <Text style={styles.summaryLabel}>Amount:</Text>
            <Text style={styles.summaryValue}>₹{amount}</Text>
          </View>

          {/* Plan Details Section */}
          {planData && (
            <>
              <View style={styles.sectionDivider} />
              <Text style={styles.sectionTitle}>Plan Details</Text>

              {planData.data && (
                <View style={styles.summaryRow}>
                  <MaterialCommunityIcons
                    name="wifi"
                    size={18}
                    color="#6c56f9"
                    style={styles.summaryIcon}
                  />
                  <Text style={styles.summaryLabel}>Data:</Text>
                  <Text style={styles.summaryValue}>
                    {planData.formattedData}
                  </Text>
                </View>
              )}

              {planData.talktime && (
                <View style={styles.summaryRow}>
                  <MaterialCommunityIcons
                    name="phone"
                    size={18}
                    color="#6c56f9"
                    style={styles.summaryIcon}
                  />
                  <Text style={styles.summaryLabel}>Talktime:</Text>
                  <Text style={styles.summaryValue}>
                    {planData.talktime} minutes
                  </Text>
                </View>
              )}

              {planData.sms && (
                <View style={styles.summaryRow}>
                  <MaterialCommunityIcons
                    name="message-text"
                    size={18}
                    color="#6c56f9"
                    style={styles.summaryIcon}
                  />
                  <Text style={styles.summaryLabel}>SMS:</Text>
                  <Text style={styles.summaryValue}>{planData.sms} SMS</Text>
                </View>
              )}

              {planData.validity && (
                <View style={styles.summaryRow}>
                  <MaterialCommunityIcons
                    name="calendar"
                    size={18}
                    color="#6c56f9"
                    style={styles.summaryIcon}
                  />
                  <Text style={styles.summaryLabel}>Validity:</Text>
                  <Text style={styles.summaryValue}>
                    {planData.formattedValidity}
                  </Text>
                </View>
              )}

              {planData.description && (
                <View style={styles.summaryRow}>
                  <MaterialCommunityIcons
                    name="information"
                    size={18}
                    color="#6c56f9"
                    style={styles.summaryIcon}
                  />
                  <Text style={styles.summaryLabel}>Description:</Text>
                  <Text style={styles.summaryValue}>
                    {planData.description}
                  </Text>
                </View>
              )}

              {planData.benefits && planData.benefits.length > 0 && (
                <View style={styles.benefitsSection}>
                  <Text style={styles.benefitsTitle}>Benefits:</Text>
                  {planData.benefits.map((benefit: string, index: number) => (
                    <Text key={index} style={styles.benefitItem}>
                      • {benefit}
                    </Text>
                  ))}
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
      <TouchableOpacity
        style={styles.payButton}
        activeOpacity={0.85}
        onPress={handlePay}
        disabled={loading || success}
      >
        <LinearGradient
          colors={["#6c56f9", "#8b5cf6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.payButtonGradient}
        >
          <Text style={styles.payButtonText}>
            {loading
              ? "Processing..."
              : success
              ? "Success!"
              : "Process to Pay"}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
      {error ? (
        <Text style={{ color: "red", textAlign: "center" }}>{error}</Text>
      ) : null}
      {success ? (
        <Text style={{ color: "green", textAlign: "center" }}>
          Recharge Successful!
        </Text>
      ) : null}
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 99,
    cursor: "pointer" as any,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "SpaceMono-Regular",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#6c56f9",
    marginBottom: 16,
    fontFamily: "SpaceMono-Regular",
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  summaryIcon: {
    marginRight: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "600",
    width: 90,
    fontFamily: "SpaceMono-Regular",
  },
  summaryValue: {
    fontSize: 12,
    color: "#1e293b",
    fontWeight: "600",
    fontFamily: "SpaceMono-Regular",
  },
  payButton: {
    margin: 20,
    borderRadius: 16,
    overflow: "hidden",
  },
  payButtonGradient: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 16,
  },
  payButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    fontFamily: "SpaceMono-Regular",
  },
  sectionDivider: {
    height: 1,
    backgroundColor: "#e2e8f0",
    marginVertical: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#6c56f9",
    marginBottom: 10,
    fontFamily: "SpaceMono-Regular",
  },
  benefitsSection: {
    marginTop: 10,
  },
  benefitsTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#6c56f9",
    marginBottom: 5,
    fontFamily: "SpaceMono-Regular",
  },
  benefitItem: {
    fontSize: 12,
    color: "#475569",
    fontFamily: "SpaceMono-Regular",
  },
});
