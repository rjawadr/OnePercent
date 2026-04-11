import React from 'react';
import { View, Text, StyleSheet, TextInput, Pressable } from 'react-native';
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
  { value: 'daily',   label: 'Improve 1% daily' },
  { value: 'weekly',  label: 'Improve 1% weekly' },
  { value: 'monthly', label: 'Improve 1% monthly' },
  { value: 'none',    label: "Don't improve by 1%" },
];


import Animated, { FadeInDown } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

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
    <Animated.View entering={FadeInDown.duration(400)} style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Set your baseline</Text>
        <Text style={styles.sectionSubtitle}>Start small. Win big.</Text>
      </View>

      <View style={styles.inputGroup}>
        <View style={styles.labelRow}>
          <Icon name="rocket-outline" size={18} color={Colors.brand} />
          <Text style={styles.label}>How much can I do now?</Text>
        </View>
        <View style={styles.fieldRow}>
          <TextInput
            style={[styles.input, styles.flex1]}
            value={baseline}
            onChangeText={setBaseline}
            keyboardType="decimal-pad"
            placeholder="5"
            placeholderTextColor={Colors.textTertiary}
            selectionColor={Colors.brand}
          />
          <TextInput
            style={[styles.input, styles.flex2]}
            value={unit}
            onChangeText={setUnit}
            placeholder="Pages"
            placeholderTextColor={Colors.textTertiary}
            selectionColor={Colors.brand}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <View style={styles.labelRow}>
          <Icon name="flag-checkered" size={18} color={Colors.brand} />
          <Text style={styles.label}>End Goal (Optional)</Text>
        </View>
        <TextInput
          style={styles.input}
          value={goal}
          onChangeText={setGoal}
          keyboardType="decimal-pad"
          placeholder="e.g. 100"
          placeholderTextColor={Colors.textTertiary}
          selectionColor={Colors.brand}
        />
      </View>

      <View style={styles.inputGroup}>
        <View style={styles.labelRow}>
          <Icon name="trending-up" size={18} color={Colors.brand} />
          <Text style={styles.label}>Improvement Frequency</Text>
        </View>
        <View style={styles.chipRow}>
          {FREQUENCY_OPTIONS.map(opt => (
            <Pressable
              key={opt.value}
              style={({ pressed }) => [
                styles.chip, 
                frequency === opt.value && styles.chipActive,
                pressed && { transform: [{ scale: 0.96 }], opacity: 0.9 }
              ]}
              onPress={() => setFrequency(opt.value)}
            >
              <Text style={[styles.chipText, frequency === opt.value && styles.chipTextActive]}>
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <ProjectionCard
        baseline={numBaseline}
        unit={unit || 'units'}
        frequency={frequency}
      />

      <View style={styles.inputGroup}>
        <View style={styles.labelRow}>
          <Icon name="account-details-outline" size={18} color={Colors.brand} />
          <Text style={styles.label}>Identity Statement (Optional)</Text>
        </View>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          value={identity}
          onChangeText={setIdentity}
          placeholder="I am the type of person who..."
          placeholderTextColor={Colors.textTertiary}
          multiline
          numberOfLines={3}
          selectionColor={Colors.brand}
        />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
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
  fieldRow: { 
    flexDirection: 'row', 
    gap: 12,
  },
  flex1: { 
    flex: 1 
  },
  flex2: {
    flex: 1.5,
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
  multilineInput: {
    minHeight: 120,
    textAlignVertical: 'top',
    paddingTop: Spacing.l,
  },
  chipRow: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 10,
  },
  chip: { 
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
    fontWeight: '600' 
  },
  chipTextActive: { 
    color: Colors.brand,
    fontWeight: '700',
  },
});

