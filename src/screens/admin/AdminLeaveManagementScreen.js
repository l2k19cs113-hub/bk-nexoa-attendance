import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator, StatusBar, FlatList, RefreshControl
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { COLORS, RADIUS } from '../../constants';
import { leavesApi } from '../../api';

export default function AdminLeaveManagementScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [leaves, setLeaves] = useState([]);
  const [filter, setFilter] = useState('pending');

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const data = await leavesApi.getAllLeaves(filter);
      setLeaves(data);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to fetch leave requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [filter]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLeaves();
    setRefreshing(false);
  };

  const handleStatusUpdate = async (leaveId, status) => {
    try {
      setLoading(true);
      await leavesApi.updateLeaveStatus(leaveId, status);
      Alert.alert('Success', `Leave request ${status} successfully.`);
      fetchLeaves();
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.leaveCard}>
      <View style={styles.cardHeader}>
        <View style={styles.userRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.users?.name?.charAt(0).toUpperCase()}</Text>
          </View>
          <View>
            <Text style={styles.userName}>{item.users?.name}</Text>
            <Text style={styles.userDept}>{item.users?.department || 'Employee'}</Text>
          </View>
        </View>
        <View style={[styles.typeBadge, { backgroundColor: `${COLORS.primary}15` }]}>
          <Text style={styles.typeText}>{item.type}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.dateInfo}>
          <Ionicons name="calendar-outline" size={16} color={COLORS.textMuted} />
          <Text style={styles.dateText}>
            {format(new Date(item.start_date), 'MMM d')} - {format(new Date(item.end_date), 'MMM d, yyyy')}
            <Text style={{ fontWeight: '700', color: '#fff' }}> ({item.total_days} days)</Text>
          </Text>
        </View>
        {item.reason && (
          <View style={styles.reasonBox}>
            <Text style={styles.reasonLabel}>REASON:</Text>
            <Text style={styles.reasonText}>"{item.reason}"</Text>
          </View>
        )}
      </View>

      {item.status === 'pending' ? (
        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={[styles.actionBtn, styles.rejectBtn]} 
            onPress={() => handleStatusUpdate(item.id, 'rejected')}
          >
            <Ionicons name="close" size={20} color="#fff" />
            <Text style={styles.actionBtnText}>Reject</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionBtn, styles.approveBtn]} 
            onPress={() => handleStatusUpdate(item.id, 'approved')}
          >
            <Ionicons name="checkmark" size={20} color="#fff" />
            <Text style={styles.actionBtnText}>Approve</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.statusFooter}>
          <View style={[styles.finalBadge, { 
            backgroundColor: item.status === 'approved' ? `${COLORS.success}20` : `${COLORS.danger}20` 
          }]}>
            <Ionicons 
              name={item.status === 'approved' ? 'checkmark-circle' : 'close-circle'} 
              size={14} 
              color={item.status === 'approved' ? COLORS.success : COLORS.danger} 
            />
            <Text style={[styles.finalStatusText, { 
              color: item.status === 'approved' ? COLORS.success : COLORS.danger 
            }]}>
              {item.status.toUpperCase()}
            </Text>
          </View>
          {item.reviewed_at && (
            <Text style={styles.reviewedText}>Reviewed on: {format(new Date(item.reviewed_at), 'MMM d, hh:mm a')}</Text>
          )}
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <LinearGradient colors={['#0A0F1E', '#111827']} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Leave Management</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.filterRow}>
          {['pending', 'approved', 'rejected', 'all'].map((f) => (
            <TouchableOpacity 
              key={f} 
              style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      <FlatList
        data={leaves}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        ListEmptyComponent={
          loading ? null : (
            <View style={styles.emptyState}>
              <Ionicons name="documents-outline" size={60} color={COLORS.textMuted} />
              <Text style={styles.emptyTitle}>No Leave Requests</Text>
              <Text style={styles.emptySub}>Requests matching the filter will appear here.</Text>
            </View>
          )
        }
      />
      {loading && !refreshing && (
        <View style={styles.fullLoading}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgDark },
  header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 16 },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#fff' },
  filterRow: { flexDirection: 'row', gap: 8 },
  filterBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.bgInput, borderWidth: 1, borderColor: COLORS.border },
  filterBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterText: { color: COLORS.textMuted, fontSize: 12, fontWeight: '700' },
  filterTextActive: { color: '#fff' },
  list: { padding: 16, paddingBottom: 50 },
  leaveCard: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 },
  userRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  avatar: { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  userName: { color: '#fff', fontSize: 16, fontWeight: '700' },
  userDept: { color: COLORS.textMuted, fontSize: 12 },
  typeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  typeText: { color: COLORS.primary, fontSize: 11, fontWeight: '700' },
  cardBody: { marginBottom: 20 },
  dateInfo: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  dateText: { color: COLORS.textMuted, fontSize: 14 },
  reasonBox: { backgroundColor: COLORS.bgInput, padding: 12, borderRadius: RADIUS.md, marginTop: 4 },
  reasonLabel: { fontSize: 10, color: COLORS.textMuted, fontWeight: '800', marginBottom: 4, letterSpacing: 0.5 },
  reasonText: { color: '#ddd', fontSize: 13, lineHeight: 18, fontStyle: 'italic' },
  actionRow: { flexDirection: 'row', gap: 10 },
  actionBtn: { flex: 1, height: 45, borderRadius: RADIUS.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  rejectBtn: { backgroundColor: `${COLORS.danger}20`, borderWidth: 1, borderColor: COLORS.danger },
  approveBtn: { backgroundColor: COLORS.success },
  actionBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  statusFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 12 },
  finalBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  finalStatusText: { fontSize: 10, fontWeight: '900' },
  reviewedText: { fontSize: 11, color: COLORS.textMuted },
  emptyState: { padding: 40, alignItems: 'center', gap: 10 },
  emptyTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  emptySub: { color: COLORS.textMuted, fontSize: 13, textAlign: 'center' },
  fullLoading: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(10,15,30,0.7)', justifyContent: 'center', alignItems: 'center' },
});
