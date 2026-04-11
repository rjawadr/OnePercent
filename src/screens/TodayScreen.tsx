import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, ScrollView } from 'react-native';
import { Layout } from '../components/ui/Layout';
import { HabitCard } from '../components/habits/HabitCard';
import { useHabitStore } from '../store/habitStore';
import { Colors, Typography, Spacing, Shadows, BorderRadius } from '../theme';
import { Button } from '../components/ui/Button';
import { CreateHabitModal } from '../components/habits/CreateHabitModal';
import { HabitLoggingModal } from '../components/habits/HabitLoggingModal';
import { DateScrollRow } from '../components/habits/DateScrollRow';
import { TodayHeader } from '../components/ui/TodayHeader';
import { AmberBanner } from '../components/ui/AmberBanner';
import { MilestoneCelebrationOverlay } from '../components/habits/MilestoneCelebrationOverlay';
import { calculateConsecutiveMisses } from '../engine/onePercentEngine';
import { Habit } from '../models/Habit';
import { format, subDays, isSameDay } from 'date-fns';
import { useNavigation, usePreventRemove } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { FadeIn, FadeInDown, Layout as ReanimatedLayout } from 'react-native-reanimated';

const AllDoneState = ({ streakCount, totalHabits }: { streakCount: number, totalHabits: number }) => (
  <Animated.View entering={FadeInDown.duration(800)} style={styles.allDoneContainer}>
    <View style={styles.allDoneHero}>
      <View style={styles.successHalo}>
        <View style={styles.successIconStage}>
          <Icon name="check-decagram" size={64} color={Colors.brand} />
        </View>
      </View>
      <Text style={styles.allDoneTitle}>Elite Status.</Text>
      <Text style={styles.allDoneSubtitle}>
        You've mastered all {totalHabits} targets today.{"\n"}The 1% compounding effect is now in full velocity.
      </Text>
    </View>

    <View style={styles.performanceGrid}>
      <View style={styles.perfItem}>
        <View style={styles.perfIconBox}>
          <Icon name="fire" size={24} color={Colors.amber} />
        </View>
        <Text style={styles.perfValue}>{streakCount}</Text>
        <Text style={styles.perfLabel}>STREAK</Text>
      </View>
      <View style={styles.dividerVertical} />
      <View style={styles.perfItem}>
        <View style={styles.perfIconBox}>
          <Icon name="finance" size={24} color={Colors.brand} />
        </View>
        <Text style={styles.perfValue}>+1.00%</Text>
        <Text style={styles.perfLabel}>EST. GROWTH</Text>
      </View>
    </View>

    <Button 
      style={[styles.celebrationButton, { paddingVertical: 18 }]} 
      onPress={() => {}}
    >
      <Text style={styles.celebrationButtonText}>SHARE JOURNEY</Text>
      <Icon name="share-variant" size={18} color={Colors.surface} />
    </Button>
  </Animated.View>
);

export const TodayScreen = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  
  // Use recommended hook to prevent native back action from desyncing stack state on the root screen
  usePreventRemove(true, () => {});

  const {
    habits, logs, streaks, addHabit, logProgress, initialize, isInitialized,
    pendingMilestone, milestoneHabitId, clearMilestone
  } = useHabitStore();
  const [refreshing, setRefreshing] = useState(false);
  const [isCreateVisible, setIsCreateVisible] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [activeDate, setActiveDate] = useState(new Date());

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    initialize().finally(() => setRefreshing(false));
  }, [initialize]);

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const activeDateStr = format(activeDate, 'yyyy-MM-dd');

  const isCompletedOnDate = useCallback((habitId: string, dateStr: string) => {
    return logs.some(l => l.habit_id === habitId && l.date === dateStr && l.is_completed);
  }, [logs]);

  const completedTodayCount = useMemo(() => {
    return habits.filter(h => isCompletedOnDate(h.id, activeDateStr)).length;
  }, [habits, isCompletedOnDate, activeDateStr]);

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

  const missedHabitInfo = useMemo(() => {
    if (!isSameDay(activeDate, new Date())) return null;
    for (const habit of habits) {
      if (!habit.is_active || habit.status === 'archived') continue;
      const missedCount = calculateConsecutiveMisses(habit, logs);
      if (missedCount >= 1) {
        return {
          habit,
          missedCount,
        };
      }
    }
    return null;
  }, [habits, logs, activeDate]);

  const milestoneHabit = useMemo(() => {
    if (!pendingMilestone || !milestoneHabitId) return null;
    return habits.find(h => h.id === milestoneHabitId);
  }, [pendingMilestone, milestoneHabitId, habits]);

  const renderHeader = () => (
    <View style={styles.headerArea}>
      <TodayHeader
        completedCount={completedTodayCount}
        totalCount={habits.length}
        onPressStats={() => navigation.navigate('Stats')}
        onPressAdd={() => setIsCreateVisible(true)}
      />
      <DateScrollRow
        days={daysData}
        selectedDate={activeDate}
        onSelectDate={setActiveDate}
      />
      {missedHabitInfo && (
        <View style={styles.bannerContainer}>
          <AmberBanner
            title={missedHabitInfo.missedCount === 1
              ? `Regain focus on ${missedHabitInfo.habit.name}.`
              : "Discipline Reset Required."}
            subtitle={missedHabitInfo.missedCount === 1
              ? "Missed yesterday. Today matters twice as much."
              : "A new start. One tiny habit today."}
          />
        </View>
      )}
      {habits.length > 0 && !allCompletedOnActiveDate && (
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleBlock}>
            <Text style={styles.sectionLabel}>Daily Disciplines</Text>
            <View style={styles.missionPulse} />
          </View>
          <Text style={styles.sectionSublabel}>{habits.length - completedTodayCount} PENDING ACTION</Text>
        </View>
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

  const getValueAchieved = (habitId: string, dateStr: string) => {
    const log = logs.find(l => l.habit_id === habitId && l.date === dateStr);
    return log?.value_achieved ?? 0;
  };

  const getStreak = (habitId: string) => {
    const streak = streaks.find(s => s.habit_id === habitId);
    return streak?.current_streak || 0;
  };

  const renderHabitItem = useCallback(({ item }: { item: Habit }) => {
    const completed = isCompletedOnDate(item.id, activeDateStr);
    return (
      <HabitCard
        habit={item}
        completedToday={completed}
        progressPercent={getProgressPercent(item.id, activeDateStr)}
        currentStreak={getStreak(item.id)}
        valueAchieved={getValueAchieved(item.id, activeDateStr)}
        onPress={() => navigation.navigate('HabitDetail', { habitId: item.id })}
        onLog={() => setSelectedHabit(item)}
      />
    );
  }, [isCompletedOnDate, activeDateStr, getProgressPercent, getStreak, getValueAchieved, navigation]);

  const renderEmpty = () => (
    <Animated.View entering={FadeIn.delay(300)} style={styles.emptyContainer}>
      <View style={styles.emptyIconGroup}>
        <View style={styles.emptyHalo} />
        <View style={styles.emptyCore}>
          <Icon name="seed-outline" size={48} color={Colors.brand} />
        </View>
      </View>
      <Text style={styles.emptyTitle}>The Foundation</Text>
      <Text style={styles.emptySubtitle}>
        Compound interest follows consistent action.{"\n"}Plant your first behavior today.
      </Text>
      <Button 
        style={styles.emptyActionBtn}
        onPress={() => setIsCreateVisible(true)}
      >
        <Text style={styles.emptyActionText}>DEFINE FIRST HABIT</Text>
        <Icon name="arrow-right" size={20} color={Colors.surface} />
      </Button>
    </Animated.View>
  );

  return (
    <Layout style={styles.container}>
      <Animated.FlatList
        data={allCompletedOnActiveDate ? [] : habits.filter(h => h.status !== 'archived')}
        keyExtractor={(item) => item.id}
        itemLayoutAnimation={ReanimatedLayout.duration(400)}
        renderItem={renderHabitItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={habits.length === 0 ? renderEmpty : (allCompletedOnActiveDate ? <AllDoneState streakCount={totalStreak} totalHabits={habits.length} /> : null)}
        contentContainerStyle={[styles.listContent, { paddingBottom: 80 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.brand} />
        }
        bounces={false}
        overScrollMode="never"
      />

      <CreateHabitModal
        isVisible={isCreateVisible}
        onClose={() => setIsCreateVisible(false)}
        onAdd={addHabit}
      />

      {selectedHabit && (
        <HabitLoggingModal
          habit={selectedHabit}
          onLog={(value) => {
            const numValue = typeof value === 'string' ? parseFloat(value) : value;
            logProgress(selectedHabit.id, numValue, numValue >= selectedHabit.current_target);
            setSelectedHabit(null);
          }}
          onClose={() => setSelectedHabit(null)}
        />
      )}

      {/* FAB removed - action moved to header */}

      {pendingMilestone && milestoneHabit && (
        <MilestoneCelebrationOverlay
          milestone={pendingMilestone}
          habit={milestoneHabit}
          onDismiss={clearMilestone}
        />
      )}
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    paddingTop: 10,
  },
  headerArea: {
    backgroundColor: Colors.background,
  },
  bannerContainer: {
    marginTop: -8,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.l,
    paddingBottom: Spacing.m,
  },
  sectionTitleBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionLabel: {
    ...Typography.heading,
    fontSize: 20,
    color: Colors.textPrimary,
    fontWeight: '900',
  },
  missionPulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.brand,
  },
  sectionSublabel: {
    ...Typography.micro,
    color: Colors.textSecondary,
    fontWeight: '800',
    letterSpacing: 1,
  },
  allDoneContainer: {
    flex: 1,
    alignItems: 'center',
    marginTop: 60,
    paddingHorizontal: Spacing.xl,
  },
  allDoneHero: {
    alignItems: 'center',
    marginBottom: 40,
  },
  successHalo: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: Colors.brandLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successIconStage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.soft,
  },
  allDoneTitle: {
    ...Typography.title,
    fontSize: 32,
    color: Colors.textPrimary,
    fontWeight: '900',
  },
  allDoneSubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: 12,
    textAlign: 'center',
    lineHeight: 24,
  },
  performanceGrid: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    padding: Spacing.xl,
    borderRadius: BorderRadius.xxl,
    width: '100%',
    ...Shadows.soft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    marginBottom: 40,
  },
  perfItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  perfIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  perfValue: {
    ...Typography.title,
    fontSize: 24,
    color: Colors.textPrimary,
    fontWeight: '900',
  },
  perfLabel: {
    ...Typography.micro,
    color: Colors.textTertiary,
    fontWeight: '800',
    letterSpacing: 1,
  },
  dividerVertical: {
    width: 1.5,
    height: 60,
    backgroundColor: Colors.borderLight,
    marginHorizontal: 10,
  },
  celebrationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.brandDark,
    paddingHorizontal: 32,
    paddingVertical: 18,
    borderRadius: 40,
    gap: 12,
    ...Shadows.elevated,
  },
  celebrationButtonText: {
    ...Typography.label,
    color: Colors.surface,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    marginTop: 100,
    paddingHorizontal: Spacing.xl,
  },
  emptyIconGroup: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  emptyHalo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: Colors.brand + '20',
    position: 'absolute',
  },
  emptyCore: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.brandLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    ...Typography.title,
    fontSize: 28,
    color: Colors.textPrimary,
    fontWeight: '900',
  },
  emptySubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: 12,
    marginBottom: 40,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.brand,
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: BorderRadius.xl,
    gap: 12,
    ...Shadows.soft,
  },
  emptyActionText: {
    ...Typography.label,
    color: Colors.surface,
    fontWeight: '900',
    letterSpacing: 1,
  },
  fabContainer: {
    position: 'absolute',
  },
  fab: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.elevated,
  },
  fabRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2.5,
    borderColor: Colors.surface + '30',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
