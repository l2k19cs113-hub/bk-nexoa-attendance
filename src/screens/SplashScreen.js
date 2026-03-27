import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated, Dimensions, StatusBar, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, APP_NAME } from '../constants';

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const ring1Anim = useRef(new Animated.Value(0)).current;
  const ring2Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse rings
    const pulseRing = (anim, delay) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: 1, duration: 1200, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 400, useNativeDriver: true }),
        ])
      );
    };

    // Logo entrance
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();

    pulseRing(ring1Anim, 0).start();
    pulseRing(ring2Anim, 400).start();

    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 2800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient colors={['#0A0F1E', '#111827', '#0A0F1E']} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0F1E" />

      {/* Background decorative elements */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        {/* Pulse Rings */}
        <Animated.View style={[styles.ring, styles.ring2, {
          opacity: ring2Anim,
          transform: [{ scale: ring2Anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.8] }) }]
        }]} />
        <Animated.View style={[styles.ring, styles.ring1, {
          opacity: ring1Anim,
          transform: [{ scale: ring1Anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.5] }) }]
        }]} />

         {/* Logo Container */}
        <Animated.View style={styles.logoSquare}>
          <Image 
            source={require('../../assets/logo.png')} 
            style={styles.logoImage} 
            resizeMode="contain" 
          />
        </Animated.View>
      </Animated.View>

      <Animated.View style={[styles.textContainer, {
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }]}>
        <Text style={styles.title}>BK Nexora Tech</Text>
        <Text style={styles.subtitle}>Powering the Next Gen</Text>
        <View style={styles.divider} />
        <Text style={styles.tagline}>Track • Report • Excel</Text>
      </Animated.View>

      {/* Bottom */}
      <Animated.View style={[styles.bottomBadge, { opacity: fadeAnim }]}>
        <View style={styles.dotRow}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={[styles.dot, i === 1 && styles.dotActive]} />
          ))}
        </View>
        <Text style={styles.versionText}>v1.0.0</Text>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  bgCircle1: {
    position: 'absolute', top: -80, right: -80,
    width: 280, height: 280, borderRadius: 140,
    backgroundColor: `${COLORS.primary}15`,
  },
  bgCircle2: {
    position: 'absolute', bottom: -100, left: -60,
    width: 240, height: 240, borderRadius: 120,
    backgroundColor: `${COLORS.secondary}10`,
  },
  content: { alignItems: 'center', justifyContent: 'center' },
  ring: {
    position: 'absolute', borderRadius: 9999, borderWidth: 2,
    borderColor: `${COLORS.primary}40`,
  },
  ring1: { width: 130, height: 130 },
  ring2: { width: 130, height: 130, borderColor: `${COLORS.secondary}30` },
  logoSquare: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  textContainer: { alignItems: 'center', marginTop: 10 },
  title: {
    fontSize: 32, fontWeight: '900', color: COLORS.textLight,
    letterSpacing: 1, textAlign: 'center',
  },
  subtitle: {
    fontSize: 14, fontWeight: '600', color: COLORS.primary,
    letterSpacing: 4, textTransform: 'uppercase', marginTop: 10,
  },
  divider: {
    width: 60, height: 2, backgroundColor: COLORS.primary,
    borderRadius: 2, marginVertical: 20, opacity: 0.6,
  },
  tagline: {
    fontSize: 11, color: COLORS.textMuted, letterSpacing: 5,
    textTransform: 'uppercase',
  },
  bottomBadge: {
    position: 'absolute', bottom: 48, alignItems: 'center', gap: 10,
  },
  dotRow: { flexDirection: 'row', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.border },
  dotActive: { width: 18, backgroundColor: COLORS.primary },
  versionText: { fontSize: 11, color: COLORS.textMuted, letterSpacing: 1 },
});
