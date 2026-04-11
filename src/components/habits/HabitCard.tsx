import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Platform,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withSequence,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Typography, Spacing, Shadows, BorderRadius } from '../../theme';
import { Habit } from '../../models/Habit';
import {
  calculateNextTarget,
  formatValue as engineFormatValue,
  ImprovementFrequency,
} from '../../engine/onePercentEngine';

// Map category strings to professional, zero-red palette
const CATEGORY_COLORS: Record<string, string> = {
  personal: Colors.brandDark,
  physical: '#2563EB', // Blue for physical energy
  zen:      Colors.purple,
  work:     '#4F46E5', // Indigo for professional work
  focus:    Colors.brandDark,
};

interface HabitCardProps {
  habit: Habit;
  completedToday: boolean;
  progressPercent: number;
  currentStreak: number;
  valueAchieved: number;
  onPress: () => void;
  onLog: () => void;
  onLongPress?: () => void;
}

export function HabitCard({ 
  habit, 
  completedToday, 
  progressPercent, 
  currentStreak,
  valueAchieved,
  onPress, 
  onLog,
  onLongPress 
}: HabitCardProps) {
  const scale = useSharedValue(1);
  const categoryKey = habit.category?.toLowerCase() as keyof typeof CATEGORY_COLORS;
  const categoryColor = CATEGORY_COLORS[categoryKey] ?? Colors.brand;
  const isMilestone = [3, 7, 14, 30, 60, 90, 180, 365].includes(currentStreak);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSequence(
      withSpring(0.97, { damping: 12, stiffness: 100 }),
      withSpring(1, { damping: 12, stiffness: 100 })
    );
    onPress();
  };

  const handleLogPress = (e: any) => {
    e.stopPropagation();
    onLog();
  };

  const formatValue = (val: number, unit: string) => {
    return engineFormatValue(val, unit);
  };

  return (
    <Animated.View style={[styles.card, animatedStyle]}>
      <TouchableOpacity
        onPress={handlePress}
        onLongPress={onLongPress}
        activeOpacity={1}
        style={styles.touchable}
      >
        <View style={styles.topSection}>
          <View style={[styles.iconStage, { backgroundColor: (habit.color || Colors.brand) + '15' }]}>
             <Icon name={habit.icon || 'fire'} size={28} color={habit.color || Colors.brand} />
          </View>

          <View style={styles.mainInfo}>
            <View style={styles.titleRow}>
              <View style={styles.titleAndStreak}>
                <Text style={styles.habitName} numberOfLines={1}>{habit.name}</Text>
                <View style={[styles.streakBadge, isMilestone && styles.streakMilestone]}>
                  <Icon
                    name={isMilestone ? 'trophy' : 'fire'}
                    size={11}
                    color={isMilestone ? Colors.gold : Colors.amber}
                  />
                  <Text style={[styles.streakText, isMilestone && styles.streakTextMilestone]}>
                    {currentStreak}
                  </Text>
                </View>
              </View>

              {!completedToday && (
                <TouchableOpacity
                  onPress={handleLogPress}
                  style={styles.quickTrackBtn}
                  activeOpacity={0.7}
                >
                  <Icon name="plus" size={22} color={Colors.surface} />
                </TouchableOpacity>
              )}
            </View>
            
            <View style={styles.metaRow}>
               <View style={[styles.typeBadge, { backgroundColor: categoryColor + '12' }]}>
                  <Text style={[styles.typeText, { color: categoryColor }]}>{habit.category || 'Focus'}</Text>
               </View>
               <View style={styles.dot} />
               <Text style={styles.targetStatus}>
                 TARGET: {formatValue(habit.current_target, habit.unit || '')}
               </Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.progressSection}>
            {/* Progress Bar with subtle sub-track */}
            <View style={styles.track}>
              <View
                style={[
                  styles.fill,
                  {
                    backgroundColor: completedToday ? Colors.brand : categoryColor,
                    width: `${Math.min(progressPercent, 100)}%`,
                  },
                ]}
              />
            </View>

            {/* Clear Progress Meta */}
            <View style={styles.progressMeta}>
               <View style={styles.progressDetails}>
                  <Text style={styles.progressValueLabel}>
                    {completedToday 
                      ? `${engineFormatValue(valueAchieved, habit.unit)} LOGGED`
                      : valueAchieved > 0
                        ? `${engineFormatValue(valueAchieved, habit.unit)} of ${engineFormatValue(habit.current_target, habit.unit)}`
                        : 'READY TO START'}
                  </Text>
                  {completedToday && (
                    <View style={styles.successBadge}>
                       <Icon name="check-decagram" size={14} color={Colors.brand} />
                       <Text style={styles.successBadgeText}>TARGET HIT</Text>
                    </View>
                  )}
               </View>
               <Text style={styles.percentText}>{Math.round(progressPercent)}%</Text>
            </View>

            {/* Premium Tomorrow's Goal Projection */}
            {completedToday && (
              <View style={styles.tomorrowProjection}>
                <View style={[styles.projectionIconStage, { backgroundColor: Colors.brand + '15' }]}>
                  <Icon name="trending-up" size={18} color={Colors.brand} />
                </View>
                <View style={styles.projectionInfo}>
                  <Text style={styles.projectionLabel}>NEXT DAY TARGET</Text>
                  <Text style={styles.projectionValue}>
                    {engineFormatValue(
                      calculateNextTarget(
                        habit.current_target,
                        (habit.improvement_frequency ?? 'daily') as ImprovementFrequency,
                        habit.unit
                      ),
                      habit.unit
                    )}
                  </Text>
                </View>
                <View style={styles.growthIncentive}>
                  <Text style={styles.growthText}>+1%</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {completedToday && (
          <View 
            style={styles.completionOverlay} 
            pointerEvents="none" 
          />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xxl,
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.l,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    ...Platform.select({
      ios: Shadows.soft,
      android: { elevation: 3 }
    }),
    overflow: 'hidden',
  },
  touchable: {
    padding: Spacing.l,
    gap: Spacing.l,
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.m,
  },
  iconStage: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconInner: {
    position: 'absolute',
    inset: 4,
    borderRadius: BorderRadius.l,
    borderWidth: 1.5,
  },
  emoji: {
    fontSize: 28,
  },
  mainInfo: {
    flex: 1,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleAndStreak: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  habitName: {
    ...Typography.heading,
    fontSize: 19,
    color: Colors.textPrimary,
    fontWeight: '900',
    maxWidth: '70%',
  },
  quickTrackBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.soft,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: Colors.amberLight + '40',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.amber + '15',
  },
  streakMilestone: {
    backgroundColor: Colors.goldLight,
    borderColor: Colors.gold + '30',
  },
  streakText: {
    ...Typography.micro,
    fontSize: 11,
    fontWeight: '900',
    color: Colors.amber,
  },
  streakTextMilestone: {
    color: Colors.gold,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  typeText: {
    ...Typography.micro,
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.border,
  },
  targetStatus: {
    ...Typography.micro,
    color: Colors.textSecondary,
    fontWeight: '800',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.l,
  },
  progressSection: {
    flex: 1,
    gap: 8,
  },
  track: {
    height: 8,
    backgroundColor: Colors.background,
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
  progressMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressValueLabel: {
    ...Typography.micro,
    fontSize: 11,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
  percentText: {
    ...Typography.micro,
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textSecondary,
  },
  successBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.brandLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  successBadgeText: {
    ...Typography.micro,
    fontSize: 8,
    fontWeight: '900',
    color: Colors.brandDark,
  },
  tomorrowProjection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: BorderRadius.xl,
    marginTop: 4, // Tighten gap after progress meta
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: 12,
  },
  projectionIconStage: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  projectionInfo: {
    flex: 1,
    gap: 2,
  },
  projectionLabel: {
    ...Typography.micro,
    fontSize: 8,
    fontWeight: '800',
    color: Colors.textSecondary,
    letterSpacing: 1,
  },
  projectionValue: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  growthIncentive: {
    backgroundColor: Colors.brandLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  growthText: {
    ...Typography.micro,
    fontSize: 10,
    fontWeight: '900',
    color: Colors.brand,
  },
  completionOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    zIndex: 1,
    pointerEvents: 'none',
  },
});
