import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Layout } from '../components/ui/Layout';
import { COLORS } from '../theme/design_tokens';

export const SettingsScreen = () => (
  <Layout style={styles.container}>
    <Text style={styles.title}>Settings</Text>
    <Text style={styles.subtitle}>Personalization coming soon.</Text>
  </Layout>
);

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 10,
    textAlign: 'center',
  },
});
