import Api from "@/config/Api";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useSelector } from "react-redux";

const { width, height } = Dimensions.get("window");

interface ScratchCardModalProps {
  visible: boolean;
  onClose: () => void;
  scratchCard: any;
  onScratchComplete: (card: any, hasReward: boolean) => void;
}

export default function ScratchCardModal({
  visible,
  onClose,
  scratchCard,
  onScratchComplete,
}: ScratchCardModalProps) {
  const { token, user } = useSelector((state: any) => state.auth);
  const [isScratched, setIsScratched] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const scratchProgress = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  console.log(scratchCard);
  useEffect(() => {
    if (visible && scratchCard) {
      setIsScratched(false);
      setShowResult(false);
      scratchProgress.setValue(0);
      fadeAnim.setValue(0);
      
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, scratchCard]);

  const handleScratch = async () => {
    if (isScratched || loading) return;

    setLoading(true);
    try {
      // Update the scratch card to mark it as used
      const response = await Api.call(`/api/scratchcards/${scratchCard._id}`, "PUT", {
        isUsed: true,
        key: false
      }, token);
      console.log(response);
      if (response.status === 200) {
        if (scratchCard.cashbackAmount) {
          try {
            const cashbackBody = {
              amount: scratchCard.cashbackAmount,
              businessEntityId: "TSCSLINGNEO" + user?.phone,
              fromEntityId: "TCSLINGNEO",
              businessType: "TSCSLINGNEO" + user?.phone,
              description: "Scratch Card Cashback",
              toEntityId: "TSCSLINGNEO" + user?.phone,
              productId: "GENERAL",
              fromProductId: "BUSINESS",
              transactionOrigin: "MOBILE",
              externalTransactionId: "SCRATCH" + Date.now().toString(),
              transactionType: "CASHBACK_B2C",
            };

            const cashbackResponse = await Api.call(
              "/api/slingneo/load-wallet",
              "POST",
              cashbackBody,
              token
            );

            if (cashbackResponse.status === 200) {
              console.log("Cashback added successfully:", cashbackResponse.data);
            } else {
              console.error("Failed to add cashback:", cashbackResponse);
            }
          } catch (cashbackError) {
            console.error("Error adding cashback:", cashbackError);
            // Don't show error to user as scratch card was still processed
          }
        }

        // Animate scratch progress
        Animated.timing(scratchProgress, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }).start(() => {
          setIsScratched(true);
          setShowResult(true);
          onScratchComplete(scratchCard, scratchCard.key);
        });
      }
    } catch (error) {
      console.error("Error updating scratch card:", error);
      Alert.alert("Error", "Failed to process scratch card. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  const getScratchResult = () => {
    if (!scratchCard) return null;
    
    // Every scratch card has cashback, so always show success
    return {
      title: "🎉 Congratulations!",
      message: `You won ₹${scratchCard.cashbackAmount || scratchCard.amount || 50} cashback!`,
      type: "success" as const,
      icon: "gift",
      color: "#10b981",
    };
  };

  const result = getScratchResult();

  // Don't render if no scratch card is selected
  if (!scratchCard) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
      statusBarTranslucent={true}
    >
      <View style={styles.overlay}>
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
          <LinearGradient
            colors={["#ffffff", "#fafafa"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.modalCard}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>🎯 Scratch & Win</Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <MaterialCommunityIcons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {/* Scratch Card */}
            <View style={styles.scratchCardContainer}>
              <TouchableOpacity
                style={[
                  styles.scratchCard,
                  isScratched && styles.scratchCardScratched
                ]}
                onPress={handleScratch}
                activeOpacity={0.8}
                disabled={isScratched || loading}
              >
                <LinearGradient
                  colors={
                    isScratched 
                      ? ["#9ca3af", "#6b7280", "#4b5563"]
                      : ["#6c56f9", "#8b5cf6", "#a855f7"]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.scratchCardFront}
                >
                  <View style={styles.scratchCardContent}>
                    {!isScratched ? (
                      <>
                        <Text style={styles.scratchCardEmoji}>🎁</Text>
                        <Text style={styles.scratchCardText}>Tap to Scratch</Text>
                        <Text style={styles.scratchCardHint}>Win up to ₹500</Text>
                        {loading && (
                          <View style={styles.loadingOverlay}>
                            <Text style={styles.loadingText}>Scratching...</Text>
                          </View>
                        )}
                      </>
                    ) : (
                      <>
                        <Text style={styles.scratchCardEmoji}>💰</Text>
                        <Text style={styles.scratchCardText}>WON!</Text>
                        <Text style={styles.scratchCardHint}>
                          ₹{scratchCard.cashbackAmount || scratchCard.amount || 50}
                        </Text>
                      </>
                    )}
                  </View>
                  {!isScratched && <View style={styles.scratchCardShine} />}
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Result Section */}
            {showResult && result && (
              <Animated.View 
                style={[
                  styles.resultContainer,
                  { opacity: fadeAnim }
                ]}
              >
                <LinearGradient
                  colors={
                    result.type === "success" 
                      ? ["#ecfdf5", "#d1fae5"] 
                      : ["#f8fafc", "#f1f5f9"]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.resultCard}
                >
                  <View style={styles.resultIconContainer}>
                    <LinearGradient
                      colors={
                        result.type === "success" 
                          ? ["#10b981", "#059669"] 
                          : ["#6b7280", "#4b5563"]
                      }
                      style={styles.resultIcon}
                    >
                      <MaterialCommunityIcons
                        name={result.icon as any}
                        size={24}
                        color="#fff"
                      />
                    </LinearGradient>
                  </View>
                  <Text style={styles.resultTitle}>{result.title}</Text>
                  <Text style={styles.resultMessage}>{result.message}</Text>
                </LinearGradient>
              </Animated.View>
            )}

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              {!isScratched ? (
                <TouchableOpacity
                  style={styles.scratchButton}
                  onPress={handleScratch}
                  disabled={loading}
                >
                  <LinearGradient
                    colors={["#6c56f9", "#8b5cf6"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.scratchButtonGradient}
                  >
                    <MaterialCommunityIcons name="hand-pointing-up" size={20} color="#fff" />
                    <Text style={styles.scratchButtonText}>
                      {loading ? "Scratching..." : "Scratch Now"}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.closeModalButton}
                  onPress={handleClose}
                >
                  <LinearGradient
                    colors={["#10b981", "#059669"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.closeModalButtonGradient}
                  >
                    <Text style={styles.closeModalButtonText}>Close</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  container: {
    width: "100%",
    maxWidth: 350,
    alignItems: "center",
  },
  modalCard: {
    width: "100%",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
  },
  closeButton: {
    padding: 4,
  },
  scratchCardContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  scratchCard: {
    width: 200,
    height: 120,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  scratchCardScratched: {
    opacity: 0.8,
  },
  scratchCardFront: {
    flex: 1,
    borderRadius: 16,
    position: "relative",
    overflow: "hidden",
  },
  scratchCardContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  scratchCardEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  scratchCardText: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
    marginBottom: 4,
  },
  scratchCardHint: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
  },
  scratchCardShine: {
    position: "absolute",
    top: -50,
    right: -50,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
  },
  loadingText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  resultContainer: {
    marginBottom: 24,
  },
  resultCard: {
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  resultIconContainer: {
    marginBottom: 12,
  },
  resultIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    textAlign: "center",
    marginBottom: 8,
  },
  resultMessage: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 20,
  },
  buttonContainer: {
    width: "100%",
  },
  scratchButton: {
    borderRadius: 12,
    shadowColor: "#6c56f9",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  scratchButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
  },
  scratchButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  closeModalButton: {
    borderRadius: 12,
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  closeModalButtonGradient: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  closeModalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
}); 