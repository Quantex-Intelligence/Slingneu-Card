import Api from "@/config/Api";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";

const { width, height } = Dimensions.get("window");

interface CardManagementModalProps {
  visible: boolean;
  onClose: () => void;
  onOpenCardSecurity?: () => void;
}

interface TransactionType {
  id: string;
  name: string;
  icon: string;
  description: string;
}

interface LimitConfig {
  txnType: string;
  dailyLimitValue: string;
  dailyLimitCnt: string;
  maxAmount?: string;
}

const TRANSACTION_TYPES: TransactionType[] = [
  {
    id: "pos",
    name: "POS",
    icon: "credit-card",
    description: "Point of sale transactions",
  },
  {
    id: "ecom",
    name: "ECOM",
    icon: "shopping",
    description: "Online transactions",
  },
  {
    id: "contactless",
    name: "Contactless",
    icon: "contactless-payment",
    description: "Contactless transactions",
  },
];

export default function CardManagementModal({
  visible,
  onClose,
  onOpenCardSecurity,
}: CardManagementModalProps) {
  const { user, token } = useSelector((state: any) => state.auth);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);
  const [preferencesLoadedSuccess, setPreferencesLoadedSuccess] = useState(false);

  // Transaction type states
  const [transactionStates, setTransactionStates] = useState({
    atm: false,
    pos: true,
    ecom: false,
    contactless: false,
    international: false,
    dcc: false,
  });

  // Limit configuration states
  const [limitConfigs, setLimitConfigs] = useState<LimitConfig[]>([
    { txnType: "POS", dailyLimitValue: "500", dailyLimitCnt: "10" },
    { txnType: "ECOM", dailyLimitValue: "500", dailyLimitCnt: "10" },
    { txnType: "CONTACTLESS", dailyLimitValue: "500", dailyLimitCnt: "10" },
  ]);

  // Overall limit configuration
  const [overallLimitConfig, setOverallLimitConfig] = useState({
    dailyLimitValue: "10000",
    dailyLimitCnt: "20",
  });

  useEffect(() => {
    if (visible && !preferencesLoaded) {
      fetchCurrentPreferences();
    }
  }, [visible]);

  const fetchCurrentPreferences = async () => {
    try {
      setLoading(true);
      setPreferencesLoadedSuccess(false);
      const entityId = "TSCSLINGNEO" + user?.phone;

      console.log("Fetching current preferences for entityId:", entityId);

      const response = await Api.call(
        "/api/slingneo/preferences/fetch",
        "POST",
        { entityId },
        token
      );

      if (response.status === 200) {
        const preferences = response.data.result;

        // Update transaction states
        setTransactionStates({
          atm: preferences.atm || false,
          pos: true, // Always force POS to true as per requirements
          ecom: preferences.ecom || false,
          contactless: preferences.contactless || false,
          international: preferences.international || false,
          dcc: preferences.dcc || false,
        });

        // Update limit configurations - now handling as single object
        if (preferences.limitConfig && typeof preferences.limitConfig === 'object') {
          const updatedLimitConfigs = [...limitConfigs];

          const config = preferences.limitConfig;
          const index = updatedLimitConfigs.findIndex(c => c.txnType === config.txnType);
          if (index !== -1) {
            updatedLimitConfigs[index] = {
              ...updatedLimitConfigs[index],
              dailyLimitValue: config.dailyLimitValue?.toString() || "500",
              dailyLimitCnt: config.dailyLimitCnt?.toString() || "5",
              maxAmount: config.maxAmount?.toString() || "",
            };
          }

          setLimitConfigs(updatedLimitConfigs);
        }

        // Update overall limit configuration if available
        if (preferences.overallLimitConfig && typeof preferences.overallLimitConfig === 'object') {
          const overallConfig = preferences.overallLimitConfig;

          setOverallLimitConfig({
            dailyLimitValue: overallConfig.dailyLimitValue?.toString() || "10000",
            dailyLimitCnt: overallConfig.dailyLimitCnt?.toString() || "20",
          });
        }

        console.log("Preferences loaded successfully:", preferences);
        setPreferencesLoadedSuccess(true);
      } else {
        console.log("No preferences found or error occurred, using defaults");
      }

      setPreferencesLoaded(true);
    } catch (error) {
      console.error("Error fetching preferences:", error);
      Alert.alert(
        "Error",
        "Failed to load preferences. Using default settings.",
        [{ text: "OK" }]
      );
      setPreferencesLoaded(true); // Mark as loaded even on error to avoid infinite retries
    } finally {
      setLoading(false);
    }
  };

  const toggleTransactionType = (type: keyof typeof transactionStates) => {
    setTransactionStates((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const updateLimitConfig = (index: number, field: keyof LimitConfig, value: string) => {
    // Validate 10K limit for numeric fields
    if ((field === 'dailyLimitValue' || field === 'maxAmount') && value) {
      const numericValue = parseFloat(value);
      if (!isNaN(numericValue) && numericValue > 10000) {
        Alert.alert("Limit Exceeded", `${field === 'dailyLimitValue' ? 'limit' : 'Max amount per transaction'} cannot exceed ₹10,000.`);
        return;
      }
    }

    setLimitConfigs((prev) =>
      prev.map((config, i) =>
        i === index ? { ...config, [field]: value } : config
      )
    );
  };

  const updateOverallLimit = (field: keyof typeof overallLimitConfig, value: string) => {
    // Validate 10K limit for overall daily limit value
    if (field === 'dailyLimitValue' && value) {
      const numericValue = parseFloat(value);
      if (!isNaN(numericValue) && numericValue > 10000) {
        Alert.alert("Limit Exceeded", "Overall limit cannot exceed ₹10,000.");
        return;
      }
    }

    setOverallLimitConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Validate inputs
      const enabledTypes = Object.entries(transactionStates)
        .filter(([_, enabled]) => enabled)
        .map(([type]) => type.toUpperCase());

      if (enabledTypes.length === 0) {
        Alert.alert("Error", "Please enable at least one transaction type.");
        return;
      }

      // Validate limit configurations for enabled types
      for (const type of enabledTypes) {
        const config = limitConfigs.find(c => c.txnType === type);
        if (config) {
          if (!config.dailyLimitValue || !config.dailyLimitCnt) {
            Alert.alert("Error", `Please fill all limit fields for ${type} transactions.`);
            return;
          }

          // Validate 10K maximum limit for individual transaction types
          const dailyLimitValue = parseFloat(config.dailyLimitValue);
          if (dailyLimitValue > 10000) {
            Alert.alert("Error", `${type} limit cannot exceed ₹10,000.`);
            return;
          }

          // Validate max amount per transaction for ECOM
          if (config.txnType === "ECOM" && config.maxAmount) {
            const maxAmount = parseFloat(config.maxAmount);
            if (maxAmount > 10000) {
              Alert.alert("Error", "ECOM max amount per transaction cannot exceed ₹10,000.");
              return;
            }
          }
        }
      }

      // Validate overall limits
      if (!overallLimitConfig.dailyLimitValue || !overallLimitConfig.dailyLimitCnt) {
        Alert.alert("Error", "Please fill all overall limit fields.");
        return;
      }

      // Validate 10K maximum limit for overall daily limit
      const overallDailyLimit = parseFloat(overallLimitConfig.dailyLimitValue);
      if (overallDailyLimit > 10000) {
        Alert.alert("Error", "Overall limit cannot exceed ₹10,000.");
        return;
      }

      const entityId = "TSCSLINGNEO" + user?.phone;

      // Prepare the request body with transaction type preferences
      const requestBody: any = {
        entityId,
        ...transactionStates,
      };

      // Create limit configuration as single object (use first enabled type)
      const enabledConfig = limitConfigs.find(config =>
        enabledTypes.includes(config.txnType)
      );

      if (enabledConfig) {
        requestBody.limitConfig = {
          txnType: enabledConfig.txnType,
          dailyLimitValue: enabledConfig.dailyLimitValue,
          dailyLimitCnt: enabledConfig.dailyLimitCnt,
          ...(enabledConfig.maxAmount && { maxAmount: enabledConfig.maxAmount }),
        };
      }

      // Add overall limit configuration
      requestBody.overallLimitConfig = overallLimitConfig;

      console.log("Saving preferences:", requestBody);

      const response = await Api.call(
        "/api/slingneo/preferences/set-limit",
        "POST",
        requestBody,
        token
      );
      console.log(response.data);
      if (response.status === 200) {
        Alert.alert("Success", "Card preferences updated successfully!");
        onClose();
      } else {
        Alert.alert("Error", "Failed to update preferences. Please try again.");
      }
    } catch (error) {
      console.error("Error saving preferences:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const renderTransactionType = (type: TransactionType) => {
    const isEnabled = transactionStates[type.id as keyof typeof transactionStates];

    return (
      <LinearGradient
        key={type.id}
        colors={isEnabled ? ["#f0f9ff", "#e0f2fe"] : ["#f8fafc", "#f1f5f9"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.transactionTypeCard, !isEnabled && styles.disabledCard]}
      >
        <View style={styles.transactionTypeHeader}>
          <View style={styles.transactionTypeInfo}>
            <LinearGradient
              colors={isEnabled ? ["#6c56f9", "#8b5cf6"] : ["#9ca3af", "#6b7280"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.transactionIconContainer}
            >
              <MaterialCommunityIcons
                name={type.icon as any}
                size={20}
                color="#fff"
              />
            </LinearGradient>
            <View style={styles.transactionTypeDetails}>
              <Text style={[styles.transactionTypeName, !isEnabled && styles.disabledText]}>
                {type.name}
              </Text>
              <Text style={[styles.transactionTypeDescription, !isEnabled && styles.disabledText]}>
                {type.description}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.toggleSwitch, isEnabled && styles.toggleSwitchActive, type.id === "pos" && styles.disabledToggle]}
            onPress={() => type.id !== "pos" && toggleTransactionType(type.id as keyof typeof transactionStates)}
            disabled={type.id === "pos"}
          >
            <View style={[styles.toggleKnob, isEnabled && styles.toggleKnobActive]} />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  };

  const renderLimitConfig = (config: LimitConfig, index: number) => {
    const isEnabled = transactionStates[config.txnType.toLowerCase() as keyof typeof transactionStates];

    if (!isEnabled) return null;

    return (
      <View key={config.txnType} style={styles.limitConfigCard}>
        <Text style={styles.limitConfigTitle}>{config.txnType} Limits</Text>
        <View style={styles.limitConfigInputs}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Amount Limit (₹)</Text>
            <Text style={styles.inputHelperText}>Maximum: ₹10,000</Text>
            <TextInput
              style={styles.input}
              value={config.dailyLimitValue}
              onChangeText={(value: string) => updateLimitConfig(index, "dailyLimitValue", value)}
              keyboardType="numeric"
              placeholder="Enter amount"
            />
          </View>
          {/* <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Transaction Count</Text>
            <TextInput
              style={styles.input}
              value={config.dailyLimitCnt}
              onChangeText={(value: string) => updateLimitConfig(index, "dailyLimitCnt", value)}
              keyboardType="numeric"
              placeholder="Enter count"
            />
          </View> */}
          {config.txnType === "ECOM" && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Max Amount per Transaction (₹)</Text>
              <Text style={styles.inputHelperText}>Maximum: ₹10,000</Text>
              <TextInput
                style={styles.input}
                value={config.maxAmount || ""}
                onChangeText={(value: string) => updateLimitConfig(index, "maxAmount", value)}
                keyboardType="numeric"
                placeholder="Enter max amount"
              />
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <LinearGradient
          colors={["#6c56f9", "#8b5cf6", "#a855f7"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>Card Management</Text>
            </View>
            <TouchableOpacity
              onPress={fetchCurrentPreferences}
              disabled={loading}
              style={styles.refreshButton}
            >
              <Ionicons
                name="refresh"
                size={20}
                color={loading ? "#a78bfa" : "#fff"}
              />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <View style={styles.loadingContent}>
                <MaterialCommunityIcons
                  name="loading"
                  size={48}
                  color="#6c56f9"
                  style={styles.loadingIcon}
                />
                <Text style={styles.loadingText}>Loading preferences...</Text>
                <Text style={styles.loadingSubtext}>
                  Fetching your current card settings
                </Text>
              </View>
            </View>
          ) : (
            <>
              {/* Transaction Types Section */}
              <View style={styles.section}>
                {preferencesLoadedSuccess && (
                  <View style={styles.statusSection}>
                    <LinearGradient
                      colors={["#f0fdf4", "#dcfce7"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.statusCard}
                    >
                      <View style={styles.statusContent}>
                        <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                        <Text style={styles.statusText}>
                          Preferences loaded successfully
                        </Text>
                      </View>
                    </LinearGradient>
                  </View>
                )}

                <Text style={styles.sectionTitle}>Transaction Types</Text>
                <Text style={styles.sectionSubtitle}>
                  Enable or disable different types of transactions
                </Text>

                {TRANSACTION_TYPES.map(renderTransactionType)}
              </View>

              {/* Limit Configurations Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Limits</Text>
                <Text style={styles.sectionSubtitle}>
                  Set transaction limits for enabled features
                </Text>

                {limitConfigs.map(renderLimitConfig)}
              </View>

              {/* Overall Limits Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Overall Limits</Text>
                <Text style={styles.sectionSubtitle}>
                  Set overall limits across all transaction types
                </Text>

                <View style={styles.limitConfigCard}>
                  <View style={styles.limitConfigInputs}>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Total Amount Limit (₹)</Text>
                      <Text style={styles.inputHelperText}>Maximum: ₹10,000</Text>
                      <TextInput
                        style={styles.input}
                        value={overallLimitConfig.dailyLimitValue}
                        onChangeText={(value: string) => updateOverallLimit("dailyLimitValue", value)}
                        keyboardType="numeric"
                        placeholder="Enter amount"
                      />
                    </View>
                    {/* <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Total Transaction Count</Text>
                      <TextInput
                        style={styles.input}
                        value={overallLimitConfig.dailyLimitCnt}
                        onChangeText={(value: string) => updateOverallLimit("dailyLimitCnt", value)}
                        keyboardType="numeric"
                        placeholder="Enter count"
                      />
                    </View> */}
                  </View>
                </View>
              </View>


              {/* Save Button */}
              <View style={styles.saveButtonContainer}>
                <LinearGradient
                  colors={["#6c56f9", "#8b5cf6"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.saveButton}
                >
                  <TouchableOpacity
                    onPress={handleSave}
                    disabled={saving}
                    style={styles.saveButtonTouchable}
                  >
                    {saving ? (
                      <Text style={styles.saveButtonText}>Saving...</Text>
                    ) : (
                      <>
                        <MaterialCommunityIcons name="content-save" size={20} color="#fff" />
                        <Text style={styles.saveButtonText}>Save Preferences</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  closeButton: {
    padding: 8,
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  successIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },
  successText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  refreshButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 16,
    lineHeight: 20,
  },
  transactionTypeCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  disabledCard: {
    opacity: 0.6,
  },
  transactionTypeHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  transactionTypeInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  transactionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  transactionTypeDetails: {
    flex: 1,
  },
  transactionTypeName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 2,
  },
  transactionTypeDescription: {
    fontSize: 12,
    color: "#64748b",
  },
  disabledText: {
    color: "#9ca3af",
  },
  toggleSwitch: {
    width: 48,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#e2e8f0",
    padding: 2,
  },
  toggleSwitchActive: {
    backgroundColor: "#6c56f9",
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#fff",
  },
  toggleKnobActive: {
    transform: [{ translateX: 24 }],
  },
  disabledToggle: {
    opacity: 0.5,
  },
  limitConfigCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  limitConfigTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 12,
  },
  limitConfigInputs: {
    gap: 12,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  inputHelperText: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
    fontStyle: "italic",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  saveButtonContainer: {
    marginTop: 32,
    marginBottom: 40,
  },
  saveButton: {
    borderRadius: 12,
    shadowColor: "#6c56f9",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonTouchable: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  loadingContent: {
    alignItems: "center",
  },
  loadingIcon: {
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6c56f9",
  },
  loadingSubtext: {
    fontSize: 14,
    color: "#64748b",
  },
  securityCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  securityContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  securityInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  securityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  securityTextContainer: {
    flex: 1,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 2,
  },
  securityDescription: {
    fontSize: 12,
    color: "#64748b",
  },
  securityButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#fef2f2",
  },
  securityButtonText: {
    color: "#ef4444",
    fontSize: 16,
    fontWeight: "600",
  },
  statusSection: {
    marginBottom: 24,
  },
  statusCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statusContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginLeft: 8,
  },
}); 