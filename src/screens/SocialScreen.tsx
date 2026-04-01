import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Layout } from '../components/ui/Layout';
import { Colors, Typography, Spacing } from '../theme';

export const SocialScreen = () => (
  <Layout style={styles.container}>
    <Text style={styles.title}>Social Community</Text>
    <Text style={styles.subtitle}>Peer support and groups coming soon.</Text>
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
