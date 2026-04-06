import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Feather';
import { Layout } from '../components/ui/Layout';
import { Button } from '../components/ui/Button';
import { ExposureStepCard } from '../components/agoraphobia/ExposureStepCard';
import { useAgoraphobiaStore } from '../store/agoraphobiaStore';
import { generateId } from '../engine/agoraphobiaEngine';
import { EXPOSURE_TEMPLATES, ExposureTemplate } from '../data/exposureTemplates';
import { Colors, Typography, Spacing, Shadows } from '../theme';
import { ExposureStep } from '../models/ExposureStep';

export const ExposureLadderScreen = ({ navigation }: any) => {
  const { steps, sessions, addStep, deleteStep, reorderSteps } = useAgoraphobiaStore();
  const [showTemplates, setShowTemplates] = useState(steps.length === 0);

  const sessionCounts = useMemo(() => {
    const map: Record<string, number> = {};
    sessions.forEach(s => {
      if (s.status === 'completed') {
        map[s.step_id] = (map[s.step_id] || 0) + 1;
      }
    });
    return map;
  }, [sessions]);

  const currentStepId = useMemo(
    () => steps.find(s => s.is_unlocked && !s.is_mastered)?.id,
    [steps]
  );

  const handleSelectTemplate = async (template: ExposureTemplate) => {
    if (template.id === 'tpl_custom') {
      setShowTemplates(false);
      // TODO: open custom step creator
      return;
    }

    Alert.alert(
      template.goal,
      `This will add ${template.steps.length} steps to your ladder. Continue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add Steps',
          onPress: async () => {
            for (let i = 0; i < template.steps.length; i++) {
              const ts = template.steps[i];
              const step: ExposureStep = {
                id: generateId(),
                track: 'agoraphobia',
                name: ts.name,
                description: ts.description,
                location_hint: ts.location_hint,
                template_id: template.id,
                ladder_position: steps.length + i,
                initial_suds_estimate: ts.initial_suds_estimate,
                current_difficulty: ts.difficulty_value,
                baseline_difficulty: ts.difficulty_value,
                difficulty_unit: ts.difficulty_unit,
                difficulty_value: ts.difficulty_value,
                mastery_count: 0,
                is_mastered: false,
                is_unlocked: i === 0,
                safety_signals: [],
                is_active: true,
                created_at: new Date().toISOString(),
              };
              await addStep(step);
            }
            setShowTemplates(false);
          },
        },
      ]
    );
  };

  const handleDeleteStep = (step: ExposureStep) => {
    Alert.alert(
      'Remove Step',
      `Remove "${step.name}" from your ladder?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => deleteStep(step.id) },
      ]
    );
  };

  if (showTemplates) {
    return (
      <Layout>
        <View style={styles.topBar}>
          <Pressable onPress={() => steps.length > 0 ? setShowTemplates(false) : navigation.goBack()} hitSlop={12}>
            <Icon name="arrow-left" size={24} color={Colors.textPrimary} />
          </Pressable>
          <Text style={styles.topBarTitle}>Choose a Programme</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.templateIntro}>
            Pick a template to start your exposure ladder, or build one from scratch.
          </Text>

          {EXPOSURE_TEMPLATES.map((t, index) => (
            <Animated.View key={t.id} entering={FadeInDown.delay(index * 80)}>
              <Pressable
                onPress={() => handleSelectTemplate(t)}
                style={({ pressed }) => [styles.templateCard, pressed && styles.pressed]}
              >
                <Text style={styles.templateIcon}>{t.icon}</Text>
                <View style={styles.templateContent}>
                  <Text style={styles.templateGoal}>{t.goal}</Text>
                  <Text style={styles.templateDesc}>{t.description}</Text>
                  {t.steps.length > 0 && (
                    <Text style={styles.templateStepCount}>
                      {t.steps.length} steps · SUDS {t.steps[0].initial_suds_estimate}–{t.steps[t.steps.length - 1].initial_suds_estimate}
                    </Text>
                  )}
                </View>
                <Icon name="chevron-right" size={20} color={Colors.textTertiary} />
              </Pressable>
            </Animated.View>
          ))}
        </ScrollView>
      </Layout>
    );
  }

  return (
    <Layout>
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Icon name="arrow-left" size={24} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.topBarTitle}>Exposure Ladder</Text>
        <Pressable onPress={() => setShowTemplates(true)} hitSlop={12}>
          <Icon name="plus" size={24} color={Colors.brand} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {steps.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="layers" size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyText}>No steps yet</Text>
            <Button title="Add from templates" onPress={() => setShowTemplates(true)} />
          </View>
        ) : (
          <>
            {/* Summary */}
            <View style={styles.summaryRow}>
              <Text style={styles.summaryText}>
                {steps.filter(s => s.is_mastered).length}/{steps.length} mastered
              </Text>
            </View>

            {/* Step list */}
            {steps.map((step, index) => (
              <Animated.View key={step.id} entering={FadeInDown.delay(index * 50)}>
                <ExposureStepCard
                  step={step}
                  sessionCount={sessionCounts[step.id] || 0}
                  isLocked={!step.is_unlocked}
                  isCurrent={step.id === currentStepId}
                  onPress={() => {
                    if (step.is_unlocked) {
                      navigation.navigate('ActiveSession', { stepId: step.id });
                    }
                  }}
                  onEdit={() => handleDeleteStep(step)}
                />
              </Animated.View>
            ))}
          </>
        )}
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
  topBarTitle: {
    ...Typography.heading,
    color: Colors.textPrimary,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: 120,
  },
  templateIntro: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
  templateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.l,
    marginBottom: Spacing.m,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.m,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  templateIcon: {
    fontSize: 32,
  },
  templateContent: {
    flex: 1,
  },
  templateGoal: {
    ...Typography.label,
    color: Colors.textPrimary,
    fontSize: 15,
  },
  templateDesc: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  templateStepCount: {
    ...Typography.micro,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
  },
  summaryRow: {
    marginBottom: Spacing.l,
  },
  summaryText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
    gap: Spacing.l,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textTertiary,
  },
});
