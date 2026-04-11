import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Alert, 
  Animated, 
  Dimensions,
  Pressable,
  Modal
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { BlurView } from '@react-native-community/blur';
import { useShallow } from 'zustand/react/shallow';
import { Layout } from '../components/ui/Layout';
import { useHabitStore } from '../store/habitStore';
import { Colors, Typography, Spacing, Shadows, BorderRadius } from '../theme';
import { Habit } from '../models/Habit';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Swipeable } from 'react-native-gesture-handler';
import { CreateHabitModal } from '../components/habits/CreateHabitModal';

// Map category strings to professional, high-contrast palette
const CATEGORY_COLORS: Record<string, string> = {
  personal: Colors.brandDark,
  physical: '#2563EB', // Vibrant Blue (Physical Energy)
  zen:      '#7C3AED', // Deep Purple (Mindfulness)
  work:     '#4F46E5', // Indigo (Professional)
  focus:    Colors.brandDark,
};


const { width } = Dimensions.get('window');

export const HabitManagerScreen = () => {
  const [viewMode, setViewMode] = useState<'active' | 'archived'>('active');
  const slideAnim = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();
  
  // Conditionally handle tab bar height (may throw if not in tab nav)
  let tabBarHeight = 0;
  try {
    tabBarHeight = useBottomTabBarHeight();
  } catch (e) {
    // Not in a tab navigator
  }
  
  const habits = useHabitStore(
    useShallow((state) => state.habits.filter(h => 
      viewMode === 'active' ? h.status !== 'archived' : h.status === 'archived'
    ))
  );
  
  const archiveHabit = useHabitStore((state) => state.archiveHabit);
  const updateHabit = useHabitStore((state) => state.updateHabit);
  const deleteHabit = useHabitStore((state) => state.deleteHabit);
  
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'archive' | 'delete' | 'restore';
    habit: Habit;
  } | null>(null);
  const [showToast, setShowToast] = useState(false);
  const confirmAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (confirmAction) {
      setShowToast(true);
      Animated.spring(confirmAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 60,
        friction: 10,
      }).start();
    }
  }, [confirmAction]);

  const dismissToast = () => {
    Animated.spring(confirmAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 60,
      friction: 12,
    }).start(() => {
      setShowToast(false);
      setConfirmAction(null);
    });
  };

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: viewMode === 'active' ? 0 : 1,
      useNativeDriver: false,
      friction: 9,
      tension: 60,
    }).start();
  }, [viewMode]);

  const handleToggleArchive = (habit: Habit) => {
    const isArchived = habit.status === 'archived';
    setConfirmAction({
      type: isArchived ? 'restore' : 'archive',
      habit
    });
  };

  const handleDelete = (habit: Habit) => {
    setConfirmAction({
      type: 'delete',
      habit
    });
  };

  const runConfirmAction = () => {
    if (!confirmAction) return;
    const { type, habit } = confirmAction;
    
    if (type === 'delete') {
      deleteHabit(habit.id);
    } else {
      archiveHabit(habit.id, type === 'archive');
    }
    dismissToast();
  };

  const renderRightActions = (habit: Habit, progress: Animated.AnimatedInterpolation<number>) => {
    const isArchived = habit.status === 'archived';
    
    const trans = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [120, 0],
    });

    return (
      <Animated.View style={[styles.actionRow, { transform: [{ translateX: trans }] }]}>
        {isArchived ? (
          <>
            <TouchableOpacity 
              style={[styles.archiveAction, { backgroundColor: '#10B981' }]} 
              onPress={() => handleToggleArchive(habit)}
            >
              <Icon name="history" size={24} color="#FFFFFF" />
              <Text style={styles.archiveText}>Restore</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.archiveAction, { backgroundColor: Colors.error }]} 
              onPress={() => handleDelete(habit)}
            >
              <Icon name="trash-can-outline" size={24} color="#FFFFFF" />
              <Text style={styles.archiveText}>Delete</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity 
            style={[styles.archiveAction, { backgroundColor: Colors.textSecondary }]} 
            onPress={() => handleToggleArchive(habit)}
          >
            <Icon name="archive-outline" size={24} color="#FFFFFF" />
            <Text style={styles.archiveText}>Archive</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    );
  };

  const renderItem = ({ item }: { item: Habit }) => (
    <Swipeable 
      renderRightActions={(progress) => renderRightActions(item, progress)}
      friction={2}
      rightThreshold={40}
      containerStyle={styles.swipeableContainer}
    >
      <Pressable 
        style={({ pressed }) => [
          styles.habitRow,
          pressed && { transform: [{ scale: 0.985 }], opacity: 0.9 }
        ]}
        onPress={() => setEditingHabit(item)}
      >
        <View style={styles.rowMain}>
          <View style={[styles.iconContainer, { backgroundColor: (item.color || Colors.brand) + '12' }]}>
            <View style={[styles.iconOverlay, { borderColor: (item.color || Colors.brand) + '25' }]} />
            <Icon name={item.icon || 'sparkles'} size={28} color={item.color || Colors.brand} />
          </View>
          
          <View style={styles.habitInfo}>
            <Text style={styles.habitName} numberOfLines={1}>{item.name}</Text>
            <View style={styles.metaContainer}>
              <View style={[
                styles.categoryBadge, 
                { backgroundColor: (CATEGORY_COLORS[item.category?.toLowerCase() || 'focus'] || item.color || Colors.brand) + '15' }
              ]}>
                <Text style={[
                  styles.categoryText, 
                  { color: CATEGORY_COLORS[item.category?.toLowerCase() || 'focus'] || item.color || Colors.brandDark }
                ]}>
                  {item.category || 'Focus'}
                </Text>
              </View>
              <View style={styles.metaDivider} />
              <Text style={styles.metricText}>
                {item.current_target}{item.unit} TARGET
              </Text>
            </View>
          </View>

          <View style={styles.rowRight}>
             <View style={styles.streakSmall}>
                <Icon name="fire" size={12} color={Colors.amber} />
                <Text style={styles.streakSmallText}>{item.streak || 0}</Text>
             </View>
             <Icon name="chevron-right" size={20} color={Colors.textTertiary} />
          </View>
        </View>
      </Pressable>
    </Swipeable>
  );

  const translateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [4, (width - Spacing.xl * 2 - 8) / 2 + 4],
  });

  return (
    <Layout style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleGroup}>
          <Text style={styles.title}>Manage Habits</Text>
          <Text style={styles.subtitle}>Architecture for 1% daily growth</Text>
        </View>
        <View style={styles.statusBadge}>
          <View style={styles.statusPulse} />
          <Text style={styles.statusCount}>{habits.length}</Text>
          <Text style={styles.statusLabel}>{viewMode === 'active' ? 'Active' : 'Archived'}</Text>
        </View>
      </View>

      <View style={styles.segmentedControl}>
        <Animated.View style={[styles.activeIndicator, { transform: [{ translateX }] }]} />
        <TouchableOpacity 
          style={styles.segmentBtn}
          onPress={() => setViewMode('active')}
          activeOpacity={1}
        >
          <Text style={[styles.segmentText, viewMode === 'active' && styles.segmentTextActive]}>Active</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.segmentBtn}
          onPress={() => setViewMode('archived')}
          activeOpacity={1}
        >
          <Text style={[styles.segmentText, viewMode === 'archived' && styles.segmentTextActive]}>Archived</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={habits}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
               <View style={styles.emptyRing} />
               <Icon 
                name={viewMode === 'active' ? "creation" : "archive-off-outline"} 
                size={42} 
                color={Colors.brand} 
              />
            </View>
            <Text style={styles.emptyTitle}>
              {viewMode === 'active' ? 'No Active Disciplines' : 'Archive is Empty'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {viewMode === 'active' 
                ? 'Your journey to mastery begins with your first consistent choice.' 
                : 'Habits you temporarily pause will be preserved here.'}
            </Text>
          </View>
        }
      />

      <CreateHabitModal 
        isVisible={!!editingHabit}
        onClose={() => setEditingHabit(null)}
        initialHabit={editingHabit || undefined}
        onUpdate={(id, updates) => updateHabit(id, updates)}
      />

      <Modal
        visible={showToast}
        transparent
        animationType="none"
        onRequestClose={dismissToast}
      >
        {confirmAction && (
          <View style={styles.modalOverlay}>
            <Pressable style={StyleSheet.absoluteFill} onPress={dismissToast} />
            <Animated.View 
              style={[
                styles.toastContainer,
                {
                  bottom: 64 + Math.max(insets.bottom, 12) + 16,
                  opacity: confirmAnim,
                  transform: [{
                    translateY: confirmAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [100, 0]
                    })
                  }]
                }
              ]}
            >
              <BlurView 
                style={styles.toastBlur} 
                blurType="light" 
                blurAmount={15} 
                overlayColor="rgba(255, 255, 255, 0.7)"
              />
              <View style={styles.toastContent}>
                <View style={styles.toastHeader}>
                  <View style={[
                    styles.toastIcon, 
                    { backgroundColor: confirmAction.type === 'delete' ? Colors.amberLight : Colors.brandLight }
                  ]}>
                    <Icon 
                      name={confirmAction.type === 'delete' ? 'trash-can-outline' : 'archive-outline'} 
                      size={20} 
                      color={confirmAction.type === 'delete' ? Colors.amber : Colors.brand} 
                    />
                  </View>
                  <View style={styles.toastTextContainer}>
                    <Text style={styles.toastTitle} numberOfLines={1}>
                      {confirmAction.type === 'delete' ? `Delete "${confirmAction.habit.name}"?` : 
                       confirmAction.type === 'archive' ? 'Archive this habit?' : 'Restore habit?'}
                    </Text>
                    <Text style={styles.toastSubtitle} numberOfLines={1}>
                      {confirmAction.type === 'delete' ? 'This will erase all progress.' : 
                       confirmAction.type === 'archive' ? `Hide "${confirmAction.habit.name}" from daily view.` : 
                       `Move "${confirmAction.habit.name}" back to tracking.`}
                    </Text>
                  </View>
                </View>

                <View style={styles.toastActions}>
                  <TouchableOpacity 
                    style={styles.toastCancelBtn} 
                    onPress={dismissToast}
                  >
                    <Text style={styles.toastCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[
                      styles.toastConfirmBtn,
                      { backgroundColor: confirmAction.type === 'delete' ? Colors.amber : Colors.brand }
                    ]} 
                    onPress={runConfirmAction}
                  >
                    <Text style={styles.toastConfirmText}>
                      {confirmAction.type === 'delete' ? 'Delete' : 'Archive'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          </View>
        )}
      </Modal>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.l,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    marginTop: Spacing.m,
  },
  titleGroup: {
    gap: 4,
  },
  title: {
    ...Typography.heading,
    fontSize: 28,
    color: Colors.textPrimary,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textTertiary,
    fontSize: 13,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.surface,
    paddingLeft: 12,
    paddingRight: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    ...Shadows.soft,
  },
  statusPulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.brand,
    opacity: 0.8,
  },
  statusCount: {
    ...Typography.heading,
    fontSize: 18,
    color: Colors.textPrimary,
    fontWeight: '800',
  },
  statusLabel: {
    ...Typography.micro,
    fontSize: 9,
    color: Colors.textSecondary,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    padding: 4,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.xl,
    position: 'relative',
    height: 48,
  },
  activeIndicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    width: (width - Spacing.xl * 2 - 8) / 2,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.l,
    ...Shadows.soft,
  },
  segmentBtn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  segmentText: {
    ...Typography.body,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textTertiary,
  },
  segmentTextActive: {
    color: Colors.textPrimary,
  },
  listContent: {
    paddingBottom: 100,
  },
  swipeableContainer: {
    marginBottom: Spacing.m,
  },
  habitRow: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xxl,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    ...Shadows.soft,
    overflow: 'hidden',
  },
  rowMain: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.m,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.m,
    position: 'relative',
  },
  iconOverlay: {
    position: 'absolute',
    inset: 4,
    borderRadius: BorderRadius.l,
    borderWidth: 1.5,
  },
  iconEmoji: {
    fontSize: 28,
  },
  habitInfo: {
    flex: 1,
    gap: 4,
  },
  habitName: {
    ...Typography.heading,
    fontSize: 17,
    color: Colors.textPrimary,
    fontWeight: '800',
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  categoryText: {
    ...Typography.micro,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metaDivider: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.border,
    marginHorizontal: 8,
  },
  metricText: {
    ...Typography.micro,
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  rowRight: {
     alignItems: 'flex-end',
     gap: 6,
  },
  streakSmall: {
     flexDirection: 'row',
     alignItems: 'center',
     gap: 3,
     backgroundColor: Colors.amberLight + '30',
     paddingHorizontal: 6,
     paddingVertical: 2,
     borderRadius: 6,
  },
  streakSmallText: {
     ...Typography.micro,
     fontSize: 10,
     fontWeight: '900',
     color: Colors.amber,
  },
  actionRow: {
    flexDirection: 'row',
    marginLeft: 8,
  },
  archiveAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderRadius: BorderRadius.xl,
    marginLeft: 8,
    gap: 4,
  },
  archiveText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyIconCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: Colors.brandLight + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  emptyRing: {
     position: 'absolute',
     inset: -10,
     borderRadius: 70,
     borderWidth: 1.5,
     borderColor: Colors.brandLight + '10',
  },
  emptyTitle: {
    ...Typography.heading,
    fontSize: 22,
    color: Colors.textPrimary,
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: '900',
  },
  emptySubtitle: {
    ...Typography.body,
    color: Colors.textTertiary,
    textAlign: 'center',
    lineHeight: 22,
    fontSize: 15,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    justifyContent: 'flex-end',
  },
  toastContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    height: 84,
    borderRadius: 24,
    overflow: 'hidden',
    ...Shadows.elevated,
    elevation: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 9999,
  },
  toastBlur: {
    ...StyleSheet.absoluteFillObject,
  },
  toastContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  toastHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  toastIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  toastTextContainer: {
    flex: 1,
  },
  toastTitle: {
    ...Typography.heading,
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight: '800',
  },
  toastSubtitle: {
    ...Typography.body,
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  toastActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toastCancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  toastCancelText: {
    ...Typography.body,
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textSecondary,
  },
  toastConfirmBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    ...Shadows.soft,
  },
  toastConfirmText: {
    ...Typography.body,
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
