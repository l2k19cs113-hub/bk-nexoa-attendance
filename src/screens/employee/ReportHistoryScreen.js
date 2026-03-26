import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, StatusBar,
  RefreshControl, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { COLORS, RADIUS } from '../../constants';
import useAuthStore from '../../store/authStore';
import useReportsStore from '../../store/reportsStore';

const STATUS_CONFIG = {
  pending: { color: COLORS.warning, icon: 'time-outline', bg: `${COLORS.warning}20` },
  approved: { color: COLORS.success, icon: 'checkmark-circle-outline', bg: `${COLORS.success}20` },
  rejected: { color: COLORS.danger, icon: 'close-circle-outline', bg: `${COLORS.danger}20` },
};

export default function ReportHistoryScreen() {
  const { profile } = useAuthStore();
  const { fetchMyReports, myReports, isLoading } = useReportsStore();
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');

  const load = async () => { if (profile?.id) await fetchMyReports(profile.id); };
  useEffect(() => { load(); }, [profile?.id]);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const filtered = filter === 'all' ? myReports : myReports.filter((r) => r.status === filter);

  const renderReport = ({ item }) => {
    const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
              <Ionicons name={cfg.icon} size={12} color={cfg.color} />
              <Text style={[styles.statusText, { color: cfg.color }]}>
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </Text>
            </View>
          </View>
          <Text style={styles.cardDate}>
            <Ionicons name="calendar-outline" size={12} color={COLORS.textMuted} /> {format(new Date(item.date), 'MMM d, yyyy')}
          </Text>
        </View>

        <Text style={styles.cardDesc} numberOfLines={3}>{item.description}</Text>

        {item.file_url && (
          <View style={styles.attachRow}>
            <Ionicons name="attach" size={13} color={COLORS.primary} />
            <Text style={styles.attachText}>Attachment included</Text>
          </View>
        )}

        {item.status === 'rejected' && (
          <View style={styles.rejectedNote}>
            <Ionicons name="alert-circle-outline" size={14} color={COLORS.danger} />
            <Text style={styles.rejectedText}>This report was rejected. Consider resubmitting.</Text>
          </View>
        )}
      </View>
    );
  };

  const pendingCount = myReports.filter((r) => r.status === 'pending').length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <LinearGradient colors={['#0A0F1E', '#111827']} style={styles.header}>
        <Text style={styles.headerTitle}>My Reports</Text>
        <Text style={styles.headerSub}>{myReports.length} reports • {pendingCount} pending</Text>

        {/* Filter Tabs */}
        <View style={styles.filterRow}>
          {['all', 'pending', 'approved', 'rejected'].map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterTab, filter === f && styles.filterTabActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
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
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderReport}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={48} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>No reports found</Text>
              <Text style={styles.emptySubText}>Submit daily reports from the Report tab</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgDark },
  header: { paddingTop: 56, paddingBottom: 16, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
  filterRow: { flexDirection: 'row', gap: 8, marginTop: 14 },
  filterTab: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 99,
    backgroundColor: COLORS.bgCardLight, borderWidth: 1, borderColor: COLORS.border,
  },
  filterTabActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterText: { fontSize: 12, fontWeight: '600', color: COLORS.textMuted },
  filterTextActive: { color: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16, paddingBottom: 100 },
  card: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg,
    padding: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border,
  },
  cardTop: { marginBottom: 10 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 },
  cardTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: '#fff' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 99 },
  statusText: { fontSize: 11, fontWeight: '700' },
  cardDate: { fontSize: 12, color: COLORS.textMuted, marginTop: 4 },
  cardDesc: { fontSize: 13, color: COLORS.textMuted, lineHeight: 20 },
  attachRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  attachText: { fontSize: 12, color: COLORS.primary },
  rejectedNote: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10,
    backgroundColor: `${COLORS.danger}15`, borderRadius: RADIUS.sm,
    padding: 10, borderWidth: 1, borderColor: `${COLORS.danger}30`,
  },
  rejectedText: { fontSize: 12, color: COLORS.danger, flex: 1 },
  emptyState: { flex: 1, alignItems: 'center', paddingTop: 80, gap: 8 },
  emptyText: { fontSize: 15, color: COLORS.textMuted, fontWeight: '600' },
  emptySubText: { fontSize: 13, color: COLORS.textMuted },
});
