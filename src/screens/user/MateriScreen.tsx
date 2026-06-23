import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator,
  TextInput, TouchableOpacity, Image, Dimensions
} from 'react-native';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Ionicons } from '@expo/vector-icons';

interface Materi {
  id: string;
  title: string;
  category: string;
  status: string;
  imageUrl?: string;
  description?: string;
}

const FILTERS = ['Semua', 'Organik', 'Anorganik'];
const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 60) / 2; // 20px padding left + 20px padding right + 20px gap

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
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => navigation.navigate('DetailMateri', { materi: item })}
      activeOpacity={0.7}
    >
      {/* Circular Image */}
      <View style={styles.imageContainer}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.circularImage} />
        ) : (
          <View style={[styles.circularImage, styles.placeholderImage]}>
            <Ionicons name="leaf-outline" size={40} color="#10b981" />
          </View>
        )}
      </View>

      {/* Card Info */}
      <View style={styles.cardInfo}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Nama:</Text>
          <Text style={styles.infoValue} numberOfLines={1}>{item.title}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Dari:</Text>
          <Text style={styles.infoValue} numberOfLines={1}>{item.category}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Materi Edukasi</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#9ca3af" style={styles.searchIconLeft} />
        <TextInput
          style={styles.searchInput}
          placeholder="Cari materi pembelajaran..."
          placeholderTextColor="#9ca3af"
          value={search}
          onChangeText={setSearch}
        />
      </View>

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
        <ActivityIndicator size="large" color="#10b981" style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          key="two-column-list"
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={64} color="#d1d5db" />
              <Text style={styles.empty}>Belum ada materi tersedia</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f9fafb', 
    paddingHorizontal: 20 
  },
  header: { 
    marginTop: 50, 
    marginBottom: 20,
  },
  headerTitle: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#111827',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchIconLeft: {
    marginRight: 8,
  },
  searchInput: { 
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: '#111827',
  },
  filterRow: { 
    flexDirection: 'row', 
    gap: 10, 
    marginBottom: 20 
  },
  filterBadge: { 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
  },
  filterBadgeActive: { 
    backgroundColor: '#10b981', 
    borderColor: '#10b981' 
  },
  filterText: { 
    fontSize: 13, 
    fontWeight: '600', 
    color: '#6b7280' 
  },
  filterTextActive: { 
    color: '#fff' 
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    marginBottom: 12,
  },
  circularImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#fbbf24',
  },
  placeholderImage: {
    backgroundColor: '#ecfdf5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: {
    width: '100%',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 4,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: '#d4a574',
    fontWeight: '600',
    marginRight: 6,
  },
  infoValue: {
    fontSize: 12,
    color: '#d4a574',
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  empty: { 
    textAlign: 'center', 
    marginTop: 16, 
    color: '#9ca3af',
    fontSize: 14,
  }
});
