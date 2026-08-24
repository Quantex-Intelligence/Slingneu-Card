import { Audio } from 'expo-av';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function KYCSubmitted() {
  const router = useRouter();
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  // Load and play success sound when component mounts
  useEffect(() => {
    const playSuccessSound = async () => {
      try {
        // Set audio mode for better compatibility
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: false,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });

        const { sound: audioSound } = await Audio.Sound.createAsync(
          require('../../assets/sounds/success.mp3'),
          { shouldPlay: true }
        );
        setSound(audioSound);
      } catch (error) {
        console.log('Error playing success sound:', error);
        // Don't throw error, just log it - audio is not critical
      }
    };

    playSuccessSound();

    // Cleanup sound on unmount
    return () => {
      if (sound) {
        sound.unloadAsync().catch(error => {
          console.log('Error unloading sound:', error);
        });
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.imageWrapper}>
          <Image
            source={require('../../assets/images/kyc/verificationdone.png')}
            style={styles.image}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.title}>KYC Submitted!</Text>
        <Text style={styles.subtitle}>
          Your KYC documents have been successfully completed.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.referralButton}
        onPress={() => router.push('/referral-code')}
      >
        <Text style={styles.referralButtonText}>Use Referral Code</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.nextButton}
        onPress={() => router.replace('/home')}
      >
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9ff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  imageWrapper: {
    backgroundColor: '#ede7ff',
    borderRadius: 100,
    padding: 32,
    marginBottom: 32,
    shadowColor: '#7b61ff',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  image: {
    width: width * 0.38,
    height: width * 0.38,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#7b61ff',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 8,
    lineHeight: 24,
  },
  referralButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#7b61ff',
    borderRadius: 20,
    height: 40,
    width: '60%',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  referralButtonText: {
    color: '#7b61ff',
    fontSize: 14,
    fontWeight: '500',
  },
  nextButton: {
    backgroundColor: '#7b61ff',
    borderRadius: 28,
    height: 56,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#7b61ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});
