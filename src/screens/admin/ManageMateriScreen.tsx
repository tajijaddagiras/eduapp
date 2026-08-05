import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  ActivityIndicator, Alert, Image
} from 'react-native';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useFocusEffect } from '@react-navigation/native';

interface ContentSection {
  subtitle: string;
  content: string;
  isNumbered?: boolean;
  numberedItems?: string[];
}

interface Materi {
  id: string;
  title: string;
  category: string;
  status: string;
  content?: string;
  readTime?: string;
  imageUrl?: string;
  sections?: ContentSection[];
}

export default function ManageMateriScreen({ navigation }: any) {
  const [data, setData] = useState<Materi[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMateri = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'materi'));
      const list: Materi[] = [];
      snap.forEach(doc => list.push({ id: doc.id, ...doc.data() } as Materi));
      setData(list);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useFocusEffect(
    useCallback(() => {
      fetchMateri();
    }, [])
  );

  const openAdd = () => {
    navigation.navigate('FormMateri');
  };

  const openEdit = (item: Materi) => {
    navigation.navigate('FormMateri', { editItem: item });
  };

  const handleDelete = (id: string) => {
    Alert.alert('Hapus Materi', 'Yakin ingin menghapus materi ini?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: async () => {
        setLoading(true);
        await deleteDoc(doc(db, 'materi', id));
        fetchMateri();
      }},
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconCircle}>
          <Text style={{ fontWeight: 'bold' }}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Daftar Modul</Text>
        <TouchableOpacity onPress={openAdd} style={styles.addIcon}>
          <Text style={styles.addIconText}>[+]</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2e7d32" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={data}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 20, paddingBottom: 80 }}
          renderItem={({ item }) => (
            <View style={[styles.card, { borderLeftWidth: 4, borderLeftColor: item.category === 'Organik' ? '#2e7d32' : '#9ca3af' }]}>
              {item.imageUrl && (
                <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
              )}
              <View style={styles.cardTop}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={[styles.catBadge, { color: item.category === 'Organik' ? '#2e7d32' : '#6b7280' }]}>
                  {item.category.toUpperCase()}
                </Text>
              </View>
              {item.content ? <Text style={styles.cardPreview} numberOfLines={1}>{item.content}</Text> : null}
              <View style={styles.cardActions}>
                <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}>
                  <Text style={styles.editBtnText}>Edit Konten</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.delBtn} onPress={() => handleDelete(item.id)}>
                  <Text style={styles.delBtnText}>[x]</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.empty}>Belum ada materi.</Text>}
        />
      )}

      {/* Add at bottom */}
      <TouchableOpacity style={styles.fab} onPress={openAdd}>
        <Text style={styles.fabText}>+ Susun Modul Baru</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: 50, borderBottomWidth: 1, borderBottomColor: '#e5e7eb', backgroundColor: '#fff' },
  iconCircle: { width: 32, height: 32, borderWidth: 2, borderColor: '#333', borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  addIcon: { width: 36, height: 36, borderWidth: 1.5, borderColor: '#374151', borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  addIconText: { fontSize: 12, fontWeight: 'bold' },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#e5e7eb' },
  cardImage: { width: '100%', height: 100, borderRadius: 6, marginBottom: 12, resizeMode: 'cover' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: '#111827', flex: 1 },
  catBadge: { fontSize: 11, fontWeight: 'bold' },
  cardPreview: { fontSize: 11, color: '#6b7280', marginBottom: 12 },
  cardActions: { flexDirection: 'row', gap: 8, marginTop: 4 },
  editBtn: { flex: 1, borderWidth: 1.5, borderColor: '#374151', borderRadius: 6, paddingVertical: 8, alignItems: 'center' },
  editBtnText: { fontSize: 12, fontWeight: 'bold', color: '#374151' },
  delBtn: { width: 44, borderWidth: 1.5, borderColor: '#9ca3af', borderStyle: 'dashed', borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  delBtnText: { fontSize: 14, color: '#dc2626' },
  empty: { textAlign: 'center', marginTop: 30, color: '#6b7280' },
  fab: { position: 'absolute', bottom: 20, left: 20, right: 20, backgroundColor: '#374151', padding: 16, borderRadius: 12, alignItems: 'center' },
  fabText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});
