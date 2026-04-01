import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, StatusBar, Alert, ActivityIndicator, ScrollView, TextInput
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { COLORS, RADIUS } from '../../constants';
import { usersApi, attendanceApi, salariesApi } from '../../api';
import { generatePayslipPDF } from '../../utils/pdfGenerator';

export default function SalaryManagementScreen() {
  const [employees, setEmployees] = useState([]);
  const [salaries, setSalaries] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [generating, setGenerating] = useState(null);
  const [selectedForEdit, setSelectedForEdit] = useState(null);
  const [editValues, setEditValues] = useState({ bonus: '0', deduction: '0', base_salary: '0' });
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSettingBase, setIsSettingBase] = useState(false);

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const loadData = async () => {
    try {
      setLoading(true);
      const empData = await usersApi.getAllEmployees();
      setEmployees(empData);

      // Fetch existing salaries for this month
      const salaryRecords = await salariesApi.getCompanyReport(currentMonth, currentYear);
      const salaryMap = {};
      salaryRecords.forEach(s => { salaryMap[s.user_id] = s; });
      setSalaries(salaryMap);
    } catch (err) {
      Alert.alert('Error', 'Could not load data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleGenerateSalary = async (employee) => {
    if (!employee.base_salary || employee.base_salary === 0) {
      setSelectedForEdit(employee);
      setEditValues({ bonus: '0', deduction: '0', base_salary: '0' });
      setIsSettingBase(true);
      setShowEditModal(true);
      return;
    }

    try {
      setGenerating(employee.id);
      
      // Calculate attendance for the month
      const startDate = format(startOfMonth(new Date()), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(new Date()), 'yyyy-MM-dd');
      const attendance = await attendanceApi.getUserAttendance(employee.id, startDate, endDate);
      
      const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
      const presentDays = attendance.length;
      const absentDays = daysInMonth - presentDays;
      
      // Basic calculation: deduction for absences
      const dailyRate = employee.base_salary / daysInMonth;
      const deduction = Math.round(absentDays * dailyRate);
      
      const salaryRecord = await salariesApi.generateSalary({
        userId: employee.id,
        month: currentMonth,
        year: currentYear,
        baseSalary: employee.base_salary,
        absentDeduction: deduction,
        bonus: 0
      });

      setSalaries(prev => ({ ...prev, [employee.id]: salaryRecord }));
      Alert.alert('Success', `Salary generated for ${employee.name}`);
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setGenerating(null);
    }
  };

  const handleUpdateAdjustment = async () => {
    try {
      setLoading(true);
      const employee = selectedForEdit;
      
      // If we are setting the base salary for the first time
      if (isSettingBase) {
        const baseVal = Number(editValues.base_salary);
        await usersApi.updateProfile(employee.id, { base_salary: baseVal });
        // Update the local employees state to reflect the new base salary
        setEmployees(prev => prev.map(e => e.id === employee.id ? { ...e, base_salary: baseVal } : e));
      }

      const salaryRecord = await salariesApi.generateSalary({
        userId: employee.id,
        month: currentMonth,
        year: currentYear,
        baseSalary: Number(isSettingBase ? editValues.base_salary : employee.base_salary),
        absentDeduction: Number(editValues.deduction),
        bonus: Number(editValues.bonus)
      });
      setSalaries(prev => ({ ...prev, [employee.id]: salaryRecord }));
      setShowEditModal(false);
      setIsSettingBase(false);
      alert('Salary details saved successfully.');
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const openAdjustModal = (employee) => {
    const existing = salaries[employee.id];
    setSelectedForEdit(employee);
    setEditValues({
      bonus: existing?.bonus?.toString() || '0',
      deduction: existing?.absent_deduction?.toString() || '0',
      base_salary: employee.base_salary?.toString() || '0'
    });
    setIsSettingBase(false);
    setShowEditModal(true);
  };

  const handleViewPdf = async (employee) => {
    const salary = salaries[employee.id];
    if (!salary) return;
    try {
      setLoading(true);
      const startDate = format(startOfMonth(new Date()), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(new Date()), 'yyyy-MM-dd');
      const attendance = await attendanceApi.getUserAttendance(employee.id, startDate, endDate);
      await generatePayslipPDF(employee, salary, attendance);
    } catch (err) {
      Alert.alert('Error', 'Could not generate PDF');
    } finally {
      setLoading(false);
    }
  };

  const renderEmployee = ({ item }) => {
    const salary = salaries[item.id];
    const isGenerating = generating === item.id;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.empInfo}>
            <Text style={styles.empName}>{item.name}</Text>
            <Text style={styles.empDetail}>Base: ₹{item.base_salary || 0}</Text>
          </View>
          {salary ? (
            <View style={[styles.statusBadge, { backgroundColor: salary.status === 'paid' ? `${COLORS.success}20` : `${COLORS.warning}20` }]}>
              <Text style={[styles.statusText, { color: salary.status === 'paid' ? COLORS.success : COLORS.warning }]}>
                {salary.status.toUpperCase()}
              </Text>
            </View>
          ) : (
            <Text style={styles.noSalaryText}>Not Generated</Text>
          )}
        </View>

        {salary && (
          <View style={styles.salaryDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Absent Deduction:</Text>
              <Text style={styles.detailValue}>- ₹{salary.absent_deduction}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Net Salary:</Text>
              <Text style={[styles.detailValue, { color: COLORS.primary, fontWeight: '800' }]}>₹{salary.net_salary}</Text>
            </View>
          </View>
        )}

        <View style={styles.cardActions}>
          <TouchableOpacity 
            style={[styles.actionBtn, salary && styles.secondaryBtn, { flex: 2 }]} 
            onPress={() => handleGenerateSalary(item)}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name={salary ? "refresh-outline" : "calculator-outline"} size={16} color={salary ? COLORS.textMuted : "#fff"} />
                <Text style={[styles.actionBtnText, salary && { color: COLORS.textMuted }]}>{salary ? "Auto-Recalculate" : "Generate Salary"}</Text>
              </>
            )}
          </TouchableOpacity>
          {salary && (
             <>
               <TouchableOpacity style={styles.adjustBtn} onPress={() => openAdjustModal(item)}>
                 <Ionicons name="options-outline" size={18} color="#fff" />
               </TouchableOpacity>
               <TouchableOpacity style={styles.pdfBtn} onPress={() => handleViewPdf(item)}>
                 <Ionicons name="document-text-outline" size={18} color="#fff" />
               </TouchableOpacity>
             </>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#0A0F1E', '#111827']} style={styles.header}>
        <Text style={styles.headerTitle}>Salary Management</Text>
        <Text style={styles.headerSub}>{format(new Date(), 'MMMM yyyy')}</Text>
      </LinearGradient>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={employees}
          keyExtractor={(item) => item.id}
          renderItem={renderEmployee}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="cash-outline" size={48} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>No employees found to manage salary</Text>
            </View>
          }
        />
      )}

      {/* Adjustment Modal */}
      <View>
        {showEditModal && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    {isSettingBase ? `Set Base Salary: ${selectedForEdit?.name}` : `Adjust Salary: ${selectedForEdit?.name}`}
                  </Text>
                  <TouchableOpacity onPress={() => { setShowEditModal(false); setIsSettingBase(false); }}>
                    <Ionicons name="close" size={24} color={COLORS.textMuted} />
                  </TouchableOpacity>
                </View>
                
                {isSettingBase && (
                  <>
                    <Text style={styles.modalLabel}>Monthly Base Salary (₹)</Text>
                    <TextInput 
                      style={styles.modalInput} 
                      keyboardType="numeric" 
                      placeholder="e.g. 25000"
                      placeholderTextColor={COLORS.textMuted}
                      value={editValues.base_salary}
                      onChangeText={(v) => setEditValues(e => ({...e, base_salary: v}))}
                      autoFocus
                    />
                  </>
                )}

                {!isSettingBase && (
                  <>
                    <Text style={styles.modalLabel}>Performance Bonus (₹)</Text>
                    <TextInput 
                      style={styles.modalInput} 
                      keyboardType="numeric" 
                      value={editValues.bonus}
                      onChangeText={(v) => setEditValues(e => ({...e, bonus: v}))}
                    />

                    <Text style={styles.modalLabel}>Deductions / Penalties (₹)</Text>
                    <TextInput 
                      style={styles.modalInput} 
                      keyboardType="numeric" 
                      value={editValues.deduction}
                      onChangeText={(v) => setEditValues(e => ({...e, deduction: v}))}
                    />
                  </>
                )}

                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.modalCancel} onPress={() => { setShowEditModal(false); setIsSettingBase(false); }}>
                    <Text style={styles.modalCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.modalSave} onPress={handleUpdateAdjustment}>
                    <Text style={styles.modalSaveText}>{isSettingBase ? 'Set & Generate' : 'Save Adjustment'}</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
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
  list: { padding: 16, paddingBottom: 100 },
  card: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  empName: { fontSize: 16, fontWeight: '700', color: '#fff' },
  empDetail: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: '800' },
  noSalaryText: { fontSize: 12, color: COLORS.danger, fontWeight: '600' },
  salaryDetails: { backgroundColor: `${COLORS.bgDark}50`, padding: 12, borderRadius: RADIUS.md, marginBottom: 12 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  detailLabel: { fontSize: 12, color: COLORS.textMuted },
  detailValue: { fontSize: 12, color: '#fff', fontWeight: '600' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.primary, height: 44, borderRadius: RADIUS.md },
  secondaryBtn: { backgroundColor: COLORS.bgInput, borderWidth: 1, borderColor: COLORS.border },
  actionBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  cardActions: { flexDirection: 'row', gap: 8 },
  adjustBtn: { width: 44, height: 44, borderRadius: RADIUS.md, backgroundColor: COLORS.info, justifyContent: 'center', alignItems: 'center' },
  pdfBtn: { width: 44, height: 44, borderRadius: RADIUS.md, backgroundColor: COLORS.secondary, justifyContent: 'center', alignItems: 'center' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyState: { alignItems: 'center', marginTop: 100, gap: 10 },
  emptyText: { color: COLORS.textMuted, fontSize: 14 },
  modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalContent: { backgroundColor: COLORS.bgCard, width: '90%', maxHeight: '80%', borderRadius: RADIUS.xl, padding: 20, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: '700', flex: 1 },
  modalLabel: { color: COLORS.textMuted, fontSize: 12, marginBottom: 8 },
  modalInput: { backgroundColor: COLORS.bgInput, borderRadius: RADIUS.md, height: 48, paddingHorizontal: 12, color: '#fff', fontSize: 16, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 10 },
  modalCancel: { flex: 1, height: 48, justifyContent: 'center', alignItems: 'center', borderRadius: RADIUS.md, backgroundColor: COLORS.bgInput },
  modalCancelText: { color: COLORS.textMuted, fontWeight: '600' },
  modalSave: { flex: 2, height: 48, justifyContent: 'center', alignItems: 'center', borderRadius: RADIUS.md, backgroundColor: COLORS.primary },
  modalSaveText: { color: '#fff', fontWeight: '700' },
});
