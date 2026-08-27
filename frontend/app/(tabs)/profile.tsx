import AddMoneyModal from "@/components/AddMoneyModal";
import Api from "@/config/Api";
import UserProfileModal from "@/components/UserProfileModal";
import { logout } from "@/store/slices/authSlice";
import {
  Feather,
  FontAwesome,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  Image,
  Linking,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

export default function Profile() {
  const { user, token } = useSelector((state: any) => state.auth);
  const dispatch = useDispatch();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [balance, setBalance] = useState(0);

  const fetchBalance = async () => {
    try {
      if (user?.phone) {
        const res = await Api.call(
          `/api/slingneo/balance/${"TSCSLINGNEO" + user?.phone}`,
          "GET",
          {},
          token
        );
        const bal = res?.data?.result?.[0]?.balance ?? 0;
        setBalance(bal);
      }
    } catch (e) {
      console.log("Error fetching balance in profile:", e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchBalance();
    }, [user?.phone])
  );

  const performLogout = () => {
    dispatch(logout());
    router.replace("/(auth)/login");
  };

  const onLogout = () => {
    if (Platform.OS === "web") {
      if (typeof window !== "undefined" && window.confirm("Are you sure you want to logout?")) {
        performLogout();
      }
    } else {
      Alert.alert("Logout", "Are you sure you want to logout?", [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          onPress: performLogout,
        },
      ]);
    }
  };

  const openWebLink = (url: string, title: string) => {
    if (Platform.OS === "web") {
      if (typeof window !== "undefined") {
        window.open(url, "_blank");
      } else {
        Linking.openURL(url);
      }
    } else {
      router.push({
        pathname: "/webview",
        params: { url, title },
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        {/* Profile Info */}
        <View style={styles.profileSection}>
          <Image
            source={{
              uri:
                user?.profile ||
                `https://ui-avatars.com/api/?name=${user?.name}&background=random`,
            }}
            style={styles.avatar}
          />
          <Text style={styles.profileName}>{user?.name}</Text>
          <Text style={styles.profileUsername}>{user?.phone}</Text>
        </View>

        {/* Wallet Balance Card */}
        <View style={styles.balanceSection}>
          <LinearGradient
            colors={["#6c56f9", "#8b5cf6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.balanceCard}
          >
            <View style={styles.balanceHeader}>
              <View style={styles.balanceIconWrapper}>
                <MaterialCommunityIcons name="wallet-outline" size={24} color="#fff" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.balanceLabel}>Total Wallet Balance</Text>
                <Text style={styles.balanceAmount}>₹{balance.toLocaleString()}</Text>
              </View>
              <TouchableOpacity
                style={styles.addMoneyBtn}
                onPress={() => setShowAddMoneyModal(true)}
                activeOpacity={0.85}
              >
                <Feather name="plus" size={16} color="#6c56f9" />
                <Text style={styles.addMoneyBtnText}>Add Money</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        {/* Personal Info */}
        <View style={styles.optionsSection}>
          <Text style={styles.sectionLabel}>Personal Info</Text>
          <View style={styles.optionsBox}>
            <TouchableOpacity
              style={styles.optionRow}
              onPress={() => setShowProfileModal(true)}
            >
              <View
                style={[
                  styles.optionIconContainer,
                  { backgroundColor: "#E0E7FF" },
                ]}
              >
                <Feather name="user" size={20} color="#6366F1" />
              </View>
              <Text style={styles.optionText}>Your profile</Text>
              <Feather name="chevron-right" size={20} color="#BDBDBD" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/transactions")}
              style={styles.optionRow}
            >
              <View
                style={[
                  styles.optionIconContainer,
                  { backgroundColor: "#D1FAE5" },
                ]}
              >
                <Feather name="clock" size={20} color="#10B981" />
              </View>
              <Text style={styles.optionText}>History Transaction</Text>
              <Feather name="chevron-right" size={20} color="#BDBDBD" />
            </TouchableOpacity>
          </View>
        </View>

        {/* General */}
        <View style={styles.optionsSection}>
          <Text style={styles.sectionLabel}>General</Text>
          <View style={styles.optionsBox}>
            <TouchableOpacity
              style={styles.optionRow}
              onPress={() => router.push("/help-support")}
            >
              <View
                style={[
                  styles.optionIconContainer,
                  { backgroundColor: "#DBEAFE" },
                ]}
              >
                <Feather name="help-circle" size={20} color="#3B82F6" />
              </View>
              <Text style={styles.optionText}>Help and support</Text>
              <Feather name="chevron-right" size={20} color="#BDBDBD" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                openWebLink(
                  "https://transcorpint.com/ppi-policies-and-tc/",
                  "Policy and T&C"
                )
              }
              style={styles.optionRow}
            >
              <View
                style={[
                  styles.optionIconContainer,
                  { backgroundColor: "#E5E7EB" },
                ]}
              >
                <Feather name="file-text" size={20} color="#6B7280" />
              </View>
              <Text style={styles.optionText}>Policy and T&C</Text>
              <Feather name="chevron-right" size={20} color="#BDBDBD" />
            </TouchableOpacity>
          </View>
        </View>

        {/* More Options */}
        <View style={[styles.optionsSection]}>
          <Text style={styles.sectionLabel}>More Options</Text>
          <View style={styles.optionsBox}>
            <TouchableOpacity style={styles.optionRow} onPress={onLogout}>
              <View
                style={[
                  styles.optionIconContainer,
                  { backgroundColor: "#FEE2E2" },
                ]}
              >
                <Feather name="log-out" size={20} color="#EF4444" />
              </View>
              <Text style={styles.optionText}>Logout</Text>
              <Feather name="chevron-right" size={20} color="#BDBDBD" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer Section */}
        <View style={[styles.footerContainer, { paddingBottom: 60 }]}>
          <View style={styles.socialRow}>
            {/* Instagram */}
            <TouchableOpacity
              style={styles.socialIcon}
              onPress={() =>
                openWebLink("https://www.instagram.com/slingneo", "Instagram")
              }
            >
              <FontAwesome name="instagram" size={32} color="#C13584" />
            </TouchableOpacity>
            {/* X (Twitter) */}
            <TouchableOpacity
              style={styles.socialIcon}
              onPress={() =>
                openWebLink("https://x.com/slingneo", "X")
              }
            >
              <MaterialCommunityIcons name="twitter" size={32} color="#111" />
            </TouchableOpacity>
            {/* LinkedIn */}
            <TouchableOpacity
              style={styles.socialIcon}
              onPress={() =>
                openWebLink(
                  "https://www.linkedin.com/company/slingneo",
                  "LinkedIn"
                )
              }
            >
              <FontAwesome name="linkedin" size={32} color="#0077B5" />
            </TouchableOpacity>
            {/* Facebook */}
            <TouchableOpacity
              style={styles.socialIcon}
              onPress={() =>
                openWebLink("https://www.facebook.com/slingneo", "Facebook")
              }
            >
              <FontAwesome name="facebook" size={32} color="#1877F3" />
            </TouchableOpacity>
          </View>
          <View style={styles.linksRow}>
            <TouchableOpacity
              onPress={() =>
                openWebLink("https://slingneo.in", "Sling")
              }
            >
              <Text style={styles.footerLink}>www.slingneo.in</Text>
            </TouchableOpacity>
            <Text style={styles.footerDivider}>|</Text>
            <TouchableOpacity
              onPress={() =>
                openWebLink(
                  "https://slingneo.in/terms-and-conditions/",
                  "Terms & Conditions"
                )
              }
            >
              <Text style={styles.footerLink}>Terms & Condition</Text>
            </TouchableOpacity>
            <Text style={styles.footerDivider}>|</Text>
            <TouchableOpacity
              onPress={() =>
                openWebLink(
                  "https://slingneo.in/privacy-policy-2/",
                  "Privacy Policy"
                )
              }
            >
              <Text style={styles.footerLink}>Privacy Policy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* User Profile Detail Modal */}
      <UserProfileModal
        visible={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={user}
      />

      <AddMoneyModal
        visible={showAddMoneyModal}
        onClose={() => {
          setShowAddMoneyModal(false);
          fetchBalance();
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  balanceSection: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  balanceCard: {
    borderRadius: 16,
    padding: 16,
    shadowColor: "#6c56f9",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  balanceHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  balanceIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  balanceLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
    fontFamily: "SpaceMono-Regular",
  },
  balanceAmount: {
    fontSize: 22,
    color: "#fff",
    fontWeight: "bold",
    fontFamily: "SpaceMono-Regular",
    marginTop: 2,
  },
  addMoneyBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 4,
  },
  addMoneyBtnText: {
    color: "#6c56f9",
    fontWeight: "bold",
    fontSize: 13,
    fontFamily: "SpaceMono-Regular",
  },
  container: {
    paddingBottom: 10,
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    fontFamily: "SpaceMono-Regular",
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: 24,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  profileName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    fontFamily: "SpaceMono-Regular",
  },
  profileUsername: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
    fontFamily: "SpaceMono-Regular",
  },
  optionsSection: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
    paddingHorizontal: 8,
    fontFamily: "SpaceMono-Regular",
  },
  optionsBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  optionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  optionText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
    flex: 1,
    fontFamily: "SpaceMono-Regular",
  },
  footerContainer: {
    alignItems: "center",
    marginTop: 32,
    marginBottom: 16,
  },
  socialRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 12,
  },
  socialIcon: {
    marginHorizontal: 12,
  },
  linksRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  footerLink: {
    fontSize: 10,
    color: "#111827",
    textDecorationLine: "underline",
    marginHorizontal: 4,
    fontFamily: "SpaceMono-Regular",
  },
  footerDivider: {
    fontSize: 12,
    color: "#111827",
    marginHorizontal: 2,
    fontWeight: "500",
    fontFamily: "SpaceMono-Regular",
  },
});
