import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../theme';
import { format } from 'date-fns';
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';

interface TodayHeaderProps {
  completedCount: number;
  totalCount: number;
  onPressStats?: () => void;
  onPressAdd?: () => void;
}

const GREETINGS = {
  morning: ["Rise & Compound", "Seize the Morning", "Daybreak Discipline", "Start Small, Win Big"],
  afternoon: ["Steady Momentum", "Peak Performance", "Midday Mission", "1% Better Now"],
  evening: ["Refine & Reset", "Evening Excellence", "Final Push", "Wrap with Grace"],
  night: ["Prepare for Tomorrow", "Rest & Recharge", "Nightfall Focus", "The Unseen Work"]
};

function getProGreeting(): string {
  const hour = new Date().getHours();
  let pool = GREETINGS.morning;
  if (hour >= 12 && hour < 17) pool = GREETINGS.afternoon;
  else if (hour >= 17 && hour < 21) pool = GREETINGS.evening;
  else if (hour >= 21 || hour < 5) pool = GREETINGS.night;
  
  return pool[Math.floor(Math.random() * pool.length)];
}

export function TodayHeader({ completedCount, totalCount, onPressStats, onPressAdd }: TodayHeaderProps) {
  const today = new Date();
  const allDone = completedCount === totalCount && totalCount > 0;
  const greeting = useMemo(() => getProGreeting(), []);
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <Animated.View 
      entering={SlideInUp.duration(600)} 
      style={styles.container}
    >
      <View style={styles.headerTop}>
        <Text style={styles.dateLabel}>{format(today, 'EEEE, MMM d').toUpperCase()}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.textGroup}>
          <View style={styles.greetingRow}>
            <Text style={styles.greetingText}>{greeting}</Text>
            <View style={styles.dot} />
          </View>
        </View>

        <View style={styles.actionCluster}>
          <TouchableOpacity 
            onPress={onPressStats}
            activeOpacity={0.8}
            style={[
              styles.statPill,
              allDone && styles.statPillDone
            ]}
          >
            <View style={styles.iconCircle}>
               <Icon 
                 name={allDone ? "rocket-outline" : "trending-up"} 
                 size={16} 
                 color={allDone ? Colors.surface : Colors.brand} 
               />
            </View>
            <View style={styles.pillText}>
               <Text style={[styles.countText, allDone && styles.countTextDone]}>
                 {completedCount}/{totalCount}
               </Text>
               <Text style={[styles.percentLabel, allDone && styles.percentLabelDone]}>
                 {Math.round(progressPercent)}%
               </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={onPressAdd}
            activeOpacity={0.7}
            style={styles.headerAddBtn}
          >
            <Icon name="plus" size={24} color={Colors.surface} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Subtle progress line */}
      <View style={styles.progressRail}>
         <View 
           style={[
             styles.progressBar, 
             { width: `${progressPercent}%`, backgroundColor: allDone ? Colors.brand : Colors.brand + '80' }
           ]} 
         />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.l,
    paddingBottom: Spacing.m,
    backgroundColor: Colors.background,
  },
  headerTop: {
    marginBottom: Spacing.xs,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.m,
    gap: Spacing.m,
  },
  actionCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.s,
  },
  headerAddBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.soft,
  },
  textGroup: {
    flex: 1,
  },
  dateLabel: {
    ...Typography.micro,
    color: Colors.textTertiary,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 4,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  greetingText: {
    ...Typography.title,
    fontSize: 26,
    color: Colors.textPrimary,
    fontWeight: '900',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.brand,
    marginTop: 8,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.brandLight,
    paddingLeft: 6,
    paddingRight: 14,
    paddingVertical: 6,
    borderRadius: BorderRadius.xl,
    gap: 10,
    borderWidth: 1.5,
    borderColor: Colors.brand + '15',
    ...Shadows.soft,
  },
  statPillDone: {
    backgroundColor: Colors.brand,
    borderColor: Colors.brand,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.soft,
  },
  pillText: {
    alignItems: 'flex-start',
  },
  countText: {
    ...Typography.label,
    fontSize: 14,
    color: Colors.brand,
    fontWeight: '900',
  },
  countTextDone: {
    color: Colors.surface,
  },
  percentLabel: {
    ...Typography.micro,
    fontSize: 9,
    color: Colors.textSecondary,
    fontWeight: '700',
    marginTop: -2,
  },
  percentLabelDone: {
    color: Colors.surface + '90',
  },
  progressRail: {
    height: 4,
    backgroundColor: Colors.borderLight,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
});
