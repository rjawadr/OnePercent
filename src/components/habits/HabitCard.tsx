import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withSequence,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Typography, Spacing, Shadows } from '../../theme';
import { Habit } from '../../models/Habit';

// Map category strings to colours
const CATEGORY_COLORS: Record<string, string> = {
  personal: Colors.brand,
  physical: Colors.amber,
  zen:      Colors.purple,
  work:     '#4A6FA5',
  focus:    Colors.brand,
};

interface HabitCardProps {
  habit: Habit;
  completedToday: boolean;
  progressPercent: number;
  currentStreak: number;
  onPress: () => void;
  onLog: () => void;
  onLongPress?: () => void;
}

export function HabitCard({ 
  habit, 
  completedToday, 
  progressPercent, 
  currentStreak,
  onPress, 
  onLog,
  onLongPress 
}: HabitCardProps) {
  const scale = useSharedValue(1);
  const categoryKey = habit.category?.toLowerCase() as keyof typeof CATEGORY_COLORS;
  const categoryColor = CATEGORY_COLORS[categoryKey] ?? Colors.brand;
  const isMilestone = [7, 14, 30, 60, 90, 180, 365].includes(currentStreak);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSequence(
      withSpring(0.97, { damping: 15 }),
      withSpring(1, { damping: 15 })
    );
    onPress();
  };

  const handleLogPress = (e: any) => {
    e.stopPropagation();
    onLog();
  };

  // Format number properly
  const formatValue = (val: number, unit: string) => {
    const rounded = Number.isInteger(val) ? val : parseFloat(val.toFixed(1));
    return `${rounded} ${unit}`;
  };

  return (
    <Animated.View style={[styles.card, animatedStyle]}>
      <TouchableOpacity
        onPress={handlePress}
        onLongPress={onLongPress}
        activeOpacity={1}
        style={styles.touchable}
      >
        {/* Left accent bar */}
        <View style={[styles.accentBar, { backgroundColor: categoryColor }]} />

        {/* Icon box */}
        <View style={[styles.iconBox, { backgroundColor: categoryColor + '18' }]}>
          {habit.icon ? (
            <Text style={styles.emoji}>{habit.icon}</Text>
          ) : (
            <Icon name="star-four-points" size={22} color={categoryColor} />
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Top row: name + streak */}
          <View style={styles.topRow}>
            <Text style={styles.habitName} numberOfLines={1}>{habit.name}</Text>
            <View style={[styles.streakBadge, isMilestone && styles.streakBadgeMilestone]}>
              <Icon
                name={isMilestone ? 'star' : 'fire'}
                size={11}
                color={isMilestone ? Colors.gold : Colors.amber}
              />
              <Text style={[styles.streakText, isMilestone && styles.streakTextMilestone]}>
                {currentStreak}
              </Text>
            </View>
          </View>

          {/* Category label */}
          <Text style={styles.category}>{habit.category?.toUpperCase() || 'FOCUS'}</Text>

          {/* Goal row */}
          <View style={styles.goalRow}>
            <Text style={styles.goalLabel}>Today's Goal</Text>
            <Text style={[styles.goalValue, { color: categoryColor }]}>
              {formatValue(habit.current_target, habit.unit)}
            </Text>
          </View>

          {/* Progress bar */}
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: completedToday ? Colors.brand : categoryColor,
                  width: `${Math.min(progressPercent, 100)}%`,
                },
              ]}
            />
          </View>
        </View>

        {/* Right: completion button */}
        <TouchableOpacity
          onPress={handleLogPress}
          style={styles.actionButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Icon
            name={completedToday ? 'check-circle' : 'circle-outline'}
            size={32}
            color={completedToday ? Colors.brand : Colors.border}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.m,
    overflow: 'hidden',
    ...Shadows.card,
  },
  touchable: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.l,
    gap: Spacing.m,
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 24,
  },
  content: {
    flex: 1,
    gap: 3,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  habitName: {
    ...Typography.heading,
    color: Colors.textPrimary,
    flex: 1,
    marginRight: Spacing.s,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.amberLight,
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 3,
    gap: 3,
  },
  streakBadgeMilestone: {
    backgroundColor: Colors.goldLight,
  },
  streakText: {
    ...Typography.label,
    color: Colors.amber,
  },
  streakTextMilestone: {
    color: Colors.gold,
  },
  category: {
    ...Typography.micro,
    color: Colors.textTertiary,
    letterSpacing: 0.8,
    marginTop: 1,
  },
  goalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.s,
  },
  goalLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  goalValue: {
    ...Typography.body,
    fontWeight: '700',
  },
  progressTrack: {
    height: 4,
    backgroundColor: Colors.borderLight,
    borderRadius: 2,
    marginTop: Spacing.s,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  actionButton: {
    paddingLeft: Spacing.s,
  },
});
