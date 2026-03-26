import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Alert, ActivityIndicator, TextInput, Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { format } from 'date-fns';
import { COLORS, RADIUS } from '../../constants';
import useAuthStore from '../../store/authStore';

export default function ProfileScreen() {
  const { profile, signOut, updateProfile } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile?.name || '');
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: signOut },
      ]
    );
  };

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('Error', 'Name cannot be empty'); return; }
    try {
      setLoading(true);
      await updateProfile({ name: name.trim() });
      setEditing(false);
      Alert.alert('✅ Profile Updated', 'Your name has been updated.');
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { icon: 'person-outline', label: 'Edit Profile', action: () => setEditing(true) },
    { icon: 'lock-closed-outline', label: 'Change Password', action: () => Alert.alert('Coming Soon', 'Password change will be available soon.') },
    { icon: 'notifications-outline', label: 'Notifications', action: null, toggle: true, value: notifications, onChange: setNotifications },
    { icon: 'moon-outline', label: 'Dark Mode', action: null, toggle: true, value: darkMode, onChange: setDarkMode },
    { icon: 'help-circle-outline', label: 'Help & Support', action: () => Alert.alert('Support', 'Contact: support@bknexoa.com') },
    { icon: 'information-circle-outline', label: 'About App', action: () => Alert.alert('BK Nexoa Tech Attendance', 'Version 1.0.0\n\nBuilt for teams that value productivity.') },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient colors={COLORS.gradientPrimary} style={styles.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            <Text style={styles.avatarText}>{(profile?.name || 'U')[0].toUpperCase()}</Text>
          </View>
          <TouchableOpacity style={styles.avatarEdit}>
            <Ionicons name="camera" size={14} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.profileName}>{profile?.name}</Text>
        <Text style={styles.profileEmail}>{profile?.email}</Text>
        <View style={styles.roleBadge}>
          <Ionicons name={profile?.role === 'admin' ? 'shield-half' : 'briefcase'} size={13} color="#fff" />
          <Text style={styles.roleText}>{profile?.role?.charAt(0).toUpperCase() + profile?.role?.slice(1)}</Text>
        </View>
        <Text style={styles.joinDate}>Member since {profile?.created_at ? format(new Date(profile.created_at), 'MMMM yyyy') : '--'}</Text>
      </LinearGradient>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        {/* Edit Name Panel */}
        {editing && (
          <View style={styles.editCard}>
            <Text style={styles.editTitle}>Edit Profile</Text>
            <View style={styles.editField}>
              <Ionicons name="person-outline" size={16} color={COLORS.textMuted} style={{ marginRight: 8 }} />
              <TextInput
                style={styles.editInput}
                value={name}
                onChangeText={setName}
                placeholder="Your full name"
                placeholderTextColor={COLORS.textMuted}
                autoFocus
              />
            </View>
            <View style={styles.editActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => { setEditing(false); setName(profile?.name || ''); }}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSave} disabled={loading} style={{ flex: 1 }}>
                <LinearGradient colors={COLORS.gradientPrimary} style={styles.saveBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  {loading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.saveBtnText}>Save</Text>}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Account Settings</Text>
          {menuItems.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.menuRow, i < menuItems.length - 1 && styles.menuRowBorder]}
              onPress={item.action}
              disabled={!item.action && !item.toggle}
              activeOpacity={item.action ? 0.7 : 1}
            >
              <View style={styles.menuLeft}>
                <View style={styles.menuIconBox}>
                  <Ionicons name={item.icon} size={18} color={COLORS.primary} />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
              </View>
              {item.toggle ? (
                <Switch
                  value={item.value}
                  onValueChange={item.onChange}
                  trackColor={{ false: COLORS.border, true: `${COLORS.primary}80` }}
                  thumbColor={item.value ? COLORS.primary : COLORS.textMuted}
                />
              ) : (
                <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Stats */}
        <View style={styles.statsCard}>
          <Text style={styles.menuSectionTitle}>Quick Stats</Text>
          <View style={styles.statsRow}>
            {[
              { label: 'Days Present', value: '--', icon: 'calendar-outline', color: COLORS.primary },
              { label: 'Reports Filed', value: '--', icon: 'document-text-outline', color: COLORS.success },
              { label: 'Approved', value: '--', icon: 'checkmark-circle-outline', color: COLORS.secondary },
            ].map((s) => (
              <View key={s.label} style={styles.statBox}>
                <Ionicons name={s.icon} size={18} color={s.color} />
                <Text style={[styles.statVal, { color: s.color }]}>{s.value}</Text>
                <Text style={styles.statLbl}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Sign Out */}
        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={18} color={COLORS.danger} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>BK Nexoa Tech Attendance • v1.0.0</Text>
        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgDark },
  header: {
    paddingTop: 56, paddingBottom: 28, alignItems: 'center',
    paddingHorizontal: 20,
  },
  avatarSection: { position: 'relative', marginBottom: 14 },
  avatarWrapper: {
    width: 88, height: 88, borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarText: { fontSize: 36, fontWeight: '800', color: '#fff' },
  avatarEdit: {
    position: 'absolute', bottom: -4, right: -4,
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center', alignItems: 'center',
  },
  profileName: { fontSize: 22, fontWeight: '800', color: '#fff' },
  profileEmail: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 3 },
  roleBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 99, marginTop: 10,
  },
  roleText: { fontSize: 12, color: '#fff', fontWeight: '700' },
  joinDate: { fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 8 },
  body: { flex: 1, padding: 16 },
  editCard: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg,
    padding: 16, borderWidth: 1, borderColor: COLORS.primary, marginBottom: 16,
  },
  editTitle: { fontSize: 15, fontWeight: '700', color: '#fff', marginBottom: 12 },
  editField: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.bgInput, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 12, height: 46, marginBottom: 12,
  },
  editInput: { flex: 1, color: '#fff', fontSize: 14 },
  editActions: { flexDirection: 'row', gap: 10 },
  cancelBtn: {
    flex: 1, height: 42, borderRadius: RADIUS.md,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.bgInput, borderWidth: 1, borderColor: COLORS.border,
  },
  cancelBtnText: { color: COLORS.textMuted, fontWeight: '600' },
  saveBtn: { height: 42, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center' },
  saveBtnText: { color: '#fff', fontWeight: '700' },
  menuSection: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: 16, overflow: 'hidden',
  },
  menuSectionTitle: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 4, textTransform: 'uppercase', letterSpacing: 1 },
  menuRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
  },
  menuRowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuIconBox: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: `${COLORS.primary}20`, justifyContent: 'center', alignItems: 'center',
  },
  menuLabel: { fontSize: 14, color: '#fff', fontWeight: '500' },
  statsCard: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl, borderWidth: 1, borderColor: COLORS.border, marginBottom: 16, paddingBottom: 14 },
  statsRow: { flexDirection: 'row', padding: 12, gap: 8 },
  statBox: { flex: 1, alignItems: 'center', gap: 4 },
  statVal: { fontSize: 20, fontWeight: '800' },
  statLbl: { fontSize: 10, color: COLORS.textMuted, textAlign: 'center' },
  signOutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: `${COLORS.danger}15`, borderRadius: RADIUS.lg,
    padding: 16, marginBottom: 16, borderWidth: 1, borderColor: `${COLORS.danger}30`,
  },
  signOutText: { fontSize: 15, fontWeight: '700', color: COLORS.danger },
  footer: { textAlign: 'center', fontSize: 11, color: COLORS.textMuted, marginBottom: 8 },
});
