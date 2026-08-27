import Api from "@/config/Api";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  RefreshControl,
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
}

export default function OfferList() {
  const router = useRouter();
  const { token } = useSelector((state: any) => state.auth);
  
  const [offers, setOffers] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await Api.call(
        `/api/coupons/search?page=1&limit=10`,
        "GET",
        {},
        token
      );

      let fetchedOffers = response.status === 200 ? response.data.coupons || [] : [];
      if (!fetchedOffers.length) {
        fetchedOffers = [
          {
            _id: "c1",
            title: "Campus Food Fest",
            description: "Get 20% cashback on all campus eatery orders!",
            couponCode: "CAMPUSFOOD20",
            image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=60",
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            _id: "c2",
            title: "Bookstore Special",
            description: "Flat ₹150 OFF on academic books and stationery",
            couponCode: "SLINGBOOKS150",
            image: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=500&auto=format&fit=crop&q=60",
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            _id: "c3",
            title: "Student Travel Pass",
            description: "10% Instant discount on metro and bus recharge",
            couponCode: "SLINGTRAVEL",
            image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=500&auto=format&fit=crop&q=60",
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        ];
      }
      setOffers(fetchedOffers);
    } catch (error) {
      console.log("Error fetching offers, using fallback offers:", error);
      setOffers([
        {
          _id: "c1",
          title: "Campus Food Fest",
          description: "Get 20% cashback on all campus eatery orders!",
          couponCode: "CAMPUSFOOD20",
          image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=60",
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          _id: "c2",
          title: "Bookstore Special",
          description: "Flat ₹150 OFF on academic books and stationery",
          couponCode: "SLINGBOOKS150",
          image: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=500&auto=format&fit=crop&q=60",
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    fetchOffers(true);
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
          <Text style={styles.loadingText}>Loading offers...</Text>
        </View>
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
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#6c56f9"]}
            tintColor="#6c56f9"
          />
        }
      >
        {offers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons 
              name="ticket-percent-outline" 
              size={64} 
              color="#cbd5e1" 
            />
            <Text style={styles.emptyText}>No offers available</Text>
            <Text style={styles.emptySubtext}>Check back later for new deals!</Text>
          </View>
        ) : (
          offers.map((offer) => (
            <TouchableOpacity
              key={offer._id}
              style={styles.offerCard}
              activeOpacity={0.9}
              onPress={() => router.push({ pathname: "/offer-detail", params: { id: offer._id } })}
            >
              <LinearGradient
                colors={["#fff", "#f8fafc"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.offerCardGradient}
              >
                <View style={styles.offerImageWrapper}>
                  <Image 
                    source={{ uri: offer.image }} 
                    style={styles.offerImage} 
                    resizeMode="cover"
                    defaultSource={require("../assets/images/cardBg.jpeg")}
                  />
                </View>
                <View style={styles.offerInfo}>
                  <Text style={styles.brand}>{offer.title}</Text>
                  <Text style={styles.title}>{offer.couponCode}</Text>
                  <Text style={styles.description}>{offer.description}</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={28} color="#6c56f9" />
              </LinearGradient>
            </TouchableOpacity>
          ))
        )}
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "600",
    color: "#64748b",
    textAlign: "center",
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
  },
  scrollContent: {
    padding: 20,
    gap: 18,
    flexGrow: 1,
  },
  offerCard: {
    borderRadius: 18,
    shadowColor: "#6c56f9",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 8,
  },
  offerCardGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    borderRadius: 18,
  },
  offerImageWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 18,
    overflow: "hidden",
  },
  offerImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  offerInfo: {
    flex: 1,
  },
  brand: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#6c56f9",
    marginBottom: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 2,
  },
  description: {
    fontSize: 13,
    color: "#64748b",
  },
}); 