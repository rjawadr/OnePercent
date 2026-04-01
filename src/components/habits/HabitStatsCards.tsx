import React from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Typography, Spacing, Shadows, BorderRadius } from '../../theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - Spacing.xl * 2 - Spacing.m) / 2;

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  color: string;
}

const StatCard = ({ label, value, icon, color }: StatCardProps) => {
  const scale = new Animated.Value(1);

  const onPressIn = () => {
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable onPressIn={onPressIn} onPressOut={onPressOut}>
      <Animated.View style={[styles.card, { borderLeftColor: color, transform: [{ scale }] }]}>
        <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
          <Icon name={icon} size={22} color={color} />
        </View>
        <View style={styles.statInfo}>
          <Text style={styles.value}>{value}</Text>
          <Text style={styles.label}>{label}</Text>
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
      <View style={styles.headerRow}>
        <Icon name="poll" size={20} color={Colors.brand} />
        <Text style={styles.sectionTitle}>Performance</Text>
      </View>
      <View style={styles.grid}>
        <StatCard
          icon="fire"
          label="Current Streak"
          value={`${currentStreak}d`}
          color="#FF7A00"
        />
        <StatCard
          icon="medal-outline"
          label="Best Streak"
          value={`${bestStreak}d`}
          color="#FFC107"
        />
        <StatCard
          icon="calendar-check"
          label="This Month"
          value={`${monthRate}%`}
          color={Colors.brand}
        />
        <StatCard
          icon="chart-timeline-variant-shimmer"
          label="Overall Rate"
          value={`${overallRate}%`}
          color="#7E57C2"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.xl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.s,
    marginBottom: Spacing.m,
    paddingLeft: 4,
  },
  sectionTitle: {
    ...Typography.heading,
    fontSize: 18,
    color: Colors.textPrimary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.m,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.l,
    padding: Spacing.m,
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: Spacing.s,
    borderLeftWidth: 4,
    ...Shadows.card,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  statInfo: {
    width: '100%',
  },
  value: {
    ...Typography.heading,
    fontSize: 22,
    color: Colors.textPrimary,
    lineHeight: 28,
  },
  label: {
    ...Typography.micro,
    fontSize: 10,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
});
