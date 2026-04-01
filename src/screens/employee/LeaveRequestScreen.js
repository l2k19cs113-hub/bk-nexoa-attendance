import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, StatusBar, Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { format, differenceInDays } from 'date-fns';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS, RADIUS } from '../../constants';
import useAuthStore from '../../store/authStore';
import { leavesApi } from '../../api';

export default function LeaveRequestScreen({ navigation }) {
  const { profile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [leaves, setLeaves] = useState([]);
  
  const [type, setType] = useState('Sick');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [reason, setReason] = useState('');
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const data = await leavesApi.getMyLeaves(profile.id);
      setLeaves(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleRequest = async () => {
    if (!reason.trim()) {
      Alert.alert('Error', 'Please provide a reason for leave.');
      return;
    }

    const totalDays = differenceInDays(endDate, startDate) + 1;
    if (totalDays <= 0) {
      Alert.alert('Error', 'End date must be after or on the start date.');
      return;
    }

    try {
      setSubmitting(true);
      await leavesApi.requestLeave({
        userId: profile.id,
        type,
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
        totalDays,
        reason: reason.trim(),
      });
      
      Alert.alert('Success', 'Leave request submitted successfully.');
      setReason('');
      fetchLeaves();
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const onDateChange = (event, selectedDate, isStart) => {
    if (isStart) {
      setShowStartPicker(Platform.OS === 'ios');
      if (selectedDate) setStartDate(selectedDate);
    } else {
      setShowEndPicker(Platform.OS === 'ios');
      if (selectedDate) setEndDate(selectedDate);
    }
  };

  const leaveTypes = ['Sick', 'Casual', 'Vacation', 'Unpaid'];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#0A0F1E', '#111827']} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Leave Request</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.label}>Leave Type</Text>
          <View style={styles.typeGrid}>
            {leaveTypes.map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.typeBtn, type === t && styles.typeBtnActive]}
                onPress={() => setType(t)}
              >
                <Text style={[styles.typeBtnText, type === t && styles.typeBtnTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.dateRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>From</Text>
              <TouchableOpacity style={styles.datePickerBtn} onPress={() => setShowStartPicker(true)}>
                <Ionicons name="calendar-outline" size={18} color={COLORS.primary} />
                <Text style={styles.datePickerText}>{format(startDate, 'MMM d, yyyy')}</Text>
              </TouchableOpacity>
            </View>
            <View style={{ width: 16 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>To</Text>
              <TouchableOpacity style={styles.datePickerBtn} onPress={() => setShowEndPicker(true)}>
                <Ionicons name="calendar-outline" size={18} color={COLORS.primary} />
                <Text style={styles.datePickerText}>{format(endDate, 'MMM d, yyyy')}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {showStartPicker && (
            <DateTimePicker
              value={startDate}
              mode="date"
              display="default"
              onChange={(e, d) => onDateChange(e, d, true)}
            />
          )}

          {showEndPicker && (
            <DateTimePicker
              value={endDate}
              mode="date"
              display="default"
              onChange={(e, d) => onDateChange(e, d, false)}
            />
          )}

          <Text style={styles.label}>Reason / Message</Text>
          <TextInput
            style={styles.reasonInput}
            placeholder="Why do you need leave?"
            placeholderTextColor={COLORS.textMuted}
            multiline
            numberOfLines={4}
            value={reason}
            onChangeText={setReason}
          />

          <TouchableOpacity 
            style={styles.submitBtn} 
            onPress={handleRequest}
            disabled={submitting}
          >
            <LinearGradient colors={COLORS.gradientPrimary} style={styles.btnGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Submit Request</Text>}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>My Requests</Text>
        {loading ? (
          <ActivityIndicator color={COLORS.primary} style={{ marginTop: 20 }} />
        ) : leaves.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="cafe-outline" size={40} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>No leave requests yet</Text>
          </View>
        ) : (
          leaves.map((item) => (
            <View key={item.id} style={styles.leaveItem}>
              <View style={styles.leaveHeader}>
                <View style={styles.leaveTypeBox}>
                  <Text style={styles.leaveTypeText}>{item.type}</Text>
                </View>
                <View style={[styles.statusBadge, { 
                  backgroundColor: item.status === 'approved' ? `${COLORS.success}20` : 
                                  item.status === 'rejected' ? `${COLORS.danger}20` : `${COLORS.warning}20` 
                }]}>
                  <Text style={[styles.statusText, { 
                    color: item.status === 'approved' ? COLORS.success : 
                           item.status === 'rejected' ? COLORS.danger : COLORS.warning 
                  }]}>
                    {item.status?.toUpperCase()}
                  </Text>
                </View>
              </View>
              <Text style={styles.leaveDates}>
                {format(new Date(item.start_date), 'MMM d')} - {format(new Date(item.end_date), 'MMM d, yyyy')} 
                <Text style={{ color: COLORS.textMuted }}> ({item.total_days} days)</Text>
              </Text>
              {item.reason && <Text style={styles.leaveReason} numberOfLines={2}>"{item.reason}"</Text>}
            </View>
          ))
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgDark },
  header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 16 },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#fff' },
  body: { flex: 1, padding: 16 },
  card: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl, padding: 20, borderWidth: 1, borderColor: COLORS.border, marginBottom: 24 },
  label: { color: COLORS.textMuted, fontSize: 13, fontWeight: '600', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  typeBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: RADIUS.md, backgroundColor: COLORS.bgInput, borderWidth: 1, borderColor: COLORS.border },
  typeBtnActive: { backgroundColor: `${COLORS.primary}20`, borderColor: COLORS.primary },
  typeBtnText: { color: COLORS.textMuted, fontSize: 14, fontWeight: '600' },
  typeBtnTextActive: { color: COLORS.primary },
  dateRow: { flexDirection: 'row', marginBottom: 20 },
  datePickerBtn: { flex: 1, height: 50, backgroundColor: COLORS.bgInput, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, gap: 8 },
  datePickerText: { color: '#fff', fontSize: 14, fontWeight: '500' },
  reasonInput: { backgroundColor: COLORS.bgInput, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, padding: 12, color: '#fff', fontSize: 15, height: 100, textAlignVertical: 'top', marginBottom: 24 },
  submitBtn: { height: 54, borderRadius: RADIUS.md, overflow: 'hidden' },
  btnGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#fff', marginBottom: 12 },
  leaveItem: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
  leaveHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  leaveTypeBox: { backgroundColor: `${COLORS.primary}15`, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  leaveTypeText: { color: COLORS.primary, fontSize: 12, fontWeight: '700' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: '900' },
  leaveDates: { fontSize: 15, fontWeight: '700', color: '#fff', marginBottom: 6 },
  leaveReason: { fontSize: 13, color: COLORS.textMuted, fontStyle: 'italic' },
  emptyCard: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl, padding: 40, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, gap: 10 },
  emptyText: { color: COLORS.textMuted, fontSize: 14 },
});
