import React, { useMemo, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Animated, Pressable } from 'react-native';
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

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Premium SVG Line Chart with Glow Effect and Vertical Markers
const GlassLineChart = ({ data, color, projectedColor }: { data: any[], color: string, projectedColor: string }) => {
  const chartWidth = SCREEN_WIDTH - Spacing.xl * 2 - Spacing.l * 2;
  const chartHeight = 180;
  
  if (!data.length) return null;

  // Improve max calculation to avoid sharp spikes
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
            <Stop offset="0" stopColor={color} stopOpacity="0.25" />
            <Stop offset="1" stopColor={color} stopOpacity="0" />
          </LinearGradient>
          <LinearGradient id="glow" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity="0.4" />
            <Stop offset="1" stopColor={color} stopOpacity="0" />
          </LinearGradient>
        </Defs>

        {/* Vertical Grid Lines */}
        <G opacity="0.05">
           {[0, 7, 14, 21, 29].map(i => (
             <Line 
               key={i} 
               x1={getX(i)} y1="0" x2={getX(i)} y2={chartHeight} 
               stroke={Colors.textPrimary} strokeWidth="1" 
             />
           ))}
        </G>

        {/* Projected Optimal Path (1% Line) */}
        <Path 
          d={projectedPath} 
          fill="none" 
          stroke={projectedColor} 
          strokeWidth="1.5" 
          strokeDasharray="4, 4" 
          opacity="0.3" 
        />

        {/* Actual Area Fill */}
        <Path d={areaPath} fill="url(#fill)" />

        {/* Outer Glow Stroke (Wide transparent line) */}
        <Path 
          d={actualPath} 
          fill="none" 
          stroke={color} 
          strokeWidth="8" 
          opacity="0.1"
          strokeLinecap="round" 
        />

        {/* Main Data Line */}
        <Path 
          d={actualPath} 
          fill="none" 
          stroke={color} 
          strokeWidth="3.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />

        {/* Current Point Highlighter */}
        {points.length > 0 && (
          <G x={points[points.length - 1].x} y={points[points.length - 1].y}>
            <Circle r="12" fill={color} opacity="0.15" />
            <Circle r="6" fill="#FFF" stroke={color} strokeWidth="2.5" />
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

  const scrollY = useRef(new Animated.Value(0)).current;

  if (!habit) {
    return (
      <Layout>
        <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Habit not found</Text>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.errorButton}>
                <Text style={styles.errorButtonText}>Go Back</Text>
            </TouchableOpacity>
        </View>
      </Layout>
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

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <Layout>
      <Animated.View style={[styles.stickyHeader, { opacity: headerHeight }]}>
         <Text style={styles.stickyTitle}>{habit.name}</Text>
      </Animated.View>

      <View style={styles.topNav}>
         <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
             <Icon name="chevron-left" size={28} color={Colors.textPrimary} />
         </TouchableOpacity>
         <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>{habit.name}</Text>
            <View style={styles.badgeRow}>
               <View style={[styles.categoryBadge, { backgroundColor: Colors.brand + '15' }]}>
                  <Text style={[styles.categoryText, { color: Colors.brandDark }]}>
                    {habit.category || 'Mindset'}
                  </Text>
               </View>
            </View>
         </View>
      </View>

      <Animated.ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
      >
        {/* Section A — Calendar */}
        <HabitCalendar logs={logs} habitId={habitId} />

        {/* Section B — Performance Stats (Refined 2x2 Grid) */}
        <HabitStatsCards {...stats} />

        {/* Section C — Growth Visualizer */}
        <View style={styles.premiumCard}>
            <View style={styles.cardHeader}>
               <Icon name="chart-bell-curve-cumulative" size={20} color={Colors.brand} />
               <Text style={styles.cardTitle}>Compound Growth</Text>
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
                    <View style={[styles.legendDot, { backgroundColor: Colors.textTertiary, opacity: 0.5 }]} />
                    <Text style={styles.legendText}>1% Optimal Path</Text>
                </View>
            </View>
        </View>

        {/* Section D — Identity Quotes */}
        <View style={styles.quoteCard}>
            <Icon name="format-quote-open" size={40} color={Colors.brand + '15'} style={styles.quoteIcon} />
            <Text style={styles.quoteIdentityLabel}>Identity Statement</Text>
            <Text style={styles.quoteText}>
                "{habit.identity_statement || 'I am someone who prioritizes this habit every day.'}"
            </Text>
            
            {habit.anchor_habit && (
              <View style={styles.anchorBox}>
                <Text style={styles.anchorLabel}>Anchor Prompt</Text>
                <Text style={styles.anchorValue}>"After I {habit.anchor_habit}, I will..."</Text>
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
    height: 60,
    backgroundColor: Colors.surface,
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    ...Shadows.soft,
  },
  stickyTitle: {
    ...Typography.heading,
    fontSize: 18,
  },
  topNav: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.m,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  headerInfo: {
    flex: 1,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.m,
    ...Shadows.soft,
  },
  headerTitle: {
    ...Typography.heading,
    fontSize: 26,
    color: Colors.textPrimary,
    lineHeight: 32,
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  categoryText: {
    ...Typography.micro,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.m,
    paddingBottom: 100,
  },
  premiumCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.l,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.card,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.s,
    marginBottom: Spacing.l,
  },
  cardTitle: {
    ...Typography.heading,
    fontSize: 18,
    color: Colors.textPrimary,
  },
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.m,
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
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontSize: 11,
  },
  quoteCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    position: 'relative',
    overflow: 'hidden',
    ...Shadows.card,
  },
  quoteIcon: {
    position: 'absolute',
    top: -10,
    left: 10,
  },
  quoteIdentityLabel: {
    ...Typography.micro,
    color: Colors.textTertiary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  quoteText: {
    ...Typography.body,
    fontSize: 18,
    fontStyle: 'italic',
    color: Colors.textPrimary,
    lineHeight: 26,
    fontWeight: '600',
  },
  anchorBox: {
    marginTop: Spacing.l,
    paddingTop: Spacing.l,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  anchorLabel: {
    ...Typography.micro,
    color: Colors.textTertiary,
    fontSize: 10,
    textTransform: 'uppercase',
  },
  anchorValue: {
    ...Typography.body,
    fontWeight: '500',
    color: Colors.brandDark,
    marginTop: 4,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  errorText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.l,
  },
  errorButton: {
    backgroundColor: Colors.brand,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.m,
    borderRadius: BorderRadius.full,
  },
  errorButtonText: {
    color: '#FFF',
    fontWeight: '700',
  },
});
