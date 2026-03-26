import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, StatusBar, Alert, ActivityIndicator, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { COLORS, RADIUS } from '../../constants';
import useAuthStore from '../../store/authStore';
import useReportsStore from '../../store/reportsStore';

export default function ReportSubmitScreen() {
  const { profile } = useAuthStore();
  const { submitReport, isSubmitting } = useReportsStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [errors, setErrors] = useState({});

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setAttachment({ uri: result.assets[0].uri, type: 'image/jpeg', name: 'report.jpg' });
    }
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
    if (!result.canceled) {
      setAttachment({ uri: result.assets[0].uri, type: result.assets[0].mimeType, name: result.assets[0].name });
    }
  };

  const validate = () => {
    const e = {};
    if (!title.trim()) e.title = 'Title is required';
    if (!description.trim()) e.description = 'Description is required';
    if (description.trim().length < 20) e.description = 'Description is too short (min 20 characters)';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      await submitReport({
        userId: profile.id,
        title: title.trim(),
        description: description.trim(),
        fileUri: attachment?.uri || null,
        fileType: attachment?.type || null,
      });
      Alert.alert('✅ Report Submitted', 'Your daily report has been submitted for review.', [
        { text: 'OK', onPress: () => { setTitle(''); setDescription(''); setAttachment(null); } },
      ]);
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to submit report. Try again.');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <LinearGradient colors={['#0A0F1E', '#111827']} style={styles.header}>
        <Text style={styles.headerTitle}>Daily Report</Text>
        <Text style={styles.headerSub}>Document your work for today</Text>
      </LinearGradient>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        {/* Title */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Report Title *</Text>
          <View style={[styles.inputWrapper, errors.title && styles.inputError]}>
            <Ionicons name="document-text-outline" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="e.g. Frontend Module Development"
              placeholderTextColor={COLORS.textMuted}
              value={title}
              onChangeText={(v) => { setTitle(v); setErrors((e) => ({ ...e, title: null })); }}
            />
          </View>
          {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
        </View>

        {/* Description */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Work Description *</Text>
          <View style={[styles.textAreaWrapper, errors.description && styles.inputError]}>
            <TextInput
              style={styles.textArea}
              placeholder="Describe the tasks you completed today, challenges faced, and outcomes achieved..."
              placeholderTextColor={COLORS.textMuted}
              value={description}
              onChangeText={(v) => { setDescription(v); setErrors((e) => ({ ...e, description: null })); }}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
            <View style={styles.charCount}>
              <Text style={[styles.charCountText, description.length < 20 && styles.charCountWarn]}>
                {description.length} chars (min 20)
              </Text>
            </View>
          </View>
          {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
        </View>

        {/* Attachment */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Proof / Attachment (Optional)</Text>

          {attachment ? (
            <View style={styles.attachmentPreview}>
              {attachment.type?.startsWith('image/') ? (
                <Image source={{ uri: attachment.uri }} style={styles.previewImage} />
              ) : (
                <View style={styles.docPreview}>
                  <Ionicons name="document" size={32} color={COLORS.primary} />
                  <Text style={styles.docName} numberOfLines={1}>{attachment.name}</Text>
                </View>
              )}
              <TouchableOpacity style={styles.removeBtn} onPress={() => setAttachment(null)}>
                <Ionicons name="close-circle" size={24} color={COLORS.danger} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.uploadRow}>
              <TouchableOpacity style={styles.uploadBtn} onPress={pickImage}>
                <Ionicons name="image-outline" size={22} color={COLORS.primary} />
                <Text style={styles.uploadBtnText}>Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.uploadBtn} onPress={pickDocument}>
                <Ionicons name="document-outline" size={22} color={COLORS.secondary} />
                <Text style={[styles.uploadBtnText, { color: COLORS.secondary }]}>Document</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Submit */}
        <TouchableOpacity onPress={handleSubmit} disabled={isSubmitting} activeOpacity={0.85} style={{ marginTop: 8 }}>
          <LinearGradient colors={COLORS.gradientPrimary} style={styles.submitBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View style={styles.submitBtnInner}>
                <Ionicons name="send" size={18} color="#fff" />
                <Text style={styles.submitBtnText}>Submit Report</Text>
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.noteCard}>
          <Ionicons name="information-circle-outline" size={16} color={COLORS.primary} />
          <Text style={styles.noteText}>Your report will be reviewed by the admin and marked as approved or rejected.</Text>
        </View>

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
  label: { fontSize: 13, fontWeight: '600', color: '#CBD5E1', marginBottom: 8 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md,
    borderWidth: 1.5, borderColor: COLORS.border, paddingHorizontal: 14, height: 52,
  },
  inputIcon: { marginRight: 10 },
  input: { color: '#fff', fontSize: 14 },
  inputError: { borderColor: COLORS.danger },
  errorText: { fontSize: 12, color: COLORS.danger, marginTop: 5 },
  textAreaWrapper: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md,
    borderWidth: 1.5, borderColor: COLORS.border, padding: 14,
  },
  textArea: { color: '#fff', fontSize: 14, lineHeight: 22, minHeight: 120 },
  charCount: { alignItems: 'flex-end', marginTop: 6 },
  charCountText: { fontSize: 11, color: COLORS.textMuted },
  charCountWarn: { color: COLORS.warning },
  uploadRow: { flexDirection: 'row', gap: 12 },
  uploadBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md,
    borderWidth: 1.5, borderColor: COLORS.border, borderStyle: 'dashed', paddingVertical: 18,
  },
  uploadBtnText: { fontSize: 14, fontWeight: '600', color: COLORS.primary },
  attachmentPreview: {
    position: 'relative', backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border,
  },
  previewImage: { width: '100%', height: 160, resizeMode: 'cover' },
  docPreview: {
    padding: 20, flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  docName: { fontSize: 13, color: '#fff', flex: 1 },
  removeBtn: { position: 'absolute', top: 8, right: 8 },
  submitBtn: {
    height: 54, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center',
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 10,
  },
  submitBtnInner: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  noteCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: `${COLORS.primary}15`, borderRadius: RADIUS.md,
    padding: 14, marginTop: 16, borderWidth: 1, borderColor: `${COLORS.primary}30`,
  },
  noteText: { flex: 1, fontSize: 12, color: COLORS.textMuted, lineHeight: 18 },
});
