/**
 * OnePctDiscipline Design Tokens
 * Focus: Calm, Premium, Anxiety-Safe Aesthetic
 */

export const COLORS = {
  // Brand Palette
  primary: '#3EC9A7', // Brand Teal
  primaryLight: '#A2E6D5',
  primaryDark: '#2C937A',
  
  // Backgrounds
  background: '#F5F6F8', // Warm White
  surface: '#FFFFFF',
  
  // Text
  textPrimary: '#1C2B4A', // Deep Navy
  textSecondary: '#5A6B8D',
  textTertiary: '#8E9AAF',
  
  // States (Anxiety-Safe)
  success: '#3EC9A7',
  warning: '#FDCB6E', // Soft Amber (Warning instead of red)
  error: '#FDCB6E',   // Soft Amber (Zero red according to user request)
  
  // Overlays
  overlay: 'rgba(28, 43, 74, 0.4)',
  
  // Translucent (Glassmorphism foundations)
  glass: 'rgba(255, 255, 255, 0.8)',
};

export const SPACING = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
  xxl: 48,
};

export const BORDER_RADIUS = {
  s: 8,
  m: 12,
  l: 16,
  xl: 24,
  full: 999,
};

export const SHADOWS = {
  light: {
    shadowColor: COLORS.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  medium: {
    shadowColor: COLORS.textPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
};
