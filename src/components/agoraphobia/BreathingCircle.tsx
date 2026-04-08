import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
// import LottieView from 'lottie-react-native';
import { Colors } from '../../theme';
import { BreathPhase } from '../../engine/BreathEngine';

interface BreathingCircleProps {
  progress: number; // 0 to 1
  phase: BreathPhase;
}

export const BreathingCircle: React.FC<BreathingCircleProps> = ({ progress, phase }) => {
  const animatedProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Engine provides progress smoothly or incrementally. We just animate to the target to smooth out 100ms ticks.
    Animated.timing(animatedProgress, {
      toValue: progress,
      duration: 100, // Matches the engine tick rate for smooth interpolation
      useNativeDriver: false, // required if controlling Lottie progress, or if animating width/height instead of transform
    }).start();
  }, [progress, animatedProgress]);

  // Fallback: scale transform to simulate Lottie expand/contract 
  // Inhale 0->1: map to scale 1->2
  // Exhale 1->0: map to scale 2->1
  const scale = animatedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2],
  });

  return (
    <View style={styles.container}>
      {/* 
        To use Lottie when the JSON is available, uncomment:
        
        <LottieView
          source={require('../../assets/breathing.json')}
          progress={animatedProgress}
          style={styles.lottie}
        />
      */}
      
      {/* Fallback deterministic CSS circle to guarantee offline working behavior immediately */}
      <Animated.View 
        style={[
          styles.circle,
          {
            transform: [{ scale }],
            backgroundColor: phase === 'HOLD' ? Colors.brand : Colors.brandLight,
          }
        ]} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 300,
    width: '100%',
  },
  lottie: {
    width: 200,
    height: 200,
  },
  circle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.brandLight,
  }
});
