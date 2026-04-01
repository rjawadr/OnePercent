import { Platform } from 'react-native';

/**
 * OnePercent Design System - Typography
 * Premium, clean font hierarchy with descriptive weights.
 */

const BaseFonts = {
  regular: Platform.OS === 'ios' ? 'Inter-Regular' : 'sans-serif',
  medium: Platform.OS === 'ios' ? 'Inter-Medium' : 'sans-serif-medium',
  bold: Platform.OS === 'ios' ? 'Inter-Bold' : 'sans-serif-condensed-bold',
};

export const Typography = {
  // Headings
  h1: {
    fontSize: 32,
    fontWeight: '800' as const,
    letterSpacing: -1,
    lineHeight: 38,
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
    lineHeight: 30,
  },
  heading: {
    fontSize: 18,
    fontWeight: '700' as const,
    letterSpacing: -0.2,
    lineHeight: 24,
  },

  // UI Elements
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 22,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    letterSpacing: 0.1,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '500' as const,
    letterSpacing: 0.2,
    lineHeight: 16,
  },
  micro: {
    fontSize: 10,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
    lineHeight: 12,
    textTransform: 'uppercase' as const,
  },
};
