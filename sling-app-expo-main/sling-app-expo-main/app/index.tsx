import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewToken
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
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef<FlatList<OnboardingItem>>(null);
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  const viewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      setCurrentIndex(viewableItems[0]?.index ?? 0);
    }
  ).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollTo = () => {
    if (currentIndex < onboardingData.length - 1) {
      slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      router.replace("/(auth)/login" as any);
    }
  };

  useEffect(() => {
    if (!user) {
      return;
    } else if (user?.isKyc === false) {
      router.replace("/(auth)/kyc-onboarding" as any);
    } else {
      router.replace("/home" as any);
    }
  }, [user]);

  const renderItem = ({ item }: { item: OnboardingItem }) => {
    return (
      <View style={styles.slide}>
        <Image source={item.image} style={styles.image} resizeMode="contain" />
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: "#000" }]}>{item.title}</Text>
          {item.description.map((text: string, index: number) => (
            <Text key={index} style={[styles.description, { color: "#666" }]}>
              {text}
            </Text>
          ))}
        </View>
      </View>
    );
  };

  const Paginator = () => {
    return (
      <View style={styles.paginationContainer}>
        {onboardingData.map((_, index) => {
          const inputRange = [
            (index - 1) * width,
            index * width,
            (index + 1) * width,
          ];

          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [10, 20, 10],
            extrapolate: "clamp",
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: "clamp",
          });

          return (
            <Animated.View
              style={[
                styles.dot,
                {
                  width: dotWidth,
                  opacity,
                  backgroundColor: "#000",
                },
              ]}
              key={index}
            />
          );
        })}
      </View>
    );
  };

  return (
    <View style={[styles.container]}>
      <View style={styles.skipContainer}>
        <TouchableOpacity
          onPress={() => router.replace("/(auth)/login" as any)}
        >
          <Text style={[styles.skipText, { color: "#000" }]}>Skip</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={onboardingData}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          {
            useNativeDriver: false,
          }
        )}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        ref={slidesRef}
      />

      <Paginator />

      <TouchableOpacity style={styles.button} onPress={scrollTo}>
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
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  slide: {
    width,
    height,
    alignItems: "center",
    padding: 20,
  },
  image: {
    height: height * 0.5,
    width: width * 0.8,
    marginTop: height * 0.05,
  },
  textContainer: {
    alignItems: "center",
    marginTop: height * 0.02,
  },
  title: {
    fontWeight: "bold",
    fontSize: height * 0.025,
    marginBottom: height * 0.02,
  },
  description: {
    fontSize: height * 0.016,
    textAlign: "center",
    marginBottom: height * 0.01,
  },
  paginationContainer: {
    flexDirection: "row",
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  dot: {
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  button: {
    marginBottom: height * 0.05,
    marginTop: height * 0.05,
  },
  buttonImage: {
    height: height * 0.1,
    width: width * 0.8,
  },
  skipContainer: {
    position: "absolute",
    top: height * 0.05,
    right: width * 0.05,
    zIndex: 1,
  },
  skipText: {
    fontSize: height * 0.02,
    fontWeight: "bold",
  },
});

export default Onboarding;
