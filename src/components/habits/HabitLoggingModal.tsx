import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Platform } from 'react-native';
import BottomSheet, { BottomSheetView, BottomSheetScrollView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Typography, Spacing } from '../../theme';
import { Habit } from '../../models/Habit';

interface HabitLoggingModalProps {
  habit: Habit;
  onLog: (value: number, notes?: string) => void;
  onClose: () => void;
  bottomSheetRef: React.RefObject<BottomSheet>;
}

export function HabitLoggingModal({ habit, onLog, onClose, bottomSheetRef }: HabitLoggingModalProps) {
  const [value, setValue] = useState(habit.current_target.toString());
  const [notes, setNotes] = useState('');

  // Snap points for the bottom sheet
  const snapPoints = useMemo(() => ['50%', '85%'], []);

  const handleLog = () => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      onLog(numValue, notes);
      bottomSheetRef.current?.close();
    }
  };

  const renderBackdrop = (props: any) => (
    <BottomSheetBackdrop
      {...props}
      disappearsOnIndex={-1}
      appearsOnIndex={0}
      opacity={0.5}
    />
  );

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
    >
      <BottomSheetScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{habit.name}</Text>
            <Text style={styles.subtitle}>{habit.identity_statement || 'Keep going!'}</Text>
          </View>
          <TouchableOpacity style={styles.closeBtn} onPress={() => bottomSheetRef.current?.close()}>
            <Icon name="close" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Value input card */}
        <View style={styles.inputCard}>
          <TextInput
            style={styles.valueInput}
            value={value}
            onChangeText={setValue}
            keyboardType="decimal-pad"
            placeholder="0"
            placeholderTextColor={Colors.textTertiary}
          />
          <View style={styles.unitBadge}>
            <Text style={styles.unitText}>{habit.unit || 'units'}</Text>
          </View>
        </View>

        {/* Quick actions */}
        <View style={styles.quickRow}>
          <TouchableOpacity 
            style={styles.quickBtn} 
            onPress={() => setValue(habit.current_target.toString())}
          >
            <Text style={styles.quickBtnText}>Target: {habit.current_target}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickBtn} 
            onPress={() => {
              const val = parseFloat(value) || 0;
              setValue((val + 1).toString());
            }}
          >
            <Text style={styles.quickBtnText}>+1 {habit.unit || ''}</Text>
          </TouchableOpacity>
        </View>

        {/* Notes */}
        <View style={styles.memoContainer}>
          <Text style={styles.memoLabel}>Notes (Optional)</Text>
          <TextInput
            style={styles.memoInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="How did it feel?"
            placeholderTextColor={Colors.textTertiary}
            multiline
            numberOfLines={3}
            maxLength={200}
          />
        </View>

        {/* Hint */}
        <Text style={styles.hint}>
          Target increases by 1% tomorrow if completed.
        </Text>

        {/* Log button */}
        <TouchableOpacity style={styles.logButton} onPress={handleLog} activeOpacity={0.85}>
          <Icon name="check" size={20} color={Colors.surface} />
          <Text style={styles.logButtonText}>Log Completion</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheetBg: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  handle: {
    backgroundColor: Colors.border,
    width: 36,
    height: 4,
  },
  content: {
    padding: Spacing.l,
    paddingTop: Spacing.m,
    gap: Spacing.l,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    ...Typography.title,
    color: Colors.textPrimary,
  },
  subtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 16,
    paddingHorizontal: Spacing.l,
    paddingVertical: Spacing.m,
    borderWidth: 1.5,
    borderColor: Colors.brand + '40',
  },
  valueInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
    padding: 0,
  },
  unitBadge: {
    backgroundColor: Colors.brandLight,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  unitText: {
    ...Typography.label,
    color: Colors.brand,
    fontWeight: '700',
  },
  quickRow: {
    flexDirection: 'row',
    gap: Spacing.s,
  },
  quickBtn: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingVertical: Spacing.m,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickBtnText: {
    ...Typography.label,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  memoContainer: {
    gap: Spacing.s,
  },
  memoLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  memoInput: {
    backgroundColor: Colors.background,
    borderRadius: 14,
    padding: Spacing.m,
    ...Typography.body,
    color: Colors.textPrimary,
    minHeight: 80,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  hint: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  logButton: {
    backgroundColor: Colors.brand,
    borderRadius: 28,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.s,
    ...Platform.select({
      ios: {
        shadowColor: Colors.brand,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
      },
      android: { elevation: 6 },
    }),
  },
  logButtonText: {
    ...Typography.body,
    color: Colors.surface,
    fontWeight: '700',
  },
});
