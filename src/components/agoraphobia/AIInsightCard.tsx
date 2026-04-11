import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Feather';
import { Colors, Typography, Spacing } from '../../theme';

interface AIInsightCardProps {
  /** 'tip' for short per-save tip, 'milestone' for full summary */
  type: 'tip' | 'milestone';
  message: string;
  milestoneCount?: number;
}

export function AIInsightCard({ type, message, milestoneCount }: AIInsightCardProps) {
  const isMilestone = type === 'milestone';

  return (
    <Animated.View entering={FadeInDown.duration(400)} style={[styles.card, isMilestone && styles.milestoneCard]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.iconCircle, isMilestone && styles.milestoneIcon]}>
          <Icon
            name={isMilestone ? 'award' : 'zap'}
            size={16}
            color={isMilestone ? Colors.amber : Colors.purple}
          />
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.label, isMilestone && styles.milestoneLabel]}>
            {isMilestone ? (milestoneCount === 0 ? 'GETTING STARTED' : `MILESTONE — ${milestoneCount} RECORDS`) : 'AI INSIGHT'}
          </Text>
          {isMilestone && (
            <Text style={styles.sublabel}>Progress Summary</Text>
          )}
        </View>
      </View>

      {/* Message */}
      <Text style={styles.message}>{message}</Text>

      {/* Footer */}
      <View style={styles.footer}>
        <Icon name="cpu" size={10} color={Colors.textTertiary} />
        <Text style={styles.footerText}>Wellness insight · Not therapy</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.purpleLight,
    borderRadius: 16,
    padding: Spacing.l,
    borderWidth: 1,
    borderColor: Colors.purple + '20',
    gap: 12,
  },
  milestoneCard: {
    backgroundColor: Colors.amberLight,
    borderColor: Colors.amber + '25',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.purple + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  milestoneIcon: {
    backgroundColor: Colors.amber + '20',
  },
  headerText: {
    flex: 1,
  },
  label: {
    ...Typography.micro,
    color: Colors.purple,
    fontWeight: '900',
    letterSpacing: 1.2,
    fontSize: 10,
  },
  milestoneLabel: {
    color: Colors.amber,
  },
  sublabel: {
    ...Typography.micro,
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  message: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontSize: 14,
    lineHeight: 21,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  footerText: {
    ...Typography.micro,
    color: Colors.textTertiary,
    fontSize: 9,
    fontWeight: '600',
  },
});
