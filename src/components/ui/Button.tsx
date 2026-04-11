import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ViewStyle, 
  TextStyle, 
  StyleProp,
  ActivityIndicator 
} from 'react-native';
import { Colors, BorderRadius, Spacing, Shadows, Typography } from '../../theme';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  interpolate, 
  runOnJS 
} from 'react-native-reanimated';


interface ButtonProps {
  onPress: () => void;
  title?: string;
  type?: 'primary' | 'secondary' | 'ghost';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  loading?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
}

export const Button = ({ 
  onPress, 
  title, 
  type = 'primary', 
  style, 
  textStyle,
  loading = false,
  disabled = false,
  children
}: ButtonProps) => {

  const getButtonStyle = () => {
    switch(type) {
      case 'secondary':
        return styles.secondary;
      case 'ghost':
        return styles.ghost;
      default:
        return styles.primary;
    }
  };

  const getTextStyle = () => {
    switch(type) {
      case 'ghost':
        return styles.ghostText;
      case 'secondary':
        return styles.secondaryText;
      default:
        return styles.primaryText;
    }
  };

  const pressed = useSharedValue(0);

  const tap = Gesture.Tap()
    .enabled(!disabled && !loading)
    .onBegin(() => {
      pressed.set(withTiming(1, { duration: 100 }));
    })
    .onFinalize(() => {
      pressed.set(withTiming(0, { duration: 150 }));
    })
    .onEnd(() => {
      if (onPress) runOnJS(onPress)();
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(pressed.get(), [0, 1], [1, 0.96]) }
    ],
    opacity: interpolate(pressed.get(), [0, 1], [1, 0.9])
  }));

  return (
    <GestureDetector gesture={tap}>
      <Animated.View 
        style={[styles.button, getButtonStyle(), style, (disabled || loading) && styles.disabled, animatedStyle]}
      >
        {loading ? (
          <ActivityIndicator color={type === 'ghost' ? Colors.brand : '#fff'} />
        ) : children ? (
          children
        ) : (
          <Text style={[styles.text, getTextStyle(), textStyle]}>{title}</Text>
        )}
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: Spacing.m,
    paddingHorizontal: Spacing.l,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  primary: {
    backgroundColor: Colors.brand,
    ...Shadows.elevated,
  },
  secondary: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.brand,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  text: {
    ...Typography.body,
    fontWeight: '700',
  },
  primaryText: {
    color: Colors.surface,
  },
  secondaryText: {
    color: Colors.brand,
  },
  ghostText: {
    color: Colors.brand,
  },
  disabled: {
    opacity: 0.5,
  },
});
