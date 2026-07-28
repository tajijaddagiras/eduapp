import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';

interface ProgressItem {
  id: string;
  type: string;
  score: number;
  correctCount: number;
  totalItems: number;
  completedAt: Date;
}

export default function RiwayatScreen({ navigation }: any) {
  const { user } = useAuth();
  const [history, setHistory] = useState<ProgressItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'simulasi' | 'klasifikasi' | 'pilihan-ganda'>('all');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const q = query(
        collection(db, 'progress'),
        where('userId', '==', user.uid),
        orderBy('completedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const items: ProgressItem[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        items.push({
          id: doc.id,
          type: data.type || 'simulasi',
          score: data.score || 0,
          correctCount: data.correctCount || 0,
          totalItems: data.totalItems || 0,
          completedAt: data.completedAt?.toDate() || new Date(),
        });
      });
      setHistory(items);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'simulasi': return 'Drag & Drop';
      case 'klasifikasi': return 'Klasifikasi Cepat';
      case 'pilihan-ganda': return 'Pilihan Ganda';
      case 'materi': return 'Materi';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'simulasi': return '#b0ceb5'; // primary-fixed
      case 'klasifikasi': return '#f4bf3d'; // tertiary-fixed-dim
      case 'pilihan-ganda': return '#fe7d5e'; // secondary-container
      default: return '#e5e2d8';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'simulasi': return 'game-controller-outline';
      case 'klasifikasi': return 'flash-outline';
      case 'pilihan-ganda': return 'create-outline';
      case 'materi': return 'book-outline';
      default: return 'bar-chart-outline';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredHistory = filter === 'all' 
    ? history 
    : history.filter(item => item.type === filter);

  const stats = {
    total: history.length,
    avgScore: history.length > 0 
      ? Math.round(history.reduce((sum, item) => sum + item.score, 0) / history.length) 
      : 0,
    bestScore: history.length > 0 
      ? Math.max(...history.map(item => item.score)) 
      : 0,
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#01190a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Riwayat</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Stats Cards */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total Ujian</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.avgScore}</Text>
          <Text style={styles.statLabel}>Rata-rata</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.bestScore}</Text>
          <Text style={styles.statLabel}>Tertinggi</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={{ height: 48, marginBottom: 20 }}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.filterScroll}
        >
          <TouchableOpacity
            style={[styles.filterBtn, filter === 'all' && styles.filterBtnActive]}
            onPress={() => setFilter('all')}
          >
            <Ionicons name="list-outline" size={16} color={filter === 'all' ? '#cbead0' : '#1c1c15'} style={{ marginRight: 6 }} />
            <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
              Semua
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterBtn, filter === 'simulasi' && styles.filterBtnActive]}
            onPress={() => setFilter('simulasi')}
          >
            <Ionicons name="game-controller-outline" size={16} color={filter === 'simulasi' ? '#cbead0' : '#1c1c15'} style={{ marginRight: 6 }} />
            <Text style={[styles.filterText, filter === 'simulasi' && styles.filterTextActive]}>
              Simulasi
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterBtn, filter === 'klasifikasi' && styles.filterBtnActive]}
            onPress={() => setFilter('klasifikasi')}
          >
            <Ionicons name="flash-outline" size={16} color={filter === 'klasifikasi' ? '#cbead0' : '#1c1c15'} style={{ marginRight: 6 }} />
            <Text style={[styles.filterText, filter === 'klasifikasi' && styles.filterTextActive]}>
              Klasifikasi
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterBtn, filter === 'pilihan-ganda' && styles.filterBtnActive]}
            onPress={() => setFilter('pilihan-ganda')}
          >
            <Ionicons name="create-outline" size={16} color={filter === 'pilihan-ganda' ? '#cbead0' : '#1c1c15'} style={{ marginRight: 6 }} />
            <Text style={[styles.filterText, filter === 'pilihan-ganda' && styles.filterTextActive]}>
              Pilihan Ganda
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* History List */}
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#01190a" />
            <Text style={styles.loadingText}>Memuat riwayat...</Text>
          </View>
        ) : filteredHistory.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="folder-open-outline" size={64} color="#9ca3af" style={{ marginBottom: 16 }} />
            <Text style={styles.emptyText}>{filter === 'all' 
              ? 'Belum ada riwayat ujian atau simulasi' 
              : `Belum ada riwayat ${getTypeLabel(filter)}`}</Text>
          </View>
        ) : (
          filteredHistory.map((item) => (
            <View key={item.id} style={styles.historyCard}>
              {/* Type Badge */}
              <View style={[styles.typeBadge, { backgroundColor: getTypeColor(item.type) }]}>
                <Ionicons name={getTypeIcon(item.type) as any} size={16} color="#01190a" />
                <Text style={styles.typeLabel}>{getTypeLabel(item.type)}</Text>
              </View>

              {/* Score */}
              <View style={styles.scoreSection}>
                <Text style={[
                  styles.scoreValue, 
                  { color: item.score >= 60 ? '#01190a' : '#711601' }
                ]}>
                  {item.score}
                </Text>
                <Text style={styles.scoreLabel}>Nilai</Text>
              </View>

              {/* Details */}
              <View style={styles.detailsSection}>
                <View style={styles.detailRow}>
                  <Ionicons name="checkmark-circle" size={16} color="#01190a" />
                  <Text style={styles.detailText}>{item.correctCount} / {item.totalItems} Benar</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="calendar-outline" size={16} color="#424843" />
                  <Text style={styles.detailText}>{formatDate(item.completedAt)}</Text>
                </View>
              </View>

              {/* Status Badge */}
              <View style={[
                styles.statusBadge,
                { 
                  backgroundColor: item.score >= 60 ? '#dcfce7' : '#fee2e2',
                  borderColor: item.score >= 60 ? '#01190a' : '#711601',
                }
              ]}>
                <Text style={[
                  styles.statusText,
                  { color: item.score >= 60 ? '#01190a' : '#711601' }
                ]}>{item.score >= 60 ? '✓ LULUS' : '✗ BELUM LULUS'}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#faf8f3', // cream
    paddingHorizontal: 20,
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    marginTop: 50, 
    marginBottom: 24,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#01190a', // primary
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { 
    fontSize: 24, 
    fontWeight: '800', 
    color: '#1c1c15' // on-background
  },
  
  // Stats Row
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#01190a', // primary
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1c1c15', // on-background
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#424843', // on-surface-variant
    fontWeight: '700',
  },
  
  // Filter Tabs
  filterScroll: {
    gap: 10,
    alignItems: 'center',
  },
  filterBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#01190a', // primary
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBtnActive: {
    backgroundColor: '#142e1d',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1c1c15', // on-background
  },
  filterTextActive: {
    color: '#cbead0', // primary-fixed
  },
  
  // History Card
  historyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#01190a',
    padding: 20,
    marginBottom: 14,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 16,
    gap: 6,
    borderWidth: 2,
    borderColor: '#01190a', // primary
  },
  typeIcon: {
    fontSize: 16,
  },
  typeLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#01190a', // primary
  },
  scoreSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: '800',
    marginBottom: 4,
  },
  scoreLabel: {
    fontSize: 13,
    color: '#424843', // on-surface-variant
    fontWeight: '700',
  },
  detailsSection: {
    gap: 10,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#424843', // on-surface-variant
    fontWeight: '600',
  },
  statusBadge: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  
  // Loading & Empty States
  loadingContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: '#424843', // on-surface-variant
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 15,
    color: '#424843', // on-surface-variant
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '600',
  },
});
