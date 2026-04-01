import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Layout } from '../components/ui/Layout';
import { Colors, Typography, Spacing } from '../theme';

export const PhysicalScreen = () => (
  <Layout style={styles.container}>
    <Text style={styles.title}>Physical Health</Text>
    <Text style={styles.subtitle}>Gym, Cardio & Biometrics coming soon.</Text>
  </Layout>
);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: 80, // Offset for floating tab bar
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...Typography.title,
    color: Colors.textPrimary,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.s,
    textAlign: 'center',
  },
});
