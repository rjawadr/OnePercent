import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Animated, { FadeIn, FadeOut, ZoomIn } from 'react-native-reanimated';
import { Colors, Spacing, Typography } from '../../theme';
import { Confetti } from '../ui/Confetti';
import { Habit } from '../../models/Habit';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const MILESTONE_COPY: Record<string, { emoji: string; title: string; sub: string }> = {
  '7_days':  { emoji: '✨', title: '7-Day Streak',  sub: 'The habit is forming.' },
  '14_days': { emoji: '🔥', title: '2 Weeks Strong', sub: 'A neural pathway is being built.' },
  '30_days': { emoji: '🏆', title: 'One Month In',   sub: 'Most people quit by now. Not you.' },
  '60_days': { emoji: '🏔️', title: 'Into the Plateau', sub: 'The compound effect is real.' },
  '90_days': { emoji: '💎', title: '90 Days',        sub: '2.45× your starting point.' },
  '180_days': { emoji: '🛸', title: 'Half a Year',   sub: 'You are unrecognizable.' },
  '365_days': { emoji: '🌌', title: 'One Full Year', sub: 'A complete orbit of discipline.' },
};

interface MilestoneCelebrationOverlayProps {
  milestone: string;
  habit: Habit;
  onDismiss: () => void;
}

export const MilestoneCelebrationOverlay = ({ milestone, habit, onDismiss }: MilestoneCelebrationOverlayProps) => {
  const copy = MILESTONE_COPY[milestone] || { emoji: '✨', title: 'Milestone Hit!', sub: 'Keep going.' };
  
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 4500); // Slightly longer than 4s to allow for animations

    return () => clearTimeout(timer);
  }, [onDismiss]);

  const streakNumber = milestone.split('_')[0];

  return (
    <Animated.View 
      entering={FadeIn.duration(400)} 
      exiting={FadeOut.duration(300)} 
      style={styles.overlay}
    >
      <TouchableOpacity 
        style={styles.contentWrapper} 
        activeOpacity={1} 
        onPress={onDismiss}
      >
        <Confetti />
        
        <Animated.View 
          entering={ZoomIn.delay(200).springify()} 
          style={styles.card}
        >
          <Text style={styles.emoji}>{copy.emoji}</Text>
          <Text style={styles.title}>{copy.title}</Text>
          <Text style={styles.subtitle}>{copy.sub}</Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.identityLabel}>
            You've cast {streakNumber} votes for:
          </Text>
          <Text style={styles.identityStatement}>
            "{habit.identity_statement || `I am someone who prioritizes their ${habit.name}`}"
          </Text>

          <TouchableOpacity style={styles.button} onPress={onDismiss}>
            <Text style={styles.buttonText}>Continue Building →</Text>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26, 28, 30, 0.95)', // Deep Navy overlay
    zIndex: 999,
  },
  contentWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  card: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: 32,
    padding: Spacing.xxl,
    alignItems: 'center',
    shadowColor: Colors.brand,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 40,
    elevation: 20,
  },
  emoji: {
    fontSize: 64,
    marginBottom: Spacing.m,
  },
  title: {
    ...Typography.heading,
    fontSize: 32,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  divider: {
    width: 60,
    height: 4,
    backgroundColor: Colors.brandLight,
    borderRadius: 2,
    marginVertical: Spacing.xl,
  },
  identityLabel: {
    ...Typography.caption,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: Spacing.s,
  },
  identityStatement: {
    ...Typography.body,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 26,
    fontStyle: 'italic',
  },
  button: {
    marginTop: Spacing.xxxl,
    backgroundColor: Colors.brand,
    paddingVertical: Spacing.l,
    paddingHorizontal: Spacing.xxl,
    borderRadius: 99,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: Colors.surface,
    fontWeight: '800',
    fontSize: 16,
  },
});
