import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Feather';
import { Layout } from '../components/ui/Layout';
import { ProgressLadder } from '../components/agoraphobia/ProgressLadder';
import { AIInsightCard } from '../components/agoraphobia/AIInsightCard';
import { useAgoraphobiaStore } from '../store/agoraphobiaStore';
import { projectExposureDifficulty } from '../engine/agoraphobiaEngine';
import { getMilestoneSummary, MILESTONE_COUNTS } from '../services/AIProgressInsightsService';
import { Colors, Typography, Spacing, Shadows } from '../theme';

export const AgoraphobiaHomeScreen = ({ navigation }: any) => {
  const { fearProfile, steps, sessions, thoughtRecords, initialize, isInitialized } = useAgoraphobiaStore();

  const [milestoneSummary, setMilestoneSummary] = useState('');
  const [milestoneCount, setMilestoneCount] = useState(0);

  useEffect(() => {
    if (!isInitialized) initialize();
  }, [isInitialized]);

  useEffect(() => {
    if (isInitialized && (!fearProfile || !fearProfile.onboarding_completed)) {
      navigation.replace('FearProfileOnboarding');
    }
  }, [isInitialized, fearProfile]);

  // Check if we're at a milestone and generate summary
  useEffect(() => {
    if (!isInitialized) return;
    
    if (thoughtRecords.length === 0) {
      setMilestoneSummary("Your thought journal is a powerful tool for recovery. Whenever you feel anxious, try recording your thoughts to challenge them. Each entry is a step toward freedom.");
      setMilestoneCount(0);
      return;
    }

    const count = thoughtRecords.length;
    // Find the highest milestone reached
    const reached = MILESTONE_COUNTS.filter(m => count >= m);
    const highestMilestone = reached.length > 0 ? reached[reached.length - 1] : 0;
    
    // Only fetch new summary if we moved to a new milestone bracket
    if (highestMilestone > 0 && highestMilestone !== milestoneCount) {
      setMilestoneCount(highestMilestone);
      getMilestoneSummary(thoughtRecords, fearProfile).then(setMilestoneSummary);
    } else if (highestMilestone === 0) {
      // If we have records but haven't hit the first milestone yet,
      // show a simple encouragement message.
      setMilestoneSummary("You're off to a great start. Keep capturing your thoughts to reveal patterns and build your resilience.");
      setMilestoneCount(0);
    }
  }, [isInitialized, thoughtRecords.length]);

  const currentStep = useMemo(
    () => steps.find(s => s.is_unlocked && !s.is_mastered) || steps[0],
    [steps]
  );

  const completedSessions = useMemo(
    () => sessions.filter(s => s.status === 'completed').length,
    [sessions]
  );

  const masteredSteps = useMemo(
    () => steps.filter(s => s.is_mastered).length,
    [steps]
  );

  const projection = useMemo(
    () => currentStep ? projectExposureDifficulty(currentStep.difficulty_value, currentStep.difficulty_unit) : null,
    [currentStep]
  );



  if (!isInitialized || !fearProfile) return null;

  return (
    <Layout>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Exposure Therapy</Text>
            <Text style={styles.headerSubtitle}>1% further, every session</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable
              onPress={() => navigation.navigate('ExposureLadder', { initialShowTemplates: true })}
              hitSlop={12}
              style={styles.addBtn}
            >
              <Icon name="plus" size={26} color={Colors.brand} />
            </Pressable>
            <Pressable
              onPress={() => navigation.navigate('ThoughtJournal')}
              hitSlop={12}
              style={styles.journalBtn}
            >
              <Icon name="book-open" size={20} color={Colors.surface} />
              {thoughtRecords.length > 0 && (
                <View style={styles.journalBadge}>
                  <Text style={styles.journalBadgeText}>{thoughtRecords.length}</Text>
                </View>
              )}
            </Pressable>
            <Pressable onPress={() => navigation.navigate('AgoraphobiaStats')} hitSlop={12}>
              <Icon name="bar-chart-2" size={24} color={Colors.textSecondary} />
            </Pressable>
          </View>
        </View>

        {/* Progress Ladder */}
        {steps.length > 0 && (
          <Animated.View entering={FadeInDown.delay(100)}>
            <ProgressLadder
              steps={steps}
              currentStepId={currentStep?.id}
              onStepPress={(step) => {
                if (step.is_unlocked) navigation.navigate('ActiveSession', { stepId: step.id });
              }}
            />
          </Animated.View>
        )}

        {/* Stats Row */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{completedSessions}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{masteredSteps}/{steps.length}</Text>
            <Text style={styles.statLabel}>Mastered</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{thoughtRecords.length}</Text>
            <Text style={styles.statLabel}>Records</Text>
          </View>
        </Animated.View>

        {/* Current Step Card */}
        {currentStep && (
          <Animated.View entering={FadeInDown.delay(300)}>
            <Pressable
              onPress={() => navigation.navigate('ActiveSession', { stepId: currentStep.id })}
              style={({ pressed }) => [styles.currentStepCard, pressed && styles.pressed]}
            >
              <View style={styles.currentStepHeader}>
                <View style={styles.currentStepBadge}>
                  <Text style={styles.currentStepBadgeText}>CURRENT STEP</Text>
                </View>
                <Icon name="play-circle" size={32} color={Colors.brand} />
              </View>
              <Text style={styles.currentStepName}>{currentStep.name}</Text>
              {currentStep.description && (
                <Text style={styles.currentStepDesc}>{currentStep.description}</Text>
              )}
              <View style={styles.currentStepMetrics}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricValue}>
                    {currentStep.difficulty_value} {currentStep.difficulty_unit}
                  </Text>
                  <Text style={styles.metricLabel}>Target</Text>
                </View>
                <View style={styles.metricDivider} />
                <View style={styles.metricItem}>
                  <Text style={styles.metricValue}>~{currentStep.initial_suds_estimate}</Text>
                  <Text style={styles.metricLabel}>Est. SUDS</Text>
                </View>
                <View style={styles.metricDivider} />
                <View style={styles.metricItem}>
                  <Text style={styles.metricValue}>{currentStep.mastery_count}/2</Text>
                  <Text style={styles.metricLabel}>Mastery</Text>
                </View>
              </View>

              {/* Projection */}
              {projection && (
                <View style={styles.visionContainer}>
                  <View style={styles.visionHeader}>
                    <Icon name="trending-up" size={14} color={Colors.brand} />
                    <Text style={styles.visionHeaderText}>1% compounding vision</Text>
                  </View>
                  <View style={styles.visionTierPrimary}>
                    <Text style={styles.visionTierLabel}>In 1 Year</Text>
                    <View style={styles.visionTierPrimaryValueRow}>
                      <Text style={styles.visionTierPrimaryValue}>{projection.at365}</Text>
                      <Text style={styles.visionTierPrimaryUnit}>{currentStep.difficulty_unit}</Text>
                    </View>
                  </View>
                  <View style={styles.visionDivider} />
                  <View style={styles.visionSecondaryRow}>
                    <View style={styles.visionSecondaryItem}>
                      <Text style={styles.visionSecondaryLabel}>90 Days</Text>
                      <Text style={styles.visionSecondaryValue}>{projection.at90} {currentStep.difficulty_unit}</Text>
                    </View>
                    <View style={styles.visionSecondaryDivider} />
                    <View style={styles.visionSecondaryItem}>
                      <Text style={styles.visionSecondaryLabel}>30 Days</Text>
                      <Text style={styles.visionSecondaryValue}>{projection.at30} {currentStep.difficulty_unit}</Text>
                    </View>
                  </View>
                </View>
              )}
            </Pressable>
          </Animated.View>
        )}

        {/* Quick Actions */}
        <Animated.View entering={FadeInDown.delay(400)} style={styles.actionsRow}>
          <Pressable
            style={styles.actionCard}
            onPress={() => navigation.navigate('ExposureLadder')}
          >
            <View style={[styles.actionIcon, { backgroundColor: Colors.brandLight }]}>
              <Icon name="list" size={20} color={Colors.brand} />
            </View>
            <Text style={styles.actionTitle}>Ladder</Text>
            <Text style={styles.actionSub}>View all steps</Text>
          </Pressable>

          <Pressable
            style={styles.actionCard}
            onPress={() => navigation.navigate('ThoughtRecord')}
          >
            <View style={[styles.actionIcon, { backgroundColor: Colors.purpleLight }]}>
              <Icon name="edit-3" size={20} color={Colors.purple} />
            </View>
            <Text style={styles.actionTitle}>Journal</Text>
            <Text style={styles.actionSub}>Thought record</Text>
          </Pressable>

          <Pressable
            style={styles.actionCard}
            onPress={() => navigation.navigate('ActiveSession', { stepId: currentStep?.id, mode: 'retrospective' })}
          >
            <View style={[styles.actionIcon, { backgroundColor: Colors.amberLight }]}>
              <Icon name="clock" size={20} color={Colors.amber} />
            </View>
            <Text style={styles.actionTitle}>Log past</Text>
            <Text style={styles.actionSub}>Retrospective</Text>
          </Pressable>
        </Animated.View>

        {/* ──── AI Milestone Summary ──── */}
        {milestoneSummary ? (
          <Animated.View entering={FadeInDown.delay(450)} style={styles.insightSection}>
            <AIInsightCard
              type="milestone"
              message={milestoneSummary}
              milestoneCount={milestoneCount}
            />
          </Animated.View>
        ) : null}



        {/* Empty state */}
        {steps.length === 0 && (
          <Animated.View entering={FadeInDown.delay(200)} style={styles.emptyCard}>
            <Icon name="compass" size={48} color={Colors.brand} />
            <Text style={styles.emptyTitle}>Build your exposure ladder</Text>
            <Text style={styles.emptySubtitle}>
              Choose a template or create a custom ladder to begin your journey.
            </Text>
            <Pressable
              onPress={() => navigation.navigate('ExposureLadder')}
              style={styles.emptyButton}
            >
              <Text style={styles.emptyButtonText}>Get Started →</Text>
            </Pressable>
          </Animated.View>
        )}

        {/* Disclaimer */}
        <Text style={styles.disclaimer}>
          This app is a wellness tool, not a medical device. It does not replace professional therapy.
        </Text>
      </ScrollView>

    </Layout>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.m,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.m,
  },
  addBtn: {
    padding: Spacing.xs,
  },
  headerTitle: {
    ...Typography.h1,
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.m,
    marginTop: Spacing.m,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.m,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  statLabel: {
    ...Typography.micro,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  currentStepCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: Spacing.l,
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.l,
    borderWidth: 1.5,
    borderColor: Colors.brand + '30',
    ...Shadows.soft,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  currentStepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.m,
  },
  currentStepBadge: {
    backgroundColor: Colors.brandLight,
    paddingVertical: 3,
    paddingHorizontal: Spacing.s,
    borderRadius: 8,
  },
  currentStepBadgeText: {
    ...Typography.micro,
    color: Colors.brand,
  },
  currentStepName: {
    ...Typography.heading,
    color: Colors.textPrimary,
    fontSize: 20,
  },
  currentStepDesc: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  currentStepMetrics: {
    flexDirection: 'row',
    marginTop: Spacing.l,
    paddingTop: Spacing.l,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricValue: {
    ...Typography.label,
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
  },
  metricLabel: {
    ...Typography.micro,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    backgroundColor: Colors.borderLight,
  },
  visionContainer: {
    backgroundColor: Colors.brandLight,
    borderRadius: 16,
    padding: Spacing.m,
    marginTop: Spacing.l,
    borderWidth: 1,
    borderColor: Colors.brand + '20',
  },
  visionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.s,
  },
  visionHeaderText: {
    ...Typography.caption,
    color: Colors.brand,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  visionTierPrimary: {
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  visionTierLabel: {
    ...Typography.micro,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  visionTierPrimaryValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  visionTierPrimaryValue: {
    ...Typography.heading,
    fontSize: 28,
    color: Colors.brand,
  },
  visionTierPrimaryUnit: {
    ...Typography.label,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  visionDivider: {
    height: 1,
    backgroundColor: Colors.brand + '15',
    marginVertical: Spacing.s,
  },
  visionSecondaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  visionSecondaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  visionSecondaryLabel: {
    ...Typography.micro,
    color: Colors.textTertiary,
    marginBottom: 2,
  },
  visionSecondaryValue: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  visionSecondaryDivider: {
    width: 1,
    height: 20,
    backgroundColor: Colors.brand + '15',
  },
  actionsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.m,
    marginTop: Spacing.l,
  },
  actionCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.m,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.s,
  },
  actionTitle: {
    ...Typography.label,
    color: Colors.textPrimary,
    fontSize: 13,
  },
  actionSub: {
    ...Typography.micro,
    color: Colors.textTertiary,
    marginTop: 1,
  },
  // AI Insight Section
  insightSection: {
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.l,
  },
  journalBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: Colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  journalBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.amber,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  journalBadgeText: {
    ...Typography.micro,
    color: Colors.surface,
    fontWeight: '900',
    fontSize: 9,
  },
  emptyCard: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: Spacing.xxl,
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyTitle: {
    ...Typography.heading,
    color: Colors.textPrimary,
    marginTop: Spacing.l,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.s,
  },
  emptyButton: {
    backgroundColor: Colors.brand,
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
  disclaimer: {
    ...Typography.caption,
    color: Colors.textTertiary,
    textAlign: 'center',
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.xxl,
    fontSize: 11,
  },
});
