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
    const rounded = Number.isInteger(val) ? val : parseFloat(val.toFixed(1));
    return `${rounded}${unit}`;
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
          <View style={[styles.iconStage, { backgroundColor: categoryColor + '10' }]}>
            <View style={[styles.iconInner, { borderColor: categoryColor + '20' }]} />
            {habit.icon ? (
              <Text style={styles.emoji}>{habit.icon}</Text>
            ) : (
              <Icon name="lightning-bolt" size={26} color={categoryColor} />
            )}
          </View>

          <View style={styles.mainInfo}>
            <View style={styles.titleRow}>
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
            <View style={styles.progressMeta}>
               <Text style={styles.progressLabel}>
                 {completedToday ? 'CAPACITY REACHED' : `${Math.round(progressPercent)}% OF DAILY COMPOUND`}
               </Text>
               {completedToday && (
                 <View style={styles.successMarker}>
                    <Icon name="check-decagram" size={14} color={Colors.brand} />
                 </View>
               )}
            </View>
          </View>

          {!completedToday && (
            <TouchableOpacity
              onPress={handleLogPress}
              style={styles.actionBtn}
              activeOpacity={0.8}
            >
              <View style={styles.actionIconBox}>
                 <Icon name="plus" size={20} color={Colors.brandDark} />
              </View>
              <Text style={styles.actionLabel}>TRACK</Text>
            </TouchableOpacity>
          )}
        </View>

        {completedToday && <View style={styles.completionOverlay} />}
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
  habitName: {
    ...Typography.heading,
    fontSize: 19,
    color: Colors.textPrimary,
    fontWeight: '900',
    flex: 1,
    marginRight: 8,
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
  progressLabel: {
    ...Typography.micro,
    fontSize: 9,
    fontWeight: '900',
    color: Colors.textSecondary,
    letterSpacing: 0.8,
  },
  successMarker: {
    backgroundColor: Colors.brand + '15',
    padding: 2,
    borderRadius: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.brandLight,
    paddingLeft: 4,
    paddingRight: 14,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1.5,
    borderColor: Colors.brand + '15',
  },
  actionIconBox: {
     width: 28,
     height: 28,
     borderRadius: 8,
     backgroundColor: Colors.surface,
     alignItems: 'center',
     justifyContent: 'center',
     ...Shadows.soft,
  },
  actionLabel: {
    ...Typography.micro,
    fontSize: 10,
    fontWeight: '900',
    color: Colors.brandDark,
    letterSpacing: 1,
  },
  completionOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    zIndex: 1,
    pointerEvents: 'none',
  },
});
