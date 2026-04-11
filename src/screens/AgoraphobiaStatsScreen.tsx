import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Feather';
import { Layout } from '../components/ui/Layout';
import { useAgoraphobiaStore } from '../store/agoraphobiaStore';
import { projectExposureDifficulty } from '../engine/agoraphobiaEngine';
import { Colors, Typography, Spacing, Shadows, BorderRadius } from '../theme';
import Svg, { Path, Circle, Defs, LinearGradient, Stop, G, Line } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SUDSTrendChart = ({ sessions, resets }: { sessions: any[], resets: any[] }) => {
  const chartWidth = SCREEN_WIDTH - Spacing.xl * 2 - Spacing.l * 2;
  const chartHeight = 160;

  // We only chart completed sessions
  const chronologicalSessions = [...sessions].reverse();
  
  if (chronologicalSessions.length < 2) return null;

  const points = chronologicalSessions.map((s, i) => {
    const val = s.post_suds ?? 0;
    return val;
  });

  const maxVal = 10;
  const minVal = 0;

  const getX = (index: number) => (index / (points.length - 1)) * chartWidth;
  const getY = (val: number) => chartHeight - ((val - minVal) / (maxVal - minVal)) * chartHeight;

  const pathPoints = points.map((p, i) => ({ x: getX(i), y: getY(p) }));

  const getPath = (pts: {x: number, y: number}[]) => {
    if (pts.length < 2) return '';
    let d = `M ${pts[0].x},${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i+1];
      const cp1x = p0.x + (p1.x - p0.x) / 2;
      d += ` C ${cp1x},${p0.y} ${cp1x},${p1.y} ${p1.x},${p1.y}`;
    }
    return d;
  };

  const actualPath = getPath(pathPoints);
  const areaPath = `${actualPath} L ${chartWidth},${chartHeight} L 0,${chartHeight} Z`;

  // Find where to draw reset lines
  const resetLines = resets.map(r => {
    // Find the first session that happened AFTER the reset
    const resetTime = new Date(r.timestamp).getTime();
    const nextSessionIndex = chronologicalSessions.findIndex(s => new Date(s.created_at).getTime() > resetTime);
    if (nextSessionIndex === -1) return null; // Reset happened after all sessions
    // Place it slightly before the session
    return Math.max(0, nextSessionIndex - 0.5);
  }).filter(v => v !== null) as number[];

  return (
    <View style={styles.chartCard}>
      <View style={styles.chartHeader}>
        <Text style={styles.chartTitle}>SUDS Trend (Post-Session)</Text>
      </View>
      <View style={styles.chartWrapper}>
        <Svg width={chartWidth} height={chartHeight}>
          <Defs>
            <LinearGradient id="fillSuds" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={Colors.brand} stopOpacity="0.2" />
              <Stop offset="1" stopColor={Colors.brand} stopOpacity="0" />
            </LinearGradient>
          </Defs>

          <G opacity="0.05">
            {[0, 2, 4, 6, 8, 10].map(i => (
              <Line 
                key={i} 
                x1="0" y1={getY(i)} x2={chartWidth} y2={getY(i)} 
                stroke={Colors.textPrimary} strokeWidth="1" 
              />
            ))}
          </G>

          {resetLines.map((xIndex, i) => {
             const cx = getX(xIndex);
             return (
               <G key={`reset-${i}`}>
                 <Line 
                   x1={cx} y1={0} x2={cx} y2={chartHeight}
                   stroke={Colors.amber} strokeWidth="1.5" strokeDasharray="4 4"
                   opacity="0.8"
                 />
                 <Circle cx={cx} cy={10} r={8} fill={Colors.surface} stroke={Colors.amber} strokeWidth="1.5" />
                 <Path d={`M ${cx-3} ${7} A 2.5 2.5 0 1 1 ${cx-3} ${13} L ${cx-3} ${10} L ${cx-5} ${12} M ${cx-3} ${10} L ${cx-1} ${12}`} stroke={Colors.amber} strokeWidth="1.5" fill="none" />
               </G>
             );
          })}

          <Path d={areaPath} fill="url(#fillSuds)" />
          <Path 
            d={actualPath} 
            fill="none" 
            stroke={Colors.brand} 
            strokeWidth="3" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />

          {pathPoints.map((pt, i) => (
            <Circle key={`pt-${i}`} cx={pt.x} cy={pt.y} r="4" fill={Colors.surface} stroke={Colors.brand} strokeWidth="2" />
          ))}
        </Svg>
      </View>
      <View style={styles.chartLegend}>
         <View style={styles.legendItem}>
             <View style={[styles.legendDot, { backgroundColor: Colors.brand }]} />
             <Text style={styles.legendText}>SUDS</Text>
         </View>
         <View style={styles.legendItem}>
             <Icon name="rotate-ccw" size={12} color={Colors.amber} style={{ marginRight: 4 }} />
             <Text style={styles.legendText}>Target Reset</Text>
         </View>
      </View>
    </View>
  );
};

export const AgoraphobiaStatsScreen = ({ navigation }: any) => {
  const { steps, sessions, thoughtRecords, resets } = useAgoraphobiaStore();

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

        {/* SUDS Trend Chart with resets */}
        <Animated.View entering={FadeInDown.delay(250)}>
          <SUDSTrendChart sessions={completedSessions} resets={resets} />
        </Animated.View>

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
  chartCard: { backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, padding: Spacing.xl, marginTop: Spacing.l, borderWidth: 1, borderColor: Colors.borderLight, ...Shadows.card },
  chartHeader: { marginBottom: Spacing.l },
  chartTitle: { ...Typography.heading, fontSize: 16, color: Colors.textSecondary, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  chartWrapper: { alignItems: 'center', justifyContent: 'center', marginVertical: Spacing.s },
  chartLegend: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.l, gap: Spacing.xl },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { ...Typography.micro, color: Colors.textSecondary, fontWeight: '700', fontSize: 11 },
});
