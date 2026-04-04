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

  if (baseline <= 0) return null;

  if (frequency === 'none') {
    return (
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Icon name="trending-neutral" size={20} color={Colors.brand} />
          <Text style={styles.header}>Non-Incremental Path</Text>
        </View>
        <Text style={styles.sub}>
          Your habit maintains {baseline} {unit} consistently. Growth starts when you enable the 1% daily compounding logic.
        </Text>
      </View>
    );
  }

  const rows = [
    { label: '30 Days',   value: proj.monthly, icon: 'chart-line', color: '#6366F1', bg: '#6366F108' },
    { label: '90 Days',   value: proj.quarterly, icon: 'chart-box-outline', color: '#8B5CF6', bg: '#8B5CF608' },
    { label: '180 Days',  value: proj.halfYear, icon: 'trending-up', color: '#EC4899', bg: '#EC489908' },
    { label: '365 Days',    value: proj.yearly, icon: 'rocket-launch', color: '#F59E0B', bg: '#F59E0B08' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.titleContainer}>
           <Icon name="auto-fix" size={20} color={Colors.brand} style={styles.sparkleIcon} />
           <Text style={styles.header}>The 1% Vision</Text>
        </View>
        <Text style={styles.subHeader}>Where consistency takes you</Text>
      </View>
      
      <View style={styles.grid}>
        {rows.map(r => (
          <View key={r.label} style={[styles.gridItem, { backgroundColor: r.bg, borderColor: r.color + '15' }]}>
            <View style={styles.itemHeader}>
                <View style={[styles.iconWrapper, { backgroundColor: r.color + '12' }]}>
                    <Icon name={r.icon} size={16} color={r.color} />
                </View>
                <Text style={styles.gridLabel}>{r.label}</Text>
            </View>
            <View style={styles.valueRow}>
               <Text style={[styles.gridValue, { color: Colors.textPrimary }]}>{r.value}</Text>
               <Text style={[styles.gridUnit, { color: r.color }]}>{unit}</Text>
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
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.card,
  },
  headerRow: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  sparkleIcon: {
    opacity: 0.8,
  },
  header: { 
    ...Typography.heading,
    fontSize: 18,
    fontWeight: '900',
    color: Colors.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  subHeader: {
    ...Typography.micro,
    color: Colors.textTertiary,
    fontSize: 11,
    letterSpacing: 1,
    fontWeight: '700',
  },
  sub: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 22,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.m,
  },
  gridItem: {
    width: '47.5%',
    padding: Spacing.m,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridLabel: {
    ...Typography.micro,
    color: Colors.textSecondary,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  gridValue: {
    ...Typography.title,
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 30,
  },
  gridUnit: {
    ...Typography.micro,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'lowercase',
  },
});
