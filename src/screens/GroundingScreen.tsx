import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  SlideInRight,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import LottieView from 'lottie-react-native';
import { Layout } from '../components/ui/Layout';
import { Colors, Typography, Spacing, Shadows } from '../theme';
import { useGroundingController } from '../hooks/useGroundingController';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const { width } = Dimensions.get('window');

const SENSE_ICONS: Record<string, string> = {
  See: 'eye',
  Feel: 'hand',
  Hear: 'headphones',
  Smell: 'wind',
  Taste: 'coffee',
};

const SENSE_COLORS: Record<string, { color: string; light: string }> = {
  See: { color: Colors.brand, light: Colors.brandLight },
  Feel: { color: Colors.amber, light: Colors.amberLight },
  Hear: { color: Colors.purple, light: Colors.purpleLight },
  Smell: { color: Colors.brandDark, light: Colors.brandLight },
  Taste: { color: Colors.gold, light: Colors.goldLight },
};

export const GroundingScreen = () => {
  const navigation = useNavigation();
  const { state, nextStep } = useGroundingController();
  const lottieRef = useRef<LottieView>(null);
  const btnScale = useSharedValue(1);
  const btnElev = useSharedValue(1);

  useEffect(() => {
    lottieRef.current?.play();
  }, []);

  const btnStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: btnScale.value },
      { translateY: (1 - btnScale.value) * 10 }
    ],
    opacity: 0.8 + (btnScale.value - 0.96) * 5,
  }));

  const doneBtnScale = useSharedValue(1);
  const doneBtnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: doneBtnScale.value }],
  }));

  const closeBtnScale = useSharedValue(1);
  const closeBtnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: closeBtnScale.value }],
  }));

  const handleEnd = () => navigation.goBack();

  const senseKey = state.currentStep?.label ?? 'See';
  const senseColor = SENSE_COLORS[senseKey] ?? { color: Colors.brand, light: Colors.brandLight };
  const senseIcon = SENSE_ICONS[senseKey] ?? 'circle';

  return (
    <Layout>
      <StatusBar barStyle="dark-content" />

      {/* Top bar */}
      <View style={styles.topBar}>
        <AnimatedPressable 
          hitSlop={16} 
          onPress={handleEnd} 
          style={[styles.closeBtn, closeBtnStyle]}
          onPressIn={() => { closeBtnScale.value = withSpring(0.9); }}
          onPressOut={() => { closeBtnScale.value = withSpring(1); }}
        >
          <Icon name="x" size={20} color={Colors.textSecondary} />
        </AnimatedPressable>
        <Text style={styles.topTitle}>5-4-3-2-1 Grounding</Text>
        {!state.isComplete ? (
          <View style={styles.stepChip}>
            <Text style={styles.stepChipText}>
              {state.currentStepIndex + 1} / {state.totalSteps}
            </Text>
          </View>
        ) : (
          <View style={[styles.stepChip, { backgroundColor: Colors.brandLight }]}>
            <Icon name="check" size={12} color={Colors.brand} />
          </View>
        )}
      </View>

      <View style={styles.content}>
        {!state.isComplete && state.currentStep ? (
          <Animated.View
            key={state.currentStepIndex}
            entering={SlideInRight.springify().damping(20)}
            exiting={FadeIn.duration(100)}
            style={styles.stepContainer}
          >
            {/* Lottie background glow */}
            <View style={styles.lottieWrap}>
              <LottieView
                ref={lottieRef}
                source={require('../assets/lottie/grounding_glow.json')}
                style={styles.lottie}
                autoPlay
                loop
                speed={0.7}
              />
              {/* Sense icon center */}
              <View style={[styles.senseIconCircle, { backgroundColor: senseColor.light }]}>
                <Icon name={senseIcon as any} size={32} color={senseColor.color} />
              </View>
            </View>

            {/* Count badge */}
            <Animated.View
              entering={FadeInUp.delay(80).springify()}
              style={[styles.countBadge, { backgroundColor: senseColor.light }]}
            >
              <Text style={[styles.countNumber, { color: senseColor.color }]}>
                {state.currentStep.count}
              </Text>
              <Text style={[styles.countLabel, { color: senseColor.color }]}>
                {state.currentStep.label}
              </Text>
            </Animated.View>

            {/* Instruction */}
            <Animated.Text entering={FadeInDown.delay(120)} style={styles.instruction}>
              {state.currentStep.instruction}
            </Animated.Text>

            {/* Sense steps */}
            <Animated.View entering={FadeInDown.delay(160)} style={styles.senseRow}>
              {Array.from({ length: state.totalSteps }).map((_, idx) => {
                const sk = ['See', 'Feel', 'Hear', 'Smell', 'Taste'][idx];
                const sc = SENSE_COLORS[sk];
                const past = idx < state.currentStepIndex;
                const active = idx === state.currentStepIndex;
                return (
                  <View
                    key={idx}
                    style={[
                      styles.sensePip,
                      active && [styles.sensePipActive, { backgroundColor: sc.light, borderColor: sc.color }],
                      past && [styles.sensePipDone, { backgroundColor: sc.color }],
                    ]}
                  >
                    {past && <Icon name="check" size={9} color="#fff" />}
                    {active && <Icon name={SENSE_ICONS[sk] as any} size={11} color={sc.color} />}
                  </View>
                );
              })}
            </Animated.View>

            {/* CTA — outer view handles entering, AnimatedPressable handles scale transform */}
            <Animated.View entering={FadeInDown.delay(200)} style={styles.ctaWrap}>
              <AnimatedPressable
                style={[styles.cta, { backgroundColor: senseColor.color }, btnStyle]}
                onPress={nextStep}
                onPressIn={() => { 
                  btnScale.value = withSpring(0.96, { damping: 15, stiffness: 200 }); 
                }}
                onPressOut={() => { 
                  btnScale.value = withSpring(1, { damping: 12, stiffness: 150 }); 
                }}
              >
                <Text style={styles.ctaText}>
                  {state.currentStepIndex < state.totalSteps - 1 ? 'Next sense' : 'Finish'}
                </Text>
                <Icon name="arrow-right" size={18} color="#fff" />
              </AnimatedPressable>
            </Animated.View>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeIn.springify()} style={styles.completeContainer}>
            <LottieView
              source={require('../assets/lottie/grounding_glow.json')}
              style={styles.completeLottie}
              autoPlay
              loop={false}
              speed={0.4}
            />
            <Text style={styles.completeTitle}>Grounded</Text>
            <Text style={styles.completeSubtitle}>
              You've moved through all 5 senses and reconnected with your surroundings.
            </Text>

            {/* Senses recap */}
            <View style={styles.senseRecap}>
              {['See', 'Feel', 'Hear', 'Smell', 'Taste'].map((s) => (
                <View key={s} style={[styles.recapPill, { backgroundColor: SENSE_COLORS[s].light }]}>
                  <Icon name={SENSE_ICONS[s] as any} size={12} color={SENSE_COLORS[s].color} />
                  <Text style={[styles.recapText, { color: SENSE_COLORS[s].color }]}>{s}</Text>
                </View>
              ))}
            </View>

            <AnimatedPressable 
              style={[styles.doneBtn, doneBtnStyle]} 
              onPress={handleEnd}
              onPressIn={() => { doneBtnScale.value = withSpring(0.95); }}
              onPressOut={() => { doneBtnScale.value = withSpring(1); }}
            >
              <Text style={styles.doneBtnText}>Return to Techniques</Text>
            </AnimatedPressable>
          </Animated.View>
        )}
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  // ─── Top Bar ───────────────────────────────────────────────────────
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.m,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitle: {
    ...Typography.label,
    color: Colors.textSecondary,
  },
  stepChip: {
    paddingHorizontal: Spacing.m,
    paddingVertical: 4,
    backgroundColor: Colors.borderLight,
    borderRadius: 99,
  },
  stepChipText: {
    ...Typography.micro,
    color: Colors.textTertiary,
  },

  // ─── Content ────────────────────────────────────────────────────────
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  stepContainer: {
    alignItems: 'center',
    width: '100%',
    gap: Spacing.xxl,
  },

  // ─── Lottie ─────────────────────────────────────────────────────────
  lottieWrap: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lottie: {
    width: 200,
    height: 200,
    position: 'absolute',
  },
  senseIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ─── Count badge ───────────────────────────────────────────────────
  countBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.s,
    paddingHorizontal: Spacing.l,
    paddingVertical: Spacing.s,
    borderRadius: 99,
  },
  countNumber: {
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -1,
    lineHeight: 40,
  },
  countLabel: {
    ...Typography.heading,
    fontWeight: '600',
  },

  // ─── Instruction ─────────────────────────────────────────────────────
  instruction: {
    ...Typography.title,
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 32,
  },

  // ─── Sense pip row ────────────────────────────────────────────────────
  senseRow: {
    flexDirection: 'row',
    gap: Spacing.s,
    alignItems: 'center',
  },
  sensePip: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sensePipActive: {
    borderWidth: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  sensePipDone: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },

  // ─── CTA ────────────────────────────────────────────────────────────
  ctaWrap: {
    width: '100%',
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.s,
    paddingVertical: Spacing.l,
    borderRadius: 20,
    ...Shadows.brand,
  },
  ctaText: {
    ...Typography.heading,
    color: '#fff',
  },

  // ─── Complete ──────────────────────────────────────────────────────
  completeContainer: {
    alignItems: 'center',
    gap: Spacing.l,
  },
  completeLottie: {
    width: 180,
    height: 180,
  },
  completeTitle: {
    ...Typography.title,
    color: Colors.textPrimary,
  },
  completeSubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  senseRecap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.s,
    justifyContent: 'center',
  },
  recapPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.m,
    paddingVertical: Spacing.xs,
    borderRadius: 99,
  },
  recapText: {
    ...Typography.caption,
    fontWeight: '600',
  },
  doneBtn: {
    backgroundColor: Colors.brand,
    paddingVertical: Spacing.l,
    paddingHorizontal: Spacing.xxl,
    borderRadius: 20,
    marginTop: Spacing.m,
    ...Shadows.brand,
  },
  doneBtnText: {
    ...Typography.heading,
    color: '#fff',
  },
});
