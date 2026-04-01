import { Platform } from 'react-native';

/**
 * OnePercent Design System - Shadows
 * Soft, layered elevations to create depth in the UI.
 */

export const Shadows = {
  // Low elevation for list items/regular cards
  soft: {
    ...Platform.select({
      ios: {
        shadowColor: '#1A1C1E',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
      },
      android: {
        elevation: 4,
      },
    }),
  },

  // Shadow for main list cards
  card: {
    ...Platform.select({
      ios: {
        shadowColor: '#1A1C1E',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
      },
      android: {
        elevation: 6,
      },
    }),
  },

  // Medium elevation for floating elements/tab bars
  elevated: {
    ...Platform.select({
      ios: {
        shadowColor: '#192435',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.12,
        shadowRadius: 24,
      },
      android: {
        elevation: 10,
      },
    }),
  },

  // High elevation for brand buttons (accentuated with brand color)
  brand: {
    ...Platform.select({
      ios: {
        shadowColor: '#00D1B2',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
      },
      android: {
        elevation: 8,
      },
    }),
  },
};
