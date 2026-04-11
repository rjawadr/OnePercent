import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Feather';
import { Layout } from '../components/ui/Layout';
import { Button } from '../components/ui/Button';
import { MasteryBadge } from '../components/agoraphobia/MasteryBadge';
import { useAgoraphobiaStore } from '../store/agoraphobiaStore';
import { isSessionMastered, generateSessionCoachingNudge } from '../engine/agoraphobiaEngine';
import { Colors, Typography, Spacing } from '../theme';

export const SessionReviewScreen = ({ navigation, route }: any) => {
  const { sessionId } = route.params || {};
  const { sessions, steps } = useAgoraphobiaStore();
  const session = useMemo(() => sessions.find(s => s.id === sessionId), [sessions, sessionId]);
  const step = useMemo(() => session ? steps.find(s => s.id === session.step_id) : null, [session, steps]);

  if (!session || !step) {
    return (
      <Layout>
        <View style={styles.center}>
          <Text style={styles.errorText}>Session not found</Text>
          <Button title="Go Home" onPress={() => navigation.navigate('AgoraphobiaHome')} />
        </View>
      </Layout>
    );
  }

  const mastered = isSessionMastered(session.post_suds ?? 10);
  const sudsChange = (session.pre_suds ?? 0) - (session.post_suds ?? 0);
  const nudge = generateSessionCoachingNudge(session.pre_suds ?? 0, session.post_suds ?? 0, step.name);
  const fmtDur = (s?: number) => { if (!s) return '—'; const m = Math.floor(s / 60); return m > 0 ? `${m}m ${s % 60}s` : `${s}s`; };

  return (
    <Layout>
      <ScrollView 
        contentContainerStyle={styles.scroll} 
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
      >
        <Animated.View entering={FadeInDown.delay(100)} style={styles.banner}>
          <Animated.View entering={ZoomIn.delay(300).duration(400)}>
            <View style={[styles.icon, mastered ? styles.iconMastered : styles.iconProgress]}>
              <Icon name={mastered ? 'award' : 'trending-up'} size={36} color={mastered ? Colors.brand : Colors.amber} />
            </View>
          </Animated.View>
          <Text style={styles.title}>{mastered ? 'Step Mastered' : 'Session Complete'}</Text>
          {mastered && <MasteryBadge size="large" />}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200)} style={styles.nudge}>
          <Text style={styles.nudgeText}>{nudge}</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300)} style={styles.card}>
          <Text style={styles.cardLabel}>SUDS SUMMARY</Text>
          <View style={styles.sudsRow}>
            <View style={styles.sudsItem}><Text style={styles.sudsVal}>{session.pre_suds ?? '—'}</Text><Text style={styles.sudsSub}>Before</Text></View>
            <Icon name={sudsChange > 0 ? 'arrow-down' : 'minus'} size={20} color={sudsChange > 0 ? Colors.brand : Colors.textTertiary} />
            <View style={styles.sudsItem}><Text style={[styles.sudsVal, mastered && {color: Colors.brand}]}>{session.post_suds ?? '—'}</Text><Text style={styles.sudsSub}>After</Text></View>
          </View>
          {sudsChange > 0 && <View style={styles.changeBadge}><Icon name="trending-down" size={14} color={Colors.brand}/><Text style={styles.changeText}>Dropped {sudsChange} pts</Text></View>}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400)} style={styles.card}>
          <Text style={styles.cardLabel}>DETAILS</Text>
          <View style={styles.detailRow}>
            <Icon name="clock" size={16} color={Colors.textSecondary} />
            <Text style={styles.detail}>Duration: {fmtDur(session.duration_seconds)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="target" size={16} color={Colors.textSecondary} />
            <Text style={styles.detail}>Difficulty: {session.difficulty_at_session} {step.difficulty_unit}</Text>
          </View>
          {session.next_difficulty && (
            <View style={styles.detailRow}>
              <Icon name="trending-up" size={16} color={Colors.brand} />
              <Text style={[styles.detail, {color: Colors.brand}]}>Next target: {session.next_difficulty} {step.difficulty_unit}</Text>
            </View>
          )}
          <View style={styles.detailRow}>
            <Icon name="award" size={16} color={Colors.textSecondary} />
            <Text style={styles.detail}>Mastery: {step.mastery_count}/2</Text>
          </View>
        </Animated.View>

        {session.notes && <Animated.View entering={FadeInDown.delay(500)} style={styles.card}><Text style={styles.cardLabel}>NOTES</Text><Text style={styles.notes}>{session.notes}</Text></Animated.View>}

        <View style={styles.actions}>
          <Button title="Write Thought Record" onPress={() => navigation.navigate('ThoughtRecord', { sessionId: session.id })} type="secondary" />
          <Button title="Back to Home" onPress={() => navigation.navigate('AgoraphobiaHome')} />
        </View>
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: Spacing.xl, paddingBottom: 120 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.l },
  errorText: { ...Typography.body, color: Colors.textTertiary },
  banner: { alignItems: 'center', paddingVertical: Spacing.xxl, gap: Spacing.m },
  icon: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  iconMastered: { backgroundColor: Colors.brandLight },
  iconProgress: { backgroundColor: Colors.amberLight },
  title: { ...Typography.h1, color: Colors.textPrimary },
  nudge: { backgroundColor: Colors.surface, borderRadius: 16, padding: Spacing.l, marginBottom: Spacing.l, borderLeftWidth: 3, borderLeftColor: Colors.brand },
  nudgeText: { ...Typography.body, color: Colors.textPrimary, fontStyle: 'italic', lineHeight: 22 },
  card: { backgroundColor: Colors.surface, borderRadius: 16, padding: Spacing.l, marginBottom: Spacing.m, borderWidth: 1, borderColor: Colors.border },
  cardLabel: { ...Typography.micro, color: Colors.textTertiary, marginBottom: Spacing.m, letterSpacing: 1 },
  sudsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.l },
  sudsItem: { alignItems: 'center' },
  sudsVal: { fontSize: 36, fontWeight: '800', color: Colors.textPrimary },
  sudsSub: { ...Typography.micro, color: Colors.textTertiary, marginTop: 2 },
  changeBadge: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, justifyContent: 'center', marginTop: Spacing.m, backgroundColor: Colors.brandLight, paddingVertical: Spacing.xs, paddingHorizontal: Spacing.m, borderRadius: 12, alignSelf: 'center' },
  changeText: { ...Typography.caption, color: Colors.brand, fontWeight: '600' },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.s, marginBottom: Spacing.s },
  detail: { ...Typography.body, color: Colors.textPrimary },
  notes: { ...Typography.body, color: Colors.textSecondary, lineHeight: 22 },
  actions: { gap: Spacing.m, marginTop: Spacing.l },
});
