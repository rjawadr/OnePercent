import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Shadows } from '../../theme';

export const CustomTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom || Spacing.m }]}>
      <View style={styles.content}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          let iconName = 'home-variant';
          let label = route.name;

          if (route.name === 'Today') {
            iconName = 'calendar-check';
          } else if (route.name === 'Stats') {
            iconName = 'chart-timeline-variant';
            label = 'Progress';
          } else if (route.name === 'Therapy') {
            iconName = 'leaf';
          } else if (route.name === 'Physical') {
            iconName = 'arm-flex';
          } else if (route.name === 'Social') {
            iconName = 'account-group';
          } else if (route.name === 'Settings') {
            iconName = 'cog';
          }

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={styles.tabItem}
              activeOpacity={0.7}
            >
              <View style={[
                styles.iconContainer,
                isFocused && styles.iconContainerActive
              ]}>
                <Icon
                  name={iconName}
                  size={24}
                  color={isFocused ? Colors.brand : Colors.textTertiary}
                />
              </View>
              <Text style={[
                styles.label,
                isFocused && styles.labelActive
              ]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    elevation: 0,
  },
  content: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.s,
    borderRadius: 32,
    height: 72,
    alignItems: 'center',
    justifyContent: 'space-around',
    ...Shadows.elevated,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  iconContainerActive: {
    backgroundColor: Colors.brandLight,
  },
  label: {
    ...Typography.micro,
    color: Colors.textTertiary,
    fontSize: 10,
    fontWeight: '600',
  },
  labelActive: {
    color: Colors.brand,
    fontWeight: '800',
  },
});
