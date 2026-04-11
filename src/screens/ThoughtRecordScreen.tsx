import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, Pressable,
  KeyboardAvoidingView, Platform, Alert, Modal,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Feather';
import { Layout } from '../components/ui/Layout';
import { Button } from '../components/ui/Button';
import { FearProfileChip } from '../components/agoraphobia/FearProfileChip';
import { AIInsightCard } from '../components/agoraphobia/AIInsightCard';
import { useAgoraphobiaStore } from '../store/agoraphobiaStore';
import { generateId, is7ColUnlocked } from '../engine/agoraphobiaEngine';
import { getAIReframe } from '../services/AIReframingService';
import { getQuickSaveTip, getMilestoneSummary, isMilestone } from '../services/AIProgressInsightsService';
import { ThoughtRecord, EmotionEntry } from '../models/ThoughtRecord';
import { Colors, Typography, Spacing, Shadows } from '../theme';

const DISTORTIONS = [
  'Catastrophizing', 'Mind Reading', 'Fortune Telling',
  'Black-and-White', 'Overgeneralizing', 'Personalization',
  'Emotional Reasoning', 'Should Statements', 'Labelling',
  'Discounting Positives',
];

const EMOTIONS = [
  'Anxious', 'Fearful', 'Panicked', 'Overwhelmed',
  'Frustrated', 'Sad', 'Ashamed', 'Hopeless',
  'Angry', 'Relieved', 'Proud', 'Calm',
];

const post_emotions_exist = (pe: EmotionEntry[]) => pe && pe.length > 0;

export const ThoughtRecordScreen = ({ navigation, route }: any) => {
  const { viewRecordId, sessionId } = route.params || {};
  const { thoughtRecords, fearProfile, saveThoughtRecord, deleteThoughtRecord, updateThoughtRecord } = useAgoraphobiaStore();
  const isReviewMode = !!viewRecordId;
  const show7Col = is7ColUnlocked(thoughtRecords.length);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const [situation, setSituation] = useState('');
  const [bodySensations, setBodySensations] = useState('');
  const [emotions, setEmotions] = useState<EmotionEntry[]>([]);
  const [autoThoughts, setAutoThoughts] = useState('');
  const [distortions, setDistortions] = useState<string[]>([]);
  const [altResponse, setAltResponse] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  // 7-col
  const [supportingFacts, setSupportingFacts] = useState('');
  const [contradictingFacts, setContradictingFacts] = useState('');
  const [balanced, setBalanced] = useState('');
  const [postEmotions, setPostEmotions] = useState<EmotionEntry[]>([]);

  // AI Insight modal state
  const [insightVisible, setInsightVisible] = useState(false);
  const [insightTip, setInsightTip] = useState('');
  const [insightMilestone, setInsightMilestone] = useState('');
  const [insightMilestoneCount, setInsightMilestoneCount] = useState(0);

  // Load existing record
  React.useEffect(() => {
    if (viewRecordId) {
      const record = thoughtRecords.find(r => r.id === viewRecordId);
      if (record) {
        setSituation(record.situation || '');
        setBodySensations(record.body_sensations || '');
        setEmotions(record.emotions || []);
        setAutoThoughts(record.automatic_thoughts || '');
        setDistortions(record.cognitive_distortions || []);
        setAltResponse(record.alternative_response || '');
        setAiResponse(record.ai_suggested_response || '');
        setSupportingFacts(record.supporting_facts || '');
        setContradictingFacts(record.contradicting_facts || '');
        setBalanced(record.balanced_perspective || '');
        setPostEmotions(record.post_emotions || []);
      }
    }
  }, [viewRecordId]);

  const toggleEmotion = useCallback((name: string, list: EmotionEntry[], setter: (v: EmotionEntry[]) => void) => {
    const exists = list.find(e => e.name === name);
    if (exists) setter(list.filter(e => e.name !== name));
    else setter([...list, { name, intensity: 50 }]);
  }, []);

  const toggleDistortion = useCallback((d: string) => {
    setDistortions(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
  }, []);

  const handleAIReframe = async () => {
    if (!autoThoughts.trim()) {
      Alert.alert('Write your thoughts first', 'AI needs your automatic thoughts to suggest a reframe.');
      return;
    }
    setAiLoading(true);
    const result = await getAIReframe(autoThoughts, distortions, fearProfile || undefined);
    setAiResponse(result);
    setAiLoading(false);
  };

  const handleSave = async () => {
    if (!situation.trim() && !autoThoughts.trim()) {
      Alert.alert('Add some content', 'Write at least a situation or your automatic thoughts.');
      return;
    }
    setLoading(true);
    try {
      if (isReviewMode) {
        await updateThoughtRecord(viewRecordId, {
          situation,
          body_sensations: bodySensations,
          emotions,
          automatic_thoughts: autoThoughts,
          cognitive_distortions: distortions,
          alternative_response: altResponse,
          ai_suggested_response: aiResponse || undefined,
          supporting_facts: show7Col ? supportingFacts : undefined,
          contradicting_facts: show7Col ? contradictingFacts : undefined,
          balanced_perspective: show7Col ? balanced : undefined,
          post_emotions: postEmotions,
        });
        navigation.goBack();
      } else {
        const record: ThoughtRecord = {
          id: generateId(),
          session_id: sessionId,
          format: show7Col ? '7col' : '5col',
          date: new Date().toISOString(),
          situation,
          body_sensations: bodySensations,
          emotions,
          automatic_thoughts: autoThoughts,
          cognitive_distortions: distortions,
          alternative_response: altResponse,
          ai_suggested_response: aiResponse || undefined,
          supporting_facts: show7Col ? supportingFacts : undefined,
          contradicting_facts: show7Col ? contradictingFacts : undefined,
          balanced_perspective: show7Col ? balanced : undefined,
          post_emotions: postEmotions,
          created_at: new Date().toISOString(),
        };
        await saveThoughtRecord(record);

        // Generate AI insights after saving
        const newCount = thoughtRecords.length + 1;
        const allRecords = [record, ...thoughtRecords];

        // Always get a quick tip
        const tip = await getQuickSaveTip(record, allRecords, fearProfile);
        setInsightTip(tip);

        // Check for milestone
        if (isMilestone(newCount)) {
          const summary = await getMilestoneSummary(allRecords, fearProfile);
          setInsightMilestone(summary);
          setInsightMilestoneCount(newCount);
        } else {
          setInsightMilestone('');
          setInsightMilestoneCount(0);
        }

        setInsightVisible(true);
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to save.');
    } finally {
      setLoading(false);
    }
  };

  const handleDismissInsight = () => {
    setInsightVisible(false);
    navigation.goBack();
  };

  return (
    <Layout>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <View style={styles.topBar}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
            <Icon name="arrow-left" size={24} color={Colors.textPrimary} />
          </Pressable>
          <Text style={styles.topTitle}>{isReviewMode ? 'Review Record' : 'Thought Record'}</Text>
          <View style={styles.topActions}>
            {isReviewMode && (
              <Pressable 
                onPress={() => {
                  Alert.alert(
                    "Delete Record", 
                    "Are you sure you want to delete this session from your history?",
                    [
                      { text: "Cancel", style: "cancel" },
                      { 
                        text: "Delete", 
                        style: "destructive", 
                        onPress: async () => {
                          await deleteThoughtRecord(viewRecordId);
                          navigation.goBack();
                        }
                      }
                    ]
                  );
                }} 
                hitSlop={12}
                style={styles.deleteBtn}
              >
                <Icon name="trash-2" size={20} color={Colors.error} />
              </Pressable>
            )}
            <View style={styles.formatBadge}>
              <Text style={styles.formatText}>{show7Col ? '7-COL' : '5-COL'}</Text>
            </View>
          </View>
        </View>

        <ScrollView 
          contentContainerStyle={styles.scroll} 
          showsVerticalScrollIndicator={false} 
          keyboardShouldPersistTaps="handled"
          bounces={false}
          overScrollMode="never"
        >
          {isReviewMode && (
            <Animated.View entering={FadeInDown.delay(100)} style={styles.reviewSummary}>
              <View style={styles.reviewHeader}>
                <Icon name="activity" size={20} color={Colors.brand} />
                <Text style={styles.reviewTitle}>Session Reflection</Text>
              </View>
              <Text style={styles.reviewText}>
                You recorded this thought on {new Date(thoughtRecords.find(r => r.id === viewRecordId)?.date || '').toLocaleDateString()}. 
                Reviewing past patterns helps build long-term cognitive flexibility.
              </Text>
              
              {/* Emotion Contrast */}
              {emotions.length > 0 && post_emotions_exist(postEmotions) && (
                <View style={styles.emotionContrast}>
                  <View style={styles.contrastItem}>
                    <Text style={styles.contrastLabel}>INITIAL</Text>
                    <Text style={styles.contrastValue}>{emotions[0].name}</Text>
                  </View>
                  <Icon name="chevrons-right" size={20} color={Colors.textTertiary} />
                  <View style={styles.contrastItem}>
                    <Text style={styles.contrastLabel}>POST-REFRAME</Text>
                    <Text style={[styles.contrastValue, { color: Colors.brand }]}>
                      {postEmotions.length > 0 ? postEmotions[0].name : 'Calmer'}
                    </Text>
                  </View>
                </View>
              )}
            </Animated.View>
          )}

          {/* 1. Situation */}
          <Section title="1. Situation" hint="What happened? Where were you?">
            <TextInput style={styles.input} value={situation} onChangeText={setSituation} placeholder="Describe the situation..." placeholderTextColor={Colors.textTertiary} multiline />
          </Section>

          {/* 2. Body Sensations */}
          <Section title="2. Body Sensations" hint="What did you feel physically?">
            <TextInput style={styles.input} value={bodySensations} onChangeText={setBodySensations} placeholder="e.g., Racing heart, sweating..." placeholderTextColor={Colors.textTertiary} multiline />
          </Section>

          {/* 3. Emotions */}
          <Section title="3. Emotions" hint="What emotions came up?">
            <View style={styles.chipGrid}>
              {EMOTIONS.map(e => (
                <FearProfileChip key={e} label={e} selected={!!emotions.find(em => em.name === e)} onToggle={() => toggleEmotion(e, emotions, setEmotions)} />
              ))}
            </View>
          </Section>

          {/* 4. Automatic Thoughts */}
          <Section title="4. Automatic Thoughts" hint="What went through your mind?">
            <TextInput style={styles.inputLarge} value={autoThoughts} onChangeText={setAutoThoughts} placeholder="e.g., Everyone is staring at me..." placeholderTextColor={Colors.textTertiary} multiline textAlignVertical="top" />
          </Section>

          {/* 5. Cognitive Distortions */}
          <Section title="5. Cognitive Distortions" hint="Which thinking traps apply?">
            <View style={styles.chipGrid}>
              {DISTORTIONS.map(d => (
                <FearProfileChip key={d} label={d} selected={distortions.includes(d)} onToggle={() => toggleDistortion(d)} />
              ))}
            </View>
          </Section>

          {/* 7-col extra columns */}
          {show7Col && (
            <>
              <Section title="6. Supporting Evidence" hint="Facts that support the automatic thought">
                <TextInput style={styles.input} value={supportingFacts} onChangeText={setSupportingFacts} placeholder="What evidence supports this?" placeholderTextColor={Colors.textTertiary} multiline />
              </Section>
              <Section title="7. Contradicting Evidence" hint="Facts against the automatic thought">
                <TextInput style={styles.input} value={contradictingFacts} onChangeText={setContradictingFacts} placeholder="What evidence contradicts this?" placeholderTextColor={Colors.textTertiary} multiline />
              </Section>
            </>
          )}

          {/* Alternative Response */}
          <Section title={show7Col ? '8. Balanced Perspective' : '6. Alternative Response'} hint="A more balanced way to view this">
            <TextInput style={styles.inputLarge} value={show7Col ? balanced : altResponse} onChangeText={show7Col ? setBalanced : setAltResponse} placeholder="What's a more balanced take?" placeholderTextColor={Colors.textTertiary} multiline textAlignVertical="top" />

            {/* AI Reframe */}
            <Pressable onPress={handleAIReframe} style={styles.aiButton} disabled={aiLoading}>
              <Icon name="cpu" size={16} color={Colors.purple} />
              <Text style={styles.aiButtonText}>{aiLoading ? 'Thinking...' : 'Suggest AI reframe'}</Text>
            </Pressable>
            {aiResponse ? (
              <Animated.View entering={FadeInDown.duration(300)} style={styles.aiCard}>
                <Text style={styles.aiLabel}>AI SUGGESTION</Text>
                <Text style={styles.aiText}>{aiResponse}</Text>
                <Pressable onPress={() => { show7Col ? setBalanced(aiResponse) : setAltResponse(aiResponse); }} style={styles.useButton}>
                  <Text style={styles.useText}>Use this →</Text>
                </Pressable>
              </Animated.View>
            ) : null}
          </Section>

          {/* Post emotions */}
          <Section title={show7Col ? '9. Post Emotions' : '7. Post Emotions'} hint="How do you feel after reframing?">
            <View style={styles.chipGrid}>
              {EMOTIONS.map(e => (
                <FearProfileChip key={e} label={e} selected={!!postEmotions.find(em => em.name === e)} onToggle={() => toggleEmotion(e, postEmotions, setPostEmotions)} />
              ))}
            </View>
          </Section>

          {/* Unlock hint */}
          {!show7Col && (
            <View style={styles.unlockHint}>
              <Icon name="lock" size={14} color={Colors.textTertiary} />
              <Text style={styles.unlockText}>{10 - thoughtRecords.length} more records to unlock 7-column format</Text>
            </View>
          )}

          <Button 
            title={isReviewMode ? "Update Changes" : "Save Record"} 
            onPress={handleSave} 
            loading={loading} 
            style={{ marginTop: Spacing.l }} 
          />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* AI Insight Modal — shown after save */}
      <Modal
        visible={insightVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={handleDismissInsight}
      >
        <Pressable style={styles.insightOverlay} onPress={handleDismissInsight}>
          <View style={styles.insightContainer}>
            {/* Success checkmark */}
            <Animated.View entering={FadeInDown.duration(300)} style={styles.successCircle}>
              <Icon name="check" size={28} color={Colors.brand} />
            </Animated.View>
            <Text style={styles.savedTitle}>Record Saved</Text>

            {/* Quick Tip — always shown */}
            {insightTip ? (
              <AIInsightCard type="tip" message={insightTip} />
            ) : null}

            {/* Milestone Summary — shown at milestones */}
            {insightMilestone ? (
              <AIInsightCard
                type="milestone"
                message={insightMilestone}
                milestoneCount={insightMilestoneCount}
              />
            ) : null}

            <Pressable onPress={handleDismissInsight} style={styles.dismissBtn}>
              <Text style={styles.dismissText}>Continue →</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </Layout>
  );
};

const Section = React.memo(({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <Text style={styles.sectionHint}>{hint}</Text>
    {children}
  </View>
));

const styles = StyleSheet.create({
  flex: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.xl, paddingVertical: Spacing.m },
  topTitle: { ...Typography.heading, color: Colors.textPrimary },
  topActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.m },
  deleteBtn: { padding: 4 },
  formatBadge: { backgroundColor: Colors.brandLight, paddingVertical: 3, paddingHorizontal: Spacing.s, borderRadius: 8 },
  formatText: { ...Typography.micro, color: Colors.brand },
  scroll: { paddingHorizontal: Spacing.xl, paddingBottom: 120 },
  section: { marginBottom: Spacing.xl },
  sectionTitle: { ...Typography.label, color: Colors.textPrimary, marginBottom: 2 },
  sectionHint: { ...Typography.caption, color: Colors.textTertiary, marginBottom: Spacing.m, fontStyle: 'italic' },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.s },
  input: { backgroundColor: Colors.surface, borderRadius: 12, padding: Spacing.m, borderWidth: 1, borderColor: Colors.border, ...Typography.body, color: Colors.textPrimary, minHeight: 50 },
  inputLarge: { backgroundColor: Colors.surface, borderRadius: 12, padding: Spacing.m, borderWidth: 1, borderColor: Colors.border, ...Typography.body, color: Colors.textPrimary, minHeight: 100 },
  aiButton: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginTop: Spacing.m, paddingVertical: Spacing.s, paddingHorizontal: Spacing.m, backgroundColor: Colors.purpleLight, borderRadius: 10, alignSelf: 'flex-start' },
  aiButtonText: { ...Typography.caption, color: Colors.purple, fontWeight: '600' },
  aiCard: { backgroundColor: Colors.surface, borderRadius: 12, padding: Spacing.l, marginTop: Spacing.m, borderWidth: 1, borderColor: Colors.purple + '30' },
  aiLabel: { ...Typography.micro, color: Colors.purple, marginBottom: Spacing.s, letterSpacing: 1 },
  aiText: { ...Typography.body, color: Colors.textPrimary, lineHeight: 22 },
  useButton: { marginTop: Spacing.m, alignSelf: 'flex-end' },
  useText: { ...Typography.caption, color: Colors.brand, fontWeight: '700' },
  unlockHint: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, justifyContent: 'center', paddingVertical: Spacing.m },
  unlockText: { ...Typography.caption, color: Colors.textTertiary },
  // AI Insight Modal
  insightOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  insightContainer: {
    backgroundColor: Colors.background,
    borderRadius: 24,
    padding: Spacing.xl,
    width: '100%',
    maxWidth: 400,
    gap: 16,
    alignItems: 'center',
  },
  successCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.brandLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.brand + '30',
  },
  savedTitle: {
    ...Typography.heading,
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: '800',
  },
  dismissBtn: {
    backgroundColor: Colors.brand,
    paddingVertical: Spacing.m,
    paddingHorizontal: Spacing.xxl,
    borderRadius: 99,
    marginTop: 4,
  },
  dismissText: {
    color: Colors.surface,
    fontWeight: '800',
    fontSize: 15,
  },
  // Review Mode Styles
  reviewSummary: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: Spacing.l,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.soft,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.s,
  },
  reviewTitle: {
    ...Typography.label,
    color: Colors.textPrimary,
    fontWeight: '800',
  },
  reviewText: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  emotionContrast: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.brandLight,
    padding: Spacing.m,
    borderRadius: 12,
    marginTop: Spacing.m,
  },
  contrastItem: {
    alignItems: 'center',
    flex: 1,
  },
  contrastLabel: {
    ...Typography.micro,
    color: Colors.textTertiary,
    marginBottom: 4,
  },
  contrastValue: {
    ...Typography.label,
    color: Colors.textPrimary,
    fontWeight: '800',
  },
});
