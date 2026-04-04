import React from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Typography, Spacing, Shadows, BorderRadius } from '../../theme';

const { width } = Dimensions.get('window');
const GRID_SPACING = Spacing.m;
const CARD_WIDTH = (width - Spacing.xl * 2 - GRID_SPACING) / 2;

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  color: string;
  subtitle?: string;
}

const StatCard = ({ label, value, icon, color, subtitle }: StatCardProps) => {
  const scale = React.useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
      tension: 100,
      friction: 10,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 10,
    }).start();
  };

  return (
    <Pressable onPressIn={onPressIn} onPressOut={onPressOut}>
      <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, { backgroundColor: color + '12' }]}>
            <Icon name={icon} size={22} color={color} />
          </View>
          <Text style={[styles.value, { color }]}>{value}</Text>
        </View>
        <View style={styles.cardFooter}>
           <Text style={styles.label}>{label}</Text>
           {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </Animated.View>
    </Pressable>
  );
};

interface HabitStatsCardsProps {
  currentStreak: number;
  bestStreak: number;
  successThisMonth: number;
  totalDaysThisMonth: number;
  overallRate: number;
  totalDaysSinceStart: number;
}

export const HabitStatsCards = ({
  currentStreak,
  bestStreak,
  successThisMonth,
  totalDaysThisMonth,
  overallRate,
}: HabitStatsCardsProps) => {
  const monthRate = totalDaysThisMonth > 0
    ? Math.round((successThisMonth / totalDaysThisMonth) * 100)
    : 0;

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <View style={styles.titleGroup}>
           <Icon name="chart-box-outline" size={20} color={Colors.textTertiary} />
           <Text style={styles.sectionTitle}>Performance Analytics</Text>
        </View>
      </View>
      
      <View style={styles.grid}>
        <StatCard
          icon="fire"
          label="Current Streak"
          value={`${currentStreak}d`}
          color={Colors.amber}
          subtitle="Showing up"
        />
        <StatCard
          icon="trophy-outline"
          label="Personal Best"
          value={`${bestStreak}d`}
          color={Colors.gold}
          subtitle="Record to beat"
        />
        <StatCard
          icon="calendar-month-outline"
          label="This Month"
          value={`${monthRate}%`}
          color={Colors.brand}
          subtitle="Discipline rate"
        />
        <StatCard
          icon="chart-timeline-variant"
          label="Overall Consistency"
          value={`${overallRate}%`}
          color={Colors.purple}
          subtitle="Lifetime average"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.m,
    paddingHorizontal: 4,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    ...Typography.heading,
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_SPACING,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.l,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.soft,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.l,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardFooter: {
    gap: 2,
  },
  value: {
    ...Typography.title,
    fontSize: 24,
    fontWeight: '800',
  },
  label: {
    ...Typography.heading,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  subtitle: {
    ...Typography.micro,
    color: Colors.textTertiary,
    fontWeight: '600',
  },
});
