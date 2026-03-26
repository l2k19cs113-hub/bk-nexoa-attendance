import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar,
  RefreshControl, TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { format, parseISO } from 'date-fns';
import { COLORS, RADIUS } from '../../constants';
import useAuthStore from '../../store/authStore';
import useAttendanceStore from '../../store/attendanceStore';

export default function AttendanceHistoryScreen() {
  const { profile } = useAuthStore();
  const { fetchHistory, history, isLoading } = useAttendanceStore();
  const [refreshing, setRefreshing] = useState(false);
  const [markedDates, setMarkedDates] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const load = async () => {
    if (!profile?.id) return;
    const data = await fetchHistory(profile.id);
    const marks = {};
    (data || []).forEach((rec) => {
      marks[rec.date] = {
        marked: true,
        dotColor: rec.check_out_time ? COLORS.success : COLORS.warning,
        selectedColor: COLORS.primary,
        customStyles: {
          container: { backgroundColor: rec.check_out_time ? `${COLORS.success}30` : `${COLORS.warning}30` },
          text: { color: '#fff', fontWeight: '700' },
        },
      };
    });
    setMarkedDates(marks);
  };

  useEffect(() => { load(); }, [profile?.id]);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const onDayPress = (day) => {
    setSelectedDate(day.dateString);
    const record = history.find((r) => r.date === day.dateString);
    setSelectedRecord(record || null);
  };

  const getDuration = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return null;
    const ms = new Date(checkOut) - new Date(checkIn);
    const hrs = Math.floor(ms / 3600000);
    const mins = Math.floor((ms % 3600000) / 60000);
    return `${hrs}h ${mins}m`;
  };

  const presentDays = history.filter((r) => r.check_in_time).length;
  const fullDays = history.filter((r) => r.check_in_time && r.check_out_time).length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <LinearGradient colors={['#0A0F1E', '#111827']} style={styles.header}>
        <Text style={styles.headerTitle}>Attendance History</Text>
        <Text style={styles.headerSub}>View your attendance calendar</Text>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        {/* Summary */}
        <View style={styles.summaryRow}>
          {[
            { label: 'Present Days', value: presentDays, icon: 'checkmark-circle', color: COLORS.success },
            { label: 'Completed', value: fullDays, icon: 'checkmark-done', color: COLORS.primary },
            { label: 'Total Logged', value: history.length, icon: 'calendar', color: COLORS.secondary },
          ].map((item) => (
            <View key={item.label} style={styles.summaryCard}>
              <View style={[styles.summaryIcon, { backgroundColor: `${item.color}20` }]}>
                <Ionicons name={item.icon} size={18} color={item.color} />
              </View>
              <Text style={[styles.summaryValue, { color: item.color }]}>{item.value}</Text>
              <Text style={styles.summaryLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* Calendar */}
        <View style={styles.calendarCard}>
          <Calendar
            markingType="custom"
            markedDates={{
              ...markedDates,
              ...(selectedDate ? { [selectedDate]: { ...markedDates[selectedDate], selected: true, selectedColor: COLORS.primary } } : {}),
            }}
            onDayPress={onDayPress}
            theme={{
              backgroundColor: COLORS.bgCard,
              calendarBackground: COLORS.bgCard,
              textSectionTitleColor: COLORS.textMuted,
              selectedDayBackgroundColor: COLORS.primary,
              selectedDayTextColor: '#fff',
              todayTextColor: COLORS.primary,
              dayTextColor: '#fff',
              textDisabledColor: COLORS.textMuted,
              dotColor: COLORS.success,
              selectedDotColor: '#fff',
              arrowColor: COLORS.primary,
              monthTextColor: '#fff',
              textMonthFontWeight: '700',
              textDayHeaderFontWeight: '600',
            }}
          />
        </View>

        {/* Legend */}
        <View style={styles.legendRow}>
          {[
            { color: COLORS.success, label: 'Full Day' },
            { color: COLORS.warning, label: 'Checked In Only' },
            { color: COLORS.primary, label: 'Selected' },
          ].map((item) => (
            <View key={item.label} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: item.color }]} />
              <Text style={styles.legendText}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* Selected Day Detail */}
        {selectedDate && (
          <View style={styles.detailCard}>
            <Text style={styles.detailDate}>{format(parseISO(selectedDate), 'EEEE, MMMM d, yyyy')}</Text>
            {selectedRecord ? (
              <View style={styles.detailContent}>
                <View style={styles.detailRow}>
                  <Ionicons name="log-in" size={16} color={COLORS.success} />
                  <Text style={styles.detailLabel}>Check In</Text>
                  <Text style={styles.detailValue}>
                    {selectedRecord.check_in_time ? format(new Date(selectedRecord.check_in_time), 'hh:mm a') : '--'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="log-out" size={16} color={COLORS.danger} />
                  <Text style={styles.detailLabel}>Check Out</Text>
                  <Text style={styles.detailValue}>
                    {selectedRecord.check_out_time ? format(new Date(selectedRecord.check_out_time), 'hh:mm a') : 'Not checked out'}
                  </Text>
                </View>
                {selectedRecord.check_in_time && selectedRecord.check_out_time && (
                  <View style={styles.detailRow}>
                    <Ionicons name="time" size={16} color={COLORS.primary} />
                    <Text style={styles.detailLabel}>Duration</Text>
                    <Text style={[styles.detailValue, { color: COLORS.primary }]}>
                      {getDuration(selectedRecord.check_in_time, selectedRecord.check_out_time)}
                    </Text>
                  </View>
                )}
                {selectedRecord.location && (
                  <View style={styles.detailRow}>
                    <Ionicons name="location" size={16} color={COLORS.secondary} />
                    <Text style={styles.detailLabel}>Location</Text>
                    <Text style={[styles.detailValue, { flex: 1 }]} numberOfLines={1}>{selectedRecord.location}</Text>
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.absentCard}>
                <Ionicons name="close-circle" size={28} color={COLORS.danger} />
                <Text style={styles.absentText}>No attendance recorded</Text>
              </View>
            )}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgDark },
  header: { paddingTop: 56, paddingBottom: 20, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
  summaryRow: { flexDirection: 'row', gap: 10, padding: 16 },
  summaryCard: {
    flex: 1, backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg,
    padding: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  summaryIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  summaryValue: { fontSize: 22, fontWeight: '800' },
  summaryLabel: { fontSize: 10, color: COLORS.textMuted, textAlign: 'center', marginTop: 3 },
  calendarCard: {
    marginHorizontal: 16, borderRadius: RADIUS.lg, overflow: 'hidden',
    borderWidth: 1, borderColor: COLORS.border,
  },
  legendRow: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginTop: 12, marginBottom: 4 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, color: COLORS.textMuted },
  detailCard: {
    margin: 16, backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg, padding: 16, borderWidth: 1, borderColor: COLORS.border,
  },
  detailDate: { fontSize: 15, fontWeight: '700', color: '#fff', marginBottom: 14 },
  detailContent: { gap: 12 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  detailLabel: { flex: 1, fontSize: 13, color: COLORS.textMuted },
  detailValue: { fontSize: 14, fontWeight: '700', color: '#fff' },
  absentCard: { alignItems: 'center', gap: 8, paddingVertical: 16 },
  absentText: { fontSize: 14, color: COLORS.textMuted },
});
