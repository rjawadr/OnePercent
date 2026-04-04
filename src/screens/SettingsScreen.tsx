import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { Layout } from '../components/ui/Layout';
import { Colors, Typography, Spacing, Shadows, BorderRadius } from '../theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SettingsRowProps {
  icon: string;
  label: string;
  onPress: () => void;
  color?: string;
  value?: string;
  showSwitch?: boolean;
  switchValue?: boolean;
}

const SettingsRow = ({ 
  icon, 
  label, 
  onPress, 
  color = Colors.brand, 
  value,
  showSwitch,
  switchValue
}: SettingsRowProps) => (
  <TouchableOpacity 
    style={styles.row} 
    onPress={onPress} 
    activeOpacity={0.7}
    disabled={showSwitch}
  >
    <View style={[styles.iconBox, { backgroundColor: color + '12' }]}>
      <Icon name={icon} size={20} color={color} />
    </View>
    <View style={styles.labelWrapper}>
       <Text style={styles.label}>{label}</Text>
       {value && <Text style={styles.value}>{value}</Text>}
    </View>
    {showSwitch ? (
      <Switch 
        value={switchValue} 
        onValueChange={() => onPress()}
        trackColor={{ false: Colors.border, true: Colors.brand }}
        thumbColor={Colors.surface}
      />
    ) : (
      <Icon name="chevron-right" size={20} color={Colors.textTertiary} />
    )}
  </TouchableOpacity>
);

export const SettingsScreen = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  return (
    <Layout style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20 }]}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Fine-tune your 1% growth engine.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Habits & Tracking</Text>
          <View style={styles.card}>
            <SettingsRow 
              icon="format-list-bulleted" 
              label="Manager" 
              onPress={() => navigation.navigate('HabitManager')} 
            />
            <View style={styles.divider} />
            <SettingsRow 
              icon="cloud-sync" 
              label="Sync Status" 
              onPress={() => {}} 
              color={Colors.textSecondary}
              value="Cloud Backup Active"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Experience</Text>
          <View style={styles.card}>
            <SettingsRow 
              icon="palette" 
              label="Theme" 
              onPress={() => {}} 
              value="System"
            />
            <View style={styles.divider} />
            <SettingsRow 
              icon="bell-ring" 
              label="Reminders" 
              onPress={() => {}} 
              showSwitch
              switchValue={true}
            />
             <View style={styles.divider} />
            <SettingsRow 
              icon="vibrate" 
              label="Haptic Feedback" 
              onPress={() => {}} 
              showSwitch
              switchValue={true}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>The Discipline Lab</Text>
          <View style={styles.card}>
            <SettingsRow 
              icon="star" 
              label="Rate OnePercent" 
              onPress={() => {}} 
              color={Colors.gold}
            />
            <View style={styles.divider} />
            <SettingsRow 
              icon="github" 
              label="Source & Feedback" 
              onPress={() => {}} 
            />
            <View style={styles.divider} />
             <SettingsRow 
              icon="shield-check" 
              label="Privacy Policy" 
              onPress={() => {}} 
            />
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.footerBranding}>
            <Icon name="infinity" size={24} color={Colors.brand} />
          </View>
          <Text style={styles.version}>OnePercent v1.0.0-alpha</Text>
          <Text style={styles.madeWith}>Engineered for sustainable growth.</Text>
        </View>
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: 60,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    ...Typography.title,
    fontSize: 32,
    color: Colors.textPrimary,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    ...Typography.micro,
    color: Colors.textTertiary,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: 'hidden',
    ...Shadows.soft,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.l,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.l,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.m,
  },
  labelWrapper: {
    flex: 1,
  },
  label: {
    ...Typography.heading,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  value: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginLeft: 60 + Spacing.m,
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  footerBranding: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    ...Shadows.soft,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  version: {
    ...Typography.label,
    color: Colors.textSecondary,
    fontWeight: '700',
  },
  madeWith: {
    ...Typography.micro,
    color: Colors.textTertiary,
    marginTop: 6,
    fontWeight: '600',
  },
});
