import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Layout } from '../components/ui/Layout';
import { Button } from '../components/ui/Button';
import { Colors, Typography, Spacing, Shadows, BorderRadius } from '../theme';
import { useAgoraphobiaStore } from '../store/agoraphobiaStore';
import { useUIStore } from '../store/uiStore';

export const FearProfileScreen = () => {
  const navigation = useNavigation();
  const { fearProfile, saveFearProfile, initialize } = useAgoraphobiaStore();

  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [helplineName, setHelplineName] = useState('');
  const [helplinePhone, setHelplinePhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (fearProfile) {
      setEmergencyName(fearProfile.emergency_contact_name || '');
      setEmergencyPhone(fearProfile.emergency_contact_number || '');
      setHelplineName(fearProfile.crisis_helpline_name || '');
      setHelplinePhone(fearProfile.crisis_helpline_number || '');
    }
  }, [fearProfile]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await saveFearProfile({
        emergency_contact_name: emergencyName,
        emergency_contact_number: emergencyPhone,
        crisis_helpline_name: helplineName,
        crisis_helpline_number: helplinePhone,
      });
      useUIStore.getState().showAlert({
        title: 'Success',
        message: 'Safety profile updated successfully.',
        type: 'success'
      });
      navigation.goBack();
    } catch (error) {
      console.error('Error saving fear profile:', error);
      useUIStore.getState().showAlert({
        title: 'Error',
        message: 'Failed to save changes.',
        type: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Layout style={styles.container} noTabBar={true}>
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Icon name="arrow-left" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Safety Profile</Text>
        <View style={{ width: 44 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
          overScrollMode="never"
        >
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name="shield-account" size={32} color={Colors.brand} />
            </View>
            <Text style={styles.title}>Emergency Details</Text>
            <Text style={styles.subtitle}>
              This information is used during sessions to provide immediate support options if needed.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Emergency Contact</Text>
            <View style={styles.card}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Contact Name</Text>
                <TextInput
                  style={styles.input}
                  value={emergencyName}
                  onChangeText={setEmergencyName}
                  placeholder="e.g. Sarah (Wife)"
                  placeholderTextColor={Colors.textTertiary}
                />
              </View>
              <View style={styles.divider} />
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <TextInput
                  style={styles.input}
                  value={emergencyPhone}
                  onChangeText={setEmergencyPhone}
                  placeholder="+1 234 567 890"
                  placeholderTextColor={Colors.textTertiary}
                  keyboardType="phone-pad"
                />
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Crisis Helpline</Text>
            <View style={styles.card}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Helpline Name</Text>
                <TextInput
                  style={styles.input}
                  value={helplineName}
                  onChangeText={setHelplineName}
                  placeholder="e.g. National Crisis Line"
                  placeholderTextColor={Colors.textTertiary}
                />
              </View>
              <View style={styles.divider} />
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone/Code</Text>
                <TextInput
                  style={styles.input}
                  value={helplinePhone}
                  onChangeText={setHelplinePhone}
                  placeholder="988 or 741741"
                  placeholderTextColor={Colors.textTertiary}
                  keyboardType="phone-pad"
                />
              </View>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title="Save Changes"
              type="primary"
              onPress={handleSave}
              loading={isSaving}
              style={styles.saveBtn}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.m,
    height: 56,
  },
  backBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBarTitle: {
    ...Typography.heading,
    fontSize: 18,
    color: Colors.textPrimary,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.l,
    paddingBottom: Spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.brand + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.m,
  },
  title: {
    ...Typography.title,
    fontSize: 24,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.body,
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
    paddingHorizontal: Spacing.l,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionLabel: {
    ...Typography.micro,
    color: Colors.textTertiary,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: Spacing.s,
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
  inputGroup: {
    padding: Spacing.l,
  },
  inputLabel: {
    ...Typography.label,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    fontWeight: '600',
  },
  input: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontSize: 16,
    padding: 0, // Reset default padding
  },
  textArea: {
    padding: Spacing.l,
    height: 80,
    textAlignVertical: 'top',
  },
  inputSubtitle: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginBottom: Spacing.s,
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginHorizontal: Spacing.l,
  },
  buttonContainer: {
    marginTop: Spacing.m,
    marginBottom: Spacing.xl,
  },
  saveBtn: {
    height: 56,
  },
});
