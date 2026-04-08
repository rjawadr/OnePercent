import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Feather';
import { Colors, Typography, Spacing, Shadows, BorderRadius } from '../../theme';
import { SUDSSlider } from './SUDSSlider';

export interface StepInputData {
  id: string; // temporary id for react keys
  name: string;
  location_hint: string;
  difficulty_value: number;
  initial_suds_estimate: number;
}

interface StepInputCardProps {
  step: StepInputData;
  index: number;
  onUpdate: (id: string, updates: Partial<StepInputData>) => void;
  onRemove: (id: string) => void;
  drag?: () => void;
  isActive?: boolean;
}

export function StepInputCard({ step, index, onUpdate, onRemove, drag, isActive }: StepInputCardProps) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const isComplete = step.name.trim().length > 0 && step.difficulty_value > 0;

  return (
    <Animated.View 
      entering={FadeInDown}
      style={[
        styles.card,
        isComplete ? styles.cardComplete : styles.cardIncomplete,
        isActive && styles.cardActive
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.stepTitle}>Step {index + 1}</Text>
        <View style={styles.actions}>
          {drag && (
            <TouchableOpacity onPressIn={drag} style={styles.actionBtn}>
              <Icon name="menu" size={20} color={Colors.textTertiary} />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => setShowConfirmDelete(true)} style={styles.actionBtn}>
            <Icon name="trash-2" size={18} color={Colors.textTertiary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Step name</Text>
        <TextInput
          style={styles.input}
          value={step.name}
          onChangeText={(v) => onUpdate(step.id, { name: v })}
          placeholder="e.g. Walk to end of my street"
          placeholderTextColor={Colors.textTertiary}
          maxLength={80}
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Location</Text>
        <TextInput
          style={styles.input}
          value={step.location_hint}
          onChangeText={(v) => onUpdate(step.id, { location_hint: v })}
          placeholder="e.g. My street"
          placeholderTextColor={Colors.textTertiary}
          maxLength={60}
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Distance target</Text>
        <View style={styles.distanceRow}>
          <TextInput
            style={[styles.input, styles.distanceInput]}
            value={step.difficulty_value ? step.difficulty_value.toString() : ''}
            onChangeText={(v) => {
              const num = parseFloat(v);
              onUpdate(step.id, { difficulty_value: isNaN(num) ? 0 : num });
            }}
            placeholder="50"
            placeholderTextColor={Colors.textTertiary}
            keyboardType="decimal-pad"
          />
          <Text style={styles.unitText}>meters</Text>
        </View>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Starting anxiety (SUDS 0–10)</Text>
        <View style={styles.sliderWrapper}>
          <SUDSSlider
            value={step.initial_suds_estimate}
            onChange={(v) => onUpdate(step.id, { initial_suds_estimate: v })}
            showLabel={false}
          />
        </View>
      </View>

      {showConfirmDelete && (
        <View style={styles.deleteConfirm}>
          <Text style={styles.deleteConfirmText}>Remove this step?</Text>
          <View style={styles.deleteConfirmActions}>
            <TouchableOpacity onPress={() => setShowConfirmDelete(false)} style={styles.confirmBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onRemove(step.id)} style={styles.confirmBtn}>
              <Text style={styles.removeText}>Remove</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.l,
    marginBottom: Spacing.m,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderLeftWidth: 3,
    ...Shadows.card,
  },
  cardComplete: {
    borderLeftColor: Colors.brand,
  },
  cardIncomplete: {
    borderLeftColor: Colors.amber,
  },
  cardActive: {
    borderColor: Colors.brand,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.m,
    paddingBottom: Spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  stepTitle: {
    ...Typography.heading,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  actionBtn: {
    padding: Spacing.xs,
  },
  fieldGroup: {
    marginBottom: Spacing.m,
  },
  label: {
    ...Typography.label,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.l,
    paddingHorizontal: Spacing.m,
    paddingVertical: Spacing.s,
    ...Typography.body,
    color: Colors.textPrimary,
    minHeight: 48,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    fontSize: 16,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.m,
  },
  distanceInput: {
    flex: 1,
  },
  unitText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  sliderWrapper: {
    marginTop: Spacing.xs,
  },
  deleteConfirm: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.background,
    padding: Spacing.s,
    paddingHorizontal: Spacing.m,
    borderRadius: BorderRadius.l,
    marginTop: Spacing.m,
  },
  deleteConfirmText: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  deleteConfirmActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.m,
  },
  confirmBtn: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.s,
  },
  cancelText: {
    ...Typography.label,
    color: Colors.textSecondary,
  },
  removeText: {
    ...Typography.label,
    color: Colors.error,
  },
});
