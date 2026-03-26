import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, StatusBar,
  Alert, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS } from '../../constants';
import useAuthStore from '../../store/authStore';

export default function SignupScreen({ navigation }) {
  const { signUp } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [role, setRole] = useState('employee');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = 'Name is required';
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) e.email = 'Valid email required';
    if (!password || password.length < 6) e.password = 'Min 6 characters';
    if (password !== confirmPwd) e.confirmPwd = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSignup = async () => {
    if (!validate()) return;
    try {
      setLoading(true);
      await signUp(name, email, password, role);
    } catch (err) {
      Alert.alert('Signup Failed', err.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ label, value, onChangeText, placeholder, secure, errorKey, icon, keyboardType, rightIcon, onRightPress }) => (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrapper, errors[errorKey] && styles.inputError]}>
        <Ionicons name={icon} size={18} color={COLORS.textMuted} style={{ marginRight: 10 }} />
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textMuted}
          value={value}
          onChangeText={(v) => { onChangeText(v); setErrors((er) => ({ ...er, [errorKey]: null })); }}
          secureTextEntry={secure}
          keyboardType={keyboardType || 'default'}
          autoCapitalize={keyboardType === 'email-address' ? 'none' : 'words'}
        />
        {rightIcon && (
          <TouchableOpacity onPress={onRightPress} style={{ padding: 4 }}>
            <Ionicons name={rightIcon} size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
      </View>
      {errors[errorKey] && <Text style={styles.errorText}>{errors[errorKey]}</Text>}
    </View>
  );

  return (
    <LinearGradient colors={['#0A0F1E', '#111827']} style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.blob1} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Back Button */}
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <LinearGradient colors={COLORS.gradientPrimary} style={styles.logoBox} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Ionicons name="person-add" size={28} color="#fff" />
            </LinearGradient>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join BK Nexoa Tech Team</Text>
          </View>

          {/* Form */}
          <View style={styles.card}>
            <Field label="Full Name" value={name} onChangeText={setName} placeholder="John Doe" errorKey="name" icon="person-outline" />
            <Field label="Email" value={email} onChangeText={setEmail} placeholder="you@company.com" errorKey="email" icon="mail-outline" keyboardType="email-address" />
            <Field label="Password" value={password} onChangeText={setPassword} placeholder="Min 6 characters" secure={!showPass} errorKey="password" icon="lock-closed-outline"
              rightIcon={showPass ? 'eye-off-outline' : 'eye-outline'} onRightPress={() => setShowPass(!showPass)} />
            <Field label="Confirm Password" value={confirmPwd} onChangeText={setConfirmPwd} placeholder="Re-enter password" secure={!showPass} errorKey="confirmPwd" icon="shield-checkmark-outline" />

            {/* Role selector */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Account Role</Text>
              <View style={styles.roleRow}>
                {['employee', 'admin'].map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={[styles.roleChip, role === r && styles.roleChipActive]}
                    onPress={() => setRole(r)}
                  >
                    <Ionicons
                      name={r === 'admin' ? 'shield-half' : 'briefcase'}
                      size={16}
                      color={role === r ? '#fff' : COLORS.textMuted}
                    />
                    <Text style={[styles.roleText, role === r && styles.roleTextActive]}>
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity onPress={handleSignup} disabled={loading} activeOpacity={0.85}>
              <LinearGradient colors={COLORS.gradientPrimary} style={styles.submitBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : (
                    <View style={styles.btnContent}>
                      <Text style={styles.submitText}>Create Account</Text>
                      <Ionicons name="checkmark-circle" size={18} color="#fff" />
                    </View>
                  )
                }
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.loginRow} onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLabel}>Already have an account? </Text>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  blob1: {
    position: 'absolute', top: -50, right: -50,
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: `${COLORS.primary}15`,
  },
  scroll: { flexGrow: 1, padding: 24, paddingTop: 56 },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: COLORS.bgCard, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.border, marginBottom: 20,
  },
  header: { alignItems: 'center', marginBottom: 28 },
  logoBox: {
    width: 64, height: 64, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 12, marginBottom: 12,
  },
  title: { fontSize: 26, fontWeight: '800', color: '#fff' },
  subtitle: { fontSize: 13, color: COLORS.textMuted, marginTop: 4 },
  card: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl,
    padding: 24, borderWidth: 1, borderColor: COLORS.border,
  },
  fieldGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#CBD5E1', marginBottom: 8 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.bgInput, borderRadius: RADIUS.md,
    borderWidth: 1.5, borderColor: COLORS.border, paddingHorizontal: 14, height: 50,
  },
  inputError: { borderColor: COLORS.danger },
  input: { color: '#fff', fontSize: 14 },
  errorText: { fontSize: 12, color: COLORS.danger, marginTop: 5 },
  roleRow: { flexDirection: 'row', gap: 12 },
  roleChip: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 12, borderRadius: RADIUS.md,
    backgroundColor: COLORS.bgInput, borderWidth: 1.5, borderColor: COLORS.border,
  },
  roleChipActive: {
    backgroundColor: COLORS.primary, borderColor: COLORS.primary,
  },
  roleText: { fontSize: 13, fontWeight: '600', color: COLORS.textMuted },
  roleTextActive: { color: '#fff' },
  submitBtn: {
    height: 52, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center',
    marginTop: 8,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 10,
  },
  btnContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  loginLabel: { color: COLORS.textMuted, fontSize: 14 },
  loginLink: { color: COLORS.primary, fontWeight: '700', fontSize: 14 },
});
