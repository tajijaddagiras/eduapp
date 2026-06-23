import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, FlatList, ActivityIndicator } from 'react-native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../config/firebase';

interface Kategori {
  id: string;
  name: string;
  duration: number;
}

interface Level {
  id: string;
  name: string;
  gameType: string;
}

export default function SimulasiScreen({ navigation }: any) {
  const [kategoriList, setKategoriList] = useState<Kategori[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [selectedKategori, setSelectedKategori] = useState<Kategori | null>(null);
  const [selectedGameType, setSelectedGameType] = useState<'DragDrop' | 'Binary' | 'MultipleChoice'>('DragDrop');
  const [levelList, setLevelList] = useState<Level[]>([]);
  const [loadingLevels, setLoadingLevels] = useState(false);

  useEffect(() => {
    fetchKategori();
  }, []);

  const fetchKategori = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'kategori'));
      const list: Kategori[] = [];
      querySnapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as Kategori);
      });
      setKategoriList(list);
    } catch (error) {
      console.error("Error fetching kategori:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLevels = async (gameType: string) => {
    setLoadingLevels(true);
    try {
      const q = query(collection(db, 'level'), where('gameType', '==', gameType));
      const querySnapshot = await getDocs(q);
      const list: Level[] = [];
      querySnapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as Level);
      });
      setLevelList(list);
    } catch (error) {
      console.error("Error fetching levels:", error);
    } finally {
      setLoadingLevels(false);
    }
  };

  const handleCardPress = (kategori: Kategori, gameType: 'DragDrop' | 'Binary' | 'MultipleChoice') => {
    setSelectedKategori(kategori);
    setSelectedGameType(gameType);
    fetchLevels(gameType);
    setShowLevelModal(true);
  };

  const handleLevelSelect = (level: Level) => {
    setShowLevelModal(false);
    
    // Navigate berdasarkan gameType
    if (selectedGameType === 'DragDrop') {
      navigation.navigate('DragAndDrop', {
        kategoriId: selectedKategori?.id,
        kategoriName: selectedKategori?.name,
        levelId: level.id,
        levelName: level.name,
      });
    } else if (selectedGameType === 'Binary') {
      navigation.navigate('Binary', {
        kategoriId: selectedKategori?.id,
        kategoriName: selectedKategori?.name,
        levelId: level.id,
        levelName: level.name,
      });
    } else if (selectedGameType === 'MultipleChoice') {
      navigation.navigate('MultipleChoice', {
        kategoriId: selectedKategori?.id,
        kategoriName: selectedKategori?.name,
        levelId: level.id,
        levelName: level.name,
      });
    }
  };
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Evaluasi Pembelajaran</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2e7d32" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {kategoriList.map((kategori) => (
            <View key={kategori.id}>
              <Text style={styles.sectionTitle}>Kategori: {kategori.name}</Text>
              
              {/* Card: Drag & Drop */}
              <View style={[styles.card, styles.cardHighlight]}>
                <View style={styles.badgeRow}>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>Simulasi Interaktif</Text>
                  </View>
                </View>
                <Text style={styles.cardTitle}>Drag & Drop - {kategori.name}</Text>
                <Text style={styles.cardSub}>Durasi: {kategori.duration} menit • Tipe: Drag & Drop</Text>

                <View style={styles.cardFooter}>
                  <Text style={styles.statusText}>Pilih level dulu!</Text>
                  <TouchableOpacity
                    style={styles.btnOutline}
                    onPress={() => handleCardPress(kategori, 'DragDrop')}
                  >
                    <Text style={styles.btnOutlineText}>Mulai</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Card: Binary/Klasifikasi */}
              <View style={[styles.card, styles.cardBinary]}>
                <View style={styles.badgeRow}>
                  <View style={[styles.badge, { borderColor: '#1d4ed8' }]}>
                    <Text style={[styles.badgeText, { color: '#1d4ed8' }]}>Klasifikasi Cepat</Text>
                  </View>
                </View>
                <Text style={styles.cardTitle}>Klasifikasi - {kategori.name}</Text>
                <Text style={styles.cardSub}>Durasi: {kategori.duration} menit • Tipe: Binary Choice</Text>

                <View style={styles.cardFooter}>
                  <Text style={styles.statusText}>Pilih level dulu!</Text>
                  <TouchableOpacity
                    style={[styles.btnOutline, { borderColor: '#1d4ed8' }]}
                    onPress={() => handleCardPress(kategori, 'Binary')}
                  >
                    <Text style={[styles.btnOutlineText, { color: '#1d4ed8' }]}>Mulai</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Card: Multiple Choice */}
              <View style={styles.card}>
                <View style={styles.badgeRow}>
                  <View style={[styles.badge, { borderColor: '#dc2626' }]}>
                    <Text style={[styles.badgeText, { color: '#dc2626' }]}>Evaluasi Teori</Text>
                  </View>
                </View>
                <Text style={styles.cardTitle}>Pilihan Ganda - {kategori.name}</Text>
                <Text style={styles.cardSub}>Durasi: {kategori.duration} menit • Tipe: Multiple Choice</Text>

                <View style={styles.cardFooter}>
                  <Text style={styles.statusText}>Pilih level dulu!</Text>
                  <TouchableOpacity
                    style={[styles.btnOutline, { borderColor: '#dc2626' }]}
                    onPress={() => handleCardPress(kategori, 'MultipleChoice')}
                  >
                    <Text style={[styles.btnOutlineText, { color: '#dc2626' }]}>Mulai</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}

          {kategoriList.length === 0 && (
            <Text style={styles.emptyText}>Belum ada kategori soal tersedia</Text>
          )}

          <View style={{ height: 80 }} />
        </ScrollView>
      )}

      {/* Modal Pilih Level */}
      <Modal visible={showLevelModal} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Pilih Level Kesulitan</Text>
            <Text style={styles.modalSubtitle}>
              {selectedKategori?.name} - {selectedGameType === 'DragDrop' ? 'Drag & Drop' : selectedGameType === 'Binary' ? 'Klasifikasi' : 'Pilihan Ganda'}
            </Text>

            {loadingLevels ? (
              <ActivityIndicator size="large" color="#2e7d32" style={{ marginVertical: 30 }} />
            ) : (
              <FlatList
                data={levelList}
                keyExtractor={item => item.id}
                renderItem={({item}) => (
                  <TouchableOpacity 
                    style={styles.levelItem}
                    onPress={() => handleLevelSelect(item)}
                  >
                    <View style={styles.levelIcon}>
                      <Text style={styles.levelIconText}>🎯</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.levelText}>{item.name}</Text>
                      <Text style={styles.levelSubtext}>Tap untuk mulai</Text>
                    </View>
                    <Text style={styles.levelArrow}>{'>'}</Text>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>
                    Belum ada level untuk tipe soal ini. Hubungi admin untuk menambahkan level.
                  </Text>
                }
              />
            )}

            <TouchableOpacity 
              style={styles.modalCloseBtn} 
              onPress={() => setShowLevelModal(false)}
            >
              <Text style={styles.modalCloseText}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 50, marginBottom: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#111827', marginTop: 16, marginBottom: 12 },
  card: { backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 12, padding: 16, marginBottom: 16 },
  cardHighlight: { borderColor: '#2e7d32', backgroundColor: '#f9fafb' },
  cardBinary: { borderColor: '#1d4ed8', backgroundColor: '#f9fafb' },
  badgeRow: { marginBottom: 10 },
  badge: { borderWidth: 1.5, borderColor: '#374151', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
  badgeText: { fontSize: 11, fontWeight: 'bold', color: '#374151' },
  cardTitle: { fontSize: 17, fontWeight: 'bold', color: '#111827', marginBottom: 4 },
  cardSub: { fontSize: 12, color: '#6b7280', marginBottom: 16 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  statusText: { fontSize: 13, color: '#6b7280' },
  btnOutline: { borderWidth: 2, borderColor: '#2e7d32', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8 },
  btnOutlineText: { color: '#2e7d32', fontWeight: 'bold', fontSize: 13 },
  emptyText: { textAlign: 'center', color: '#9ca3af', fontSize: 14, marginTop: 30 },
  modalContainer: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 15, padding: 20, maxHeight: '70%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8, textAlign: 'center', color: '#111827' },
  modalSubtitle: { fontSize: 13, color: '#6b7280', textAlign: 'center', marginBottom: 20 },
  levelItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  levelIcon: { width: 40, height: 40, backgroundColor: '#f3f4f6', borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  levelIconText: { fontSize: 20 },
  levelText: { fontSize: 15, fontWeight: '600', color: '#111827' },
  levelSubtext: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  levelArrow: { fontSize: 18, color: '#9ca3af', marginLeft: 'auto' },
  modalCloseBtn: { marginTop: 16, padding: 14, backgroundColor: '#f3f4f6', borderRadius: 10, alignItems: 'center' },
  modalCloseText: { color: '#374151', fontWeight: '600' },
});
