import Api from "@/config/Api";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import {
  CFDropCheckoutPayment,
  CFEnvironment,
  CFSession,
  CFThemeBuilder,
} from "cashfree-pg-api-contract";
import { Audio } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { CFPaymentGatewayService } from "react-native-cashfree-pg-sdk";
import { useSelector } from "react-redux";
import PaymentSuccessModal from "./PaymentSuccessModal";
import ScratchCardModal from "./ScratchCardModal";

interface AddMoneyModalProps {
  visible: boolean;
  onClose: () => void;
  maxAmount?: number;
}

export default function AddMoneyModal({
  visible,
  onClose,
  maxAmount,
}: AddMoneyModalProps) {
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { token, user } = useSelector((state: any) => state.auth);
  const currentAmountRef = useRef("");
  const [orderId, setOrderId] = useState("");
  const [scratchCardEarned, setScratchCardEarned] = useState(false);
  const [scratchCardHasReward, setScratchCardHasReward] = useState(false);
  const [createdScratchCard, setCreatedScratchCard] = useState<any>(null);
  const [showScratchModal, setShowScratchModal] = useState(false); 
  const soundRef = useRef<Audio.Sound | null>(null);

  const playSuccessSound = async () => {
    try {
      // Unload previous sound if exists
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      
      // Create and load the sound
      const { sound } = await Audio.Sound.createAsync(
        require("../assets/sounds/yipee.mp3"),
        { shouldPlay: false }
      );
      
      // Store reference to current sound
      soundRef.current = sound;
      
      // Set up status update handler
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
          soundRef.current = null;
        }
      });
      
      // Play the sound
      try {
        await sound.playAsync();
      } catch (playError) {
        console.log("Error playing sound:", playError);
        // If play fails, unload the sound immediately
        sound.unloadAsync();
        soundRef.current = null;
        return;
      }
      
      // Ensure sound is unloaded after a delay as fallback
      setTimeout(() => {
        if (soundRef.current) {
          soundRef.current.unloadAsync();
          soundRef.current = null;
        }
      }, 3000);
      
    } catch (error) {
      console.log("Error playing sound:", error);
      // Don't let audio errors affect the main flow
    }
  };

  useEffect(() => {
    // Update ref whenever amount changes
    currentAmountRef.current = amount;
  }, [amount]);

  useEffect(() => {
    // Set up payment callback when component mounts
    CFPaymentGatewayService.setCallback({
      async onVerify(orderID) {
        console.log("orderID", orderID, currentAmountRef.current);

        addMoney(orderID);
      },
      onError(error, orderID) {
        /**
         * Configure Error callback
         */
        console.log("Payment error:", error, "for order:", orderID);
        Alert.alert(
          "Payment Failed",
          "Payment was not completed. Please try again.",
          [{ text: "OK" }]
        );
      },
    });

    // Clean up callback when component unmounts
    return () => {
      CFPaymentGatewayService.removeCallback();
      // Clean up any playing sound
      if (soundRef.current) {
        soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    };
  }, [onClose]);

  const addMoney = async (orderID: string) => {
    let body = {
      amount: currentAmountRef.current || 0,
      businessEntityId: "TSCSLINGNEO" + user?.phone,
      fromEntityId: "TCSLINGNEO",
      businessType: "TSCSLINGNEO" + user?.phone,
      description: "Add Money",
      toEntityId: "TSCSLINGNEO" + user?.phone,
      productId: "GENERAL",
      fromProductId: "BUSINESS",
      transactionOrigin: "MOBILE",
      externalTransactionId: orderID,
      transactionType: "B2C",
    };
    console.log(body);
    const response = await Api.call(
      "/api/slingneo/load-wallet",
      "POST",
      body,
      token
    );
    console.log("response", response);
    console.log(response.data);
    if (response.status === 200) {
      const scratchCardCreated = await createScratchCard(parseFloat(currentAmountRef.current || "0"));
      setAmount("");
      setIsLoading(false);
      await playSuccessSound();
            if (!scratchCardCreated) {
        setShowSuccess(true);
      }
    } else {
      Alert.alert(
        "Payment Failed",
        "Payment was not completed. Please try again.",
        [{ text: "OK" }]
      );
    }
  };

  // Create scratch card after successful payment
  const createScratchCard = async (amount: number) => {
    try {
      const scratchCardBody = {
        userId: user?._id,
        amount: amount
      };
      
      console.log("Creating scratch card:", scratchCardBody);
      const scratchCardResponse = await Api.call(
        "/api/scratchcards",
        "POST",
        scratchCardBody,
        token
      );
      
      if (scratchCardResponse.status === 201) {
        console.log("Scratch card created successfully:", scratchCardResponse.data);
        
        // Store the created scratch card
        setCreatedScratchCard(scratchCardResponse.data.scratchCard);
        
        // Set scratch card state for success modal
        setScratchCardEarned(true);
        setScratchCardHasReward(scratchCardResponse.data.scratchCard.key || false);
        
        // Show scratch card modal
        setShowScratchModal(true);
        
        return true; // Indicate that scratch card was created
      } else {
        console.log("Scratch card creation failed:", scratchCardResponse);
        return false;
      }
    } catch (error) {
      console.error("Error creating scratch card:", error);
      // Don't show error to user as payment was successful
      return false;
    }
  };

  const handleSubmit = () => {
    if (!amount.trim()) {
      Alert.alert("Error", "Please enter an amount");
      return;
    }
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }
    if (maxAmount !== undefined && amountValue > maxAmount) {
      Alert.alert(
        "Limit exceeded",
        `You can add at most ₹${maxAmount.toLocaleString()}`
      );
      setAmount(maxAmount.toString());
      return;
    }
    setIsLoading(true);
    handleAddMoney({
      amount: amount,
    });
  };

  // Handle scratch completion from modal
  const handleScratchComplete = (card: any, hasReward: boolean) => {
    // Scratch card was used, we can close the modal and show success
    setShowScratchModal(false);
    setShowSuccess(true);
  };

  // Handle scratch modal close
  const handleCloseScratchModal = () => {
    setShowScratchModal(false);
    // Show success modal after scratch card is closed
    setShowSuccess(true);
  };

  const handleClose = () => {
    // Clean up any playing sound
    if (soundRef.current) {
      soundRef.current.unloadAsync();
      soundRef.current = null;
    }
    
    setAmount("");
    setIsLoading(false);
    setScratchCardEarned(false);
    setScratchCardHasReward(false);
    setCreatedScratchCard(null);
    setShowScratchModal(false);
    onClose();
  };

  const handleAddMoney = async (data: { amount: string }) => {
    console.log("data",data)
    try {
      const body = {
        order_amount: data.amount,
        order_id: new Date().getTime().toString(),
      };
      setOrderId(body.order_id);
      const res = await Api.call("/api/cashfree/orders", "POST", body, token);
      console.log("res",res)
      try {
        const session = new CFSession(
          res.data.data.payment_session_id,
          res.data.data.order_id,
          CFEnvironment.SANDBOX
        );
        const theme = new CFThemeBuilder()
          .setNavigationBarBackgroundColor("#E64A19")
          .setNavigationBarTextColor("#FFFFFF")
          .setButtonBackgroundColor("#FFC107")
          .setButtonTextColor("#FFFFFF")
          .setPrimaryTextColor("#212121")
          .setSecondaryTextColor("#757575")
          .build();
        const dropPayment = new CFDropCheckoutPayment(session, null, theme);
        CFPaymentGatewayService.doPayment(dropPayment);
      } catch (e: any) {
        console.log("error", e);
        Alert.alert("Error", "Failed to initiate payment. Please try again.");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to add money. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Modal
        visible={visible && !showSuccess}
        animationType="slide"
        transparent={true}
        onRequestClose={handleClose}
        statusBarTranslucent={true}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContainer}>
            <LinearGradient
              colors={["#6c56f9", "#8b5cf6", "#a855f7"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.modalHeader}
            >
              <View style={styles.headerContent}>
                <View style={styles.headerIconContainer}>
                  <MaterialCommunityIcons
                    name="wallet-plus"
                    size={24}
                    color="#fff"
                  />
                </View>
                <Text style={styles.modalTitle}>Add Money</Text>
                <TouchableOpacity
                  onPress={handleClose}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            </LinearGradient>

            <ScrollView
              style={styles.modalBody}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Amount (₹)</Text>
                <View style={styles.inputWrapper}>
                  <LinearGradient
                    colors={["#f8fafc", "#f1f5f9"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.inputBackground}
                  >
                    <TextInput
                      style={styles.textInput}
                      placeholder="Enter amount"
                      placeholderTextColor="#94a3b8"
                      value={amount}
                      onChangeText={(text: string) => {
                        const sanitized = text.replace(/[^0-9.]/g, "");
                        if (sanitized === "") {
                          setAmount("");
                          return;
                        }
                        let value = parseFloat(sanitized);
                        if (isNaN(value) || value <= 0) {
                          setAmount("");
                          return;
                        }
                        if (maxAmount !== undefined && value > maxAmount) {
                          value = maxAmount;
                        }
                        setAmount(value.toString());
                      }}
                      keyboardType="numeric"
                      returnKeyType="next"
                    />
                    <View style={styles.inputIcon}>
                      <MaterialCommunityIcons
                        name="currency-inr"
                        size={20}
                        color="#6c56f9"
                      />
                    </View>
                  </LinearGradient>
                </View>
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  onPress={handleClose}
                  style={styles.cancelButton}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <LinearGradient
                  colors={["#6c56f9", "#8b5cf6"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[
                    styles.submitButton,
                    isLoading && styles.submitButtonDisabled,
                  ]}
                >
                  <TouchableOpacity
                    onPress={handleSubmit}
                    style={styles.submitButtonTouchable}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <MaterialCommunityIcons
                          name="loading"
                          size={20}
                          color="#fff"
                        />
                        <Text style={styles.submitButtonText}>Processing...</Text>
                      </>
                    ) : (
                      <>
                        <MaterialCommunityIcons
                          name="check"
                          size={20}
                          color="#fff"
                        />
                        <Text style={styles.submitButtonText}>Add Money</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      {/* Scratch Card Modal */}
      {createdScratchCard && (
        <ScratchCardModal
          visible={showScratchModal}
          onClose={handleCloseScratchModal}
          scratchCard={createdScratchCard}
          onScratchComplete={handleScratchComplete}
        />
      )}

      <PaymentSuccessModal
        visible={showSuccess}
        onClose={() => {
          setShowSuccess(false);
          onClose();
        }}
        onViewReceipt={() => {
          setShowSuccess(false);
          router.push("/transactions");
          onClose();
        }}
        scratchCardEarned={scratchCardEarned}
        scratchCardHasReward={scratchCardHasReward}
      />
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 24,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
    textAlign: "center",
    marginLeft: 16,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalBody: {
    padding: 24,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 8,
  },
  inputWrapper: {
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  inputBackground: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  textInput: {
    fontSize: 16,
    color: "#1e293b",
    paddingVertical: 16,
    paddingRight: 48,
    fontWeight: "500",
  },
  inputIcon: {
    position: "absolute",
    right: 16,
    top: 16,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 16,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#64748b",
  },
  submitButton: {
    flex: 2,
    borderRadius: 16,
    shadowColor: "#6c56f9",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonTouchable: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginLeft: 8,
  },
});
