import AddMoneyModal from "@/components/AddMoneyModal";
import Api from "@/config/Api";
import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useSelector } from "react-redux";

const { width: screenWidth } = Dimensions.get('window');

export default function Home() {
  const { user, token } = useSelector((state: any) => state.auth);
  const router = useRouter();
  const [balance, setBalance] = useState(0);
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [allLayout, setAllLayout] = useState([]);
  const isFocused = useIsFocused();
  const [refreshing, setRefreshing] = useState(false);

  const fetchAllLayout = async () => {
    const response = await Api.call("/api/layouts", "GET", {}, token);
    if (response.status === 200) {
      setAllLayout(response.data.layouts);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchAllLayout(),
        getBalance()
      ]);
    } catch (error) {
      console.error('Refresh failed:', error);
    }
    setRefreshing(false);
  };

  useEffect(() => {
    fetchAllLayout();
  }, []);

  // Filter layouts to only include slider type
  const sliderLayouts = allLayout.filter((layout: any) => layout.type === "slider");
  
  // Flatten all images from slider layouts into a single array
  const allSliderImages = sliderLayouts.flatMap((layout: any) => 
    layout.images ? layout.images.map((image: any) => ({ ...image, layoutId: layout._id })) : []
  );

  // Filter layouts to only include ads type
  const adsLayouts = allLayout.filter((layout: any) => layout.type === "ads");
  
  // Flatten all images from ads layouts into a single array
  const allAdsImages = adsLayouts.flatMap((layout: any) => 
    layout.images ? layout.images.map((image: any) => ({ ...image, layoutId: layout._id })) : []
  );



  const actionIcons = [
    {
      id: 1,
      title: "Recharge",
      icon: "cellphone-wireless",
      color: "#4CAF50",
      gradient: ["#4CAF50", "#45a049"],
      onPress: () => router.push("/recharge"),
    },
    {
      id: 2,
      title: "View Offers",
      icon: "gift",
      color: "#FF6B6B",
      gradient: ["#FF6B6B", "#FF8E53"],
      onPress: () => router.push('/offer-list'),
    },
    {
      id: 3,
      title: "Coupons",
      icon: "ticket-percent",
      color: "#4ECDC4",
      gradient: ["#4ECDC4", "#44A08D"],
      onPress: () => Alert.alert("Coupons", "Coupons page coming soon!"),
    },
    {
      id: 4,
      title: "Cashback",
      icon: "cash-multiple",
      color: "#A8E6CF",
      gradient: ["#A8E6CF", "#7FCDCD"],
      onPress: () => router.push('/rewards'),
    }
  ];

  useEffect(() => {
    if (isFocused) {
      getBalance();
    }
  }, [isFocused]);


  const getBalance = async () => {
    const response = await Api.call(
      `/api/slingneo/balance/${"TSCSLINGNEO" + user?.phone}`,
      "GET",
      {},
      token
    );
    if (response.status === 200) {
      setBalance(response.data.result[0].balance || 0);
    }
  };

  const renderSliderImage = (image: any, index: number) => {
    const inputRange = [
      (index - 1) * screenWidth,
      index * screenWidth,
      (index + 1) * screenWidth,
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.8, 1, 0.8],
      extrapolate: 'clamp',
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.4, 1, 0.4],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View
        key={`${image.layoutId}-${index}`}
        style={[
          styles.slideContainer,
          {
            transform: [{ scale }],
            opacity,
          },
        ]}
      >
          <View style={styles.slideContent}>
            <Image 
              source={{ uri: image?.url }} 
              style={styles.slideImage}
              resizeMode="cover"
            />
          </View>
          <View style={styles.slideDecoration}>
            <View style={styles.slideCircle1} />
            <View style={styles.slideCircle2} />
            <View style={styles.slideCircle3} />
          </View>
      </Animated.View>
    );
  };

 

  const renderActionIcon = (item: any) => (
    <TouchableOpacity
      key={item.id}
      style={styles.actionIconContainer}
      onPress={item.onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={item.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.actionIconGradient}
      >
        <MaterialCommunityIcons
          name={item.icon as any}
          size={20}
          color="#fff"
        />
      </LinearGradient>
      <Text style={styles.actionIconTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

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
        style={styles.headerContainer}
      >
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <View style={styles.avatarContainer}>
              <Image source={{ uri: user?.profile }} style={styles.avatar} />
              <View style={styles.onlineIndicator} />
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.name}>{user?.name}</Text>
              <View style={styles.balanceContainer}>
                <Text style={styles.balanceText}>₹{balance.toLocaleString()}</Text>
                <TouchableOpacity 
                  style={styles.addMoneyButton}
                  onPress={() => setShowAddMoneyModal(true)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={["#22c55e", "#16a34a"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.addMoneyPill}
                  >
                    <MaterialCommunityIcons name="plus" size={12} color="#fff" />
                    <Text style={styles.addMoneyPillText}>Add</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.offersButton} onPress={() => router.push('/offer-list')}>
            <LinearGradient
              colors={["#FF6B6B", "#FF8E53"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.offersButtonGradient}
            >
              <FontAwesome5 name="gift" size={12} color="#fff" />
              <Text style={styles.offersButtonText}>Offers</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#6c56f9"
            colors={["#6c56f9", "#8b5cf6", "#a855f7"]}
          />
        }
      >
        {/* Slider Section - Only show if there are slider images */}
        {allSliderImages.length > 0 && (
          <View style={styles.sliderContainer}>
            <Text style={styles.sectionTitle}>Special Offers</Text>
            <View style={styles.sliderWrapper}>
              <Animated.ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={Animated.event(
                  [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                  { useNativeDriver: true }
                )}
                scrollEventThrottle={16}
                style={styles.slider}
              >
                {allSliderImages.map((image, index) => renderSliderImage(image, index))}
              </Animated.ScrollView>
              
              {/* Pagination Dots */}
              <View style={styles.paginationContainer}>
                {allSliderImages.map((image: any, index: number) => {
                  const inputRange = [
                    (index - 1) * (screenWidth - 40),
                    index * (screenWidth - 40),
                    (index + 1) * (screenWidth - 40),
                  ];

                  const scale = scrollX.interpolate({
                    inputRange,
                    outputRange: [1, 1.2, 1],
                    extrapolate: 'clamp',
                  });

                  const opacity = scrollX.interpolate({
                    inputRange,
                    outputRange: [0.4, 1, 0.4],
                    extrapolate: 'clamp',
                  });

                  return (
                    <Animated.View
                      key={index}
                      style={[
                        styles.paginationDot,
                        {
                          transform: [{ scale }],
                          opacity,
                        },
                      ]}
                    />
                  );
                })}
              </View>
            </View>
          </View>
        )}

        {/* Action Icons Grid */}
        <View style={styles.actionIconsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionIconsGrid}>
            {actionIcons.map(renderActionIcon)}
          </View>
        </View>

        {/* Add My Campus Button */}
        <View style={styles.campusSection}>
          <TouchableOpacity style={styles.campusButton} onPress={() => router.push('/vouchers')}>
            <LinearGradient
              colors={["#667eea", "#764ba2"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.campusButtonGradient}
            >
              <View style={styles.campusButtonContent}>
                <MaterialCommunityIcons
                  name="school"
                  size={24}
                  color="#fff"
                />
                <View style={styles.campusButtonText}>
                  <Text style={styles.campusButtonTitle}>Add My Campus</Text>
                  <Text style={styles.campusButtonSubtitle}>
                    Connect with your university
                  </Text>
                </View>
                <MaterialCommunityIcons
                  name="arrow-right"
                  size={18}
                  color="#fff"
                />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

  

        {/* Dynamic Ads Section */}
        {allAdsImages.length > 0 && (
          <View style={styles.adsContainer}>
            <View style={styles.adsWrapper}>
              {allAdsImages.map((image, index) => (
                <View key={`${image.layoutId}-${index}`} style={styles.adsItemContainer}>
                  <Image 
                    source={{ uri: image?.url }} 
                    style={styles.adsImage}
                    resizeMode="cover"
                  />
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Financial Wellness Section */}
        <View style={[styles.financialWellnessContainer ,{marginTop: 20}]}>
          <Text style={styles.financialWellnessTitle}>Your Path To{"\n"}Financial Wellness</Text>
          <Text style={styles.trustedByText}>Trusted By</Text>
          <Text style={styles.trustedByNumber}>2.8 M + Indians</Text>
        </View>
      </ScrollView>

      {/* Add Money Modal */}
      <AddMoneyModal
        visible={showAddMoneyModal}
        onClose={() => {
          getBalance();
          setShowAddMoneyModal(false);
        }}
        maxAmount={Math.max(0, 10000 - balance)}
      />


    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  headerContainer: {
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#e2e8f0",
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#10b981",
    borderWidth: 2,
    borderColor: "#fff",
  },
  userDetails: {
    marginLeft: 16,
  },
  name: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
    fontFamily: "SpaceMono-Regular",
  },
  balanceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  balanceText: {
    color: "#e2e8f0",
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "SpaceMono-Regular",
  },
  addMoneyButton: {
    marginLeft: 10,
  },
  addMoneyPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  addMoneyPillText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
    marginLeft: 6,
    fontFamily: "SpaceMono-Regular",
  },
  offersButton: {
    borderRadius: 20,
    shadowColor: "#FF6B6B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  offersButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  offersButtonText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
    marginLeft: 6,
    fontFamily: "SpaceMono-Regular",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  sliderContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 16,
    fontFamily: "SpaceMono-Regular",
  },
  sliderWrapper: {
    position: "relative",
  },
  slider: {
    height: 200,
  },
  slideContainer: {
    width: screenWidth - 50,
    height: 180,
    marginRight: 16,
  },
  slideGradient: {
    flex: 1,
    borderRadius: 20,
    padding: 24,
    position: "relative",
    overflow: "hidden",
  },
  slideContent: {
    width: '100%',
    height: 180,
    borderRadius: 12,
  },
  slideIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  slideTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 6,
  },
  slideSubtitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 4,
  },
  slideDescription: {
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
    lineHeight: 16,
  },
  slideDecoration: {
    position: "absolute",
    top: -20,
    right: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  slideCircle1: {
    position: "absolute",
    top: 15,
    right: 15,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  slideCircle2: {
    position: "absolute",
    bottom: 20,
    left: 20,
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  slideCircle3: {
    position: "absolute",
    top: 60,
    right: 35,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.4)",
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  paginationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#6c56f9",
    marginHorizontal: 6,
  },
  actionIconsSection: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  actionIconsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  actionIconContainer: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 4,
  },
  actionIconGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  actionIconTitle: {
    fontSize: 10,
    fontWeight: "600",
    color: "#1e293b",
    textAlign: "center",
    fontFamily: "SpaceMono-Regular",
  },
  campusSection: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  campusButton: {
    borderRadius: 20,
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  campusButtonGradient: {
    borderRadius: 20,
    padding: 20,
  },
  campusButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  campusButtonText: {
    flex: 1,
    marginLeft: 16,
  },
  campusButtonTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
    fontFamily: "SpaceMono-Regular",
  },
  campusButtonSubtitle: {
    fontSize: 10,
    color: "rgba(255,255,255,0.9)",
    fontFamily: "SpaceMono-Regular",
  },
  taglineContainer: {
    marginTop: 32,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  taglineGradient: {
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  taglineText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    textAlign: "center",
    marginBottom: 8,
    fontStyle: "italic",
  },
  taglineSubtext: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
  },
  upgradBannerContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
    marginTop: 20,
  },
  upgradBanner: {
    padding: 20,
    alignItems: "center",
  },
  upgradHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  upgradLogo: {
    color: "#E53535",
    fontWeight: "bold",
    fontSize: 22,
    marginRight: 10,
  },
  upgradTitle: {
    color: "#E53535",
    fontWeight: "bold",
    fontSize: 18,
  },
  upgradSubtitle: {
    color: "#22223b",
    fontSize: 14,
    marginBottom: 10,
    textAlign: "center",
  },
  upgradButton: {
    backgroundColor: "#E53535",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginBottom: 10,
  },
  upgradButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  upgradFlags: {
    flexDirection: "row",
    marginBottom: 8,
  },
  flag: {
    fontSize: 22,
    marginHorizontal: 2,
  },
  upgradFooter: {
    color: "#6c757d",
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
  },
  financialWellnessContainer: {
    marginHorizontal: 20,
    marginBottom: 30,
    alignItems: "flex-start",
  },
  financialWellnessTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#7c7c9a",
    marginBottom: 8,
    fontFamily: "SpaceMono-Regular",
  },
  trustedByText: {
    color: "#FFD93D",
    fontWeight: "bold",
    fontSize: 12,
    fontFamily: "SpaceMono-Regular",
  },
  trustedByNumber: {
    color: "#FFD93D",
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 8,
    fontFamily: "SpaceMono-Regular",
  },
  slideImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
  },
  adsContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  adsWrapper: {
    gap: 16,
  },
  adsItemContainer: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  adsImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
});
