import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator
} from 'react-native';
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';

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
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const checkSubmission = async () => {
        setLoading(true);
        if (!user) {
          setLoading(false);
          return;
        }
        try {
          const q = query(collection(db, 'ueq_responses'), where('userId', '==', user.uid));
          const snap = await getDocs(q);
          setHasSubmitted(!snap.empty);
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      };
      checkSubmission();
    }, [user])
  );

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
        { text: 'Kembali ke Beranda', onPress: () => navigation.navigate('Beranda') }
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

      {loading ? (
        <ActivityIndicator size="large" color="#2e7d32" style={{ marginTop: 40 }} />
      ) : hasSubmitted ? (
        <View style={styles.centerBox}>
          <Text style={styles.alreadySubmittedTitle}>Terima Kasih!</Text>
          <Text style={styles.alreadySubmittedDesc}>
            Anda sudah pernah mengisi kuesioner evaluasi ini sebelumnya. Tanggapan Anda telah kami rekap dengan aman.
          </Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('Beranda')}>
            <Text style={styles.backBtnText}>Kembali ke Beranda</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.desc}>Mohon luangkan waktu Anda menilai kesan penggunaan aplikasi ini. <Text style={{ fontWeight: 'bold' }}>Progres: {answered}/{UEQ_ITEMS.length} pertanyaan ({progressPct}%)</Text></Text>

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

        <View style={{ height: 100 }} />
      </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fcf9ee' // background
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: 20, 
    paddingTop: 50,
    backgroundColor: '#fcf9ee',
  },
  iconCircle: { 
    width: 40, 
    height: 40, 
    borderWidth: 2, 
    borderColor: '#01190a', // primary
    borderRadius: 20, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  headerTitle: { 
    fontSize: 17, 
    fontWeight: '800', 
    color: '#1c1c15' // on-background
  },
  scroll: { 
    flex: 1, 
    paddingHorizontal: 20 
  },
  desc: { 
    fontSize: 14, 
    color: '#424843', // on-surface-variant
    marginTop: 16, 
    marginBottom: 12, 
    lineHeight: 22,
    fontWeight: '600',
  },
  progressBg: { 
    height: 8, 
    backgroundColor: '#e5e2d8', // outline-variant lighter
    borderRadius: 4, 
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#01190a', // primary
  },
  progressFill: { 
    height: 4, 
    backgroundColor: '#b0ceb5', // primary-fixed
    borderRadius: 2,
    margin: 2,
  },
  dimGroup: { 
    marginBottom: 24 
  },
  dimTitle: { 
    fontSize: 14, 
    fontWeight: '800', 
    color: '#01190a', // primary
    backgroundColor: '#f1eee3', // surface-container
    padding: 14, 
    borderRadius: 12, 
    marginBottom: 12, 
    borderLeftWidth: 4, 
    borderLeftColor: '#01190a', // primary
    borderWidth: 2,
    borderColor: '#01190a', // primary
  },
  itemCard: { 
    backgroundColor: '#ffffff', 
    borderRadius: 16, 
    padding: 20, 
    marginBottom: 14, 
    borderWidth: 2, 
    borderColor: '#01190a' // primary
  },
  itemNum: { 
    fontSize: 12, 
    color: '#424843', // on-surface-variant
    marginBottom: 10,
    fontWeight: '700',
  },
  labelRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 16 
  },
  labelLeft: { 
    fontSize: 13, 
    fontWeight: '700', 
    color: '#1c1c15', // on-background
    flex: 1 
  },
  labelRight: { 
    fontSize: 13, 
    fontWeight: '700', 
    color: '#1c1c15', // on-background
    flex: 1, 
    textAlign: 'right' 
  },
  scaleRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 8 
  },
  scaleBtn: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    borderWidth: 2, 
    borderColor: '#01190a', // primary
    backgroundColor: '#f1eee3', // surface-container
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  scaleBtnActive: { 
    backgroundColor: '#142e1d', // primary-container
    // Neo-shadow
    shadowColor: '#000', 
    shadowOffset: { width: 2, height: 2 }, 
    shadowOpacity: 1, 
    shadowRadius: 0, 
    elevation: 4,
  },
  scaleTxt: { 
    fontSize: 14, 
    color: '#424843', // on-surface-variant
    fontWeight: '800' 
  },
  scaleTxtActive: { 
    color: '#cbead0' // primary-fixed
  },
  scaleLabels: { 
    flexDirection: 'row', 
    justifyContent: 'space-between' 
  },
  scaleLabel: { 
    fontSize: 10, 
    color: '#424843', // on-surface-variant
    fontWeight: '600',
  },
  submitBtn: { 
    backgroundColor: '#142e1d', // primary-container
    padding: 18, 
    borderRadius: 16, 
    alignItems: 'center', 
    marginTop: -4, 
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#01190a', // primary
    // Neo-shadow
    shadowColor: '#000', 
    shadowOffset: { width: 4, height: 4 }, 
    shadowOpacity: 1, 
    shadowRadius: 0, 
    elevation: 6,
  },
  submitText: { 
    color: '#cbead0', // primary-fixed
    fontWeight: '800', 
    fontSize: 17 
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  alreadySubmittedTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#142e1d',
    marginBottom: 12,
  },
  alreadySubmittedDesc: {
    fontSize: 14,
    color: '#424843',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  backBtn: {
    backgroundColor: '#142e1d',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  backBtnText: {
    color: '#cbead0',
    fontWeight: 'bold',
    fontSize: 15,
  }
});
