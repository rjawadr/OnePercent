import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Platform, KeyboardAvoidingView } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Layout } from '../components/ui/Layout';
import { Button } from '../components/ui/Button';
import { ProjectionCard } from '../components/habits/ProjectionCard';
import { Colors, Typography, Spacing, Shadows, BorderRadius } from '../theme';
import { useAgoraphobiaStore } from '../store/agoraphobiaStore';
import { StepInputData } from '../components/agoraphobia/StepInputCard';

function StepIndicator({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  return (
    <View style={styles.indicatorContainer}>
      {Array.from({ length: totalSteps }).map((_, i) => (
        <React.Fragment key={i}>
          <View style={[
            styles.indicatorDot,
            i === currentStep && styles.indicatorDotActive,
            i < currentStep && styles.indicatorDotCompleted
          ]} />
          {i < totalSteps - 1 && (
            <View style={[
              styles.indicatorLine,
              i < currentStep && styles.indicatorLineActive
            ]} />
          )}
        </React.Fragment>
      ))}
    </View>
  );
}

export const CustomGoalReviewScreen = ({ route, navigation }: any) => {
  const params = route.params as {
    goalName: string;
    goalDescription: string;
    goalIcon: string;
    startingLocation: string;
    finalLocation: string;
    steps: StepInputData[];
    safetySignals: string[];
  };

  const { createCustomGoalLadder } = useAgoraphobiaStore();
  const [identityStatement, setIdentityStatement] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBeginProgram = async () => {
    try {
      setIsSubmitting(true);
      const firstStepId = await createCustomGoalLadder({
        goalName: params.goalName,
        goalDescription: params.goalDescription,
        goalIcon: params.goalIcon,
        startingLocation: params.startingLocation,
        finalLocation: params.finalLocation,
        safetySignals: params.safetySignals,
        identityStatement: identityStatement.trim() || undefined,
        steps: params.steps,
      });

      // TODO: show a brief success toast? 
      // The prompt says "Show a brief success toast... Navigate to ExposureLadderScreen with { highlight: newSteps[0].id }"

      // Navigate to ExposureLadderScreen
      // If we goBack it might just go to setup. We want to pop back to ExposureLadder.
      navigation.navigate('ExposureLadder', {
        highlight: firstStepId,
        showSuccessToast: true
      });
    } catch (error) {
      console.error('Error creating custom goal', error);
      setIsSubmitting(false);
    }
  };

  const baselineDistance = params.steps[0]?.difficulty_value || 0;

  return (
    <Layout>
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.backBtn}>
          <Icon name="arrow-left" size={24} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.topBarTitle}>Review your program</Text>
        <Pressable
          onPress={handleBeginProgram}
          disabled={isSubmitting}
          style={styles.iconPlaceholder}
        >
          <Icon name="check" size={24} color={Colors.brand} />
        </Pressable>
      </View>

      <View style={styles.stepIndicatorWrapper}>
        <StepIndicator currentStep={1} totalSteps={2} />
      </View>

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} bounces={false} overScrollMode="never">
          <Animated.View entering={FadeInDown.delay(100)} style={styles.goalCard}>
            <View style={styles.goalCardHeader}>
              <View style={styles.iconCircle}>
                <MaterialCommunityIcons name={params.goalIcon as any} size={32} color={Colors.brand} />
              </View>
              <View style={styles.goalCardTitleArea}>
                <Text style={styles.goalName}>{params.goalName}</Text>
                <Text style={styles.goalDesc}>{params.goalDescription}</Text>
              </View>
            </View>

            <View style={styles.goalStatsRow}>
              <Text style={styles.goalStatsText}>
                {params.steps.length} steps  ·  meters  ·
              </Text>
              <View style={styles.customBadge}>
                <Text style={styles.customBadgeText}>Custom</Text>
              </View>
            </View>

            {(params.startingLocation || params.finalLocation) && (
              <View style={styles.locationsBox}>
                <Text style={styles.locationText}>
                  <Text style={styles.locationLabel}>From: </Text>
                  {params.startingLocation}
                </Text>
                {params.finalLocation && (
                  <Text style={styles.locationText}>
                    <Text style={styles.locationLabel}>To: </Text>
                    {params.finalLocation}
                  </Text>
                )}
              </View>
            )}
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200)} style={styles.stepsPreview}>
            {params.steps.map((step, index) => (
              <View key={step.id} style={styles.stepPreviewRow}>
                <Icon
                  name={index === 0 ? "unlock" : "lock"}
                  size={16}
                  color={index === 0 ? Colors.brand : Colors.textTertiary}
                  style={styles.stepPreviewIcon}
                />
                <Text style={styles.stepPreviewNumber}>Step {index + 1}</Text>
                <Text style={styles.stepPreviewName} numberOfLines={1}>{step.name}</Text>
                <Text style={styles.stepPreviewDist}>{step.difficulty_value}m</Text>
                <Text style={styles.stepPreviewSuds}>SUDS {step.initial_suds_estimate}</Text>
              </View>
            ))}
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300)} style={styles.projectionSection}>
            <Text style={styles.projectionLabel}>
              Starting at {baselineDistance}m, here is where daily 1% practice takes step 1:
            </Text>
            <ProjectionCard
              baseline={baselineDistance}
              unit="meters"
              frequency="daily"
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400)} style={styles.identitySection}>
            <Text style={styles.identityLabel}>I am someone who...</Text>
            <Text style={styles.identitySubtitle}>(Optional) Shown in your coaching nudges during sessions.</Text>
            <TextInput
              style={styles.input}
              value={identityStatement}
              onChangeText={setIdentityStatement}
              placeholder="...can leave my home and move through the world."
              placeholderTextColor={Colors.textTertiary}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(500)} style={styles.disclaimerSection}>
            <Text style={styles.disclaimerText}>
              This program is a wellness tool, not a medical device.{'\n'}
              It does not replace professional therapy or clinical advice.
            </Text>
          </Animated.View>
        </ScrollView>

      </KeyboardAvoidingView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.m,
    paddingBottom: Spacing.s,
  },
  topBarTitle: {
    ...Typography.heading,
    fontSize: 18,
    color: Colors.textPrimary,
  },
  backBtn: {
    padding: Spacing.xs,
  },
  stepIndicatorWrapper: {
    alignItems: 'center',
    paddingBottom: Spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  indicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: 60,
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  indicatorDotActive: {
    width: 28,
    backgroundColor: Colors.brand,
  },
  indicatorDotCompleted: {
    backgroundColor: Colors.brand,
  },
  indicatorLine: {
    flex: 1,
    height: 3,
    backgroundColor: Colors.border,
    borderRadius: 1.5,
  },
  indicatorLineActive: {
    backgroundColor: Colors.brand,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },

  // Goal Card
  goalCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xxl,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.card,
  },
  goalCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.m,
    marginBottom: Spacing.m,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.brandLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalCardTitleArea: {
    flex: 1,
  },
  goalName: {
    ...Typography.heading,
    fontSize: 18,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  goalDesc: {
    ...Typography.body,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  goalStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.l,
  },
  goalStatsText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  customBadge: {
    backgroundColor: Colors.amberLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.s,
  },
  customBadgeText: {
    ...Typography.micro,
    color: Colors.amber,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  locationsBox: {
    backgroundColor: Colors.background,
    padding: Spacing.m,
    borderRadius: BorderRadius.m,
    gap: Spacing.xs,
  },
  locationText: {
    ...Typography.body,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  locationLabel: {
    fontWeight: '700',
    color: Colors.textSecondary,
  },

  // Steps
  stepsPreview: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.l,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: Spacing.m,
    ...Shadows.card,
  },
  stepPreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.m,
  },
  stepPreviewIcon: {
    width: 20,
  },
  stepPreviewNumber: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.textSecondary,
    width: 50,
  },
  stepPreviewName: {
    flex: 1,
    ...Typography.body,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  stepPreviewDist: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.textSecondary,
    width: 45,
    textAlign: 'right',
  },
  stepPreviewSuds: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.textSecondary,
    width: 55,
    textAlign: 'right',
  },

  // Projection
  projectionSection: {
    marginBottom: Spacing.xl,
  },
  projectionLabel: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.m,
  },

  // Identity
  identitySection: {
    marginBottom: Spacing.xl,
  },
  identityLabel: {
    ...Typography.label,
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  identitySubtitle: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginBottom: Spacing.s,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.l,
    paddingHorizontal: Spacing.l,
    paddingVertical: Spacing.m,
    ...Typography.body,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },

  // Disclaimer
  disclaimerSection: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.m,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  disclaimerText: {
    ...Typography.caption,
    color: Colors.textTertiary,
    textAlign: 'center',
    lineHeight: 18,
  },

  footer: {
    flexDirection: 'row',
    padding: Spacing.xl,
    paddingTop: Spacing.m,
    paddingBottom: Spacing.xl,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    gap: Spacing.l,
    ...Shadows.card,
  },
  footerBtn: {
    flex: 1,
  },
  iconPlaceholder: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
