import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withRepeat, 
  withDelay,
  Easing 
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const PARTICLE_COUNT = 30;
const COLORS = ['#00D1B2', '#D4AF37', '#00A38B', '#FFB800']; // Teal and Gold variants

const Particle = ({ index }: { index: number }) => {
  const translateY = useSharedValue(-20);
  const translateX = useSharedValue(Math.random() * SCREEN_WIDTH);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    const duration = 2500 + Math.random() * 2000;
    const delay = Math.random() * 2000;

    translateY.value = withDelay(
      delay,
      withRepeat(
        withTiming(SCREEN_HEIGHT + 20, { 
          duration, 
          easing: Easing.linear 
        }),
        -1,
        false
      )
    );

    rotate.value = withDelay(
      delay,
      withRepeat(
        withTiming(360, { 
          duration: duration * 0.8, 
          easing: Easing.linear 
        }),
        -1,
        false
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  const size = 6 + Math.random() * 6;
  const color = COLORS[index % COLORS.length];

  return (
    <Animated.View 
      style={[
        styles.particle, 
        animatedStyle, 
        { 
          backgroundColor: color, 
          width: size, 
          height: size,
          borderRadius: index % 2 === 0 ? 0 : size / 2, // Mix of squares and circles
        }
      ]} 
    />
  );
};

export const Confetti = () => {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {Array.from({ length: PARTICLE_COUNT }).map((_, i) => (
        <Particle key={i} index={i} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  particle: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});
