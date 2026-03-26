import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar,
  Animated, Alert, ActivityIndicator, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { format } from 'date-fns';
import { COLORS, RADIUS } from '../../constants';
import useAuthStore from '../../store/authStore';
import useAttendanceStore from '../../store/attendanceStore';

const { width } = Dimensions.get('window');

export default function AttendanceScreen() {
  const { profile } = useAuthStore();
  const { todayRecord, isCheckedIn, isCheckedOut, fetchTodayAttendance, checkIn, checkOut, isLoading } = useAttendanceStore();
  const [location, setLocation] = useState(null);
  const [locationText, setLocationText] = useState('Fetching location...');
  const [currentTime, setCurrentTime] = useState(new Date());
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const ringAnim = useRef(new Animated.Value(0)).current;

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Pulse animation
  useEffect(() => {
    if (isCheckedIn && !isCheckedOut) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.08, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [isCheckedIn, isCheckedOut]);

  // GPS location
  useEffect(() => {
    fetchTodayAttendance(profile?.id);
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') { setLocationText('Location permission denied'); return; }
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        setLocation(pos.coords);
        const [addr] = await Location.reverseGeocodeAsync(pos.coords);
        if (addr) {
          setLocationText(`${addr.street || ''} ${addr.city || addr.district || ''}, ${addr.region || ''}`);
        }
      } catch {
        setLocationText('Unable to get location');
      }
    })();
  }, [profile?.id]);

  const handleCheckIn = async () => {
    Alert.alert('Confirm Check-In', `Mark your attendance at ${format(new Date(), 'hh:mm a')}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Check In', onPress: async () => {
          try {
            await checkIn(profile.id, location ? { ...location, address: locationText } : null);
            Alert.alert('✅ Checked In!', `Attendance recorded at ${format(new Date(), 'hh:mm a')}`);
          } catch (err) {
            Alert.alert('Error', err.message);
          }
        },
      },
    ]);
  };

  const handleCheckOut = async () => {
    Alert.alert('Confirm Check-Out', 'End your work day?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Check Out', onPress: async () => {
          try {
            await checkOut(profile.id);
            Alert.alert('👋 Checked Out!', `See you tomorrow! Checkout at ${format(new Date(), 'hh:mm a')}`);
          } catch (err) {
            Alert.alert('Error', err.message);
          }
        },
      },
    ]);
  };

  const getButtonState = () => {
    if (isCheckedOut) return { label: 'Day Complete', icon: 'checkmark-done', gradient: COLORS.gradientSecondary, disabled: true };
    if (isCheckedIn) return { label: 'Check Out', icon: 'log-out-outline', gradient: COLORS.gradientDanger, disabled: false };
    return { label: 'Check In', icon: 'finger-print', gradient: COLORS.gradientSuccess, disabled: false };
  };

  const btn = getButtonState();

  const getDuration = () => {
    if (!todayRecord?.check_in_time) return null;
    const end = todayRecord.check_out_time ? new Date(todayRecord.check_out_time) : new Date();
    const ms = end - new Date(todayRecord.check_in_time);
    const hrs = Math.floor(ms / 3600000);
    const mins = Math.floor((ms % 3600000) / 60000);
    return `${hrs}h ${mins}m`;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient colors={['#0A0F1E', '#111827']} style={styles.header}>
        <Text style={styles.headerTitle}>Attendance</Text>
        <Text style={styles.headerSub}>{format(new Date(), 'EEEE, MMMM d')}</Text>
      </LinearGradient>

      <View style={styles.body}>
        {/* Clock */}
        <View style={styles.clockCard}>
          <LinearGradient colors={COLORS.gradientPrimary} style={styles.clockBg} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Text style={styles.clockTime}>{format(currentTime, 'hh:mm')}</Text>
            <Text style={styles.clockSec}>{format(currentTime, ':ss a')}</Text>
            <Text style={styles.clockDate}>{format(currentTime, 'EEEE, MMM d, yyyy')}</Text>
          </LinearGradient>
        </View>

        {/* Check-in/out times */}
        {todayRecord && (
          <View style={styles.timesRow}>
            <View style={styles.timeBox}>
              <Ionicons name="log-in" size={18} color={COLORS.success} />
              <Text style={styles.timeBoxLabel}>Check In</Text>
              <Text style={styles.timeBoxValue}>
                {todayRecord.check_in_time ? format(new Date(todayRecord.check_in_time), 'hh:mm a') : '--:--'}
              </Text>
            </View>
            <View style={styles.durationBox}>
              <Text style={styles.durationValue}>{getDuration() || '--'}</Text>
              <Text style={styles.durationLabel}>Duration</Text>
            </View>
            <View style={styles.timeBox}>
              <Ionicons name="log-out" size={18} color={COLORS.danger} />
              <Text style={styles.timeBoxLabel}>Check Out</Text>
              <Text style={styles.timeBoxValue}>
                {todayRecord.check_out_time ? format(new Date(todayRecord.check_out_time), 'hh:mm a') : '--:--'}
              </Text>
            </View>
          </View>
        )}

        {/* Location */}
        <View style={styles.locationCard}>
          <Ionicons name="location" size={16} color={COLORS.primary} />
          <Text style={styles.locationText} numberOfLines={1}>{locationText}</Text>
        </View>

        {/* Main Button */}
        <Animated.View style={[styles.btnContainer, { transform: [{ scale: pulseAnim }] }]}>
          <TouchableOpacity
            disabled={btn.disabled || isLoading}
            onPress={isCheckedIn ? handleCheckOut : handleCheckIn}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={btn.gradient}
              style={styles.mainBtn}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {isLoading
                ? <ActivityIndicator size="large" color="#fff" />
                : (
                  <>
                    <View style={styles.mainBtnIcon}>
                      <Ionicons name={btn.icon} size={40} color="#fff" />
                    </View>
                    <Text style={styles.mainBtnText}>{btn.label}</Text>
                  </>
                )
              }
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {isCheckedOut && (
          <View style={styles.completeBanner}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
            <Text style={styles.completeBannerText}>Great work today! See you tomorrow 🎉</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgDark },
  header: { paddingTop: 56, paddingBottom: 20, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
  body: { flex: 1, padding: 20, alignItems: 'center' },
  clockCard: { width: '100%', borderRadius: RADIUS.xl, overflow: 'hidden', marginBottom: 20 },
  clockBg: { padding: 24, alignItems: 'center' },
  clockTime: { fontSize: 54, fontWeight: '800', color: '#fff', letterSpacing: 2 },
  clockSec: { fontSize: 18, fontWeight: '400', color: 'rgba(255,255,255,0.7)', marginTop: -4 },
  clockDate: { fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 8 },
  timesRow: {
    flexDirection: 'row', width: '100%',
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: 14,
  },
  timeBox: { flex: 1, alignItems: 'center', padding: 14, gap: 4 },
  timeBoxLabel: { fontSize: 11, color: COLORS.textMuted },
  timeBoxValue: { fontSize: 16, fontWeight: '700', color: '#fff' },
  durationBox: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    borderLeftWidth: 1, borderRightWidth: 1, borderColor: COLORS.border, padding: 14,
  },
  durationValue: { fontSize: 20, fontWeight: '800', color: COLORS.primary },
  durationLabel: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  locationCard: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: COLORS.bgCard, width: '100%',
    borderRadius: RADIUS.md, padding: 12, borderWidth: 1, borderColor: COLORS.border, marginBottom: 32,
  },
  locationText: { fontSize: 13, color: COLORS.textMuted, flex: 1 },
  btnContainer: { alignItems: 'center' },
  mainBtn: {
    width: 180, height: 180, borderRadius: 90,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5, shadowRadius: 24, elevation: 20,
    gap: 8,
  },
  mainBtnIcon: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  mainBtnText: { fontSize: 16, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  completeBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginTop: 24, backgroundColor: `${COLORS.success}15`,
    borderRadius: RADIUS.md, padding: 14, borderWidth: 1, borderColor: `${COLORS.success}40`,
  },
  completeBannerText: { fontSize: 13, color: COLORS.success, fontWeight: '600' },
});
