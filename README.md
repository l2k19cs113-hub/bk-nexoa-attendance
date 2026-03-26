# BK Nexoa Tech Attendance

A modern, scalable Employee Attendance & Daily Reporting System built with React Native (Expo) + Supabase.

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure Supabase
See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for full instructions.

Then update `src/constants/index.js`:
```js
export const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
export const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';
```

### 3. Run the app
```bash
# Mobile (Expo Go)
npm start

# Web
npm run web

# Android
npm run android

# iOS
npm run ios
```

---

## 📁 Project Structure

```
bk-nexoa-attendance/
├── index.js                    # Entry point
├── app.json                    # Expo config
├── package.json
├── babel.config.js
├── SUPABASE_SETUP.md           # 📖 Database setup guide
│
└── src/
    ├── api/
    │   ├── supabase.js         # Supabase client
    │   └── index.js            # All API services (auth, attendance, reports, users)
    │
    ├── constants/
    │   └── index.js            # Colors, fonts, Supabase URL/KEY
    │
    ├── navigation/
    │   ├── AppNavigator.js     # Root navigator (auth gating)
    │   ├── AdminTabNavigator.js
    │   └── EmployeeTabNavigator.js
    │
    ├── store/
    │   ├── authStore.js        # Zustand: auth & user session
    │   ├── attendanceStore.js  # Zustand: check-in/out, history
    │   └── reportsStore.js     # Zustand: submit & fetch reports
    │
    └── screens/
        ├── SplashScreen.js
        ├── auth/
        │   ├── LoginScreen.js
        │   ├── SignupScreen.js
        │   └── ForgotPasswordScreen.js
        ├── admin/
        │   ├── AdminDashboardScreen.js
        │   ├── EmployeeManagementScreen.js
        │   ├── AdminAttendanceScreen.js
        │   ├── AdminReportsScreen.js
        │   └── AnalyticsScreen.js
        └── employee/
            ├── EmployeeDashboardScreen.js
            ├── AttendanceScreen.js
            ├── ReportSubmitScreen.js
            ├── AttendanceHistoryScreen.js
            ├── ReportHistoryScreen.js
            └── ProfileScreen.js
```

---

## 🎯 Features

### Employee
- ✅ Login / Register with role
- ✅ Animated Check-In / Check-Out with GPS
- ✅ Daily Report submission with file/image proof
- ✅ Attendance calendar history
- ✅ Report history with status tracking
- ✅ Profile management

### Admin
- ✅ Dashboard with live stats
- ✅ Employee management (add/delete/search)
- ✅ View all attendance records with filters
- ✅ Approve / Reject daily reports
- ✅ Analytics with bar & pie charts

---

## 🎨 Design System

- **Dark Mode First** (`#0A0F1E` base)
- **Primary**: `#6C63FF` (purple)
- **Secondary**: `#06B6D4` (cyan)
- **Success**: `#10B981` / **Danger**: `#EF4444`
- Cards with `#111827` + subtle borders
- Linear gradients on key CTAs
- Micro-animations throughout

---

## 🔗 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React Native + Expo |
| Backend | Supabase (Auth + DB + Storage + Realtime) |
| State | Zustand |
| Navigation | React Navigation v6 |
| Charts | react-native-chart-kit |
| Calendar | react-native-calendars |
| Location | expo-location |
| Images | expo-image-picker |
