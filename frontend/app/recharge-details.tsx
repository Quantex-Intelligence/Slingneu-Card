import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Api from "../config/Api";
import { useAppSelector } from "../store/hooks";

export default function RechargeDetailsScreen() {
  const router = useRouter();
  const { service } = useLocalSearchParams();
  const [number, setNumber] = useState("");
  const [operator, setOperator] = useState("");
  const [circle, setCircle] = useState("");
  const [operators, setOperators] = useState<any[]>([]);
  const [circles, setCircles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError("");
      try {
        const opRes = await Api.call(
          `/api/operators/operators/category/${service || "mobile"}`,
          "GET"
        );
        const circleRes = await Api.call("/api/operators/circle-codes", "GET");
        
        let loadedOperators = opRes?.data?.data || [];
        let loadedCircles = circleRes?.data?.data?.circleCodes || [];

        if (!loadedOperators.length) {
          loadedOperators = [
            { code: "JIO", name: "Jio Prepaid" },
            { code: "AIRTEL", name: "Airtel Prepaid" },
            { code: "VI", name: "Vodafone Idea (Vi)" },
            { code: "BSNL", name: "BSNL Prepaid" },
          ];
        }

        if (!loadedCircles.length) {
          loadedCircles = [
            { code: "DL", name: "Delhi & NCR" },
            { code: "MH", name: "Maharashtra & Goa" },
            { code: "KA", name: "Karnataka" },
            { code: "TN", name: "Tamil Nadu" },
            { code: "AP", name: "Andhra Pradesh & Telangana" },
            { code: "MH_MUM", name: "Mumbai" },
          ];
        }

        setOperators(loadedOperators);
        setCircles(loadedCircles);
        if (loadedOperators.length) setOperator(loadedOperators[0].code);
        if (loadedCircles.length) setCircle(loadedCircles[0].code);
      } catch (e) {
        console.log("Notice loading operators, using fallbacks:", e);
        const fallbackOps = [
          { code: "JIO", name: "Jio Prepaid" },
          { code: "AIRTEL", name: "Airtel Prepaid" },
          { code: "VI", name: "Vodafone Idea (Vi)" },
          { code: "BSNL", name: "BSNL Prepaid" },
        ];
        const fallbackCircles = [
          { code: "DL", name: "Delhi & NCR" },
          { code: "MH", name: "Maharashtra & Goa" },
          { code: "KA", name: "Karnataka" },
          { code: "TN", name: "Tamil Nadu" },
          { code: "AP", name: "Andhra Pradesh & Telangana" },
        ];
        setOperators(fallbackOps);
        setCircles(fallbackCircles);
        setOperator(fallbackOps[0].code);
        setCircle(fallbackCircles[0].code);
      }
      setLoading(false);
    }
    fetchData();
  }, [service]);

  useEffect(() => {
    if (user?.phone) setNumber(user.phone);
  }, [user]);

  const handleBack = () => {
    try {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace("/recharge" as any);
      }
    } catch (e) {
      router.replace("/recharge" as any);
    }
  };

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
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Enter Details</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>
      <View style={styles.content}>
        {loading ? (
          <Text>Loading...</Text>
        ) : error ? (
          <Text style={{ color: "red" }}>{error}</Text>
        ) : (
          <>
            {/* Number input */}
            <Text style={styles.sectionTitle}>Enter Number/ID</Text>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons
                name="cellphone"
                size={20}
                color="#6c56f9"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.textInput}
                placeholder="Enter number or customer ID"
                placeholderTextColor="#b6b6c9"
                keyboardType={Platform.OS === "ios" ? "number-pad" : "numeric"}
                value={number}
                onChangeText={setNumber}
                maxLength={15}
              />
            </View>

            {/* Operator dropdown */}
            <Text style={styles.sectionTitle}>Select Operator</Text>
            <View style={styles.pickerContainer}>
              <MaterialCommunityIcons
                name="cellphone-wireless"
                size={20}
                color="#6c56f9"
                style={styles.inputIcon}
              />
              <Picker
                selectedValue={operator}
                onValueChange={(value) => setOperator(value)}
                style={styles.picker}
              >
                <Picker.Item label="Select Operator" value="" />
                {operators.map((op) => (
                  <Picker.Item key={op.code} label={op.name} value={op.code} />
                ))}
              </Picker>
            </View>

            {/* Circle dropdown */}
            <Text style={styles.sectionTitle}>Select Circle</Text>
            <View style={styles.pickerContainer}>
              <MaterialCommunityIcons
                name="map-marker"
                size={20}
                color="#6c56f9"
                style={styles.inputIcon}
              />
              <Picker
                selectedValue={circle}
                onValueChange={(value) => setCircle(value)}
                style={styles.picker}
              >
                <Picker.Item label="Select Circle" value="" />
                {circles.map((c) => (
                  <Picker.Item key={c.code} label={c.name} value={c.code} />
                ))}
              </Picker>
            </View>

            <TouchableOpacity
              style={styles.nextButton}
              onPress={() => {
                const opObj = operators.find((op) => op.code === operator) || operators[0] || { code: "JIO", name: "Jio Prepaid" };
                const circleObj = circles.find((c) => c.code === circle) || circles[0] || { code: "DL", name: "Delhi & NCR" };
                router.push({
                  pathname: "/recharge-plan",
                  params: {
                    service: service || "mobile",
                    number: number || "9999999999",
                    operator: JSON.stringify(opObj),
                    circle: JSON.stringify(circleObj),
                  },
                });
              }}
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
          </>
        )}
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
    paddingBottom: 16,
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
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "SpaceMono-Regular",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
    fontFamily: "SpaceMono-Regular",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  pickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 12,
    minHeight: 48,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 13,
    color: "#1f2937",
    fontFamily: "SpaceMono-Regular",
  },
  picker: {
    flex: 1,
    color: "#1f2937",
    fontFamily: "SpaceMono-Regular",
    fontSize: 13,
  },
  nextButton: {
    marginTop: 16,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#6c56f9",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  nextButtonGradient: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    fontFamily: "SpaceMono-Regular",
  },
});
