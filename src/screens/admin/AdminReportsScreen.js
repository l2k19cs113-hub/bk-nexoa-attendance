import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, RefreshControl, Alert, ActivityIndicator,
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
        <View style={styles.cardHeader}>
          <LinearGradient colors={COLORS.gradientPrimary} style={styles.reportAvatar}>
            <Text style={styles.reportAvatarText}>{(item.users?.name || 'U')[0].toUpperCase()}</Text>
          </LinearGradient>
          <View style={styles.cardHeaderInfo}>
            <Text style={styles.employeeName}>{item.users?.name || 'Unknown'}</Text>
            <Text style={styles.reportDate}>{format(new Date(item.date), 'MMM d, yyyy')}</Text>
          </View>
          <View style={[styles.statusChip, { backgroundColor: `${status.color}20` }]}>
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>

        {/* Call Info Table-style Display */}
        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <View style={styles.detailLabelRow}>
               <Ionicons name="person-outline" size={12} color={COLORS.primary} />
               <Text style={styles.detailLabel}>Client Name</Text>
            </View>
            <Text style={styles.detailValue}>{item.client_name || 'N/A'}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <View style={styles.detailLabelRow}>
               <Ionicons name="call-outline" size={12} color={COLORS.primary} />
               <Text style={styles.detailLabel}>Phone Number</Text>
            </View>
            <Text style={styles.detailValue}>{item.phone_number || 'N/A'}</Text>
          </View>

          <View style={styles.detailItem}>
            <View style={styles.detailLabelRow}>
               <Ionicons name="radio-button-on-outline" size={12} color={COLORS.primary} />
               <Text style={styles.detailLabel}>Call Action</Text>
            </View>
            <View style={[styles.miniBadge, { backgroundColor: item.call_action === 'Pick' ? `${COLORS.success}20` : `${COLORS.danger}20` }]}>
              <Text style={[styles.miniBadgeText, { color: item.call_action === 'Pick' ? COLORS.success : COLORS.danger }]}>
                {item.call_action || 'N/A'}
              </Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <View style={styles.detailLabelRow}>
               <Ionicons name="star-outline" size={12} color={COLORS.primary} />
               <Text style={styles.detailLabel}>Reaction</Text>
            </View>
            <View style={[styles.miniBadge, { backgroundColor: item.reaction === 'Accept' ? `${COLORS.success}20` : `${COLORS.danger}20` }]}>
              <Text style={[styles.miniBadgeText, { color: item.reaction === 'Accept' ? COLORS.success : COLORS.danger }]}>
                {item.reaction || 'N/A'}
              </Text>
            </View>
          </View>
        </View>

        {/* Notes */}
        {item.description && item.description !== 'No additional notes' && (
          <View style={styles.notesBox}>
            <Text style={styles.notesLabel}>Assistant Notes:</Text>
            <Text style={styles.notesText}>{item.description}</Text>
          </View>
        )}

        {/* Actions - only for pending */}
        {item.status === 'pending' && (
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.rejectBtn} onPress={() => handleAction(item.id, 'rejected')}>
              <Ionicons name="close-circle-outline" size={16} color={COLORS.danger} />
              <Text style={styles.rejectBtnText}>Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.approveBtn} onPress={() => handleAction(item.id, 'approved')}>
              <LinearGradient colors={COLORS.gradientSuccess} style={styles.approveBtnInner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Ionicons name="checkmark-circle-outline" size={16} color="#fff" />
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
      <LinearGradient colors={['#0A0F1E', '#111827']} style={styles.header}>
        <Text style={styles.headerTitle}>Daily Work Logs</Text>
        <Text style={styles.headerSub}>{allReports.length} client calls logged</Text>

        <View style={styles.chipRow}>
          {['all', 'pending', 'approved', 'rejected'].map((f) => (
            <TouchableOpacity key={f} style={[styles.chip, filter === f && styles.chipActive]} onPress={() => setFilter(f)}>
              <Text style={[styles.chipText, filter === f && styles.chipTextActive]}>{f.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      {isLoading && !refreshing ? (
        <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>
      ) : (
        <FlatList
          data={allReports}
          keyExtractor={(item) => item.id}
          renderItem={renderReport}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="call-outline" size={48} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>No call logs found</Text>
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
  chipRow: { flexDirection: 'row', gap: 8, marginTop: 14 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 99, backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.border },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 10, fontWeight: '800', color: COLORS.textMuted },
  chipTextActive: { color: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16, paddingBottom: 100 },
  card: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: COLORS.border },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  reportAvatar: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  reportAvatarText: { fontSize: 18, fontWeight: '800', color: '#fff' },
  cardHeaderInfo: { flex: 1, marginLeft: 12 },
  employeeName: { fontSize: 15, fontWeight: '700', color: '#fff' },
  reportDate: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  statusChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99 },
  statusText: { fontSize: 10, fontWeight: '800' },
  detailsContainer: { 
    flexDirection: 'row', flexWrap: 'wrap', 
    backgroundColor: `${COLORS.bgDark}50`, borderRadius: RADIUS.lg, 
    padding: 12, borderWidth: 1, borderColor: COLORS.border, gap: 10
  },
  detailItem: { width: '47%', marginBottom: 4 },
  detailLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  detailLabel: { fontSize: 10, color: COLORS.textMuted, fontWeight: '600', textTransform: 'uppercase' },
  detailValue: { fontSize: 13, color: '#fff', fontWeight: '700' },
  miniBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  miniBadgeText: { fontSize: 10, fontWeight: '800' },
  notesBox: { marginTop: 16, backgroundColor: `${COLORS.bgDark}50`, padding: 12, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border },
  notesLabel: { fontSize: 11, fontWeight: '700', color: COLORS.primary, marginBottom: 4 },
  notesText: { fontSize: 13, color: COLORS.textMuted, lineHeight: 20 },
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
  rejectBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: RADIUS.md, backgroundColor: `${COLORS.danger}15`, borderWidth: 1, borderColor: COLORS.danger },
  rejectBtnText: { color: COLORS.danger, fontSize: 14, fontWeight: '700' },
  approveBtn: { flex: 1, borderRadius: RADIUS.md, overflow: 'hidden' },
  approveBtnInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12 },
  approveBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  emptyState: { flex: 1, alignItems: 'center', paddingTop: 80, gap: 10 },
  emptyText: { fontSize: 14, color: COLORS.textMuted },
});
