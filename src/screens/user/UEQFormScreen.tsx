import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator
} from 'react-native';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';

// 26 Item UEQ Standar (Bahasa Indonesia)
const UEQ_ITEMS = [
  { id: 1, left: 'menyusahkan', right: 'menyenangkan', dimension: 'attractiveness', reverse: false },
  { id: 2, left: 'tidak dapat dipahami', right: 'dapat dipahami', dimension: 'perspicuity', reverse: false },
  { id: 3, left: 'kreatif', right: 'monoton', dimension: 'novelty', reverse: true },
  { id: 4, left: 'mudah dipelajari', right: 'sulit dipelajari', dimension: 'perspicuity', reverse: true },
  { id: 5, left: 'bernilai', right: 'tidak bernilai', dimension: 'stimulation', reverse: true },
  { id: 6, left: 'membosankan', right: 'mengasyikkan', dimension: 'stimulation', reverse: false },
  { id: 7, left: 'tidak menarik', right: 'menarik', dimension: 'stimulation', reverse: false },
  { id: 8, left: 'tidak dapat diprediksi', right: 'dapat diprediksi', dimension: 'dependability', reverse: false },
  { id: 9, left: 'cepat', right: 'lambat', dimension: 'efficiency', reverse: true },
  { id: 10, left: 'berdaya cipta', right: 'konvensional', dimension: 'novelty', reverse: true },
  { id: 11, left: 'menghalangi', right: 'mendukung', dimension: 'dependability', reverse: false },
  { id: 12, left: 'baik', right: 'buruk', dimension: 'attractiveness', reverse: true },
  { id: 13, left: 'rumit', right: 'sederhana', dimension: 'perspicuity', reverse: false },
  { id: 14, left: 'tidak disukai', right: 'menggembirakan', dimension: 'attractiveness', reverse: false },
  { id: 15, left: 'biasa', right: 'inovatif', dimension: 'novelty', reverse: false },
  { id: 16, left: 'tidak nyaman', right: 'nyaman', dimension: 'attractiveness', reverse: false },
  { id: 17, left: 'aman', right: 'tidak aman', dimension: 'dependability', reverse: true },
  { id: 18, left: 'memotivasi', right: 'tidak memotivasi', dimension: 'stimulation', reverse: true },
  { id: 19, left: 'memenuhi ekspektasi', right: 'tidak memenuhi ekspektasi', dimension: 'dependability', reverse: true },
  { id: 20, left: 'tidak efisien', right: 'efisien', dimension: 'efficiency', reverse: false },
  { id: 21, left: 'jelas', right: 'membingungkan', dimension: 'perspicuity', reverse: true },
  { id: 22, left: 'tidak praktis', right: 'praktis', dimension: 'efficiency', reverse: false },
  { id: 23, left: 'terorganisasi', right: 'berantakan', dimension: 'efficiency', reverse: true },
  { id: 24, left: 'menarik', right: 'tidak menarik', dimension: 'attractiveness', reverse: true },
  { id: 25, left: 'ramah pengguna', right: 'tidak ramah pengguna', dimension: 'attractiveness', reverse: true },
  { id: 26, left: 'konservatif', right: 'inovatif', dimension: 'novelty', reverse: false },
];

const DIMENSION_LABELS: Record<string, string> = {
  attractiveness: 'Daya Tarik (Attractiveness)',
  perspicuity: 'Kejelasan (Perspicuity)',
  efficiency: 'Efisiensi (Efficiency)',
  dependability: 'Keterpercayaan (Dependability)',
  stimulation: 'Stimulasi (Stimulation)',
  novelty: 'Kebaruan (Novelty)',
};

export default function UEQFormScreen({ navigation, route }: any) {
  const { score, totalItems, wrongAnswers } = route.params || { score: 0, totalItems: 0, wrongAnswers: [] };
  const { user } = useAuth();
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSelect = (itemId: number, val: number) => {
    setAnswers(prev => ({ ...prev, [itemId]: val }));
  };

  const calculateDimensions = () => {
    const dims: Record<string, number[]> = {
      attractiveness: [], perspicuity: [], efficiency: [],
      dependability: [], stimulation: [], novelty: []
    };
    UEQ_ITEMS.forEach(item => {
      const raw = answers[item.id];
      if (raw === undefined) return;
      // Convert 1-7 to -3 to +3
      const converted = raw - 4;
      // If reverse, flip the sign
      const final = item.reverse ? -converted : converted;
      dims[item.dimension].push(final);
    });
    const means: Record<string, number> = {};
    Object.entries(dims).forEach(([k, v]) => {
      means[k] = v.length > 0 ? parseFloat((v.reduce((a, b) => a + b, 0) / v.length).toFixed(2)) : 0;
    });
    return means;
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < UEQ_ITEMS.length) {
      Alert.alert('Belum Lengkap', `Harap isi semua ${UEQ_ITEMS.length} pertanyaan kuesioner. Anda baru mengisi ${Object.keys(answers).length} pertanyaan.`);
      return;
    }
    setSubmitting(true);
    try {
      const dimensions = calculateDimensions();
      await addDoc(collection(db, 'ueq_responses'), {
        userId: user?.uid || 'anonymous',
        answers,
        dimensions,
        simulasiScore: score,
        submittedAt: new Date(),
      });
      Alert.alert('Terima Kasih! 🎉', 'Kuesioner UEQ Anda berhasil disimpan. Data ini akan membantu penelitian kami!', [
        { text: 'Kembali ke Beranda', onPress: () => navigation.navigate('UserTabs') }
      ]);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Gagal menyimpan kuesioner. Coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  const answered = Object.keys(answers).length;
  const progressPct = Math.round((answered / UEQ_ITEMS.length) * 100);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconCircle}>
          <Text style={{ fontWeight: 'bold' }}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Evaluasi Aplikasi (UEQ)</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.desc}>
          Mohon luangkan waktu Anda menilai kesan penggunaan aplikasi ini.
          {'\n'}<Text style={{ fontWeight: 'bold' }}>Progres: {answered}/{UEQ_ITEMS.length} pertanyaan ({progressPct}%)</Text>
        </Text>

        {/* Progress Bar */}
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
        </View>

        {/* Dimension Groups */}
        {Object.keys(DIMENSION_LABELS).map(dim => (
          <View key={dim} style={styles.dimGroup}>
            <Text style={styles.dimTitle}>{DIMENSION_LABELS[dim]}</Text>
            {UEQ_ITEMS.filter(i => i.dimension === dim).map(item => (
              <View key={item.id} style={styles.itemCard}>
                <Text style={styles.itemNum}>Item {item.id}</Text>
                <View style={styles.labelRow}>
                  <Text style={styles.labelLeft}>{item.left}</Text>
                  <Text style={styles.labelRight}>{item.right}</Text>
                </View>
                <View style={styles.scaleRow}>
                  {[1, 2, 3, 4, 5, 6, 7].map(val => (
                    <TouchableOpacity
                      key={val}
                      style={[styles.scaleBtn, answers[item.id] === val && styles.scaleBtnActive]}
                      onPress={() => handleSelect(item.id, val)}
                    >
                      <Text style={[styles.scaleTxt, answers[item.id] === val && styles.scaleTxtActive]}>{val}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={styles.scaleLabels}>
                  <Text style={styles.scaleLabel}>Sangat Tidak Setuju</Text>
                  <Text style={styles.scaleLabel}>Sangat Setuju</Text>
                </View>
              </View>
            ))}
          </View>
        ))}

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={submitting}>
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>Submit Kuesioner UEQ</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: 50, borderBottomWidth: 1, borderBottomColor: '#e5e7eb', backgroundColor: '#fff' },
  iconCircle: { width: 32, height: 32, borderWidth: 2, borderColor: '#333', borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 15, fontWeight: 'bold', color: '#111827' },
  scroll: { flex: 1, paddingHorizontal: 20 },
  desc: { fontSize: 13, color: '#6b7280', marginTop: 16, marginBottom: 10, lineHeight: 20 },
  progressBg: { height: 8, backgroundColor: '#e5e7eb', borderRadius: 4, marginBottom: 20 },
  progressFill: { height: 8, backgroundColor: '#2e7d32', borderRadius: 4 },
  dimGroup: { marginBottom: 20 },
  dimTitle: { fontSize: 13, fontWeight: 'bold', color: '#2e7d32', backgroundColor: '#f0fdf4', padding: 10, borderRadius: 8, marginBottom: 10, borderLeftWidth: 3, borderLeftColor: '#2e7d32' },
  itemCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1.5, borderColor: '#e5e7eb' },
  itemNum: { fontSize: 11, color: '#9ca3af', marginBottom: 8 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  labelLeft: { fontSize: 12, fontWeight: 'bold', color: '#374151', flex: 1 },
  labelRight: { fontSize: 12, fontWeight: 'bold', color: '#374151', flex: 1, textAlign: 'right' },
  scaleRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  scaleBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, borderColor: '#d1d5db', backgroundColor: '#f9fafb', justifyContent: 'center', alignItems: 'center' },
  scaleBtnActive: { backgroundColor: '#2e7d32', borderColor: '#2e7d32' },
  scaleTxt: { fontSize: 13, color: '#6b7280', fontWeight: 'bold' },
  scaleTxtActive: { color: '#fff' },
  scaleLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  scaleLabel: { fontSize: 9, color: '#9ca3af' },
  submitBtn: { backgroundColor: '#2e7d32', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 20, marginBottom: 10 },
  submitText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});
