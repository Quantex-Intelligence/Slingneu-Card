import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

interface CustomTabProps extends BottomTabBarProps {}

const CustomTabBar: React.FC<CustomTabProps> = ({ state, navigation }) => {
  return (
    <View style={styles.tabWrapper}>
      <LinearGradient
        colors={['#6c56f9', '#6c56f9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradientContainer}>
        <View style={styles.container}>
          <View style={styles.tabContainer}>
            {state.routes.map((route, index) => {
              const isFocused = state.index === index;
              const iconName = (() => {
                switch (route.name) {
                  case 'home':
                    return 'home-variant';
                  case 'card':
                    return 'credit-card';
                  case 'vouchers':
                    return 'ticket-percent';
                  case 'rewards':
                    return 'star';
                  case 'profile':
                    return 'account';
                  default:
                    return 'account';
                }
              })();

              const onPress = () => {
                if (!isFocused) {
                  navigation.navigate(route.name);
                }
              };

              return (
                <TouchableOpacity
                  onPress={onPress}
                  activeOpacity={0.7}
                  key={route.name}
                  style={styles.tabButton}>
                  <View style={styles.iconContainer}>
                    <MaterialCommunityIcons
                      name={iconName}
                      size={24}
                      color={isFocused ? '#fff' : 'rgba(255, 255, 255, 0.6)'}
                    />
                    <Text
                      style={[
                        styles.tabText,
                        isFocused ? styles.activeTabText : styles.inactiveTabText,
                      ]}>
                      {route.name === 'home'
                        ? 'Home'
                        : route.name === 'card'
                        ? 'Card'
                        : route.name === 'vouchers'
                        ? 'Campus'
                        : route.name === 'rewards'
                        ? 'Rewards'
                        : route.name === 'profile'
                        ? 'Profile'
                        : 'Profile'}
                    </Text>
                    {isFocused && <View style={styles.activeIndicator} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

export default CustomTabBar;

const styles = StyleSheet.create({
  tabWrapper: {
    position: Platform.OS === 'web' ? ('fixed' as any) : 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 85 : 75,
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  gradientContainer: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  container: {
    flex: 1,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  tabText: {
    fontSize: 12,
    fontFamily: 'DMSans-Medium',
    marginTop: 4,
  },
  activeTabText: {
    color: '#fff',
    fontWeight: '600',
  },
  inactiveTabText: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -8,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#fff',
  },
}); 