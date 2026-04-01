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

interface ButtonProps {
  onPress: () => void;
  title: string;
  type?: 'primary' | 'secondary' | 'ghost';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  loading?: boolean;
  disabled?: boolean;
}

export const Button = ({ 
  onPress, 
  title, 
  type = 'primary', 
  style, 
  textStyle,
  loading = false,
  disabled = false 
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

  return (
    <TouchableOpacity 
      onPress={onPress} 
      style={[styles.button, getButtonStyle(), style, (disabled || loading) && styles.disabled]}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={type === 'ghost' ? Colors.brand : '#fff'} />
      ) : (
        <Text style={[styles.text, getTextStyle(), textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
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
