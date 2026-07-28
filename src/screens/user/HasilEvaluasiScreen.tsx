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
  container: { 
    flex: 1, 
    backgroundColor: '#fcf9ee' // background
  },
  content: { 
    padding: 24, 
    alignItems: 'center', 
    paddingTop: 60 
  },
  iconCircle: { 
    width: 140, 
    height: 140, 
    borderRadius: 70, 
    borderWidth: 4, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 24, 
    backgroundColor: '#ffffff',
    // Neo-shadow
    shadowColor: '#000', 
    shadowOffset: { width: 5, height: 5 }, 
    shadowOpacity: 1, 
    shadowRadius: 0, 
    elevation: 8,
  },
  iconText: { 
    fontSize: 64, 
    fontWeight: '800' 
  },
  title: { 
    fontSize: 26, 
    fontWeight: '800', 
    color: '#1c1c15', // on-background
    marginBottom: 8 
  },
  subtitle: { 
    fontSize: 15, 
    color: '#424843', // on-surface-variant
    marginBottom: 32,
    fontWeight: '600',
  },
  scoreCard: { 
    width: '100%', 
    backgroundColor: '#ffffff', 
    borderWidth: 3, 
    borderRadius: 20, 
    padding: 28, 
    alignItems: 'center', 
    marginBottom: 24,
    // Neo-shadow
    shadowColor: '#000', 
    shadowOffset: { width: 4, height: 4 }, 
    shadowOpacity: 1, 
    shadowRadius: 0, 
    elevation: 6,
  },
  scoreLabel: { 
    fontSize: 15, 
    color: '#424843', // on-surface-variant
    marginBottom: 12,
    fontWeight: '700',
  },
  scoreValue: { 
    fontSize: 72, 
    fontWeight: '800', 
    marginBottom: 16 
  },
  badge: { 
    paddingHorizontal: 20, 
    paddingVertical: 10, 
    borderRadius: 12, 
    borderWidth: 2 
  },
  badgeText: { 
    fontWeight: '800', 
    fontSize: 15,
    letterSpacing: 0.5,
  },
  statsGrid: { 
    flexDirection: 'row', 
    gap: 12, 
    width: '100%', 
    marginBottom: 32 
  },
  statBox: { 
    flex: 1, 
    backgroundColor: '#ffffff', 
    borderWidth: 3, 
    borderRadius: 16, 
    padding: 20, 
    alignItems: 'center' 
  },
  statVal: { 
    fontSize: 32, 
    fontWeight: '800', 
    color: '#1c1c15' // on-background
  },
  statLabel: { 
    fontSize: 12, 
    color: '#424843', // on-surface-variant
    textAlign: 'center', 
    marginTop: 6,
    fontWeight: '700',
  },
  btnPrimary: { 
    width: '100%', 
    backgroundColor: '#142e1d', // primary-container
    padding: 18, 
    borderRadius: 16, 
    alignItems: 'center', 
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#01190a', // primary
    // Neo-shadow
    shadowColor: '#000', 
    shadowOffset: { width: 4, height: 4 }, 
    shadowOpacity: 1, 
    shadowRadius: 0, 
    elevation: 6,
  },
  btnPrimaryText: { 
    color: '#cbead0', // primary-fixed
    fontWeight: '800', 
    fontSize: 16 
  },
  btnOutline: { 
    width: '100%', 
    borderWidth: 2, 
    borderColor: '#01190a', // primary
    backgroundColor: '#ffffff',
    padding: 18, 
    borderRadius: 16, 
    alignItems: 'center', 
    marginBottom: 12 
  },
  btnOutlineText: { 
    color: '#01190a', // primary
    fontWeight: '800', 
    fontSize: 16 
  },
  btnGhost: { 
    width: '100%', 
    padding: 16, 
    alignItems: 'center' 
  },
  btnGhostText: { 
    color: '#424843', // on-surface-variant
    fontSize: 15,
    fontWeight: '700',
  },
});
