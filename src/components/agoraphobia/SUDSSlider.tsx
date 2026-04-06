import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolateColor,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Colors, Typography, Spacing } from '../../theme';
import { getSUDSShortLabel, getSUDSLabel } from '../../engine/agoraphobiaEngine';

const TRACK_HEIGHT = 6;
const THUMB_SIZE = 32;
const TICK_COUNT = 11; // 0-10

interface SUDSSliderProps {
  value: number;
  onChange: (v: number) => void;
  label?: string;
  showLabel?: boolean;
  showCoachingLabel?: boolean;
  trackWidth?: number;
}

const SLIDER_WIDTH = 300; // Default, overridden by onLayout

export const SUDSSlider = ({
  value,
  onChange,
  label = 'How anxious do you feel?',
  showLabel = true,
  showCoachingLabel = false,
}: SUDSSliderProps) => {
  const [trackWidth, setTrackWidth] = React.useState(SLIDER_WIDTH);
  const progress = useSharedValue(value / 10);

  const getThumbColor = (suds: number): string => {
    if (suds <= 2) return Colors.brand;
    if (suds <= 5) return Colors.amber;
    if (suds <= 8) return '#F59E0B';
    return Colors.purple;
  };

  const handleTick = useCallback(
    (index: number) => {
      progress.value = withSpring(index / 10, { damping: 20, stiffness: 300 });
      onChange(index);
    },
    [onChange, progress]
  );

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      const x = Math.max(0, Math.min(e.x, trackWidth));
      const newValue = Math.round((x / trackWidth) * 10);
      progress.value = newValue / 10;
      runOnJS(onChange)(newValue);
    })
    .hitSlop({ top: 20, bottom: 20, left: 10, right: 10 });

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: progress.value * trackWidth - THUMB_SIZE / 2 }],
  }));

  const fillStyle = useAnimatedStyle(() => ({
    width: progress.value * trackWidth,
  }));

  return (
    <View style={styles.container}>
      {showLabel && <Text style={styles.label}>{label}</Text>}

      {/* Current value display */}
      <View style={styles.valueRow}>
        <Text style={[styles.valueNumber, { color: getThumbColor(value) }]}>
          {value}
        </Text>
        <Text style={styles.valueLabel}>{getSUDSShortLabel(value)}</Text>
      </View>

      {/* Slider track */}
      <View
        style={styles.trackContainer}
        onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
      >
        <GestureDetector gesture={panGesture}>
          <View style={styles.trackWrapper}>
            {/* Background track */}
            <View style={styles.track} />

            {/* Filled track */}
            <Animated.View
              style={[
                styles.trackFill,
                fillStyle,
                { backgroundColor: getThumbColor(value) },
              ]}
            />

            {/* Thumb */}
            <Animated.View
              style={[
                styles.thumb,
                thumbStyle,
                { backgroundColor: getThumbColor(value) },
              ]}
            >
              <Text style={styles.thumbText}>{value}</Text>
            </Animated.View>
          </View>
        </GestureDetector>

        {/* Tick marks */}
        <View style={styles.tickRow}>
          {Array.from({ length: TICK_COUNT }).map((_, i) => (
            <Pressable
              key={i}
              onPress={() => handleTick(i)}
              hitSlop={{ top: 12, bottom: 12, left: 4, right: 4 }}
              style={styles.tickPressable}
            >
              <View
                style={[
                  styles.tick,
                  i <= value && { backgroundColor: getThumbColor(value) + '60' },
                ]}
              />
              <Text style={[styles.tickLabel, i === value && styles.tickLabelActive]}>
                {i}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Coaching label */}
      {showCoachingLabel && (
        <View style={[styles.coachingBadge, { backgroundColor: getThumbColor(value) + '15' }]}>
          <Text style={[styles.coachingText, { color: getThumbColor(value) }]}>
            {getSUDSLabel(value)}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.m,
  },
  label: {
    ...Typography.label,
    color: Colors.textPrimary,
    marginBottom: Spacing.s,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.s,
    marginBottom: Spacing.l,
  },
  valueNumber: {
    fontSize: 42,
    fontWeight: '800',
    letterSpacing: -1,
  },
  valueLabel: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  trackContainer: {
    paddingHorizontal: THUMB_SIZE / 2,
  },
  trackWrapper: {
    height: THUMB_SIZE + 20,
    justifyContent: 'center',
  },
  track: {
    height: TRACK_HEIGHT,
    backgroundColor: Colors.border,
    borderRadius: TRACK_HEIGHT / 2,
  },
  trackFill: {
    position: 'absolute',
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
  },
  thumb: {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  thumbText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  tickRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
    marginHorizontal: -(THUMB_SIZE / 2),
  },
  tickPressable: {
    alignItems: 'center',
    minWidth: 24,
  },
  tick: {
    width: 2,
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 1,
  },
  tickLabel: {
    ...Typography.micro,
    color: Colors.textTertiary,
    marginTop: 2,
    fontSize: 9,
  },
  tickLabelActive: {
    color: Colors.textPrimary,
    fontWeight: '800',
  },
  coachingBadge: {
    marginTop: Spacing.m,
    paddingVertical: Spacing.s,
    paddingHorizontal: Spacing.l,
    borderRadius: 12,
    alignItems: 'center',
  },
  coachingText: {
    ...Typography.caption,
    fontWeight: '600',
    textAlign: 'center',
  },
});
