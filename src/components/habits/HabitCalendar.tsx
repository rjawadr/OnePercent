import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { DailyLog } from '../../models/DailyLog';
import { Colors, Typography, Spacing, Shadows, BorderRadius } from '../../theme';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isSameMonth,
  isToday,
  isSameDay,
  parseISO,
  addMonths,
  subMonths,
} from 'date-fns';

interface HabitCalendarProps {
  logs: DailyLog[];
  habitId: string;
  month?: Date;
}

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export const HabitCalendar = ({ logs, habitId, month: initialMonth = new Date() }: HabitCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(initialMonth);

  const completedDates = useMemo(() => {
    return logs
      .filter(l => l.habit_id === habitId && l.is_completed)
      .map(l => parseISO(l.date));
  }, [logs, habitId]);

  const loggedDates = useMemo(() => {
    return logs
      .filter(l => l.habit_id === habitId)
      .map(l => l.date);
  }, [logs, habitId]);

  const days = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const allDays = eachDayOfInterval({ start, end });

    const leadingEmptyDays = getDay(start);
    const trailingEmptyDays = 6 - getDay(end);

    const leading = Array.from({ length: leadingEmptyDays }, () => null);
    const trailing = Array.from({ length: trailingEmptyDays }, () => null);

    return [...leading, ...allDays, ...trailing];
  }, [currentMonth]);

  const isCompleted = (day: Date) => {
    return completedDates.some(d => isSameDay(d, day));
  };

  const isMissed = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    return !loggedDates.includes(dateStr) && !isToday(day) && day < new Date();
  };

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const renderDay = (day: Date | null, index: number) => {
    if (!day) {
      return <View key={`empty-${index}`} style={styles.dayCell} />;
    }

    const completed = isCompleted(day);
    const today = isToday(day);
    const inMonth = isSameMonth(day, currentMonth);

    return (
      <View key={format(day, 'yyyy-MM-dd')} style={styles.dayCell}>
        <View
          style={[
            styles.dayCircle,
            completed && styles.dayCircleCompleted,
            today && styles.dayCircleToday,
            !inMonth && styles.dayCircleInactive,
          ]}
        >
          <Text
            style={[
              styles.dayText,
              completed && styles.dayTextCompleted,
              today && styles.dayTextToday,
              !inMonth && styles.dayTextInactive,
            ]}
          >
            {format(day, 'd')}
          </Text>
          {completed && (
            <View style={styles.checkWrapper}>
              <Icon name="check" size={8} color="#FFF" />
            </View>
          )}
          {today && !completed && <View style={styles.todayGlow} />}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handlePrevMonth} style={styles.navButton}>
          <Icon name="chevron-left" size={24} color={Colors.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.monthTitle}>{format(currentMonth, 'MMMM yyyy')}</Text>
        <TouchableOpacity onPress={handleNextMonth} style={styles.navButton}>
          <Icon name="chevron-right" size={24} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.weekHeader}>
        {DAY_LABELS.map((label, i) => (
          <Text key={i} style={styles.weekLabel}>{label}</Text>
        ))}
      </View>
      
      <View style={styles.grid}>
        {days.map((day, index) => renderDay(day, index))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.l,
    marginBottom: Spacing.xl,
    ...Shadows.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.l,
    backgroundColor: Colors.background,
    padding: 6,
    borderRadius: BorderRadius.l,
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    ...Shadows.soft,
  },
  monthTitle: {
    ...Typography.heading,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.m,
  },
  weekLabel: {
    width: 32,
    textAlign: 'center',
    ...Typography.micro,
    color: Colors.textTertiary,
    fontSize: 10,
    letterSpacing: 1,
    fontWeight: '800',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  dayCircleCompleted: {
    backgroundColor: Colors.brand,
    ...Shadows.brand,
  },
  dayCircleToday: {
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.brand,
  },
  dayCircleInactive: {
    opacity: 0.15,
  },
  dayText: {
    ...Typography.label,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  dayTextCompleted: {
    color: '#FFF',
    fontWeight: '800',
  },
  dayTextToday: {
    color: Colors.brand,
    fontWeight: '800',
  },
  dayTextInactive: {
    color: Colors.textTertiary,
  },
  checkWrapper: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: Colors.brandDark,
    borderRadius: 6,
    width: 12,
    height: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFF',
  },
  todayGlow: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.brand,
    opacity: 0.1,
  },
});
