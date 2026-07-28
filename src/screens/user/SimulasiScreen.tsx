import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="game-controller-outline" size={14} color={activeTab === 'DragDrop' ? '#01190a' : '#424843'} style={{ marginRight: 4 }} />
            <Text style={[styles.tabText, activeTab === 'DragDrop' && styles.tabTextActive]}>
              Drag & Drop
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'Binary' && styles.tabBtnActive]}
          onPress={() => setActiveTab('Binary')}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="flash-outline" size={14} color={activeTab === 'Binary' ? '#01190a' : '#424843'} style={{ marginRight: 4 }} />
            <Text style={[styles.tabText, activeTab === 'Binary' && styles.tabTextActive]}>
              Klasifikasi
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'MultipleChoice' && styles.tabBtnActive]}
          onPress={() => setActiveTab('MultipleChoice')}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="create-outline" size={14} color={activeTab === 'MultipleChoice' ? '#01190a' : '#424843'} style={{ marginRight: 4 }} />
            <Text style={[styles.tabText, activeTab === 'MultipleChoice' && styles.tabTextActive]}>
              Pilihan Ganda
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.levelScroll} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator size="large" color="#01190a" style={{ marginTop: 40 }} />
        ) : (
          <>
            {levelList.map((level) => (
              <TouchableOpacity
                key={level.id}
                style={styles.levelCard}
                onPress={() => handleLevelPress(level)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.levelName}>{level.name}</Text>
                  <View style={styles.levelMeta}>
                    {level.durasi && (
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="time-outline" size={14} color="#424843" style={{ marginRight: 4 }} />
                        <Text style={styles.levelMetaText}>{level.durasi} menit</Text>
                      </View>
                    )}
                    {level.nilaiPerSoal && (
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="star-outline" size={14} color="#424843" style={{ marginRight: 4 }} />
                        <Text style={styles.levelMetaText}>{level.nilaiPerSoal} poin/soal</Text>
                      </View>
                    )}
                  </View>
                </View>
                <View style={styles.levelBtn}>
                  <Text style={styles.levelBtnText}>Mulai</Text>
                </View>
              </TouchableOpacity>
            ))}

            {levelList.length === 0 && (
              <Text style={styles.emptyText}>Belum ada level untuk {getTabTitle()}. Hubungi admin untuk menambahkan level.</Text>
            )}

            <View style={{ height: 80 }} />
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#faf8f3', // cream - konsisten dengan HomeScreen
    paddingHorizontal: 20 
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginTop: 50, 
    marginBottom: 24,
  },
  headerTitle: { 
    fontSize: 24, 
    fontWeight: '800', 
    color: '#1c1c15' // on-background
  },
  tabContainer: { 
    flexDirection: 'row', 
    gap: 10, 
    marginBottom: 24,
    backgroundColor: '#f1eee3',
    borderRadius: 16,
    padding: 6,
    borderWidth: 2,
    borderColor: '#01190a',
  },
  tabBtn: { 
    flex: 1, 
    paddingVertical: 12, 
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  tabBtnActive: { 
    backgroundColor: '#fcf9ee',
    borderWidth: 2,
    borderColor: '#01190a',
  },
  tabText: { 
    fontSize: 12, 
    fontWeight: '600', 
    color: '#424843' // on-surface-variant
  },
  tabTextActive: { 
    color: '#01190a', // primary
    fontWeight: '800' 
  },
  levelScroll: { flex: 1 },
  levelCard: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#01190a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  levelName: { 
    fontSize: 17, 
    fontWeight: '800', 
    color: '#1c1c15', // on-background
    marginBottom: 8 
  },
  levelMeta: { 
    flexDirection: 'row', 
    gap: 16,
    flexWrap: 'wrap',
  },
  levelMetaText: { 
    fontSize: 13, 
    color: '#424843', // on-surface-variant
    fontWeight: '600',
  },
  levelBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#01190a',
    backgroundColor: '#142e1d',
  },
  levelBtnText: { 
    color: '#cbead0', 
    fontWeight: '800', 
    fontSize: 14 
  },
  emptyText: { 
    textAlign: 'center', 
    color: '#9ca3af', 
    fontSize: 15, 
    marginTop: 60,
    lineHeight: 24,
  },
});
