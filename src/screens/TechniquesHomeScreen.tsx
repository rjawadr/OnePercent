import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Feather';
import Animated, {
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Layout } from '../components/ui/Layout';
import { Colors, Typography, Spacing, Shadows } from '../theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type TechniquesStackParamList = {
  TechniquesHome: undefined;
  CalmSession: undefined;
  GroundingSession: undefined;
};

const TECHNIQUES = [
  {
    id: 'breathing',
    title: 'Breathing Rhythm',
    subtitle: '4-4-6-2 pattern',
    description:
      'Lower your heart rate and calm your nervous system with a clinically-proven breathing pattern.',
    icon: 'wind' as const,
    duration: '5 min',
    screen: 'CalmSession' as const,
    accentColor: Colors.brand,
    accentLight: Colors.brandLight,
    tag: 'Panic Relief',
  },
  {
    id: 'grounding',
    title: '5-4-3-2-1 Grounding',
    subtitle: '5 senses technique',
    description:
      'Interrupt anxious thoughts by anchoring your attention to your immediate physical surroundings.',
    icon: 'layers' as const,
    duration: '3 min',
    screen: 'GroundingSession' as const,
    accentColor: Colors.amber,
    accentLight: Colors.amberLight,
    tag: 'Grounding',
  },
];

interface TechCardProps {
  item: (typeof TECHNIQUES)[0];
  onPress: () => void;
  index: number;
}

const TechCard: React.FC<TechCardProps> = ({ item, onPress, index }) => {
  const scale = useSharedValue(1);

  // Transform style — separate view, no layout animation
  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    // Outer: layout animation only — no transform on this view
    <Animated.View entering={FadeInDown.delay(200 + index * 120).springify().damping(18)}>
      {/* AnimatedPressable carries the scale transform — no layout animation here */}
      <AnimatedPressable
        style={[styles.card, pressStyle]}
        onPress={onPress}
        onPressIn={() => { scale.value = withSpring(0.97, { damping: 15 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 12 }); }}
      >
          {/* Accent stripe */}
          <View style={[styles.cardStripe, { backgroundColor: item.accentColor }]} />

          <View style={styles.cardBody}>
            <View style={styles.cardTopRow}>
              <View style={[styles.iconWrap, { backgroundColor: item.accentLight }]}>
                <Icon name={item.icon} size={22} color={item.accentColor} />
              </View>
              <View style={[styles.tagPill, { backgroundColor: item.accentLight }]}>
                <Text style={[styles.tagText, { color: item.accentColor }]}>{item.tag}</Text>
              </View>
            </View>

            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
            <Text style={styles.cardDescription}>{item.description}</Text>

            <View style={styles.cardFooter}>
              <View style={styles.durationRow}>
                <Icon name="clock" size={12} color={Colors.textTertiary} />
                <Text style={styles.durationText}>{item.duration}</Text>
              </View>
              <View style={[styles.startBtn, { backgroundColor: item.accentColor }]}>
                <Text style={styles.startBtnText}>Begin</Text>
                <Icon name="arrow-right" size={14} color="#fff" />
              </View>
            </View>
          </View>
      </AnimatedPressable>
    </Animated.View>
  );
};

export const TechniquesHomeScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<TechniquesStackParamList>>();

  return (
    <Layout>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section — text only, no circle */}
        <Animated.View entering={FadeInUp.springify().damping(16)} style={styles.hero}>
          <Text style={styles.heroTitle}>Calm Techniques</Text>
          <Text style={styles.heroSubtitle}>
            Clinically-grounded tools to interrupt panic and restore calm — offline, always available.
          </Text>

          {/* Stats strip */}
          <View style={styles.statsRow}>
            {[
              { label: 'Evidence Based', icon: 'check-circle' },
              { label: 'Offline First', icon: 'wifi-off' },
              { label: 'No Timer Pressure', icon: 'heart' },
            ].map((s) => (
              <View key={s.label} style={styles.stat}>
                <Icon name={s.icon as any} size={14} color={Colors.brand} />
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Section label */}
        <Animated.Text entering={FadeInDown.delay(100)} style={styles.sectionTitle}>
          Choose a technique
        </Animated.Text>

        {TECHNIQUES.map((t, i) => (
          <TechCard
            key={t.id}
            item={t}
            index={i}
            onPress={() => navigation.navigate(t.screen)}
          />
        ))}

        {/* Bottom hint */}
        <Animated.View entering={FadeInDown.delay(500)} style={styles.hint}>
          <Icon name="info" size={14} color={Colors.textTertiary} />
          <Text style={styles.hintText}>
            Use breathing when you feel panic rising. Grounding works best once breathing has stabilized.
          </Text>
        </Animated.View>
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 120,
  },

  // ─── Hero ────────────────────────────────────────────────────────────────
  hero: {
    backgroundColor: Colors.surface,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    ...Shadows.card,
  },
  heroTitle: {
    ...Typography.title,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.s,
  },
  heroSubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.l,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: Spacing.m,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  stat: {
    alignItems: 'center',
    gap: 4,
  },
  statLabel: {
    ...Typography.micro,
    color: Colors.textTertiary,
    textAlign: 'center',
    fontSize: 9,
    maxWidth: 80,
  },

  // ─── Section ─────────────────────────────────────────────────────────────
  sectionTitle: {
    ...Typography.label,
    color: Colors.textTertiary,
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.m,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // ─── Card ─────────────────────────────────────────────────────────────────
  card: {
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.l,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.borderLight,
    flexDirection: 'row',
    ...Shadows.card,
  },
  cardStripe: {
    width: 5,
  },
  cardBody: {
    flex: 1,
    padding: Spacing.l,
    gap: Spacing.xs,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.s,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagPill: {
    paddingHorizontal: Spacing.s,
    paddingVertical: 3,
    borderRadius: 99,
  },
  tagText: {
    ...Typography.micro,
    fontSize: 9,
  },
  cardTitle: {
    ...Typography.heading,
    color: Colors.textPrimary,
  },
  cardSubtitle: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginBottom: Spacing.xs,
  },
  cardDescription: {
    ...Typography.body,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.m,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationText: {
    ...Typography.caption,
    color: Colors.textTertiary,
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.s,
    paddingHorizontal: Spacing.m,
    borderRadius: 99,
  },
  startBtnText: {
    ...Typography.label,
    color: '#fff',
    fontSize: 13,
  },

  // ─── Hint ─────────────────────────────────────────────────────────────────
  hint: {
    flexDirection: 'row',
    gap: Spacing.s,
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.m,
    padding: Spacing.m,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    alignItems: 'flex-start',
  },
  hintText: {
    ...Typography.caption,
    color: Colors.textTertiary,
    flex: 1,
    lineHeight: 18,
  },
});
