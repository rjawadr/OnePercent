import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, TextInput,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import Animated, { FadeInRight, FadeInLeft } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Feather';
import { Layout } from '../components/ui/Layout';
import { Button } from '../components/ui/Button';
import { FearProfileChip, AddChipButton } from '../components/agoraphobia/FearProfileChip';
import { useAgoraphobiaStore } from '../store/agoraphobiaStore';
import { useUIStore } from '../store/uiStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing } from '../theme';

const EXTERNAL_PRESETS = [
  'Crowded places', 'Open spaces', 'Enclosed spaces', 'Being far from home',
  'Using transport', 'Queuing', 'Supermarkets', 'Bridges/tunnels', 'Being alone outside',
];

const INTERNAL_PRESETS = [
  'Racing heart', 'Shortness of breath', 'Dizziness', 'Sweating',
  'Shaking', 'Chest tightness', 'Nausea', 'Blurred vision', 'Tingling',
];

const TOTAL_STEPS = 4;

export const FearProfileOnboardingScreen = ({ navigation }: any) => {
  const { saveFearProfile } = useAgoraphobiaStore();
  const insets = useSafeAreaInsets();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // State
  const [externalSignals, setExternalSignals] = useState<string[]>([]);
  const [internalSignals, setInternalSignals] = useState<string[]>([]);
  const [fearedAttacks, setFearedAttacks] = useState<string[]>([]);
  const [fearedCatastrophes, setFearedCatastrophes] = useState<string[]>([]);
  const [attackInput, setAttackInput] = useState('');
  const [catastropheInput, setCatastropheInput] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyNumber, setEmergencyNumber] = useState('');
  const [crisisName, setCrisisName] = useState('');
  const [crisisNumber, setCrisisNumber] = useState('');

  const toggleItem = useCallback((list: string[], setList: (v: string[]) => void, item: string) => {
    setList(list.includes(item) ? list.filter(i => i !== item) : [...list, item]);
  }, []);

  const addCustomItem = useCallback((input: string, setInput: (v: string) => void, list: string[], setList: (v: string[]) => void) => {
    const trimmed = input.trim();
    if (trimmed && !list.includes(trimmed)) {
      setList([...list, trimmed]);
      setInput('');
    }
  }, []);

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS - 1) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
    else navigation.goBack();
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      await saveFearProfile({
        external_signals: externalSignals,
        internal_signals: internalSignals,
        feared_attacks: fearedAttacks,
        feared_catastrophes: fearedCatastrophes,
        emergency_contact_name: emergencyName || undefined,
        emergency_contact_number: emergencyNumber || undefined,
        crisis_helpline_name: crisisName || undefined,
        crisis_helpline_number: crisisNumber || undefined,
        onboarding_completed: true,
      });
      navigation.replace('ExposureLadder');
    } catch (e) {
      useUIStore.getState().showAlert({
        title: 'Error',
        message: 'Failed to save. Please try again.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <Animated.View entering={FadeInRight.duration(300)} style={styles.stepContent}>
            <Text style={styles.stepTitle}>What situations trigger your anxiety?</Text>
            <Text style={styles.stepSubtitle}>Select all that apply. You can edit these anytime.</Text>
            <View style={styles.chipGrid}>
              {EXTERNAL_PRESETS.map(item => (
                <FearProfileChip
                  key={item}
                  label={item}
                  selected={externalSignals.includes(item)}
                  onToggle={() => toggleItem(externalSignals, setExternalSignals, item)}
                />
              ))}
              {externalSignals.filter(s => !EXTERNAL_PRESETS.includes(s)).map(item => (
                <FearProfileChip
                  key={item}
                  label={item}
                  selected={true}
                  onToggle={() => toggleItem(externalSignals, setExternalSignals, item)}
                />
              ))}
              <AddChipButton onPress={() => {
                useUIStore.getState().showAlert({
                  title: 'Add custom trigger', 
                  message: 'You can type custom triggers when you reach the "Feared Attacks" step, or edit your fear profile later in Settings.',
                  type: 'info'
                });
              }} />
            </View>
          </Animated.View>
        );
      case 1:
        return (
          <Animated.View entering={FadeInRight.duration(300)} style={styles.stepContent}>
            <Text style={styles.stepTitle}>What do you feel in your body?</Text>
            <Text style={styles.stepSubtitle}>These are your internal anxiety signals.</Text>
            <View style={styles.chipGrid}>
              {INTERNAL_PRESETS.map(item => (
                <FearProfileChip
                  key={item}
                  label={item}
                  selected={internalSignals.includes(item)}
                  onToggle={() => toggleItem(internalSignals, setInternalSignals, item)}
                />
              ))}
              {internalSignals.filter(s => !INTERNAL_PRESETS.includes(s)).map(item => (
                <FearProfileChip
                  key={item}
                  label={item}
                  selected={true}
                  onToggle={() => toggleItem(internalSignals, setInternalSignals, item)}
                />
              ))}
              <AddChipButton onPress={() => {
                useUIStore.getState().showAlert({
                  title: 'Custom sensation', 
                  message: 'Please use the chips above or add custom items in Settings',
                  type: 'info'
                });
              }} />
            </View>
          </Animated.View>
        );
      case 2:
        return (
          <Animated.View entering={FadeInRight.duration(300)} style={styles.stepContent}>
            <Text style={styles.stepTitle}>What do you fear might happen?</Text>
            <Text style={styles.stepSubtitle}>Understanding your fears helps build targeted exposure steps.</Text>

            <Text style={styles.inputLabel}>Feared attacks</Text>
            <Text style={styles.inputHint}>e.g., "I'll have a panic attack"</Text>
            <View style={styles.addRow}>
              <TextInput
                style={styles.textInput}
                value={attackInput}
                onChangeText={setAttackInput}
                placeholder="Type a feared attack..."
                placeholderTextColor={Colors.textTertiary}
                onSubmitEditing={() => addCustomItem(attackInput, setAttackInput, fearedAttacks, setFearedAttacks)}
              />
              <Pressable
                onPress={() => addCustomItem(attackInput, setAttackInput, fearedAttacks, setFearedAttacks)}
                style={styles.addButton}
              >
                <Icon name="plus" size={20} color={Colors.brand} />
              </Pressable>
            </View>
            <View style={styles.chipGrid}>
              {fearedAttacks.map(item => (
                <FearProfileChip
                  key={item}
                  label={item}
                  selected={true}
                  onToggle={() => setFearedAttacks(fearedAttacks.filter(i => i !== item))}
                />
              ))}
            </View>

            <Text style={[styles.inputLabel, { marginTop: Spacing.xl }]}>Worst outcome you imagine</Text>
            <Text style={styles.inputHint}>e.g., "I'll collapse and no one will help"</Text>
            <View style={styles.addRow}>
              <TextInput
                style={styles.textInput}
                value={catastropheInput}
                onChangeText={setCatastropheInput}
                placeholder="Type a feared outcome..."
                placeholderTextColor={Colors.textTertiary}
                onSubmitEditing={() => addCustomItem(catastropheInput, setCatastropheInput, fearedCatastrophes, setFearedCatastrophes)}
              />
              <Pressable
                onPress={() => addCustomItem(catastropheInput, setCatastropheInput, fearedCatastrophes, setFearedCatastrophes)}
                style={styles.addButton}
              >
                <Icon name="plus" size={20} color={Colors.brand} />
              </Pressable>
            </View>
            <View style={styles.chipGrid}>
              {fearedCatastrophes.map(item => (
                <FearProfileChip
                  key={item}
                  label={item}
                  selected={true}
                  onToggle={() => setFearedCatastrophes(fearedCatastrophes.filter(i => i !== item))}
                />
              ))}
            </View>
          </Animated.View>
        );
      case 3:
        return (
          <Animated.View entering={FadeInRight.duration(300)} style={styles.stepContent}>
            <Text style={styles.stepTitle}>Who can you call if you need support?</Text>
            <Text style={styles.stepSubtitle}>Stored locally on your device. Never shared.</Text>

            <Text style={styles.sectionLabel}>Emergency Contact</Text>
            <TextInput
              style={styles.textInput}
              value={emergencyName}
              onChangeText={setEmergencyName}
              placeholder="Name"
              placeholderTextColor={Colors.textTertiary}
            />
            <TextInput
              style={[styles.textInput, { marginTop: Spacing.s }]}
              value={emergencyNumber}
              onChangeText={setEmergencyNumber}
              placeholder="Phone number"
              placeholderTextColor={Colors.textTertiary}
              keyboardType="phone-pad"
            />

            <Text style={[styles.sectionLabel, { marginTop: Spacing.xl }]}>Crisis Helpline</Text>
            <TextInput
              style={styles.textInput}
              value={crisisName}
              onChangeText={setCrisisName}
              placeholder="Helpline name (e.g., Samaritans)"
              placeholderTextColor={Colors.textTertiary}
            />
            <TextInput
              style={[styles.textInput, { marginTop: Spacing.s }]}
              value={crisisNumber}
              onChangeText={setCrisisNumber}
              placeholder="Helpline number"
              placeholderTextColor={Colors.textTertiary}
              keyboardType="phone-pad"
            />

            <Text style={styles.skipHint}>You can skip this and add contacts later in Settings.</Text>
          </Animated.View>
        );
      default:
        return null;
    }
  };

  return (
    <Layout>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        {/* Top bar */}
        <View style={styles.topBar}>
          <Pressable onPress={handleBack} hitSlop={12}>
            <Icon name="arrow-left" size={24} color={Colors.textPrimary} />
          </Pressable>
          <View style={styles.stepIndicator}>
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i <= currentStep && styles.dotActive,
                ]}
              />
            ))}
          </View>
          <Text style={styles.stepCount}>{currentStep + 1}/{TOTAL_STEPS}</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
          overScrollMode="never"
        >
          {renderStep()}
        </ScrollView>

        {/* Bottom buttons */}
        <View style={[styles.bottomBar, { paddingBottom: Math.max(90 + insets.bottom, 110) }]}>
          {currentStep < TOTAL_STEPS - 1 ? (
            <Button
              title="Continue"
              onPress={handleNext}
              disabled={currentStep === 0 && externalSignals.length === 0}
            />
          ) : (
            <View style={styles.bottomButtons}>
              <Button
                title="Skip contacts"
                onPress={handleComplete}
                type="ghost"
                loading={loading}
              />
              <Button
                title="Save & Continue"
                onPress={handleComplete}
                loading={loading}
                style={styles.flex}
              />
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.m,
    gap: Spacing.m,
  },
  stepIndicator: {
    flex: 1,
    flexDirection: 'row',
    gap: Spacing.xs,
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  dotActive: {
    backgroundColor: Colors.brand,
    width: 24,
  },
  stepCount: {
    ...Typography.caption,
    color: Colors.textTertiary,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: 120,
  },
  stepContent: {
    paddingTop: Spacing.l,
  },
  stepTitle: {
    ...Typography.title,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  stepSubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.s,
  },
  inputLabel: {
    ...Typography.label,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  inputHint: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginBottom: Spacing.m,
    fontStyle: 'italic',
  },
  addRow: {
    flexDirection: 'row',
    gap: Spacing.s,
    marginBottom: Spacing.m,
  },
  textInput: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingVertical: Spacing.m,
    paddingHorizontal: Spacing.l,
    ...Typography.body,
    color: Colors.textPrimary,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.brandLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionLabel: {
    ...Typography.heading,
    color: Colors.textPrimary,
    marginBottom: Spacing.m,
  },
  skipHint: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginTop: Spacing.xl,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  bottomBar: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
    paddingTop: Spacing.m,
  },
  bottomButtons: {
    flexDirection: 'row',
    gap: Spacing.m,
    alignItems: 'center',
  },
});
