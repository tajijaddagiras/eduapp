import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { collection, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../../config/firebase';

interface Level {
  id: string;
  name: string;
  gameType: 'DragDrop' | 'Binary' | 'MultipleChoice';
}

export default function ManageLevelScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<'DragDrop' | 'Binary' | 'MultipleChoice'>('DragDrop');
  const [data, setData] = useState<Level[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLevel = async (gameType: 'DragDrop' | 'Binary' | 'MultipleChoice') => {
    setLoading(true);
    try {
      const q = query(collection(db, 'level'), where('gameType', '==', gameType));
      const querySnapshot = await getDocs(q);
      const list: Level[] = [];
      querySnapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as Level);
      });
      setData(list);
    } catch (error) {
      console.error("Error fetching level:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchLevel(activeTab);
    });
    return unsubscribe;
  }, [navigation, activeTab]);

  useEffect(() => {
    fetchLevel(activeTab);
  }, [activeTab]);

  const handleDelete = async (id: string) => {
    Alert.alert('Hapus Level', 'Yakin ingin menghapus level ini?', [
      { text: 'Batal', style: 'cancel' },
      { 
        text: 'Hapus', 
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            await deleteDoc(doc(db, 'level', id));
            fetchLevel(activeTab);
          } catch (error) {
            console.error("Error deleting level:", error);
            setLoading(false);
          }
        }
      }
    ]);
  };

  const navigateToAddForm = () => {
    navigation.navigate('FormLevel', { gameType: activeTab });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconCircle}>
          <Text style={{ fontWeight: 'bold' }}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Kelola Level Soal</Text>
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
            <View style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{item.name}</Text>
              </View>
              <TouchableOpacity 
                style={styles.delBtn} 
                onPress={() => handleDelete(item.id)}
              >
                <Text style={styles.delBtnText}>[x]</Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              Belum ada level untuk {activeTab === 'DragDrop' ? 'Drag & Drop' : activeTab === 'Binary' ? 'Klasifikasi' : 'Pilihan Ganda'}
            </Text>
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={navigateToAddForm}>
        <Text style={styles.fabText}>
          + Tambah Level {activeTab === 'DragDrop' ? 'Drag & Drop' : activeTab === 'Binary' ? 'Klasifikasi' : 'Pilihan Ganda'}
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
  card: { 
    backgroundColor: '#fff', 
    borderRadius: 10, 
    padding: 16, 
    marginBottom: 14, 
    borderWidth: 1, 
    borderColor: '#e5e7eb',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#1d4ed8'
  },
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: '#111827' },
  delBtn: { 
    width: 44, 
    borderWidth: 1.5, 
    borderColor: '#9ca3af', 
    borderStyle: 'dashed', 
    borderRadius: 6, 
    alignItems: 'center', 
    justifyContent: 'center',
    height: 44
  },
  delBtnText: { fontSize: 14, color: '#dc2626' },
  emptyText: { textAlign: 'center', marginTop: 30, color: '#6b7280' },
  fab: { 
    position: 'absolute', 
    bottom: 20, 
    left: 20, 
    right: 20, 
    backgroundColor: '#374151', 
    padding: 16, 
    borderRadius: 12, 
    alignItems: 'center' 
  },
  fabText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});
