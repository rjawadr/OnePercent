import React, { useMemo, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Animated, StatusBar } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Layout } from '../components/ui/Layout';
import { useHabitStore } from '../store/habitStore';
import { HabitCalendar } from '../components/habits/HabitCalendar';
import { HabitStatsCards } from '../components/habits/HabitStatsCards';
import { ProjectionCard } from '../components/habits/ProjectionCard';
import { Colors, Typography, Spacing, Shadows, BorderRadius } from '../theme';
import { format, differenceInDays, parseISO, isSameMonth } from 'date-fns';
import Svg, { Path, Circle, Defs, LinearGradient, Stop, G, Line } from 'react-native-svg';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Premium SVG LineChart with Glow Effect
const GlassLineChart = ({ data, color, projectedColor }: { data: any[], color: string, projectedColor: string }) => {
  const chartWidth = SCREEN_WIDTH - Spacing.xl * 2 - Spacing.l * 2;
  const chartHeight = 180;
  
  if (!data.length) return null;

  const actualValues = data.map(d => d.actual);
  const maxActual = Math.max(...actualValues, 1);
  const maxProjected = Math.max(...data.map(d => d.projected), 1);
  const maxVal = Math.max(maxActual, maxProjected) * 1.1; 
  const minVal = 0;
  
  const getX = (index: number) => (index / (data.length - 1)) * chartWidth;
  const getY = (val: number) => chartHeight - ((val - minVal) / (maxVal - minVal)) * chartHeight;

  const points = data.map((d, i) => ({ x: getX(i), y: getY(d.actual) }));
  const projectedPoints = data.map((d, i) => ({ x: getX(i), y: getY(d.projected) }));

  const getPath = (pts: {x: number, y: number}[]) => {
    if (pts.length < 2) return '';
    let d = `M ${pts[0].x},${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i+1];
      const cp1x = p0.x + (p1.x - p0.x) / 2;
      d += ` C ${cp1x},${p0.y} ${cp1x},${p1.y} ${p1.x},${p1.y}`;
    }
    return d;
  };

  const actualPath = getPath(points);
  const projectedPath = getPath(projectedPoints);
  const areaPath = `${actualPath} L ${chartWidth},${chartHeight} L 0,${chartHeight} Z`;

  return (
    <View style={styles.chartWrapper}>
      <Svg width={chartWidth} height={chartHeight}>
        <Defs>
          <LinearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity="0.2" />
            <Stop offset="1" stopColor={color} stopOpacity="0" />
          </LinearGradient>
        </Defs>

        <G opacity="0.05">
           {[0, 7, 14, 21, 29].map(i => (
             <Line 
               key={i} 
               x1={getX(i)} y1="0" x2={getX(i)} y2={chartHeight} 
               stroke={Colors.textPrimary} strokeWidth="1" 
             />
           ))}
        </G>

        <Path 
          d={projectedPath} 
          fill="none" 
          stroke={projectedColor} 
          strokeWidth="1.5" 
          strokeDasharray="4, 4" 
          opacity="0.25" 
        />

        <Path d={areaPath} fill="url(#fill)" />

        <Path 
          d={actualPath} 
          fill="none" 
          stroke={color} 
          strokeWidth="4" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />

        {points.length > 0 && (
          <G x={points[points.length - 1].x} y={points[points.length - 1].y}>
            <Circle r="12" fill={color} opacity="0.1" />
            <Circle r="6" fill="#FFF" stroke={color} strokeWidth="3" />
          </G>
        )}
      </Svg>
    </View>
  );
};

export const HabitDetailScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { habitId } = route.params;
  const { habits, logs } = useHabitStore();

  const habit = useMemo(() => habits.find(h => h.id === habitId), [habits, habitId]);
  
  const habitLogs = useMemo(() => 
    logs.filter(l => l.habit_id === habitId).sort((a, b) => a.date.localeCompare(b.date)), 
  [logs, habitId]);

  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;

  if (!habit) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Habit not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.errorButton}>
           <Text style={styles.errorButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const stats = useMemo(() => {
    const today = new Date();
    const logsThisMonth = habitLogs.filter(l => 
      isSameMonth(parseISO(l.date), today) && l.is_completed
    ).length;

    const startDate = habit.start_date ? parseISO(habit.start_date) : (habit.created_at ? parseISO(habit.created_at) : today);
    const totalDaysSinceStart = Math.max(1, differenceInDays(today, startDate) + 1);
    const completedLogsCount = habitLogs.filter(l => l.is_completed).length;

    return {
      currentStreak: habit.streak || 0,
      bestStreak: habit.streak || 0, 
      successThisMonth: logsThisMonth,
      totalDaysThisMonth: today.getDate(), 
      overallRate: Math.round((completedLogsCount / totalDaysSinceStart) * 100),
      totalDaysSinceStart
    };
  }, [habit, habitLogs]);

  const chartData = useMemo(() => {
    const data = [];
    const baseline = habit.baseline_value || 1;
    
    for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dStr = format(date, 'yyyy-MM-dd');
        const log = habitLogs.find(l => l.date === dStr);
        
        const dayProgress = 30 - i;
        data.push({ 
            day: dayProgress, 
            actual: log && log.is_completed ? log.value_achieved : 0, 
            projected: baseline * Math.pow(1.01, dayProgress)
        });
    }
    return data;
  }, [habit, habitLogs]);

  // Fade in only after the main large header is mostly scrolled away
  const headerOpacity = scrollY.interpolate({
    inputRange: [120, 160],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <Layout style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" />
      
      {/* Sticky Compact Header - Positioned relative to absolute top of screen */}
      <Animated.View style={[
        styles.stickyHeader, 
        { 
          opacity: headerOpacity,
          paddingTop: insets.top,
          height: 64 + insets.top
        }
      ]}>
         <TouchableOpacity 
           onPress={() => navigation.goBack()} 
           style={styles.stickyBackButton}
         >
           <Icon name="arrow-left" size={20} color={Colors.textPrimary} />
         </TouchableOpacity>
         <Text style={styles.stickyTitle} numberOfLines={1}>{habit.name}</Text>
         <View style={{ width: 40 }} /> 
      </Animated.View>

      <Animated.ScrollView 
        contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: !StatusBar.currentHeight ? 0 : Spacing.m }
        ]} 
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
        bounces={false}
        overScrollMode="never"
      >
        {/* Large Aesthetic Header */}
        <View style={styles.topNav}>
           <TouchableOpacity 
             onPress={() => navigation.goBack()} 
             style={styles.backButton}
             activeOpacity={0.7}
           >
               <Icon name="arrow-left" size={24} color={Colors.textPrimary} />
           </TouchableOpacity>
           <View style={styles.headerInfo}>
              <Text style={styles.headerTitle} numberOfLines={1}>{habit.name}</Text>
              <View style={styles.badgeWrapper}>
                  <View style={[styles.categoryChip, { backgroundColor: Colors.brand + '15' }]}>
                      <Icon name="tag-outline" size={10} color={Colors.brandDark} />
                      <Text style={[styles.categoryLabel, { color: Colors.brandDark }]}>
                          {habit.category || 'Focus'}
                      </Text>
                  </View>
              </View>
           </View>
        </View>

        <HabitCalendar logs={logs} habitId={habitId} />

        <HabitStatsCards {...stats} />

        <View style={styles.chartCard}>
            <View style={styles.sectionHeader}>
               <View style={styles.titleGroup}>
                  <Icon name="chart-bell-curve" size={20} color={Colors.textTertiary} />
                  <Text style={styles.sectionTitle}>Compound Trajectory</Text>
               </View>
            </View>
            
            <GlassLineChart 
              data={chartData} 
              color={Colors.brand} 
              projectedColor={Colors.textTertiary} 
            />
            
            <View style={styles.chartLegend}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: Colors.brand }]} />
                    <Text style={styles.legendText}>Actual Progress</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: Colors.textTertiary, opacity: 0.4 }]} />
                    <Text style={styles.legendText}>1% Optimal Path</Text>
                </View>
            </View>
        </View>

        <View style={styles.mantraCard}>
            <Icon name="format-quote-open" size={48} color={Colors.brand + '10'} style={styles.quoteIcon} />
            <Text style={styles.mantraLabel}>Identity Statement</Text>
            <Text style={styles.mantraText}>
                "{habit.identity_statement || 'I am crafting a better version of myself through daily discipline.'}"
            </Text>
            
            {habit.anchor_habit && (
              <View style={styles.anchorContainer}>
                <View style={[styles.anchorIconBox, { backgroundColor: Colors.brand + '10' }]}>
                    <Icon name="anchor" size={16} color={Colors.brandDark} />
                </View>
                <View style={styles.anchorInfo}>
                    <Text style={styles.anchorHeader}>Behavior Anchor</Text>
                    <Text style={styles.anchorContent}>"After I {habit.anchor_habit}..."</Text>
                </View>
              </View>
            )}
        </View>

        <ProjectionCard 
          baseline={habit.baseline_value} 
          unit={habit.unit} 
          frequency={habit.improvement_frequency as any} 
        />
      </Animated.ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    zIndex: 1000, // Ensure it stays on top of everything
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    ...Shadows.elevated,
    flexDirection: 'row',
    paddingHorizontal: Spacing.m,
  },
  stickyBackButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stickyTitle: {
    ...Typography.heading,
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  topNav: {
    paddingVertical: Spacing.l,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    marginBottom: Spacing.m,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.m,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.soft,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    ...Typography.heading,
    fontSize: 28,
    fontWeight: '900',
    color: Colors.textPrimary,
    lineHeight: 34,
  },
  badgeWrapper: {
    flexDirection: 'row',
    marginTop: 6,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  categoryLabel: {
    ...Typography.micro,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.m,
    paddingBottom: 120,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.l,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    ...Typography.heading,
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  chartCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.card,
  },
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.m,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.l,
    gap: Spacing.xl,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    ...Typography.micro,
    color: Colors.textSecondary,
    fontWeight: '700',
    fontSize: 11,
  },
  mantraCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.card,
  },
  quoteIcon: {
    position: 'absolute',
    top: 5,
    left: 5,
  },
  mantraLabel: {
    ...Typography.micro,
    color: Colors.brandDark,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 12,
  },
  mantraText: {
    ...Typography.body,
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    fontStyle: 'italic',
    lineHeight: 30,
  },
  anchorContainer: {
    marginTop: Spacing.xl,
    paddingTop: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  anchorIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  anchorInfo: {
    flex: 1,
    gap: 2,
  },
  anchorHeader: {
    ...Typography.micro,
    color: Colors.textTertiary,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  anchorContent: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.brandDark,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  errorText: {
    ...Typography.heading,
    color: Colors.textSecondary,
    marginBottom: Spacing.l,
  },
  errorButton: {
    backgroundColor: Colors.brand,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: BorderRadius.full,
  },
  errorButtonText: {
    ...Typography.label,
    color: '#FFF',
    fontWeight: '800',
  },
});
