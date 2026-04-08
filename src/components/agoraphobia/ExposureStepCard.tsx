import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { Colors, Typography, Spacing, Shadows } from '../../theme';
import { ExposureStep } from '../../models/ExposureStep';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming, withDelay } from 'react-native-reanimated';

interface ExposureStepCardProps {
  step: ExposureStep;
  sessionCount: number;
  isLocked: boolean;
  isCurrent: boolean;
  isHighlighted?: boolean;
  onPress: () => void;
  onEdit?: () => void;
}

export const ExposureStepCard = React.memo(({
  step,
  sessionCount,
  isLocked,
  isCurrent,
  isHighlighted,
  onPress,
  onEdit,
}: ExposureStepCardProps) => {
  const masteryProgress = Math.min(step.mastery_count / 2, 1);
  const difficultyLabel = `${step.difficulty_value} ${step.difficulty_unit}`;

  const highlightAnim = useSharedValue(isHighlighted ? 1 : 0);

  React.useEffect(() => {
    if (isHighlighted) {
      highlightAnim.value = withSequence(
        withTiming(1, { duration: 0 }),
        withDelay(2000, withTiming(0, { duration: 1500 }))
      );
    } else {
      highlightAnim.value = 0;
    }
  }, [isHighlighted, highlightAnim]);

  const highlightStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: Colors.brandLight,
      opacity: highlightAnim.value,
    };
  });

  if (isLocked) {
    return (
      <View style={[styles.card, styles.cardLocked]}>
        <View style={styles.lockedRow}>
          <View style={styles.lockIcon}>
            <Icon name="lock" size={16} color={Colors.textTertiary} />
          </View>
          <View style={styles.content}>
            <Text style={styles.lockedName}>{step.name}</Text>
            <Text style={styles.lockedHint}>Complete previous step ×2 to unlock</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onEdit}
      style={({ pressed }) => [
        styles.card,
        step.is_mastered && styles.cardMastered,
        isCurrent && styles.cardCurrent,
        pressed && styles.cardPressed,
        isHighlighted && styles.cardHighlighted,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Exposure step: ${step.name}`}
    >
      <View style={styles.headerRow}>
        <View style={styles.positionBadge}>
          <Text style={styles.positionText}>{step.ladder_position + 1}</Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.stepName} numberOfLines={1}>{step.name}</Text>
          {step.description ? (
            <Text style={styles.description} numberOfLines={2}>{step.description}</Text>
          ) : null}
        </View>
        {step.is_mastered ? (
          <View style={styles.masteredBadge}>
            <Icon name="check" size={14} color={Colors.surface} />
          </View>
        ) : (
          <Icon name="chevron-right" size={20} color={Colors.textTertiary} />
        )}
      </View>

      {/* Metrics row */}
      <View style={styles.metricsRow}>
        <View style={styles.metric}>
          <Icon name="target" size={12} color={Colors.textTertiary} />
          <Text style={styles.metricText}>{difficultyLabel}</Text>
        </View>
        <View style={styles.metric}>
          <Icon name="activity" size={12} color={Colors.textTertiary} />
          <Text style={styles.metricText}>SUDS ~{step.initial_suds_estimate}</Text>
        </View>
        <View style={styles.metric}>
          <Icon name="zap" size={12} color={Colors.textTertiary} />
          <Text style={styles.metricText}>{sessionCount} sessions</Text>
        </View>
      </View>

      {/* Mastery progress bar */}
      {!step.is_mastered && (
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${masteryProgress * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.progressLabel}>
            {step.mastery_count}/2 mastered
          </Text>
        </View>
      )}

      {/* Location hint */}
      {step.location_hint ? (
        <View style={styles.locationRow}>
          <Icon name="map-pin" size={11} color={Colors.textTertiary} />
          <Text style={styles.locationText}>{step.location_hint}</Text>
        </View>
      ) : null}

      {/* Highlight Overlay */}
      <Animated.View style={[StyleSheet.absoluteFill, styles.highlightOverlay, highlightStyle]} pointerEvents="none" />
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.l,
    marginBottom: Spacing.m,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.soft,
  },
  cardLocked: {
    opacity: 0.5,
    backgroundColor: Colors.background,
  },
  cardMastered: {
    borderColor: Colors.brand + '40',
    backgroundColor: Colors.brandLight,
  },
  cardCurrent: {
    borderColor: Colors.brand,
    borderWidth: 2,
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  cardHighlighted: {
    borderColor: Colors.brand,
  },
  highlightOverlay: {
    borderRadius: 16,
  },
  lockedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.m,
  },
  lockIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  lockedName: {
    ...Typography.label,
    color: Colors.textTertiary,
  },
  lockedHint: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.m,
  },
  positionBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.brand + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  positionText: {
    ...Typography.label,
    color: Colors.brand,
    fontWeight: '800',
  },
  stepName: {
    ...Typography.label,
    color: Colors.textPrimary,
    fontSize: 15,
  },
  description: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  masteredBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: Spacing.l,
    marginTop: Spacing.m,
    paddingTop: Spacing.m,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  metric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.s,
    marginTop: Spacing.m,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.brand,
    borderRadius: 2,
  },
  progressLabel: {
    ...Typography.micro,
    color: Colors.textTertiary,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.s,
  },
  locationText: {
    ...Typography.caption,
    color: Colors.textTertiary,
    fontSize: 11,
  },
});
