import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  RefreshControl, StatusBar, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { COLORS, RADIUS, SPACING } from '../../constants';
import useAuthStore from '../../store/authStore';
import useAttendanceStore from '../../store/attendanceStore';
import useReportsStore from '../../store/reportsStore';
import { usersApi } from '../../api';

const { width } = Dimensions.get('window');

const StatCard = ({ title, value, icon, gradient, subtitle }) => (
  <LinearGradient colors={gradient} style={styles.statCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
    <View style={styles.statInner}>
      <View style={styles.statTextGroup}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
        {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
      </View>
      <View style={styles.statIconBox}>
        <Ionicons name={icon} size={28} color="rgba(255,255,255,0.9)" />
      </View>
    </View>
  </LinearGradient>
);

export default function AdminDashboardScreen() {
  const { profile } = useAuthStore();
  const { fetchTodayStats, todayStats } = useAttendanceStore();
  const { fetchStats, reportStats } = useReportsStore();
  const [employeeCount, setEmployeeCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [recentAttendance, setRecentAttendance] = useState([]);

  const loadData = async () => {
    try {
      const [employees, stats] = await Promise.all([
        usersApi.getAllEmployees(),
        fetchTodayStats(),
        fetchStats(),
      ]);
      setEmployeeCount(employees.length);
      setRecentAttendance((stats?.records || []).slice(0, 5));
    } catch (err) {
      console.error('Dashboard load error:', err);
    }
  };

  useEffect(() => { loadData(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const now = new Date();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient colors={['#0A0F1E', '#111827']} style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Good {now.getHours() < 12 ? 'Morning' : now.getHours() < 17 ? 'Afternoon' : 'Evening'} 👋</Text>
            <Text style={styles.adminName}>{profile?.name || 'Admin'}</Text>
            <Text style={styles.roleChip}>🛡️ Administrator</Text>
          </View>
          <View style={styles.avatarContainer}>
            <LinearGradient colors={COLORS.gradientPrimary} style={styles.avatar}>
              <Text style={styles.avatarText}>{(profile?.name || 'A')[0].toUpperCase()}</Text>
            </LinearGradient>
            <View style={styles.onlineDot} />
          </View>
        </View>
        <Text style={styles.dateText}>{format(now, 'EEEE, MMMM d, yyyy')}</Text>
      </LinearGradient>

      <ScrollView
        style={styles.body}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        {/* Quick Stats */}
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Employees"
            value={employeeCount}
            icon="people"
            gradient={COLORS.gradientPrimary}
            subtitle="Active workforce"
          />
          <StatCard
            title="Present Today"
            value={todayStats?.present || 0}
            icon="checkmark-circle"
            gradient={COLORS.gradientSuccess}
            subtitle="Checked in"
          />
          <StatCard
            title="Pending Reports"
            value={reportStats?.pending || 0}
            icon="document-text"
            gradient={COLORS.gradientAccent}
            subtitle="Awaiting review"
          />
          <StatCard
            title="Approved Reports"
            value={reportStats?.approved || 0}
            icon="shield-checkmark"
            gradient={COLORS.gradientSecondary}
            subtitle="This month"
          />
        </View>

        {/* Attendance Snap */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Attendance</Text>
          <View style={styles.dateTag}>
            <Ionicons name="calendar" size={12} color={COLORS.primary} />
            <Text style={styles.dateTagText}>{format(now, 'MMM d')}</Text>
          </View>
        </View>

        {recentAttendance.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="people-outline" size={40} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>No attendance records yet today</Text>
          </View>
        ) : (
          recentAttendance.map((record, i) => (
            <View key={record.id || i} style={styles.attendanceRow}>
              <View style={styles.attendanceAvatar}>
                <Text style={styles.attendanceAvatarText}>
                  {(record.users?.name || 'U')[0].toUpperCase()}
                </Text>
              </View>
              <View style={styles.attendanceInfo}>
                <Text style={styles.attendanceName}>{record.users?.name || 'Employee'}</Text>
                <Text style={styles.attendanceTime}>
                  In: {record.check_in_time ? format(new Date(record.check_in_time), 'hh:mm a') : '--'}
                  {record.check_out_time ? `  •  Out: ${format(new Date(record.check_out_time), 'hh:mm a')}` : ''}
                </Text>
              </View>
              <View style={[styles.statusPill,
                record.check_out_time ? styles.pillComplete : styles.pillPresent
              ]}>
                <Text style={styles.pillText}>
                  {record.check_out_time ? 'Done' : 'In'}
                </Text>
              </View>
            </View>
          ))
        )}

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>HR Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity 
            activeOpacity={0.8} 
            onPress={() => navigation.navigate('AdminLeaveManagement')}
            style={styles.actionCardWrapper}
          >
            <LinearGradient colors={['#8B5CF6', '#6D28D9']} style={styles.actionCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Ionicons name="cafe" size={24} color="#fff" />
              <Text style={styles.actionLabel}>Manage Leaves</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity 
            activeOpacity={0.8} 
            onPress={() => navigation.navigate('Employees')}
            style={styles.actionCardWrapper}
          >
            <LinearGradient colors={COLORS.gradientPrimary} style={styles.actionCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Ionicons name="people" size={24} color="#fff" />
              <Text style={styles.actionLabel}>Team Directory</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Report Summary */}
        <Text style={styles.sectionTitle}>Report Summary</Text>
        <View style={styles.reportSummaryCard}>
          {[
            { label: 'Total', value: reportStats?.total || 0, color: COLORS.primary },
            { label: 'Pending', value: reportStats?.pending || 0, color: COLORS.warning },
            { label: 'Approved', value: reportStats?.approved || 0, color: COLORS.success },
            { label: 'Rejected', value: reportStats?.rejected || 0, color: COLORS.danger },
          ].map((item) => (
            <View key={item.label} style={styles.reportItem}>
              <View style={[styles.reportDot, { backgroundColor: item.color }]} />
              <Text style={styles.reportLabel}>{item.label}</Text>
              <Text style={[styles.reportValue, { color: item.color }]}>{item.value}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgDark },
  header: {
    paddingTop: 56, paddingBottom: 24, paddingHorizontal: 20,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  greeting: { fontSize: 13, color: COLORS.textMuted, letterSpacing: 0.3 },
  adminName: { fontSize: 22, fontWeight: '800', color: '#fff', marginTop: 2 },
  roleChip: { fontSize: 11, color: COLORS.primary, fontWeight: '600', marginTop: 4 },
  avatarContainer: { position: 'relative' },
  avatar: {
    width: 52, height: 52, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 22, fontWeight: '700', color: '#fff' },
  onlineDot: {
    position: 'absolute', bottom: 2, right: 2,
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: COLORS.success, borderWidth: 2, borderColor: COLORS.bgDark,
  },
  dateText: { fontSize: 12, color: COLORS.textMuted, marginTop: 12 },
  body: { flex: 1, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#fff', marginTop: 24, marginBottom: 12 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, marginBottom: 12 },
  dateTag: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: `${COLORS.primary}20`, paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 99,
  },
  dateTagText: { fontSize: 11, color: COLORS.primary, fontWeight: '600' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: {
    width: (width - 44) / 2, borderRadius: RADIUS.lg,
    padding: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 10, elevation: 8,
  },
  statInner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statTextGroup: {},
  statValue: { fontSize: 30, fontWeight: '800', color: '#fff' },
  statTitle: { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: '600', marginTop: 2 },
  statSubtitle: { fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 1 },
  statIconBox: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center',
  },
  emptyCard: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg,
    padding: 32, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  emptyText: { fontSize: 13, color: COLORS.textMuted, marginTop: 10 },
  attendanceRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg,
    padding: 14, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border,
  },
  attendanceAvatar: {
    width: 40, height: 40, borderRadius: 14,
    backgroundColor: `${COLORS.primary}30`, justifyContent: 'center', alignItems: 'center',
  },
  attendanceAvatarText: { fontSize: 16, fontWeight: '700', color: COLORS.primary },
  attendanceInfo: { flex: 1, marginLeft: 12 },
  attendanceName: { fontSize: 14, fontWeight: '600', color: '#fff' },
  attendanceTime: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99 },
  pillPresent: { backgroundColor: `${COLORS.success}25` },
  pillComplete: { backgroundColor: `${COLORS.secondary}25` },
  pillText: { fontSize: 11, fontWeight: '700', color: COLORS.success },
  reportSummaryCard: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg,
    padding: 16, borderWidth: 1, borderColor: COLORS.border,
  },
  reportItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  reportDot: { width: 8, height: 8, borderRadius: 4, marginRight: 12 },
  reportLabel: { flex: 1, fontSize: 14, color: COLORS.textMuted },
  reportValue: { fontSize: 16, fontWeight: '700' },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 8 },
  actionCardWrapper: { width: (width - 44) / 2 },
  actionCard: {
    borderRadius: RADIUS.lg, padding: 18, alignItems: 'center', gap: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 6,
  },
  actionLabel: { fontSize: 13, fontWeight: '700', color: '#fff', textAlign: 'center' },
});
