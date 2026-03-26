import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  StatusBar, Alert, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS } from '../../constants';
import { authApi } from '../../api';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async () => {
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }
    try {
      setLoading(true);
      await authApi.resetPassword(email.trim());
      setSent(true);
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0A0F1E', '#111827']} style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.blob} />

      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={20} color={COLORS.textMuted} />
      </TouchableOpacity>

      <View style={styles.content}>
        <LinearGradient colors={COLORS.gradientPrimary} style={styles.icon} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Ionicons name={sent ? 'checkmark' : 'key'} size={36} color="#fff" />
        </LinearGradient>

        <Text style={styles.title}>{sent ? 'Email Sent!' : 'Forgot Password?'}</Text>
        <Text style={styles.desc}>
          {sent
            ? `We've sent a password reset link to ${email}. Check your inbox.`
            : 'No worries! Enter your email and we\'ll send you a reset link.'}
        </Text>

        {!sent && (
          <View style={styles.card}>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={18} color={COLORS.textMuted} style={{ marginRight: 10 }} />
              <TextInput
                style={styles.input}
                placeholder="your@email.com"
                placeholderTextColor={COLORS.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity onPress={handleReset} disabled={loading} activeOpacity={0.85}>
              <LinearGradient colors={COLORS.gradientPrimary} style={styles.btn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.btnText}>Send Reset Link</Text>
                }
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {sent && (
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <LinearGradient colors={COLORS.gradientPrimary} style={[styles.btn, { marginTop: 24 }]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={styles.btnText}>Back to Login</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.backLink} onPress={() => navigation.navigate('Login')}>
          <Ionicons name="arrow-back" size={14} color={COLORS.primary} />
          <Text style={styles.backLinkText}>Back to Sign In</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24 },
  blob: {
    position: 'absolute', top: -50, right: -50,
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: `${COLORS.primary}15`,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12, marginTop: 56,
    backgroundColor: COLORS.bgCard, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 40 },
  icon: {
    width: 80, height: 80, borderRadius: 24,
    justifyContent: 'center', alignItems: 'center', marginBottom: 24,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4, shadowRadius: 16, elevation: 12,
  },
  title: { fontSize: 28, fontWeight: '800', color: '#fff', textAlign: 'center' },
  desc: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', marginTop: 10, lineHeight: 22, paddingHorizontal: 16 },
  card: { width: '100%', marginTop: 32 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md,
    borderWidth: 1.5, borderColor: COLORS.border, paddingHorizontal: 14, height: 52, marginBottom: 16,
  },
  input: { flex: 1, color: '#fff', fontSize: 14 },
  btn: {
    height: 52, borderRadius: RADIUS.md,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 10,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  backLink: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 24 },
  backLinkText: { color: COLORS.primary, fontWeight: '600' },
});
