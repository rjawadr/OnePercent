import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import Icon from 'react-native-vector-icons/Feather';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from '@react-native-community/blur';
import { Colors, Typography, Spacing, Shadows } from '../../theme';
import { Button } from '../ui/Button';
import { useAgoraphobiaStore } from '../../store/agoraphobiaStore';

interface ResetTargetBottomSheetProps {
  stepId: string;
  currentValue: number;
  unit: string;
  onClose: () => void;
}

const GlassBackground = ({ style, ...props }: any) => (
  <View style={[style, { overflow: 'hidden', borderRadius: 32 }]}>
    <BlurView
      style={StyleSheet.absoluteFill}
      blurType="dark"
      blurAmount={25}
      reducedTransparencyFallbackColor="black"
    />
    <View 
      style={[
        StyleSheet.absoluteFill, 
        { 
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderWidth: 1.5,
          borderColor: 'rgba(255, 255, 255, 0.1)',
        }
      ]} 
    />
  </View>
);

export const ResetTargetBottomSheet = ({
  stepId,
  currentValue,
  unit,
  onClose,
}: ResetTargetBottomSheetProps) => {
  const [stage, setStage] = useState<1 | 2 | 3>(1);
  const [newTarget, setNewTarget] = useState<number>(Math.max(1, currentValue - 1));
  const { resetStepTarget } = useAgoraphobiaStore();
  const insets = useSafeAreaInsets();

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
              <Icon name="trending-down" size={32} color={Colors.amber} />
            </View>
            <Text style={styles.title}>Plateaus are normal</Text>
            <Text style={styles.description}>
              The "Plateau of Latent Potential" means you are making progress we just can't see yet. Resetting drops mastery to zero.
            </Text>
            <View style={styles.buttonGroup}>
              <Button 
                title="Trust the Process" 
                onPress={onClose} 
                style={styles.button} 
              />
              <Button
                title="Adjust Baseline"
                type="secondary"
                onPress={() => setStage(2)}
                textStyle={{ color: 'rgba(255,255,255,0.6)' }}
                style={styles.ghostButton}
              />
            </View>
          </View>
        );
      case 2:
        return (
          <View style={styles.stageContainer}>
            <Text style={styles.title}>Adjust Baseline</Text>
            <Text style={styles.description}>
              Find a challenge level where you feel confident but sharp.
            </Text>

            <View style={styles.stepperContainer}>
              <Pressable
                style={styles.stepperButton}
                onPress={() => setNewTarget(Math.max(1, newTarget - 1))}
              >
                <Icon name="minus" size={24} color="#fff" />
              </Pressable>
              
              <View style={styles.stepperValueContainer}>
                <Text style={styles.newTargetText}>{newTarget}</Text>
                <Text style={styles.unitText}>{unit}</Text>
              </View>

              <Pressable
                style={styles.stepperButton}
                onPress={() => setNewTarget(newTarget + 1)}
              >
                <Icon name="plus" size={24} color="#fff" />
              </Pressable>
            </View>

            <View style={styles.buttonGroup}>
              <Button title="Next Step" onPress={() => setStage(3)} style={styles.button} />
              <Button title="Cancel" type="secondary" onPress={onClose} style={styles.ghostButton} />
            </View>
          </View>
        );
      case 3:
        return (
          <View style={styles.stageContainer}>
            <View style={[styles.iconCircle, { borderColor: Colors.brand + '40' }]}>
              <Icon name="zap" size={32} color={Colors.brand} />
            </View>
            <Text style={styles.title}>Confirm Shift</Text>
            <Text style={styles.description}>
              Your current target will be recalibrated to <Text style={styles.highlight}>{newTarget} {unit}</Text>. Previous wins remain logged.
            </Text>
            <View style={styles.buttonGroup}>
              <Button
                title="Confirm & Restart"
                onPress={handleReset}
                style={styles.button}
              />
              <Button title="Back" type="secondary" onPress={() => setStage(2)} style={styles.ghostButton} />
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
      snapPoints={['55%']}
      enablePanDownToClose
      onClose={onClose}
      backdropComponent={renderBackdrop}
      backgroundComponent={GlassBackground}
      handleIndicatorStyle={styles.indicator}
      bottomInset={64 + Math.max(insets.bottom, 12) + 16}
      detached={true}
      style={{ marginHorizontal: Spacing.m }}
    >
      <BottomSheetView style={styles.contentContainer}>
        {renderContent()}
      </BottomSheetView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  indicator: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 40,
    height: 4,
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
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.l,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  title: {
    ...Typography.heading,
    fontSize: 24,
    color: '#fff',
    marginBottom: Spacing.s,
    fontWeight: '900',
    textAlign: 'center',
  },
  description: {
    ...Typography.body,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: Spacing.xl,
    textAlign: 'center',
    lineHeight: 22,
    fontSize: 14,
  },
  highlight: {
    fontWeight: '900',
    color: Colors.brand,
  },
  buttonGroup: {
    width: '100%',
    gap: 12,
  },
  button: {
    width: '100%',
    borderRadius: 20,
    height: 56,
  },
  ghostButton: {
    width: '100%',
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: Spacing.m,
    marginBottom: Spacing.xxl,
  },
  stepperButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  stepperValueContainer: {
    alignItems: 'center',
  },
  newTargetText: {
    ...Typography.heading,
    fontSize: 36,
    color: '#fff',
    fontWeight: '900',
  },
  unitText: {
    ...Typography.micro,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '800',
    textTransform: 'uppercase',
  },
});
