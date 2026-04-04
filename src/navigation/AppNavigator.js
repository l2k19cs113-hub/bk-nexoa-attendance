import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import useAuthStore from '../store/authStore';
import { COLORS } from '../constants';

// Auth Screens
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

// Admin Navigator
import AdminTabNavigator from './AdminTabNavigator';
import AdminLeaveManagementScreen from '../screens/admin/AdminLeaveManagementScreen';
// Employee Navigator
import EmployeeTabNavigator from './EmployeeTabNavigator';
import LeaveRequestScreen from '../screens/employee/LeaveRequestScreen';

const Stack = createNativeStackNavigator();

const linking = {
  prefixes: ['https://bk-nexoa-attendance.vercel.app', 'bk-attendance://'],
  config: {
    screens: {
      Splash: 'splash',
      Login: 'login',
      AdminTabs: {
        screens: {
          Dashboard: 'dashboard',
          Employees: 'team',
          Attendance: 'attendance',
          Reports: 'reports',
          Salary: 'salary',
          Analytics: 'analytics',
          Profile: 'profile',
        }
      },
      AdminLeaveManagement: 'AdminLeaveManagement',
      EmployeeTabs: {
        screens: {
          Home: 'home',
          Attendance: 'employee-attendance',
          History: 'history',
          Reports: 'employee-reports',
          Profile: 'employee-profile',
        }
      },
      LeaveRequest: 'LeaveRequest',
    }
  }
};

export default function AppNavigator() {
  const { isAuthenticated, isLoading, profile, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bgDark }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </>
        ) : profile?.role === 'admin' ? (
          <>
            <Stack.Screen name="AdminTabs" component={AdminTabNavigator} />
            <Stack.Screen name="AdminLeaveManagement" component={AdminLeaveManagementScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="EmployeeTabs" component={EmployeeTabNavigator} />
            <Stack.Screen name="LeaveRequest" component={LeaveRequestScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
