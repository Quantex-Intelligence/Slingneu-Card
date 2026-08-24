import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

const IdentityWidget: React.FC = () => {
  return (
    <View style={[styles.card, { backgroundColor: "#ffffff" }]}>
      <View style={styles.cardContent}>
        <View style={styles.topRow}>
          <View style={styles.imageContainer}>
            <Image
              source={require("../../assets/images/kyc/passwordscan.png")}
              style={styles.cardImage}
            />
          </View>
          <View style={{ marginLeft: 16 }}>
            <Text style={[styles.cardTitle, { color: "#1f2937" }]}>Verify with PAN</Text>
            <Text style={[styles.cardTitle, { color: "#1f2937" }]}>details</Text>
            <Text style={[styles.cardCaption]}>We’ll match your details to speed up KYC.</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.bottomRow}>
          <View style={styles.iconContainer}>
            <Ionicons name="attach" size={22} color="#4F46E5" />
          </View>
          <View style={styles.clipTextContainer}>
            <Text style={[styles.clipTitle, { color: "#111827" }]}>PAN verification</Text>
            <Text style={styles.clipSubtitle}>We only use it to verify your identity.</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default function KYCOnboarding() {
  const router = useRouter();

  return (
    <ScrollView style={[styles.container, { backgroundColor: "#f8f9ff" }]}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={["#4F46E5", "#7C3AED"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.heroContent}>
          <Image
            source={require("../../assets/images/icon.png")}
            style={styles.heroIcon}
          />
          <Text style={styles.heroTitle}>Complete your KYC</Text>
          <Text style={styles.heroSubtitle}>Takes less than 2 minutes</Text>
        </View>
      </LinearGradient>

      <View style={styles.section}>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: "#4F46E5" }]}>Verify</Text>
          <Text style={[styles.title, { color: "#111827" }]}> Identity</Text>
        </View>
        <Text style={[styles.subtitle, { color: "#6b7280" }]}>We’ll guide you through a few short steps.</Text>
      </View>

      <View style={styles.cardsContainer}>
        <IdentityWidget />

        <View style={[styles.card, { backgroundColor: "#ffffff" }]}>
          <View style={styles.cardContent}>
            <View style={styles.cardHeaderRow}>
              <MaterialCommunityIcons name="timeline-text" size={22} color="#4F46E5" />
              <Text style={[styles.cardHeaderTitle]}>KYC steps</Text>
            </View>
            <View style={styles.bulletRow}>
              <View style={styles.bulletDot} />
              <Text style={styles.bulletText}><Text style={styles.bold}>Personal info</Text>: name, gender, marital status, employment, DOB</Text>
            </View>
            <View style={styles.bulletRow}>
              <View style={styles.bulletDot} />
              <Text style={styles.bulletText}><Text style={styles.bold}>Address</Text>: address line, city, state, PIN</Text>
            </View>
            <View style={styles.bulletRow}>
              <View style={styles.bulletDot} />
              <Text style={styles.bulletText}><Text style={styles.bold}>KYC details</Text>: Valid PAN card & its expiry date</Text>
            </View>
            <View style={styles.bulletRow}>
              <View style={styles.bulletDot} />
              <Text style={styles.bulletText}><Text style={styles.bold}>OTP verification</Text>: email & phone verification via OTP</Text>
            </View>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: "#ffffff" }]}>
          <View style={styles.cardContent}>
            <View style={styles.cardHeaderRow}>
              <MaterialCommunityIcons name="credit-card-chip" size={22} color="#4F46E5" />
              <Text style={styles.cardHeaderTitle}>Card options</Text>
            </View>
            <View style={styles.inlinePills}>
              <View style={styles.pill}>
                <Text style={styles.pillText}>Virtual Card</Text>
              </View>
              <View style={styles.pillAlt}>
                <Text style={styles.pillTextAlt}>Physical Card</Text>
              </View>
            </View>
            <Text style={styles.helperText}>Choose Virtual or Physical in the first step. If you select Physical, keep your Kit Number ready.</Text>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: "#ffffff" }]}>
          <View style={styles.cardContent}>
            <View style={styles.cardHeaderRow}>
              <MaterialCommunityIcons name="shield-lock" size={22} color="#4F46E5" />
              <Text style={styles.cardHeaderTitle}>Privacy & security</Text>
            </View>
            <Text style={styles.helperText}>Your data is encrypted and used only for verification. You can review our Terms and Privacy in the next screens.</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.submitButton, { backgroundColor: "#4F46E5" }]}
        onPress={() => router.push("/kyc")}
      >
        <Text style={styles.submitButtonText}>Start KYC</Text>
        <MaterialCommunityIcons name="arrow-right" size={18} color="#ffffff" />
      </TouchableOpacity>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9ff",
  },
  hero: {
    height: 160,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: "hidden",
  },
  heroContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 6,
  },
  heroIcon: {
    width: 56,
    height: 56,
    resizeMode: "contain",
    marginBottom: 6,
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  heroSubtitle: {
    color: "#E5E7EB",
    fontSize: 12,
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  titleContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginTop: 18,
  },
  title: {
    fontSize: 18,
    fontFamily: "SpaceMono-Regular",
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 12,
    paddingHorizontal: 20,
    marginTop: 6,
    lineHeight: 18,
    fontFamily: "SpaceMono-Regular",
  },
  cardsContainer: {
    marginTop: 32,
    paddingHorizontal: 20,
  },
  card: {
    borderRadius: 16,
    marginBottom: 18,
    shadowColor: "#4F46E5",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardContent: {
    padding: 16,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  imageContainer: {
    backgroundColor: "#f0f0ff",
    padding: 10,
    borderRadius: 12,
  },
  cardImage: {
    height: 48,
    width: 48,
    resizeMode: "contain",
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "SpaceMono-Regular",
  },
  cardCaption: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 2,
    fontFamily: "SpaceMono-Regular",
  },
  divider: {
    height: 1,
    backgroundColor: "#f0f0ff",
    marginVertical: 8,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    backgroundColor: "#f0f0ff",
    padding: 8,
    borderRadius: 12,
  },
  clipTextContainer: {
    marginLeft: 12,
  },
  clipTitle: {
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "SpaceMono-Regular",
  },
  clipSubtitle: {
    fontSize: 11,
    marginTop: 2,
    fontFamily: "SpaceMono-Regular",
    color: "#6b7280",
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  cardHeaderTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
    fontFamily: "SpaceMono-Regular",
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginTop: 8,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#4F46E5",
    marginTop: 6,
  },
  bulletText: {
    flex: 1,
    fontSize: 12,
    color: "#374151",
    lineHeight: 18,
    fontFamily: "SpaceMono-Regular",
  },
  bold: {
    fontWeight: "700",
    color: "#111827",
  },
  inlinePills: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
    marginBottom: 6,
  },
  pill: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  pillAlt: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  pillText: {
    fontSize: 11,
    color: "#4F46E5",
    fontWeight: "700",
    fontFamily: "SpaceMono-Regular",
  },
  pillTextAlt: {
    fontSize: 11,
    color: "#111827",
    fontWeight: "700",
    fontFamily: "SpaceMono-Regular",
  },
  helperText: {
    fontSize: 12,
    color: "#374151",
    lineHeight: 18,
    marginTop: 4,
    fontFamily: "SpaceMono-Regular",
  },
  submitButton: {
    marginHorizontal: 20,
    marginTop: 48,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#4F46E5",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    flexDirection: "row",
    gap: 8,
  },
  submitButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "SpaceMono-Regular",
  },
});
