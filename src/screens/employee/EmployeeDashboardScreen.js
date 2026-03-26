import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  RefreshControl, StatusBar, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { COLORS, RADIUS } from '../../constants';
import useAuthStore from '../../store/authStore';
import useAttendanceStore from '../../store/attendanceStore';
import useReportsStore from '../../store/reportsStore';

const { width } = Dimensions.get('window');

export default function EmployeeDashboardScreen() {
  const { profile } = useAuthStore();
  const { fetchTodayAttendance, todayRecord, isCheckedIn, isCheckedOut } = useAttendanceStore();
  const { fetchMyReports, myReports } = useReportsStore();
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    if (profile?.id) {
      await Promise.all([
        fetchTodayAttendance(profile.id),
        fetchMyReports(profile.id),
      ]);
    }
  };

  useEffect(() => { load(); }, [profile?.id]);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Morning' : now.getHours() < 17 ? 'Afternoon' : 'Evening';

  const approvedCount = myReports.filter((r) => r.status === 'approved').length;
  const pendingCount = myReports.filter((r) => r.status === 'pending').length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header Banner */}
      <LinearGradient colors={['#0A0F1E', '#111827']} style={styles.header}>
        <View style={styles.headerInner}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>Good {greeting} 👋</Text>
            <Text style={styles.name}>{profile?.name || 'Employee'}</Text>
            <View style={styles.empBadge}>
              <Ionicons name="briefcase" size={11} color={COLORS.secondary} />
              <Text style={styles.empBadgeText}>Employee</Text>
            </View>
          </View>
          <LinearGradient colors={COLORS.gradientPrimary} style={styles.avatar}>
            <Text style={styles.avatarText}>{(profile?.name || 'E')[0].toUpperCase()}</Text>
          </LinearGradient>
        </View>
        <Text style={styles.dateText}>{format(now, 'EEEE, MMMM d, yyyy')}</Text>
      </LinearGradient>

      <ScrollView
        style={styles.body}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        {/* Today's Status Card */}
        <LinearGradient
          colors={isCheckedIn ? (isCheckedOut ? COLORS.gradientSecondary : COLORS.gradientSuccess) : COLORS.gradientPrimary}
          style={styles.statusCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.statusCardInner}>
            <View>
              <Text style={styles.statusLabel}>Today's Status</Text>
              <Text style={styles.statusValue}>
                {!isCheckedIn ? '⏳ Not Checked In' : isCheckedOut ? '✅ Day Complete' : '🟢 Checked In'}
              </Text>
              {todayRecord?.check_in_time && (
                <Text style={styles.statusTime}>
                  In: {format(new Date(todayRecord.check_in_time), 'hh:mm a')}
                  {todayRecord.check_out_time && `  •  Out: ${format(new Date(todayRecord.check_out_time), 'hh:mm a')}`}
                </Text>
              )}
            </View>
            <View style={styles.statusIconBox}>
              <Ionicons
                name={!isCheckedIn ? 'finger-print-outline' : isCheckedOut ? 'checkmark-done' : 'radio-button-on'}
                size={36}
                color="rgba(255,255,255,0.9)"
              />
            </View>
          </View>
        </LinearGradient>

        {/* Quick Stats */}
        <Text style={styles.sectionTitle}>My Statistics</Text>
        <View style={styles.statsGrid}>
          {[
            { label: 'Reports Submitted', value: myReports.length, icon: 'document-text', color: COLORS.primary },
            { label: 'Approved', value: approvedCount, icon: 'checkmark-circle', color: COLORS.success },
            { label: 'Pending', value: pendingCount, icon: 'time', color: COLORS.warning },
          ].map((item) => (
            <View key={item.label} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: `${item.color}20` }]}>
                <Ionicons name={item.icon} size={20} color={item.color} />
              </View>
              <Text style={[styles.statValue, { color: item.color }]}>{item.value}</Text>
              <Text style={styles.statLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {[
            { icon: 'finger-print', label: 'Check In / Out', color: COLORS.gradientPrimary, screen: 'Attendance' },
            { icon: 'create', label: 'Submit Report', color: COLORS.gradientSuccess, screen: 'Report' },
            { icon: 'calendar', label: 'View History', color: COLORS.gradientSecondary, screen: 'History' },
            { icon: 'document-text', label: 'My Reports', color: COLORS.gradientAccent, screen: 'ReportHistory' },
          ].map((action) => (
            <LinearGradient key={action.label} colors={action.color} style={styles.actionCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Ionicons name={action.icon} size={28} color="#fff" />
              <Text style={styles.actionLabel}>{action.label}</Text>
            </LinearGradient>
          ))}
        </View>

        {/* Recent Reports */}
        <Text style={styles.sectionTitle}>Recent Reports</Text>
        {myReports.slice(0, 3).length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="document-outline" size={36} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>No reports submitted yet</Text>
          </View>
        ) : (
          myReports.slice(0, 3).map((report) => (
            <View key={report.id} style={styles.recentReportRow}>
              <View style={[styles.recentDot, {
                backgroundColor: report.status === 'approved' ? COLORS.success : report.status === 'rejected' ? COLORS.danger : COLORS.warning,
              }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.recentTitle}>{report.title}</Text>
                <Text style={styles.recentDate}>{format(new Date(report.date), 'MMM d, yyyy')}</Text>
              </View>
              <View style={[styles.recentChip, {
                backgroundColor: report.status === 'approved' ? `${COLORS.success}20` : report.status === 'rejected' ? `${COLORS.danger}20` : `${COLORS.warning}20`,
              }]}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: report.status === 'approved' ? COLORS.success : report.status === 'rejected' ? COLORS.danger : COLORS.warning }}>
                  {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                </Text>
              </View>
            </View>
          ))
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgDark },
  header: { paddingTop: 56, paddingBottom: 24, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerInner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  headerLeft: {},
  greeting: { fontSize: 13, color: COLORS.textMuted },
  name: { fontSize: 22, fontWeight: '800', color: '#fff', marginTop: 2 },
  empBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  empBadgeText: { fontSize: 11, color: COLORS.secondary, fontWeight: '600' },
  avatar: { width: 52, height: 52, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 22, fontWeight: '700', color: '#fff' },
  dateText: { fontSize: 12, color: COLORS.textMuted, marginTop: 12 },
  body: { flex: 1, paddingHorizontal: 16 },
  statusCard: { borderRadius: RADIUS.xl, padding: 20, marginTop: 20 },
  statusCardInner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)', letterSpacing: 1, textTransform: 'uppercase' },
  statusValue: { fontSize: 18, fontWeight: '800', color: '#fff', marginTop: 4 },
  statusTime: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 6 },
  statusIconBox: {
    width: 60, height: 60, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center',
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#fff', marginTop: 24, marginBottom: 12 },
  statsGrid: { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1, backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg,
    padding: 14, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  statIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 10, color: COLORS.textMuted, textAlign: 'center', marginTop: 4 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  actionCard: {
    width: (width - 44) / 2, borderRadius: RADIUS.lg,
    padding: 20, alignItems: 'center', gap: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 6,
  },
  actionLabel: { fontSize: 13, fontWeight: '700', color: '#fff', textAlign: 'center' },
  emptyCard: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, padding: 28, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  emptyText: { fontSize: 13, color: COLORS.textMuted, marginTop: 8 },
  recentReportRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg,
    padding: 14, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border, gap: 12,
  },
  recentDot: { width: 8, height: 8, borderRadius: 4 },
  recentTitle: { fontSize: 14, fontWeight: '600', color: '#fff' },
  recentDate: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  recentChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99 },
});
