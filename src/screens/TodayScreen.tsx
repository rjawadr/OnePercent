import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, ScrollView } from 'react-native';
import { Layout } from '../components/ui/Layout';
import { HabitCard } from '../components/habits/HabitCard';
import { useHabitStore } from '../store/habitStore';
import { Colors, Typography, Spacing, Shadows } from '../theme';
import { Button } from '../components/ui/Button';
import { CreateHabitModal } from '../components/habits/CreateHabitModal';
import { HabitLoggingModal } from '../components/habits/HabitLoggingModal';
import { DateScrollRow } from '../components/habits/DateScrollRow';
import { TodayHeader } from '../components/ui/TodayHeader';
import { Habit } from '../models/Habit';
import { format, subDays, isSameDay } from 'date-fns';
import { useNavigation } from '@react-navigation/native';
import BottomSheet from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const AllDoneState = ({ streakCount }: { streakCount: number }) => (
  <View style={styles.allDoneContainer}>
    <Text style={styles.allDoneEmoji}>✨</Text>
    <Text style={styles.allDoneTitle}>All done for today.</Text>
    <Text style={styles.allDoneSubtitle}>
      You showed up.{"\n"}That's who you are.
    </Text>
    <View style={styles.allDoneStreakBadge}>
      <Text style={styles.allDoneStreakText}>🔥 {streakCount} day streak</Text>
    </View>
  </View>
);

export const TodayScreen = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { habits, logs, streaks, addHabit, logProgress, initialize, isInitialized } = useHabitStore();
  const [refreshing, setRefreshing] = useState(false);
  const [isCreateVisible, setIsCreateVisible] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [activeDate, setActiveDate] = useState(new Date());

  const bottomSheetRef = React.useRef<BottomSheet>(null);

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    initialize().finally(() => setRefreshing(false));
  }, [initialize]);

  // Calculate stats for header
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const activeDateStr = format(activeDate, 'yyyy-MM-dd');

  const isCompletedOnDate = useCallback((habitId: string, dateStr: string) => {
    return logs.some(l => l.habit_id === habitId && l.date === dateStr && l.is_completed);
  }, [logs]);

  const completedTodayCount = useMemo(() => {
    return habits.filter(h => isCompletedOnDate(h.id, todayStr)).length;
  }, [habits, isCompletedOnDate, todayStr]);

  const allCompletedOnActiveDate = useMemo(() => {
    if (habits.length === 0) return false;
    return habits.every(h => isCompletedOnDate(h.id, activeDateStr));
  }, [habits, isCompletedOnDate, activeDateStr]);

  const totalStreak = useMemo(() => {
    if (streaks.length === 0) return 0;
    return Math.max(...streaks.map(s => s.current_streak), 0);
  }, [streaks]);

  const daysData = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const totalHabits = habits.length;
      const completed = habits.filter(h => isCompletedOnDate(h.id, dateStr)).length;
      return {
        date,
        completionRate: totalHabits > 0 ? completed / totalHabits : 0,
      };
    });
  }, [habits, isCompletedOnDate]);

  const renderHeader = () => (
    <View>
      <TodayHeader 
        completedCount={completedTodayCount} 
        totalCount={habits.length}
        onPressStats={() => navigation.navigate('Stats')}
      />
      <DateScrollRow 
        days={daysData} 
        selectedDate={activeDate} 
        onSelectDate={setActiveDate} 
      />
      {habits.length > 0 && !allCompletedOnActiveDate && (
        <Text style={styles.sectionLabel}>Daily Missions</Text>
      )}
    </View>
  );

  const getProgressPercent = (habitId: string, dateStr: string) => {
    const log = logs.find(l => l.habit_id === habitId && l.date === dateStr);
    if (!log) return 0;
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return 0;
    return (log.value_achieved / habit.current_target) * 100;
  };

  const getStreak = (habitId: string) => {
    const streak = streaks.find(s => s.habit_id === habitId);
    return streak?.current_streak || 0;
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>✨</Text>
      <Text style={styles.emptyTitle}>Add your first habit</Text>
      <Text style={styles.emptySubtitle}>
        Start with one tiny thing.{"\n"}The 1% engine does the rest.
      </Text>
      <Button 
        title="Create First Habit" 
        onPress={() => setIsCreateVisible(true)} 
        style={styles.emptyButton}
      />
    </View>
  );

  const handleLogPress = (habit: Habit) => {
    setSelectedHabit(habit);
    // Modal state will trigger BottomSheet in HabitLoggingModal
  };

  return (
    <Layout style={styles.container}>
      <FlatList
        data={habits.filter(h => h.is_active)}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const completed = isCompletedOnDate(item.id, activeDateStr);
          if (allCompletedOnActiveDate) return null; // Show AllDone state instead

          return (
            <HabitCard 
              habit={item}
              completedToday={completed}
              progressPercent={getProgressPercent(item.id, activeDateStr)}
              currentStreak={getStreak(item.id)}
              onPress={() => navigation.navigate('HabitDetail', { habitId: item.id })}
              onLog={() => handleLogPress(item)}
            />
          );
        }}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={habits.length === 0 ? renderEmpty : (allCompletedOnActiveDate ? <AllDoneState streakCount={totalStreak} /> : null)}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 120 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.brand} />
        }
      />

      <CreateHabitModal 
        isVisible={isCreateVisible}
        onClose={() => setIsCreateVisible(false)}
        onAdd={addHabit}
      />

      {selectedHabit && (
        <HabitLoggingModal 
          habit={selectedHabit}
          onLog={(value, memo) => {
            const numValue = typeof value === 'string' ? parseFloat(value) : value;
            logProgress(selectedHabit.id, numValue, numValue >= selectedHabit.current_target);
            setSelectedHabit(null);
          }}
          onClose={() => setSelectedHabit(null)}
          bottomSheetRef={bottomSheetRef as any}
        />
      )}
      
      <TouchableOpacity 
        style={[styles.fab, { bottom: insets.bottom + 100, right: Spacing.xl }]} 
        activeOpacity={0.8}
        onPress={() => setIsCreateVisible(true)}
      >
        <Icon name="plus" size={32} color={Colors.surface} />
      </TouchableOpacity>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    // Dynamic padding applied inline
  },
  sectionLabel: {
    ...Typography.heading,
    color: Colors.textPrimary,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.m,
    paddingBottom: Spacing.s,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: Spacing.xl,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: Spacing.m,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: 12,
    marginBottom: Spacing.xl,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyButton: {
    width: '100%',
  },
  allDoneContainer: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: Spacing.xl,
  },
  allDoneEmoji: {
    fontSize: 48,
  },
  allDoneTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 16,
  },
  allDoneSubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 22,
  },
  allDoneStreakBadge: {
    backgroundColor: Colors.brandLight,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.brand + '20',
  },
  allDoneStreakText: {
    color: Colors.brand,
    fontWeight: '700',
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.elevated,
  },
  fabText: {
    fontSize: 32,
    color: Colors.surface,
    fontWeight: '300',
    marginTop: -4,
  },
});
