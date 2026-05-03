import React from 'react';
import { Platform } from 'react-native';

// Conditionally import SpeedInsights only on web
let SpeedInsights = null;
if (Platform.OS === 'web') {
  try {
    const module = require('@vercel/speed-insights/react');
    SpeedInsights = module.SpeedInsights;
  } catch (error) {
    console.warn('Failed to load @vercel/speed-insights:', error);
  }
}

export default function SpeedInsightsWrapper() {
  // Only render SpeedInsights component on web platform
  if (Platform.OS === 'web' && SpeedInsights) {
    return <SpeedInsights />;
  }
  return null;
}
