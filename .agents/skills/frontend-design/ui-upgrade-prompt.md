# UI Upgrade Prompt — 1% Discipline App
> Give this entire prompt to your vibe coding agent. Do not summarise it.

---

## CONTEXT

You are upgrading the UI of a React Native app called **1% Discipline**. The app is already working — habits are created, logged, and tracked. **Do NOT touch any business logic, engine calculations, store actions, database queries, or navigation structure.** You are only restyling existing components and screens.

The app currently looks basic (plain cards, flat layout, generic tab bar). The goal is to make it feel **premium, calm, and identity-affirming** — like a high-end wellness app that a user is proud to open every day.

---

## DESIGN DIRECTION

**Aesthetic:** Refined luxury minimalism with organic warmth. Think: calm confidence, not aggressive motivation. The app talks to someone building their identity, not chasing a goal.

**Mood board in words:** Dark navy depth + teal precision + warm white breathing room + golden milestone moments. Every interaction should feel like quiet accomplishment.

**The one thing users will remember:** The habit card. It should feel like a premium task — not a checkbox. When you complete it, it should feel *significant*.

---

## STRICT DESIGN RULES (Non-negotiable)

1. **NEVER use red** for any state — use `#F5A623` (amber) for warnings, `#9BA3B0` (grey) for inactive
2. **No urgency language or aggressive animations** — this app serves anxiety-prone users
3. **No countdown timers with decreasing numbers** — use progress bars only
4. **Cancel buttons:** always `#9BA3B0` (grey), never red or orange
5. **All tap targets:** minimum 44×44pt
6. **Numbers must be rounded:** display `5.4 Min` not `5.360676760535051`

---

## DESIGN TOKENS (Use these exact values everywhere)

```typescript
// src/theme/colors.ts — replace entire file with this

export const Colors = {
  // Brand
  brand:        '#3EC9A7',   // Teal — primary actions, active states, checkmarks
  brandLight:   '#F0FBF7',   // Very light teal — card tints, projection card bg
  brandDark:    '#2BA888',   // Darker teal — pressed states

  // Backgrounds
  background:   '#F5F6F8',   // Screen background (warm white-grey)
  surface:      '#FFFFFF',   // Cards, bottom sheets, modals

  // Text
  textPrimary:  '#1C2B4A',   // Deep navy — all primary text
  textSecondary:'#9BA3B0',   // Soft grey — subtitles, placeholders, inactive labels
  textInverse:  '#FFFFFF',   // White — text on dark/teal backgrounds

  // Accents
  purple:       '#7B5EA7',   // Identity, streaks, FAB button, goal badges
  purpleLight:  '#F3F0F9',   // Light purple tint — purple card backgrounds
  gold:         '#F5C518',   // Milestone badges, star icons, streak flames
  goldLight:    '#FFF9E6',   // Light gold tint
  amber:        '#F5A623',   // Warnings (never red) — missed once state
  amberLight:   '#FFF4E0',   // Light amber tint

  // Structural
  border:       '#E8EAED',   // Dividers, inactive borders
  borderLight:  '#F0F2F5',   // Very subtle separators
  shadow:       '#000000',   // Shadow colour (use at low opacity)

  // Module colours (for habit category dots and icon backgrounds)
  modulePersonal: '#3EC9A7',
  modulePhysical: '#F5A623',
  moduleZen:      '#7B5EA7',
  moduleWork:     '#4A6FA5',
};

// Dark mode equivalents (implement with useColorScheme)
export const DarkColors = {
  background:   '#0F1923',
  surface:      '#1C2B3A',
  textPrimary:  '#FFFFFF',
  textSecondary:'#6B7280',
  border:       '#2D3748',
  // All brand/accent colours stay identical in dark mode
};
```

```typescript
// src/theme/typography.ts — replace entire file

export const Typography = {
  display: { fontSize: 40, fontWeight: '700' as const, letterSpacing: -0.5, lineHeight: 48 },
  title:   { fontSize: 20, fontWeight: '700' as const, letterSpacing: -0.2, lineHeight: 26 },
  heading: { fontSize: 17, fontWeight: '600' as const, letterSpacing: 0,    lineHeight: 24 },
  body:    { fontSize: 15, fontWeight: '400' as const, letterSpacing: 0,    lineHeight: 22 },
  label:   { fontSize: 12, fontWeight: '600' as const, letterSpacing: 0.3,  lineHeight: 16 },
  caption: { fontSize: 12, fontWeight: '400' as const, letterSpacing: 0,    lineHeight: 16 },
  micro:   { fontSize: 10, fontWeight: '400' as const, letterSpacing: 0.2,  lineHeight: 14 },
};
```

```typescript
// src/theme/spacing.ts
export const Spacing = {
  xs: 4, s: 8, m: 12, l: 16, xl: 20, xxl: 24, xxxl: 32, xxxxl: 48,
};
```

```typescript
// src/theme/shadows.ts
import { Platform } from 'react-native';

export const Shadows = {
  card: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
    },
    android: { elevation: 3 },
  }),
  cardHeavy: Platform.select({
    ios: {
      shadowColor: '#1C2B4A',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 24,
    },
    android: { elevation: 8 },
  }),
  fab: Platform.select({
    ios: {
      shadowColor: '#7B5EA7',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 12,
    },
    android: { elevation: 10 },
  }),
};
```

---

## ICON LIBRARY

Install and use **react-native-vector-icons** with the **MaterialCommunityIcons** set. This gives clean, modern icons that feel native.

```bash
npm install react-native-vector-icons
npm install --save-dev @types/react-native-vector-icons
```

```typescript
// Usage pattern everywhere in the app:
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Examples:
<Icon name="home-variant"        size={24} color={Colors.brand} />  // Today tab
<Icon name="chart-line"          size={24} color={Colors.textSecondary} />  // Stats tab
<Icon name="brain"               size={24} color={Colors.textSecondary} />  // Therapy tab
<Icon name="dumbbell"            size={24} color={Colors.textSecondary} />  // Physical tab
<Icon name="account-group"       size={24} color={Colors.textSecondary} />  // Social tab
<Icon name="fire"                size={16} color={Colors.gold} />  // Streak flame
<Icon name="star-four-points"    size={20} color={Colors.gold} />  // Habit icon fallback
<Icon name="check-circle"        size={28} color={Colors.brand} />  // Completed state
<Icon name="circle-outline"      size={28} color={Colors.border} />  // Incomplete state
<Icon name="chevron-right"       size={20} color={Colors.textSecondary} />  // Row arrows
<Icon name="bell-outline"        size={22} color={Colors.textPrimary} />  // Notifications
<Icon name="trending-up"         size={16} color={Colors.brand} />  // Growth indicator
```

---

## COMPONENT UPGRADES

### 1. Bottom Tab Bar — Full Replacement

Replace your current tab bar with this custom component. The current one shows single letters (T, A, P, S, F) which looks unfinished.

```typescript
// src/navigation/CustomTabBar.tsx
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Shadows, Typography } from '../theme';

const TABS = [
  { key: 'Today',    icon: 'home-variant-outline',  iconActive: 'home-variant',   label: 'Today'    },
  { key: 'Therapy',  icon: 'brain',                 iconActive: 'brain',           label: 'Therapy'  },
  { key: 'ADD',      icon: 'plus',                  iconActive: 'plus',            label: ''         }, // FAB centre
  { key: 'Stats',    icon: 'chart-line',            iconActive: 'chart-line',      label: 'Stats'    },
  { key: 'Social',   icon: 'account-group-outline', iconActive: 'account-group',   label: 'Social'   },
];

export function CustomTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {TABS.map((tab, index) => {
        // Centre FAB
        if (tab.key === 'ADD') {
          return (
            <TouchableOpacity
              key="fab"
              onPress={() => navigation.navigate('Today', { openCreate: true })}
              style={styles.fab}
              activeOpacity={0.85}
            >
              <Icon name="plus" size={28} color="#FFFFFF" />
            </TouchableOpacity>
          );
        }

        const routeIndex = index > 2 ? index - 1 : index; // account for FAB
        const isFocused = state.index === routeIndex;
        const route = state.routes[routeIndex];

        return (
          <TouchableOpacity
            key={tab.key}
            onPress={() => navigation.navigate(route.name)}
            style={styles.tab}
            activeOpacity={0.7}
          >
            <Icon
              name={isFocused ? tab.iconActive : tab.icon}
              size={24}
              color={isFocused ? Colors.brand : Colors.textSecondary}
            />
            <Text style={[styles.label, isFocused && styles.labelActive]}>
              {tab.label}
            </Text>
            {isFocused && <View style={styles.activeDot} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderTopWidth: 0.5,
    borderTopColor: Colors.border,
    alignItems: 'center',
    height: 64,
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    gap: 4,
  },
  label: {
    ...Typography.micro,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  labelActive: {
    color: Colors.brand,
    fontWeight: '600',
  },
  activeDot: {
    position: 'absolute',
    bottom: -8,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.brand,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,     // lifts above tab bar
    ...Platform.select({
      ios: {
        shadowColor: Colors.purple,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
      },
      android: { elevation: 10 },
    }),
  },
});
```

Wire it in your navigator:
```typescript
<Tab.Navigator tabBar={(props) => <CustomTabBar {...props} />}>
```

---

### 2. HabitCard — Full Redesign

This is the most important component. Replace your current card entirely.

```typescript
// src/components/habits/HabitCard.tsx
import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Platform,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withSequence,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Typography, Spacing, Shadows } from '../../theme';

// Map category strings to colours
const CATEGORY_COLORS: Record<string, string> = {
  personal: Colors.brand,
  physical: Colors.amber,
  zen:      Colors.purple,
  work:     '#4A6FA5',
};

interface HabitCardProps {
  habit: {
    id: string;
    name: string;
    category: string;
    emoji?: string;
    todayTarget: number;
    unit: string;
    currentStreak: number;
    completedToday: boolean;
    progressPercent: number;   // 0–100
  };
  onPress: () => void;        // opens log modal
  onLongPress?: () => void;   // opens context menu
}

export function HabitCard({ habit, onPress, onLongPress }: HabitCardProps) {
  const scale = useSharedValue(1);
  const categoryColor = CATEGORY_COLORS[habit.category?.toLowerCase()] ?? Colors.brand;
  const isMilestone = [7, 14, 30, 60, 90, 180, 365].includes(habit.currentStreak);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSequence(
      withSpring(0.97, { damping: 15 }),
      withSpring(1, { damping: 15 })
    );
    onPress();
  };

  // Format number properly — no floating point mess
  const formatValue = (val: number, unit: string) => {
    const rounded = Number.isInteger(val) ? val : parseFloat(val.toFixed(1));
    return `${rounded} ${unit}`;
  };

  return (
    <Animated.View style={[styles.card, animatedStyle]}>
      <TouchableOpacity
        onPress={handlePress}
        onLongPress={onLongPress}
        activeOpacity={1}
        style={styles.touchable}
      >
        {/* Left accent bar */}
        <View style={[styles.accentBar, { backgroundColor: categoryColor }]} />

        {/* Icon box */}
        <View style={[styles.iconBox, { backgroundColor: categoryColor + '18' }]}>
          {habit.emoji ? (
            <Text style={styles.emoji}>{habit.emoji}</Text>
          ) : (
            <Icon name="star-four-points" size={22} color={categoryColor} />
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Top row: name + streak */}
          <View style={styles.topRow}>
            <Text style={styles.habitName} numberOfLines={1}>{habit.name}</Text>
            <View style={[styles.streakBadge, isMilestone && styles.streakBadgeMilestone]}>
              <Icon
                name={isMilestone ? 'star' : 'fire'}
                size={11}
                color={isMilestone ? Colors.gold : Colors.amber}
              />
              <Text style={[styles.streakText, isMilestone && styles.streakTextMilestone]}>
                {habit.currentStreak}
              </Text>
            </View>
          </View>

          {/* Category label */}
          <Text style={styles.category}>{habit.category?.toUpperCase()}</Text>

          {/* Goal row */}
          <View style={styles.goalRow}>
            <Text style={styles.goalLabel}>Today's Goal</Text>
            <Text style={[styles.goalValue, { color: categoryColor }]}>
              {formatValue(habit.todayTarget, habit.unit)}
            </Text>
          </View>

          {/* Progress bar */}
          <View style={styles.progressTrack}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  backgroundColor: habit.completedToday ? Colors.brand : categoryColor,
                  width: `${Math.min(habit.progressPercent, 100)}%`,
                },
              ]}
            />
          </View>
        </View>

        {/* Right: completion button */}
        <TouchableOpacity
          onPress={handlePress}
          style={styles.actionButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Icon
            name={habit.completedToday ? 'check-circle' : 'circle-outline'}
            size={32}
            color={habit.completedToday ? Colors.brand : Colors.border}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    marginHorizontal: Spacing.l,
    marginBottom: Spacing.m,
    overflow: 'hidden',
    ...Shadows.card,
  },
  touchable: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.l,
    gap: Spacing.m,
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.xs,
  },
  emoji: {
    fontSize: 24,
  },
  content: {
    flex: 1,
    gap: 3,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  habitName: {
    ...Typography.heading,
    color: Colors.textPrimary,
    flex: 1,
    marginRight: Spacing.s,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.amberLight,
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 3,
    gap: 3,
  },
  streakBadgeMilestone: {
    backgroundColor: Colors.goldLight,
  },
  streakText: {
    ...Typography.label,
    color: Colors.amber,
  },
  streakTextMilestone: {
    color: Colors.gold,
  },
  category: {
    ...Typography.micro,
    color: Colors.textSecondary,
    letterSpacing: 0.8,
    marginTop: 1,
  },
  goalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.s,
  },
  goalLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  goalValue: {
    ...Typography.body,
    fontWeight: '700',
  },
  progressTrack: {
    height: 4,
    backgroundColor: Colors.borderLight,
    borderRadius: 2,
    marginTop: Spacing.s,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  actionButton: {
    paddingLeft: Spacing.s,
  },
});
```

---

### 3. Today Screen Header — Redesign

Replace the plain "Good Morning" header with a premium version.

```typescript
// src/components/ui/TodayHeader.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Typography, Spacing } from '../../theme';
import { format } from 'date-fns';

interface TodayHeaderProps {
  completedCount: number;
  totalCount: number;
  identityStatement?: string;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export function TodayHeader({ completedCount, totalCount, identityStatement }: TodayHeaderProps) {
  const today = new Date();
  const allDone = completedCount === totalCount && totalCount > 0;

  return (
    <View style={styles.container}>
      {/* Top row */}
      <View style={styles.topRow}>
        <View>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.date}>{format(today, 'EEEE, MMMM d')}</Text>
        </View>

        {/* Completion pill */}
        <View style={[styles.completionPill, allDone && styles.completionPillDone]}>
          <Icon
            name={allDone ? 'check-all' : 'check'}
            size={14}
            color={allDone ? Colors.surface : Colors.brand}
          />
          <Text style={[styles.completionText, allDone && styles.completionTextDone]}>
            {completedCount}/{totalCount}
          </Text>
        </View>
      </View>

      {/* Identity statement (if set) */}
      {identityStatement && (
        <View style={styles.identityRow}>
          <Icon name="lightning-bolt" size={13} color={Colors.purple} />
          <Text style={styles.identityText} numberOfLines={1}>
            {identityStatement}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.l,
    paddingTop: Spacing.l,
    paddingBottom: Spacing.m,
    gap: Spacing.s,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  date: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  completionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.brandLight,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.brand + '30',
  },
  completionPillDone: {
    backgroundColor: Colors.brand,
  },
  completionText: {
    ...Typography.label,
    color: Colors.brand,
    fontWeight: '700',
  },
  completionTextDone: {
    color: Colors.surface,
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  identityText: {
    ...Typography.caption,
    color: Colors.purple,
    fontStyle: 'italic',
    flex: 1,
  },
});
```

---

### 4. Date Scroll Row — Redesign

Replace the current flat date row with this version that has proper progress rings.

```typescript
// src/components/ui/DateScrollRow.tsx
import React from 'react';
import { ScrollView, TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { format, subDays, isSameDay } from 'date-fns';
import { Colors, Typography, Spacing } from '../../theme';

interface DayData {
  date: Date;
  completionRate: number; // 0–1
}

interface DateScrollRowProps {
  days: DayData[];        // last 7 days
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

function ProgressRing({ size, progress, isToday, isSelected }:
  { size: number; progress: number; isToday: boolean; isSelected: boolean }) {
  const stroke = 2.5;
  const radius = (size - stroke * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);

  return (
    <Svg width={size} height={size}>
      {/* Track */}
      <Circle
        cx={size / 2} cy={size / 2} r={radius}
        stroke={Colors.borderLight}
        strokeWidth={stroke}
        fill={isSelected ? Colors.brand : isToday ? Colors.surface : 'transparent'}
      />
      {/* Progress */}
      {progress > 0 && (
        <Circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={Colors.brand}
          strokeWidth={stroke}
          fill="transparent"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      )}
    </Svg>
  );
}

export function DateScrollRow({ days, selectedDate, onSelectDate }: DateScrollRowProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {days.map((day) => {
        const isToday = isSameDay(day.date, new Date());
        const isSelected = isSameDay(day.date, selectedDate);

        return (
          <TouchableOpacity
            key={day.date.toISOString()}
            onPress={() => onSelectDate(day.date)}
            style={styles.dayWrapper}
            activeOpacity={0.7}
          >
            <View style={styles.ringWrapper}>
              <ProgressRing
                size={44}
                progress={day.completionRate}
                isToday={isToday}
                isSelected={isSelected}
              />
              <View style={styles.dateNumberWrapper}>
                <Text style={[
                  styles.dateNumber,
                  isSelected && styles.dateNumberSelected,
                  isToday && !isSelected && styles.dateNumberToday,
                ]}>
                  {format(day.date, 'd')}
                </Text>
              </View>
            </View>
            <Text style={[styles.dayLabel, isSelected && styles.dayLabelSelected]}>
              {format(day.date, 'EEE').toUpperCase()}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.l,
    paddingVertical: Spacing.m,
    gap: Spacing.m,
  },
  dayWrapper: {
    alignItems: 'center',
    gap: 4,
    width: 48,
  },
  ringWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateNumberWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateNumber: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  dateNumberSelected: {
    color: Colors.surface,
    fontWeight: '700',
  },
  dateNumberToday: {
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  dayLabel: {
    ...Typography.micro,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  dayLabelSelected: {
    color: Colors.brand,
    fontWeight: '600',
  },
});
```

---

### 5. Log Habit Modal — Redesign + Scroll Fix

This fixes the scroll bug AND makes it look premium.

```typescript
// src/components/habits/HabitLoggingModal.tsx
// Replace your existing logging modal entirely

import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  Platform, KeyboardAvoidingView,
} from 'react-native';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Typography, Spacing, Shadows } from '../../theme';

interface Props {
  habit: { name: string; todayTarget: number; unit: string; };
  onLog: (value: number, memo?: string) => void;
  onClose: () => void;
  bottomSheetRef: React.RefObject<BottomSheet>;
}

export function HabitLoggingModal({ habit, onLog, onClose, bottomSheetRef }: Props) {
  const [value, setValue] = useState(habit.todayTarget.toFixed(1));
  const [memo, setMemo] = useState('');
  const snapPoints = ['55%', '85%'];

  // Format display target
  const displayTarget = Number.isInteger(habit.todayTarget)
    ? habit.todayTarget.toString()
    : habit.todayTarget.toFixed(1);

  const handleLog = () => {
    const numVal = parseFloat(value);
    if (!isNaN(numVal) && numVal > 0) {
      onLog(numVal, memo.trim() || undefined);
    }
  };

  const quickAmounts = [-1, +1, +5].map(delta => ({
    label: delta > 0 ? `+${delta}` : `${delta}`,
    value: Math.max(0, parseFloat(value) + delta),
  }));

  return (
    <BottomSheet
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      keyboardBehavior="extend"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      backgroundStyle={styles.sheetBg}
      handleIndicatorStyle={styles.handle}
      onClose={onClose}
      enablePanDownToClose
    >
      <BottomSheetScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Log {habit.name}</Text>
            <Text style={styles.subtitle}>
              Target: {displayTarget} {habit.unit}
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Icon name="close" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Value input */}
        <View style={styles.inputCard}>
          <TextInput
            style={styles.valueInput}
            value={value}
            onChangeText={setValue}
            keyboardType="decimal-pad"
            selectTextOnFocus
            placeholderTextColor={Colors.textSecondary}
          />
          <View style={styles.unitBadge}>
            <Text style={styles.unitText}>{habit.unit}</Text>
          </View>
        </View>

        {/* Quick adjust row */}
        <View style={styles.quickRow}>
          {quickAmounts.map((qa) => (
            <TouchableOpacity
              key={qa.label}
              style={styles.quickBtn}
              onPress={() => setValue(qa.value.toFixed(1))}
            >
              <Text style={styles.quickBtnText}>{qa.label}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={styles.quickBtn}
            onPress={() => setValue(displayTarget)}
          >
            <Text style={styles.quickBtnText}>Target</Text>
          </TouchableOpacity>
        </View>

        {/* Memo input */}
        <View style={styles.memoContainer}>
          <Text style={styles.memoLabel}>Note (optional)</Text>
          <TextInput
            style={styles.memoInput}
            value={memo}
            onChangeText={setMemo}
            placeholder="How did it go?"
            placeholderTextColor={Colors.textSecondary}
            multiline
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

        <View style={{ height: 20 }} />
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
```

---

### 6. Create Habit Modal — Redesign

```typescript
// src/components/habits/CreateHabitModal.tsx — restyle Screen 1

// Key visual changes:
// 1. Step indicator: 3 connected dots with teal fill for active step
// 2. Section heading: "Define your new self" — keep this, it's identity language
// 3. Category chips: pill shape, teal border when selected, brand tint fill
// 4. Type chips: same pill treatment as category
// 5. Input field: rounded 16px, background #F5F6F8, teal border when focused

// Step indicator component:
function StepIndicator({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 24 }}>
      {Array.from({ length: totalSteps }).map((_, i) => (
        <React.Fragment key={i}>
          <View style={{
            width: i === currentStep ? 24 : 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: i <= currentStep ? Colors.brand : Colors.border,
          }} />
          {i < totalSteps - 1 && (
            <View style={{ flex: 1, height: 1, backgroundColor: Colors.border }} />
          )}
        </React.Fragment>
      ))}
    </View>
  );
}

// Category chip component:
function CategoryChip({ label, isSelected, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        paddingHorizontal: 16, paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: isSelected ? Colors.brandLight : Colors.background,
        borderWidth: 1.5,
        borderColor: isSelected ? Colors.brand : Colors.border,
      }}
    >
      <Text style={{
        ...Typography.label,
        color: isSelected ? Colors.brand : Colors.textSecondary,
        fontWeight: isSelected ? '700' : '500',
      }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}
```

---

### 7. Screen Background & Section Labels

Apply these to every screen for consistency:

```typescript
// All screens: use this background container
<View style={{ flex: 1, backgroundColor: Colors.background }}>

// Section labels above habit lists:
<Text style={{
  ...Typography.heading,
  color: Colors.textPrimary,
  paddingHorizontal: Spacing.l,
  paddingTop: Spacing.l,
  paddingBottom: Spacing.s,
}}>
  Daily Missions
</Text>

// Subtle section divider:
<View style={{ height: 1, backgroundColor: Colors.borderLight, marginHorizontal: Spacing.l }} />
```

---

## IMPLEMENTATION ORDER

Apply these changes in exactly this order. Do NOT change any logic, store, database, or navigation route names:

1. **Install icons:** `npm install react-native-vector-icons` + link fonts in `android/app/build.gradle`
2. **Replace theme files:** `colors.ts`, `typography.ts`, `spacing.ts`, add `shadows.ts`
3. **Replace `CustomTabBar`** — wire into your existing navigator with `tabBar` prop
4. **Replace `HabitCard`** — keep all existing props, just new visual implementation
5. **Replace `TodayHeader`** — drop in where your current greeting text is
6. **Replace `DateScrollRow`** — keep existing date selection logic, new visual only
7. **Replace `HabitLoggingModal`** — this also fixes the scroll bug. Keep `onLog` callback signature identical.
8. **Restyle `CreateHabitModal`** — apply `StepIndicator` and `CategoryChip` components, keep all `onSubmit` logic
9. **Apply background colour** `#F5F6F8` to all screens globally

---

## WHAT NOT TO CHANGE

- Any function in `src/engine/` or `src/store/` or `src/db/`
- Navigation route names or structure
- The `onLog`, `onPress`, `onClose` callback signatures
- The database schema or queries
- The `logProgress`, `createHabit`, `loadHabits` store actions
- Any business logic whatsoever

Only pixels. Only styles. Make it beautiful.
