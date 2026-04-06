import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withRepeat, withSequence, withTiming, FadeIn } from 'react-native-reanimated';
import { Colors, Typography, Spacing } from '../../theme';

interface SessionTimerProps {
  startedAt: string; // ISO timestamp
  isRunning: boolean;
}

export const SessionTimer = ({ startedAt, isRunning }: SessionTimerProps) => {
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isRunning || !startedAt) return;

    // Timestamp-based calculation (survives background)
    const updateElapsed = () => {
      const start = new Date(startedAt).getTime();
      const now = Date.now();
      setElapsed(Math.floor((now - start) / 1000));
    };

    updateElapsed();
    intervalRef.current = setInterval(updateElapsed, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [startedAt, isRunning]);

  const formatTime = (totalSeconds: number): { hours: string; minutes: string; seconds: string } => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return {
      hours: hours.toString().padStart(2, '0'),
      minutes: minutes.toString().padStart(2, '0'),
      seconds: seconds.toString().padStart(2, '0'),
    };
  };

  const time = formatTime(elapsed);

  const pulseStyle = useAnimatedStyle(() => {
    if (!isRunning) return { opacity: 1 };
    return {
      opacity: withRepeat(
        withSequence(
          withTiming(0.4, { duration: 1500 }),
          withTiming(1, { duration: 1500 })
        ),
        -1,
        true
      ),
    };
  });

  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.container}>
      {/* Ambient pulse ring */}
      <Animated.View style={[styles.pulseRing, pulseStyle]} />

      {/* Timer display */}
      <View style={styles.timerDisplay}>
        {elapsed >= 3600 && (
          <>
            <Text style={styles.timerDigit}>{time.hours}</Text>
            <Text style={styles.timerSeparator}>:</Text>
          </>
        )}
        <Text style={styles.timerDigit}>{time.minutes}</Text>
        <Text style={styles.timerSeparator}>:</Text>
        <Text style={styles.timerDigit}>{time.seconds}</Text>
      </View>

      {/* Status label */}
      <View style={[styles.statusBadge, isRunning ? styles.badgeActive : styles.badgePaused]}>
        <View style={[styles.statusDot, isRunning ? styles.dotActive : styles.dotPaused]} />
        <Text style={[styles.statusText, isRunning && { color: Colors.brand }]}>
          {isRunning ? 'In Progress' : 'Paused'}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
  },
  pulseRing: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: Colors.brand + '30',
  },
  timerDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  timerDigit: {
    fontSize: 64,
    fontWeight: '200',
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums'],
    letterSpacing: -2,
  },
  timerSeparator: {
    fontSize: 48,
    fontWeight: '200',
    color: Colors.textTertiary,
    marginHorizontal: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.m,
    borderRadius: 20,
    marginTop: Spacing.l,
  },
  badgeActive: {
    backgroundColor: Colors.brand + '15',
  },
  badgePaused: {
    backgroundColor: Colors.amber + '15',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    backgroundColor: Colors.brand,
  },
  dotPaused: {
    backgroundColor: Colors.amber,
  },
  statusText: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.amber,
  },
});
