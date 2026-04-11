import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Feather';
import { Layout } from '../components/ui/Layout';
import { Colors, Typography, Spacing, Shadows } from '../theme';

const TRACKS = [
  {
    id: 'agoraphobia',
    title: 'Agoraphobia',
    subtitle: 'Exposure & Response Prevention',
    icon: 'navigation',
    color: Colors.brand,
    bgColor: Colors.brandLight,
    available: true,
    features: ['Exposure Ladder', 'SUDS Tracking', 'CBT Thought Records'],
  },
  {
    id: 'social',
    title: 'Social Anxiety',
    subtitle: 'Gradual social exposure',
    icon: 'users',
    color: Colors.purple,
    bgColor: Colors.purpleLight,
    available: false,
    features: ['Social situations', 'Conversation practice', 'Cognitive restructuring'],
  },
  {
    id: 'gad',
    title: 'Generalised Anxiety',
    subtitle: 'Worry management & CBT',
    icon: 'cpu',
    color: Colors.amber,
    bgColor: Colors.amberLight,
    available: false,
    features: ['Worry time', 'Thought challenging', 'Relaxation training'],
  },
  {
    id: 'panic',
    title: 'Panic Disorder',
    subtitle: 'Interoceptive exposure',
    icon: 'wind',
    color: '#2563EB',
    bgColor: '#EFF6FF',
    available: false,
    features: ['Body sensation exposure', 'Breathing retraining', 'Panic protocol'],
  },
];

export const TherapyScreen = ({ navigation }: any) => {
  const handleTrackPress = (trackId: string, available: boolean) => {
    if (available) {
      navigation.navigate('AgoraphobiaHome');
    }
  };

  return (
    <Layout>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Therapy</Text>
          <Text style={styles.headerSubtitle}>
            Evidence-based programmes for anxiety recovery
          </Text>
        </View>

        {/* Track Cards */}
        <View style={styles.cardsContainer}>
          {TRACKS.map((track, index) => (
            <Animated.View
              key={track.id}
              entering={FadeInDown.delay(index * 100).springify()}
            >
              <Pressable
                onPress={() => handleTrackPress(track.id, track.available)}
                style={({ pressed }) => [
                  styles.trackCard,
                  !track.available && styles.trackCardDisabled,
                  pressed && track.available && styles.trackCardPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel={`${track.title} therapy track`}
              >
                {/* Icon */}
                <View style={[styles.iconCircle, { backgroundColor: track.bgColor }]}>
                  <Icon name={track.icon} size={24} color={track.color} />
                </View>

                {/* Content */}
                <View style={styles.trackContent}>
                  <View style={styles.titleRow}>
                    <Text style={styles.trackTitle}>{track.title}</Text>
                    {track.available ? (
                      <View style={styles.activeBadge}>
                        <Text style={styles.activeBadgeText}>ACTIVE</Text>
                      </View>
                    ) : (
                      <View style={styles.comingSoonBadge}>
                        <Text style={styles.comingSoonText}>COMING SOON</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.trackSubtitle}>{track.subtitle}</Text>

                  {/* Feature chips */}
                  <View style={styles.featureRow}>
                    {track.features.map((f) => (
                      <View
                        key={f}
                        style={[
                          styles.featureChip,
                          { backgroundColor: track.available ? track.bgColor : Colors.background },
                        ]}
                      >
                        <Text
                          style={[
                            styles.featureText,
                            { color: track.available ? track.color : Colors.textTertiary },
                          ]}
                        >
                          {f}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Arrow */}
                {track.available && (
                  <Icon name="arrow-right" size={20} color={track.color} style={styles.arrow} />
                )}
              </Pressable>
            </Animated.View>
          ))}
        </View>

        {/* Wellness Disclaimer */}
        <Text style={styles.disclaimer}>
          This app is a wellness tool, not a medical device. It does not replace professional therapy.
        </Text>
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.l,
  },
  headerTitle: {
    ...Typography.h1,
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  cardsContainer: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.m,
  },
  trackCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: Spacing.l,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.soft,
  },
  trackCardDisabled: {
    opacity: 0.6,
  },
  trackCardPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.m,
  },
  trackContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.s,
  },
  trackTitle: {
    ...Typography.heading,
    color: Colors.textPrimary,
  },
  trackSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  activeBadge: {
    backgroundColor: Colors.brandLight,
    paddingVertical: 2,
    paddingHorizontal: Spacing.s,
    borderRadius: 10,
  },
  activeBadgeText: {
    ...Typography.micro,
    color: Colors.brand,
    fontSize: 9,
  },
  comingSoonBadge: {
    backgroundColor: Colors.background,
    paddingVertical: 2,
    paddingHorizontal: Spacing.s,
    borderRadius: 10,
  },
  comingSoonText: {
    ...Typography.micro,
    color: Colors.textTertiary,
    fontSize: 9,
  },
  featureRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: Spacing.m,
  },
  featureChip: {
    paddingVertical: 3,
    paddingHorizontal: Spacing.s,
    borderRadius: 8,
  },
  featureText: {
    ...Typography.micro,
    fontSize: 10,
    textTransform: 'none',
    fontWeight: '600',
  },
  arrow: {
    position: 'absolute',
    top: Spacing.l,
    right: Spacing.l,
  },
  disclaimer: {
    ...Typography.caption,
    color: Colors.textTertiary,
    textAlign: 'center',
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.xxl,
    fontSize: 11,
  },
});
