import ScratchCardModal from "@/components/ScratchCardModal";
import Api from "@/config/Api";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  RefreshControl,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";

const { width } = Dimensions.get("window");

const RewardsScreen = () => {
  const [activeTab, setActiveTab] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { user, token } = useSelector((state: any) => state.auth);
  const [cashbackOffers, setCashbackOffers] = useState<any[]>([]);
  const [scratchCards, setScratchCards] = useState<any[]>([]);
  const [loadingScratchCards, setLoadingScratchCards] = useState(false);
  const [selectedScratchCard, setSelectedScratchCard] = useState<any>(null);
  const [showScratchModal, setShowScratchModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isFocused = useIsFocused();

  const tabs = [
    { id: 0, title: "Cashback Offers", icon: "gift", color: "#FF6B6B" },
    { id: 1, title: "Scratch & Win", icon: "cards", color: "#4ECDC4" },
    {
      id: 2,
      title: "Referral Program",
      icon: "account-group",
      color: "#6c56f9",
    },
  ];

  const fetchAllData = async () => {
    try {
      const [cashbackResponse, scratchCardsResponse] = await Promise.all([
        Api.call("/api/cashbacks", "GET", {}, token),
        user?._id ? Api.call(`/api/scratchcards/user/${user._id}`, "GET", {}, token) : null
      ]);

      if (cashbackResponse.status === 200) {
        setCashbackOffers(cashbackResponse.data.cashbacks);
      }

      if (scratchCardsResponse?.status === 200) {
        setScratchCards(scratchCardsResponse.data.scratchCards || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      Alert.alert("Error", "Failed to refresh data. Please try again.");
    }
  };

  const onRefresh = React.useCallback(async () => {
    setIsRefreshing(true);
    try {
      await fetchAllData();
    } finally {
      setIsRefreshing(false);
    }
  }, [user?._id, token]);

  useEffect(() => {
    fetchAllData();
  }, []);

  // Fetch user's scratch cards
  useEffect(() => {
    const fetchScratchCards = async () => {
      if (!user?._id) return;
      
      setLoadingScratchCards(true);
      try {
        const response = await Api.call(`/api/scratchcards/user/${user._id}`, "GET", {}, token);
        if (response.status === 200) {
          setScratchCards(response.data.scratchCards || []);
        }
      } catch (error) {
        console.error("Error fetching scratch cards:", error);
      } finally {
        setLoadingScratchCards(false);
      }
    };

    fetchScratchCards();
  }, [user?._id, token , isFocused]);

  // Handle scratch card tap
  const handleScratchCard = (scratchCard: any) => {
    if (scratchCard.isUsed) {
      Alert.alert("Already Used", "This scratch card has already been used!");
      return;
    }

    setSelectedScratchCard(scratchCard);
    setShowScratchModal(true);
  };

  // Handle scratch completion from modal
  const handleScratchComplete = (card: any, hasReward: boolean) => {
    // Update local state
    setScratchCards(prevCards => 
      prevCards.map(prevCard => 
        prevCard._id === card._id 
          ? { ...prevCard, isUsed: true, key: false }
          : prevCard
      )
    );
  };

  // Handle modal close
  const handleCloseScratchModal = () => {
    setShowScratchModal(false);
    setSelectedScratchCard(null);
  };

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [activeTab]);

  const renderCashbackOffers = () => (
    <Animated.View style={[styles.tabContent, { opacity: fadeAnim }]}>
      <View style={styles.offersGrid}>
        {cashbackOffers.map((offer, index) => (
          <TouchableOpacity
            key={offer._id}
            style={styles.offerCardContainer}
            activeOpacity={0.9}
            // onPress={() => Alert.alert("Offer Details", offer.description)}
          >
            <LinearGradient
              colors={["#fff", "#f8fafc"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.offerCard}
            >
              {/* Offer Image */}
              {offer.image && (
                <View style={styles.offerImageContainer}>
                  <Image
                    source={{ uri: offer.image }}
                    style={styles.offerImage}
                    resizeMode="cover"
                  />
                  <LinearGradient
                    colors={["transparent", "rgba(0,0,0,0.3)"]}
                    style={styles.offerImageOverlay}
                  />
                  <View style={styles.offerBadge}>
                    <Text style={styles.offerBadgeText}>HOT</Text>
                  </View>
                </View>
              )}

              {/* Offer Content */}
              <View style={styles.offerContent}>
                <View style={styles.offerHeader}>
                  <View style={styles.offerIconContainer}>
                    <LinearGradient
                      colors={["#ff6b6b", "#ff8e8e"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.offerIconGradient}
                    >
                      <MaterialCommunityIcons
                        name="gift"
                        size={20}
                        color="#fff"
                      />
                    </LinearGradient>
                  </View>
                  <View style={styles.offerTextContainer}>
                    <Text style={styles.offerTitle} numberOfLines={2}>
                      {offer.title}
                    </Text>
                    <Text style={styles.offerSubtitle} numberOfLines={2}>
                      {offer.description}
                    </Text>
                  </View>
                </View>

                {/* Cashback Details */}
                {offer.conditions && offer.conditions.length > 0 && (
                  <View style={styles.cashbackDetails}>
                    {offer.conditions.map((condition: any, conditionIndex: number) => (
                      <View key={condition._id} style={styles.cashbackItem}>
                        <View style={styles.cashbackHeader}>
                          <Text style={styles.cashbackType}>
                            {condition.type.replace('_', ' ').toUpperCase()}
                          </Text>
                          <View style={styles.cashbackAmountContainer}>
                            <Text style={styles.cashbackPercentage}>
                              {condition.cashbackPercentage}%
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.cashbackDescription}>
                          {condition.description}
                        </Text>
                        {(condition.minimumAmount || condition.maximumAmount) && (
                          <View style={styles.amountRangeContainer}>
                            <MaterialCommunityIcons name="currency-inr" size={12} color="#64748b" />
                            <Text style={styles.amountRange}>
                              {condition.minimumAmount && `Min: ₹${condition.minimumAmount}`}
                              {condition.minimumAmount && condition.maximumAmount && ' - '}
                              {condition.maximumAmount && `Max: ₹${condition.maximumAmount}`}
                            </Text>
                          </View>
                        )}
                      </View>
                    ))}
                  </View>
                )}

                
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>

      {/* Show message if no offers available */}
      {cashbackOffers.length === 0 && (
        <View style={styles.noOffersContainer}>
          <LinearGradient
            colors={["#f8fafc", "#e2e8f0"]}
            style={styles.noOffersCard}
          >
            <View style={styles.noOffersIconContainer}>
              <LinearGradient
                colors={["#cbd5e1", "#94a3b8"]}
                style={styles.noOffersIcon}
              >
                <MaterialCommunityIcons name="gift-off" size={32} color="#64748b" />
              </LinearGradient>
            </View>
            <Text style={styles.noOffersTitle}>No Offers Available</Text>
            <Text style={styles.noOffersSubtitle}>
              Check back later for exciting cashback offers!
            </Text>
            <TouchableOpacity style={styles.refreshButton}>
           
                <MaterialCommunityIcons name="refresh" size={16} color="#fff" />
                <Text style={styles.refreshButtonText}>Refresh</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      )}
    </Animated.View>
  );

  const renderScratchWin = () => (
    <Animated.View style={[styles.tabContent, { opacity: fadeAnim }]}>
      {/* Header Section */}
      <LinearGradient
        colors={["#4ECDC4", "#44A08D"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.scratchHeader}
      >
        <View style={styles.scratchHeaderContent}>
          <Text style={styles.scratchHeaderTitle}>🎯 Scratch & Win</Text>
          <Text style={styles.scratchHeaderSubtitle}>
            Tap cards to reveal amazing rewards!
          </Text>
        </View>
        <View style={styles.scratchHeaderDecoration}>
          <View style={styles.scratchCircle1} />
          <View style={styles.scratchCircle2} />
        </View>
      </LinearGradient>

      {/* Scratch Cards Grid */}
      {loadingScratchCards ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading scratch cards...</Text>
        </View>
      ) : scratchCards.length > 0 ? (
        <View style={styles.scratchCardContainer}>
          {scratchCards.map((card, index) => (
            <TouchableOpacity
              key={card._id}
              style={[
                styles.scratchCard,
                card.isUsed && styles.scratchCardUsed
              ]}
              onPress={() => handleScratchCard(card)}
              activeOpacity={0.8}
              disabled={card.isUsed}
            >
              <LinearGradient
                colors={
                  card.isUsed 
                    ? ["#9ca3af", "#6b7280", "#4b5563"]
                    : ["#6c56f9", "#8b5cf6", "#a855f7"]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.scratchCardFront}
              >
                <View style={styles.scratchCardContent}>
                  <Text style={styles.scratchCardEmoji}>
                    {card.isUsed ? "🎫" : "🎁"}
                  </Text>
                  <Text style={styles.scratchCardText}>
                    {card.isUsed ? "Already Used" : "Tap to Scratch"}
                  </Text>
                  <Text style={styles.scratchCardHint}>
                    {card.isUsed 
                      ? `Won ₹${card.cashbackAmount || card.amount || 50}`
                      : "Win up to ₹500"
                    }
                  </Text>
                  {card.isUsed && (
                    <View style={styles.wonBadge}>
                      <Text style={styles.wonBadgeText}>₹{card.cashbackAmount || card.amount || 50}</Text>
                    </View>
                  )}
                </View>
                {!card.isUsed && <View style={styles.scratchCardShine} />}
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View style={styles.noScratchCardsContainer}>
          <LinearGradient
            colors={["#f8fafc", "#e2e8f0"]}
            style={styles.noScratchCardsCard}
          >
            <View style={styles.noScratchCardsIconContainer}>
              <LinearGradient
                colors={["#cbd5e1", "#94a3b8"]}
                style={styles.noScratchCardsIcon}
              >
                <MaterialCommunityIcons name="cards-outline" size={32} color="#64748b" />
              </LinearGradient>
            </View>
            <Text style={styles.noScratchCardsTitle}>No Scratch Cards Available</Text>
            <Text style={styles.noScratchCardsSubtitle}>
              Make transactions to earn scratch cards and win exciting rewards!
            </Text>
          </LinearGradient>
        </View>
      )}

      {/* Info Card */}
      <LinearGradient
        colors={["#fff", "#f8fafc"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.infoCard}
      >
        <MaterialCommunityIcons name="information" size={24} color="#6c56f9" />
        <Text style={styles.infoCardText}>
          {scratchCards.length > 0 
            ? `You have ${scratchCards.filter(card => !card.isUsed).length} unused scratch cards with guaranteed cashback rewards!`
            : "Make transactions to earn scratch cards with guaranteed cashback rewards!"
          }
        </Text>
      </LinearGradient>
    </Animated.View>
  );

  const renderReferralProgram = () => (
    <Animated.View style={[styles.tabContent, { opacity: fadeAnim }]}>
      {/* Hero Section */}
      <LinearGradient
        colors={["#6c56f9", "#8b5cf6", "#a855f7"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.referralHero}
      >
        <View style={styles.referralHeroContent}>
          <View style={styles.referralHeroLeft}>
            <Text style={styles.referralHeroTitle}>Invite Friends</Text>
            <Text style={styles.referralHeroSubtitle}>
              Earn ₹100 for each successful referral
            </Text>
            <Text style={styles.referralHeroAmount}>+ ₹100</Text>
          </View>
          <View style={styles.referralHeroRight}>
            <View style={styles.referralHeroIcon}>
              <MaterialCommunityIcons
                name="account-group"
                size={40}
                color="#fff"
              />
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Referral Code Section */}
      <LinearGradient
        colors={["#fff", "#fafafa"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.referralCard}
      >
        <Text style={styles.referralSectionTitle}>Your Referral Code</Text>
        <Text style={styles.referralSectionSubtitle}>
          Share this code with friends and both of you get ₹100
        </Text>

        <View style={styles.referralCodeContainer}>
          <LinearGradient
            colors={["#f8fafc", "#f1f5f9"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.referralCodeBox}
          >
            <Text style={styles.referralCode}>{user?.referralCode || "SLING123"}</Text>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={() =>
                Alert.alert("Copied!", "Referral code copied to clipboard")
              }
            >
              <LinearGradient
                colors={["#6c56f9", "#8b5cf6"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.copyButtonGradient}
              >
                <MaterialCommunityIcons
                  name="content-copy"
                  size={16}
                  color="#fff"
                />
                <Text style={styles.copyButtonText}>Copy</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        <TouchableOpacity
          style={styles.shareButton}
          onPress={() => Share.share({
            message: "Check out my referral code: " + user?.referralCode,
            url: "https://your-app-url.com/referral/" + user?.referralCode,
          })}
        >
          <LinearGradient
            colors={["#10b981", "#059669"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.shareButtonGradient}
          >
            <Ionicons name="share-social" size={20} color="#fff" />
            <Text style={styles.shareButtonText}>Share Referral Code</Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>

      {/* Stats Section */}
      <View style={styles.statsContainer}>
        <LinearGradient
          colors={["#fff", "#fafafa"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.statCard}
        >
          <Text style={styles.statNumber}>5</Text>
          <Text style={styles.statLabel}>Friends Referred</Text>
        </LinearGradient>

        <LinearGradient
          colors={["#fff", "#fafafa"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.statCard}
        >
          <Text style={styles.statNumber}>₹500</Text>
          <Text style={styles.statLabel}>Total Earned</Text>
        </LinearGradient>
      </View>
    </Animated.View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return renderCashbackOffers();
      case 1:
        return renderScratchWin();
      case 2:
        return renderReferralProgram();
      default:
        return renderCashbackOffers();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#6c56f9"
        translucent={true}
      />

      {/* Modern Header with Gradient Background */}
      <LinearGradient
        colors={["#6c56f9", "#8b5cf6", "#a855f7"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerContainer}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🎁 Rewards & Offers</Text>
          <Text style={styles.headerSubtitle}>
            Earn rewards with every transaction
          </Text>
        </View>
      </LinearGradient>

      {/* Tab Container */}
      <LinearGradient
        colors={["#fff", "#f8fafc"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.tabContainer}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.activeTab]}
            onPress={() => setActiveTab(tab.id)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={
                activeTab === tab.id
                  ? [tab.color, tab.color]
                  : ["transparent", "transparent"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.tabGradient}
            >
              <MaterialCommunityIcons
                name={tab.icon as any}
                size={20}
                color={activeTab === tab.id ? "#fff" : "#6c757d"}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.id && styles.activeTabText,
                ]}
              >
                {tab.title}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </LinearGradient>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor="#6c56f9"
            colors={["#6c56f9"]}
          />
        }
      >
        {renderTabContent()}
      </ScrollView>

      {/* Scratch Card Modal */}
      {selectedScratchCard && (
        <ScratchCardModal
          visible={showScratchModal}
          onClose={handleCloseScratchModal}
          scratchCard={selectedScratchCard}
          onScratchComplete={handleScratchComplete}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  headerContainer: {
    paddingTop: 10,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    fontFamily: "SpaceMono-Regular",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    fontFamily: "SpaceMono-Regular",
  },
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: -15,
    padding: 5,
    borderWidth: 1,
    borderColor: "lightgray",
    borderRadius: 10,
  },
  tab: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 12,
    overflow: "hidden",
  },
  tabGradient: {
    flexDirection: "column",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  activeTab: {
    shadowColor: "#6c56f9",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  tabText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#6c757d",
    marginTop: 4,
    textAlign: "center",
    fontFamily: "SpaceMono-Regular",
  },
  activeTabText: {
    color: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  tabContent: {
    width: "100%",
  },
  // Featured Offer Styles
  featuredSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1e293b",
    marginBottom: 6,
    letterSpacing: -0.5,
    fontFamily: "SpaceMono-Regular",
  },
  sectionSubtitle: {
    fontSize: 12,
    color: "#64748b",
    lineHeight: 22,
    fontWeight: "500",
    fontFamily: "SpaceMono-Regular",
  },
  offersGrid: {
    gap: 20,
  },
  offerCardContainer: {
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  offerCard: {
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  offerImageContainer: {
    position: "relative",
    height: 160,
  },
  offerImage: {
    width: "100%",
    height: 160,
  },
  offerImageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
  offerBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#ff6b6b",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: "#ff6b6b",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  offerBadgeText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#fff",
    letterSpacing: 0.5,
  },
  offerContent: {
    padding: 20,
  },
  offerHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  offerIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    shadowColor: "#ff6b6b",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  offerIconGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  offerTextContainer: {
    flex: 1,
  },
  offerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 6,
    lineHeight: 24,
    fontFamily: "SpaceMono-Regular",
  },
  offerSubtitle: {
    fontSize: 12,
    color: "#64748b",
    lineHeight: 22,
    marginBottom: 12,
    fontFamily: "SpaceMono-Regular",
  },
  cashbackDetails: {
    marginTop: 12,
    marginBottom: 16,
  },
  cashbackItem: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#6c56f9",
  },
  cashbackHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  cashbackType: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#6c56f9",
    backgroundColor: "#e0e7ff",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    letterSpacing: 0.5,
    fontFamily: "SpaceMono-Regular",
  },
  cashbackAmountContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#dcfce7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  cashbackAmount: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#16a34a",
  },
  cashbackPercentage: {
    fontSize: 10,
    color: "#16a34a",
    marginLeft: 4,
    fontWeight: "500",
    fontFamily: "SpaceMono-Regular",
  },
  cashbackDescription: {
    fontSize: 10,
    color: "#64748b",
    marginBottom: 6,
    lineHeight: 16,
    fontFamily: "SpaceMono-Regular",
  },
  amountRangeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  amountRange: {
    fontSize: 10,
    color: "#64748b",
    fontStyle: "italic",
    marginLeft: 2,
    fontFamily: "SpaceMono-Regular",
  },

  // Scratch & Win Styles
  scratchHeader: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    position: "relative",
    overflow: "hidden",
  },
  scratchHeaderContent: {
    zIndex: 2,
  },
  scratchHeaderTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
    fontFamily: "SpaceMono-Regular",
  },
  scratchHeaderSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
    fontFamily: "SpaceMono-Regular",
  },
  scratchHeaderDecoration: {
    position: "absolute",
    top: -20,
    right: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  scratchCircle1: {
    position: "absolute",
    top: 15,
    right: 15,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  scratchCircle2: {
    position: "absolute",
    bottom: 20,
    left: 20,
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  scratchCardContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  scratchCard: {
    width: (width - 60) / 2,
    height: 120,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
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
    fontSize: 24,
    marginBottom: 4,
  },
  scratchCardText: {
    fontSize: 12,
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
  scratchCardHint: {
    fontSize: 10,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    marginTop: 2,
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
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  infoCardText: {
    flex: 1,
    fontSize: 12,
    color: "#64748b",
    marginLeft: 12,
    lineHeight: 20,
    fontFamily: "SpaceMono-Regular",
  },
  // Referral Program Styles
  referralHero: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    position: "relative",
    overflow: "hidden",
  },
  referralHeroContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  referralHeroLeft: {
    flex: 1,
  },
  referralHeroTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
    fontFamily: "SpaceMono-Regular",
  },
  referralHeroSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
    marginBottom: 12,
    fontFamily: "SpaceMono-Regular",
  },
  referralHeroAmount: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#fff",
    fontFamily: "SpaceMono-Regular",
  },
  referralHeroRight: {
    alignItems: "center",
  },
  referralHeroIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  referralCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  referralSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e293b",
    textAlign: "center",
    marginBottom: 8,
    fontFamily: "SpaceMono-Regular",
  },
  referralSectionSubtitle: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
    fontFamily: "SpaceMono-Regular",
  },
  referralCodeContainer: {
    marginBottom: 24,
  },
  referralCodeBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    padding: 16,
  },
  referralCode: {
    flex: 1,
    fontSize: 12,
    fontWeight: "bold",
    color: "#6c56f9",
    textAlign: "center",
    fontFamily: "SpaceMono-Regular",
  },
  copyButton: {
    borderRadius: 8,
  },
  copyButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  copyButtonText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
    marginLeft: 4,
    fontFamily: "SpaceMono-Regular",
  },
  shareButton: {
    borderRadius: 12,
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  shareButtonGradient: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  shareButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 8,
    fontFamily: "SpaceMono-Regular",
  },
  // Stats Section
  statsContainer: {
    flexDirection: "row",
    gap: 16,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#6c56f9",
    marginBottom: 4,
    fontFamily: "SpaceMono-Regular",
  },
  statLabel: {
    fontSize: 10,
    color: "#64748b",
    textAlign: "center",
    fontFamily: "SpaceMono-Regular",
  },
  // No Offers Styles
  noOffersContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  noOffersCard: {
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
  },
  noOffersIconContainer: {
    backgroundColor: "#f8fafc",
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
  },
  noOffersIcon: {
    padding: 8,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  noOffersTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e293b",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
    fontFamily: "SpaceMono-Regular",
  },
  noOffersSubtitle: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 24,
    fontFamily: "SpaceMono-Regular",
  },
  refreshButton: {
    borderRadius: 12,
    padding: 16,
    backgroundColor: "#6c56f9",
    flexDirection:"row"
  },
  refreshButtonGradient: {
    padding: 8,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  refreshButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "SpaceMono-Regular",
  },
  // Loading and No Scratch Cards Styles
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
    fontFamily: "SpaceMono-Regular",
  },
  scratchCardUsed: {
    opacity: 0.7,
  },
  wonBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#10b981",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  wonBadgeText: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#fff",
    letterSpacing: 0.5,
    fontFamily: "SpaceMono-Regular",
  },
  noScratchCardsContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  noScratchCardsCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  noScratchCardsIconContainer: {
    backgroundColor: "#f8fafc",
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
  },
  noScratchCardsIcon: {
    padding: 8,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  noScratchCardsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 8,
    textAlign: "center",
    fontFamily: "SpaceMono-Regular",
  },
  noScratchCardsSubtitle: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 20,
    fontFamily: "SpaceMono-Regular",
  },
});

export default RewardsScreen;
