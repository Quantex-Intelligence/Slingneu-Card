import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";

const { width, height } = Dimensions.get("window");

interface OnboardingItem {
  id: string;
  image: any;
  title: string;
  description: string[];
}

const onboardingData: OnboardingItem[] = [
  {
    id: "1",
    image: require("../assets/images/onboarding/onbonding3.jpeg"),
    title: "Welcome to Slingneo Campus",
    description: [
      "Your all-in-one card for a smarter, simpler campus life.",
      "Pay for food, access facilities, and manage your money easily.",
    ],
  },
  {
    id: "2",
    image: require("../assets/images/onboarding/onbonding1.jpeg"),
    title: "Exclusive Student Offers!",
    description: [
      "Unlock amazing discounts at campus eateries, bookstores, and more",
      "with your Slingneo card!",
    ],
  },
  {
    id: "3",
    image: require("../assets/images/onboarding/onbonding2.jpeg"),
    title: "Secure and Convenient",
    description: [
      "Your campus card is protected with industry-leading security features.",
    ],
  },
];

const Onboarding = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (user) {
      router.replace("/home" as any);
    }
  }, [user]);

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      router.replace("/login" as any);
    }
  };

  const handleSkip = () => {
    router.replace("/login" as any);
  };

  const currentItem = onboardingData[currentIndex];

  return (
    <View style={styles.container}>
      <View style={styles.skipContainer}>
        <TouchableOpacity onPress={handleSkip} activeOpacity={0.7}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.slide}>
        <Image
          source={currentItem.image}
          style={styles.image}
          resizeMode="contain"
        />
        <View style={styles.textContainer}>
          <Text style={styles.title}>{currentItem.title}</Text>
          {currentItem.description.map((text: string, index: number) => (
            <Text key={index} style={styles.description}>
              {text}
            </Text>
          ))}
        </View>
      </View>

      <View style={styles.paginationContainer}>
        {onboardingData.map((_, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => setCurrentIndex(index)}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.dot,
                {
                  width: currentIndex === index ? 24 : 10,
                  backgroundColor: currentIndex === index ? "#6c56f9" : "#D1D5DB",
                },
              ]}
            />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleNext}
        activeOpacity={0.8}
      >
        <Image
          source={
            currentIndex === 0
              ? require("../assets/images/onboarding/onbonding1button.png")
              : currentIndex === 1
              ? require("../assets/images/onboarding/onbonding2button.png")
              : require("../assets/images/onboarding/onbonding3button.png")
          }
          style={styles.buttonImage}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    paddingVertical: 20,
  },
  skipContainer: {
    alignSelf: "flex-end",
    paddingRight: 24,
    paddingTop: 16,
    zIndex: 9999,
    elevation: 10,
  },
  skipText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000000",
  },
  slide: {
    width: "100%",
    maxWidth: 500,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    flex: 1,
  },
  image: {
    height: 280,
    width: "100%",
    maxWidth: 320,
    marginBottom: 24,
  },
  textContainer: {
    alignItems: "center",
    paddingHorizontal: 16,
  },
  title: {
    fontWeight: "bold",
    fontSize: 22,
    color: "#111827",
    marginBottom: 12,
    textAlign: "center",
    fontFamily: "SpaceMono-Regular",
  },
  description: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 6,
    fontFamily: "SpaceMono-Regular",
  },
  paginationContainer: {
    flexDirection: "row",
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 12,
  },
  dot: {
    height: 10,
    borderRadius: 5,
    marginHorizontal: 4,
  },
  button: {
    marginBottom: 20,
    marginTop: 10,
    zIndex: 9999,
    elevation: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonImage: {
    height: 80,
    width: 280,
  },
});

export default Onboarding;
