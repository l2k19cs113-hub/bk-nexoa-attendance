// BK Nexoa Tech Attendance - Supabase Configuration
// Replace these values with your actual Supabase project credentials

export const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
export const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY_HERE';

// App Constants
export const APP_NAME = 'BK Nexoa Tech Attendance';
export const APP_VERSION = '1.0.0';

// Colors
export const COLORS = {
  primary: '#6C63FF',
  primaryDark: '#4F46E5',
  primaryLight: '#818CF8',
  secondary: '#06B6D4',
  accent: '#F59E0B',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',

  // Dark Mode Backgrounds
  bgDark: '#0A0F1E',
  bgCard: '#111827',
  bgCardLight: '#1F2937',
  bgInput: '#0F172A',
  bgModal: '#1E293B',

  // Light Mode Backgrounds
  bgLight: '#F8FAFC',
  bgCardWhite: '#FFFFFF',
  bgInputLight: '#F1F5F9',

  // Text
  textLight: '#FFFFFF',
  textMuted: '#94A3B8',
  textDark: '#0F172A',
  textSecondary: '#64748B',
  textHeading: '#E2E8F0',

  // Borders
  border: '#1E293B',
  borderLight: '#E2E8F0',

  // Gradients (arrays for LinearGradient)
  gradientPrimary: ['#6C63FF', '#4F46E5'],
  gradientSecondary: ['#06B6D4', '#0891B2'],
  gradientSuccess: ['#10B981', '#059669'],
  gradientDanger: ['#EF4444', '#DC2626'],
  gradientDark: ['#0A0F1E', '#111827'],
  gradientCard: ['#1F2937', '#111827'],
  gradientAccent: ['#F59E0B', '#D97706'],
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  sizes: {
    xs: 10,
    sm: 12,
    md: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 28,
  full: 9999,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  md: {
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
};
