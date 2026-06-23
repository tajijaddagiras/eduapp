import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator,
  TextInput, TouchableOpacity, Image
} from 'react-native';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebase';

interface Materi {
  id: string;
  title: string;
  category: string;
  status: string;
  imageUrl?: string;
}

const FILTERS = ['Semua', 'Organik', 'Anorganik'];

export default function MateriScreen({ navigation }: any) {
  const [data, setData] = useState<Materi[]>([]);
  const [filtered, setFiltered] = useState<Materi[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('Semua');

  useEffect(() => {
    const q = query(collection(db, 'materi'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      const list: Materi[] = [];
      snap.forEach(doc => list.push({ id: doc.id, ...doc.data() } as Materi));
      setData(list);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let result = data;
    if (activeFilter !== 'Semua') {
      result = result.filter(m => m.category === activeFilter);
    }
    if (search.trim()) {
      result = result.filter(m => m.title.toLowerCase().includes(search.toLowerCase()));
    }
    setFiltered(result);
  }, [data, activeFilter, search]);

  const renderItem = ({ item }: { item: Materi }) => (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('DetailMateri', { materi: item })}>
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.cardThumbnail} />
      ) : (
        <View style={styles.cardThumbnail} />
      )}
      <View style={styles.cardContent}>
        <View style={styles.cardTop}>
          <Text style={[
            styles.categoryBadge,
            item.category === 'Anorganik' ? styles.badgeAnorganik : styles.badgeOrganik
          ]}>[ {item.category.toUpperCase()} ]</Text>
        </View>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardDesc}>Tap untuk membaca selengkapnya...</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Modul Edukasi</Text>
        <View style={styles.searchIcon}>
          <Text>🔍</Text>
        </View>
      </View>

      {/* Search */}
      <TextInput
        style={styles.searchInput}
        placeholder="Cari materi pembelajaran..."
        value={search}
        onChangeText={setSearch}
      />

      {/* Filter Badges */}
      <View style={styles.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBadge, activeFilter === f && styles.filterBadgeActive]}
            onPress={() => setActiveFilter(f)}
          >
            <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2e7d32" style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 80 }}
          ListEmptyComponent={
            <Text style={styles.empty}>Belum ada materi tersedia.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 50, marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  searchIcon: { width: 36, height: 36, borderWidth: 1.5, borderColor: '#333', borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  searchInput: { backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#d1d5db', borderRadius: 24, paddingHorizontal: 16, paddingVertical: 10, fontSize: 13, marginBottom: 14 },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  filterBadge: { paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1.5, borderColor: '#374151', borderRadius: 6 },
  filterBadgeActive: { backgroundColor: '#2e7d32', borderColor: '#2e7d32' },
  filterText: { fontSize: 12, fontWeight: 'bold', color: '#374151' },
  filterTextActive: { color: '#fff' },
  card: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 10, marginBottom: 12, overflow: 'hidden', borderWidth: 1.5, borderColor: '#e5e7eb', padding: 12, gap: 12 },
  cardThumbnail: { width: 60, height: 60, backgroundColor: '#e5e7eb', borderRadius: 6 },
  cardContent: { flex: 1 },
  cardTop: { flexDirection: 'row', marginBottom: 4 },
  categoryBadge: { fontSize: 10, fontWeight: 'bold', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  badgeOrganik: { color: '#065f46', backgroundColor: '#d1fae5' },
  badgeAnorganik: { color: '#7f1d1d', backgroundColor: '#fee2e2' },
  cardTitle: { fontSize: 14, fontWeight: 'bold', color: '#111827', marginBottom: 4 },
  cardDesc: { fontSize: 11, color: '#6b7280' },
  empty: { textAlign: 'center', marginTop: 40, color: '#6b7280' }
});
