import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../constants';

import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import EmployeeManagementScreen from '../screens/admin/EmployeeManagementScreen';
import AdminAttendanceScreen from '../screens/admin/AdminAttendanceScreen';
import AdminReportsScreen from '../screens/admin/AdminReportsScreen';
import AnalyticsScreen from '../screens/admin/AnalyticsScreen';
import SalaryManagementScreen from '../screens/admin/SalaryManagementScreen';
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

export default function AdminTabNavigator() {
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
        name="Dashboard"
        component={AdminDashboardScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name={focused ? 'grid' : 'grid-outline'} label="Dashboard" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Employees"
        component={EmployeeManagementScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name={focused ? 'people' : 'people-outline'} label="Team" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Attendance"
        component={AdminAttendanceScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name={focused ? 'calendar' : 'calendar-outline'} label="Attendance" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Reports"
        component={AdminReportsScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name={focused ? 'document-text' : 'document-text-outline'} label="Reports" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Salary"
        component={SalaryManagementScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name={focused ? 'cash' : 'cash-outline'} label="Salary" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name={focused ? 'bar-chart' : 'bar-chart-outline'} label="Analytics" focused={focused} color={color} />
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
