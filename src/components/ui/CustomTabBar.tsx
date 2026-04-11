import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Dimensions } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from '@react-native-community/blur';
import LottieView from 'lottie-react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import { Colors, Typography, Spacing, Shadows } from '../../theme';

const { width } = Dimensions.get('window');
const TAB_WIDTH = width / 5;

export const CustomTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();
  const activeIndex = state.index;
  const translateX = useSharedValue(activeIndex * TAB_WIDTH);

  useEffect(() => {
    translateX.value = withSpring(activeIndex * TAB_WIDTH, {
      damping: 20,
      stiffness: 150,
    });
  }, [activeIndex]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      {Platform.OS === 'ios' ? (
        <BlurView
          style={StyleSheet.absoluteFill}
          blurType="light"
          blurAmount={20}
          reducedTransparencyFallbackColor="white"
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255, 255, 255, 0.92)' }]} />
      )}
      
      <View style={styles.topBorder} />

      <View style={styles.content}>
        {/* Active Indicator Pill */}
        <Animated.View style={[styles.activePill, indicatorStyle]} />

        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          let iconName = 'home-variant';

          // Assign icons based on route name with fallback-safe names
          if (route.name === 'Today') {
            iconName = isFocused ? 'calendar-check' : 'calendar-check-outline';
          } else if (route.name === 'Stats') {
            iconName = isFocused ? 'chart-box' : 'chart-box-outline';
          } else if (route.name === 'Therapy') {
            // Replaced 'leaf' with 'sprout' to resolve potential '?' issues
            iconName = isFocused ? 'sprout' : 'sprout-outline';
          } else if (route.name === 'Techniques') {
            iconName = isFocused ? 'meditation' : 'meditation';
          } else if (route.name === 'Settings') {
            iconName = isFocused ? 'cog' : 'cog-outline';
          }

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={styles.tabItem}
              activeOpacity={0.7}
            >
              <AnimatedIcon
                isFocused={isFocused}
                name={iconName}
                color={isFocused ? Colors.brand : Colors.textTertiary}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

// Sub-component for animated icons to handle scaling
const AnimatedIcon = ({ isFocused, name, color }: { isFocused: boolean; name: string; color: string }) => {
  const scale = useSharedValue(isFocused ? 1.2 : 1);
  
  useEffect(() => {
    scale.value = withSpring(isFocused ? 1.2 : 1, {
      damping: 12,
      stiffness: 120,
    });
  }, [isFocused]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: withSpring(isFocused ? 1 : 0.7),
  }));

  return (
    <Animated.View style={[styles.iconWrapper, animatedStyle]}>
      <Icon name={name} size={26} color={color} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    elevation: 8,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    ...Shadows.elevated,
  },
  topBorder: {
    height: 1,
    backgroundColor: Colors.borderLight,
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    height: 64,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: TAB_WIDTH,
    height: '100%',
  },
  iconWrapper: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activePill: {
    position: 'absolute',
    top: 10,
    left: 8,
    width: TAB_WIDTH - 16,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.brand + '15', // Ultra-subtle brand tint
    borderWidth: 1,
    borderColor: Colors.brand + '30',
  },
  lottieIndicator: {
    display: 'none',
  },
  label: {
    display: 'none',
  },
  labelActive: {
    display: 'none',
  },
});
