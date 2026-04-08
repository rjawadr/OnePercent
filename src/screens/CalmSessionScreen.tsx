import React, { useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  AppState,
  AppStateStatus,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import Animated, {
  FadeIn,
  FadeOut,
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import LottieView from 'lottie-react-native';
import { Layout } from '../components/ui/Layout';
import { Button } from '../components/ui/Button';
import { Colors, Typography, Spacing, Shadows } from '../theme';
import { useBreathingController, defaultBreathConfig } from '../hooks/useBreathingController';
import { useBreathSounds } from '../hooks/useBreathSounds';

const { width } = Dimensions.get('window');

const PHASE_CONFIG: Record<string, { instruction: string; color: string; subtext: string }> = {
  INHALE: { instruction: 'Breathe in slowly', color: Colors.brand, subtext: 'Through your nose' },
  HOLD: { instruction: 'Hold', color: Colors.amber, subtext: 'Stay still' },
  EXHALE: { instruction: 'Breathe out gently', color: Colors.brandDark, subtext: 'Through your mouth' },
  REST: { instruction: 'Pause', color: Colors.textTertiary, subtext: 'Let it be' },
  IDLE: { instruction: 'Ready?', color: Colors.textSecondary, subtext: 'Starting soon…' },
  COMPLETE: { instruction: 'Well done', color: Colors.brand, subtext: 'Session complete' },
};

export const CalmSessionScreen = () => {
  const navigation = useNavigation();
  const { state, start, pause, resume, stop } = useBreathingController(defaultBreathConfig);
  const lottieRef = useRef<LottieView>(null);
  
  // Countdown state
  const [isPreparing, setIsPreparing] = React.useState(true);
  const [countdown, setCountdown] = React.useState(5);

  // Auditory cues synchronized with the timer phases
  useBreathSounds(state.phase);

  // Lottie progress (0–1) driven by engine
  const lottieProgress = useSharedValue(0);
  const textOpacity = useSharedValue(1);

  // Countdown logic
  useEffect(() => {
    if (!isPreparing) return;

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setIsPreparing(false);
      start();
    }
  }, [countdown, isPreparing, start]);

  // Manage lifecycle and AppState
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState.match(/inactive|background/)) {
        pause();
        lottieRef.current?.pause();
      } else if (nextAppState === 'active') {
        // Only resume if we've actually started (not in preparation)
        if (!isPreparing) {
          resume();
          lottieRef.current?.play();
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, [pause, resume, isPreparing]);

  // Ensure engine stops only when leaving the screen
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  // Animate lottie progress every 100ms tick
  useEffect(() => {
    lottieProgress.value = withTiming(state.progress, {
      duration: 100,
      easing: Easing.linear,
    });
  }, [state.progress, lottieProgress]);

  const phaseData = useMemo(() => PHASE_CONFIG[state.phase] ?? PHASE_CONFIG.IDLE, [state.phase]);

  const handleEnd = () => {
    stop();
    navigation.goBack();
  };

  const dotStyle = useAnimatedStyle(() => ({
    backgroundColor: withTiming(phaseData.color, { duration: 600 }),
  }));

  return (
    <Layout>
      <StatusBar barStyle="dark-content" />

      {/* Top bar */}
      <View style={styles.topBar}>
        <Pressable hitSlop={16} onPress={handleEnd} style={styles.closeBtn}>
          <Icon name="x" size={20} color={Colors.textSecondary} />
        </Pressable>
        <Text style={styles.topTitle}>Breathing Session</Text>
        <View style={styles.cycleChip}>
          <Text style={styles.cycleChipText}>
            {state.phase !== 'COMPLETE'
              ? `${state.cycle} / ${defaultBreathConfig.cycles}`
              : '✓ Done'}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        {isPreparing ? (
          <Animated.View entering={FadeIn} style={styles.prepContainer}>
            <LottieView
              source={require('../assets/lottie/breathing_circle.json')}
              style={styles.prepLottie}
              autoPlay
              loop
              speed={0.2}
            />
            <View style={styles.countdownBox}>
              <Animated.Text 
                key={countdown}
                entering={FadeInDown.springify()}
                style={styles.countdownNum}
              >
                {countdown}
              </Animated.Text>
              <Text style={styles.prepTitle}>Get ready...</Text>
              <Text style={styles.prepSubtitle}>Find a comfortable position</Text>
            </View>
            <Pressable style={styles.skipBtn} onPress={() => { setCountdown(0); setIsPreparing(false); start(); }}>
              <Text style={styles.skipText}>Skip introduction</Text>
            </Pressable>
          </Animated.View>
        ) : state.phase !== 'COMPLETE' ? (
          <Animated.View entering={FadeIn} style={styles.activeContainer}>
            {/* Timer ring */}
            <View style={styles.timerRing}>
              {Array.from({ length: defaultBreathConfig.cycles }).map((_, i) => (
                <Animated.View
                  key={i}
                  style={[
                    styles.ringDot,
                    i < state.cycle ? dotStyle : styles.ringDotInactive,
                  ]}
                />
              ))}
            </View>

            {/* Lottie */}
            <View style={styles.lottieContainer}>
              <LottieView
                ref={lottieRef}
                source={require('../assets/lottie/breathing_circle.json')}
                style={styles.lottie}
                autoPlay
                loop
                speed={state.phase === 'INHALE' ? 0.4 : state.phase === 'EXHALE' ? 0.35 : 0.1}
              />

              {/* Overlaid timer in center */}
              <View style={styles.timerOverlay}>
                <Animated.Text style={[styles.timerNum]}>
                  {Math.ceil(state.timeRemaining)}
                </Animated.Text>
                <Text style={styles.timerSec}>sec</Text>
              </View>
            </View>

            {/* Phase text */}
            <Animated.View
              key={state.phase}
              entering={FadeInUp.duration(250).springify()}
              exiting={FadeOut.duration(150)}
              style={styles.phaseTextContainer}
            >
              <Text style={[styles.phaseInstruction, { color: phaseData.color }]}>
                {phaseData.instruction}
              </Text>
              <Text style={styles.phaseSubtext}>{phaseData.subtext}</Text>
            </Animated.View>

            {/* Pattern guide */}
            <Animated.View entering={FadeInDown.delay(200)} style={styles.patternRow}>
              {[
                { label: 'IN', secs: defaultBreathConfig.inhale, active: state.phase === 'INHALE' },
                { label: 'HOLD', secs: defaultBreathConfig.hold, active: state.phase === 'HOLD' },
                { label: 'OUT', secs: defaultBreathConfig.exhale, active: state.phase === 'EXHALE' },
                { label: 'REST', secs: defaultBreathConfig.rest, active: state.phase === 'REST' },
              ].map((seg) => (
                <View
                  key={seg.label}
                  style={[styles.patternSeg, seg.active && styles.patternSegActive]}
                >
                  <Text style={[styles.patternLabel, seg.active && styles.patternLabelActive]}>
                    {seg.label}
                  </Text>
                  <Text style={[styles.patternSecs, seg.active && styles.patternSecsActive]}>
                    {seg.secs}s
                  </Text>
                </View>
              ))}
            </Animated.View>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeIn.springify()} style={styles.completeContainer}>
            <LottieView
              source={require('../assets/lottie/breathing_circle.json')}
              style={styles.completeLottie}
              autoPlay
              loop={false}
              speed={0.3}
            />
            <Text style={styles.completeTitle}>Well done</Text>
            <Text style={styles.completeSubtitle}>
              You've completed {defaultBreathConfig.cycles} cycles of 4-4-6-2 breathing.
            </Text>
            <View style={styles.completeStat}>
              <Icon name="clock" size={16} color={Colors.brand} />
              <Text style={styles.completeStatText}>
                {Math.round((defaultBreathConfig.inhale + defaultBreathConfig.hold + defaultBreathConfig.exhale + defaultBreathConfig.rest) * defaultBreathConfig.cycles / 60)} min session
              </Text>
            </View>
            <Button title="Return to Techniques" onPress={handleEnd} style={styles.doneBtn} />
          </Animated.View>
        )}
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  // ─── Top Bar ────────────────────────────────────────────────────────────
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.m,
    justifyContent: 'space-between',
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
  cycleChip: {
    paddingHorizontal: Spacing.m,
    paddingVertical: 4,
    backgroundColor: Colors.brandLight,
    borderRadius: 99,
  },
  cycleChipText: {
    ...Typography.micro,
    color: Colors.brand,
  },

  // ─── Content ──────────────────────────────────────────────────────────
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  activeContainer: {
    alignItems: 'center',
    width: '100%',
    gap: Spacing.xxl,
  },

  // ─── Cycle dots ──────────────────────────────────────────────────────
  timerRing: {
    flexDirection: 'row',
    gap: Spacing.m,
    alignItems: 'center',
    paddingVertical: Spacing.m,
  },
  ringDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    ...Shadows.soft,
  },
  ringDotInactive: {
    backgroundColor: Colors.surface,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
  },

  // ─── Lottie ───────────────────────────────────────────────────────────
  lottieContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 240,
    height: 240,
  },
  lottie: {
    width: 240,
    height: 240,
    position: 'absolute',
  },
  timerOverlay: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerNum: {
    fontSize: 52,
    fontWeight: '200',
    color: Colors.textPrimary,
    letterSpacing: -2,
    fontVariant: ['tabular-nums'],
    lineHeight: 56,
  },
  timerSec: {
    ...Typography.caption,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // ─── Phase text ────────────────────────────────────────────────────────
  phaseTextContainer: {
    alignItems: 'center',
    gap: 4,
  },
  phaseInstruction: {
    ...Typography.title,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  phaseSubtext: {
    ...Typography.body,
    color: Colors.textTertiary,
    textAlign: 'center',
  },

  // ─── Pattern strip ─────────────────────────────────────────────────────
  patternRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.borderLight,
    width: '100%',
  },
  patternSeg: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.m,
    gap: 2,
  },
  patternSegActive: {
    backgroundColor: Colors.brandLight,
  },
  patternLabel: {
    ...Typography.micro,
    color: Colors.textTertiary,
    fontSize: 9,
  },
  patternLabelActive: {
    color: Colors.brand,
  },
  patternSecs: {
    ...Typography.label,
    color: Colors.textTertiary,
    fontSize: 16,
    fontWeight: '300',
  },
  patternSecsActive: {
    color: Colors.brand,
    fontWeight: '700',
  },

  // ─── Complete ──────────────────────────────────────────────────────────
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
    marginBottom: Spacing.s,
  },
  completeStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.brandLight,
    paddingHorizontal: Spacing.m,
    paddingVertical: Spacing.s,
    borderRadius: 99,
  },
  completeStatText: {
    ...Typography.label,
    color: Colors.brand,
  },
  doneBtn: {
    marginTop: Spacing.m,
    width: width - Spacing.xl * 2,
  },

  // ─── Preparation ────────────────────────────────────────────────────────
  prepContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xl,
    paddingBottom: 60,
  },
  prepLottie: {
    width: 280,
    height: 280,
    position: 'absolute',
    opacity: 0.6,
  },
  countdownBox: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  countdownNum: {
    fontSize: 100,
    fontWeight: '800',
    color: Colors.brand,
    letterSpacing: -4,
  },
  prepTitle: {
    ...Typography.title,
    color: Colors.textPrimary,
    marginTop: Spacing.m,
  },
  prepSubtitle: {
    ...Typography.body,
    color: Colors.textTertiary,
  },
  skipBtn: {
    marginTop: Spacing.xxl,
    paddingHorizontal: Spacing.l,
    paddingVertical: Spacing.s,
    borderRadius: 99,
    backgroundColor: Colors.borderLight,
  },
  skipText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
});
