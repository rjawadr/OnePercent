import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Platform,
  Dimensions,
  Vibration,
  Modal,
  KeyboardAvoidingView,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSequence,
  FadeInDown,
  FadeInUp,
  Layout,
} from 'react-native-reanimated';
import { Colors, Typography, Spacing, Shadows, BorderRadius } from '../../theme';
import { Habit } from '../../models/Habit';
import { BlurView } from '@react-native-community/blur';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const { height } = Dimensions.get('window');
const TAB_BAR_OFFSET = 80;

interface HabitLoggingModalProps {
  habit: Habit;
  onLog: (value: number, notes?: string) => void;
  onClose: () => void;
  bottomSheetRef?: any;
}

export function HabitLoggingModal({ habit, onLog, onClose }: HabitLoggingModalProps) {
  const [value, setValue] = useState(habit.current_target.toString());
  const [notes, setNotes] = useState('');
  const insets = useSafeAreaInsets();

  const scale = useSharedValue(1);

  const handleLog = () => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      scale.value = withSequence(
        withTiming(1.05, { duration: 100 }),
        withTiming(1, { duration: 100 })
      );
      onLog(numValue, notes);
      onClose();
    }
  };

  const adjustValue = (amount: number) => {
    const current = parseFloat(value) || 0;
    const next = Math.max(0, current + amount);
    setValue(next.toString());
    Vibration.vibrate(10);
    scale.value = withSequence(
      withTiming(1.1, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );
  };

  const valueScaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  return (
    <Modal
      visible={true}
      animationType="fade"
      transparent={true}
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={styles.overlay}>
          <BlurView
            style={StyleSheet.absoluteFill}
            blurType="dark"
            blurAmount={10}
            reducedTransparencyFallbackColor="rgba(0,0,0,0.5)"
          />
          <Pressable style={styles.backdrop} onPress={onClose} />

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.keyboardView}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <Animated.View
                entering={FadeInUp.duration(400)}
                layout={Layout.duration(300)}
                style={[styles.modalContent, { marginBottom: TAB_BAR_OFFSET }]}
              >
                <View style={styles.grabHandle} />
                
                <ScrollView
                  style={styles.contentScroll}
                  contentContainerStyle={[
                    styles.content,
                    { paddingBottom: Math.max(insets.bottom, 40) + 40 }
                  ]}
                  showsVerticalScrollIndicator={false}
                  bounces={false}
                  keyboardShouldPersistTaps="handled"
                >
                  {/* Header Section */}
                  <Animated.View entering={FadeInDown.delay(100)} style={styles.header}>
                    <View style={styles.headerMain}>
                      <View style={[styles.iconStage, { backgroundColor: (habit.color || Colors.brand) + '20', borderColor: (habit.color || Colors.brand) + '40' }]}>
                        {/^[a-zA-Z0-9-]+$/.test(habit.icon || 'sparkles') ? (
                          <Icon name={habit.icon || 'sparkles'} size={28} color={habit.color || Colors.brand} />
                        ) : (
                          <Text style={{ fontSize: 24 }}>{habit.icon}</Text>
                        )}
                      </View>
                      <View style={styles.titleBlock}>
                        <Text style={styles.title} numberOfLines={1}>{habit.name}</Text>
                        <View style={styles.identityRow}>
                          <Icon name="medal" size={14} color={Colors.amber} />
                          <Text style={styles.identityText}>{habit.identity_statement || 'Building the future self'}</Text>
                        </View>
                      </View>
                    </View>
                    <Pressable
                      style={({ pressed }) => [styles.closeButton, pressed && { transform: [{ scale: 0.9 }], opacity: 0.7 }]}
                      onPress={onClose}
                    >
                      <Icon name="close" size={20} color={Colors.textSecondary} />
                    </Pressable>
                  </Animated.View>

                  {/* Progress Control */}
                  <Animated.View entering={FadeInDown.delay(200)} style={styles.controllerCard}>
                    <View style={styles.controllerHeader}>
                      <Text style={styles.controllerLabel}>SESSION PROGRESS</Text>
                      <View style={styles.targetBadge}>
                        <Icon name="bullseye-arrow" size={14} color={Colors.brand} />
                        <Text style={styles.targetText}>GOAL: {habit.current_target}{habit.unit}</Text>
                      </View>
                    </View>

                    <View style={styles.stepperContainer}>
                      <Pressable
                        style={({ pressed }) => [styles.stepBtn, pressed && { opacity: 0.7, transform: [{ scale: 0.96 }] }]}
                        onPress={() => adjustValue(-(habit.increment || 1))}
                      >
                        <Icon name="minus" size={28} color={Colors.textPrimary} />
                      </Pressable>

                      <Animated.View style={[styles.valueDisplay, valueScaleStyle]}>
                        <TextInput
                          style={styles.valueInput}
                          value={value}
                          onChangeText={setValue}
                          keyboardType="decimal-pad"
                          selectionColor={Colors.brand}
                          placeholder="0"
                          placeholderTextColor={Colors.textTertiary}
                        />
                        <Text style={styles.unitLabel}>{habit.unit || 'units'}</Text>
                      </Animated.View>

                      <Pressable
                        style={({ pressed }) => [styles.stepBtn, styles.stepBtnPrimary, pressed && { opacity: 0.7, transform: [{ scale: 0.96 }] }]}
                        onPress={() => adjustValue(habit.increment || 1)}
                      >
                        <Icon name="plus" size={28} color="#fff" />
                      </Pressable>
                    </View>

                    <View style={styles.quickActions}>
                      <Pressable
                        style={({ pressed }) => [styles.quickAction, pressed && { transform: [{ scale: 0.96 }], opacity: 0.7 }]}
                        onPress={() => setValue('0')}
                      >
                        <Text style={styles.quickActionText}>RESET</Text>
                      </Pressable>
                      <View style={styles.actionDivider} />
                      <Pressable
                        style={({ pressed }) => [styles.quickAction, pressed && { transform: [{ scale: 0.96 }], opacity: 0.7 }]}
                        onPress={() => setValue(habit.current_target.toString())}
                      >
                        <Text style={[styles.quickActionText, { color: Colors.brand }]}>HIT TARGET</Text>
                      </Pressable>
                    </View>
                  </Animated.View>

                  {/* Notes & Reflections */}
                  <Animated.View entering={FadeInDown.delay(300)} style={styles.reflectionSection}>
                    <View style={styles.sectionHeader}>
                      <Icon name="book-open-variant" size={16} color={Colors.textTertiary} />
                      <Text style={styles.sectionTitle}>SESSION REFLECTION</Text>
                    </View>
                    <TextInput
                      style={styles.reflectionInput}
                      value={notes}
                      onChangeText={setNotes}
                      placeholder="How was the session? Did you feel the 1% growth?"
                      placeholderTextColor={Colors.textTertiary}
                      multiline
                      numberOfLines={3}
                      maxLength={200}
                      selectionColor={Colors.brand}
                    />
                  </Animated.View>

                  {/* Final Action */}
                  <Animated.View
                    entering={FadeInDown.delay(500)}
                    style={styles.confirmBtnContainer}
                  >
                    <Pressable
                      onPress={handleLog}
                      style={({ pressed }) => [
                        styles.confirmBtnInner,
                        { shadowColor: Colors.brand },
                        pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }
                      ]}
                    >
                      <Icon name="check-bold" size={20} color={Colors.surface} />
                      <Text style={styles.confirmBtnText}>SECURE PROGRESS</Text>
                    </Pressable>
                  </Animated.View>
                </ScrollView>
              </Animated.View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  keyboardView: {
    width: '100%',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: Spacing.l,
    ...Shadows.elevated,
    maxHeight: height * 0.92,
  },
  grabHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.borderLight,
    alignSelf: 'center',
    marginBottom: Spacing.m,
  },
  contentScroll: {
    flexGrow: 0,
  },
  content: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.s,
    gap: 28,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.l,
    flex: 1,
  },
  iconStage: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  titleBlock: {
    flex: 1,
    gap: 4,
  },
  title: {
    ...Typography.heading,
    fontSize: 22,
    color: Colors.textPrimary,
    fontWeight: '900',
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  identityText: {
    ...Typography.micro,
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controllerCard: {
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 28,
    padding: Spacing.xl,
    gap: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  controllerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  controllerLabel: {
    ...Typography.micro,
    color: Colors.textTertiary,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  targetBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(78, 205, 196, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(78, 205, 196, 0.3)',
  },
  targetText: {
    ...Typography.micro,
    color: Colors.brand,
    fontWeight: '900',
    fontSize: 10,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  stepBtnPrimary: {
    backgroundColor: Colors.brand,
    borderColor: Colors.brand,
  },
  valueDisplay: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 140,
  },
  valueInput: {
    fontSize: 64,
    fontWeight: '900',
    color: Colors.textPrimary,
    textAlign: 'center',
    padding: 0,
    lineHeight: 72,
  },
  unitLabel: {
    ...Typography.micro,
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginTop: -4,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  quickAction: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  quickActionText: {
    ...Typography.micro,
    color: Colors.textSecondary,
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 0.8,
  },
  actionDivider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.borderLight,
  },
  reflectionSection: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 4,
  },
  sectionTitle: {
    ...Typography.micro,
    color: Colors.textTertiary,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  reflectionInput: {
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 24,
    padding: Spacing.xl,
    ...Typography.body,
    color: Colors.textPrimary,
    minHeight: 120,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  confirmBtnContainer: {
    borderRadius: 32,
    overflow: 'hidden',
    ...Shadows.elevated,
  },
  confirmBtnInner: {
    backgroundColor: Colors.brand,
    borderRadius: 32,
    paddingVertical: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  confirmBtnText: {
    ...Typography.heading,
    color: Colors.surface,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 2,
  },
});
