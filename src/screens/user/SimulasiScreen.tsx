import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, FlatList, ActivityIndicator } from 'react-native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../config/firebase';

interface Level {
  id: string;
  name: string;
  gameType: string;
  durasi?: number;
  nilaiPerSoal?: number;
}

export default function SimulasiScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<'DragDrop' | 'Binary' | 'MultipleChoice'>('DragDrop');
  const [levelList, setLevelList] = useState<Level[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLevels(activeTab);
  }, [activeTab]);

  const fetchLevels = async (gameType: string) => {
    setLoading(true);
    try {
      const q = query(collection(db, 'level'), where('gameType', '==', gameType));
      const querySnapshot = await getDocs(q);
      const list: Level[]= [];
      querySnapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as Level);
      });
      setLevelList(list);
    } catch (error) {
      console.error("Error fetching levels:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLevelPress = (level: Level) => {
    if (activeTab === 'DragDrop') {
      navigation.navigate('DragAndDrop', {
        levelId: level.id,
        levelName: level.name,
        duration: level.durasi,
        nilaiPerSoal: level.nilaiPerSoal,
      });
    } else if (activeTab === 'Binary') {
      navigation.navigate('Binary', {
        levelId: level.id,
        levelName: level.name,
        duration: level.durasi,
        nilaiPerSoal: level.nilaiPerSoal,
      });
    } else if (activeTab === 'MultipleChoice') {
      navigation.navigate('MultipleChoice', {
        levelId: level.id,
        levelName: level.name,
        duration: level.durasi,
        nilaiPerSoal: level.nilaiPerSoal,
      });
    }
  };

  const getTabTitle = () => {
    if (activeTab === 'DragDrop') return 'Drag & Drop';
    if (activeTab === 'Binary') return 'Klasifikasi Cepat';
    return 'Pilihan Ganda';
  };

  const getTabIcon = () => {
    if (activeTab === 'DragDrop') return '🎯';
    if (activeTab === 'Binary') return '⚡';
    return '📝';
  };

  const getTabColor = () => {
    if (activeTab === 'DragDrop') return '#2e7d32';
    if (activeTab === 'Binary') return '#1d4ed8';
    return '#dc2626';
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Evaluasi Pembelajaran</Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'DragDrop' && styles.tabBtnActive]}
          onPress={() => setActiveTab('DragDrop')}
        >
          <Text style={[styles.tabText, activeTab === 'DragDrop' && styles.tabTextActive]}>
            🎯 Drag & Drop
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'Binary' && styles.tabBtnActive]}
          onPress={() => setActiveTab('Binary')}
        >
          <Text style={[styles.tabText, activeTab === 'Binary' && styles.tabTextActive]}>
            ⚡ Klasifikasi
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'MultipleChoice' && styles.tabBtnActive]}
          onPress={() => setActiveTab('MultipleChoice')}
        >
          <Text style={[styles.tabText, activeTab === 'MultipleChoice' && styles.tabTextActive]}>
            📝 Pilihan Ganda
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.levelScroll} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator size="large" color={getTabColor()} style={{ marginTop: 40 }} />
        ) : (
          <>
            {levelList.map((level) => (
              <TouchableOpacity
                key={level.id}
                style={[styles.levelCard, { borderLeftColor: getTabColor() }]}
                onPress={() => handleLevelPress(level)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.levelName}>{level.name}</Text>
                  <View style={styles.levelMeta}>
                    {level.durasi && (
                      <Text style={styles.levelMetaText}>⏱ {level.durasi} menit</Text>
                    )}
                    {level.nilaiPerSoal && (
                      <Text style={styles.levelMetaText}>⭐ {level.nilaiPerSoal} poin/soal</Text>
                    )}
                  </View>
                </View>
                <View style={[styles.levelBtn, { backgroundColor: getTabColor() }]}>
                  <Text style={styles.levelBtnText}>Mulai</Text>
                </View>
              </TouchableOpacity>
            ))}

            {levelList.length === 0 && (
              <Text style={styles.emptyText}>
                Belum ada level untuk {getTabTitle()}.{'\n'}Hubungi admin untuk menambahkan level.
              </Text>
            )}

            <View style={{ height: 80 }} />
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', paddingHorizontal: 20 },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    marginTop: 50, 
    marginBottom: 20, 
    paddingBottom: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: '#e5e7eb' 
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  tabContainer: { 
    flexDirection: 'row', 
    gap: 10, 
    marginBottom: 20,
  },
  tabBtn: { 
    flex: 1, 
    paddingVertical: 10, 
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  tabBtnActive: { 
    backgroundColor: '#1d4ed8',
    borderColor: '#1d4ed8',
  },
  tabText: { fontSize: 12, fontWeight: '600', color: '#6b7280' },
  tabTextActive: { color: '#fff', fontWeight: 'bold' },
  levelScroll: { flex: 1 },
  levelCard: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderLeftWidth: 4,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  levelName: { fontSize: 16, fontWeight: 'bold', color: '#111827', marginBottom: 6 },
  levelMeta: { flexDirection: 'row', gap: 12 },
  levelMetaText: { fontSize: 12, color: '#6b7280' },
  levelBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  levelBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  emptyText: { 
    textAlign: 'center', 
    color: '#9ca3af', 
    fontSize: 14, 
    marginTop: 40,
    lineHeight: 22,
  },
});
