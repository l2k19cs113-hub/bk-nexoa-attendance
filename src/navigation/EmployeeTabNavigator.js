import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../constants';

import EmployeeDashboardScreen from '../screens/employee/EmployeeDashboardScreen';
import AttendanceScreen from '../screens/employee/AttendanceScreen';
import ReportSubmitScreen from '../screens/employee/ReportSubmitScreen';
import AttendanceHistoryScreen from '../screens/employee/AttendanceHistoryScreen';
import ReportHistoryScreen from '../screens/employee/ReportHistoryScreen';
import ProfileScreen from '../screens/employee/ProfileScreen';

const Tab = createBottomTabNavigator();

const TabIcon = ({ name, label, focused, color }) => (
  <View style={styles.tabItem}>
    <View style={focused ? styles.activeIconBg : null}>
      <Ionicons name={name} size={22} color={color} />
    </View>
    <Text style={[styles.tabLabel, { color }]}>{label}</Text>
  </View>
);

export default function EmployeeTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={EmployeeDashboardScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name={focused ? 'home' : 'home-outline'} label="Home" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Attendance"
        component={AttendanceScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name={focused ? 'finger-print' : 'finger-print-outline'} label="Check In" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Report"
        component={ReportSubmitScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name={focused ? 'create' : 'create-outline'} label="Report" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="History"
        component={AttendanceHistoryScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name={focused ? 'calendar' : 'calendar-outline'} label="History" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ReportHistory"
        component={ReportHistoryScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name={focused ? 'document-text' : 'document-text-outline'} label="My Reports" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name={focused ? 'person' : 'person-outline'} label="Profile" focused={focused} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.bgCard,
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    height: Platform.OS === 'ios' ? 85 : 65,
    paddingBottom: Platform.OS === 'ios' ? 25 : 8,
    paddingTop: 8,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  tabLabel: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '500',
  },
  activeIconBg: {
    backgroundColor: `${COLORS.primary}20`,
    borderRadius: 10,
    padding: 4,
  },
});
