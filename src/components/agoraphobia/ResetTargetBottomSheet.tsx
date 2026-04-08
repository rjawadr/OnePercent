import React, { useState, useCallback, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import Icon from 'react-native-vector-icons/Feather';
import { Colors, Typography, Spacing } from '../../theme';
import { Button } from '../ui/Button';
import { useAgoraphobiaStore } from '../../store/agoraphobiaStore';

interface ResetTargetBottomSheetProps {
  stepId: string;
  currentValue: number;
  unit: string;
  onClose: () => void;
}

export const ResetTargetBottomSheet = ({
  stepId,
  currentValue,
  unit,
  onClose,
}: ResetTargetBottomSheetProps) => {
  const [stage, setStage] = useState<1 | 2 | 3>(1);
  const [newTarget, setNewTarget] = useState<number>(Math.max(1, currentValue - 1));
  const { resetStepTarget } = useAgoraphobiaStore();

  const handleReset = async () => {
    await resetStepTarget(stepId, newTarget);
    onClose();
  };

  const renderContent = () => {
    switch (stage) {
      case 1:
        return (
          <View style={styles.stageContainer}>
            <View style={styles.iconCircle}>
              <Icon name="activity" size={32} color={Colors.amber} />
            </View>
            <Text style={styles.title}>Plateaus are normal</Text>
            <Text style={styles.description}>
              The "Plateau of Latent Potential" means you are making progress we just can't see yet. Resetting your target drops your mastery to 0.
            </Text>
            <View style={styles.buttonGroup}>
              <Button title="Keep Going" onPress={onClose} style={styles.button} />
              <Button
                title="I need to reset"
                type="secondary"
                onPress={() => setStage(2)}
                textStyle={{ color: Colors.amber }}
                style={styles.button}
              />
            </View>
          </View>
        );
      case 2:
        return (
          <View style={styles.stageContainer}>
            <Text style={styles.title}>Adjust your target</Text>
            <Text style={styles.description}>
              Find a baseline where you feel challenged but confident.
            </Text>

            <View style={styles.stepperContainer}>
              <Pressable
                style={styles.stepperButton}
                onPress={() => setNewTarget(Math.max(1, newTarget - 1))}
              >
                <Icon name="minus" size={24} color={Colors.textPrimary} />
              </Pressable>
              
              <View style={styles.stepperValueContainer}>
                <Text style={styles.newTargetText}>{newTarget}</Text>
                <Text style={styles.unitText}>{unit}</Text>
              </View>

              <Pressable
                style={styles.stepperButton}
                onPress={() => setNewTarget(newTarget + 1)}
              >
                <Icon name="plus" size={24} color={Colors.textPrimary} />
              </Pressable>
            </View>

            <View style={styles.buttonGroup}>
              <Button title="Continue" onPress={() => setStage(3)} style={styles.button} />
              <Button title="Cancel" type="secondary" onPress={onClose} style={styles.button} />
            </View>
          </View>
        );
      case 3:
        return (
          <View style={styles.stageContainer}>
            <View style={styles.iconCircle}>
              <Icon name="refresh-cw" size={32} color={Colors.brand} />
            </View>
            <Text style={styles.title}>Confirm New Target</Text>
            <Text style={styles.description}>
              Your efforts so far will be logged forever in the charts. Resetting your current target to <Text style={styles.highlight}>{newTarget} {unit}</Text>.
            </Text>
            <View style={styles.buttonGroup}>
              <Button
                title="Reset & Restart"
                onPress={handleReset}
                style={styles.button}
              />
              <Button title="Cancel" type="secondary" onPress={onClose} style={styles.button} />
            </View>
          </View>
        );
    }
  };

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />
    ),
    []
  );

  return (
    <BottomSheet
      index={0}
      snapPoints={['50%']}
      enablePanDownToClose
      onClose={onClose}
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.sheetBackground}
      handleIndicatorStyle={styles.indicator}
    >
      <BottomSheetView style={styles.contentContainer}>
        {renderContent()}
      </BottomSheetView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: Colors.surface,
  },
  indicator: {
    backgroundColor: Colors.textTertiary,
  },
  contentContainer: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  stageContainer: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.l,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  title: {
    ...Typography.heading,
    fontSize: 24,
    color: Colors.textPrimary,
    marginBottom: Spacing.s,
    textAlign: 'center',
  },
  description: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
    textAlign: 'center',
    lineHeight: 22,
  },
  highlight: {
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  buttonGroup: {
    width: '100%',
    gap: Spacing.m,
  },
  button: {
    width: '100%',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: Colors.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.m,
    marginBottom: Spacing.xxl,
  },
  stepperButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stepperValueContainer: {
    alignItems: 'center',
  },
  newTargetText: {
    ...Typography.heading,
    fontSize: 32,
    color: Colors.textPrimary,
  },
  unitText: {
    ...Typography.caption,
    color: Colors.textTertiary,
  },
});
