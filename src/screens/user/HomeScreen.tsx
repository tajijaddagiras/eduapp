import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

// Tips edukasi sampah
const TIPS_HARIAN = [
  { icon: '🍌', text: 'Kulit pisang terurai 2-5 minggu, tapi botol plastik butuh sampai 450 tahun!' },
  { icon: '♻️', text: 'Satu botol plastik yang didaur ulang dapat menghemat energi untuk menyalakan lampu 6 jam!' },
  { icon: '🌱', text: 'Sampah organik bisa dijadikan kompos untuk menyuburkan tanaman di rumah.' },
  { icon: '🗑️', text: 'Memilah sampah dari rumah membantu mengurangi beban TPA hingga 60%!' },
  { icon: '💧', text: 'Mendaur ulang 1 ton kertas dapat menghemat 17 pohon dan 26.000 liter air!' },
];

export default function HomeScreen({ navigation }: any) {
  const { userData, user } = useAuth();
  const [totalMateri, setTotalMateri] = useState(0);
  const [materiSelesai, setMateriSelesai] = useState(0);
  const [simulasiSelesai, setSimulasiSelesai] = useState(0);
  const [rataRataSkor, setRataRataSkor] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tipHariIni, setTipHariIni] = useState(TIPS_HARIAN[0]);

  useEffect(() => {
    // Set random tip setiap hari
    const today = new Date().getDate();
    setTipHariIni(TIPS_HARIAN[today % TIPS_HARIAN.length]);
    
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
  
  // Render bar chart horizontal sederhana (5 bars saja, no labels)
  const renderScoreBarChart = (score: number) => {
    const bars = 5;
    const filledBars = Math.ceil((score / 100) * bars);
    
    return (
      <View style={styles.barChartContainer}>
        {[...Array(bars)].map((_, i) => (
          <View 
            key={i}
            style={[
              styles.barItem,
              i < filledBars && styles.barItemFilled
            ]} 
          />
        ))}
      </View>
    );
  };

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
              <Text style={styles.greetSub}>Yuk lanjutkan misi memilah harimu</Text>
            </View>
          </View>
        </View>

        {/* Tips Hari Ini */}
        <View style={styles.tipsCard}>
          <View style={styles.tipsBadge}>
            <Text style={styles.tipsBadgeText}>Tips hari ini</Text>
          </View>
          <View style={styles.tipsContent}>
            <View style={styles.tipsLeft}>
              <Text style={styles.tipsTitle}>Tahukah kamu?</Text>
              <Text style={styles.tipsText}>{tipHariIni.text}</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Materi')}>
                <Text style={styles.tipsLink}>Pelajari lebih lanjut →</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.tipsIcon}>{tipHariIni.icon}</Text>
          </View>
        </View>

        {/* Progress Belajar */}
        <View style={styles.progressCard}>
          <Text style={styles.cardTitle}>Progres belajar</Text>
          {loading ? (
            <ActivityIndicator color="#fff" style={{ marginTop: 8 }} />
          ) : (
            <>
              <View style={styles.progressMain}>
                <Text style={styles.progressBig}>{materiSelesai} / {totalMateri} modul</Text>
                <View style={styles.progressCircle}>
                  <Text style={styles.progressPct}>{progressPct}%</Text>
                </View>
              </View>
              <Text style={styles.progressSubtext}>
                Selesaikan lagi tuntas 100%
              </Text>
            </>
          )}
        </View>

        {/* Stats Grid */}
        <View style={styles.statsRow}>
          {/* Skor Rata-rata */}
          <View style={styles.statCardLeft}>
            <View style={styles.statHeader}>
              <Text style={styles.statLabel}>Skor rata-rata</Text>
              <View style={styles.statBadge}>
                <Ionicons name="trending-up" size={12} color="#2e7d32" />
                <Text style={styles.statBadgeText}>+12%</Text>
              </View>
            </View>
            <Text style={styles.statValue}>{rataRataSkor}</Text>
            {renderScoreBarChart(rataRataSkor)}
          </View>

          {/* Simulasi Selesai */}
          <View style={styles.statCardRight}>
            <Text style={styles.statLabel}>Simulasi selesai</Text>
            <View style={styles.simCheckbox}>
              <Ionicons name="checkbox" size={24} color="#1d4ed8" />
              <Text style={styles.simNumber}>{simulasiSelesai}</Text>
            </View>
            <Text style={styles.simSubtext}>Level: ahli pemilah</Text>
          </View>
        </View>

        {/* Misi Hari Ini */}
        <View style={styles.missionCard}>
          <View style={styles.missionHeader}>
            <Text style={styles.missionTitle}>Misi hari ini</Text>
            <Text style={styles.missionProgress}>2/3 selesai</Text>
          </View>
          
          <View style={styles.missionItem}>
            <View style={[styles.missionCheck, styles.missionCheckDone]}>
              <Ionicons name="checkmark" size={16} color="#fff" />
            </View>
            <Text style={[styles.missionText, styles.missionTextDone]}>Baca 1 materi baru</Text>
          </View>

          <View style={styles.missionItem}>
            <View style={[styles.missionCheck, styles.missionCheckDone]}>
              <Ionicons name="checkmark" size={16} color="#fff" />
            </View>
            <Text style={[styles.missionText, styles.missionTextDone]}>Selesaikan 1 simulasi</Text>
          </View>

          <View style={styles.missionItem}>
            <View style={styles.missionCheck} />
            <Text style={styles.missionText}>Dapatkan skor 80+ di kuis</Text>
          </View>
        </View>

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <TouchableOpacity
            style={styles.ctaBtnPrimary}
            onPress={() => navigation.navigate('Materi')}
          >
            <Ionicons name="book" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.ctaTextPrimary}>Lanjutkan Belajar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.ctaBtnSecondary}
            onPress={() => navigation.navigate('Simulasi')}
          >
            <Ionicons name="game-controller" size={20} color="#1d4ed8" style={{ marginRight: 8 }} />
            <Text style={styles.ctaTextSecondary}>Latihan Simulasi</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 140 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#faf8f3' }, // Cream/beige sangat terang
  container: { flex: 1, paddingHorizontal: 20 },
  
  // Header
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    marginTop: 50, 
    marginBottom: 20,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { 
    width: 48, 
    height: 48, 
    borderRadius: 24, 
    backgroundColor: '#2e7d32', 
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#dcfce7',
  },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  greet: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
  greetSub: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  
  // Tips Card
  tipsCard: {
    backgroundColor: '#1f2937',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    overflow: 'hidden',
  },
  tipsBadge: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  tipsBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  tipsContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  tipsLeft: {
    flex: 1,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 13,
    color: '#d1d5db',
    lineHeight: 20,
    marginBottom: 12,
  },
  tipsLink: {
    fontSize: 13,
    color: '#ef4444',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  tipsIcon: {
    fontSize: 48,
  },
  
  // Progress Card - More Compact
  progressCard: {
    backgroundColor: '#ef4444',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 12,
    color: '#fee2e2',
    marginBottom: 10,
    fontWeight: '600',
  },
  progressMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressBig: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  progressCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressPct: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ef4444',
  },
  progressSubtext: {
    fontSize: 11,
    color: '#fee2e2',
    marginTop: 8,
  },
  
  // Stats Row
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCardLeft: {
    flex: 1,
    backgroundColor: '#1f2937',
    borderRadius: 20,
    padding: 18,
  },
  statCardRight: {
    flex: 1,
    backgroundColor: '#fef3c7',
    borderRadius: 20,
    padding: 18,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: '600',
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  
  // Bar Chart Horizontal - Simple bars only (no labels)
  barChartContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  barItem: {
    flex: 1,
    height: 10,
    backgroundColor: '#374151',
    borderRadius: 5,
  },
  barItemFilled: {
    backgroundColor: '#fbbf24',
  },
  
  simCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 8,
  },
  simNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  simSubtext: {
    fontSize: 11,
    color: '#78716c',
    fontWeight: '600',
  },
  
  // Mission Card
  missionCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  missionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  missionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111827',
  },
  missionProgress: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2e7d32',
  },
  missionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  missionCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  missionCheckDone: {
    backgroundColor: '#2e7d32',
    borderColor: '#2e7d32',
  },
  missionText: {
    flex: 1,
    fontSize: 13,
    color: '#6b7280',
  },
  missionTextDone: {
    color: '#9ca3af',
    textDecorationLine: 'line-through',
  },
  
  // CTA Section
  ctaSection: {
    gap: 12,
  },
  ctaBtnPrimary: {
    backgroundColor: '#2e7d32',
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaTextPrimary: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  ctaBtnSecondary: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#1d4ed8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaTextSecondary: {
    color: '#1d4ed8',
    fontWeight: 'bold',
    fontSize: 15,
  },
});
