import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, Animated,
  Dimensions, StatusBar, Alert, ActivityIndicator, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants';
import useAuthStore from '../../store/authStore';

const { width, height } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  const { signIn } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const validate = () => {
    const newErr = {};
    if (!email.trim()) newErr.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErr.email = 'Enter a valid email';
    if (!password.trim()) newErr.password = 'Password is required';
    else if (password.length < 6) newErr.password = 'At least 6 characters';
    setErrors(newErr);
    return Object.keys(newErr).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) { shake(); return; }
    try {
      setLoading(true);
      await signIn(email.trim(), password);
    } catch (err) {
      shake();
      Alert.alert('Login Failed', err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0A0F1E', '#111827']} style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Decorative blobs */}
      <View style={styles.blob1} />
      <View style={styles.blob2} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.inner}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

           {/* Header */}
          <View style={styles.header}>
            <Image 
              source={require('../../../assets/app_brand_v6.png')} 
              style={styles.logoImage} 
              resizeMode="contain"
            />
            <Text style={styles.brand}>BK Nexora Tech</Text>
            <Text style={styles.subtitle}>Powering the Next Generation</Text>
          </View>

          {/* Card */}
          <Animated.View style={[styles.card, { transform: [{ translateX: shakeAnim }] }]}>
            <Text style={styles.welcomeText}>Welcome Back 👋</Text>
            <Text style={styles.signInText}>Sign in to your account</Text>

            {/* Email */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={[styles.inputWrapper, errors.email && styles.inputError]}>
                <Ionicons name="mail-outline" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="you@company.com"
                  placeholderTextColor={COLORS.textMuted}
                  value={email}
                  onChangeText={(v) => { setEmail(v); setErrors((e) => ({ ...e, email: null })); }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            {/* Password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={[styles.inputWrapper, errors.password && styles.inputError]}>
                <Ionicons name="lock-closed-outline" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Enter password"
                  placeholderTextColor={COLORS.textMuted}
                  value={password}
                  onChangeText={(v) => { setPassword(v); setErrors((e) => ({ ...e, password: null })); }}
                  secureTextEntry={!showPass}
                />
                <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                  <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color={COLORS.textMuted} />
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            {/* Forgot */}
            <TouchableOpacity style={styles.forgotRow} onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity onPress={handleLogin} disabled={loading} activeOpacity={0.85}>
              <LinearGradient colors={COLORS.gradientPrimary} style={styles.loginBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                {loading
                  ? <ActivityIndicator color="#fff" size="small" />
                  : (
                    <View style={styles.btnContent}>
                      <Text style={styles.loginBtnText}>Sign In</Text>
                      <Ionicons name="arrow-forward" size={18} color="#fff" />
                    </View>
                  )
                }
              </LinearGradient>
            </TouchableOpacity>

          </Animated.View>

          {/* Footer */}
          <Text style={styles.footer}>© 2026 BK Nexoa Tech • All rights reserved</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  blob1: {
    position: 'absolute', top: -60, right: -60,
    width: 220, height: 220, borderRadius: 110,
    backgroundColor: `${COLORS.primary}15`,
  },
  blob2: {
    position: 'absolute', bottom: 40, left: -80,
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: `${COLORS.secondary}10`,
  },
  inner: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24, paddingTop: 60 },
  header: { alignItems: 'center',    marginBottom: 40,
  },
  logoImage: {
    width: 120,
    height: 120,
    marginBottom: 10,
  },
  brand: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 1,
  },
  subtitle: { fontSize: 12, color: COLORS.primary, letterSpacing: 3, textTransform: 'uppercase', marginTop: 4 },
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    padding: 28,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  welcomeText: { fontSize: 22, fontWeight: '700', color: '#fff', marginBottom: 4 },
  signInText: { fontSize: 14, color: COLORS.textMuted, marginBottom: 28 },
  fieldGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.textHeading, marginBottom: 8 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.bgInput, borderRadius: RADIUS.md,
    borderWidth: 1.5, borderColor: COLORS.border, paddingHorizontal: 14, height: 52,
  },
  inputError: { borderColor: COLORS.danger },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: '#fff', fontSize: 14, height: '100%' },
  eyeBtn: { padding: 4 },
  errorText: { fontSize: 12, color: COLORS.danger, marginTop: 5 },
  forgotRow: { alignSelf: 'flex-end', marginBottom: 24 },
  forgotText: { color: COLORS.primary, fontSize: 13, fontWeight: '600' },
  loginBtn: {
    height: 54, borderRadius: RADIUS.md,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 10,
  },
  btnContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  loginBtnText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  dividerText: { color: COLORS.textMuted, fontSize: 12, marginHorizontal: 12 },
  registerRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  registerLabel: { color: COLORS.textMuted, fontSize: 14 },
  registerLink: { color: COLORS.primary, fontSize: 14, fontWeight: '700' },
  footer: { textAlign: 'center', color: COLORS.textMuted, fontSize: 11, marginTop: 32 },
});
