import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

interface WrongAnswer {
  name: string;
  userAnswer: string;
  correctAnswer: string;
}

export default function HasilEvaluasiScreen({ navigation, route }: any) {
  const { score, totalItems, correctCount, wrongAnswers, evaluasiName } = route.params || {
    score: 0, totalItems: 0, correctCount: 0, wrongAnswers: [], evaluasiName: 'Simulasi'
  };
  const lulus = score >= 60;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Icon Centang */}
        <View style={[styles.iconCircle, { borderColor: lulus ? '#2e7d32' : '#dc2626' }]}>
          <Text style={[styles.iconText, { color: lulus ? '#2e7d32' : '#dc2626' }]}>
            {lulus ? '✓' : '✗'}
          </Text>
        </View>

        <Text style={styles.title}>Evaluasi Selesai</Text>
        <Text style={styles.subtitle}>{evaluasiName}</Text>

        {/* Score Card */}
        <View style={[styles.scoreCard, { borderColor: lulus ? '#2e7d32' : '#dc2626' }]}>
          <Text style={styles.scoreLabel}>Nilai Akhir Anda</Text>
          <Text style={[styles.scoreValue, { color: lulus ? '#2e7d32' : '#dc2626' }]}>{score}</Text>
          <View style={[styles.badge, { backgroundColor: lulus ? '#f0fdf4' : '#fef2f2', borderColor: lulus ? '#2e7d32' : '#dc2626' }]}>
            <Text style={[styles.badgeText, { color: lulus ? '#2e7d32' : '#dc2626' }]}>
              {lulus ? 'LULUS EVALUASI' : 'BELUM LULUS'}
            </Text>
          </View>
        </View>

        {/* Statistik */}
        <View style={styles.statsGrid}>
          <View style={[styles.statBox, { borderColor: '#2e7d32' }]}>
            <Text style={[styles.statVal, { color: '#2e7d32' }]}>{correctCount}</Text>
            <Text style={styles.statLabel}>Jawaban Benar</Text>
          </View>
          <View style={[styles.statBox, { borderColor: '#dc2626', borderStyle: 'dashed' }]}>
            <Text style={[styles.statVal, { color: '#dc2626' }]}>{totalItems - correctCount}</Text>
            <Text style={styles.statLabel}>Kesalahan Pemilahan</Text>
          </View>
        </View>

        {/* Buttons */}
        {wrongAnswers && wrongAnswers.length > 0 && (
          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={() => navigation.navigate('Pembahasan', { wrongAnswers, evaluasiName })}
          >
            <Text style={styles.btnPrimaryText}>Lihat Riwayat Pembahasan</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.btnOutline}
          onPress={() => navigation.navigate('UEQForm', { score, totalItems, wrongAnswers })}
        >
          <Text style={styles.btnOutlineText}>Isi Kuesioner UEQ</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnGhost}
          onPress={() => navigation.navigate('UserTabs')}
        >
          <Text style={styles.btnGhostText}>Tutup & Kembali</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 24, alignItems: 'center', paddingTop: 60 },
  iconCircle: { width: 120, height: 120, borderRadius: 60, borderWidth: 4, justifyContent: 'center', alignItems: 'center', marginBottom: 20, backgroundColor: '#fff' },
  iconText: { fontSize: 56, fontWeight: 'bold' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#111827', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#6b7280', marginBottom: 30 },
  scoreCard: { width: '100%', backgroundColor: '#fff', borderWidth: 2, borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 20 },
  scoreLabel: { fontSize: 14, color: '#6b7280', marginBottom: 8 },
  scoreValue: { fontSize: 64, fontWeight: 'bold', marginBottom: 12 },
  badge: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, borderWidth: 1.5 },
  badgeText: { fontWeight: 'bold', fontSize: 14 },
  statsGrid: { flexDirection: 'row', gap: 12, width: '100%', marginBottom: 30 },
  statBox: { flex: 1, backgroundColor: '#fff', borderWidth: 2, borderRadius: 12, padding: 16, alignItems: 'center' },
  statVal: { fontSize: 28, fontWeight: 'bold', color: '#111827' },
  statLabel: { fontSize: 11, color: '#6b7280', textAlign: 'center', marginTop: 4 },
  btnPrimary: { width: '100%', backgroundColor: '#2e7d32', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 12 },
  btnPrimaryText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  btnOutline: { width: '100%', borderWidth: 2, borderColor: '#2e7d32', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 12 },
  btnOutlineText: { color: '#2e7d32', fontWeight: 'bold', fontSize: 16 },
  btnGhost: { width: '100%', padding: 16, alignItems: 'center' },
  btnGhostText: { color: '#6b7280', fontSize: 14 },
});
