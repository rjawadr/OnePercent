import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { ImprovementFrequency } from '../../engine/onePercentEngine';
import { ProjectionCard } from './ProjectionCard';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';

interface CreateHabitStep2Props {
  baseline: string;
  setBaseline: (value: string) => void;
  unit: string;
  setUnit: (value: string) => void;
  goal: string;
  setGoal: (value: string) => void;
  frequency: ImprovementFrequency;
  setFrequency: (value: ImprovementFrequency) => void;
  identity: string;
  setIdentity: (value: string) => void;
}

const FREQUENCY_OPTIONS: { value: ImprovementFrequency; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'none', label: 'None' },
];

export const CreateHabitStep2 = ({
  baseline,
  setBaseline,
  unit,
  setUnit,
  goal,
  setGoal,
  frequency,
  setFrequency,
  identity,
  setIdentity,
}: CreateHabitStep2Props) => {
  const numBaseline = parseFloat(baseline) || 0;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Set your baseline</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>How much can I do now?</Text>
        <View style={styles.fieldRow}>
          <TextInput
            style={[styles.input, styles.flex1]}
            value={baseline}
            onChangeText={setBaseline}
            keyboardType="decimal-pad"
            placeholder="5"
            placeholderTextColor={Colors.textTertiary}
          />
          <TextInput
            style={[styles.input, styles.flex1]}
            value={unit}
            onChangeText={setUnit}
            placeholder="Pages"
            placeholderTextColor={Colors.textTertiary}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>My goal (optional)</Text>
        <TextInput
          style={styles.input}
          value={goal}
          onChangeText={setGoal}
          keyboardType="decimal-pad"
          placeholder="e.g. 100"
          placeholderTextColor={Colors.textTertiary}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Improvement Frequency</Text>
        <View style={styles.chipRow}>
          {FREQUENCY_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.value}
              style={[styles.chip, frequency === opt.value && styles.chipActive]}
              onPress={() => setFrequency(opt.value)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, frequency === opt.value && styles.chipTextActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ProjectionCard
        baseline={numBaseline}
        unit={unit || 'units'}
        frequency={frequency}
      />

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Identity Statement (Optional)</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          value={identity}
          onChangeText={setIdentity}
          placeholder="I am the type of person who..."
          placeholderTextColor={Colors.textTertiary}
          multiline
          numberOfLines={3}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
  fieldRow: { 
    flexDirection: 'row', 
    gap: Spacing.m,
  },
  flex1: { 
    flex: 1 
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
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: Spacing.m,
  },
  chipRow: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: Spacing.m,
  },
  chip: { 
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
    fontWeight: '600' 
  },
  chipTextActive: { 
    color: Colors.brand,
    fontWeight: '700',
  },
});

