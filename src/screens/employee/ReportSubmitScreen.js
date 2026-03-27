import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, StatusBar, Alert, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS } from '../../constants';
import useAuthStore from '../../store/authStore';
import useReportsStore from '../../store/reportsStore';

export default function ReportSubmitScreen() {
  const { profile } = useAuthStore();
  const { submitReport, isSubmitting } = useReportsStore();
  
  const [clientName, setClientName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [callAction, setCallAction] = useState('Pick'); // Pick / Not Pick
  const [reaction, setReaction] = useState('Accept'); // Accept / Not Accept
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!clientName.trim()) e.clientName = 'Client name is required';
    if (!phoneNumber.trim()) e.phoneNumber = 'Phone number is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      await submitReport({
        userId: profile.id,
        client_name: clientName.trim(),
        phone_number: phoneNumber.trim(),
        call_action: callAction,
        reaction: reaction,
        description: description.trim() || 'No additional notes',
      });
      Alert.alert('✅ Work Recorded', 'Call details updated successfully.', [
        { text: 'OK', onPress: () => { setClientName(''); setPhoneNumber(''); setDescription(''); } },
      ]);
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to submit report. Try again.');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <LinearGradient colors={['#0A0F1E', '#111827']} style={styles.header}>
        <Text style={styles.headerTitle}>Daily Work Report</Text>
        <Text style={styles.headerSub}>Log every client call here</Text>
      </LinearGradient>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        {/* Client Name */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Client Name *</Text>
          <View style={[styles.inputWrapper, errors.clientName && styles.inputError]}>
            <Ionicons name="person-outline" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="e.g. John Smith"
              placeholderTextColor={COLORS.textMuted}
              value={clientName}
              onChangeText={setClientName}
            />
          </View>
        </View>

        {/* Phone Number */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Phone Number *</Text>
          <View style={[styles.inputWrapper, errors.phoneNumber && styles.inputError]}>
            <Ionicons name="call-outline" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="e.g. 9876543210"
              placeholderTextColor={COLORS.textMuted}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Call Action Selector */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Call Action</Text>
          <View style={styles.toggleRow}>
            {['Pick', 'Not Pick'].map((opt) => (
              <TouchableOpacity
                key={opt}
                onPress={() => setCallAction(opt)}
                style={[styles.toggleBtn, callAction === opt && styles.toggleBtnActive]}
                activeOpacity={0.8}
              >
                <Text style={[styles.toggleText, callAction === opt && styles.toggleTextActive]}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Reaction Selector */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Reaction Status</Text>
          <View style={styles.toggleRow}>
            {['Accept', 'Not Accept'].map((opt) => (
              <TouchableOpacity
                key={opt}
                onPress={() => setReaction(opt)}
                style={[styles.toggleBtn, reaction === opt && (opt === 'Accept' ? styles.btnGreen : styles.btnRed)]}
                activeOpacity={0.8}
              >
                <Text style={[styles.toggleText, reaction === opt && styles.toggleTextActive]}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Work Description / Notes */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Work Description (Notes)</Text>
          <View style={styles.textAreaWrapper}>
            <TextInput
              style={styles.textArea}
              placeholder="Any specific notes about the call..."
              placeholderTextColor={COLORS.textMuted}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Submit */}
        <TouchableOpacity onPress={handleSubmit} disabled={isSubmitting} activeOpacity={0.85} style={{ marginTop: 10 }}>
          <LinearGradient colors={COLORS.gradientPrimary} style={styles.submitBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View style={styles.submitBtnInner}>
                <Ionicons name="save-outline" size={20} color="#fff" />
                <Text style={styles.submitBtnText}>Record & Save</Text>
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>

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
  body: { flex: 1, padding: 16 },
  fieldGroup: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '700', color: COLORS.textMuted, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: COLORS.border, paddingHorizontal: 14, height: 54,
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, color: '#fff', fontSize: 15 },
  inputError: { borderColor: COLORS.danger },
  toggleRow: { flexDirection: 'row', gap: 12 },
  toggleBtn: {
    flex: 1, height: 48, borderRadius: RADIUS.md, backgroundColor: COLORS.bgCard,
    justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.border,
  },
  toggleBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  btnGreen: { backgroundColor: COLORS.success, borderColor: COLORS.success },
  btnRed: { backgroundColor: COLORS.danger, borderColor: COLORS.danger },
  toggleText: { color: COLORS.textMuted, fontSize: 14, fontWeight: '700' },
  toggleTextActive: { color: '#fff' },
  textAreaWrapper: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: COLORS.border, padding: 14 },
  textArea: { color: '#fff', fontSize: 14, lineHeight: 22, minHeight: 100 },
  submitBtn: { height: 56, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  submitBtnInner: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  submitBtnText: { color: '#fff', fontSize: 17, fontWeight: '800' },
});
