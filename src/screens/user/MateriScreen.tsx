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
  createdAt?: any;
}

const FILTERS = ['Semua', 'Organik', 'Anorganik'];
const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 60) / 2;

// Color palette untuk card
const CARD_COLORS = [
  { bg: '#fde68a', border: '#000', text: '#78350f' }, // Yellow
  { bg: '#fb9a7c', border: '#000', text: '#7c2d12' }, // Coral/Orange  
  { bg: '#86a895', border: '#000', text: '#14532d' }, // Green
  { bg: '#fbbf24', border: '#000', text: '#78350f' }, // Golden yellow
  { bg: '#e5e7eb', border: '#000', text: '#1f2937' }, // Gray
];

export default function MateriScreen({ navigation }: any) {
  const [data, setData] = useState<Materi[]>([]);
  const [filtered, setFiltered] = useState<Materi[]>([]);
  const [newModules, setNewModules] = useState<Materi[]>([]); // Modul baru (7 hari terakhir)
  const [regularModules, setRegularModules] = useState<Materi[]>([]); // Modul regular
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
    
    // Pisahkan modul baru (upload dalam 3 jam terakhir) dan modul regular
    const now = new Date().getTime();
    const threeHoursAgo = now - (3 * 60 * 60 * 1000);
    
    const newMods: Materi[] = [];
    const regularMods: Materi[] = [];
    
    result.forEach(m => {
      if (m.createdAt) {
        const createdTime = m.createdAt.toDate ? m.createdAt.toDate().getTime() : new Date(m.createdAt).getTime();
        if (createdTime >= threeHoursAgo) {
          newMods.push(m);
        } else {
          regularMods.push(m);
        }
      } else {
        regularMods.push(m);
      }
    });
    
    setNewModules(newMods);
    setRegularModules(regularMods);
    setFiltered(result);
  }, [data, activeFilter, search]);

  const getDefaultDesc = (category: string) => {
    if (category === 'Organik') return 'Pelajari cara mengolah sampah organik menjadi kompos yang bermanfaat.';
    if (category === 'Anorganik') return 'Pelajari cara memilah dan mendaur ulang sampah anorganik dengan benar.';
    return 'Pelajari materi edukasi pengelolaan sampah secara lengkap.';
  };

  const isNewModule = (item: Materi) => {
    if (!item.createdAt) return false;
    const createdTime = item.createdAt.toDate ? item.createdAt.toDate().getTime() : new Date(item.createdAt).getTime();
    return createdTime >= (new Date().getTime() - 3 * 60 * 60 * 1000);
  };

  const renderItem = ({ item, index }: { item: Materi; index: number }) => {
    const colorIndex = index % CARD_COLORS.length;
    const cardColor = CARD_COLORS[colorIndex];
    const isNew = isNewModule(item);
    
    return (
      <TouchableOpacity 
        style={[styles.card, { backgroundColor: cardColor.bg, borderColor: cardColor.border }]} 
        onPress={() => navigation.navigate('DetailMateri', { materi: item })}
        activeOpacity={0.7}
      >
        {/* NEW dot badge */}
        {isNew && (
          <View style={styles.newDotBadge}>
            <View style={styles.newDot} />
            <Text style={styles.newDotText}>BARU</Text>
          </View>
        )}

        {/* Square Image */}
        <View style={styles.imageContainer}>
          {item.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} style={styles.squareImage} />
          ) : (
            <View style={[styles.squareImage, styles.placeholderImage]}>
              <Ionicons name="leaf" size={40} color={item.category === 'Organik' ? '#16a34a' : '#6b7280'} />
            </View>
          )}
        </View>

        {/* Card Info */}
        <View style={styles.cardInfo}>
          <Text style={[styles.cardTitle, { color: cardColor.text }]} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles.cardCategoryRow}>
            <Ionicons
              name={item.category === 'Organik' ? 'leaf-outline' : 'sync-outline'}
              size={12}
              color={cardColor.text}
            />
            <Text style={[styles.cardCategory, { color: cardColor.text }]}>
              {item.category.toUpperCase()}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderNewModuleCard = ({ item }: { item: Materi }) => {
    return (
      <TouchableOpacity 
        style={styles.newModuleCard} 
        onPress={() => navigation.navigate('DetailMateri', { materi: item })}
        activeOpacity={0.7}
      >
        {/* Badge MODUL BARU */}
        <View style={styles.newBadge}>
          <View style={styles.newBadgeDot} />
          <Text style={styles.newBadgeText}>MODUL BARU</Text>
        </View>
        
        <View style={styles.newModuleContent}>
          <View style={styles.newModuleLeft}>
            <Text style={styles.newModuleTitle}>{item.title}</Text>
            <Text style={styles.newModuleDesc} numberOfLines={2}>
              {item.description && item.description.trim() !== ''
                ? item.description
                : getDefaultDesc(item.category)}
            </Text>
            <View style={styles.newModuleCategoryRow}>
              <Ionicons
                name={item.category === 'Organik' ? 'leaf-outline' : 'sync-outline'}
                size={12}
                color="#d1fae5"
              />
              <Text style={styles.newModuleCategoryText}>{item.category}</Text>
            </View>
          </View>
          
          {/* Image Right */}
          <View style={styles.newModuleImageContainer}>
            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} style={styles.newModuleImage} />
            ) : (
              <View style={[styles.newModuleImage, styles.newModulePlaceholder]}>
                <Ionicons
                  name={item.category === 'Organik' ? 'leaf' : 'flask'}
                  size={36}
                  color={item.category === 'Organik' ? '#16a34a' : '#8b5cf6'}
                />
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header - Simple without icons */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Materi Edukasi</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
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
        <ActivityIndicator size="large" color="#2e7d32" style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          data={[]}
          renderItem={null}
          ListHeaderComponent={
            <>
              {/* Modul Baru Section - Ditampilkan di atas */}
              {newModules.length > 0 && (
                <View style={styles.newModuleSection}>
                  {newModules.map((item) => (
                    <View key={item.id}>
                      {renderNewModuleCard({ item })}
                    </View>
                  ))}
                </View>
              )}

              {/* Regular Modules Grid */}
              {regularModules.length > 0 && (
                <View style={styles.gridContainer}>
                  {regularModules.map((item, index) => (
                    <View key={item.id} style={styles.gridItem}>
                      {renderItem({ item, index })}
                    </View>
                  ))}
                </View>
              )}

              {filtered.length === 0 && (
                <View style={styles.emptyContainer}>
                  <Ionicons name="document-text-outline" size={64} color="#d1d5db" />
                  <Text style={styles.empty}>Belum ada materi tersedia</Text>
                </View>
              )}
            </>
          }
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#faf8f3', // Cream/beige konsisten dengan HomeScreen
    paddingHorizontal: 20 
  },
  header: { 
    marginTop: 50, 
    marginBottom: 20,
  },
  headerTitle: { 
    fontSize: 22, 
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
  searchIcon: {
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
    paddingHorizontal: 18, 
    paddingVertical: 10, 
    borderRadius: 25,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
  },
  filterBadgeActive: { 
    backgroundColor: '#111827', 
    borderColor: '#111827' 
  },
  filterText: { 
    fontSize: 13, 
    fontWeight: '600', 
    color: '#6b7280' 
  },
  filterTextActive: { 
    color: '#fff' 
  },
  
  // New Module Card - Large horizontal card with badge
  newModuleSection: {
    marginBottom: 20,
  },
  newModuleCard: {
    backgroundColor: '#86a895', // Green shade from reference
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 2.5,
    borderColor: '#000',
  },
  newBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ef4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  newBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
  },
  newBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  newModuleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  newModuleLeft: {
    flex: 1,
    gap: 6,
  },
  newModuleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  newModuleDesc: {
    fontSize: 13,
    color: '#d1fae5',
    lineHeight: 18,
  },
  newModuleCategoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  newModuleCategoryText: {
    fontSize: 11,
    color: '#d1fae5',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  newModuleImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  newModuleImage: {
    width: 80,
    height: 80,
    borderRadius: 16,
  },
  newModulePlaceholder: {
    backgroundColor: '#ede9fe',
  },
  
  // Grid Container for regular cards
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: CARD_WIDTH,
    marginBottom: 20,
  },
  
  // Regular Card - Colored cards with square images like reference
  card: {
    width: '100%',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2.5,
    minHeight: 220,
  },
  imageContainer: {
    marginBottom: 16,
    width: '100%',
    aspectRatio: 1,
    maxWidth: 120,
  },
  squareImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#f3f4f6',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: {
    width: '100%',
    alignItems: 'flex-start', // Left aligned
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'left', // Left aligned
    marginBottom: 6,
    lineHeight: 20,
  },
  cardCategory: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    opacity: 0.8,
  },
  cardCategoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    opacity: 0.8,
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
  },
  // NEW dot badge for grid cards
  newDotBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ef4444',
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 10,
  },
  newDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#fff',
  },
  newDotText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5,
  },
});
