import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Typography, Spacing } from '../../theme';
import { format } from 'date-fns';

interface TodayHeaderProps {
  completedCount: number;
  totalCount: number;
  onPressStats?: () => void;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export function TodayHeader({ completedCount, totalCount, onPressStats }: TodayHeaderProps) {
  const today = new Date();
  const allDone = completedCount === totalCount && totalCount > 0;

  return (
    <View style={styles.container}>
      {/* Top row */}
      <View style={styles.topRow}>
        <View>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.date}>{format(today, 'EEEE, MMMM d')}</Text>
        </View>

        {/* Completion pill */}
        <TouchableOpacity 
          style={[styles.completionPill, allDone && styles.completionPillDone]}
          onPress={onPressStats}
          activeOpacity={0.7}
        >
          <Icon
            name={allDone ? 'check-all' : 'check'}
            size={14}
            color={allDone ? Colors.surface : Colors.brand}
          />
          <Text style={[styles.completionText, allDone && styles.completionTextDone]}>
            {completedCount}/{totalCount}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.m,
    paddingBottom: Spacing.s,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    ...Typography.title,
    color: Colors.textPrimary,
  },
  date: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  completionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.brandLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.brand + '20',
  },
  completionPillDone: {
    backgroundColor: Colors.brand,
    borderColor: Colors.brand,
  },
  completionText: {
    ...Typography.label,
    color: Colors.brand,
    fontWeight: '700',
  },
  completionTextDone: {
    color: Colors.surface,
  },
});
