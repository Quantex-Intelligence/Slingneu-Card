import React from "react";
import { StyleSheet, Text, View } from "react-native";

const STEPS = {
  PERSONAL_INFO: 0,
  ADDRESS: 1,
  KYC_DETAILS: 2,
  COMMUNICATION: 3,
};

const STEP_LABELS = {
  [STEPS.PERSONAL_INFO]: "Personal Info",
  [STEPS.ADDRESS]: "Address",
  [STEPS.KYC_DETAILS]: "KYC",
  [STEPS.COMMUNICATION]: "Contact",
};

interface StepIndicatorProps {
  currentStep: number;
}

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <View style={styles.stepIndicator}>
      {Object.values(STEPS).map((step, index) => (
        <React.Fragment key={step}>
          <View style={styles.stepItem}>
            <View
              style={[
                styles.stepDot,
                currentStep >= step && styles.stepDotActive,
              ]}
            >
              <Text
                style={[
                  styles.stepNumber,
                  currentStep >= step && styles.stepNumberActive,
                ]}
              >
                {index + 1}
              </Text>
            </View>
            <Text
              style={[
                styles.stepLabel,
                currentStep >= step && styles.stepLabelActive,
              ]}
            >
              {STEP_LABELS[step]}
            </Text>
          </View>
          {index < Object.values(STEPS).length - 1 && (
            <View
              style={[
                styles.stepLine,
                currentStep > step && styles.stepLineActive,
              ]}
            />
          )}
        </React.Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  stepIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16, // reduced
    backgroundColor: "#FFFFFF",
    paddingVertical: 12, // reduced
    paddingHorizontal: 6, // reduced
    borderRadius: 16, // more compact
    shadowColor: "#7b61ff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 4,
  },
  stepItem: {
    alignItems: "center",
  },
  stepDot: {
    width: 22, // smaller
    height: 22,
    borderRadius: 11,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4, // reduced
  },
  stepDotActive: {
    backgroundColor: "#7b61ff",
    transform: [{ scale: 1.08 }],
  },
  stepNumber: {
    color: "#6B7280",
    fontWeight: "600",
    fontSize: 11, // smaller
  },
  stepNumberActive: {
    color: "#FFFFFF",
  },
  stepLabel: {
    fontSize: 9, // smaller
    color: "#6B7280",
    fontWeight: "500",
    textAlign: "center",
    marginTop: -2,
  },
  stepLabelActive: {
    color: "#7b61ff",
    fontWeight: "700",
  },
  stepLine: {
    flex: 1,
    height: 1.5, // thinner
    backgroundColor: "#F3F4F6",
    marginHorizontal: 4, // reduced
  },
  stepLineActive: {
    backgroundColor: "#7b61ff",
  },
}); 