import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, StatusBar, Alert, Modal, TextInput,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { COLORS, RADIUS } from '../../constants';
import { usersApi, authApi } from '../../api';

export default function EmployeeManagementScreen() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '' });
  const [adding, setAdding] = useState(false);

  const load = async () => {
    try {
      const data = await usersApi.getAllEmployees();
      setEmployees(data);
    } catch (err) {
      Alert.alert('Error', 'Could not load employees.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handleDelete = (employee) => {
    Alert.alert(
      'Delete Employee',
      `Remove ${employee.name} from the system?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            await usersApi.deleteEmployee(employee.id);
            setEmployees((prev) => prev.filter((e) => e.id !== employee.id));
          },
        },
      ]
    );
  };

  const handleAdd = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      Alert.alert('Missing Fields', 'Please fill all fields.'); return;
    }
    try {
      setAdding(true);
      await authApi.signUp({ ...newUser, role: 'employee' });
      setShowAddModal(false);
      setNewUser({ name: '', email: '', password: '' });
      await load();
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not add employee.');
    } finally {
      setAdding(false);
    }
  };

  const filtered = employees.filter(
    (e) => e.name?.toLowerCase().includes(search.toLowerCase()) ||
      e.email?.toLowerCase().includes(search.toLowerCase())
  );

  const renderEmployee = ({ item }) => (
    <View style={styles.row}>
      <LinearGradient colors={COLORS.gradientPrimary} style={styles.rowAvatar}>
        <Text style={styles.rowAvatarText}>{(item.name || 'U')[0].toUpperCase()}</Text>
      </LinearGradient>
      <View style={styles.rowInfo}>
        <Text style={styles.rowName}>{item.name}</Text>
        <Text style={styles.rowEmail}>{item.email}</Text>
        <Text style={styles.rowDate}>Joined {format(new Date(item.created_at), 'MMM d, yyyy')}</Text>
      </View>
      <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)}>
        <Ionicons name="trash-outline" size={16} color={COLORS.danger} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient colors={['#0A0F1E', '#111827']} style={styles.header}>
        <Text style={styles.headerTitle}>Employee Management</Text>
        <Text style={styles.headerSub}>{employees.length} team members</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddModal(true)}>
          <LinearGradient colors={COLORS.gradientPrimary} style={styles.addBtnInner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Ionicons name="person-add" size={16} color="#fff" />
            <Text style={styles.addBtnText}>Add Employee</Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>

      {/* Search */}
      <View style={styles.searchWrapper}>
        <Ionicons name="search" size={18} color={COLORS.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search employees..."
          placeholderTextColor={COLORS.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderEmployee}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>No employees found</Text>
            </View>
          }
        />
      )}

      {/* Add Modal */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Employee</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={22} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>
            {[
              { label: 'Full Name', key: 'name', icon: 'person-outline', placeholder: 'John Doe' },
              { label: 'Email', key: 'email', icon: 'mail-outline', placeholder: 'john@company.com', keyboard: 'email-address' },
              { label: 'Password', key: 'password', icon: 'lock-closed-outline', placeholder: 'Min 6 chars', secure: true },
            ].map(({ label, key, icon, placeholder, keyboard, secure }) => (
              <View key={key} style={styles.modalField}>
                <Text style={styles.modalLabel}>{label}</Text>
                <View style={styles.modalInput}>
                  <Ionicons name={icon} size={16} color={COLORS.textMuted} style={{ marginRight: 8 }} />
                  <TextInput
                    style={styles.modalInputText}
                    placeholder={placeholder}
                    placeholderTextColor={COLORS.textMuted}
                    value={newUser[key]}
                    onChangeText={(v) => setNewUser((u) => ({ ...u, [key]: v }))}
                    keyboardType={keyboard || 'default'}
                    autoCapitalize={keyboard === 'email-address' ? 'none' : 'words'}
                    secureTextEntry={secure}
                  />
                </View>
              </View>
            ))}
            <TouchableOpacity onPress={handleAdd} disabled={adding} activeOpacity={0.85}>
              <LinearGradient colors={COLORS.gradientPrimary} style={styles.modalBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                {adding ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalBtnText}>Add Employee</Text>}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgDark },
  header: { paddingTop: 56, paddingBottom: 20, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
  addBtn: { marginTop: 14, alignSelf: 'flex-start' },
  addBtnInner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: RADIUS.md,
  },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  searchWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.bgCard, margin: 16,
    borderRadius: RADIUS.md, paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: COLORS.border, gap: 10,
  },
  searchInput: { flex: 1, color: '#fff', fontSize: 14 },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  row: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg,
    padding: 14, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border,
  },
  rowAvatar: {
    width: 46, height: 46, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
  },
  rowAvatarText: { fontSize: 18, fontWeight: '700', color: '#fff' },
  rowInfo: { flex: 1, marginLeft: 12 },
  rowName: { fontSize: 15, fontWeight: '700', color: '#fff' },
  rowEmail: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  rowDate: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  deleteBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: `${COLORS.danger}15`,
    justifyContent: 'center', alignItems: 'center',
  },
  emptyState: { flex: 1, alignItems: 'center', paddingTop: 80, gap: 10 },
  emptyText: { fontSize: 14, color: COLORS.textMuted },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: COLORS.bgCard, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, borderTopWidth: 1, borderColor: COLORS.border,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  modalField: { marginBottom: 14 },
  modalLabel: { fontSize: 12, color: COLORS.textMuted, fontWeight: '600', marginBottom: 6 },
  modalInput: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.bgInput, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 12, height: 46,
  },
  modalInputText: { flex: 1, color: '#fff', fontSize: 14 },
  modalBtn: {
    height: 50, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center', marginTop: 8,
  },
  modalBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
