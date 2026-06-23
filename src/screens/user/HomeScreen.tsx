import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function HomeScreen({ navigation }: any) {
  const { userData, user } = useAuth();
  const [totalMateri, setTotalMateri] = useState(0);
  const [materiSelesai, setMateriSelesai] = useState(0);
  const [simulasiSelesai, setSimulasiSelesai] = useState(0);
  const [rataRataSkor, setRataRataSkor] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      try {
        // Get total materi count
        const materiSnap = await getDocs(collection(db, 'materi'));
        setTotalMateri(materiSnap.size);

        // Get user progress
        const progressQ = query(collection(db, 'progress'), where('userId', '==', user.uid));
        const progressSnap = await getDocs(progressQ);
        let totalSkor = 0;
        let simCount = 0;
        progressSnap.forEach(doc => {
          const d = doc.data();
          if (d.score) { totalSkor += d.score; simCount++; }
        });
        setSimulasiSelesai(simCount);
        if (simCount > 0) setRataRataSkor(Math.round(totalSkor / simCount));

        // Get read materi
        const readQ = query(collection(db, 'progress'), where('userId', '==', user.uid), where('type', '==', 'materi'));
        const readSnap = await getDocs(readQ);
        setMateriSelesai(readSnap.size);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user]);

  const progressPct = totalMateri > 0 ? Math.round((materiSelesai / totalMateri) * 100) : 0;

  return (
    <View style={styles.wrapper}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {userData?.name ? userData.name[0].toUpperCase() : 'U'}
              </Text>
            </View>
            <View>
              <Text style={styles.greet}>Hai, {userData?.name?.split(' ')[0] || 'Pengguna'}!</Text>
              <Text style={styles.greetSub}>Semangat belajar hari ini</Text>
            </View>
          </View>
        </View>

        {/* Progress Block */}
        <Text style={styles.sectionTitle}>Progres Materi Edukasi</Text>
        <View style={styles.progressCard}>
          {loading ? <ActivityIndicator color="#2e7d32" /> : (
            <>
              <View style={styles.progressRow}>
                <Text style={styles.progressCount}>{materiSelesai} / {totalMateri} Modul</Text>
                <Text style={styles.progressPct}>{progressPct}% Selesai</Text>
              </View>
              <View style={styles.progressBg}>
                <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
              </View>
            </>
          )}
        </View>

        {/* Statistik */}
        <Text style={styles.sectionTitle}>Statistik Evaluasi</Text>
        <View style={styles.statsGrid}>
          <View style={[styles.statBox, { backgroundColor: '#f0fdf4', borderColor: '#2e7d32' }]}>
            <Text style={[styles.statVal, { color: '#2e7d32' }]}>{rataRataSkor}</Text>
            <Text style={styles.statLabel}>Rata-rata Skor Kuis</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>{simulasiSelesai}</Text>
            <Text style={styles.statLabel}>Simulasi Diselesaikan</Text>
          </View>
        </View>

        {/* CTA Button */}
        <TouchableOpacity
          style={styles.ctaBtn}
          onPress={() => navigation.navigate('Materi')}
        >
          <Text style={styles.ctaText}>Lanjutkan Belajar →</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#f9fafb' },
  container: { flex: 1, paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 50, marginBottom: 24, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#2e7d32', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  greet: { fontSize: 15, fontWeight: 'bold', color: '#111827' },
  greetSub: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#374151', marginBottom: 10 },
  progressCard: { backgroundColor: '#fff', borderWidth: 2, borderColor: '#2e7d32', borderRadius: 12, padding: 16, marginBottom: 24, minHeight: 60 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  progressCount: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  progressPct: { fontSize: 14, fontWeight: 'bold', color: '#2e7d32' },
  progressBg: { height: 8, backgroundColor: '#e5e7eb', borderRadius: 4 },
  progressFill: { height: 8, backgroundColor: '#2e7d32', borderRadius: 4 },
  statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statBox: { flex: 1, backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 12, padding: 16, alignItems: 'center' },
  statVal: { fontSize: 28, fontWeight: 'bold', color: '#111827' },
  statLabel: { fontSize: 11, color: '#6b7280', textAlign: 'center', marginTop: 4 },
  ctaBtn: { backgroundColor: '#2e7d32', padding: 16, borderRadius: 12, alignItems: 'center' },
  ctaText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
