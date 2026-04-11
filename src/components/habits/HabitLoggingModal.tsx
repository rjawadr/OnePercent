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
  withTiming, 
  withSequence,
  FadeInDown,
  FadeIn
} from 'react-native-reanimated';
import { Colors, Typography, Spacing, Shadows, BorderRadius } from '../../theme';
import { Habit } from '../../models/Habit';

import { BlurView } from '@react-native-community/blur';

const { width } = Dimensions.get('window');

interface HabitLoggingModalProps {
  habit: Habit;
  onLog: (value: number, notes?: string) => void;
  onClose: () => void;
  bottomSheetRef: React.RefObject<BottomSheet>;
}

const GlassBackground = ({ style, ...props }: any) => (
  <View style={[style, { overflow: 'hidden', borderRadius: 32 }]}>
    <BlurView
      style={StyleSheet.absoluteFill}
      blurType="dark"
      blurAmount={20}
      reducedTransparencyFallbackColor="black"
    />
    <View 
      style={[
        StyleSheet.absoluteFill, 
        { 
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderWidth: 1.5,
          borderColor: 'rgba(255, 255, 255, 0.1)',
        }
      ]} 
    />
  </View>
);

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
        withTiming(1.05, { duration: 100 }),
        withTiming(1, { duration: 100 })
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
      withTiming(1.1, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );
  };

  const renderBackdrop = (props: any) => (
    <BottomSheetBackdrop
      {...props}
      disappearsOnIndex={-1}
      appearsOnIndex={0}
      opacity={0.5}
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
      backgroundComponent={GlassBackground}
      handleIndicatorStyle={styles.handle}
      bottomInset={64 + Math.max(insets.bottom, 12) + 16}
      detached={true}
      style={[styles.sheetContainer, { marginHorizontal: Spacing.m }]}
      keyboardBehavior="extend"
      keyboardBlurBehavior="restore"
      animationConfigs={{ duration: 300 }}
    >
      <BottomSheetScrollView 
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom, 40) + 40 }
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
      >
        {/* Header Section */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.header}>
          <View style={styles.headerMain}>
            <View style={[styles.iconStage, { backgroundColor: (habit.color || Colors.brand) + '20', borderColor: (habit.color || Colors.brand) + '40' }]}>
               <Icon name={habit.icon || 'sparkles'} size={28} color={habit.color || Colors.brand} />
            </View>
            <View style={styles.titleBlock}>
              <Text style={styles.title} numberOfLines={1}>{habit.name}</Text>
              <View style={styles.identityRow}>
                <Icon name="medal" size={14} color={Colors.amber} />
                <Text style={styles.identityText}>{habit.identity_statement || 'Building the future self'}</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={() => bottomSheetRef.current?.close()}
          >
            <Icon name="close" size={20} color="rgba(255,255,255,0.6)" />
          </TouchableOpacity>
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
            <TouchableOpacity 
              style={styles.stepBtn} 
              onPress={() => adjustValue(-(habit.increment || 1))}
              activeOpacity={0.7}
            >
              <Icon name="minus" size={28} color="#fff" />
            </TouchableOpacity>

            <Animated.View style={[styles.valueDisplay, valueScaleStyle]}>
              <TextInput
                style={styles.valueInput}
                value={value}
                onChangeText={setValue}
                keyboardType="decimal-pad"
                selectionColor={Colors.brand}
                placeholder="0"
                placeholderTextColor="rgba(255,255,255,0.2)"
              />
              <Text style={styles.unitLabel}>{habit.unit || 'units'}</Text>
            </Animated.View>

            <TouchableOpacity 
              style={[styles.stepBtn, styles.stepBtnPrimary]} 
              onPress={() => adjustValue(habit.increment || 1)}
              activeOpacity={0.7}
            >
              <Icon name="plus" size={28} color="#fff" />
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
              <Icon name="book-open-variant" size={16} color="rgba(255,255,255,0.5)" />
              <Text style={styles.sectionTitle}>SESSION REFLECTION</Text>
           </View>
           <TextInput
             style={styles.reflectionInput}
             value={notes}
             onChangeText={setNotes}
             placeholder="How was the session? Did you feel the 1% growth?"
             placeholderTextColor="rgba(255,255,255,0.3)"
             multiline
             numberOfLines={3}
             maxLength={200}
             selectionColor={Colors.brand}
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
  handle: {
    backgroundColor: 'rgba(255,255,255,0.2)',
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
    color: '#fff',
    fontWeight: '900',
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  identityText: {
    ...Typography.micro,
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    fontWeight: '700',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controllerCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 28,
    padding: Spacing.xl,
    gap: Spacing.xl,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  controllerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  controllerLabel: {
    ...Typography.micro,
    color: 'rgba(255,255,255,0.4)',
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
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
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
    color: '#fff',
    textAlign: 'center',
    padding: 0,
    lineHeight: 72,
  },
  unitLabel: {
    ...Typography.micro,
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginTop: -4,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  quickAction: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  quickActionText: {
    ...Typography.micro,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 0.8,
  },
  actionDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
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
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  reflectionInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 24,
    padding: Spacing.xl,
    ...Typography.body,
    color: '#fff',
    minHeight: 120,
    textAlignVertical: 'top',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  insightBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
    padding: Spacing.xl,
    borderRadius: 24,
    gap: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(78, 205, 196, 0.2)',
  },
  insightIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  insightText: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.85)',
    flex: 1,
    lineHeight: 22,
    fontWeight: '600',
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
