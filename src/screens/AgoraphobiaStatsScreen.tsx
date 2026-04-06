import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Feather';
import { Layout } from '../components/ui/Layout';
import { useAgoraphobiaStore } from '../store/agoraphobiaStore';
import { projectExposureDifficulty } from '../engine/agoraphobiaEngine';
import { Colors, Typography, Spacing } from '../theme';

export const AgoraphobiaStatsScreen = ({ navigation }: any) => {
  const { steps, sessions, thoughtRecords } = useAgoraphobiaStore();

  const completedSessions = useMemo(() => sessions.filter(s => s.status === 'completed'), [sessions]);
  const masteredSteps = useMemo(() => steps.filter(s => s.is_mastered).length, [steps]);
  const avgSudsDrop = useMemo(() => {
    const drops = completedSessions
      .filter(s => s.pre_suds != null && s.post_suds != null)
      .map(s => (s.pre_suds ?? 0) - (s.post_suds ?? 0));
    return drops.length ? (drops.reduce((a, b) => a + b, 0) / drops.length).toFixed(1) : '—';
  }, [completedSessions]);

  const totalMinutes = useMemo(() => {
    const secs = completedSessions.reduce((acc, s) => acc + (s.duration_seconds || 0), 0);
    return Math.round(secs / 60);
  }, [completedSessions]);

  const masteryRate = useMemo(() => {
    if (!completedSessions.length) return '—';
    const mastered = completedSessions.filter(s => (s.post_suds ?? 10) <= 2).length;
    return `${Math.round((mastered / completedSessions.length) * 100)}%`;
  }, [completedSessions]);

  const currentStep = useMemo(() => steps.find(s => s.is_unlocked && !s.is_mastered), [steps]);
  const projection = useMemo(
    () => currentStep ? projectExposureDifficulty(currentStep.difficulty_value, currentStep.difficulty_unit) : null,
    [currentStep]
  );

  const recentSessions = useMemo(() => completedSessions.slice(0, 5), [completedSessions]);

  return (
    <Layout>
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Icon name="arrow-left" size={24} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.topTitle}>Statistics</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Top stats grid */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.grid}>
          <StatBox label="Sessions" value={completedSessions.length.toString()} icon="activity" color={Colors.brand} />
          <StatBox label="Steps Mastered" value={`${masteredSteps}/${steps.length}`} icon="check-circle" color={Colors.brand} />
          <StatBox label="Avg SUDS Drop" value={avgSudsDrop.toString()} icon="trending-down" color={Colors.brand} />
          <StatBox label="Total Time" value={`${totalMinutes}m`} icon="clock" color={Colors.amber} />
          <StatBox label="Mastery Rate" value={masteryRate} icon="award" color={Colors.brand} />
          <StatBox label="Thought Records" value={thoughtRecords.length.toString()} icon="edit-3" color={Colors.purple} />
        </Animated.View>

        {/* Projection card */}
        {currentStep && projection && (
          <Animated.View entering={FadeInDown.delay(200)} style={styles.projCard}>
            <Text style={styles.projTitle}>1% Compound Projection</Text>
            <Text style={styles.projStep}>{currentStep.name}</Text>
            <View style={styles.projRow}>
              <ProjItem label="Now" value={`${currentStep.difficulty_value}`} unit={currentStep.difficulty_unit} />
              <ProjItem label="10 sessions" value={`${projection.at10}`} unit={currentStep.difficulty_unit} />
              <ProjItem label="30 sessions" value={`${projection.at30}`} unit={currentStep.difficulty_unit} />
              <ProjItem label="90 sessions" value={`${projection.at90}`} unit={currentStep.difficulty_unit} />
            </View>
          </Animated.View>
        )}

        {/* Recent sessions */}
        {recentSessions.length > 0 && (
          <Animated.View entering={FadeInDown.delay(300)}>
            <Text style={styles.sectionTitle}>Recent Sessions</Text>
            {recentSessions.map((s, i) => {
              const step = steps.find(st => st.id === s.step_id);
              const mastered = (s.post_suds ?? 10) <= 2;
              return (
                <View key={s.id} style={styles.sessionRow}>
                  <View style={[styles.sessionDot, mastered && styles.dotMastered]} />
                  <View style={styles.sessionContent}>
                    <Text style={styles.sessionName}>{step?.name ?? 'Unknown step'}</Text>
                    <Text style={styles.sessionMeta}>
                      SUDS {s.pre_suds}→{s.post_suds} · {Math.round((s.duration_seconds || 0) / 60)}m
                    </Text>
                  </View>
                  {mastered && <Icon name="check" size={16} color={Colors.brand} />}
                </View>
              );
            })}
          </Animated.View>
        )}

        <Text style={styles.disclaimer}>
          This app is a wellness tool, not a medical device.
        </Text>
      </ScrollView>
    </Layout>
  );
};

const StatBox = ({ label, value, icon, color }: { label: string; value: string; icon: string; color: string }) => (
  <View style={styles.statBox}>
    <Icon name={icon} size={18} color={color} />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const ProjItem = ({ label, value, unit }: { label: string; value: string; unit: string }) => (
  <View style={styles.projItem}>
    <Text style={styles.projValue}>{value}</Text>
    <Text style={styles.projUnit}>{unit}</Text>
    <Text style={styles.projLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.xl, paddingVertical: Spacing.m },
  topTitle: { ...Typography.heading, color: Colors.textPrimary },
  scroll: { paddingHorizontal: Spacing.xl, paddingBottom: 120 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.m },
  statBox: { width: '47%', backgroundColor: Colors.surface, borderRadius: 16, padding: Spacing.l, borderWidth: 1, borderColor: Colors.border, gap: Spacing.xs },
  statValue: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary },
  statLabel: { ...Typography.caption, color: Colors.textTertiary },
  projCard: { backgroundColor: Colors.surface, borderRadius: 20, padding: Spacing.l, marginTop: Spacing.l, borderWidth: 1, borderColor: Colors.brand + '30' },
  projTitle: { ...Typography.label, color: Colors.brand, textTransform: 'uppercase', letterSpacing: 1, fontSize: 10 },
  projStep: { ...Typography.heading, color: Colors.textPrimary, marginTop: Spacing.xs, marginBottom: Spacing.l },
  projRow: { flexDirection: 'row', justifyContent: 'space-between' },
  projItem: { alignItems: 'center' },
  projValue: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary },
  projUnit: { ...Typography.micro, color: Colors.textTertiary },
  projLabel: { ...Typography.micro, color: Colors.brand, marginTop: 2 },
  sectionTitle: { ...Typography.heading, color: Colors.textPrimary, marginTop: Spacing.xl, marginBottom: Spacing.m },
  sessionRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.m, paddingVertical: Spacing.m, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  sessionDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.amber },
  dotMastered: { backgroundColor: Colors.brand },
  sessionContent: { flex: 1 },
  sessionName: { ...Typography.label, color: Colors.textPrimary, fontSize: 14 },
  sessionMeta: { ...Typography.caption, color: Colors.textTertiary, marginTop: 2 },
  disclaimer: { ...Typography.caption, color: Colors.textTertiary, textAlign: 'center', paddingTop: Spacing.xxl, fontSize: 11 },
});
