import React from 'react';
import { Linking, StyleSheet, Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Feather';
import { Colors, Spacing, Typography } from '../../theme';
import { useUIStore } from '../../store/uiStore';

interface CrisisButtonProps {
  crisisNumber?: string | null;
  crisisName?: string | null;
  emergencyNumber?: string | null;
  emergencyName?: string | null;
}

export const CrisisButton: React.FC<CrisisButtonProps> = ({
  crisisNumber,
  crisisName,
  emergencyNumber,
  emergencyName,
}) => {
  const pulseStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withRepeat(
            withSequence(
              withTiming(1, { duration: 0 }),
              withTiming(1.08, { duration: 1500 })
            ),
            -1,
            true
          ),
        },
      ],
    };
  });

  const handlePress = () => {
    const showAlert = useUIStore.getState().showAlert;

    if (!crisisNumber && !emergencyNumber) {
      showAlert({
        title: 'Support Contacts',
        message: 'Set up your emergency contacts in Settings → Fear Profile.',
        type: 'warning'
      });
      return;
    }

    const buttons: any[] = [];

    if (crisisNumber) {
      buttons.push({
        text: `Call Crisis Line`,
        onPress: () => Linking.openURL(`tel:${crisisNumber}`),
      });
    }
    if (emergencyNumber) {
      buttons.push({
        text: `Call ${emergencyName || 'Emergency Contact'}`,
        onPress: () => Linking.openURL(`tel:${emergencyNumber}`),
      });
    }
    buttons.push({ text: "I'm safe, close", style: 'cancel' });

    showAlert({
      title: 'Need Support?',
      message: 'Your wellbeing matters. Choose an option below.',
      buttons,
      type: 'info'
    });
  };

  return (
    <Animated.View style={[styles.wrapper, pulseStyle]}>
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        accessibilityLabel="Get support or call crisis line"
        accessibilityRole="button"
      >
        <Icon name="phone-call" size={20} color={Colors.surface} />
      </Pressable>
    </Animated.View>
  );
};

export const CrisisBanner = ({ onPress }: { onPress: () => void }) => (
  <Pressable onPress={onPress} style={styles.banner}>
    <Icon name="heart" size={16} color={Colors.amber} />
    <Text style={styles.bannerText}>
      It sounds like this is intense. Your support contacts are here if you need them.
    </Text>
  </Pressable>
);

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 100, // Increased to stay above the new bottom tab bar
    right: 24,
    zIndex: 100,
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.brand + 'CC',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.brand,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.95 }],
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.s,
    backgroundColor: Colors.amberLight,
    paddingVertical: Spacing.m,
    paddingHorizontal: Spacing.l,
    borderRadius: 12,
    marginVertical: Spacing.s,
  },
  bannerText: {
    ...Typography.caption,
    color: Colors.amber,
    fontWeight: '600',
    flex: 1,
  },
});
