import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth, db } from '../../config/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

interface Stats {
  totalUsers: number;
  totalMateri: number;
  totalSoal: number;
  totalUEQ: number;
}

const menuItems = [
  { icon: '[M]', label: 'Manajemen Modul Materi', nav: 'ManageMateri' },
  { icon: '[K]', label: 'Manajemen Bank Simulasi', nav: 'ManageSoal' },
  { icon: '[L]', label: 'Kelola Level Soal', nav: 'ManageLevel' },
  { icon: '[A]', label: 'Analisis Data UEQ', nav: 'UEQAnalitik', highlight: true },
];

export default function AdminDashboardScreen({ navigation }: any) {
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, totalMateri: 0, totalSoal: 0, totalUEQ: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersSnap, materiSnap, soalSnap, ueqSnap] = await Promise.all([
          getDocs(query(collection(db, 'users'), where('role', '==', 'user'))),
          getDocs(collection(db, 'materi')),
          getDocs(collection(db, 'soal')),
          getDocs(collection(db, 'ueq_responses')),
        ]);
        setStats({
          totalUsers: usersSnap.size,
          totalMateri: materiSnap.size,
          totalSoal: soalSnap.size,
          totalUEQ: ueqSnap.size,
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleLogout = async () => {
    try { await signOut(auth); } catch (e) { console.error(e); }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Admin Portal</Text>
          <Text style={styles.headerSub}>Manajemen Data & Evaluasi</Text>
        </View>
        <TouchableOpacity style={styles.logoutIcon} onPress={handleLogout}>
          <Text style={styles.logoutText}>[!]</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Stats Grid */}
        {loading ? (
          <ActivityIndicator color="#2e7d32" style={{ marginTop: 20 }} />
        ) : (
          <View style={styles.statsGrid}>
            <View style={[styles.statBox, { backgroundColor: '#f0fdf4', borderColor: '#2e7d32' }]}>
              <Text style={[styles.statVal, { color: '#2e7d32' }]}>{stats.totalUsers}</Text>
              <Text style={styles.statLabel}>Siswa Terdaftar</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>{stats.totalMateri}</Text>
              <Text style={styles.statLabel}>Modul Edukasi</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>{stats.totalSoal}</Text>
              <Text style={styles.statLabel}>Paket Simulasi</Text>
            </View>
            <View style={[styles.statBox, { borderColor: '#374151', backgroundColor: '#f9fafb' }]}>
              <Text style={styles.statVal}>{stats.totalUEQ}</Text>
              <Text style={styles.statLabel}>Responden UEQ</Text>
            </View>
          </View>
        )}

        {/* Menu */}
        <Text style={styles.sectionTitle}>Modul Navigasi Utama</Text>
        {menuItems.map((item, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.menuCard, item.highlight && styles.menuCardHighlight]}
            onPress={() => navigation.navigate(item.nav)}
          >
            <View style={[styles.menuIcon, item.highlight && styles.menuIconHighlight]}>
              <Text style={[styles.menuIconText, item.highlight && { color: '#fff' }]}>{item.icon}</Text>
            </View>
            <Text style={[styles.menuLabel, item.highlight && { fontWeight: 'bold' }]}>{item.label}</Text>
            <Text style={styles.menuArrow}>{'>'}</Text>
          </TouchableOpacity>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: 50, borderBottomWidth: 1, borderBottomColor: '#e5e7eb', backgroundColor: '#fff' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  headerSub: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  logoutIcon: { width: 36, height: 36, borderWidth: 1.5, borderColor: '#374151', borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  logoutText: { fontSize: 11, fontWeight: 'bold' },
  scroll: { flex: 1, padding: 20 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 28 },
  statBox: { width: '47%', backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 12, padding: 16, alignItems: 'center' },
  statVal: { fontSize: 30, fontWeight: 'bold', color: '#111827' },
  statLabel: { fontSize: 11, color: '#6b7280', textAlign: 'center', marginTop: 4 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#374151', marginBottom: 12 },
  menuCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, borderWidth: 1.5, borderColor: '#e5e7eb', padding: 16, gap: 14, marginBottom: 10 },
  menuCardHighlight: { borderColor: '#374151', backgroundColor: '#EEE' },
  menuIcon: { width: 36, height: 36, borderWidth: 1.5, borderColor: '#374151', borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  menuIconHighlight: { backgroundColor: '#374151' },
  menuIconText: { fontSize: 11, fontWeight: 'bold', color: '#374151' },
  menuLabel: { flex: 1, fontSize: 14, color: '#111827' },
  menuArrow: { fontSize: 18, color: '#9ca3af', fontWeight: 'bold' },
});
