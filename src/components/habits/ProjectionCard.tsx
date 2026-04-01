import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { calculateProjections, ImprovementFrequency } from '../../engine/onePercentEngine';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../theme';

interface Props {
  baseline: number;
  unit: string;
  frequency: ImprovementFrequency;
}

export function ProjectionCard({ baseline, unit, frequency }: Props) {
  const proj = calculateProjections(baseline, frequency);

  if (frequency === 'none') {
    return (
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Icon name="trending-neutral" size={24} color={Colors.brand} />
          <Text style={styles.header}>Stable Path</Text>
        </View>
        <Text style={styles.sub}>Your target stays at {baseline} {unit}. You can adjust this later in settings.</Text>
      </View>
    );
  }

  const rows = [
    { label: '30 Days',   value: proj.monthly, icon: 'calendar-month' },
    { label: '90 Days',   value: proj.quarterly, icon: 'chart-box-outline' },
    { label: '6 Months',  value: proj.halfYear, icon: 'trending-up' },
    { label: '1 Year',    value: proj.yearly, icon: 'rocket-launch' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Icon name="auto-fix" size={20} color={Colors.brand} />
        <Text style={styles.header}>The 1% Compound Effect</Text>
      </View>
      
      <View style={styles.grid}>
        {rows.map(r => (
          <View key={r.label} style={styles.gridItem}>
            <View style={styles.itemHeader}>
               <Icon name={r.icon} size={16} color={Colors.textTertiary} />
               <Text style={styles.gridLabel}>{r.label}</Text>
            </View>
            <View style={styles.valueRow}>
               <Text style={styles.gridValue}>{r.value}</Text>
               <Text style={styles.gridUnit}>{unit}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.l,
    marginTop: Spacing.m,
    ...Shadows.card,
    borderWidth: 1,
    borderColor: Colors.brand + '10',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.s,
    marginBottom: Spacing.l,
  },
  header: { 
    ...Typography.label,
    fontWeight: '800',
    color: Colors.brand, 
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sub: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.m,
  },
  gridItem: {
    width: '47%',
    backgroundColor: Colors.background,
    padding: Spacing.m,
    borderRadius: BorderRadius.l,
    alignItems: 'center',
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  gridLabel: {
    ...Typography.micro,
    color: Colors.textSecondary,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  gridValue: {
    ...Typography.heading,
    color: Colors.textPrimary,
    fontSize: 20,
  },
  gridUnit: {
    ...Typography.micro,
    color: Colors.brand,
    fontWeight: '700',
  },
});
