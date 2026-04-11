import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Feather';
import { Layout } from '../components/ui/Layout';
import { ThoughtRecordCard } from '../components/agoraphobia/ThoughtRecordCard';
import { AIInsightCard } from '../components/agoraphobia/AIInsightCard';
import { useAgoraphobiaStore } from '../store/agoraphobiaStore';
import { getMilestoneSummary, MILESTONE_COUNTS } from '../services/AIProgressInsightsService';
import { Colors, Typography, Spacing } from '../theme';

export const ThoughtJournalScreen = ({ navigation }: any) => {
  const { thoughtRecords, fearProfile } = useAgoraphobiaStore();

  const [milestoneSummary, setMilestoneSummary] = useState('');
  const [milestoneCount, setMilestoneCount] = useState(0);

  // Check milestone on mount
  React.useEffect(() => {
    if (thoughtRecords.length === 0) {
      setMilestoneSummary("Freedom starts with awareness. Use the Thought Journal to challenge your fears and rewrite your narrative. Your first record is the most important one.");
      setMilestoneCount(0);
      return;
    }

    const count = thoughtRecords.length;
    const reached = MILESTONE_COUNTS.filter(m => count >= m);
    const highest = reached.length > 0 ? reached[reached.length - 1] : 0;
    
    if (highest > 0) {
      setMilestoneCount(highest);
      getMilestoneSummary(thoughtRecords, fearProfile).then(setMilestoneSummary);
    } else {
      // Small number of records (<3), show encouragement
      setMilestoneSummary("You're starting to build a new habit. Every thought record you write strengthens your awareness and helps you navigate anxiety more skillfully.");
      setMilestoneCount(0);
    }
  }, [thoughtRecords.length]);

  // Group records by month
  const groupedRecords = useMemo(() => {
    const groups: { label: string; records: typeof thoughtRecords }[] = [];
    const map = new Map<string, typeof thoughtRecords>();

    thoughtRecords.forEach(r => {
      const d = new Date(r.date);
      const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
      // Store label on first occurrence
      if (!groups.find(g => g.label === label)) {
        groups.push({ label, records: map.get(key)! });
      }
    });

    return groups;
  }, [thoughtRecords]);

  return (
    <Layout>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Icon name="arrow-left" size={24} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.topTitle}>Thought Journal</Text>
        <Pressable
          onPress={() => navigation.navigate('ThoughtRecord')}
          hitSlop={12}
          style={styles.newBtn}
        >
          <Icon name="plus" size={20} color={Colors.surface} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
      >
        {/* Stats Banner */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.statsRow}>
          <View style={styles.statPill}>
            <Icon name="file-text" size={14} color={Colors.purple} />
            <Text style={styles.statText}>{thoughtRecords.length} Records</Text>
          </View>
          <View style={styles.statPill}>
            <Icon name="calendar" size={14} color={Colors.brand} />
            <Text style={styles.statText}>
              {new Set(thoughtRecords.map(r => r.date?.split('T')[0])).size} Days
            </Text>
          </View>
          {milestoneCount > 0 && (
            <View style={[styles.statPill, styles.milestonePill]}>
              <Icon name="award" size={14} color={Colors.amber} />
              <Text style={[styles.statText, { color: Colors.amber }]}>
                {milestoneCount} Milestone
              </Text>
            </View>
          )}
        </Animated.View>

        {/* AI Milestone Summary */}
        {milestoneSummary ? (
          <Animated.View entering={FadeInDown.delay(200)} style={styles.insightSection}>
            <AIInsightCard
              type="milestone"
              message={milestoneSummary}
              milestoneCount={milestoneCount}
            />
          </Animated.View>
        ) : null}

        {/* Empty State */}
        {thoughtRecords.length === 0 && (
          <Animated.View entering={FadeInDown.delay(200)} style={styles.emptyCard}>
            <View style={styles.emptyIconCircle}>
              <Icon name="edit-3" size={32} color={Colors.purple} />
            </View>
            <Text style={styles.emptyTitle}>No records yet</Text>
            <Text style={styles.emptySubtitle}>
              Start journaling your thoughts to track patterns and build self-awareness.
            </Text>
            <Pressable
              onPress={() => navigation.navigate('ThoughtRecord')}
              style={styles.emptyButton}
            >
              <Text style={styles.emptyButtonText}>Write First Record →</Text>
            </Pressable>
          </Animated.View>
        )}

        {/* Grouped Records */}
        {groupedRecords.map((group, gIdx) => (
          <Animated.View
            key={group.label}
            entering={FadeInDown.delay(250 + gIdx * 80)}
            style={styles.monthGroup}
          >
            <View style={styles.monthHeader}>
              <View style={styles.monthDot} />
              <Text style={styles.monthLabel}>{group.label}</Text>
              <Text style={styles.monthCount}>{group.records.length}</Text>
            </View>

            <View style={styles.recordsList}>
              {group.records.map((record, rIdx) => (
                <Animated.View
                  key={record.id}
                  entering={FadeInDown.delay(300 + gIdx * 80 + rIdx * 50)}
                >
                  <ThoughtRecordCard
                    record={record}
                    onPress={() => navigation.navigate('ThoughtRecord', { viewRecordId: record.id })}
                  />
                </Animated.View>
              ))}
            </View>
          </Animated.View>
        ))}

        <View style={{ height: 80 }} />
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.m,
  },
  topTitle: {
    ...Typography.heading,
    color: Colors.textPrimary,
    fontSize: 20,
  },
  newBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: Colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: 40,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.s,
    flexWrap: 'wrap',
    marginBottom: Spacing.l,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surface,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  milestonePill: {
    backgroundColor: Colors.amberLight,
    borderColor: Colors.amber + '25',
  },
  statText: {
    ...Typography.micro,
    color: Colors.textPrimary,
    fontWeight: '800',
    fontSize: 12,
  },
  insightSection: {
    marginBottom: Spacing.l,
  },
  emptyCard: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: Spacing.xxl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: Spacing.xl,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: Colors.purpleLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.l,
  },
  emptyTitle: {
    ...Typography.heading,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.s,
    lineHeight: 22,
  },
  emptyButton: {
    backgroundColor: Colors.purple,
    paddingVertical: Spacing.m,
    paddingHorizontal: Spacing.xxl,
    borderRadius: 99,
    marginTop: Spacing.xl,
  },
  emptyButtonText: {
    color: Colors.surface,
    fontWeight: '800',
    fontSize: 15,
  },
  monthGroup: {
    marginBottom: Spacing.xl,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.m,
  },
  monthDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.purple,
  },
  monthLabel: {
    ...Typography.label,
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: '800',
    flex: 1,
  },
  monthCount: {
    ...Typography.micro,
    color: Colors.textTertiary,
    fontWeight: '800',
    fontSize: 12,
  },
  recordsList: {
    gap: Spacing.m,
  },
});
