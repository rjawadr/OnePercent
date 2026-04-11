import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, Animated as RNAnimated, Modal, FlatList } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Layout } from '../components/ui/Layout';
import { Button } from '../components/ui/Button';
import { ExposureStepCard } from '../components/agoraphobia/ExposureStepCard';
import { useAgoraphobiaStore } from '../store/agoraphobiaStore';
import { generateId } from '../engine/agoraphobiaEngine';
import { EXPOSURE_TEMPLATES, ExposureTemplate } from '../data/exposureTemplates';
import { Colors, Typography, Spacing, Shadows } from '../theme';
import { ExposureStep } from '../models/ExposureStep';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from '@react-native-community/blur';
import { ResetTargetBottomSheet } from '../components/agoraphobia/ResetTargetBottomSheet';

export const ExposureLadderScreen = ({ navigation, route }: any) => {
  const insets = useSafeAreaInsets();
  const { steps, sessions, addStep, deleteStep, reorderSteps, initialize, isInitialized } = useAgoraphobiaStore();
  const [showTemplates, setShowTemplates] = useState(
    steps.length === 0 || route.params?.initialShowTemplates
  );

  useEffect(() => {
    if (route.params?.initialShowTemplates) {
      setShowTemplates(true);
    }
  }, [route.params?.initialShowTemplates]);
  const [highlightedStepId, setHighlightedStepId] = useState<string | null>(null);
  
  // Toast state
  const [showToast, setShowToast] = useState(false);
  const toastAnim = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    if (route.params?.highlight) {
      setHighlightedStepId(route.params.highlight);
      setTimeout(() => setHighlightedStepId(null), 3500);
      navigation.setParams({ highlight: undefined });
    }
    
    if (route.params?.showSuccessToast) {
      setShowToast(true);
      RNAnimated.timing(toastAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      
      // Auto-dismiss after 4 seconds
      setTimeout(() => {
        dismissToast();
      }, 4000);
      
      navigation.setParams({ showSuccessToast: undefined });
    }
  }, [route.params]);

  const dismissToast = () => {
    RNAnimated.timing(toastAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setShowToast(false);
    });
  };

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
      navigation.navigate('CustomGoalSetup');
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

  const [resetTargetStep, setResetTargetStep] = useState<ExposureStep | null>(null);

  const handleStepOptions = useCallback((step: ExposureStep) => {
    Alert.alert(
      'Step Options',
      `Manage "${step.name}"`,
      [
        {
          text: 'Reset Target',
          onPress: () => setResetTargetStep(step),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  }, []);

  const renderTemplateItem = useCallback(({ item: t, index }: { item: ExposureTemplate; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 80)}>
      <Pressable
        onPress={() => handleSelectTemplate(t)}
        style={({ pressed }) => [styles.templateCard, pressed && styles.pressed]}
      >
        <View style={styles.templateIconContainer}>
          <MaterialCommunityIcons name={t.icon as any} size={28} color={Colors.brand} />
        </View>
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
  ), [handleSelectTemplate]);

  const renderStepItem = useCallback(({ item: step, index }: { item: ExposureStep; index: number }) => (
    <Animated.View key={step.id} entering={FadeInDown.delay(index * 50)}>
      <ExposureStepCard
        step={step}
        sessionCount={sessionCounts[step.id] || 0}
        isLocked={!step.is_unlocked}
        isCurrent={step.id === currentStepId}
        isHighlighted={step.id === highlightedStepId}
        onPress={() => {
          if (step.is_unlocked) {
            navigation.navigate('ActiveSession', { stepId: step.id });
          }
        }}
        onEdit={() => handleStepOptions(step)}
      />
    </Animated.View>
  ), [sessionCounts, currentStepId, highlightedStepId, handleStepOptions, navigation]);

  const templateHeader = useMemo(() => (
    <Text style={styles.templateIntro}>
      Pick a template to start your exposure ladder, or build one from scratch.
    </Text>
  ), []);

  const ladderHeader = useMemo(() => (
    steps.length > 0 ? (
      <View style={styles.summaryRow}>
        <Text style={styles.summaryText}>
          {steps.filter(s => s.is_mastered).length}/{steps.length} mastered
        </Text>
        <Text style={styles.helpfulNote}>
          Long press any step to reset its target
        </Text>
      </View>
    ) : null
  ), [steps]);

  if (showTemplates) {
    return (
      <Layout noTabBar>
        <View style={styles.topBar}>
          <Pressable onPress={() => steps.length > 0 ? setShowTemplates(false) : navigation.goBack()} hitSlop={12}>
            <Icon name="arrow-left" size={24} color={Colors.textPrimary} />
          </Pressable>
          <Text style={styles.topBarTitle}>Choose a Programme</Text>
          <View style={{ width: 24 }} />
        </View>

        <FlatList
          data={EXPOSURE_TEMPLATES}
          renderItem={renderTemplateItem}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={templateHeader}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          initialNumToRender={8}
          windowSize={5}
        />
      </Layout>
    );
  }

  return (
    <Layout noTabBar>
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Icon name="arrow-left" size={24} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.topBarTitle}>Exposure Ladder</Text>
        <Pressable onPress={() => setShowTemplates(true)} hitSlop={12}>
          <Icon name="plus" size={24} color={Colors.brand} />
        </Pressable>
      </View>

      <FlatList
        data={steps}
        renderItem={renderStepItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={ladderHeader}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="layers" size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyText}>No steps yet</Text>
            <Button title="Add from templates" onPress={() => setShowTemplates(true)} />
          </View>
        }
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        initialNumToRender={5}
        windowSize={5}
      />

      {/* Success Toast Overlay */}
      <Modal visible={showToast} transparent animationType="none" onRequestClose={dismissToast}>
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={dismissToast} />
          <RNAnimated.View 
            style={[
              styles.toastContainer,
              { bottom: 64 + Math.max(insets.bottom, 12) + 16, opacity: toastAnim, transform: [{ translateY: toastAnim.interpolate({ inputRange: [0, 1], outputRange: [100, 0] }) }] }
            ]}
          >
            <BlurView style={styles.toastBlur} blurType="light" blurAmount={15} overlayColor="rgba(255, 255, 255, 0.7)" />
            <View style={styles.toastContent}>
              <View style={styles.toastHeader}>
                <View style={styles.toastIcon}>
                  <Icon name="check-circle" size={20} color={Colors.brand} />
                </View>
                <View style={styles.toastTextContainer}>
                  <Text style={styles.toastTitle}>Your program is ready</Text>
                  <Text style={styles.toastSubtitle}>Step 1 is unlocked.</Text>
                </View>
              </View>
            </View>
          </RNAnimated.View>
        </View>
      </Modal>

      {resetTargetStep && (
        <ResetTargetBottomSheet
          stepId={resetTargetStep.id}
          currentValue={resetTargetStep.current_difficulty}
          unit={resetTargetStep.difficulty_unit}
          onClose={() => setResetTargetStep(null)}
        />
      )}
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
    paddingBottom: 40,
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
  templateIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.brandLight,
    alignItems: 'center',
    justifyContent: 'center',
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
  helpfulNote: {
    ...Typography.micro,
    color: Colors.brand,
    marginTop: Spacing.s,
    backgroundColor: Colors.brand + '15',
    padding: Spacing.xs,
    paddingHorizontal: Spacing.s,
    borderRadius: 8,
    overflow: 'hidden',
    alignSelf: 'flex-start',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
  },
  toastContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    height: 70,
    borderRadius: 20,
    overflow: 'hidden',
    ...Shadows.elevated,
    backgroundColor: Colors.surface,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 9999,
  },
  toastBlur: {
    ...StyleSheet.absoluteFillObject,
  },
  toastContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  toastHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  toastIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: Colors.brandLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  toastTextContainer: {
    flex: 1,
  },
  toastTitle: {
    ...Typography.body,
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight: '800',
  },
  toastSubtitle: {
    ...Typography.caption,
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
});
