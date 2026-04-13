import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Platform,
  KeyboardAvoidingView, Dimensions,
} from 'react-native';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Feather';
import { Layout } from '../components/ui/Layout';
import { Button } from '../components/ui/Button';
import { Colors, Typography, Spacing, Shadows } from '../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { db } from '../db/client';

const { width } = Dimensions.get('window');
const TOTAL_STEPS = 5;

const MYTHS = [
  { myth: "It's just being afraid of open spaces", truth: "It's a fear of being in places where escape might be difficult or help unavailable." },
  { myth: "You must be housebound", truth: "Many agoraphobics function by using 'safety signals' or sticking to small 'safe zones'." },
  { myth: "It's the same as social anxiety", truth: "Social anxiety is about judgment; agoraphobia is about safety and symptom attacks." },
  { myth: "It goes away with rest", truth: "Rest and avoidance actually fuel the fear loop. Active exposure is the only cure." },
];

export const FearEducationScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      navigation.goBack();
    }
  };

  const handleComplete = async () => {
    try {
      await db.executeAsync(
        "INSERT OR REPLACE INTO kv_store (key, value) VALUES ('agoraphobia_education_seen', 'true')"
      );
      navigation.replace('FearProfileOnboarding');
    } catch (e) {
      console.error('Failed to save education status', e);
      navigation.replace('FearProfileOnboarding');
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <Animated.View entering={FadeInRight} exiting={FadeOutLeft} style={styles.stepContainer}>
            <Icon name="help-circle" size={48} color={Colors.brand} style={styles.headerIcon} />
            <Text style={styles.title}>What Is Agoraphobia?</Text>
            <Text style={styles.subtitle}>Let's start by clearing up some common misconceptions.</Text>
            
            <View style={styles.mythsContainer}>
              {MYTHS.map((m, i) => (
                <View key={i} style={styles.mythCard}>
                  <View style={styles.mythHeader}>
                    <Icon name="x-circle" size={16} color={Colors.amber} />
                    <Text style={styles.mythText}>{m.myth}</Text>
                  </View>
                  <View style={styles.truthRow}>
                    <Icon name="check-circle" size={16} color={Colors.brand} />
                    <Text style={styles.truthText}>{m.truth}</Text>
                  </View>
                </View>
              ))}
            </View>
            
            <View style={styles.highlightCard}>
              <Text style={styles.highlightText}>
                Key Message: It's not the places you fear—it's the fear of having a symptom attack without escape.
              </Text>
            </View>
          </Animated.View>
        );

      case 1:
        return (
          <Animated.View entering={FadeInRight} style={styles.stepContainer}>
            <Icon name="layers" size={48} color={Colors.brand} style={styles.headerIcon} />
            <Text style={styles.title}>The 4-Component Model</Text>
            <Text style={styles.subtitle}>Anxiety isn't one thing—it's a sequence of signals.</Text>
            
            <View style={styles.modelContainer}>
              <View style={styles.modelStep}>
                <View style={styles.modelCircle}><Icon name="external-link" size={20} color={Colors.surface} /></View>
                <View style={styles.modelInfo}>
                  <Text style={styles.modelLabel}>External Signal</Text>
                  <Text style={styles.modelDesc}>"I'm in a crowded supermarket."</Text>
                </View>
              </View>
              <View style={styles.modelConnector} />
              <View style={styles.modelStep}>
                <View style={styles.modelCircle}><Icon name="activity" size={20} color={Colors.surface} /></View>
                <View style={styles.modelInfo}>
                  <Text style={styles.modelLabel}>Internal Signal</Text>
                  <Text style={styles.modelDesc}>Dizziness or a racing heart starts.</Text>
                </View>
              </View>
              <View style={styles.modelConnector} />
              <View style={styles.modelStep}>
                <View style={[styles.modelCircle, { backgroundColor: Colors.amber }]}><Icon name="alert-triangle" size={20} color={Colors.surface} /></View>
                <View style={styles.modelInfo}>
                  <Text style={styles.modelLabel}>Feared Attack</Text>
                  <Text style={styles.modelDesc}>"I'm going to faint or lose control."</Text>
                </View>
              </View>
              <View style={styles.modelConnector} />
              <View style={styles.modelStep}>
                <View style={[styles.modelCircle, { backgroundColor: Colors.brandDark }]}><Icon name="frown" size={20} color={Colors.surface} /></View>
                <View style={styles.modelInfo}>
                  <Text style={styles.modelLabel}>Catastrophe</Text>
                  <Text style={styles.modelDesc}>"I'll be humiliated and no one will help."</Text>
                </View>
              </View>
            </View>

            <View style={styles.exampleBox}>
              <Text style={styles.exampleTitle}>Example: Ann's Story</Text>
              <Text style={styles.exampleText}>Ann feared vomiting in public. When she felt slightly nauseous (Internal), she imagined a full scene (Attack) and concluded her life would be over (Catastrophe).</Text>
            </View>
          </Animated.View>
        );

      case 2:
        return (
          <Animated.View entering={FadeInRight} style={styles.stepContainer}>
            <Icon name="refresh-cw" size={48} color={Colors.brand} style={styles.headerIcon} />
            <Text style={styles.title}>The Avoidance Loop</Text>
            <Text style={styles.subtitle}>Why the fear persists even when nothing happens.</Text>
            
            <View style={styles.loopContainer}>
              <View style={styles.loopBox}>
                <Text style={styles.loopTitle}>Danger Signal</Text>
                <Text style={styles.loopSub}>Crossing a bridge</Text>
              </View>
              <Icon name="arrow-down" size={20} color={Colors.textTertiary} />
              <View style={styles.loopBox}>
                <Text style={styles.loopTitle}>Anxiety Spikes</Text>
                <Text style={styles.loopSub}>Panic sets in</Text>
              </View>
              <Icon name="arrow-down" size={20} color={Colors.textTertiary} />
              <View style={[styles.loopBox, { backgroundColor: Colors.amberLight, borderColor: Colors.amber }]}>
                <Text style={[styles.loopTitle, { color: Colors.amber }]}>AVOIDANCE</Text>
                <Text style={styles.loopSub}>Turn around immediately</Text>
              </View>
              <Icon name="arrow-down" size={20} color={Colors.textTertiary} />
              <View style={styles.loopBox}>
                <Text style={styles.loopTitle}>No Correction</Text>
                <Text style={styles.loopSub}>You never learn it was safe</Text>
              </View>
            </View>

            <View style={styles.quoteBox}>
              <Text style={styles.quoteText}>"Avoidance is the fuel. Exposure is the exit."</Text>
            </View>

            <View style={styles.parableBox}>
              <Text style={styles.parableText}>
                Remember Fred's elephant gun? He snaps his fingers to keep elephants away in London. Because no elephants appear, he thinks the snapping works! Avoidance works the same way.
              </Text>
            </View>
          </Animated.View>
        );

      case 3:
        return (
          <Animated.View entering={FadeInRight} style={styles.stepContainer}>
            <Icon name="trending-up" size={48} color={Colors.brand} style={styles.headerIcon} />
            <Text style={styles.title}>How Exposure Works</Text>
            <Text style={styles.subtitle}>Recovery is a science of habituation.</Text>
            
            <View style={styles.graphPlaceholder}>
              <View style={styles.graphYAxis} />
              <View style={styles.graphXAxis} />
              <Text style={styles.graphLabelY}>Anxiety</Text>
              <Text style={styles.graphLabelX}>Time</Text>
              {/* Simplified Graph Line */}
              <View style={styles.graphLineContainer}>
                <View style={styles.graphLine} />
                <View style={styles.peakMarker}>
                  <Text style={styles.peakText}>Peak</Text>
                </View>
                <View style={styles.habituationMarker}>
                  <Text style={styles.habitText}>Habituation</Text>
                </View>
              </View>
            </View>

            <View style={styles.theoryGrid}>
              <View style={styles.theoryItem}>
                <Text style={styles.theoryTitle}>Habituation</Text>
                <Text style={styles.theoryText}>The body naturally calms down over time.</Text>
              </View>
              <View style={styles.theoryItem}>
                <Text style={styles.theoryTitle}>Self-Efficacy</Text>
                <Text style={styles.theoryText}>You learn that you can handle the distress.</Text>
              </View>
            </View>

            <View style={styles.highlightCard}>
              <Text style={styles.highlightText}>
                "Anxiety always peaks and always passes. You just need to stay until it does."
              </Text>
            </View>
          </Animated.View>
        );

      case 4:
        return (
          <Animated.View entering={FadeInRight} style={styles.stepContainer}>
            <Icon name="heart" size={48} color={Colors.brand} style={styles.headerIcon} />
            <Text style={styles.title}>Your Commitment</Text>
            <Text style={styles.subtitle}>Recovery is a choice you make every day.</Text>
            
            <View style={styles.checklist}>
              <View style={styles.checkItem}>
                <Icon name="check" size={20} color={Colors.brand} />
                <Text style={styles.checkText}>I will record my thoughts and face my physical symptoms.</Text>
              </View>
              <View style={styles.checkItem}>
                <Icon name="check" size={20} color={Colors.brand} />
                <Text style={styles.checkText}>I will stay in exposure sessions until my anxiety drops by 50%.</Text>
              </View>
              <View style={styles.checkItem}>
                <Icon name="check" size={20} color={Colors.brand} />
                <Text style={styles.checkText}>I understand this is a wellness tool, not medical advice.</Text>
              </View>
            </View>

            <View style={styles.identityBox}>
              <Text style={styles.identityLabel}>My Identity Statement</Text>
              <Text style={styles.identityValue}>"I am someone who chooses courage over comfort."</Text>
            </View>

            <View style={styles.disclaimerBox}>
              <Text style={styles.disclaimerText}>
                Wellness Disclaimer: OnePercent is designed to support behavioral activation. If you have severe medical conditions, please consult a professional before starting physical exposure.
              </Text>
            </View>
          </Animated.View>
        );

      default:
        return null;
    }
  };

  return (
    <Layout>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        {/* Top bar */}
        <View style={styles.topBar}>
          <Pressable onPress={handleBack} hitSlop={12}>
            <Icon name="arrow-left" size={24} color={Colors.textPrimary} />
          </Pressable>
          <View style={styles.stepIndicator}>
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i <= currentStep && styles.dotActive,
                ]}
              />
            ))}
          </View>
          <Text style={styles.stepCount}>{currentStep + 1}/{TOTAL_STEPS}</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
          overScrollMode="never"
        >
          {renderStep()}
        </ScrollView>

        {/* Bottom buttons */}
        <View style={[styles.bottomBar, { paddingBottom: Math.max(Spacing.xl, insets.bottom) }]}>
          <Button
            title={currentStep === TOTAL_STEPS - 1 ? "I'm Ready — Build My Fear Profile" : "Continue"}
            onPress={handleNext}
          />
          <Button
            title="Skip, I know this already"
            onPress={handleComplete}
            type="ghost"
            style={styles.skipBtn}
          />
        </View>
      </KeyboardAvoidingView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.m,
    gap: Spacing.m,
  },
  stepIndicator: {
    flex: 1,
    flexDirection: 'row',
    gap: Spacing.xs,
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  dotActive: {
    backgroundColor: Colors.brand,
    width: 24,
  },
  stepCount: {
    ...Typography.caption,
    color: Colors.textTertiary,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: 120,
  },
  stepContainer: {
    paddingTop: Spacing.l,
    alignItems: 'center',
  },
  headerIcon: {
    marginBottom: Spacing.l,
  },
  title: {
    ...Typography.h1,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.m,
  },
  mythsContainer: {
    width: '100%',
    gap: Spacing.m,
  },
  mythCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.l,
    ...Shadows.soft,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  mythHeader: {
    flexDirection: 'row',
    gap: Spacing.s,
    marginBottom: Spacing.s,
  },
  mythText: {
    ...Typography.body,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  truthRow: {
    flexDirection: 'row',
    gap: Spacing.s,
  },
  truthText: {
    ...Typography.body,
    fontSize: 14,
    color: Colors.textPrimary,
    flex: 1,
    fontWeight: '500',
  },
  highlightCard: {
    backgroundColor: Colors.brandLight,
    borderRadius: 16,
    padding: Spacing.l,
    marginTop: Spacing.xl,
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.brand + '30',
  },
  highlightText: {
    ...Typography.body,
    color: Colors.brandDark,
    textAlign: 'center',
    fontWeight: '700',
    fontStyle: 'italic',
  },
  // Model
  modelContainer: {
    width: '100%',
    paddingVertical: Spacing.l,
  },
  modelStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.m,
  },
  modelCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modelInfo: {
    flex: 1,
  },
  modelLabel: {
    ...Typography.label,
    color: Colors.textPrimary,
  },
  modelDesc: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  modelConnector: {
    width: 2,
    height: 20,
    backgroundColor: Colors.border,
    marginLeft: 19,
    marginVertical: 4,
  },
  exampleBox: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.m,
    marginTop: Spacing.l,
    borderLeftWidth: 4,
    borderLeftColor: Colors.brand,
  },
  exampleTitle: {
    ...Typography.micro,
    fontWeight: '800',
    color: Colors.brand,
    marginBottom: 4,
  },
  exampleText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  // Loop
  loopContainer: {
    alignItems: 'center',
    width: '100%',
    gap: Spacing.s,
  },
  loopBox: {
    width: '100%',
    padding: Spacing.l,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  loopTitle: {
    ...Typography.label,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  loopSub: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  quoteBox: {
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.l,
  },
  quoteText: {
    ...Typography.heading,
    fontSize: 20,
    textAlign: 'center',
    color: Colors.brand,
  },
  parableBox: {
    marginTop: Spacing.l,
    backgroundColor: Colors.goldLight,
    padding: Spacing.l,
    borderRadius: 16,
  },
  parableText: {
    ...Typography.body,
    fontSize: 14,
    color: Colors.gold,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  // Graph
  graphPlaceholder: {
    height: 180,
    width: '100%',
    marginBottom: Spacing.xl,
    position: 'relative',
    padding: Spacing.m,
  },
  graphYAxis: {
    position: 'absolute',
    left: 40,
    top: 20,
    bottom: 40,
    width: 2,
    backgroundColor: Colors.border,
  },
  graphXAxis: {
    position: 'absolute',
    left: 40,
    right: 20,
    bottom: 40,
    height: 2,
    backgroundColor: Colors.border,
  },
  graphLabelY: {
    position: 'absolute',
    left: -10,
    top: 0,
    ...Typography.micro,
    transform: [{ rotate: '-90deg' }],
    color: Colors.textTertiary,
  },
  graphLabelX: {
    position: 'absolute',
    right: 0,
    bottom: 10,
    ...Typography.micro,
    color: Colors.textTertiary,
  },
  graphLineContainer: {
    flex: 1,
    marginLeft: 30,
    marginTop: 20,
    position: 'relative',
  },
  graphLine: {
    position: 'absolute',
    top: 0,
    left: 12,
    right: 20,
    height: 100,
    borderTopLeftRadius: 100,
    borderTopRightRadius: 20,
    borderWidth: 3,
    borderColor: Colors.brand,
    borderBottomWidth: 0,
    borderRightWidth: 0,
    transform: [{ scaleY: 0.8 }, { translateY: 20 }],
  },
  peakMarker: {
    position: 'absolute',
    top: 0,
    left: 40,
    backgroundColor: Colors.amber,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  peakText: {
    color: Colors.surface,
    fontSize: 10,
    fontWeight: '800',
  },
  habituationMarker: {
    position: 'absolute',
    bottom: 30,
    right: 40,
    backgroundColor: Colors.brand,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  habitText: {
    color: Colors.surface,
    fontSize: 10,
    fontWeight: '800',
  },
  theoryGrid: {
    flexDirection: 'row',
    gap: Spacing.m,
    width: '100%',
  },
  theoryItem: {
    flex: 1,
    backgroundColor: Colors.surface,
    padding: Spacing.m,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  theoryTitle: {
    ...Typography.label,
    color: Colors.brand,
    marginBottom: 4,
  },
  theoryText: {
    ...Typography.micro,
    color: Colors.textSecondary,
  },
  // Checklist
  checklist: {
    width: '100%',
    gap: Spacing.m,
  },
  checkItem: {
    flexDirection: 'row',
    gap: Spacing.m,
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.l,
    borderRadius: 16,
    ...Shadows.soft,
  },
  checkText: {
    ...Typography.body,
    fontSize: 14,
    color: Colors.textPrimary,
    flex: 1,
  },
  identityBox: {
    width: '100%',
    marginTop: Spacing.xl,
    backgroundColor: Colors.brand,
    padding: Spacing.xl,
    borderRadius: 20,
    alignItems: 'center',
    ...Shadows.soft,
  },
  identityLabel: {
    ...Typography.micro,
    color: Colors.brandLight,
    textTransform: 'uppercase',
    fontWeight: '800',
    marginBottom: 8,
  },
  identityValue: {
    ...Typography.heading,
    color: Colors.surface,
    textAlign: 'center',
    fontSize: 18,
  },
  disclaimerBox: {
    marginTop: Spacing.xxl,
    paddingHorizontal: Spacing.m,
  },
  disclaimerText: {
    ...Typography.caption,
    color: Colors.textTertiary,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 16,
  },
  // Global
  bottomBar: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.m,
  },
  skipBtn: {
    marginTop: Spacing.s,
  },
});
