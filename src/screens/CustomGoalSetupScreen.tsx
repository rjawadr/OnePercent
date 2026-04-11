import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  LogBox,
} from 'react-native';

LogBox.ignoreLogs([
  'InteractionManager has been deprecated',
]);

import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Layout } from '../components/ui/Layout';
import { Button } from '../components/ui/Button';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../theme';
import { StepInputData, StepInputCard } from '../components/agoraphobia/StepInputCard';
import { useAgoraphobiaStore } from '../store/agoraphobiaStore';

function StepIndicator({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  return (
    <View style={styles.indicatorContainer}>
      {Array.from({ length: totalSteps }).map((_, i) => (
        <React.Fragment key={i}>
          <View style={[
            styles.indicatorDot,
            i === currentStep && styles.indicatorDotActive,
            i < currentStep && styles.indicatorDotCompleted
          ]} />
          {i < totalSteps - 1 && (
            <View style={[
              styles.indicatorLine,
              i < currentStep && styles.indicatorLineActive
            ]} />
          )}
        </React.Fragment>
      ))}
    </View>
  );
}

const ICON_OPTIONS = ['walk', 'store', 'tree', 'bus', 'coffee', 'weight-lifter', 'home', 'pencil'];
const AVAILABLE_SIGNALS = ['Phone', 'Water bottle', 'Medication', 'Companion', 'Headphones'];

export const CustomGoalSetupScreen = ({ navigation }: any) => {
  const { fearProfile } = useAgoraphobiaStore();

  const [goalName, setGoalName] = useState('');
  const [goalDescription, setGoalDescription] = useState('');
  const [goalIcon, setGoalIcon] = useState('pencil');
  const [startingLocation, setStartingLocation] = useState('');
  const [finalLocation, setFinalLocation] = useState('');

  const [steps, setSteps] = useState<StepInputData[]>([]);

  const [isSafetyExpanded, setIsSafetyExpanded] = useState(false);
  const [safetySignals, setSafetySignals] = useState<string[]>(fearProfile?.external_signals || []);

  const isValid = useMemo(() => {
    if (!goalName.trim()) return false;
    if (!startingLocation.trim()) return false;
    if (steps.length === 0) return false;

    // Check all steps are complete
    for (const step of steps) {
      if (!step.name.trim() || step.difficulty_value <= 0) return false;
    }

    return true;
  }, [goalName, startingLocation, steps]);

  const addStep = () => {
    if (steps.length >= 10) return;

    const newStep: StepInputData = {
      id: Math.random().toString(36).substring(7),
      name: '',
      location_hint: '',
      difficulty_value: 0,
      initial_suds_estimate: 5,
    };

    setSteps([...steps, newStep]);
  };

  const updateStep = (id: string, updates: Partial<StepInputData>) => {
    setSteps(curr => curr.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const removeStep = (id: string) => {
    setSteps(curr => curr.filter(s => s.id !== id));
  };

  const toggleSafetySignal = (signal: string) => {
    setSafetySignals(curr =>
      curr.includes(signal) ? curr.filter(s => s !== signal) : [...curr, signal]
    );
  };

  const renderStepItem = (params: any) => {
    const { item, getIndex, drag, isActive } = params;
    const idx = getIndex() ?? 0;
    return (
      <StepInputCard
        step={item}
        index={idx}
        onUpdate={updateStep}
        onRemove={removeStep}
        drag={drag}
        isActive={isActive}
      />
    );
  };

  return (
    <Layout>
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.backBtn}>
          <Icon name="arrow-left" size={24} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.topBarTitle}>Custom Goal</Text>
        <Pressable
          style={styles.iconPlaceholder}
          onPress={() => {
            if (isValid) {
              navigation.navigate('CustomGoalReview', {
                goalName,
                goalDescription,
                goalIcon,
                startingLocation,
                finalLocation,
                steps,
                safetySignals,
              });
            }
          }}
          disabled={!isValid}
        >
          <Icon name="save" size={20} color={isValid ? Colors.brand : Colors.textTertiary} />
        </Pressable>
      </View>

      <View style={styles.stepIndicatorWrapper}>
        <StepIndicator currentStep={0} totalSteps={2} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <DraggableFlatList
          data={steps}
          keyExtractor={(item) => item.id}
          onDragEnd={({ data }: { data: StepInputData[] }) => {
            setSteps(data);
          }}
          renderItem={renderStepItem}
          keyboardShouldPersistTaps="handled"
          bounces={false}
          overScrollMode="never"
          ListHeaderComponent={
            <View style={styles.sectionHeader}>
              <View style={styles.identitySection}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>What is your goal?</Text>
                  <TextInput
                    style={styles.input}
                    value={goalName}
                    onChangeText={setGoalName}
                    placeholder="e.g. Walk to the corner shop"
                    placeholderTextColor={Colors.textTertiary}
                    maxLength={80}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Describe it briefly</Text>
                  <Text style={styles.subtitle}>This appears on your ladder card.</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={goalDescription}
                    onChangeText={setGoalDescription}
                    placeholder="e.g. Build confidence walking to nearby shops independently."
                    placeholderTextColor={Colors.textTertiary}
                    multiline
                    numberOfLines={2}
                    maxLength={140}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Icon</Text>
                  <View style={styles.emojiRow}>
                    {ICON_OPTIONS.map(iconName => (
                      <TouchableOpacity
                        key={iconName}
                        style={[styles.emojiBtn, goalIcon === iconName && styles.emojiBtnActive]}
                        onPress={() => setGoalIcon(iconName)}
                      >
                        <MaterialCommunityIcons
                          name={iconName as any}
                          size={24}
                          color={goalIcon === iconName ? Colors.brand : Colors.textSecondary}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={[styles.inputGroup, { marginTop: Spacing.m }]}>
                  <Text style={styles.label}>Where does your practice start?</Text>
                  <Text style={styles.subtitle}>Name a real place near you — your anchor point.</Text>
                  <TextInput
                    style={styles.input}
                    value={startingLocation}
                    onChangeText={setStartingLocation}
                    placeholder="e.g. My front door, Building entrance"
                    placeholderTextColor={Colors.textTertiary}
                    maxLength={80}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Where is the end goal?</Text>
                  <TextInput
                    style={styles.input}
                    value={finalLocation}
                    onChangeText={setFinalLocation}
                    placeholder="e.g. Corner shop on High Street"
                    placeholderTextColor={Colors.textTertiary}
                    maxLength={80}
                  />
                </View>
              </View>

              <View style={styles.sectionDivider} />

              <View style={styles.stepsIntro}>
                <Text style={styles.sectionTitle}>Your exposure steps</Text>
                <Text style={styles.sectionSubtitle}>
                  Start easy. Each step should feel slightly harder than the one before.
                </Text>
              </View>

              {steps.length === 0 && (
                <View style={styles.emptyState}>
                  <View style={styles.emptyIconCircle}>
                    <Icon name="plus" size={24} color={Colors.textSecondary} />
                  </View>
                  <Text style={styles.emptyStateTitle}>No steps yet</Text>
                  <Text style={styles.emptyStateText}>
                    Your first step should feel almost{'\n'}comfortable — that's correct.
                  </Text>
                </View>
              )}
            </View>
          }
          ListFooterComponent={
            <View style={styles.footerComponent}>
              {steps.length > 0 && steps.length === 3 && (
                <Animated.Text entering={FadeInDown} style={styles.hintText}>
                  Good start. Most programs have 4–6 steps.
                </Animated.Text>
              )}

              {steps.length < 10 ? (
                <TouchableOpacity style={styles.addStepBtn} onPress={addStep}>
                  <Icon name="plus" size={18} color={Colors.surface} />
                  <Text style={styles.addStepBtnText}>Add a step</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.hintText}>10 steps is the maximum for one program.</Text>
              )}

              <View style={styles.safetySection}>
                <TouchableOpacity
                  style={styles.safetyHeaderRow}
                  onPress={() => setIsSafetyExpanded(!isSafetyExpanded)}
                >
                  <Icon name={isSafetyExpanded ? "chevron-down" : "chevron-right"} size={20} color={Colors.textSecondary} />
                  <Text style={styles.safetyHeaderTitle}>Safety items (optional)</Text>
                </TouchableOpacity>

                {isSafetyExpanded && (
                  <Animated.View entering={FadeInDown} style={styles.safetyContent}>
                    <Text style={styles.label}>What might you carry during sessions?</Text>
                    <Text style={styles.subtitle}>You'll choose what to bring before each session.</Text>

                    <View style={styles.chipRow}>
                      {AVAILABLE_SIGNALS.map(signal => {
                        const isSelected = safetySignals.includes(signal);
                        return (
                          <TouchableOpacity
                            key={signal}
                            style={[styles.chip, isSelected && styles.chipActive]}
                            onPress={() => toggleSafetySignal(signal)}
                          >
                            <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                              {signal}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </Animated.View>
                )}
              </View>
            </View>
          }
          contentContainerStyle={styles.listContent}
        />
      </KeyboardAvoidingView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.m,
    paddingBottom: Spacing.s,
  },
  topBarTitle: {
    ...Typography.heading,
    color: Colors.textPrimary,
  },
  backBtn: {
    padding: Spacing.xs,
  },
  iconPlaceholder: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIndicatorWrapper: {
    alignItems: 'center',
    paddingBottom: Spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  keyboardView: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.l,
    paddingBottom: Spacing.xxl,
  },
  sectionHeader: {
    marginBottom: Spacing.m,
  },
  identitySection: {
    gap: Spacing.l,
  },
  inputGroup: {
    gap: Spacing.xs,
  },
  label: {
    ...Typography.label,
    color: Colors.textPrimary,
    fontWeight: '700',
    fontSize: 15,
  },
  subtitle: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.m,
    paddingHorizontal: Spacing.l,
    paddingVertical: Spacing.m,
    ...Typography.body,
    color: Colors.textPrimary,
    minHeight: 52,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  emojiRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.m,
    marginTop: Spacing.xs,
  },
  emojiBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  emojiBtnActive: {
    borderColor: Colors.brand,
    backgroundColor: Colors.brandLight,
  },
  emojiText: {
    fontSize: 20,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: Spacing.xl,
  },
  stepsIntro: {
    marginBottom: Spacing.l,
    gap: Spacing.xs,
  },
  sectionTitle: {
    ...Typography.heading,
    fontSize: 18,
    color: Colors.textPrimary,
  },
  sectionSubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderStyle: 'dashed',
    marginBottom: Spacing.m,
  },
  emptyIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.m,
  },
  emptyStateTitle: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  emptyStateText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  footerComponent: {
    marginTop: Spacing.m,
    gap: Spacing.l,
  },
  addStepBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.brand,
    paddingVertical: Spacing.m,
    borderRadius: BorderRadius.l,
    gap: Spacing.s,
  },
  addStepBtnText: {
    ...Typography.label,
    color: Colors.surface,
    fontWeight: '700',
  },
  hintText: {
    ...Typography.caption,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
  safetySection: {
    marginTop: Spacing.l,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: 'hidden',
  },
  safetyHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.m,
    paddingHorizontal: Spacing.l,
    gap: Spacing.s,
  },
  safetyHeaderTitle: {
    ...Typography.label,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  safetyContent: {
    padding: Spacing.l,
    paddingTop: 0,
    gap: Spacing.s,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.s,
    marginTop: Spacing.s,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  chipActive: {
    backgroundColor: Colors.brandLight,
    borderColor: Colors.brand,
  },
  chipText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  chipTextActive: {
    color: Colors.brand,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    padding: Spacing.xl,
    paddingTop: Spacing.m,
    paddingBottom: Spacing.xl,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    gap: Spacing.l,
    ...Shadows.card, // Extra elevation for depth
  },
  footerBtn: {
    flex: 1,
  },

  // Indicator Styles
  indicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: 60,
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  indicatorDotActive: {
    width: 28,
    backgroundColor: Colors.brand,
  },
  indicatorDotCompleted: {
    backgroundColor: Colors.brand,
  },
  indicatorLine: {
    flex: 1,
    height: 3,
    backgroundColor: Colors.border,
    borderRadius: 1.5,
  },
  indicatorLineActive: {
    backgroundColor: Colors.brand,
  },
});
