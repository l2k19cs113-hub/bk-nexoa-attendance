import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, RefreshControl, Alert, ActivityIndicator, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { COLORS, RADIUS } from '../../constants';
import useReportsStore from '../../store/reportsStore';

const STATUS_CONFIG = {
  pending: { color: COLORS.warning, icon: 'time-outline', label: 'Pending' },
  approved: { color: COLORS.success, icon: 'checkmark-circle-outline', label: 'Approved' },
  rejected: { color: COLORS.danger, icon: 'close-circle-outline', label: 'Rejected' },
};

export default function AdminReportsScreen() {
  const { fetchAllReports, allReports, updateStatus, isLoading } = useReportsStore();
  const [filter, setFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => { await fetchAllReports(filter); };
  useEffect(() => { load(); }, [filter]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handleAction = (reportId, action) => {
    Alert.alert(
      `${action === 'approved' ? 'Approve' : 'Reject'} Report`,
      `Are you sure you want to ${action === 'approved' ? 'approve' : 'reject'} this report?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action === 'approved' ? 'Approve' : 'Reject',
          style: action === 'rejected' ? 'destructive' : 'default',
          onPress: () => updateStatus(reportId, action),
        },
      ]
    );
  };

  const renderReport = ({ item }) => {
    const status = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;

    return (
      <View style={styles.card}>
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <LinearGradient colors={COLORS.gradientPrimary} style={styles.reportAvatar}>
            <Text style={styles.reportAvatarText}>{(item.users?.name || 'U')[0].toUpperCase()}</Text>
          </LinearGradient>
          <View style={styles.cardHeaderInfo}>
            <Text style={styles.employeeName}>{item.users?.name || 'Unknown'}</Text>
            <Text style={styles.reportDate}>{format(new Date(item.date), 'MMM d, yyyy')}</Text>
          </View>
          <View style={[styles.statusChip, { backgroundColor: `${status.color}20` }]}>
            <Ionicons name={status.icon} size={12} color={status.color} />
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>

        {/* Report Content */}
        <Text style={styles.reportTitle}>{item.title}</Text>
        <Text style={styles.reportDesc} numberOfLines={3}>{item.description}</Text>

        {/* Attachment */}
        {item.file_url && (
          <View style={styles.attachmentRow}>
            <Ionicons name="attach" size={14} color={COLORS.primary} />
            <Text style={styles.attachmentText}>Attachment included</Text>
          </View>
        )}

        {/* Actions - only for pending */}
        {item.status === 'pending' && (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.rejectBtn}
              onPress={() => handleAction(item.id, 'rejected')}
            >
              <Ionicons name="close" size={14} color={COLORS.danger} />
              <Text style={styles.rejectBtnText}>Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.approveBtn}
              onPress={() => handleAction(item.id, 'approved')}
            >
              <LinearGradient colors={COLORS.gradientSuccess} style={styles.approveBtnInner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Ionicons name="checkmark" size={14} color="#fff" />
                <Text style={styles.approveBtnText}>Approve</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient colors={['#0A0F1E', '#111827']} style={styles.header}>
        <Text style={styles.headerTitle}>Daily Reports</Text>
        <Text style={styles.headerSub}>{allReports.length} reports</Text>

        {/* Filter Chips */}
        <View style={styles.chipRow}>
          {['all', 'pending', 'approved', 'rejected'].map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.chip, filter === f && styles.chipActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.chipText, filter === f && styles.chipTextActive]}>
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
          data={allReports}
          keyExtractor={(item) => item.id}
          renderItem={renderReport}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={48} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>No reports found</Text>
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
  chipRow: { flexDirection: 'row', gap: 8, marginTop: 14, flexWrap: 'wrap' },
  chip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 99,
    backgroundColor: COLORS.bgCardLight, borderWidth: 1, borderColor: COLORS.border,
  },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 12, fontWeight: '600', color: COLORS.textMuted },
  chipTextActive: { color: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16, paddingBottom: 100 },
  card: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg,
    padding: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  reportAvatar: {
    width: 40, height: 40, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  reportAvatarText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  cardHeaderInfo: { flex: 1, marginLeft: 10 },
  employeeName: { fontSize: 14, fontWeight: '700', color: '#fff' },
  reportDate: { fontSize: 12, color: COLORS.textMuted, marginTop: 1 },
  statusChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99,
  },
  statusText: { fontSize: 11, fontWeight: '700' },
  reportTitle: { fontSize: 15, fontWeight: '700', color: '#fff', marginBottom: 6 },
  reportDesc: { fontSize: 13, color: COLORS.textMuted, lineHeight: 20 },
  attachmentRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  attachmentText: { fontSize: 12, color: COLORS.primary },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  rejectBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 10, borderRadius: RADIUS.md,
    backgroundColor: `${COLORS.danger}15`, borderWidth: 1, borderColor: COLORS.danger,
  },
  rejectBtnText: { fontSize: 13, fontWeight: '700', color: COLORS.danger },
  approveBtn: { flex: 1, borderRadius: RADIUS.md, overflow: 'hidden' },
  approveBtnInner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 10,
  },
  approveBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  emptyState: { flex: 1, alignItems: 'center', paddingTop: 80, gap: 10 },
  emptyText: { fontSize: 14, color: COLORS.textMuted },
});
