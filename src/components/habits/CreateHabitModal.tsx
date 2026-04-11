import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Habit } from '../../models/Habit';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../theme';
import { Button } from '../ui/Button';
import { ImprovementFrequency } from '../../engine/onePercentEngine';
import { CreateHabitStep2 } from './CreateHabitStep2';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { BlurView } from '@react-native-community/blur';
import Animated, { FadeInDown, FadeInUp, Layout } from 'react-native-reanimated';

interface CreateHabitModalProps {
  isVisible: boolean;
  onClose: () => void;
  onAdd?: (habit: Habit) => void;
  onUpdate?: (id: string, updates: Partial<Habit>) => void;
  initialHabit?: Habit;
}

type HabitType = 'quantity' | 'time' | 'check';

const CATEGORIES = ['Personal', 'Zen', 'Physical', 'Work'];
const TYPES: { value: HabitType; label: string; icon: string }[] = [
  { value: 'quantity', label: 'Quantity', icon: 'numeric' },
  { value: 'time', label: 'Time', icon: 'timer-outline' },
  { value: 'check', label: 'Check-off', icon: 'check-circle-outline' },
];

function StepIndicator({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  return (
    <View style={styles.indicatorContainer}>
      {Array.from({ length: totalSteps }).map((_, i) => (
        <View key={i} style={styles.indicatorSegment}>
          <View style={[
            styles.indicatorBar,
            i <= currentStep && styles.indicatorBarActive,
            i < currentStep && styles.indicatorBarCompleted
          ]} />
        </View>
      ))}
    </View>
  );
}

import { GestureHandlerRootView } from 'react-native-gesture-handler';

export const CreateHabitModal: React.FC<CreateHabitModalProps> = ({ isVisible, onClose, onAdd, onUpdate, initialHabit }) => {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(1);
  const isEdit = !!initialHabit;

  // Step 1 State
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('✨');
  const [category, setCategory] = useState('Personal');
  const [unitType, setUnitType] = useState<HabitType>('quantity');

  // Step 2 State
  const [baseline, setBaseline] = useState('');
  const [unit, setUnit] = useState('');
  const [goal, setGoal] = useState('');
  const [freq, setFreq] = useState<ImprovementFrequency>('daily');
  const [identity, setIdentity] = useState('');

  // Step 3 State
  const [notificationTime, setNotificationTime] = useState('08:00');
  const [anchorHabit, setAnchorHabit] = useState('');
  const [temptationBundle, setTemptationBundle] = useState('');
  const [activeDays, setActiveDays] = useState('1111111');

  const TAB_BAR_OFFSET = 64 + Math.max(insets.bottom, 12) + 12;

  React.useEffect(() => {
    if (initialHabit && isVisible) {
      setName(initialHabit.name);
      setIcon(initialHabit.icon || '✨');
      setCategory(initialHabit.category || 'Personal');
      setUnitType(initialHabit.unit_type || 'quantity');
      setBaseline(initialHabit.baseline_value.toString());
      setUnit(initialHabit.unit);
      setGoal(initialHabit.target_value?.toString() || '');
      setFreq(initialHabit.improvement_frequency as any);
      setIdentity(initialHabit.identity_statement || '');
      setNotificationTime(initialHabit.notification_time || '08:00');
      setAnchorHabit(initialHabit.anchor_habit || '');
      setTemptationBundle(initialHabit.temptation_bundle || '');
      setActiveDays(initialHabit.active_days || '1111111');
    } else if (!isVisible) {
      reset();
    }
  }, [initialHabit, isVisible]);

  const reset = () => {
    setStep(1);
    setName('');
    setIcon('✨');
    setCategory('Personal');
    setUnitType('quantity');
    setBaseline('');
    setUnit('');
    setGoal('');
    setFreq('daily');
    setIdentity('');
    setNotificationTime('08:00');
    setAnchorHabit('');
    setTemptationBundle('');
    setActiveDays('1111111');
  };

  const handleNext = () => {
    if (step === 1 && !name) return;
    if (step === 2 && (!unit || !baseline)) return;

    if (step < 3) {
      setStep(step + 1);
    } else {
      handleFinalSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleFinalSubmit = () => {
    const numBaseline = parseFloat(baseline);
    const numGoal = goal ? parseFloat(goal) : undefined;

    if (isEdit && initialHabit && onUpdate) {
      const updates: Partial<Habit> = {
        name,
        icon,
        category,
        unit,
        unit_type: unitType,
        baseline_value: numBaseline,
        target_value: numGoal,
        improvement_frequency: freq as any,
        identity_statement: identity,
        anchor_habit: anchorHabit || undefined,
        temptation_bundle: temptationBundle || undefined,
        notification_time: notificationTime,
        active_days: activeDays,
        habitbar_button: unitType === 'check' ? 'mark_done' : (unitType === 'time' ? 'timer' : 'input'),
      };
      onUpdate(initialHabit.id, updates);
    } else if (onAdd) {
      const newHabit: Habit = {
        id: Math.random().toString(36).substring(7),
        name,
        category,
        unit,
        unit_type: unitType,
        baseline_value: numBaseline,
        current_target: numBaseline,
        target_value: numGoal,
        improvement_frequency: freq as any,
        frequency: 'daily',
        identity_statement: identity,
        anchor_habit: anchorHabit || undefined,
        temptation_bundle: temptationBundle || undefined,
        notification_time: notificationTime,
        active_days: activeDays,
        sort_order: 0,
        habitbar_button: unitType === 'check' ? 'mark_done' : (unitType === 'time' ? 'timer' : 'input'),
        start_date: new Date().toISOString().split('T')[0],
        is_active: true,
        created_at: new Date().toISOString(),
        icon: icon,
        color: Colors.brand + '20',
        streak: 0,
        status: 'active',
      };
      onAdd(newHabit);
    }

    reset();
    onClose();
  };

  const renderStep1 = () => (
    <Animated.View entering={FadeInDown.duration(400)} style={styles.stepContent}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Define your new self</Text>
        <Text style={styles.sectionSubtitle}>Tiny habits, massive changes.</Text>
      </View>

      <View style={styles.inputGroup}>
        <View style={styles.labelRow}>
          <Icon name="pencil-outline" size={18} color={Colors.brand} />
          <Text style={styles.label}>What is your new habit & icon?</Text>
        </View>
        <View style={styles.nameRow}>
          <TextInput
            style={[styles.input, styles.iconInput]}
            value={icon}
            onChangeText={setIcon}
            maxLength={6}
            selectionColor={Colors.brand}
            placeholder="✨"
            textAlign="center"
          />
          <TextInput
            style={[styles.input, styles.nameInput]}
            value={name}
            onChangeText={setName}
            onKeyPress={({ nativeEvent }) => {
              if (nativeEvent.key === 'Backspace' && name === '') {
                setIcon('');
              }
            }}
            placeholder="e.g. Read Philosophy"
            placeholderTextColor={Colors.textTertiary}
            selectionColor={Colors.brand}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <View style={styles.labelRow}>
          <Icon name="tag-outline" size={18} color={Colors.brand} />
          <Text style={styles.label}>Category</Text>
        </View>
        <View style={styles.chipRow}>
          {CATEGORIES.map(cat => (
            <Pressable
              key={cat}
              style={({ pressed }) => [
                styles.chip,
                category === cat && styles.chipActive,
                pressed && { transform: [{ scale: 0.96 }], opacity: 0.9 }
              ]}
              onPress={() => setCategory(cat)}
            >
              <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>{cat}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <View style={styles.labelRow}>
          <Icon name="form-select" size={18} color={Colors.brand} />
          <Text style={styles.label}>Measurement Type</Text>
        </View>
        <View style={styles.chipRow}>
          {TYPES.map(t => (
            <Pressable
              key={t.value}
              style={({ pressed }) => [
                styles.chip,
                unitType === t.value && styles.chipActive,
                pressed && { transform: [{ scale: 0.96 }], opacity: 0.9 }
              ]}
              onPress={() => {
                setUnitType(t.value);
                if (t.value === 'check') setUnit('Done');
                if (t.value === 'time') setUnit('Mins');
              }}
            >
              <Icon name={t.icon} size={18} color={unitType === t.value ? Colors.brand : Colors.textSecondary} />
              <Text style={[styles.chipText, unitType === t.value && styles.chipTextActive]}>{t.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </Animated.View>
  );

  const renderStep3 = () => (
    <Animated.View entering={FadeInDown.duration(400)} style={styles.stepContent}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Final Polish</Text>
        <Text style={styles.sectionSubtitle}>Environmental design is key.</Text>
      </View>

      <View style={styles.inputGroup}>
        <View style={styles.labelRow}>
          <Icon name="bell-ring-outline" size={18} color={Colors.brand} />
          <Text style={styles.label}>Daily Pulse</Text>
        </View>
        <View style={styles.inputWithIcon}>
          <Icon name="clock-outline" size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.inlineInput}
            value={notificationTime}
            onChangeText={setNotificationTime}
            placeholder="08:00"
            placeholderTextColor={Colors.textTertiary}
            selectionColor={Colors.brand}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <View style={styles.labelRow}>
          <Icon name="anchor" size={18} color={Colors.brand} />
          <Text style={styles.label}>Habit Anchor (Optional)</Text>
        </View>
        <TextInput
          style={styles.input}
          value={anchorHabit}
          onChangeText={setAnchorHabit}
          placeholder="e.g. After I brush my teeth..."
          placeholderTextColor={Colors.textTertiary}
          selectionColor={Colors.brand}
        />
      </View>

      <View style={styles.inputGroup}>
        <View style={styles.labelRow}>
          <Icon name="calendar-check-outline" size={18} color={Colors.brand} />
          <Text style={styles.label}>Active Cycles</Text>
        </View>
        <View style={styles.daysRow}>
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
            <Pressable
              key={`${day}-${i}`}
              style={({ pressed }) => [
                styles.dayCircle,
                activeDays[i] === '1' && styles.dayCircleActive,
                pressed && { transform: [{ scale: 0.92 }], opacity: 0.8 }
              ]}
              onPress={() => {
                const newDays = activeDays.split('');
                newDays[i] = newDays[i] === '1' ? '0' : '1';
                setActiveDays(newDays.join(''));
              }}
            >
              <Text style={[styles.dayText, activeDays[i] === '1' && styles.dayTextActive]}>{day}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </Animated.View>
  );

  return (
    <Modal
      visible={isVisible}
      animationType="fade"
      transparent={true}
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={styles.overlay}>
          <BlurView
            style={StyleSheet.absoluteFill}
            blurType="dark"
            blurAmount={10}
            reducedTransparencyFallbackColor="rgba(0,0,0,0.5)"
          />
          <Pressable style={styles.backdrop} onPress={onClose} />

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.keyboardView}
          >
            <Animated.View
              entering={FadeInUp.duration(400)}
              layout={Layout.duration(300)}
              style={[styles.modalContent, { marginBottom: TAB_BAR_OFFSET }]}
            >
              <View style={styles.grabHandle} />

              <View style={styles.header}>
                <View style={styles.headerLeft}>
                  <Text style={styles.title}>{isEdit ? 'Refine Habit' : 'New Habit'}</Text>
                  <StepIndicator currentStep={step - 1} totalSteps={3} />
                </View>
                <Pressable
                  style={({ pressed }) => [
                    styles.closeBtn,
                    pressed && { transform: [{ scale: 0.9 }], opacity: 0.7 }
                  ]}
                  onPress={onClose}
                >
                  <Icon name="close" size={20} color={Colors.textSecondary} />
                </Pressable>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.scrollContent}
                bounces={false}
                overScrollMode="never"
              >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                  <View>
                    {step === 1 && renderStep1()}
                    {step === 2 && (
                      <CreateHabitStep2
                        baseline={baseline}
                        setBaseline={setBaseline}
                        unit={unit}
                        setUnit={setUnit}
                        goal={goal}
                        setGoal={setGoal}
                        frequency={freq}
                        setFrequency={setFreq}
                        identity={identity}
                        setIdentity={setIdentity}
                      />
                    )}
                    {step === 3 && renderStep3()}
                  </View>
                </TouchableWithoutFeedback>
              </ScrollView>

              <View style={styles.footer}>
                {step > 1 && (
                  <Button
                    title="Back"
                    type="secondary"
                    onPress={handleBack}
                    style={[styles.footerBtn, styles.backBtn]}
                  />
                )}
                <Button
                  title={step === 3 ? (isEdit ? 'Update' : 'Launch') : 'Continue'}
                  type="primary"
                  onPress={handleNext}
                  style={styles.footerBtn}
                  disabled={(step === 1 && !name) || (step === 2 && (!unit || !baseline))}
                />
              </View>
            </Animated.View>
          </KeyboardAvoidingView>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  keyboardView: {
    width: '100%',
    paddingHorizontal: Spacing.m,
  },
  modalContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderRadius: 32,
    padding: Spacing.xl,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  grabHandle: {
    width: 36,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.l,
    opacity: 0.6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xl,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    ...Typography.title,
    color: Colors.textPrimary,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  indicatorSegment: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  indicatorBar: {
    height: '100%',
    width: '0%',
    backgroundColor: Colors.brand,
    borderRadius: 2,
  },
  indicatorBarActive: {
    width: '100%',
  },
  indicatorBarCompleted: {
    backgroundColor: Colors.brand,
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  stepContent: {
    gap: Spacing.xxl,
  },
  sectionHeader: {
    gap: 4,
  },
  sectionTitle: {
    ...Typography.heading,
    fontSize: 20,
    color: Colors.textPrimary,
    fontWeight: '800',
  },
  sectionSubtitle: {
    ...Typography.body,
    fontSize: 14,
    color: Colors.textSecondary,
    opacity: 0.7,
  },
  inputGroup: {
    gap: 12,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    ...Typography.label,
    color: Colors.textPrimary,
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.2,
  },
  input: {
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 20,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.l,
    ...Typography.body,
    fontSize: 17,
    color: Colors.textPrimary,
    minHeight: 64,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  nameRow: {
    flexDirection: 'row',
    gap: 12,
  },
  iconInput: {
    flex: 0.25,
    paddingHorizontal: 0,
    fontSize: 24,
  },
  nameInput: {
    flex: 0.75,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 20,
    paddingHorizontal: Spacing.xl,
    gap: 12,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  inlineInput: {
    flex: 1,
    paddingVertical: Spacing.l,
    ...Typography.body,
    fontSize: 17,
    color: Colors.textPrimary,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 100,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  chipActive: {
    backgroundColor: 'rgba(78, 205, 196, 0.12)',
    borderColor: Colors.brand,
  },
  chipText: {
    ...Typography.label,
    fontSize: 15,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  chipTextActive: {
    color: Colors.brand,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    paddingTop: Spacing.xl,
    backgroundColor: 'transparent',
    gap: Spacing.m,
  },
  footerBtn: {
    flex: 1,
    height: 60,
    borderRadius: 20,
  },
  backBtn: {
    flex: 0.4,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.03)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  dayCircleActive: {
    backgroundColor: Colors.brand,
    borderColor: Colors.brand,
  },
  dayText: {
    ...Typography.label,
    color: Colors.textSecondary,
    fontWeight: '700',
  },
  dayTextActive: {
    color: '#FFF',
  },
});

