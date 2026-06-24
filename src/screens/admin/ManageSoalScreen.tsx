import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Alert, Image } from 'react-native';
import { collection, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../../config/firebase';

// Types for different question formats
interface DragDropItem {
  id: string;
  name: string;
  imageUrl?: string;
  type: 'organik' | 'anorganik';
  levelId?: string;
  levelName?: string;
  gameType: 'DragDrop';
}

interface BinaryItem {
  id: string;
  name: string;
  imageUrl?: string;
  type: 'organik' | 'anorganik';
  levelId?: string;
  levelName?: string;
  gameType: 'Binary';
}

interface MultipleChoiceItem {
  id: string;
  question: string;
  imageUrl?: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  type: 'organik' | 'anorganik';
  levelId?: string;
  levelName?: string;
  gameType: 'MultipleChoice';
}

type SoalItem = DragDropItem | BinaryItem | MultipleChoiceItem;

export default function ManageSoalScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<'DragDrop' | 'Binary' | 'MultipleChoice'>('DragDrop');
  const [data, setData] = useState<SoalItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSoal = async (gameType: 'DragDrop' | 'Binary' | 'MultipleChoice') => {
    setLoading(true);
    try {
      const q = query(collection(db, 'soal'), where('gameType', '==', gameType));
      const querySnapshot = await getDocs(q);
      const soalList: SoalItem[] = [];
      querySnapshot.forEach((docSnap) => {
        soalList.push({ id: docSnap.id, ...docSnap.data() } as SoalItem);
      });
      setData(soalList);
    } catch (error) {
      console.error("Error fetching soal:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchSoal(activeTab);
    });
    return unsubscribe;
  }, [navigation, activeTab]);

  useEffect(() => {
    fetchSoal(activeTab);
  }, [activeTab]);

  const handleDelete = async (id: string) => {
    Alert.alert('Hapus Item', 'Yakin ingin menghapus item ini?', [
      { text: 'Batal', style: 'cancel' },
      { 
        text: 'Hapus', 
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            await deleteDoc(doc(db, 'soal', id));
            fetchSoal(activeTab);
          } catch (error) {
            console.error("Error deleting document: ", error);
            setLoading(false);
          }
        }
      }
    ]);
  };

  const handleEdit = (item: SoalItem) => {
    navigation.navigate('FormSoal', { 
      gameType: activeTab,
      editItem: item 
    });
  };

  const navigateToAddForm = () => {
    navigation.navigate('FormSoal', { gameType: activeTab });
  };

  const renderCardContent = (item: SoalItem) => {
    if (item.gameType === 'MultipleChoice') {
      const mcItem = item as MultipleChoiceItem;
      return (
        <>
          {mcItem.imageUrl ? (
            <Image source={{ uri: mcItem.imageUrl }} style={styles.cardImage} />
          ) : null}
          <Text style={styles.cardTitle} numberOfLines={2}>{mcItem.question}</Text>
          <Text style={styles.cardSubtext}>Jawaban: {mcItem.correctAnswer}</Text>
          {mcItem.levelName && (
            <Text style={styles.cardSubtext}>Level: {mcItem.levelName}</Text>
          )}
        </>
      );
    } else {
      const simpleItem = item as DragDropItem | BinaryItem;
      return (
        <>
          {simpleItem.imageUrl ? (
            <Image source={{ uri: simpleItem.imageUrl }} style={styles.cardImage} />
          ) : null}
          <Text style={styles.cardTitle}>{simpleItem.name}</Text>
          {simpleItem.levelName && (
            <Text style={styles.cardSubtext}>Level: {simpleItem.levelName}</Text>
          )}
        </>
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* Header - Consistent with ManageMateriScreen */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconCircle}>
          <Text style={{ fontWeight: 'bold' }}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Bank Soal Simulasi</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Tab Buttons */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'DragDrop' && styles.tabBtnActive]}
          onPress={() => setActiveTab('DragDrop')}
        >
          <Text style={[styles.tabText, activeTab === 'DragDrop' && styles.tabTextActive]}>
            Drag & Drop
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'Binary' && styles.tabBtnActive]}
          onPress={() => setActiveTab('Binary')}
        >
          <Text style={[styles.tabText, activeTab === 'Binary' && styles.tabTextActive]}>
            Klasifikasi
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'MultipleChoice' && styles.tabBtnActive]}
          onPress={() => setActiveTab('MultipleChoice')}
        >
          <Text style={[styles.tabText, activeTab === 'MultipleChoice' && styles.tabTextActive]}>
            Pilihan Ganda
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2e7d32" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={data}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 20, paddingBottom: 80 }}
          renderItem={({item}) => (
            <View style={[styles.card, { 
              borderLeftWidth: 4, 
              borderLeftColor: item.type === 'organik' ? '#2e7d32' : '#9ca3af' 
            }]}>
              <View style={{ flex: 1 }}>
                {renderCardContent(item)}
              </View>
              
              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={styles.editBtn} 
                  onPress={() => handleEdit(item)}
                >
                  <Text style={styles.editBtnText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.delBtn} 
                  onPress={() => handleDelete(item.id)}
                >
                  <Text style={styles.delBtnText}>[x]</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              Belum ada soal {activeTab === 'DragDrop' ? 'Drag & Drop' : activeTab === 'Binary' ? 'Klasifikasi' : 'Pilihan Ganda'}
            </Text>
          }
        />
      )}

      {/* FAB - Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={navigateToAddForm}>
        <Text style={styles.fabText}>
          + Susun {activeTab === 'DragDrop' ? 'Drag & Drop' : activeTab === 'Binary' ? 'Klasifikasi' : 'Pilihan Ganda'} Baru
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: 20, 
    paddingTop: 50, 
    borderBottomWidth: 1, 
    borderBottomColor: '#e5e7eb', 
    backgroundColor: '#fff' 
  },
  iconCircle: { 
    width: 32, 
    height: 32, 
    borderWidth: 2, 
    borderColor: '#333', 
    borderRadius: 16, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  title: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  
  // Tab styles
  tabContainer: { 
    flexDirection: 'row', 
    gap: 10, 
    padding: 20, 
    paddingBottom: 10,
    backgroundColor: '#fff' 
  },
  tabBtn: { 
    flex: 1, 
    paddingVertical: 12, 
    borderRadius: 10, 
    backgroundColor: '#e5e7eb',
    alignItems: 'center'
  },
  tabBtnActive: { backgroundColor: '#374151' },
  tabText: { fontSize: 13, fontWeight: '600', color: '#6b7280' },
  tabTextActive: { color: '#fff' },
  
  // Card styles - improved responsiveness
  card: { 
    backgroundColor: '#fff', 
    borderRadius: 10, 
    padding: 16, 
    marginBottom: 14, 
    borderWidth: 1, 
    borderColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  cardImage: { 
    width: '100%', 
    height: 100, 
    borderRadius: 6, 
    marginBottom: 12, 
    resizeMode: 'cover',
    backgroundColor: '#f3f4f6'
  },
  cardTitle: { 
    fontSize: 15, 
    fontWeight: 'bold', 
    marginBottom: 6, 
    color: '#111827',
    lineHeight: 20
  },
  cardSubtext: { 
    color: '#6b7280', 
    fontSize: 11, 
    marginTop: 3,
    lineHeight: 16
  },
  
  // Action buttons - improved layout
  actionButtons: {
    flexDirection: 'column',
    gap: 8,
    marginLeft: 12,
    justifyContent: 'flex-start'
  },
  editBtn: { 
    borderWidth: 1.5, 
    borderColor: '#374151', 
    borderRadius: 6, 
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 50,
    alignItems: 'center'
  },
  editBtnText: { 
    fontSize: 12, 
    fontWeight: 'bold', 
    color: '#374151' 
  },
  delBtn: { 
    width: 50, 
    borderWidth: 1.5, 
    borderColor: '#9ca3af', 
    borderStyle: 'dashed', 
    borderRadius: 6, 
    alignItems: 'center', 
    justifyContent: 'center',
    paddingVertical: 8
  },
  delBtnText: { fontSize: 14, color: '#dc2626', fontWeight: 'bold' },
  emptyText: { 
    textAlign: 'center', 
    marginTop: 40, 
    color: '#6b7280',
    fontSize: 14
  },
  
  // FAB - Floating Action Button
  fab: { 
    position: 'absolute', 
    bottom: 20, 
    left: 20, 
    right: 20, 
    backgroundColor: '#374151', 
    padding: 16, 
    borderRadius: 12, 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8
  },
  fabText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});
