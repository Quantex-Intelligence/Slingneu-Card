import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  Dimensions,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

const { width: screenWidth } = Dimensions.get("window");

export default function RechargeScreen() {
  const router = useRouter();

  const services = [
    { id: "mobile", name: "Mobile", icon: "cellphone", color: "#4CAF50" },
    { id: "dth", name: "DTH", icon: "television", color: "#2196F3" },
    { id: "electricity", name: "Electricity", icon: "lightning-bolt", color: "#FF9800" },
    { id: "fastag", name: "Fastag", icon: "car", color: "#FF5722" },
    { id: "gas", name: "Gas", icon: "fire", color: "#F44336" },
    { id: "landline", name: "Landline", icon: "phone", color: "#9C27B0" },
  ];

  const renderServiceButton = (service: any) => (
    <TouchableOpacity
      key={service.id}
      style={styles.serviceButton}
      onPress={() => router.push({ pathname: "/recharge-details", params: { service: service.id } })}
      activeOpacity={0.85}
    >
      <LinearGradient
        colors={[service.color, service.color + "CC"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.serviceButtonGradient}
      >
        <MaterialCommunityIcons
          name={service.icon as any}
          size={24}
          color={"#fff"}
        />
        <Text style={styles.serviceButtonText}>{service.name}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  const handleBack = () => {
    try {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace("/(tabs)/home" as any);
      }
    } catch (e) {
      router.replace("/(tabs)/home" as any);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#6c56f9"
        translucent={true}
      />
      {/* Header */}
      <LinearGradient
        colors={["#6c56f9", "#8b5cf6", "#a855f7"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Recharge & Bill Pay</Text>
          <TouchableOpacity
            style={styles.historyButton}
            onPress={() => router.push("/recharge-transactions")}
          >
            <Ionicons name="time-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
      <View style={styles.content}>
        {/* Service Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Service</Text>
          <View style={styles.servicesGrid}>
            {services.map(renderServiceButton)}
          </View>
        </View>
      </View>
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
    fontSize: 20,
    fontWeight: "bold",
  },
  historyButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 12,
  },
  servicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  serviceButton: {
    flex: 1,
    minWidth: (screenWidth - 60) / 3,
  },
  selectedServiceButton: {
    shadowColor: "#6c56f9",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  serviceButtonGradient: {
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceButtonText: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
  selectedServiceButtonText: {
    color: "#fff",
  },
  operatorsContainer: {
    flexDirection: "row",
    gap: 8,
  },
  operatorButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  selectedOperatorButton: {
    backgroundColor: "#6c56f9",
    borderColor: "#6c56f9",
  },
  operatorButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748b",
  },
  selectedOperatorButtonText: {
    color: "#fff",
  },
  circlesContainer: {
    flexDirection: "row",
    gap: 8,
  },
  circleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  selectedCircleButton: {
    backgroundColor: "#6c56f9",
    borderColor: "#6c56f9",
  },
  circleButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748b",
  },
  selectedCircleButtonText: {
    color: "#fff",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: "#1e293b",
  },
  amountsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  amountButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  selectedAmountButton: {
    backgroundColor: "#6c56f9",
    borderColor: "#6c56f9",
  },
  amountButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748b",
  },
  selectedAmountButtonText: {
    color: "#fff",
  },
  customAmountContainer: {
    marginTop: 8,
  },
  customAmountLabel: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 8,
  },
  rechargeButton: {
    marginTop: 8,
    marginBottom: 40,
    borderRadius: 16,
    shadowColor: "#6c56f9",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  disabledButton: {
    opacity: 0.6,
  },
  rechargeButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 16,
  },
  rechargeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
  },
}); 