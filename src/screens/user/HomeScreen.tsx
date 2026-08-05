import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../config/firebase';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

// Tips edukasi sampah
const TIPS_HARIAN = [
  { icon: 'leaf-outline', text: 'Kulit pisang terurai 2-5 minggu, tapi botol plastik butuh sampai 450 tahun!', color: '#fbbf24' },
  { icon: 'sync-outline', text: 'Satu botol plastik yang didaur ulang dapat menghemat energi untuk menyalakan lampu 6 jam!', color: '#60a5fa' },
  { icon: 'rose-outline', text: 'Sampah organik bisa dijadikan kompos untuk menyuburkan tanaman di rumah.', color: '#4ade80' },
  { icon: 'trash-outline', text: 'Memilah sampah dari rumah membantu mengurangi beban TPA hingga 60%!', color: '#f87171' },
  { icon: 'water-outline', text: 'Mendaur ulang 1 ton kertas dapat menghemat 17 pohon dan 26.000 liter air!', color: '#38bdf8' },
];

export default function HomeScreen({ navigation }: any) {
  const { userData, user } = useAuth();
  const [totalMateri, setTotalMateri] = useState(0);
  const [materiSelesai, setMateriSelesai] = useState(0);
  const [simulasiSelesai, setSimulasiSelesai] = useState(0);
  const [rataRataSkor, setRataRataSkor] = useState(0);
  const [recentScores, setRecentScores] = useState<number[]>([0, 0, 0, 0, 0]);
  const [loading, setLoading] = useState(true);
  const [tipHariIni, setTipHariIni] = useState(TIPS_HARIAN[0]);
  const [misiMateri, setMisiMateri] = useState(false);
  const [misiSimulasi, setMisiSimulasi] = useState(false);
  const [misiSkor, setMisiSkor] = useState(false);

  useEffect(() => {
    // Set random tip setiap hari
    const today = new Date().getDate();
    setTipHariIni(TIPS_HARIAN[today % TIPS_HARIAN.length]);

    if (!user) return;

    // Fetch total materi count (one-time, jarang berubah)
    getDocs(collection(db, 'materi')).then(snap => setTotalMateri(snap.size));

    // Realtime listener untuk progress user
    const progressQ = query(collection(db, 'progress'), where('userId', '==', user.uid));
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const unsubscribe = onSnapshot(progressQ, (snapshot) => {
      let totalSkor = 0;
      let simCount = 0;
      let hasMateriToday = false;
      let hasSimulasiToday = false;
      let hasSkor80Today = false;
      let materiCount = 0;

      let simScores: { score: number, time: number }[] = [];

      snapshot.forEach(doc => {
        const d = doc.data();
        const completedDate = d.completedAt?.toDate();
        const isToday = completedDate && completedDate >= todayStart;

        if (d.type === 'materi') {
          materiCount++;
        } else if (d.score !== undefined && d.score !== null) {
          const numericScore = Number(d.score);
          if (!isNaN(numericScore)) {
            totalSkor += numericScore;
            simCount++;
            simScores.push({ score: numericScore, time: completedDate?.getTime() || 0 });
          }
        }

        if (isToday) {
          if (d.type === 'materi') {
            hasMateriToday = true;
          } else {
            hasSimulasiToday = true;
            const s = Number(d.score);
            if (!isNaN(s) && s >= 80) {
              hasSkor80Today = true;
            }
          }
        }
      });

      setSimulasiSelesai(simCount);
      setMateriSelesai(materiCount);
      setRataRataSkor(simCount > 0 ? Math.round(totalSkor / simCount) : 0);
      
      // Ambil 5 skor terbaru untuk grafik batang (urutkan dari terlama ke terbaru di array 5 elemen)
      simScores.sort((a, b) => b.time - a.time); // descending
      const latestScores = simScores.slice(0, 5).reverse().map(s => s.score);
      while (latestScores.length < 5) {
        latestScores.unshift(0); // isi 0 di depan jika kuis yang dikerjakan belum sampai 5
      }
      setRecentScores(latestScores);
      setMisiMateri(hasMateriToday);
      setMisiSimulasi(hasSimulasiToday);
      setMisiSkor(hasSkor80Today);
      setLoading(false);
    }, (e) => {
      console.error(e);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const progressPct = totalMateri > 0 ? Math.round((materiSelesai / totalMateri) * 100) : 0;
  
  const getScoreTrend = () => {
    const actual = recentScores.filter(s => s > 0);
    if (actual.length < 2) return { val: 0, isUp: true };
    const latest = actual[actual.length - 1];
    const prev = actual[actual.length - 2];
    if (prev === 0) return { val: 100, isUp: true };
    const diff = latest - prev;
    return {
      val: Math.round((Math.abs(diff) / prev) * 100),
      isUp: diff >= 0
    };
  };
  const trend = getScoreTrend();

  const renderScoreBarChart = (scores: number[]) => {
    return (
      <View style={styles.barChartContainer}>
        {scores.map((score, i) => {
          // Tinggi batang berdasarkan skor, min 4px agar selalu kelihatan
          const h = Math.max(4, Math.round((score / 100) * 32));
          // Batang terang jika skor >= 50, redup jika < 50 atau belum ada data
          const isBright = score >= 50;

          return (
            <View
              key={i}
              style={[
                styles.barItem,
                { height: h },
                isBright ? styles.barItemFilled : styles.barItemDimmed
              ]}
            />
          );
        })}
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
              {userData?.photoUrl ? (
                <Image source={{ uri: userData.photoUrl }} style={{ width: 42, height: 42, borderRadius: 21 }} />
              ) : (
                <Text style={styles.avatarText}>
                  {userData?.name ? userData.name[0].toUpperCase() : 'U'}
                </Text>
              )}
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
            <Ionicons name={tipHariIni.icon as any} size={48} color={tipHariIni.color || '#fff'} />
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
              <View style={[styles.statBadge, !trend.isUp && { backgroundColor: '#ef4444' }]}>
                <Ionicons name={trend.isUp ? "trending-up" : "trending-down"} size={12} color="#ffffff" />
                <Text style={styles.statBadgeText}>{trend.isUp ? '+' : '-'}{trend.val}%</Text>
              </View>
            </View>
            <View>
              <Text style={styles.statValue}>{rataRataSkor}</Text>
              {renderScoreBarChart(recentScores)}
            </View>
          </View>

          {/* Simulasi Selesai */}
          <View style={styles.statCardRight}>
            <Text style={[styles.statLabel, { color: 'rgba(54, 38, 0, 0.8)' }]}>Simulasi selesai</Text>
            <View>
              <View style={styles.simCheckbox}>
                <Ionicons name="game-controller" size={32} color="#362600" />
                <Text style={styles.simNumber}>{simulasiSelesai}</Text>
              </View>
              <View style={styles.simBadge}>
                <Text style={styles.simBadgeText}>Level: ahli pemilah</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Misi Hari Ini */}
        <View style={styles.missionCard}>
          <View style={styles.missionHeader}>
            <Text style={styles.missionTitle}>Misi hari ini</Text>
            <Text style={styles.missionProgress}>
              {[misiMateri, misiSimulasi, misiSkor].filter(Boolean).length}/3 selesai
            </Text>
          </View>
          
          <View style={styles.missionItem}>
            <View style={[styles.missionCheck, misiMateri && styles.missionCheckDone]}>
              {misiMateri && <Ionicons name="checkmark" size={16} color="#fff" />}
            </View>
            <Text style={[styles.missionText, misiMateri && styles.missionTextDone]}>Baca 1 materi baru</Text>
          </View>

          <View style={styles.missionItem}>
            <View style={[styles.missionCheck, misiSimulasi && styles.missionCheckDone]}>
              {misiSimulasi && <Ionicons name="checkmark" size={16} color="#fff" />}
            </View>
            <Text style={[styles.missionText, misiSimulasi && styles.missionTextDone]}>Selesaikan 1 simulasi</Text>
          </View>

          <View style={styles.missionItem}>
            <View style={[styles.missionCheck, misiSkor && styles.missionCheckDone]}>
              {misiSkor && <Ionicons name="checkmark" size={16} color="#fff" />}
            </View>
            <Text style={[styles.missionText, misiSkor && styles.missionTextDone]}>Dapatkan skor 80+ di kuis</Text>
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
    gap: 16,
    marginBottom: 16,
  },
  statCardLeft: {
    flex: 1,
    backgroundColor: '#1a2620',
    borderRadius: 24,
    padding: 20,
    justifyContent: 'space-between',
    minHeight: 140,
  },
  statCardRight: {
    flex: 1,
    backgroundColor: '#f4bf3d',
    borderRadius: 24,
    padding: 20,
    justifyContent: 'space-between',
    minHeight: 140,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statLabel: {
    fontSize: 14,
    color: '#ebe8dd',
    fontWeight: '700',
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#1e8b51',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 0,
  },
  
  // Bar Chart Vertical
  barChartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    height: 32,
    marginTop: 8,
  },
  barItem: {
    flex: 1,
    backgroundColor: '#f4bf3d',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  barItemFilled: {
    opacity: 1,
  },
  barItemDimmed: {
    opacity: 0.8,
  },
  
  simCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  simNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: '#362600',
  },
  simBadge: {
    backgroundColor: '#dca830',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  simBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#362600',
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
