import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { Colors, Typography, Spacing } from '../../theme';

export const SessionProjectionHint = () => {
  return (
    <View style={styles.container}>
      <Icon name="trending-up" size={18} color={Colors.brand} />
      <Text style={styles.text}>
        1% compounding only happens if you save this session. This alone is a 1% increase over doing nothing.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 199, 89, 0.1)', // Assuming Colors.brand is green-ish, using rgba for 0.1 opacity
    padding: Spacing.m,
    borderRadius: 12,
    marginTop: Spacing.l,
    marginBottom: Spacing.m,
    gap: Spacing.s,
  },
  text: {
    ...Typography.body,
    fontSize: 14,
    color: Colors.brand,
    flex: 1,
    lineHeight: 20,
  },
});
