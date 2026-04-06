import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { ZoomIn, FadeIn } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Feather';
import { Colors, Typography, Spacing } from '../../theme';

interface MasteryBadgeProps {
  size?: 'small' | 'large';
  animated?: boolean;
  label?: string;
}

export const MasteryBadge = ({
  size = 'small',
  animated = true,
  label = 'MASTERED',
}: MasteryBadgeProps) => {
  const isLarge = size === 'large';

  const content = (
    <View style={[styles.badge, isLarge && styles.badgeLarge]}>
      <Icon
        name="check-circle"
        size={isLarge ? 20 : 12}
        color={Colors.brand}
      />
      <Text style={[styles.text, isLarge && styles.textLarge]}>{label}</Text>
    </View>
  );

  if (!animated) return content;

  return (
    <Animated.View entering={ZoomIn.delay(200).springify()}>
      {content}
    </Animated.View>
  );
};

export const MasteryOverlay = ({
  stepName,
  nextDifficulty,
  unit,
  onDismiss,
}: {
  stepName: string;
  nextDifficulty: number;
  unit: string;
  onDismiss: () => void;
}) => (
  <Animated.View entering={FadeIn.duration(400)} style={styles.overlay}>
    <Animated.View entering={ZoomIn.delay(200).springify()} style={styles.overlayCard}>
      <View style={styles.iconCircle}>
        <Icon name="award" size={40} color={Colors.brand} />
      </View>
      <Text style={styles.overlayTitle}>Step Mastered</Text>
      <Text style={styles.overlaySubtitle}>
        "{stepName}" — that is who you are becoming.
      </Text>
      <View style={styles.projectionCard}>
        <Text style={styles.projectionLabel}>Next session target</Text>
        <Text style={styles.projectionValue}>
          {nextDifficulty} {unit}
        </Text>
        <Text style={styles.projectionHint}>1% further than last time</Text>
      </View>
    </Animated.View>
  </Animated.View>
);

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.brand + '15',
    paddingVertical: 3,
    paddingHorizontal: Spacing.s,
    borderRadius: 20,
  },
  badgeLarge: {
    paddingVertical: Spacing.s,
    paddingHorizontal: Spacing.l,
    borderRadius: 24,
  },
  text: {
    ...Typography.micro,
    color: Colors.brand,
    fontWeight: '800',
  },
  textLarge: {
    fontSize: 13,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26, 28, 30, 0.9)',
    zIndex: 999,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  overlayCard: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: 32,
    padding: Spacing.xxl,
    alignItems: 'center',
    shadowColor: Colors.brand,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 40,
    elevation: 20,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.brandLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.l,
  },
  overlayTitle: {
    ...Typography.title,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  overlaySubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.s,
  },
  projectionCard: {
    width: '100%',
    backgroundColor: Colors.brandLight,
    borderRadius: 16,
    padding: Spacing.l,
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  projectionLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  projectionValue: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.brand,
    marginVertical: Spacing.xs,
  },
  projectionHint: {
    ...Typography.caption,
    color: Colors.textTertiary,
  },
});
