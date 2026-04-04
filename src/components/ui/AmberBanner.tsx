import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography } from '../../theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface AmberBannerProps {
  title: string;
  subtitle: string;
  icon?: string;
}

export const AmberBanner = ({ title, subtitle, icon = 'flash' }: AmberBannerProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Icon name={icon} size={20} color="#F5A623" />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF4E0',
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.m,
    marginBottom: Spacing.xs,
    padding: Spacing.l,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F5A62320',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5A62315',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.m,
  },
  content: {
    flex: 1,
  },
  title: {
    ...Typography.body,
    fontWeight: '700',
    color: '#F5A623',
    lineHeight: 20,
  },
  subtitle: {
    ...Typography.caption,
    fontWeight: '500',
    color: '#F5A623',
    opacity: 0.9,
    marginTop: 2,
    lineHeight: 18,
  },
});
