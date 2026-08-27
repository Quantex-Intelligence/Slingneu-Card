import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import Api from "../config/Api";

export default function RechargePlanScreen() {
  const router = useRouter();
  const { service, number, operator, circle } = useLocalSearchParams();
let operatorData = JSON.parse(operator as string);
let circleData = JSON.parse(circle as string);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPlanDetails, setSelectedPlanDetails] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    async function fetchPlans() {
      setLoading(true);
      setError("");
      try {
        const res = await Api.call(`/api/recharge-plans/plans/${operatorData.code}/${circleData.code}`, "GET");
        let loadedPlans = res?.data?.data || [];
        if (!loadedPlans.length) {
          loadedPlans = [
            {
              planId: "p1",
              planName: "Unlimited 1.5GB/Day",
              amount: 299,
              description: "Truly Unlimited Calls + 1.5GB/day Data + 100 SMS/day",
              validity: 28,
              validityType: "days",
              data: 1.5,
              dataUnit: "GB/day",
              talktime: 100,
              isPopular: true,
              isBestSeller: true,
            },
            {
              planId: "p2",
              planName: "Super Saver 2GB/Day",
              amount: 349,
              description: "Truly Unlimited Calls + 2GB/day Data + 100 SMS/day + OTT Benefits",
              validity: 28,
              validityType: "days",
              data: 2.0,
              dataUnit: "GB/day",
              talktime: 100,
              isSpecialOffer: true,
            },
            {
              planId: "p3",
              planName: "Annual Value Pack",
              amount: 2999,
              description: "Truly Unlimited Calls + 2.5GB/day Data + 100 SMS/day for 365 Days",
              validity: 365,
              validityType: "days",
              data: 2.5,
              dataUnit: "GB/day",
              talktime: 100,
              isBestSeller: true,
            },
            {
              planId: "p4",
              planName: "Data Booster 6GB",
              amount: 61,
              description: "High speed 6GB Data Add-on (Existing Plan Validity)",
              validity: 0,
              data: 6,
              dataUnit: "GB",
            }
          ];
        }
        setPlans(loadedPlans);
      } catch (e) {
        console.log("Notice loading plans, using default plans:", e);
        setPlans([
          {
            planId: "p1",
            planName: "Unlimited 1.5GB/Day",
            amount: 299,
            description: "Truly Unlimited Calls + 1.5GB/day Data + 100 SMS/day",
            validity: 28,
            validityType: "days",
            data: 1.5,
            dataUnit: "GB/day",
            talktime: 100,
            isPopular: true,
          },
          {
            planId: "p2",
            planName: "Super Saver 2GB/Day",
            amount: 349,
            description: "Truly Unlimited Calls + 2GB/day Data + 100 SMS/day",
            validity: 28,
            validityType: "days",
            data: 2.0,
            dataUnit: "GB/day",
            talktime: 100,
          }
        ]);
      }
      setLoading(false);
    }
    fetchPlans();
  }, [operator, circle]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6c56f9" translucent={true} />
      <LinearGradient
        colors={["#6c56f9", "#8b5cf6", "#a855f7"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Plan</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <Text>Loading...</Text>
        ) : error ? (
          <Text style={{ color: 'red' }}>{error}</Text>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Choose a Plan</Text>
            <View style={styles.plansGrid}>
              {plans.map((plan) => (
                <TouchableOpacity
                  key={plan.planId}
                  style={[styles.planButton, selectedPlan === plan.planId && styles.selectedPlanButton]}
                  onPress={() => {
                    setSelectedPlan(plan.planId);
                    setSelectedPlanDetails(plan);
                    setModalVisible(true);
                  }}
                >
                  {/* Plan Header */}
                  <View style={styles.planHeader}>
                    <Text style={styles.planName}>{plan.planName}</Text>
                    <Text style={styles.planAmount}>₹{plan.amount}</Text>
                  </View>

                  {/* Plan Description */}
                  {plan.description && (
                    <Text style={styles.planDescription}>{plan.description}</Text>
                  )}

                  {/* Key Details Only */}
                  <View style={styles.planDetailsGrid}>
                    {/* Validity */}
                    {plan.validity && (
                      <View style={styles.detailItem}>
                        <Ionicons name="time-outline" size={14} color="#64748b" />
                        <Text style={styles.detailText}>
                          {plan.validity} {plan.validityType || 'days'}
                        </Text>
                      </View>
                    )}

                    {/* Data */}
                    {plan.data && plan.data > 0 && (
                      <View style={styles.detailItem}>
                        <Ionicons name="cellular-outline" size={14} color="#64748b" />
                        <Text style={styles.detailText}>
                          {plan.data} {plan.dataUnit || 'MB'}
                        </Text>
                      </View>
                    )}

                    {/* Talktime */}
                    {plan.talktime && plan.talktime > 0 && (
                      <View style={styles.detailItem}>
                        <Ionicons name="call-outline" size={14} color="#64748b" />
                        <Text style={styles.detailText}>
                          {plan.talktime} min
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Special Offer Badge */}
                  {plan.isSpecialOffer && (
                    <View style={styles.offerBadge}>
                      <Ionicons name="gift-outline" size={12} color="#f59e0b" />
                      <Text style={styles.offerBadgeText}>Special Offer</Text>
                    </View>
                  )}

                  {/* Popular/Best Seller Badges */}
                  <View style={styles.badgeContainer}>
                    {plan.isPopular && (
                      <View style={styles.popularBadge}>
                        <Text style={styles.badgeText}>Popular</Text>
                      </View>
                    )}
                    {plan.isBestSeller && (
                      <View style={styles.bestSellerBadge}>
                        <Text style={styles.badgeText}>Best Seller</Text>
                      </View>
                    )}
                  </View>

                  {/* View Details Button */}
                  <TouchableOpacity 
                    style={styles.viewDetailsButton}
                    onPress={() => {
                      setSelectedPlanDetails(plan);
                      setModalVisible(true);
                    }}
                  >
                    <Text style={styles.viewDetailsText}>View Details</Text>
                    <Ionicons name="chevron-forward" size={14} color="#6c56f9" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
        <TouchableOpacity
          style={styles.nextButton}
          onPress={() => {
            const plan = plans.find((p) => p.planId === selectedPlan);
            router.push({
              pathname: "/recharge-review",
              params: {
                service,
                number,
                operator:JSON.stringify(operatorData),
                circle:JSON.stringify(circleData),
                plan: JSON.stringify(plan),
                amount: plan ? plan.amount : "",
              },
            });
          }}
          disabled={!selectedPlan}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={["#6c56f9", "#8b5cf6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.nextButtonGradient}
          >
            <Text style={styles.nextButtonText}>Next</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>

      {/* Plan Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Plan Details</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>
            
            {selectedPlanDetails && (
              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                {/* Plan Header */}
                <View style={styles.modalPlanHeader}>
                  <Text style={styles.modalPlanName}>{selectedPlanDetails.planName}</Text>
                  <Text style={styles.modalPlanAmount}>₹{selectedPlanDetails.amount}</Text>
                </View>

                {/* Description */}
                {selectedPlanDetails.description && (
                  <Text style={styles.modalDescription}>{selectedPlanDetails.description}</Text>
                )}

                {/* All Details Grid */}
                <View style={styles.modalDetailsGrid}>
                  {/* Validity */}
                  {selectedPlanDetails.validity && (
                    <View style={styles.modalDetailItem}>
                      <Ionicons name="time-outline" size={16} color="#6c56f9" />
                      <View>
                        <Text style={styles.modalDetailLabel}>Validity</Text>
                        <Text style={styles.modalDetailValue}>
                          {selectedPlanDetails.validity} {selectedPlanDetails.validityType || 'days'}
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* Data */}
                  {selectedPlanDetails.data && selectedPlanDetails.data > 0 && (
                    <View style={styles.modalDetailItem}>
                      <Ionicons name="cellular-outline" size={16} color="#6c56f9" />
                      <View>
                        <Text style={styles.modalDetailLabel}>Data</Text>
                        <Text style={styles.modalDetailValue}>
                          {selectedPlanDetails.data} {selectedPlanDetails.dataUnit || 'MB'}
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* Talktime */}
                  {selectedPlanDetails.talktime && selectedPlanDetails.talktime > 0 && (
                    <View style={styles.modalDetailItem}>
                      <Ionicons name="call-outline" size={16} color="#6c56f9" />
                      <View>
                        <Text style={styles.modalDetailLabel}>Talktime</Text>
                        <Text style={styles.modalDetailValue}>{selectedPlanDetails.talktime} min</Text>
                      </View>
                    </View>
                  )}

                  {/* SMS */}
                  {selectedPlanDetails.sms && selectedPlanDetails.sms > 0 && (
                    <View style={styles.modalDetailItem}>
                      <Ionicons name="chatbubble-outline" size={16} color="#6c56f9" />
                      <View>
                        <Text style={styles.modalDetailLabel}>SMS</Text>
                        <Text style={styles.modalDetailValue}>{selectedPlanDetails.sms} SMS</Text>
                      </View>
                    </View>
                  )}
                </View>

                {/* Features */}
                {selectedPlanDetails.features && selectedPlanDetails.features.length > 0 && (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Features</Text>
                    {selectedPlanDetails.features.map((feature: string, index: number) => (
                      <View key={index} style={styles.modalListItem}>
                        <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                        <Text style={styles.modalListText}>{feature}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Benefits */}
                {selectedPlanDetails.benefits && selectedPlanDetails.benefits.length > 0 && (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Benefits</Text>
                    {selectedPlanDetails.benefits.map((benefit: string, index: number) => (
                      <View key={index} style={styles.modalListItem}>
                        <Ionicons name="star" size={16} color="#f59e0b" />
                        <Text style={styles.modalListText}>{benefit}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Special Offer */}
                {selectedPlanDetails.isSpecialOffer && selectedPlanDetails.offerDescription && (
                  <View style={styles.modalOfferContainer}>
                    <Ionicons name="gift" size={20} color="#f59e0b" />
                    <View>
                      <Text style={styles.modalOfferTitle}>Special Offer</Text>
                      <Text style={styles.modalOfferText}>{selectedPlanDetails.offerDescription}</Text>
                    </View>
                  </View>
                )}

                {/* Terms */}
                {selectedPlanDetails.terms && selectedPlanDetails.terms.length > 0 && (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Terms & Conditions</Text>
                    {selectedPlanDetails.terms.map((term: string, index: number) => (
                      <View key={index} style={styles.modalListItem}>
                        <Ionicons name="information-circle" size={16} color="#64748b" />
                        <Text style={styles.modalListText}>{term}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Select Plan Button */}
                <TouchableOpacity
                  style={styles.modalSelectButton}
                  onPress={() => {
                    setSelectedPlan(selectedPlanDetails.planId);
                    setModalVisible(false);
                  }}
                >
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
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
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 8,
    fontFamily: "SpaceMono-Regular",
  },
  plansGrid: {
    gap: 10,
    marginBottom: 16,
  },
  planButton: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 8,
  },
  selectedPlanButton: {
    borderWidth: 2,
    borderColor: "#6c56f9",
  },
  planButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#64748b",
    fontFamily: "SpaceMono-Regular",
  },
  planHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  planName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "SpaceMono-Regular",
    flex: 1,
  },
  planAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#6c56f9",
    fontFamily: "SpaceMono-Regular",
  },
  planDescription: {
    fontSize: 12,
    color: "#64748b",
    fontFamily: "SpaceMono-Regular",
    marginBottom: 12,
    lineHeight: 16,
  },
  planDetailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  detailText: {
    fontSize: 11,
    color: "#64748b",
    fontFamily: "SpaceMono-Regular",
  },
  featuresContainer: {
    marginBottom: 8,
  },
  featuresTitle: {
    fontSize: 11,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "SpaceMono-Regular",
    marginBottom: 4,
  },
  featuresList: {
    gap: 2,
  },
  featureText: {
    fontSize: 10,
    color: "#64748b",
    fontFamily: "SpaceMono-Regular",
  },
  moreFeatures: {
    fontSize: 9,
    color: "#6c56f9",
    fontFamily: "SpaceMono-Regular",
    fontStyle: "italic",
  },
  benefitsContainer: {
    marginBottom: 8,
  },
  benefitsTitle: {
    fontSize: 11,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "SpaceMono-Regular",
    marginBottom: 4,
  },
  benefitsList: {
    gap: 2,
  },
  benefitText: {
    fontSize: 10,
    color: "#64748b",
    fontFamily: "SpaceMono-Regular",
  },
  moreBenefits: {
    fontSize: 9,
    color: "#6c56f9",
    fontFamily: "SpaceMono-Regular",
    fontStyle: "italic",
  },
  offerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fef3c7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  offerText: {
    fontSize: 10,
    color: "#92400e",
    fontFamily: "SpaceMono-Regular",
    flex: 1,
  },
  badgeContainer: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 8,
  },
  popularBadge: {
    backgroundColor: "#fef3c7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  bestSellerBadge: {
    backgroundColor: "#dbeafe",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 8,
    fontWeight: "600",
    color: "#92400e",
    fontFamily: "SpaceMono-Regular",
  },
  termsContainer: {
    marginTop: 4,
  },
  termsTitle: {
    fontSize: 10,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "SpaceMono-Regular",
    marginBottom: 2,
  },
  termText: {
    fontSize: 9,
    color: "#64748b",
    fontFamily: "SpaceMono-Regular",
  },
  moreTerms: {
    fontSize: 8,
    color: "#6c56f9",
    fontFamily: "SpaceMono-Regular",
    fontStyle: "italic",
  },
  offerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#fef3c7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  offerBadgeText: {
    fontSize: 9,
    color: "#92400e",
    fontFamily: "SpaceMono-Regular",
    fontWeight: "600",
  },
  viewDetailsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  viewDetailsText: {
    fontSize: 12,
    color: "#6c56f9",
    fontFamily: "SpaceMono-Regular",
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "90%",
    maxHeight: "80%",
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    fontFamily: "SpaceMono-Regular",
  },
  modalBody: {
    padding: 20,
  },
  modalPlanHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  modalPlanName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    fontFamily: "SpaceMono-Regular",
    flex: 1,
  },
  modalPlanAmount: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#6c56f9",
    fontFamily: "SpaceMono-Regular",
  },
  modalDescription: {
    fontSize: 14,
    color: "#64748b",
    fontFamily: "SpaceMono-Regular",
    marginBottom: 16,
    lineHeight: 20,
  },
  modalDetailsGrid: {
    gap: 12,
    marginBottom: 20,
  },
  modalDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
  },
  modalDetailLabel: {
    fontSize: 12,
    color: "#64748b",
    fontFamily: "SpaceMono-Regular",
  },
  modalDetailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "SpaceMono-Regular",
  },
  modalSection: {
    marginBottom: 20,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e293b",
    fontFamily: "SpaceMono-Regular",
    marginBottom: 12,
  },
  modalListItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  modalListText: {
    fontSize: 14,
    color: "#374151",
    fontFamily: "SpaceMono-Regular",
    flex: 1,
  },
  modalOfferContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#fef3c7",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  modalOfferTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#92400e",
    fontFamily: "SpaceMono-Regular",
    marginBottom: 4,
  },
  modalOfferText: {
    fontSize: 12,
    color: "#92400e",
    fontFamily: "SpaceMono-Regular",
  },
  modalSelectButton: {
    marginTop: 20,
    borderRadius: 12,
    overflow: "hidden",
  },
  modalSelectButtonGradient: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
  },
  modalSelectButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "SpaceMono-Regular",
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 16,
  },
  rupee: {
    fontSize: 14,
    color: "#6c56f9",
    fontFamily: "SpaceMono-Regular",
    marginRight: 4,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: "#1e293b",
    fontFamily: "SpaceMono-Regular",
  },
  nextButton: {
    marginTop: 24,
    borderRadius: 16,
    overflow: "hidden",
  },
  nextButtonGradient: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 16,
    marginBottom:40
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    fontFamily: "SpaceMono-Regular",
  },
});