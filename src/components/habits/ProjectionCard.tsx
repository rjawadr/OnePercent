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
          <Text style={styles.header}>No Improvement Selected</Text>
        </View>
        <Text style={styles.sub}>
          Your habit maintains {baseline} {unit} consistently.
          Enable 1% compounding to see what steady effort produces.
        </Text>
      </View>
    );
  }

  // Compute multiplier label for footer
  const multiplierMap: Record<ImprovementFrequency, string> = {
    daily:   '1.01^365 = 37.78×',
    weekly:  '1.01^52 = 1.68×',
    monthly: '1.01^12 = 1.13×',
    none:    '',
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleContainer}>
          <Icon name="auto-fix" size={20} color={Colors.brand} style={styles.sparkleIcon} />
          <Text style={styles.header}>The 1% Vision</Text>
        </View>
        <Text style={styles.subHeader}>Where consistency takes you</Text>
      </View>

      {/* Top row — 30 days (small) + 90 days (hero) */}
      <View style={styles.topRow}>
        <View style={[styles.smallCard, { backgroundColor: '#6366F108', borderColor: '#6366F115' }]}>
          <View style={styles.itemHeader}>
            <View style={[styles.iconWrapper, { backgroundColor: '#6366F112' }]}>
              <Icon name="chart-line" size={14} color="#6366F1" />
            </View>
            <Text style={styles.gridLabel}>30 days</Text>
          </View>
          <View style={styles.valueRow}>
            <Text style={[styles.smallValue, { color: Colors.textPrimary }]}>{proj.monthly}</Text>
            <Text style={[styles.gridUnit, { color: '#6366F1' }]}>{unit}</Text>
          </View>
        </View>

        <View style={[styles.heroCard, { backgroundColor: '#8B5CF608', borderColor: '#8B5CF615' }]}>
          <View style={styles.itemHeader}>
            <View style={[styles.iconWrapper, { backgroundColor: '#8B5CF612' }]}>
              <Icon name="chart-box-outline" size={14} color="#8B5CF6" />
            </View>
            <Text style={styles.gridLabel}>90 days</Text>
          </View>
          <View style={styles.valueRow}>
            <Text style={[styles.heroValue, { color: Colors.textPrimary }]}>{proj.quarterly}</Text>
            <Text style={[styles.gridUnit, { color: '#8B5CF6' }]}>{unit}</Text>
          </View>
          <Text style={styles.quarterBadge}>3 months</Text>
        </View>
      </View>

      {/* Bottom row — 180 days + 365 days (biggest hero) */}
      <View style={styles.bottomRow}>
        <View style={[styles.halfCard, { backgroundColor: '#EC489908', borderColor: '#EC489915' }]}>
          <View style={styles.itemHeader}>
            <View style={[styles.iconWrapper, { backgroundColor: '#EC489912' }]}>
              <Icon name="trending-up" size={14} color="#EC4899" />
            </View>
            <Text style={styles.gridLabel}>180 days</Text>
          </View>
          <View style={styles.valueRow}>
            <Text style={[styles.halfValue, { color: Colors.textPrimary }]}>{proj.halfYear}</Text>
            <Text style={[styles.gridUnit, { color: '#EC4899' }]}>{unit}</Text>
          </View>
        </View>

        <View style={[styles.yearCard, { backgroundColor: '#F59E0B10', borderColor: '#F59E0B20' }]}>
          <View style={styles.yearBadge}>
            <Icon name="rocket-launch" size={12} color={Colors.amber} />
            <Text style={styles.yearBadgeText}>1 FULL YEAR</Text>
          </View>
          <View style={styles.yearValueRow}>
            <Text style={[styles.yearValue, { color: Colors.textPrimary }]}>{proj.yearly}</Text>
            <Text style={[styles.yearUnit, { color: Colors.amber }]}>{unit}</Text>
          </View>
          <Text style={styles.yearMultiplier}>37.78× your start</Text>
        </View>
      </View>

      {/* Footer motivation line */}
      <View style={styles.footerRow}>
        <Icon name="information-outline" size={16} color={Colors.textTertiary} />
        <Text style={styles.footerText}>
          {multiplierMap[frequency]} — small steps, radical change.
        </Text>
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
  gridUnit: {
    ...Typography.micro,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'lowercase',
  },
  topRow: {
    flexDirection: 'row',
    gap: Spacing.m,
    marginBottom: Spacing.m,
  },
  bottomRow: {
    flexDirection: 'row',
    gap: Spacing.m,
    marginBottom: Spacing.l,
  },
  smallCard: {
    flex: 0.85,
    padding: Spacing.m,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
  },
  heroCard: {
    flex: 1.15,
    padding: Spacing.m,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
  },
  halfCard: {
    flex: 1,
    padding: Spacing.m,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
  },
  yearCard: {
    flex: 1,
    padding: Spacing.m,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    borderColor: Colors.amber + '25',
  },
  smallValue: {
    ...Typography.title,
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 26,
  },
  heroValue: {
    ...Typography.title,
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 32,
  },
  halfValue: {
    ...Typography.title,
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 28,
  },
  yearValue: {
    ...Typography.title,
    fontSize: 32,
    fontWeight: '900',
    lineHeight: 36,
  },
  yearUnit: {
    ...Typography.micro,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'lowercase',
    alignSelf: 'flex-end',
    marginBottom: 4,
    marginLeft: 4,
  },
  yearMultiplier: {
    ...Typography.micro,
    fontSize: 10,
    color: Colors.amber,
    fontWeight: '800',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  yearBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  yearBadgeText: {
    ...Typography.micro,
    fontSize: 9,
    color: Colors.amber,
    fontWeight: '900',
    letterSpacing: 1,
  },
  quarterBadge: {
    ...Typography.micro,
    fontSize: 9,
    color: '#8B5CF6',
    fontWeight: '700',
    marginTop: 4,
  },
  yearValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: Spacing.m,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  footerText: {
    ...Typography.micro,
    color: Colors.textTertiary,
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },
});
