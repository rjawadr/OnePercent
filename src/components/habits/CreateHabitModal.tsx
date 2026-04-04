import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from 'react-native';
import { Habit } from '../../models/Habit';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../theme';
import { Button } from '../ui/Button';
import { ImprovementFrequency } from '../../engine/onePercentEngine';
import { CreateHabitStep2 } from './CreateHabitStep2';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

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

export const CreateHabitModal = ({ isVisible, onClose, onAdd, onUpdate, initialHabit }: CreateHabitModalProps) => {
  const [step, setStep] = useState(1);
  const isEdit = !!initialHabit;

  // Step 1 State
  const [name, setName] = useState('');
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

  React.useEffect(() => {
    if (initialHabit && isVisible) {
      setName(initialHabit.name);
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
        icon: '✨',
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
    <View style={styles.stepContent}>
      <Text style={styles.sectionTitle}>Define your new self</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>What is your new habit?</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Read Philosophy"
          placeholderTextColor={Colors.textTertiary}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Category</Text>
        <View style={styles.chipRow}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[styles.chip, category === cat && styles.chipActive]}
              onPress={() => setCategory(cat)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Type</Text>
        <View style={styles.chipRow}>
          {TYPES.map(t => (
            <TouchableOpacity
              key={t.value}
              style={[styles.chip, unitType === t.value && styles.chipActive]}
              onPress={() => {
                setUnitType(t.value);
                if (t.value === 'check') setUnit('Done');
                if (t.value === 'time') setUnit('Mins');
              }}
              activeOpacity={0.7}
            >
              <Icon name={t.icon} size={16} color={unitType === t.value ? Colors.brand : Colors.textSecondary} />
              <Text style={[styles.chipText, unitType === t.value && styles.chipTextActive]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.sectionTitle}>Final Polish</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Daily Reminder</Text>
        <View style={styles.inputWithIcon}>
          <Icon name="bell-outline" size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.inlineInput}
            value={notificationTime}
            onChangeText={setNotificationTime}
            placeholder="08:00"
            placeholderTextColor={Colors.textTertiary}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Anchor Habit (Optional)</Text>
        <TextInput
          style={styles.input}
          value={anchorHabit}
          onChangeText={setAnchorHabit}
          placeholder="e.g. After I brush my teeth..."
          placeholderTextColor={Colors.textTertiary}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Active Days</Text>
        <View style={styles.daysRow}>
          {['M','T','W','T','F','S','S'].map((day, i) => (
            <TouchableOpacity
              key={`${day}-${i}`}
              style={[styles.dayCircle, activeDays[i] === '1' && styles.dayCircleActive]}
              onPress={() => {
                const newDays = activeDays.split('');
                newDays[i] = newDays[i] === '1' ? '0' : '1';
                setActiveDays(newDays.join(''));
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.dayText, activeDays[i] === '1' && styles.dayTextActive]}>{day}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Backdrop for click-to-close */}
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => {
            Keyboard.dismiss();
            onClose();
          }}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
          <View style={styles.modalContent}>
            {/* Grab Handle for aesthetic feel */}
            <View style={styles.grabHandle} />

            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Text style={styles.title}>{isEdit ? 'Edit Habit' : 'New Habit'}</Text>
                <StepIndicator currentStep={step - 1} totalSteps={3} />
              </View>
              <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.8}>
                <Icon name="close" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.scrollContent}
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
                title={step === 3 ? (isEdit ? 'Update Habit' : 'Create Habit') : 'Next'}
                type="primary"
                onPress={handleNext}
                style={styles.footerBtn}
                disabled={(step === 1 && !name) || (step === 2 && (!unit || !baseline))}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(26, 28, 30, 0.4)', // Slightly darker, premium overlay
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  keyboardView: {
    width: '100%',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: Spacing.l,
    maxHeight: '94%',
    ...Platform.select({
      ios: {
        shadowColor: Colors.textPrimary,
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.08,
        shadowRadius: 20,
      },
      android: {
        elevation: 20,
      },
    }),
  },
  grabHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.m,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    marginTop: Spacing.s,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    ...Typography.title, // Fixed: use Spread after Typography.title if it exists
    color: Colors.textPrimary,
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: 140,
    marginTop: 4,
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
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  stepContent: {
    gap: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.heading,
    fontSize: 18,
    color: Colors.textPrimary,
    fontWeight: '700',
    marginBottom: -Spacing.s,
  },
  inputGroup: {
    gap: Spacing.m,
  },
  label: {
    ...Typography.label,
    color: Colors.textPrimary,
    fontWeight: '700',
    fontSize: 15,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: 18,
    paddingHorizontal: Spacing.l,
    paddingVertical: Spacing.m,
    ...Typography.body,
    fontSize: 16,
    color: Colors.textPrimary,
    minHeight: 58,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 18,
    paddingHorizontal: Spacing.l,
    gap: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  inlineInput: {
    flex: 1,
    paddingVertical: Spacing.m,
    ...Typography.body,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.m,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 24,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.brandLight,
    borderColor: Colors.brand,
  },
  chipText: {
    ...Typography.label,
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  chipTextActive: {
    color: Colors.brand,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    paddingTop: Spacing.l,
    paddingBottom: Platform.OS === 'ios' ? Spacing.xl : Spacing.l,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    marginTop: Spacing.s,
  },
  footerBtn: {
    flex: 1,
    height: 56,
  },
  backBtn: {
    marginRight: Spacing.m,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  dayCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
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
    color: Colors.surface,
  },
});

