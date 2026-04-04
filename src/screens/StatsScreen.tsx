import React, { useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions,
  Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Typography, Spacing, Shadows, BorderRadius } from '../theme';
import { useHabitStore } from '../store/habitStore';
import { DailyLog } from '../models/DailyLog';

const { width } = Dimensions.get('window');

export function StatsScreen() {
  const insets = useSafeAreaInsets();
  const { habits, logs } = useHabitStore();

  const stats = useMemo(() => {
    const activeHabitsCount = habits.filter(h => h.status === 'active').length;
    const totalLogsCount = logs.length;
    const completedLogsCount = logs.filter((l: DailyLog) => l.is_completed).length;
    
    const consistency = totalLogsCount > 0 
      ? Math.round((completedLogsCount / totalLogsCount) * 100) 
      : 0;

    const totalImpact = Math.round(activeHabitsCount * 1.01 ** (totalLogsCount / activeHabitsCount || 0) * 10) / 10 || 0;

    return {
      activeHabitsCount,
      totalLogsCount,
      completedLogsCount,
      consistency,
      totalImpact: isFinite(totalImpact) ? totalImpact : 0
    };
  }, [habits, logs]);

  const StatItem = ({ label, value, icon, color, subtitle }: any) => (
    <View style={styles.statCard}>
      <View style={[styles.statIconBox, { backgroundColor: color + '10' }]}>
        <Icon name={icon} size={22} color={color} />
      </View>
      <View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
        {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Your 1% Vision</Text>
            <Text style={styles.dateText}>COMPUTING COMPOUND IMPACT</Text>
          </View>
          <TouchableOpacity style={styles.profileBtn}>
            <View style={styles.profileGradientFallback}>
              <Icon name="crown-outline" size={20} color={Colors.surface} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.impactCard}>
          <View style={styles.impactHeader}>
            <View style={styles.pulseBox}>
               <Icon name="lightning-bolt" size={24} color={Colors.brand} />
               <View style={styles.pulseRing} />
            </View>
            <View style={styles.impactTitleGroup}>
              <Text style={styles.impactTitle}>Global Trajectory</Text>
              <Text style={styles.impactSubtitle}>Calculated from {stats.totalLogsCount} logs</Text>
            </View>
            <View style={styles.impactBadge}>
              <Text style={styles.impactBadgeText}>PREMIUM VIEW</Text>
            </View>
          </View>

          <View style={styles.impactMain}>
             <View style={styles.impactMetric}>
                <Text style={styles.impactValue}>{stats.consistency}%</Text>
                <Text style={styles.impactLabel}>Consistency</Text>
             </View>
             <View style={styles.impactDivider} />
             <View style={styles.impactMetric}>
                <Text style={[styles.impactValue, { color: Colors.brand }]}>+ {stats.totalImpact}%</Text>
                <Text style={styles.impactLabel}>Growth Velocity</Text>
             </View>
          </View>
          
          <View style={styles.trajectoryFooter}>
            <Icon name="trending-up" size={14} color={Colors.brand} />
            <Text style={styles.trajectoryText}>You are currently outperforming 82% of peers.</Text>
          </View>
        </View>

        <View style={styles.grid}>
          <StatItem 
            label="Total Logs" 
            value={stats.completedLogsCount} 
            icon="checkbox-marked-circle-outline" 
            color="#6366F1"
            subtitle="Sessions completed"
          />
          <StatItem 
            label="Active Habits" 
            value={stats.activeHabitsCount} 
            icon="lightning-bolt-outline" 
            color="#F59E0B"
            subtitle="Disciplines tracked"
          />
          <StatItem 
            label="Current Win" 
            value="3d" 
            icon="fire" 
            color="#EF4444"
            subtitle="Streak (Global)"
          />
          <StatItem 
            label="Next Level" 
            value="Lv. 4" 
            icon="certificate-outline" 
            color="#10B981"
            subtitle="Consistency tier"
          />
        </View>

        <View style={styles.visionCard}>
           <View style={styles.visionGradientFallback}>
             <View style={styles.visionHeader}>
                <View style={styles.visionIconBox}>
                   <Icon name="star-face" size={24} color={Colors.brand} />
                </View>
                <Text style={styles.visionTitle}>Compound Identity</Text>
             </View>
             <Text style={styles.visionDescription}>
               "Every small win is a vote for the person you wish to become. By choosing 1% daily, you are mastering the art of identity formation."
             </Text>
             <View style={styles.visionFooter}>
                <View style={styles.avatarStack}>
                   <View style={[styles.avatar, { backgroundColor: '#FCD34D' }]} />
                   <View style={[styles.avatar, { backgroundColor: '#F87171', marginLeft: -8 }]} />
                   <View style={[styles.avatar, { backgroundColor: '#60A5FA', marginLeft: -8 }]} />
                </View>
                <Text style={styles.communityText}>Joined by 12,402 other disciplinarians</Text>
             </View>
           </View>
        </View>

        <View style={styles.breakdownContainer}>
           <Text style={styles.sectionTitle}>Breakdown coming soon</Text>
           <View style={styles.placeholderRow}>
              <View style={[styles.placeholderBar, { width: '60%' }]} />
              <View style={[styles.placeholderBar, { width: '40%' }]} />
              <View style={[styles.placeholderBar, { width: '80%' }]} />
           </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.l,
    gap: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.s,
  },
  greeting: {
    ...Typography.heading,
    fontSize: 28,
    color: Colors.textPrimary,
    fontWeight: '900',
  },
  dateText: {
    ...Typography.micro,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginTop: 4,
    fontWeight: '800',
  },
  profileBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    ...Shadows.brand,
  },
  profileGradientFallback: {
    flex: 1,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.brand,
  },
  impactCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xxl,
    padding: Spacing.xl,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    ...Shadows.soft,
  },
  impactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.m,
  },
  pulseBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.brand + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 1.5,
    borderColor: Colors.brand + '20',
  },
  impactTitleGroup: {
    flex: 1,
    gap: 2,
  },
  impactTitle: {
    ...Typography.title,
    fontSize: 18,
    color: Colors.textPrimary,
    fontWeight: '800',
  },
  impactSubtitle: {
    ...Typography.micro,
    color: Colors.textTertiary,
    fontSize: 11,
  },
  impactBadge: {
    backgroundColor: Colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  impactBadgeText: {
     ...Typography.micro,
     fontSize: 9,
     color: Colors.textSecondary,
     fontWeight: '800',
  },
  impactMain: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: Spacing.xl,
    marginBottom: Spacing.l,
    paddingVertical: Spacing.m,
  },
  impactMetric: {
    alignItems: 'center',
    gap: 4,
  },
  impactValue: {
    ...Typography.heading,
    fontSize: 32,
    color: Colors.textPrimary,
    fontWeight: '900',
    letterSpacing: -1,
  },
  impactLabel: {
    ...Typography.micro,
    color: Colors.textTertiary,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  impactDivider: {
    width: 1.5,
    height: 40,
    backgroundColor: Colors.borderLight,
  },
  trajectoryFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: Spacing.m,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  trajectoryText: {
    ...Typography.micro,
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.m,
  },
  statCard: {
    width: (width - Spacing.xl * 2 - Spacing.m) / 2,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.xl,
    padding: Spacing.l,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: 12,
  },
  statIconBox: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.m,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    ...Typography.title,
    fontSize: 22,
    color: Colors.textPrimary,
    fontWeight: '900',
  },
  statLabel: {
    ...Typography.micro,
    color: Colors.textSecondary,
    fontWeight: '700',
    fontSize: 12,
  },
  statSubtitle: {
    ...Typography.micro,
    color: Colors.textTertiary,
    fontSize: 10,
    marginTop: 2,
  },
  visionCard: {
    borderRadius: BorderRadius.xxl,
    overflow: 'hidden',
    backgroundColor: Colors.brand,
    ...Shadows.brand,
  },
  visionGradientFallback: {
    padding: Spacing.xl,
    gap: Spacing.l,
  },
  visionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.m,
  },
  visionIconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  visionTitle: {
    ...Typography.title,
    color: Colors.surface,
    fontWeight: '900',
  },
  visionDescription: {
    ...Typography.body,
    color: Colors.surface + 'EE',
    fontSize: 15,
    lineHeight: 24,
    fontStyle: 'italic',
    fontWeight: '500',
  },
  visionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: Spacing.s,
    paddingTop: Spacing.m,
    borderTopWidth: 1,
    borderTopColor: Colors.surface + '30',
  },
  avatarStack: {
    flexDirection: 'row',
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.brand,
  },
  communityText: {
    ...Typography.micro,
    color: Colors.surface + '99',
    fontSize: 11,
    fontWeight: '700',
  },
  breakdownContainer: {
     gap: Spacing.m,
     opacity: 0.5,
  },
  sectionTitle: {
    ...Typography.micro,
    color: Colors.textSecondary,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  placeholderRow: {
     gap: 12,
  },
  placeholderBar: {
     height: 12,
     borderRadius: 6,
     backgroundColor: Colors.border,
  }
});
