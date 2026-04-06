import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import Animated, { withRepeat, withSequence, withTiming, useAnimatedStyle } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Feather';
import { Colors, Typography, Spacing } from '../../theme';
import { ExposureStep } from '../../models/ExposureStep';

interface ProgressLadderProps {
  steps: ExposureStep[];
  currentStepId?: string;
  onStepPress?: (step: ExposureStep) => void;
}

const NODE_SIZE = 40;
const CONNECTOR_WIDTH = 32;

export const ProgressLadder = ({ steps, currentStepId, onStepPress }: ProgressLadderProps) => {
  if (!steps.length) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {steps.map((step, index) => {
        const isCurrent = step.id === currentStepId;
        const isLast = index === steps.length - 1;

        return (
          <View key={step.id} style={styles.nodeGroup}>
            {/* Step Node */}
            <Pressable
              onPress={() => onStepPress?.(step)}
              disabled={!step.is_unlocked}
              accessibilityLabel={`Step ${index + 1}: ${step.name}`}
            >
              {isCurrent ? (
                <PulsingNode index={index} />
              ) : (
                <View
                  style={[
                    styles.node,
                    !step.is_unlocked && styles.nodeLocked,
                    step.is_unlocked && !step.is_mastered && styles.nodeUnlocked,
                    step.is_mastered && styles.nodeMastered,
                  ]}
                >
                  {step.is_mastered ? (
                    <Icon name="check" size={16} color={Colors.surface} />
                  ) : !step.is_unlocked ? (
                    <Icon name="lock" size={14} color={Colors.textTertiary} />
                  ) : (
                    <Text style={styles.nodeText}>{index + 1}</Text>
                  )}
                </View>
              )}
            </Pressable>

            {/* Step label */}
            <Text
              style={[
                styles.stepLabel,
                !step.is_unlocked && styles.stepLabelLocked,
                isCurrent && styles.stepLabelCurrent,
              ]}
              numberOfLines={2}
            >
              {step.name}
            </Text>

            {/* Connector line */}
            {!isLast && (
              <View
                style={[
                  styles.connector,
                  steps[index + 1]?.is_unlocked
                    ? styles.connectorActive
                    : styles.connectorInactive,
                ]}
              />
            )}
          </View>
        );
      })}
    </ScrollView>
  );
};

const PulsingNode = ({ index }: { index: number }) => {
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withRepeat(
          withSequence(
            withTiming(1.15, { duration: 800 }),
            withTiming(1.0, { duration: 800 })
          ),
          -1,
          true
        ),
      },
    ],
  }));

  return (
    <Animated.View style={[styles.node, styles.nodeCurrent, pulseStyle]}>
      <Text style={[styles.nodeText, { color: Colors.surface }]}>{index + 1}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.l,
    paddingVertical: Spacing.m,
    gap: 0,
  },
  nodeGroup: {
    alignItems: 'center',
    width: 72,
  },
  node: {
    width: NODE_SIZE,
    height: NODE_SIZE,
    borderRadius: NODE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  nodeLocked: {
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  nodeUnlocked: {
    borderColor: Colors.brand + '60',
    backgroundColor: Colors.brandLight,
  },
  nodeMastered: {
    borderColor: Colors.brand,
    backgroundColor: Colors.brand,
  },
  nodeCurrent: {
    borderColor: Colors.brand,
    backgroundColor: Colors.brand,
    shadowColor: Colors.brand,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  nodeText: {
    ...Typography.label,
    color: Colors.brand,
    fontWeight: '800',
    fontSize: 14,
  },
  stepLabel: {
    ...Typography.micro,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
    width: 72,
    fontSize: 9,
    textTransform: 'none',
  },
  stepLabelLocked: {
    color: Colors.textTertiary,
  },
  stepLabelCurrent: {
    color: Colors.brand,
    fontWeight: '800',
  },
  connector: {
    position: 'absolute',
    top: NODE_SIZE / 2 - 1,
    right: -CONNECTOR_WIDTH / 2,
    width: CONNECTOR_WIDTH,
    height: 2,
  },
  connectorActive: {
    backgroundColor: Colors.brand + '40',
  },
  connectorInactive: {
    backgroundColor: Colors.border,
  },
});
