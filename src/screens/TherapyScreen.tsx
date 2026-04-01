import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Layout } from '../components/ui/Layout';
import { Colors, Typography, Spacing } from '../theme';

export const TherapyScreen = () => (
  <Layout style={styles.container}>
    <Text style={styles.title}>Therapy & Mental Health</Text>
    <Text style={styles.subtitle}>Self-guided CBT & Journaling coming soon.</Text>
  </Layout>
);

const styles = StyleSheet.create({
  container: {
    padding: 20,
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
