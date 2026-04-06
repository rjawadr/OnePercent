import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { Colors, Typography, Spacing } from '../../theme';

interface FearProfileChipProps {
  label: string;
  selected: boolean;
  onToggle: () => void;
  icon?: string;
}

export const FearProfileChip = React.memo(({
  label,
  selected,
  onToggle,
  icon,
}: FearProfileChipProps) => (
  <Pressable
    onPress={onToggle}
    style={({ pressed }) => [
      styles.chip,
      selected && styles.chipSelected,
      pressed && styles.chipPressed,
    ]}
    accessibilityRole="checkbox"
    accessibilityState={{ checked: selected }}
    accessibilityLabel={label}
  >
    {icon && (
      <Icon
        name={icon}
        size={14}
        color={selected ? Colors.brand : Colors.textTertiary}
      />
    )}
    <Text style={[styles.text, selected && styles.textSelected]}>{label}</Text>
    {selected && (
      <Icon name="check" size={12} color={Colors.brand} />
    )}
  </Pressable>
));

export const AddChipButton = ({ onPress, label = 'Add custom' }: { onPress: () => void; label?: string }) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [styles.addChip, pressed && styles.chipPressed]}
    accessibilityLabel={label}
  >
    <Icon name="plus" size={14} color={Colors.brand} />
    <Text style={styles.addText}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: Spacing.s,
    paddingHorizontal: Spacing.m,
    borderRadius: 20,
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  chipSelected: {
    backgroundColor: Colors.brandLight,
    borderColor: Colors.brand + '50',
  },
  chipPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },
  text: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  textSelected: {
    color: Colors.brand,
    fontWeight: '700',
  },
  addChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: Spacing.s,
    paddingHorizontal: Spacing.m,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.brand + '30',
    borderStyle: 'dashed',
  },
  addText: {
    ...Typography.caption,
    color: Colors.brand,
    fontWeight: '600',
  },
});
