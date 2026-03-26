import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, RefreshControl, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { COLORS, RADIUS } from '../../constants';
import useAttendanceStore from '../../store/attendanceStore';

export default function AdminAttendanceScreen() {
  const { fetchAllAttendance, allAttendance, isLoading } = useAttendanceStore();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [refreshing, setRefreshing] = useState(false);
  const [filterMode, setFilterMode] = useState('today'); // today | all

  const load = async () => {
    await fetchAllAttendance(filterMode === 'today' ? selectedDate : null);
  };

  useEffect(() => { load(); }, [selectedDate, filterMode]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const getDuration = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return null;
    const ms = new Date(checkOut) - new Date(checkIn);
    const hrs = Math.floor(ms / 3600000);
    const mins = Math.floor((ms % 3600000) / 60000);
    return `${hrs}h ${mins}m`;
  };

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <View style={styles.rowLeftAccent} />
      <View style={styles.rowContent}>
        <View style={styles.rowHeader}>
          <LinearGradient colors={COLORS.gradientPrimary} style={styles.avatar}>
            <Text style={styles.avatarText}>{(item.users?.name || 'U')[0].toUpperCase()}</Text>
          </LinearGradient>
          <View style={styles.nameBlock}>
            <Text style={styles.empName}>{item.users?.name || 'Unknown'}</Text>
            <Text style={styles.empEmail}>{item.users?.email}</Text>
          </View>
          <View style={[styles.badge,
            item.check_out_time ? styles.badgeDone : styles.badgeIn
          ]}>
            <Text style={[styles.badgeText, item.check_out_time ? { color: COLORS.secondary } : { color: COLORS.success }]}>
              {item.check_out_time ? 'Completed' : 'Present'}
            </Text>
          </View>
        </View>

        <View style={styles.timeRow}>
          <View style={styles.timeBlock}>
            <Ionicons name="log-in-outline" size={14} color={COLORS.success} />
            <Text style={styles.timeLabel}>Check In</Text>
            <Text style={styles.timeValue}>
              {item.check_in_time ? format(new Date(item.check_in_time), 'hh:mm a') : '--'}
            </Text>
          </View>
          <View style={styles.timeSep} />
          <View style={styles.timeBlock}>
            <Ionicons name="log-out-outline" size={14} color={COLORS.danger} />
            <Text style={styles.timeLabel}>Check Out</Text>
            <Text style={styles.timeValue}>
              {item.check_out_time ? format(new Date(item.check_out_time), 'hh:mm a') : '--'}
            </Text>
          </View>
          <View style={styles.timeSep} />
          <View style={styles.timeBlock}>
            <Ionicons name="time-outline" size={14} color={COLORS.primary} />
            <Text style={styles.timeLabel}>Duration</Text>
            <Text style={styles.timeValue}>
              {getDuration(item.check_in_time, item.check_out_time) || '--'}
            </Text>
          </View>
        </View>

        {item.location && (
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={12} color={COLORS.textMuted} />
            <Text style={styles.locationText} numberOfLines={1}>{item.location}</Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient colors={['#0A0F1E', '#111827']} style={styles.header}>
        <Text style={styles.headerTitle}>Attendance Records</Text>
        <Text style={styles.headerSub}>{allAttendance.length} records</Text>

        {/* Filter Tabs */}
        <View style={styles.filterRow}>
          {[
            { key: 'today', label: `Today (${format(new Date(), 'MMM d')})` },
            { key: 'all', label: 'All Records' },
          ].map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterTab, filterMode === f.key && styles.filterTabActive]}
              onPress={() => setFilterMode(f.key)}
            >
              <Text style={[styles.filterTabText, filterMode === f.key && styles.filterTabTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      {isLoading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={allAttendance}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={48} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>No attendance records found</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgDark },
  header: {
    paddingTop: 56, paddingBottom: 16, paddingHorizontal: 20,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
  filterRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  filterTab: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 99,
    backgroundColor: COLORS.bgCardLight, borderWidth: 1, borderColor: COLORS.border,
  },
  filterTabActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterTabText: { fontSize: 12, color: COLORS.textMuted, fontWeight: '600' },
  filterTabTextActive: { color: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16, paddingBottom: 100 },
  row: {
    flexDirection: 'row',
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg,
    marginBottom: 12, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden',
  },
  rowLeftAccent: { width: 4, backgroundColor: COLORS.primary },
  rowContent: { flex: 1, padding: 14 },
  rowHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: {
    width: 40, height: 40, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  nameBlock: { flex: 1, marginLeft: 10 },
  empName: { fontSize: 14, fontWeight: '700', color: '#fff' },
  empEmail: { fontSize: 11, color: COLORS.textMuted, marginTop: 1 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99 },
  badgeIn: { backgroundColor: `${COLORS.success}20` },
  badgeDone: { backgroundColor: `${COLORS.secondary}20` },
  badgeText: { fontSize: 11, fontWeight: '700' },
  timeRow: {
    flexDirection: 'row', backgroundColor: COLORS.bgInput,
    borderRadius: RADIUS.md, padding: 10,
  },
  timeBlock: { flex: 1, alignItems: 'center', gap: 3 },
  timeSep: { width: 1, backgroundColor: COLORS.border },
  timeLabel: { fontSize: 10, color: COLORS.textMuted },
  timeValue: { fontSize: 13, fontWeight: '700', color: '#fff' },
  locationRow: {
    flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8,
  },
  locationText: { fontSize: 11, color: COLORS.textMuted, flex: 1 },
  emptyState: { flex: 1, alignItems: 'center', paddingTop: 80, gap: 10 },
  emptyText: { fontSize: 14, color: COLORS.textMuted },
});
