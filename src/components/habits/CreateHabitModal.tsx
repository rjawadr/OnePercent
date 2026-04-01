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
  onAdd: (habit: Habit) => void;
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

export const CreateHabitModal = ({ isVisible, onClose, onAdd }: CreateHabitModalProps) => {
  const [step, setStep] = useState(1);

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
    };

    onAdd(newHabit);
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
    <Modal visible={isVisible} animationType="slide" transparent={true}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContent}>
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Text style={styles.title}>New Habit</Text>
                <StepIndicator currentStep={step - 1} totalSteps={3} />
              </View>
              <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <Icon name="close" size={22} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
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
                title={step === 3 ? 'Create Habit' : 'Next'}
                type="primary"
                onPress={handleNext}
                style={styles.footerBtn}
              />
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { 
    flex: 1, 
    backgroundColor: 'rgba(28, 43, 74, 0.4)', 
    justifyContent: 'flex-end' 
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: Spacing.l,
    maxHeight: '92%',
    ...Shadows.elevated,
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start', 
    marginBottom: Spacing.m 
  },
  headerLeft: {
    gap: 8,
  },
  title: { 
    ...Typography.title,
    color: Colors.textPrimary 
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
    width: 120,
  },
  indicatorDot: { 
    width: 8, 
    height: 8, 
    borderRadius: 4, 
    backgroundColor: Colors.border,
  },
  indicatorDotActive: { 
    width: 24,
    backgroundColor: Colors.brand,
  },
  indicatorDotCompleted: {
    backgroundColor: Colors.brand,
  },
  indicatorLine: {
    flex: 1,
    height: 2,
    backgroundColor: Colors.border,
    borderRadius: 1,
  },
  indicatorLineActive: {
    backgroundColor: Colors.brand,
  },
  scrollContent: { 
    paddingBottom: Spacing.xl 
  },
  stepContent: {
    gap: Spacing.l,
  },
  sectionTitle: { 
    ...Typography.heading,
    color: Colors.textPrimary,
  },
  inputGroup: {
    gap: Spacing.s,
  },
  label: { 
    ...Typography.label,
    color: Colors.textSecondary,
    fontWeight: '700',
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    paddingHorizontal: Spacing.l,
    paddingVertical: Spacing.m,
    ...Typography.body,
    color: Colors.textPrimary,
    minHeight: 56,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 16,
    paddingHorizontal: Spacing.l,
    gap: 12,
  },
  inlineInput: {
    flex: 1,
    paddingVertical: Spacing.m,
    ...Typography.body,
    color: Colors.textPrimary,
  },
  chipRow: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: Spacing.s,
  },
  chip: { 
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10, 
    paddingHorizontal: 16, 
    borderRadius: 20, 
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  chipActive: { 
    backgroundColor: Colors.brandLight, 
    borderColor: Colors.brand,
  },
  chipText: { 
    ...Typography.label,
    color: Colors.textSecondary, 
    fontWeight: '600' 
  },
  chipTextActive: { 
    color: Colors.brand,
    fontWeight: '700',
  },
  footer: { 
    flexDirection: 'row', 
    paddingVertical: Spacing.l,
    backgroundColor: Colors.surface,
  },
  footerBtn: { 
    flex: 1 
  },
  backBtn: {
    marginRight: Spacing.m,
  },
  daysRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
  },
  dayCircle: { 
    width: 38, 
    height: 38, 
    borderRadius: 19, 
    backgroundColor: Colors.background, 
    alignItems: 'center', 
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dayCircleActive: { 
    backgroundColor: Colors.brand,
    borderColor: Colors.brand,
  },
  dayText: { 
    ...Typography.label,
    color: Colors.textSecondary, 
    fontWeight: '600' 
  },
  dayTextActive: { 
    color: Colors.surface 
  },
});
