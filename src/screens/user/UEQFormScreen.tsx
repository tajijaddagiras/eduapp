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
  { id: 1,  question: 'Bagaimana kesan Anda saat menggunakan aplikasi bimbingan belajar ini secara keseluruhan?', left: 'menyusahkan', right: 'menyenangkan', dimension: 'attractiveness', reverse: false },
  { id: 2,  question: 'Seberapa mudah konten materi di aplikasi ini dapat Anda pahami?', left: 'tidak dapat dipahami', right: 'dapat dipahami', dimension: 'perspicuity', reverse: false },
  { id: 3,  question: 'Bagaimana Anda menilai kreativitas tampilan dan fitur-fitur yang tersedia di aplikasi ini?', left: 'monoton', right: 'kreatif', dimension: 'novelty', reverse: false },
  { id: 4,  question: 'Seberapa mudah Anda mempelajari cara menggunakan fitur-fitur di aplikasi ini?', left: 'sulit dipelajari', right: 'mudah dipelajari', dimension: 'perspicuity', reverse: false },
  { id: 5,  question: 'Bagaimana Anda menilai manfaat aplikasi ini untuk mendukung proses belajar Anda?', left: 'tidak bernilai', right: 'bernilai', dimension: 'stimulation', reverse: false },
  { id: 6,  question: 'Bagaimana perasaan Anda saat mengerjakan soal latihan di aplikasi ini?', left: 'membosankan', right: 'mengasyikkan', dimension: 'stimulation', reverse: false },
  { id: 7,  question: 'Bagaimana Anda menilai daya tarik konten belajar yang disajikan dalam aplikasi ini?', left: 'tidak menarik', right: 'menarik', dimension: 'stimulation', reverse: false },
  { id: 8,  question: 'Seberapa konsisten perilaku aplikasi ini saat Anda menggunakannya?', left: 'tidak dapat diprediksi', right: 'dapat diprediksi', dimension: 'dependability', reverse: false },
  { id: 9,  question: 'Bagaimana kecepatan respons aplikasi saat Anda berpindah menu atau mengakses materi?', left: 'lambat', right: 'cepat', dimension: 'efficiency', reverse: false },
  { id: 10, question: 'Bagaimana Anda menilai pendekatan baru yang ditawarkan aplikasi ini dalam proses belajar?', left: 'konvensional', right: 'berdaya cipta', dimension: 'novelty', reverse: false },
  { id: 11, question: 'Apakah fitur-fitur di aplikasi ini membantu atau justru menghambat aktivitas belajar Anda?', left: 'menghalangi', right: 'mendukung', dimension: 'dependability', reverse: false },
  { id: 12, question: 'Secara keseluruhan, bagaimana Anda menilai kualitas aplikasi bimbingan belajar ini?', left: 'buruk', right: 'baik', dimension: 'attractiveness', reverse: false },
  { id: 13, question: 'Bagaimana tingkat kerumitan antarmuka aplikasi ini menurut Anda?', left: 'rumit', right: 'sederhana', dimension: 'perspicuity', reverse: false },
  { id: 14, question: 'Bagaimana perasaan Anda setelah menggunakan aplikasi ini dalam sesi belajar?', left: 'tidak disukai', right: 'menggembirakan', dimension: 'attractiveness', reverse: false },
  { id: 15, question: 'Bagaimana Anda menilai keunggulan fitur aplikasi ini dibanding metode belajar konvensional?', left: 'biasa', right: 'inovatif', dimension: 'novelty', reverse: false },
  { id: 16, question: 'Bagaimana tingkat kenyamanan Anda saat menggunakan aplikasi ini dalam jangka waktu lama?', left: 'tidak nyaman', right: 'nyaman', dimension: 'attractiveness', reverse: false },
  { id: 17, question: 'Seberapa aman Anda merasa dalam menggunakan dan mempercayakan data belajar Anda di aplikasi ini?', left: 'tidak aman', right: 'aman', dimension: 'dependability', reverse: false },
  { id: 18, question: 'Apakah aplikasi ini memberikan dorongan semangat bagi Anda untuk terus belajar?', left: 'tidak memotivasi', right: 'memotivasi', dimension: 'stimulation', reverse: false },
  { id: 19, question: 'Apakah pengalaman belajar melalui aplikasi ini sesuai dengan harapan Anda?', left: 'tidak memenuhi ekspektasi', right: 'memenuhi ekspektasi', dimension: 'dependability', reverse: false },
  { id: 20, question: 'Bagaimana efisiensi Anda dalam menyelesaikan aktivitas belajar menggunakan aplikasi ini?', left: 'tidak efisien', right: 'efisien', dimension: 'efficiency', reverse: false },
  { id: 21, question: 'Seberapa jelas informasi dan instruksi yang tersedia di dalam aplikasi ini?', left: 'membingungkan', right: 'jelas', dimension: 'perspicuity', reverse: false },
  { id: 22, question: 'Seberapa praktis penggunaan aplikasi ini dalam mendukung kegiatan belajar sehari-hari?', left: 'tidak praktis', right: 'praktis', dimension: 'efficiency', reverse: false },
  { id: 23, question: 'Bagaimana tingkat keteraturan tampilan dan struktur menu di aplikasi ini?', left: 'berantakan', right: 'terorganisasi', dimension: 'efficiency', reverse: false },
  { id: 24, question: 'Bagaimana daya tarik tampilan visual aplikasi bimbingan belajar ini secara keseluruhan?', left: 'tidak menarik', right: 'menarik', dimension: 'attractiveness', reverse: false },
  { id: 25, question: 'Seberapa mudah aplikasi ini dioperasikan tanpa memerlukan panduan tambahan?', left: 'tidak ramah pengguna', right: 'ramah pengguna', dimension: 'attractiveness', reverse: false },
  { id: 26, question: 'Bagaimana Anda menilai kebaruan dan inovasi yang ditawarkan oleh aplikasi ini?', left: 'konservatif', right: 'inovatif', dimension: 'novelty', reverse: false },
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

        {/* Panduan Skala */}
        <View style={styles.guideBox}>
          <Text style={styles.guideTitle}>📖 Cara Mengisi Kuesioner</Text>
          <Text style={styles.guideDesc}>
            Setiap pertanyaan memiliki dua kata yang berlawanan di kiri dan kanan. Pilih angka yang paling mewakili pendapat Anda.
          </Text>
          <View style={styles.guideScaleRow}>
            <Text style={styles.guideScaleLabel}>Kata Kiri</Text>
            <View style={styles.guideScaleBubbles}>
              {['1','2','3','4','5','6','7'].map(n => (
                <View key={n} style={[styles.guideScaleBubble, n === '4' && styles.guideScaleBubbleNeutral]}>
                  <Text style={[styles.guideScaleNum, n === '4' && styles.guideScaleNumNeutral]}>{n}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.guideScaleLabel}>Kata Kanan</Text>
          </View>
          <View style={styles.guideLegend}>
            <Text style={styles.guideLegendItem}>🔴 <Text style={{fontWeight:'800'}}>1</Text> = Sangat negatif (sangat setuju kata kiri)</Text>
            <Text style={styles.guideLegendItem}>🟠 <Text style={{fontWeight:'800'}}>2</Text> = Negatif</Text>
            <Text style={styles.guideLegendItem}>🟡 <Text style={{fontWeight:'800'}}>3</Text> = Agak negatif</Text>
            <Text style={styles.guideLegendItem}>⚪ <Text style={{fontWeight:'800'}}>4</Text> = Netral (tidak memihak keduanya)</Text>
            <Text style={styles.guideLegendItem}>🔵 <Text style={{fontWeight:'800'}}>5</Text> = Agak positif</Text>
            <Text style={styles.guideLegendItem}>🟢 <Text style={{fontWeight:'800'}}>6</Text> = Positif</Text>
            <Text style={styles.guideLegendItem}>💚 <Text style={{fontWeight:'800'}}>7</Text> = Sangat positif (sangat setuju kata kanan)</Text>
          </View>
        </View>

        {/* Dimension Groups */}
        {Object.keys(DIMENSION_LABELS).map(dim => (
          <View key={dim} style={styles.dimGroup}>
            <Text style={styles.dimTitle}>{DIMENSION_LABELS[dim]}</Text>
            {UEQ_ITEMS.filter(i => i.dimension === dim).map(item => (
              <View key={item.id} style={styles.itemCard}>
                <Text style={styles.itemQuestion}>{item.question}</Text>
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
  guideBox: {
    backgroundColor: '#eaf4ec',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#01190a',
  },
  guideTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#01190a',
    marginBottom: 8,
  },
  guideDesc: {
    fontSize: 12,
    color: '#424843',
    lineHeight: 18,
    marginBottom: 12,
  },
  guideScaleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  guideScaleLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#01190a',
    flexShrink: 1,
  },
  guideScaleBubbles: {
    flexDirection: 'row',
    gap: 4,
    marginHorizontal: 6,
  },
  guideScaleBubble: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#01190a',
    backgroundColor: '#f1eee3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideScaleBubbleNeutral: {
    backgroundColor: '#142e1d',
  },
  guideScaleNum: {
    fontSize: 11,
    fontWeight: '800',
    color: '#424843',
  },
  guideScaleNumNeutral: {
    color: '#cbead0',
  },
  guideLegend: {
    gap: 4,
  },
  guideLegendItem: {
    fontSize: 12,
    color: '#1c1c15',
    lineHeight: 20,
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
  itemQuestion: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1c1c15',
    marginBottom: 14,
    lineHeight: 20,
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
