import React from 'react';
import { ScrollView, Pressable, View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { format, isSameDay } from 'date-fns';
import { Colors, Typography, Spacing } from '../../theme';

interface DayData {
  date: Date;
  completionRate: number; // 0–1
}

interface DateScrollRowProps {
  days: DayData[];        // last 7 days
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

function ProgressRing({ size, progress, isToday, isSelected }:
  { size: number; progress: number; isToday: boolean; isSelected: boolean }) {
  const stroke = 2.5;
  const radius = (size - stroke * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);

  return (
    <View style={styles.ringContainer}>
      <Svg width={size} height={size}>
        {/* Track */}
        <Circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={Colors.borderLight}
          strokeWidth={stroke}
          fill={isSelected ? Colors.brand : 'transparent'}
        />
        {/* Progress */}
        {progress > 0 && (
          <Circle
            cx={size / 2} cy={size / 2} r={radius}
            stroke={isSelected ? Colors.surface : Colors.brand}
            strokeWidth={stroke}
            fill="transparent"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
            rotation="-90"
            origin={`${size / 2}, ${size / 2}`}
          />
        )}
      </Svg>
    </View>
  );
}

export function DateScrollRow({ days, selectedDate, onSelectDate }: DateScrollRowProps) {
  return (
    <View style={styles.outerContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {days.map((day) => {
          const isToday = isSameDay(day.date, new Date());
          const isSelected = isSameDay(day.date, selectedDate);

          return (
            <Pressable
              key={day.date.toISOString()}
              onPress={() => onSelectDate(day.date)}
              style={({ pressed }) => [
                styles.dayWrapper,
                pressed && { opacity: 0.8, transform: [{ scale: 0.95 }] }
              ]}
            >
              <View style={styles.ringWrapper}>
                <ProgressRing
                  size={44}
                  progress={day.completionRate}
                  isToday={isToday}
                  isSelected={isSelected}
                />
                <View style={styles.dateNumberWrapper}>
                  <Text style={[
                    styles.dateNumber,
                    isSelected && styles.dateNumberSelected,
                    isToday && !isSelected && styles.dateNumberToday,
                  ]}>
                    {format(day.date, 'd')}
                  </Text>
                </View>
              </View>
              <Text style={[styles.dayLabel, isSelected && styles.dayLabelSelected]}>
                {format(day.date, 'EEE').toUpperCase()}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    marginVertical: Spacing.m,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.m,
  },
  dayWrapper: {
    alignItems: 'center',
    gap: 6,
    width: 48,
  },
  ringWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateNumberWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateNumber: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.textSecondary,
    fontSize: 14,
  },
  dateNumberSelected: {
    color: Colors.surface,
    fontWeight: '700',
  },
  dateNumberToday: {
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  dayLabel: {
    ...Typography.micro,
    color: Colors.textTertiary,
    letterSpacing: 0.5,
    fontSize: 9,
  },
  dayLabelSelected: {
    color: Colors.brand,
    fontWeight: '700',
  },
});
