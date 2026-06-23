import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Alert, TextInput } from 'react-native';
import { collection, getDocs, deleteDoc, doc, addDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

interface Kategori {
  id: string;
  name: string;
  duration: number; // menit
}

export default function ManageKategoriScreen({ navigation }: any) {
  const [data, setData] = useState<Kategori[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchKategori = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'kategori'));
      const list: Kategori[] = [];
      querySnapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as Kategori);
      });
      setData(list);
    } catch (error) {
      console.error("Error fetching kategori:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchKategori();
    });
    return unsubscribe;
  }, [navigation]);

  const handleDelete = async (id: string) => {
    Alert.alert('Hapus Kategori', 'Yakin ingin menghapus kategori ini?', [
      { text: 'Batal', style: 'cancel' },
      { 
        text: 'Hapus', 
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            await deleteDoc(doc(db, 'kategori', id));
            fetchKategori();
          } catch (error) {
            console.error("Error deleting kategori:", error);
            setLoading(false);
          }
        }
      }
    ]);
  };

  const navigateToAddForm = () => {
    navigation.navigate('FormKategori');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconCircle}>
          <Text style={{ fontWeight: 'bold' }}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Kelola Kategori</Text>
        <View style={{ width: 32 }} />
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
                <Text style={styles.cardCategory}>Durasi: {item.duration} menit</Text>
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
            <Text style={styles.emptyText}>Belum ada kategori</Text>
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={navigateToAddForm}>
        <Text style={styles.fabText}>+ Tambah Kategori Baru</Text>
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
    borderLeftColor: '#2e7d32'
  },
  cardTitle: { fontSize: 15, fontWeight: 'bold', marginBottom: 6, color: '#111827' },
  cardCategory: { color: '#6b7280', fontSize: 11, marginTop: 3 },
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
