import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert,
  KeyboardAvoidingView, Platform, Linking,
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Feather';
import { Layout } from '../components/ui/Layout';
import { Button } from '../components/ui/Button';
import { SUDSSlider } from '../components/agoraphobia/SUDSSlider';
import { SessionTimer } from '../components/agoraphobia/SessionTimer';
import { CrisisButton, CrisisBanner } from '../components/agoraphobia/CrisisButton';
import { SessionProjectionHint } from '../components/agoraphobia/SessionProjectionHint';
import { useAgoraphobiaStore } from '../store/agoraphobiaStore';
import {
  generateId,
  getSUDSLabel,
  detectCrisisLanguage,
  generateSessionCoachingNudge,
} from '../engine/agoraphobiaEngine';
import { Colors, Typography, Spacing } from '../theme';
import { ExposureSession, SUDSEntry } from '../models/ExposureSession';

type Phase = 'pre' | 'active' | 'post';

export const ActiveSessionScreen = ({ navigation, route }: any) => {
  const { stepId, mode: initialMode = 'active' } = route.params || {};
  const { steps, fearProfile, startSession, updateSession, completeSession, abortSession } = useAgoraphobiaStore();

  const step = useMemo(() => steps.find(s => s.id === stepId), [steps, stepId]);

  const [phase, setPhase] = useState<Phase>('pre');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [preSuds, setPreSuds] = useState(step?.initial_suds_estimate ?? 5);
  const [postSuds, setPostSuds] = useState(0);
  const [notes, setNotes] = useState('');
  const [sudsLog, setSudsLog] = useState<SUDSEntry[]>([]);
  const [startedAt, setStartedAt] = useState<string>('');
  const [showCrisisBanner, setShowCrisisBanner] = useState(false);
  const [isRetro] = useState(initialMode === 'retrospective');
  const [retroDuration, setRetroDuration] = useState('');

  const handleNotesChange = useCallback((text: string) => {
    setNotes(text);
    if (detectCrisisLanguage(text)) {
      setShowCrisisBanner(true);
    }
  }, []);

  const handleCrisisPress = useCallback(() => {
    if (!fearProfile?.crisis_helpline_number && !fearProfile?.emergency_contact_number) {
      Alert.alert(
        'Support Contacts',
        'Set up your emergency contacts in Settings → Fear Profile.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    const buttons: any[] = [];
    if (fearProfile.crisis_helpline_number) {
      buttons.push({
        text: 'Call Crisis Line',
        onPress: () => Linking.openURL(`tel:${fearProfile.crisis_helpline_number}`),
      });
    }
    if (fearProfile.emergency_contact_number) {
      buttons.push({
        text: `Call ${fearProfile.emergency_contact_name || 'Emergency Contact'}`,
        onPress: () => Linking.openURL(`tel:${fearProfile.emergency_contact_number}`),
      });
    }
    buttons.push({ text: "I'm safe, close", style: 'cancel' });

    Alert.alert(
      'Need Support?',
      'Your wellbeing matters. Choose an option below.',
      buttons
    );
  }, [fearProfile]);

  const handleStart = async () => {
    if (!step) return;
    const id = generateId();
    const now = new Date().toISOString();
    setSessionId(id);
    setStartedAt(now);

    const session: ExposureSession = {
      id,
      step_id: step.id,
      mode: isRetro ? 'retrospective' : 'active',
      status: 'in_progress',
      started_at: now,
      pre_suds: preSuds,
      suds_log: [],
      external_signals_active: [],
      internal_signals_active: [],
      safety_signals_used: [],
      difficulty_at_session: step.difficulty_value,
      created_at: now,
    };
    await startSession(session);
    setPhase(isRetro ? 'post' : 'active');
  };

  const handleLogSuds = () => {
    const entry: SUDSEntry = { timestamp: new Date().toISOString(), suds: preSuds };
    const newLog = [...sudsLog, entry];
    setSudsLog(newLog);
    if (sessionId) {
      updateSession(sessionId, { suds_log: newLog });
    }
  };

  const handleComplete = () => {
    setPhase('post');
  };

  const handleFinish = async () => {
    if (!sessionId) return;
    const duration = isRetro ? parseInt(retroDuration, 10) * 60 : undefined;
    if (isRetro && duration) {
      await updateSession(sessionId, { duration_seconds: duration });
    }
    await completeSession(sessionId, postSuds, notes);

    navigation.replace('SessionReview', { sessionId });
  };

  const handleAbort = () => {
    Alert.alert(
      'End Early?',
      'Missing once is an accident. Missing twice is a pattern. You can always try again.',
      [
        { text: 'Keep Going', style: 'cancel' },
        {
          text: 'End Session',
          onPress: async () => {
            if (sessionId) await abortSession(sessionId);
            navigation.goBack();
          },
        },
      ]
    );
  };

  if (!step) {
    return (
      <Layout>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Step not found</Text>
          <Button title="Go Back" onPress={() => navigation.goBack()} />
        </View>
      </Layout>
    );
  }

  return (
    <Layout>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        {/* Top bar */}
        <View style={styles.topBar}>
          <Pressable onPress={phase === 'pre' ? () => navigation.goBack() : handleAbort} hitSlop={12}>
            <Icon name={phase === 'pre' ? 'arrow-left' : 'x'} size={24} color={Colors.textPrimary} />
          </Pressable>
          <Text style={styles.topBarTitle}>{step.name}</Text>
          <View style={styles.modeBadge}>
            <Text style={styles.modeText}>{isRetro ? 'RETRO' : 'LIVE'}</Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ═══ PRE-SESSION ═══ */}
          {phase === 'pre' && (
            <Animated.View entering={FadeIn.duration(300)}>
              <Text style={styles.phaseTitle}>Before you begin</Text>
              <Text style={styles.phaseSubtitle}>
                Rate how anxious you feel right now.
              </Text>

              <SUDSSlider
                value={preSuds}
                onChange={setPreSuds}
                label="Current anxiety level (SUDS)"
                showCoachingLabel
              />

              {/* Step info */}
              <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <Icon name="target" size={16} color={Colors.brand} />
                  <Text style={styles.infoText}>
                    Target: {step.difficulty_value} {step.difficulty_unit}
                  </Text>
                </View>
                {step.location_hint && (
                  <View style={styles.infoRow}>
                    <Icon name="map-pin" size={16} color={Colors.brand} />
                    <Text style={styles.infoText}>{step.location_hint}</Text>
                  </View>
                )}
              </View>

              {(preSuds >= 9 || showCrisisBanner) && (
                <CrisisBanner onPress={handleCrisisPress} />
              )}

              <Button
                title={isRetro ? 'Log retrospective session' : 'Begin Exposure →'}
                onPress={handleStart}
                style={styles.startButton}
              />
            </Animated.View>
          )}

          {/* ═══ ACTIVE SESSION ═══ */}
          {phase === 'active' && (
            <Animated.View entering={FadeIn.duration(300)}>
              <SessionTimer startedAt={startedAt} isRunning={true} />

              {/* SUDS coaching label */}
              <View style={styles.activeSudsRow}>
                <Text style={styles.activeSudsLabel}>{getSUDSLabel(preSuds)}</Text>
              </View>

              {/* Log mid-session SUDS */}
              <View style={styles.midSudsCard}>
                <Text style={styles.midSudsTitle}>Check in: How do you feel now?</Text>
                <SUDSSlider value={preSuds} onChange={setPreSuds} showLabel={false} />
                <Button
                  title="Log SUDS Check-in"
                  onPress={handleLogSuds}
                  type="secondary"
                  style={{ marginTop: Spacing.m }}
                />
                {sudsLog.length > 0 && (
                  <Text style={styles.sudsLogCount}>
                    {sudsLog.length} check-in{sudsLog.length > 1 ? 's' : ''} logged
                  </Text>
                )}
              </View>

              {/* Notes */}
              <TextInput
                style={styles.notesInput}
                value={notes}
                onChangeText={handleNotesChange}
                placeholder="What are you noticing? (optional)"
                placeholderTextColor={Colors.textTertiary}
                multiline
                textAlignVertical="top"
              />

              {(preSuds >= 9 || showCrisisBanner) && (
                <CrisisBanner onPress={handleCrisisPress} />
              )}

              <Button
                title="Complete Session ✓"
                onPress={handleComplete}
                style={styles.completeButton}
              />
            </Animated.View>
          )}

          {/* ═══ POST-SESSION ═══ */}
          {phase === 'post' && (
            <Animated.View entering={FadeIn.duration(300)}>
              <Text style={styles.phaseTitle}>After exposure</Text>
              <Text style={styles.phaseSubtitle}>
                Rate how anxious you feel right now.
              </Text>

              <SUDSSlider
                value={postSuds}
                onChange={setPostSuds}
                label="Post-session anxiety (SUDS)"
                showCoachingLabel
              />

              {isRetro && (
                <View style={styles.retroDurationRow}>
                  <Text style={styles.inputLabel}>How long was the exposure? (minutes)</Text>
                  <TextInput
                    style={styles.durationInput}
                    value={retroDuration}
                    onChangeText={setRetroDuration}
                    placeholder="e.g., 15"
                    placeholderTextColor={Colors.textTertiary}
                    keyboardType="numeric"
                  />
                </View>
              )}

              {/* Notes */}
              <Text style={styles.inputLabel}>Reflection notes</Text>
              <TextInput
                style={styles.notesInput}
                value={notes}
                onChangeText={handleNotesChange}
                placeholder="What did you learn? What surprised you?"
                placeholderTextColor={Colors.textTertiary}
                multiline
                textAlignVertical="top"
              />

              {(postSuds >= 9 || showCrisisBanner) && (
                <CrisisBanner onPress={handleCrisisPress} />
              )}

            {!step.is_mastered && <SessionProjectionHint />}

              <Button
                title="Save Session"
                onPress={handleFinish}
              />
            </Animated.View>
          )}
        </ScrollView>

        {/* Crisis FAB */}
        <CrisisButton
          crisisNumber={fearProfile?.crisis_helpline_number}
          emergencyName={fearProfile?.emergency_contact_name}
          emergencyNumber={fearProfile?.emergency_contact_number}
          pulsing={showCrisisBanner}
        />
      </KeyboardAvoidingView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.m,
  },
  topBarTitle: {
    ...Typography.heading,
    color: Colors.textPrimary,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: Spacing.m,
  },
  modeBadge: {
    backgroundColor: Colors.brandLight,
    paddingVertical: 3,
    paddingHorizontal: Spacing.s,
    borderRadius: 8,
  },
  modeText: {
    ...Typography.micro,
    color: Colors.brand,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: 120,
  },
  phaseTitle: {
    ...Typography.title,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  phaseSubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.l,
    gap: Spacing.m,
    marginTop: Spacing.l,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.s,
  },
  infoText: {
    ...Typography.body,
    color: Colors.textPrimary,
  },
  startButton: {
    marginTop: Spacing.xxl,
  },
  activeSudsRow: {
    alignItems: 'center',
    marginBottom: Spacing.l,
  },
  activeSudsLabel: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
  midSudsCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.l,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.l,
  },
  midSudsTitle: {
    ...Typography.label,
    color: Colors.textPrimary,
    marginBottom: Spacing.m,
  },
  sudsLogCount: {
    ...Typography.caption,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: Spacing.s,
  },
  notesInput: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.l,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Typography.body,
    color: Colors.textPrimary,
    minHeight: 100,
    marginBottom: Spacing.l,
  },
  completeButton: {
    marginTop: Spacing.m,
  },
  retroDurationRow: {
    marginBottom: Spacing.l,
  },
  inputLabel: {
    ...Typography.label,
    color: Colors.textPrimary,
    marginBottom: Spacing.s,
  },
  durationInput: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.m,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Typography.body,
    color: Colors.textPrimary,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.l,
  },
  errorText: {
    ...Typography.body,
    color: Colors.textTertiary,
  },
});
