import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, router } from "expo-router";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

export default function Terms() {
  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      
      <LinearGradient
        colors={["#667eea", "#764ba2"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      >
        <View style={styles.patternOverlay} />
      </LinearGradient>

      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={16} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Terms and Conditions</Text>
          <Text style={styles.lastUpdated}>Last updated: December 2024</Text>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
            <Text style={styles.sectionText}>
              By accessing and using the SLING mobile application, you accept and agree to be bound by the terms and provision of this agreement.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Use License</Text>
            <Text style={styles.sectionText}>
              Permission is granted to temporarily download one copy of the SLING app for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. Disclaimer</Text>
            <Text style={styles.sectionText}>
              The materials on SLING's mobile application are provided on an 'as is' basis. SLING makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. Limitations</Text>
            <Text style={styles.sectionText}>
              In no event shall SLING or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on SLING's mobile application.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. Accuracy of Materials</Text>
            <Text style={styles.sectionText}>
              The materials appearing on SLING's mobile application could include technical, typographical, or photographic errors. SLING does not warrant that any of the materials on its mobile application are accurate, complete or current.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>6. Links</Text>
            <Text style={styles.sectionText}>
              SLING has not reviewed all of the sites linked to its mobile application and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by SLING of the site.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>7. Modifications</Text>
            <Text style={styles.sectionText}>
              SLING may revise these terms of service for its mobile application at any time without notice. By using this mobile application you are agreeing to be bound by the then current version of these Terms and Conditions of Use.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>8. Governing Law</Text>
            <Text style={styles.sectionText}>
              These terms and conditions are governed by and construed in accordance with the laws and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
            </Text>
          </View>

          <View style={styles.contactSection}>
            <Text style={styles.contactTitle}>Contact Us</Text>
            <Text style={styles.contactText}>
              If you have any questions about these Terms and Conditions, please contact us at:
            </Text>
            <Text style={styles.contactEmail}>support@sling.com</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: height,
  },
  patternOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    opacity: 0.1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 44,
    paddingBottom: 12,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: "SpaceMono-Regular",
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: 14,
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1F36",
    marginBottom: 6,
    textAlign: "center",
    fontFamily: "SpaceMono-Regular",
  },
  lastUpdated: {
    fontSize: 10,
    color: "#8A8D9F",
    textAlign: "center",
    marginBottom: 18,
    fontFamily: "SpaceMono-Regular",
  },
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1A1F36",
    marginBottom: 6,
    fontFamily: "SpaceMono-Regular",
  },
  sectionText: {
    fontSize: 12,
    color: "#4A5568",
    lineHeight: 18,
    fontFamily: "SpaceMono-Regular",
  },
  contactSection: {
    marginTop: 18,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  contactTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1F36",
    marginBottom: 8,
    fontFamily: "SpaceMono-Regular",
  },
  contactText: {
    fontSize: 12,
    color: "#4A5568",
    lineHeight: 18,
    marginBottom: 4,
    fontFamily: "SpaceMono-Regular",
  },
  contactEmail: {
    fontSize: 12,
    color: "#667eea",
    fontWeight: "600",
    fontFamily: "SpaceMono-Regular",
  },
}); 