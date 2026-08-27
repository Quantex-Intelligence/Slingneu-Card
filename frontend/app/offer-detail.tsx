import Api from "@/config/Api";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";

const { width } = Dimensions.get("window");

interface Coupon {
  _id: string;
  title: string;
  description: string;
  couponCode: string;
  image: string;
  imagePublicId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  link: string;
}

export default function OfferDetail() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const offerId = params.id as string;
  const { token } = useSelector((state: any) => state.auth);

  const [offer, setOffer] = useState<Coupon | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCoupon, setShowCoupon] = React.useState(false);

  useEffect(() => {
    fetchOfferDetails();
  }, [offerId]);

  const fetchOfferDetails = async () => {
    try {
      setLoading(true);
      let foundOffer: Coupon | undefined;
      const response = await Api.call(
        `/api/coupons/search?page=1&limit=10`,
        "GET",
        {},
        token
      );

      if (response.status === 200) {
        const coupons = response.data.coupons || [];
        foundOffer = coupons.find((coupon: Coupon) => coupon._id === offerId);
      }

      if (!foundOffer) {
        const defaultOffers: Coupon[] = [
          {
            _id: "c1",
            title: "Campus Food Fest",
            description: "Get 20% cashback on all campus eatery orders!",
            couponCode: "CAMPUSFOOD20",
            image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=60",
            imagePublicId: "",
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            link: "https://slingneo.cloud",
          },
          {
            _id: "c2",
            title: "Bookstore Special",
            description: "Flat ₹150 OFF on academic books and stationery",
            couponCode: "SLINGBOOKS150",
            image: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=500&auto=format&fit=crop&q=60",
            imagePublicId: "",
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            link: "https://slingneo.cloud",
          },
          {
            _id: "c3",
            title: "Student Travel Pass",
            description: "10% Instant discount on metro and bus recharge",
            couponCode: "SLINGTRAVEL",
            image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=500&auto=format&fit=crop&q=60",
            imagePublicId: "",
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            link: "https://slingneo.cloud",
          }
        ];
        foundOffer = defaultOffers.find((c) => c._id === offerId) || defaultOffers[0];
      }

      setOffer(foundOffer);
    } catch (error) {
      console.log("Error fetching offer details, using fallback offer:", error);
      setOffer({
        _id: "c1",
        title: "Campus Food Fest",
        description: "Get 20% cashback on all campus eatery orders!",
        couponCode: "CAMPUSFOOD20",
        image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=60",
        imagePublicId: "",
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        link: "https://slingneo.cloud",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={["#6c56f9", "#8b5cf6", "#a855f7"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerContainer}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <MaterialCommunityIcons name="arrow-left" size={28} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Exclusive Deals</Text>
            <View style={{ width: 28 }} />
          </View>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6c56f9" />
          <Text style={styles.loadingText}>Loading offer details...</Text>
        </View>
      </View>
    );
  }

  if (!offer) {
    return (
      <View style={styles.container}>
        <Text style={{ color: '#1e293b', fontSize: 18, marginTop: 40 }}>Offer not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#6c56f9", "#8b5cf6", "#a855f7"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerContainer}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Exclusive Deals</Text>
          <View style={{ width: 28 }} />
        </View>
      </LinearGradient>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.brandRow}>
          <View style={styles.brandImageWrapper}>
            <Image
              source={{ uri: offer.image || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=60" }}
              style={styles.brandImage}
              resizeMode="cover"
            />
          </View>
          <View style={styles.brandInfo}>
            <Text style={styles.brandName}>{offer.title || "Special Offer"}</Text>
            <Text style={styles.brandTitle}>{offer.description || "Exclusive student discount deal"}</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>COUPON CODE</Text>
        <TouchableOpacity 
          style={styles.couponBox} 
          onPress={async () => {
            setShowCoupon(true);
            const code = offer.couponCode || "CAMPUS50";
            try {
              const Clipboard = require("expo-clipboard");
              await Clipboard.setStringAsync(code);
              Alert.alert("Copied!", `Coupon code "${code}" copied to clipboard.`);
            } catch (e) {
              Alert.alert("Coupon Code", `Your code is: ${code}`);
            }
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.couponText}>
            {showCoupon ? (offer.couponCode || "CAMPUS50") : '••••••••'}
          </Text>
          <View style={styles.copyPill}>
            <MaterialCommunityIcons name="content-copy" size={14} color="#fff" />
            <Text style={styles.copyPillText}>{showCoupon ? 'Copy' : 'Show Code'}</Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.sectionLabel}>Brand Description</Text>
        <Text style={styles.brandDescription}>{offer.description || "Get exclusive discounts with your Slingneo card."}</Text>

        <Text style={styles.sectionLabel}>Terms and Conditions</Text>
        <Text style={styles.termsText}>• Valid on select styles & participating outlets</Text>
        <Text style={styles.termsText}>• Cannot be clubbed with any other active offer</Text>
        <Text style={styles.termsText}>• Offer valid until stock lasts</Text>

        <TouchableOpacity 
          onPress={async () => {
            const code = offer.couponCode || "CAMPUS50";
            try {
              const Clipboard = require("expo-clipboard");
              await Clipboard.setStringAsync(code);
            } catch (e) {}

            if (offer.link && offer.link.startsWith("http")) {
              router.push({
                pathname: "/webview",
                params: {
                  url: offer.link,
                  title: offer.title || "Exclusive Offer",
                },
              });
            } else {
              Alert.alert("Coupon Ready!", `Code "${code}" copied. Use it at checkout!`);
            }
          }} 
          style={styles.shopNowButton}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={["#6c56f9", "#8b5cf6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.shopNowGradient}
          >
            <MaterialCommunityIcons name="shopping-outline" size={20} color="#fff" />
            <Text style={styles.shopNowText}>Shop Now & Redeem</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
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
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
  },
  scrollContent: {
    padding: 20,
    gap: 18,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  brandImageWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
    overflow: "hidden",
  },
  brandImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  brandInfo: {
    flex: 1,
  },
  brandName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#6c56f9",
    marginBottom: 2,
  },
  brandTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 2,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1e293b",
    marginTop: 18,
    marginBottom: 6,
  },
  couponRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  couponBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderWidth: 1.5,
    borderColor: "#6c56f9",
    shadowColor: "#6c56f9",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 8,
  },
  couponText: {
    fontSize: 20,
    fontWeight: "bold",
    letterSpacing: 2,
    color: "#6c56f9",
  },
  copyPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6c56f9",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  copyPillText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13,
  },
  brandDescription: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 8,
  },
  termsText: {
    fontSize: 13,
    color: "#64748b",
    marginBottom: 2,
  },
  shopNowButton: {
    marginTop: 28,
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#6c56f9",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  shopNowGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 10,
  },
  shopNowText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
}); 