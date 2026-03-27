import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, StatusBar, Alert, ActivityIndicator, FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS } from '../../constants';
import useAuthStore from '../../store/authStore';
import useReportsStore from '../../store/reportsStore';

export default function ReportSubmitScreen() {
  const { profile } = useAuthStore();
  const { submitReport, isSubmitting } = useReportsStore();
  
  // Current form inputs
  const [clientName, setClientName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [callAction, setCallAction] = useState('Pick'); 
  const [reaction, setReaction] = useState('Accept'); 
  const [description, setDescription] = useState('');
  
  // Multi-client queue
  const [queue, setQueue] = useState([]);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!clientName.trim()) e.clientName = 'Required';
    if (!phoneNumber.trim()) e.phoneNumber = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const addToQueue = () => {
    if (!validate()) return;
    const newEntry = {
      id: Date.now().toString(),
      userId: profile.id,
      client_name: clientName.trim(),
      phone_number: phoneNumber.trim(),
      call_action: callAction,
      reaction: reaction,
      description: description.trim() || 'No notes',
    };
    setQueue([newEntry, ...queue]);
    
    // Reset form for next client
    setClientName('');
    setPhoneNumber('');
    setDescription('');
    setErrors({});
  };

  const removeFromQueue = (id) => {
    setQueue(queue.filter(item => item.id !== id));
  };

  const handleFinalSubmit = async () => {
    if (queue.length === 0) {
      Alert.alert('Empty Report', 'Please add at least one client call to the list first.');
      return;
    }

    try {
      await submitReport(queue); // Passing the array to our new bulk API
      Alert.alert('✅ Batch Submitted', `Successfully recorded ${queue.length} client calls.`, [
        { text: 'Great!', onPress: () => setQueue([]) },
      ]);
    } catch (err) {
      Alert.alert('Submission Failed', err.message || 'Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <LinearGradient colors={['#0A0F1E', '#111827']} style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Multi-Client Report</Text>
          <Text style={styles.headerSub}>Build your list and submit all at once</Text>
        </View>
        <View style={styles.counterBox}>
          <Text style={styles.counterText}>{queue.length}</Text>
          <Text style={styles.counterLabel}>QUEUED</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        
        {/* Input Form Section */}
        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Add New Client Call</Text>
          
          <View style={styles.inputRow}>
            <View style={{ flex: 1.2, marginRight: 10 }}>
              <Text style={styles.label}>Client Name *</Text>
              <TextInput
                style={[styles.smallInput, errors.clientName && styles.inputError]}
                placeholder="John Smith"
                placeholderTextColor={COLORS.textMuted}
                value={clientName}
                onChangeText={setClientName}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Phone *</Text>
              <TextInput
                style={[styles.smallInput, errors.phoneNumber && styles.inputError]}
                placeholder="9876543210"
                placeholderTextColor={COLORS.textMuted}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.toggleSection}>
            <View style={{ flex: 1 }}>
               <Text style={styles.label}>Call Action</Text>
               <View style={styles.miniToggle}>
                 {['Pick', 'Not Pick'].map(opt => (
                   <TouchableOpacity 
                    key={opt} 
                    onPress={() => setCallAction(opt)}
                    style={[styles.miniBtn, callAction === opt && styles.miniBtnActive]}
                   >
                     <Text style={[styles.miniBtnText, callAction === opt && styles.miniBtnTextActive]}>{opt}</Text>
                   </TouchableOpacity>
                 ))}
               </View>
            </View>
            <View style={{ flex: 1 }}>
               <Text style={styles.label}>Reaction</Text>
               <View style={styles.miniToggle}>
                 {['Accept', 'Not Accept'].map(opt => (
                   <TouchableOpacity 
                    key={opt} 
                    onPress={() => setReaction(opt)}
                    style={[styles.miniBtn, reaction === opt && (opt === 'Accept' ? styles.btnGreen : styles.btnRed)]}
                   >
                     <Text style={[styles.miniBtnText, reaction === opt && styles.miniBtnTextActive]}>{opt}</Text>
                   </TouchableOpacity>
                 ))}
               </View>
            </View>
          </View>

          <TouchableOpacity style={styles.addQueueBtn} onPress={addToQueue} activeOpacity={0.8}>
            <LinearGradient colors={COLORS.gradientPrimary} style={styles.addQueueBtnInner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Ionicons name="add-circle" size={18} color="#fff" />
              <Text style={styles.addQueueBtnText}>Add to Daily List</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Queue Display Section */}
        {queue.length > 0 && (
          <View style={styles.queueContainer}>
            <View style={styles.queueHeader}>
              <Text style={styles.queueTitle}>Clients in Today's Report</Text>
              <Text style={styles.queueSub}>Tap 'X' to remove any mistake</Text>
            </View>
            
            {queue.map((item) => (
              <View key={item.id} style={styles.queueItem}>
                <View style={styles.queueInfo}>
                  <Text style={styles.queueName}>{item.client_name}</Text>
                  <Text style={styles.queuePhone}>{item.phone_number} • {item.call_action} • {item.reaction}</Text>
                </View>
                <TouchableOpacity onPress={() => removeFromQueue(item.id)}>
                  <Ionicons name="close-circle" size={22} color={COLORS.danger} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Final Submission Button */}
        <TouchableOpacity 
          onPress={handleFinalSubmit} 
          disabled={isSubmitting || queue.length === 0} 
          activeOpacity={0.85}
          style={[styles.finalSubmitBox, (queue.length === 0) && { opacity: 0.5 }]}
        >
          <LinearGradient colors={COLORS.gradientSuccess} style={styles.finalSubmitBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View style={styles.finalSubmitInner}>
                <Ionicons name="cloud-upload" size={22} color="#fff" />
                <Text style={styles.finalSubmitText}>SUBMIT ALL ({queue.length}) CLIENTS</Text>
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
  header: { 
    paddingTop: 56, paddingBottom: 20, paddingHorizontal: 20, 
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
  },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
  counterBox: { backgroundColor: `${COLORS.primary}20`, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 14, alignItems: 'center', borderWidth: 1, borderColor: COLORS.primary },
  counterText: { fontSize: 18, fontWeight: '800', color: COLORS.primary },
  counterLabel: { fontSize: 8, color: COLORS.primary, fontWeight: '800' },
  body: { flex: 1, padding: 16 },
  formCard: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, padding: 16, borderWidth: 1, borderColor: COLORS.border, marginBottom: 20 },
  sectionTitle: { fontSize: 12, fontWeight: '800', color: COLORS.primary, textTransform: 'uppercase', marginBottom: 16, letterSpacing: 1 },
  label: { fontSize: 11, fontWeight: '700', color: COLORS.textMuted, marginBottom: 8, textTransform: 'uppercase' },
  inputRow: { flexDirection: 'row', marginBottom: 16 },
  smallInput: { backgroundColor: COLORS.bgInput, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 12, height: 46, color: '#fff', fontSize: 14 },
  inputError: { borderColor: COLORS.danger },
  toggleSection: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  miniToggle: { flexDirection: 'row', backgroundColor: COLORS.bgInput, borderRadius: 8, padding: 4, height: 40, borderWidth: 1, borderColor: COLORS.border },
  miniBtn: { flex: 1, justifyContent: 'center', alignItems: 'center', borderRadius: 6 },
  miniBtnActive: { backgroundColor: COLORS.primary },
  btnGreen: { backgroundColor: COLORS.success },
  btnRed: { backgroundColor: COLORS.danger },
  miniBtnText: { fontSize: 10, color: COLORS.textMuted, fontWeight: '700' },
  miniBtnTextActive: { color: '#fff' },
  addQueueBtn: { borderRadius: RADIUS.md, overflow: 'hidden' },
  addQueueBtnInner: { height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  addQueueBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  queueContainer: { marginTop: 10, marginBottom: 20 },
  queueHeader: { marginBottom: 12 },
  queueTitle: { fontSize: 15, fontWeight: '800', color: '#fff' },
  queueSub: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  queueItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgCard, padding: 14, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, marginBottom: 8 },
  queueInfo: { flex: 1 },
  queueName: { fontSize: 14, fontWeight: '700', color: '#fff' },
  queuePhone: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  finalSubmitBox: { marginTop: 10 },
  finalSubmitBtn: { height: 60, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center', shadowColor: COLORS.success, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  finalSubmitInner: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  finalSubmitText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
