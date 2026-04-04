import React, { useState, useMemo, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  Platform,
  Dimensions,
  Vibration
} from 'react-native';
import BottomSheet, { 
  BottomSheetScrollView, 
  BottomSheetBackdrop 
} from '@gorhom/bottom-sheet';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring, 
  withSequence,
  FadeInDown,
  FadeIn
} from 'react-native-reanimated';
import { Colors, Typography, Spacing, Shadows, BorderRadius } from '../../theme';
import { Habit } from '../../models/Habit';

const { width } = Dimensions.get('window');

interface HabitLoggingModalProps {
  habit: Habit;
  onLog: (value: number, notes?: string) => void;
  onClose: () => void;
  bottomSheetRef: React.RefObject<BottomSheet>;
}

export function HabitLoggingModal({ habit, onLog, onClose, bottomSheetRef }: HabitLoggingModalProps) {
  const [value, setValue] = useState(habit.current_target.toString());
  const [notes, setNotes] = useState('');
  const insets = useSafeAreaInsets();
  
  const scale = useSharedValue(1);
  const snapPoints = useMemo(() => ['75%', '95%'], []);

  const handleLog = () => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      scale.value = withSequence(
        withSpring(1.05),
        withSpring(1)
      );
      onLog(numValue, notes);
      bottomSheetRef.current?.close();
    }
  };

  const adjustValue = (amount: number) => {
    const current = parseFloat(value) || 0;
    const next = Math.max(0, current + amount);
    setValue(next.toString());
    Vibration.vibrate(10);
    scale.value = withSequence(
      withSpring(1.1, { damping: 10, stiffness: 100 }),
      withSpring(1)
    );
  };

  const renderBackdrop = (props: any) => (
    <BottomSheetBackdrop
      {...props}
      disappearsOnIndex={-1}
      appearsOnIndex={0}
      opacity={0.7}
      enableTouchThrough={false}
    />
  );

  const valueScaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={onClose}
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.sheetBg}
      handleIndicatorStyle={styles.handle}
      bottomInset={0}
      detached={false}
      style={styles.sheetContainer}
      keyboardBehavior="extend"
      keyboardBlurBehavior="restore"
    >
      <BottomSheetScrollView 
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom, 40) + 40 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.header}>
          <View style={styles.headerMain}>
            <View style={[styles.iconStage, { backgroundColor: (habit.color || Colors.brand) + '15' }]}>
               <Text style={styles.iconEmoji}>{habit.icon || '🔥'}</Text>
            </View>
            <View style={styles.titleBlock}>
              <Text style={styles.title} numberOfLines={1}>{habit.name}</Text>
              <View style={styles.identityRow}>
                <Icon name="medal" size={12} color={Colors.amber} />
                <Text style={styles.identityText}>{habit.identity_statement || 'Striving for 1% better'}</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={() => bottomSheetRef.current?.close()}
          >
            <Icon name="close" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </Animated.View>

        {/* Progress Control - The "Engine" */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.controllerCard}>
          <View style={styles.controllerHeader}>
             <Text style={styles.controllerLabel}>SESSION PROGRESS</Text>
             <View style={styles.targetBadge}>
                <Icon name="bullseye-arrow" size={14} color={Colors.brand} />
                <Text style={styles.targetText}>GOAL: {habit.current_target}{habit.unit}</Text>
             </View>
          </View>

          <View style={styles.stepperContainer}>
            <TouchableOpacity 
              style={styles.stepBtn} 
              onPress={() => adjustValue(-(habit.increment || 1))}
              activeOpacity={0.7}
            >
              <Icon name="minus" size={28} color={Colors.textPrimary} />
            </TouchableOpacity>

            <Animated.View style={[styles.valueDisplay, valueScaleStyle]}>
              <TextInput
                style={styles.valueInput}
                value={value}
                onChangeText={setValue}
                keyboardType="decimal-pad"
                selectionColor={Colors.brand}
                placeholder="0"
              />
              <Text style={styles.unitLabel}>{habit.unit || 'units'}</Text>
            </Animated.View>

            <TouchableOpacity 
              style={[styles.stepBtn, styles.stepBtnPrimary]} 
              onPress={() => adjustValue(habit.increment || 1)}
              activeOpacity={0.7}
            >
              <Icon name="plus" size={28} color={Colors.surface} />
            </TouchableOpacity>
          </View>

          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => setValue('0')}
            >
              <Text style={styles.quickActionText}>RESET</Text>
            </TouchableOpacity>
            <View style={styles.actionDivider} />
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => setValue(habit.current_target.toString())}
            >
              <Text style={[styles.quickActionText, { color: Colors.brand }]}>HIT TARGET</Text>
            </TouchableOpacity>
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
           />
        </Animated.View>

        {/* Insight Box */}
        <Animated.View entering={FadeIn.delay(400)} style={styles.insightBox}>
          <View style={styles.insightIconBox}>
             <Icon name="lightbulb-on-outline" size={20} color={Colors.amber} />
          </View>
          <Text style={styles.insightText}>
            Consistency is the engine of identity. Your action today rewires your baseline for tomorrow.
          </Text>
        </Animated.View>

        {/* Final Action */}
        <Animated.View 
          entering={FadeInDown.delay(500)}
          style={styles.confirmBtnContainer}
        >
          <TouchableOpacity 
            onPress={handleLog}
            activeOpacity={0.9}
            style={[styles.confirmBtnInner, { shadowColor: Colors.brand }]}
          >
            <Icon name="check-bold" size={20} color={Colors.surface} />
            <Text style={styles.confirmBtnText}>SECURE PROGRESS</Text>
          </TouchableOpacity>
        </Animated.View>
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheetBg: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
  },
  handle: {
    backgroundColor: Colors.border,
    width: 40,
    height: 4,
    marginTop: 12,
  },
  sheetContainer: {
    ...Shadows.elevated,
  },
  content: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
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
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
  },
  iconEmoji: {
    fontSize: 28,
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
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controllerCard: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.xxl,
    padding: Spacing.xl,
    gap: Spacing.xl,
    borderWidth: 1.5,
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
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.l,
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  targetText: {
    ...Typography.micro,
    color: Colors.textPrimary,
    fontWeight: '900',
    fontSize: 10,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.soft,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
  },
  stepBtnPrimary: {
    backgroundColor: Colors.brand,
    borderColor: Colors.brand,
  },
  valueDisplay: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  valueInput: {
    fontSize: 56,
    fontWeight: '900',
    color: Colors.textPrimary,
    textAlign: 'center',
    padding: 0,
    lineHeight: 64,
  },
  unitLabel: {
    ...Typography.micro,
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginTop: -4,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.l,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  quickAction: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  quickActionText: {
    ...Typography.micro,
    color: Colors.textSecondary,
    fontWeight: '900',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  actionDivider: {
    width: 1,
    height: 20,
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
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    ...Typography.body,
    color: Colors.textPrimary,
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
  },
  insightBox: {
    flexDirection: 'row',
    backgroundColor: Colors.brandLight,
    padding: Spacing.l,
    borderRadius: BorderRadius.xl,
    gap: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.brand + '20',
  },
  insightIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.soft,
  },
  insightText: {
    ...Typography.caption,
    color: Colors.textPrimary,
    flex: 1,
    lineHeight: 20,
    fontWeight: '500',
  },
  confirmBtn: {
    borderRadius: BorderRadius.full,
    ...Shadows.elevated,
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  confirmBtnContainer: {
     borderRadius: BorderRadius.full,
     overflow: 'hidden',
     ...Shadows.elevated,
  },
  confirmBtnInner: {
    backgroundColor: Colors.brand,
    borderRadius: BorderRadius.full,
    paddingVertical: 20,
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
    letterSpacing: 1.5,
  },
});
