import ClaimOfferModal from "@/components/ClaimOfferModal";
import UseVoucherModal from "@/components/UseVoucherModal";
import * as Clipboard from "expo-clipboard";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Modal,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

const VouchersScreen = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [hasCampus, setHasCampus] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedClaimOffer, setSelectedClaimOffer] = useState<any>(null);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [selectedUseVoucher, setSelectedUseVoucher] = useState<any>(null);
  const [showUseVoucherModal, setShowUseVoucherModal] = useState(false);
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showEventsModal, setShowEventsModal] = useState(false);
  const [myVouchersList, setMyVouchersList] = useState<any[]>([
    {
      id: "v1",
      title: "Campus Store Discount",
      subtitle: "Valid until Dec 31, 2026",
      value: "20% OFF",
      code: "SLINGSTU20",
      color: ["#6c56f9", "#8b5cf6"],
      icon: "ticket-percent",
    },
    {
      id: "v2",
      title: "Canteen Special",
      subtitle: "Valid until Jan 15, 2027",
      value: "₹50 OFF",
      code: "CANTEEN50",
      color: ["#10b981", "#059669"],
      icon: "food-fork-drink",
    },
  ]);

  const handleClaimOffer = (offer: {
    title: string;
    subtitle: string;
    code: string;
    discount: string;
    icon?: string;
    color?: string[];
  }) => {
    setSelectedClaimOffer(offer);
    setShowClaimModal(true);

    setMyVouchersList((prev) => {
      if (prev.some((v) => v.code === offer.code)) return prev;
      return [
        {
          id: `v_${Date.now()}`,
          title: offer.title,
          subtitle: "Valid until Dec 31, 2026",
          value: offer.discount,
          code: offer.code,
          color: offer.color || ["#6c56f9", "#8b5cf6"],
          icon: offer.icon || "ticket-percent",
        },
        ...prev,
      ];
    });
  };

  const tabs = [
    { id: 0, title: "Campus Offers", icon: "school", color: "#6c56f9" },
    { id: 1, title: "My Vouchers", icon: "ticket-percent", color: "#FF6B6B" },
    { id: 2, title: "Campus Info", icon: "information", color: "#4ECDC4" },
  ];

  const campusData = {
    name: "Delhi Technological University",
    logo: "🏛️",
    offers: 12,
    attendance: "85%",
    events: 3,
  };

  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      // Simulate API calls to refresh data
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Here you would typically make API calls to refresh:
      // - Campus offers
      // - Vouchers
      // - Campus info
      // For now, we'll just show a success message
      Alert.alert("Success", "Data refreshed successfully!");
    } catch (error) {
      console.error("Error refreshing data:", error);
      Alert.alert("Error", "Failed to refresh data. Please try again.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    refreshData();
  }, []);

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [activeTab]);

  const renderCampusOffers = () => (
    <Animated.View style={[styles.tabContent, { opacity: fadeAnim }]}>
      {/* Campus Header Card */}
      <LinearGradient
        colors={["#6c56f9", "#8b5cf6", "#a855f7"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.campusHeaderCard}
      >
        <View style={styles.campusHeaderContent}>
          <View style={styles.campusHeaderLeft}>
            <Text style={styles.campusHeaderBadge}>🎓 ACTIVE CAMPUS</Text>
            <Text style={styles.campusHeaderTitle}>{campusData.name}</Text>
            <Text style={styles.campusHeaderSubtitle}>
              {campusData.offers} exclusive offers available
            </Text>
          </View>
          <View style={styles.campusHeaderRight}>
            <View style={styles.campusHeaderIcon}>
              <Text style={styles.campusHeaderEmoji}>{campusData.logo}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Campus Stats */}
      <View style={styles.statsContainer}>
        <LinearGradient
          colors={["#fff", "#fafafa"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.statCard}
        >
          <LinearGradient
            colors={["#fef3c7", "#fde68a"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statIconContainer}
          >
            <Text style={styles.statIcon}>🎁</Text>
          </LinearGradient>
          <Text style={styles.statNumber}>{campusData.offers}</Text>
          <Text style={styles.statLabel}>Offers</Text>
        </LinearGradient>

        <LinearGradient
          colors={["#fff", "#fafafa"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.statCard}
        >
          <LinearGradient
            colors={["#dbeafe", "#bfdbfe"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statIconContainer}
          >
            <Text style={styles.statIcon}>📊</Text>
          </LinearGradient>
          <Text style={styles.statNumber}>{campusData.attendance}</Text>
          <Text style={styles.statLabel}>Attendance</Text>
        </LinearGradient>

        <LinearGradient
          colors={["#fff", "#fafafa"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.statCard}
        >
          <LinearGradient
            colors={["#f3e8ff", "#e9d5ff"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statIconContainer}
          >
            <Text style={styles.statIcon}>📅</Text>
          </LinearGradient>
          <Text style={styles.statNumber}>{campusData.events}</Text>
          <Text style={styles.statLabel}>Events</Text>
        </LinearGradient>
      </View>

      {/* Featured Campus Offer */}
      <LinearGradient
        colors={["#FF6B6B", "#FF8E53"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.featuredOfferCard}
      >
        <View style={styles.featuredOfferContent}>
          <View style={styles.featuredOfferLeft}>
            <Text style={styles.featuredOfferBadge}>🔥 CAMPUS EXCLUSIVE</Text>
            <Text style={styles.featuredOfferTitle}>Student Discount</Text>
            <Text style={styles.featuredOfferSubtitle}>
              Get 20% off on all campus store purchases
            </Text>
            <Text style={styles.featuredOfferAmount}>Up to ₹1000</Text>
          </View>
          <View style={styles.featuredOfferRight}>
            <View style={styles.featuredOfferIcon}>
              <Text style={styles.featuredOfferEmoji}>🎓</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={styles.featuredClaimButton}
          onPress={() =>
            handleClaimOffer({
              title: "Student Store Discount",
              subtitle: "Get 20% off on all campus store purchases",
              code: "SLINGSTU20",
              discount: "20% OFF (Up to ₹1000)",
              icon: "ticket-percent",
              color: ["#FF6B6B", "#FF8E53"],
            })
          }
        >
          <Text style={styles.featuredClaimButtonText}>Claim Now</Text>
          <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Campus Offers Grid */}
      <View style={styles.offersGrid}>
        <LinearGradient
          colors={["#fff", "#fafafa"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.offerCard}
        >
          <View style={styles.offerHeader}>
            <LinearGradient
              colors={["#dcfce7", "#bbf7d0"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.offerIconContainer}
            >
              <MaterialCommunityIcons
                name="food-fork-drink"
                size={24}
                color="#10b981"
              />
            </LinearGradient>
            <View style={styles.offerTextContainer}>
              <Text style={styles.offerTitle}>🍕 Campus Canteen</Text>
              <Text style={styles.offerSubtitle}>
                15% discount on all food items
              </Text>
              <Text style={styles.offerValue}>₹30 - ₹150</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.claimButton}
            onPress={() =>
              handleClaimOffer({
                title: "Campus Canteen Special",
                subtitle: "15% discount on all canteen food items",
                code: "CANTEEN15",
                discount: "15% OFF",
                icon: "food-fork-drink",
                color: ["#10b981", "#059669"],
              })
            }
          >
            <LinearGradient
              colors={["#10b981", "#059669"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.claimButtonGradient}
            >
              <Text style={styles.claimButtonText}>Claim Now</Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>

        <LinearGradient
          colors={["#fff", "#fafafa"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.offerCard}
        >
          <View style={styles.offerHeader}>
            <LinearGradient
              colors={["#fef3c7", "#fde68a"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.offerIconContainer}
            >
              <MaterialCommunityIcons
                name="book-open-variant"
                size={24}
                color="#f59e0b"
              />
            </LinearGradient>
            <View style={styles.offerTextContainer}>
              <Text style={styles.offerTitle}>📚 Library Services</Text>
              <Text style={styles.offerSubtitle}>
                Free printing up to 50 pages
              </Text>
              <Text style={styles.offerValue}>₹100 value</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.claimButton}
            onPress={() =>
              handleClaimOffer({
                title: "Library Services Discount",
                subtitle: "Free printing up to 50 pages at library",
                code: "PRINTFREE50",
                discount: "FREE PRINTING (₹100 Value)",
                icon: "book-open-variant",
                color: ["#f59e0b", "#d97706"],
              })
            }
          >
            <LinearGradient
              colors={["#f59e0b", "#d97706"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.claimButtonGradient}
            >
              <Text style={styles.claimButtonText}>Claim Now</Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </Animated.View>
  );

  const renderMyVouchers = () => (
    <Animated.View style={[styles.tabContent, { opacity: fadeAnim }]}>
      {/* Header Section */}
      <LinearGradient
        colors={["#FF6B6B", "#FF8E53"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.vouchersHeader}
      >
        <View style={styles.vouchersHeaderContent}>
          <Text style={styles.vouchersHeaderTitle}>🎫 My Vouchers</Text>
          <Text style={styles.vouchersHeaderSubtitle}>
            Your active vouchers and discounts ({myVouchersList.length})
          </Text>
        </View>
        <View style={styles.vouchersHeaderDecoration}>
          <View style={styles.vouchersCircle1} />
          <View style={styles.vouchersCircle2} />
        </View>
      </LinearGradient>

      {/* Active Vouchers */}
      <View style={styles.vouchersContainer}>
        {myVouchersList.map((voucher) => (
          <LinearGradient
            key={voucher.id}
            colors={["#fff", "#fafafa"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.voucherCard}
          >
            <View style={styles.voucherHeader}>
              <LinearGradient
                colors={voucher.color || ["#6c56f9", "#8b5cf6"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.voucherIconContainer}
              >
                <MaterialCommunityIcons
                  name={voucher.icon || "ticket-percent"}
                  size={24}
                  color="#fff"
                />
              </LinearGradient>
              <View style={styles.voucherTextContainer}>
                <Text style={styles.voucherTitle}>{voucher.title}</Text>
                <Text style={styles.voucherSubtitle}>
                  {voucher.subtitle} • Code: {voucher.code}
                </Text>
                <Text style={styles.voucherValue}>{voucher.value}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.useVoucherButton}
              onPress={() => {
                setSelectedUseVoucher(voucher);
                setShowUseVoucherModal(true);
              }}
            >
              <LinearGradient
                colors={voucher.color || ["#6c56f9", "#8b5cf6"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.useVoucherGradient}
              >
                <Text style={styles.useVoucherText}>Use Voucher</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        ))}
      </View>
    </Animated.View>
  );

  const renderCampusInfo = () => (
    <Animated.View style={[styles.tabContent, { opacity: fadeAnim }]}>
      {hasCampus ? (
        <>
          {/* Campus Info Hero */}
          <LinearGradient
            colors={["#4ECDC4", "#44A08D"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.campusInfoHero}
          >
            <View style={styles.campusInfoHeroContent}>
              <View style={styles.campusInfoHeroLeft}>
                <Text style={styles.campusInfoHeroTitle}>
                  Campus Information
                </Text>
                <Text style={styles.campusInfoHeroSubtitle}>
                  Stay connected with your campus
                </Text>
              </View>
              <View style={styles.campusInfoHeroRight}>
                <View style={styles.campusInfoHeroIcon}>
                  <Text style={styles.campusInfoHeroEmoji}>
                    {campusData.logo}
                  </Text>
                </View>
              </View>
            </View>
          </LinearGradient>

          {/* My Campus Section (NEW) */}
          <Text style={styles.myCampusTitle}>My Campus</Text>
          <View style={styles.myCampusCardGrid}>
            <TouchableOpacity
              style={styles.myCampusCard}
              onPress={() => setShowFeeModal(true)}
            >
              <MaterialCommunityIcons
                name="currency-inr"
                size={36}
                color="#6c56f9"
              />
              <Text style={styles.myCampusCardText}>Fee{"\n"}Payment</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.myCampusCard}
              onPress={() => setShowNoticeModal(true)}
            >
              <MaterialCommunityIcons
                name="clipboard-alert-outline"
                size={36}
                color="#6c56f9"
              />
              <Text style={styles.myCampusCardText}>Notice Board</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.myCampusCard}
              onPress={() => setShowAttendanceModal(true)}
            >
              <MaterialCommunityIcons
                name="calendar-month-outline"
                size={36}
                color="#6c56f9"
              />
              <Text style={styles.myCampusCardText}>My{"\n"}Attendance</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.myCampusCard}
              onPress={() => router.push("/offer-list")}
            >
              <MaterialCommunityIcons
                name="silverware-fork-knife"
                size={36}
                color="#6c56f9"
              />
              <Text style={styles.myCampusCardText}>My{"\n"}Canteen</Text>
            </TouchableOpacity>
          </View>

          {/* Campus Menu Items */}
          <View style={styles.campusMenuContainer}>
            <LinearGradient
              colors={["#fff", "#fafafa"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.menuCard}
            >
              <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/offer-list")}>
                <View style={styles.menuItemLeft}>
                  <LinearGradient
                    colors={["#fef3c7", "#fde68a"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.menuIconContainer}
                  >
                    <Text style={styles.menuIcon}>🎁</Text>
                  </LinearGradient>
                  <View style={styles.menuTextContainer}>
                    <Text style={styles.menuTitle}>Offers</Text>
                    <Text style={styles.menuSubtitle}>
                      {campusData.offers} active offers available
                    </Text>
                  </View>
                </View>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={20}
                  color="#BDBDBD"
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => setShowAttendanceModal(true)}
              >
                <View style={styles.menuItemLeft}>
                  <LinearGradient
                    colors={["#dbeafe", "#bfdbfe"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.menuIconContainer}
                  >
                    <Text style={styles.menuIcon}>📊</Text>
                  </LinearGradient>
                  <View style={styles.menuTextContainer}>
                    <Text style={styles.menuTitle}>Attendance</Text>
                    <Text style={styles.menuSubtitle}>
                      Current attendance: {campusData.attendance}
                    </Text>
                  </View>
                </View>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={20}
                  color="#BDBDBD"
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => setShowEventsModal(true)}
              >
                <View style={styles.menuItemLeft}>
                  <LinearGradient
                    colors={["#f3e8ff", "#e9d5ff"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.menuIconContainer}
                  >
                    <Text style={styles.menuIcon}>📅</Text>
                  </LinearGradient>
                  <View style={styles.menuTextContainer}>
                    <Text style={styles.menuTitle}>Events & Announcements</Text>
                    <Text style={styles.menuSubtitle}>
                      {campusData.events} upcoming events
                    </Text>
                  </View>
                </View>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={20}
                  color="#BDBDBD"
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() =>
                  Alert.alert("Campus Preferences", "Campus preference updated to " + campusData.name)
                }
              >
                <View style={styles.menuItemLeft}>
                  <LinearGradient
                    colors={["#dcfce7", "#bbf7d0"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.menuIconContainer}
                  >
                    <Text style={styles.menuIcon}>🔗</Text>
                  </LinearGradient>
                  <View style={styles.menuTextContainer}>
                    <Text style={styles.menuTitle}>
                      Link to Add/Change Campus
                    </Text>
                    <Text style={styles.menuSubtitle}>
                      Manage your campus preferences
                    </Text>
                  </View>
                </View>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={20}
                  color="#BDBDBD"
                />
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </>
      ) : (
        <View style={styles.noCampusContainer}>
          <LinearGradient
            colors={["#f1f5f9", "#e2e8f0"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.noCampusIcon}
          >
            <Text style={styles.noCampusEmoji}>🏛️</Text>
          </LinearGradient>
          <Text style={styles.noCampusTitle}>No Campus Selected</Text>
          <Text style={styles.noCampusDescription}>
            Connect with your campus to access exclusive offers, track
            attendance, and stay updated with events.
          </Text>

          <TouchableOpacity style={styles.submitCampusButton}>
            <LinearGradient
              colors={["#6c56f9", "#8b5cf6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.submitCampusGradient}
            >
              <Text style={styles.submitCampusButtonText}>
                Can't find your campus? Click here to submit your campus
                details.
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.browseCampusButton}>
            <LinearGradient
              colors={["#fff", "#f8fafc"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.browseCampusGradient}
            >
              <Text style={styles.browseCampusButtonText}>
                Browse Available Campuses
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </Animated.View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return renderCampusOffers();
      case 1:
        return renderMyVouchers();
      case 2:
        return renderCampusInfo();
      default:
        return renderCampusOffers();
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
          <Text style={styles.headerTitle}>🎓 My Campus Section</Text>
          <Text style={styles.headerSubtitle}>
            Connect with your campus for exclusive benefits
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

      {/* Claim Offer Modal */}
      <ClaimOfferModal
        visible={showClaimModal}
        onClose={() => setShowClaimModal(false)}
        onViewVouchers={() => setActiveTab(1)}
        offer={selectedClaimOffer}
      />

      {/* Use Voucher Modal */}
      <UseVoucherModal
        visible={showUseVoucherModal}
        onClose={() => setShowUseVoucherModal(false)}
        voucher={selectedUseVoucher}
      />

      {/* Fee Payment Modal */}
      <Modal visible={showFeeModal} transparent animationType="slide" onRequestClose={() => setShowFeeModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentCard}>
            <LinearGradient colors={["#6c56f9", "#8b5cf6"]} style={styles.modalHeaderGrad}>
              <Text style={styles.modalHeaderTitle}>🎓 Campus Fee Dues</Text>
              <TouchableOpacity onPress={() => setShowFeeModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </LinearGradient>
            <View style={styles.modalInnerBody}>
              <View style={styles.feeItemRow}>
                <Text style={styles.feeItemTitle}>Semester 5 Tuition Fee</Text>
                <Text style={styles.feeItemStatus}>₹0.00 (PAID)</Text>
              </View>
              <View style={styles.feeItemRow}>
                <Text style={styles.feeItemTitle}>Library & Lab Dues</Text>
                <Text style={styles.feeItemStatus}>₹0.00 (NO DUES)</Text>
              </View>
              <View style={styles.feeItemRow}>
                <Text style={styles.feeItemTitle}>Hostel & Maintenance</Text>
                <Text style={styles.feeItemStatus}>₹0.00 (PAID)</Text>
              </View>
              <TouchableOpacity 
                style={styles.payFeeActionBtn} 
                onPress={() => {
                  setShowFeeModal(false);
                  router.push("/recharge");
                }}
              >
                <Text style={styles.payFeeActionBtnText}>Pay Utility & Custom Dues ➔</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Notice Board Modal */}
      <Modal visible={showNoticeModal} transparent animationType="slide" onRequestClose={() => setShowNoticeModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentCard}>
            <LinearGradient colors={["#4ECDC4", "#44A08D"]} style={styles.modalHeaderGrad}>
              <Text style={styles.modalHeaderTitle}>📢 Campus Notice Board</Text>
              <TouchableOpacity onPress={() => setShowNoticeModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </LinearGradient>
            <ScrollView style={styles.modalInnerBodyScroll}>
              <View style={styles.noticeCard}>
                <Text style={styles.noticeCardBadge}>EXAM NOTICE</Text>
                <Text style={styles.noticeCardTitle}>End-Semester Examination Date Sheet Released</Text>
                <Text style={styles.noticeCardBody}>The final date sheet for 5th semester examinations has been published on the DTU student portal. Examinations start next month.</Text>
                <Text style={styles.noticeCardDate}>Posted Today • DTU Admin</Text>
              </View>
              <View style={styles.noticeCard}>
                <Text style={styles.noticeCardBadge}>FEST ALERT</Text>
                <Text style={styles.noticeCardTitle}>Annual Cultural Fest Registrations Open</Text>
                <Text style={styles.noticeCardBody}>Register for music, dance, and drama competitions. Sling Card holders get free VIP entry passes!</Text>
                <Text style={styles.noticeCardDate}>Posted 1 day ago • Student Council</Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Attendance Modal */}
      <Modal visible={showAttendanceModal} transparent animationType="slide" onRequestClose={() => setShowAttendanceModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentCard}>
            <LinearGradient colors={["#3b82f6", "#2563eb"]} style={styles.modalHeaderGrad}>
              <Text style={styles.modalHeaderTitle}>📊 Attendance Summary</Text>
              <TouchableOpacity onPress={() => setShowAttendanceModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </LinearGradient>
            <View style={styles.modalInnerBody}>
              <View style={styles.overallAttBox}>
                <Text style={styles.overallAttScore}>85.5%</Text>
                <Text style={styles.overallAttLabel}>Overall Attendance • Good Standing</Text>
              </View>
              <View style={styles.subjectAttRow}>
                <Text style={styles.subjectTitle}>Computer Networks</Text>
                <Text style={styles.subjectScore}>90% (Good)</Text>
              </View>
              <View style={styles.subjectAttRow}>
                <Text style={styles.subjectTitle}>Data Structures & Algo</Text>
                <Text style={styles.subjectScore}>88% (Good)</Text>
              </View>
              <View style={styles.subjectAttRow}>
                <Text style={styles.subjectTitle}>Operating Systems</Text>
                <Text style={styles.subjectScore}>82% (Warning)</Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Events Modal */}
      <Modal visible={showEventsModal} transparent animationType="slide" onRequestClose={() => setShowEventsModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentCard}>
            <LinearGradient colors={["#a855f7", "#9333ea"]} style={styles.modalHeaderGrad}>
              <Text style={styles.modalHeaderTitle}>📅 Campus Events</Text>
              <TouchableOpacity onPress={() => setShowEventsModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </LinearGradient>
            <ScrollView style={styles.modalInnerBodyScroll}>
              <View style={styles.noticeCard}>
                <Text style={styles.noticeCardBadge}>TOMORROW</Text>
                <Text style={styles.noticeCardTitle}>Sling Campus Hackathon 2026</Text>
                <Text style={styles.noticeCardBody}>24-hour coding challenge with prizes worth ₹50,000. Venue: DTU Auditorium.</Text>
              </View>
              <View style={styles.noticeCard}>
                <Text style={styles.noticeCardBadge}>THIS FRIDAY</Text>
                <Text style={styles.noticeCardTitle}>Inter-College Sports Championship</Text>
                <Text style={styles.noticeCardBody}>Football & Basketball finals starting 10:00 AM at the Main Sports Complex.</Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  // Campus Offers Styles
  campusHeaderCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: "#6c56f9",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  campusHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  campusHeaderLeft: {
    flex: 1,
  },
  campusHeaderBadge: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#fff",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  campusHeaderTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
    fontFamily: "SpaceMono-Regular",
  },
  campusHeaderSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
    fontFamily: "SpaceMono-Regular",
  },
  campusHeaderRight: {
    alignItems: "center",
  },
  campusHeaderIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  campusHeaderEmoji: {
    fontSize: 32,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statIcon: {
    fontSize: 24,
  },
  statNumber: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 4,
    fontFamily: "SpaceMono-Regular",
  },
  statLabel: {
    fontSize: 10,
    color: "#64748b",
    fontWeight: "600",
    fontFamily: "SpaceMono-Regular",
  },
  // Featured Offer Styles
  featuredOfferCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: "#FF6B6B",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  featuredOfferContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  featuredOfferLeft: {
    flex: 1,
  },
  featuredOfferBadge: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#fff",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  featuredOfferTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
    fontFamily: "SpaceMono-Regular",
  },
  featuredOfferSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
    marginBottom: 12,
    fontFamily: "SpaceMono-Regular",
  },
  featuredOfferAmount: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#fff",
    fontFamily: "SpaceMono-Regular",
  },
  featuredOfferRight: {
    alignItems: "center",
  },
  featuredOfferIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  featuredOfferEmoji: {
    fontSize: 32,
  },
  featuredClaimButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingVertical: 16,
    borderRadius: 12,
  },
  featuredClaimButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
    marginRight: 8,
    fontFamily: "SpaceMono-Regular",
  },
  // Regular Offers Styles
  offersGrid: {
    gap: 16,
  },
  offerCard: {
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  offerHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  offerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  offerTextContainer: {
    flex: 1,
  },
  offerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 4,
    fontFamily: "SpaceMono-Regular",
  },
  offerSubtitle: {
    fontSize: 12,
    color: "#64748b",
    lineHeight: 20,
    marginBottom: 8,
    fontFamily: "SpaceMono-Regular",
  },
  offerValue: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#6c56f9",
    fontFamily: "SpaceMono-Regular",
  },
  claimButton: {
    borderRadius: 12,
    shadowColor: "#6c56f9",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  claimButtonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
  },
  claimButtonText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
    fontFamily: "SpaceMono-Regular",
  },
  // Vouchers Styles
  vouchersHeader: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    position: "relative",
    overflow: "hidden",
  },
  vouchersHeaderContent: {
    zIndex: 2,
  },
  vouchersHeaderTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
    fontFamily: "SpaceMono-Regular",
  },
  vouchersHeaderSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
    fontFamily: "SpaceMono-Regular",
  },
  vouchersHeaderDecoration: {
    position: "absolute",
    top: -20,
    right: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  vouchersCircle1: {
    position: "absolute",
    top: 15,
    right: 15,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  vouchersCircle2: {
    position: "absolute",
    bottom: 20,
    left: 20,
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  vouchersContainer: {
    gap: 16,
  },
  voucherCard: {
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  voucherHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  voucherIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  voucherTextContainer: {
    flex: 1,
  },
  voucherTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 4,
    fontFamily: "SpaceMono-Regular",
  },
  voucherSubtitle: {
    fontSize: 12,
    color: "#64748b",
    lineHeight: 20,
    marginBottom: 8,
    fontFamily: "SpaceMono-Regular",
  },
  voucherValue: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#6c56f9",
    fontFamily: "SpaceMono-Regular",
  },
  useVoucherButton: {
    borderRadius: 12,
    shadowColor: "#6c56f9",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  useVoucherGradient: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
  },
  useVoucherText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
    fontFamily: "SpaceMono-Regular",
  },
  // Campus Info Styles
  campusInfoHero: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    position: "relative",
    overflow: "hidden",
  },
  campusInfoHeroContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  campusInfoHeroLeft: {
    flex: 1,
  },
  campusInfoHeroTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
    fontFamily: "SpaceMono-Regular",
  },
  campusInfoHeroSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
    fontFamily: "SpaceMono-Regular",
  },
  campusInfoHeroRight: {
    alignItems: "center",
  },
  campusInfoHeroIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  campusInfoHeroEmoji: {
    fontSize: 32,
  },
  campusMenuContainer: {
    marginBottom: 20,
  },
  menuCard: {
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  menuIcon: {
    fontSize: 20,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 4,
    fontFamily: "SpaceMono-Regular",
  },
  menuSubtitle: {
    fontSize: 12,
    color: "#64748b",
    fontFamily: "SpaceMono-Regular",
  },
  // No Campus Styles
  noCampusContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  noCampusIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  noCampusEmoji: {
    fontSize: 48,
  },
  noCampusTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 16,
    textAlign: "center",
    fontFamily: "SpaceMono-Regular",
  },
  noCampusDescription: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
    fontFamily: "SpaceMono-Regular",
  },
  submitCampusButton: {
    borderRadius: 16,
    marginBottom: 16,
    width: "100%",
    shadowColor: "#6c56f9",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  submitCampusGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
  submitCampusButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    fontFamily: "SpaceMono-Regular",
  },
  browseCampusButton: {
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#6c56f9",
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  browseCampusGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
  browseCampusButtonText: {
    color: "#6c56f9",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    fontFamily: "SpaceMono-Regular",
  },
  myCampusTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 16,
    textAlign: "center",
    fontFamily: "SpaceMono-Regular",
  },
  myCampusCardGrid: {
    flexDirection: "row",
    marginBottom: 20,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "space-between",
  },
  myCampusCard: {
    flex: 1,
    borderRadius: 16,
    padding: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  myCampusCardText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1e293b",
    textAlign: "center",
    fontFamily: "SpaceMono-Regular",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContentCard: {
    width: "100%",
    maxWidth: 500,
    backgroundColor: "#fff",
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  modalHeaderGrad: {
    padding: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalHeaderTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  modalInnerBody: {
    padding: 20,
  },
  modalInnerBodyScroll: {
    padding: 20,
    maxHeight: 400,
  },
  feeItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  feeItemTitle: {
    fontSize: 14,
    color: "#334155",
    fontWeight: "500",
  },
  feeItemStatus: {
    fontSize: 14,
    color: "#10b981",
    fontWeight: "bold",
  },
  payFeeActionBtn: {
    marginTop: 20,
    backgroundColor: "#6c56f9",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  payFeeActionBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  noticeCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  noticeCardBadge: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#6c56f9",
    backgroundColor: "#e0e7ff",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 6,
  },
  noticeCardTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 6,
  },
  noticeCardBody: {
    fontSize: 13,
    color: "#64748b",
    lineHeight: 18,
    marginBottom: 8,
  },
  noticeCardDate: {
    fontSize: 11,
    color: "#94a3b8",
    fontWeight: "500",
  },
  overallAttBox: {
    backgroundColor: "#eff6ff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  overallAttScore: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#2563eb",
  },
  overallAttLabel: {
    fontSize: 13,
    color: "#3b82f6",
    fontWeight: "600",
    marginTop: 4,
  },
  subjectAttRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  subjectTitle: {
    fontSize: 14,
    color: "#334155",
    fontWeight: "500",
  },
  subjectScore: {
    fontSize: 14,
    color: "#10b981",
    fontWeight: "bold",
  },
});

export default VouchersScreen;
