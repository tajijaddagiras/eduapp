import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image, Alert } from 'react-native';
import { collection, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';

interface UserData {
  id: string;
  name: string;
  email: string;
  photoUrl?: string;
  profilePic?: string;
  sekolah?: string;
  createdAt?: any;
  ueqData?: Record<string, number> | null;
  ueqAnswers?: Record<number, number> | null;
}

export default function DataSiswaScreen({ navigation }: any) {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSelectMode, setIsSelectMode] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'users'), where('role', '==', 'user'));
      const snapshot = await getDocs(q);
      
      const ueqSnap = await getDocs(collection(db, 'ueq_responses'));
      const ueqMap: Record<string, { dimensions: Record<string, number>; answers: Record<number, number> }> = {};
      ueqSnap.forEach(doc => {
        const data = doc.data();
        if (data.userId && data.dimensions) {
          ueqMap[data.userId] = {
            dimensions: data.dimensions,
            answers: data.answers || {},
          };
        }
      });
      
      const userList: UserData[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        userList.push({
          id: doc.id,
          name: data.name || 'Siswa Tanpa Nama',
          email: data.email || 'Tidak ada email',
          photoUrl: data.photoUrl || data.profilePic,
          sekolah: data.sekolah,
          createdAt: data.createdAt,
          ueqData: ueqMap[doc.id]?.dimensions || null,
          ueqAnswers: ueqMap[doc.id]?.answers || null,
        });
      });
      
      // Sort by name
      userList.sort((a, b) => a.name.localeCompare(b.name));
      
      setUsers(userList);
    } catch (error) {
      console.error("Error fetching users: ", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleSelectAll = () => {
    if (selectedIds.length === users.length) {
      setSelectedIds([]);
      setIsSelectMode(false);
    } else {
      setSelectedIds(users.map(u => u.id));
      setIsSelectMode(true);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    
    Alert.alert(
      'Hapus Data User',
      `Apakah Anda yakin ingin menghapus ${selectedIds.length} user secara permanen? Data kuesioner mereka juga akan ikut terhapus.`,
      [
        { text: 'Batal', style: 'cancel' },
        { 
          text: 'Hapus', 
          style: 'destructive',
          onPress: async () => {
             setLoading(true);
             try {
               const deletePromises: Promise<void>[] = [];
               
               // 1. Delete Users
               for (const id of selectedIds) {
                 deletePromises.push(deleteDoc(doc(db, 'users', id)));
               }
               
               // 2. Delete UEQ Responses
               const ueqSnap = await getDocs(collection(db, 'ueq_responses'));
               ueqSnap.forEach(d => {
                 if (selectedIds.includes(d.data().userId)) {
                   deletePromises.push(deleteDoc(doc(db, 'ueq_responses', d.id)));
                 }
               });
               
               // 3. Delete Progress (if any)
               const progressSnap = await getDocs(collection(db, 'progress'));
               progressSnap.forEach(d => {
                 if (selectedIds.includes(d.data().userId)) {
                   deletePromises.push(deleteDoc(doc(db, 'progress', d.id)));
                 }
               });

               await Promise.all(deletePromises);
               
               setSelectedIds([]);
               setIsSelectMode(false);
               Alert.alert('Berhasil', 'Data user beserta kuesionernya berhasil dihapus.');
               fetchUsers();
             } catch (error) {
               console.error('Delete error', error);
               Alert.alert('Gagal', 'Terjadi kesalahan saat menghapus data.');
               setLoading(false);
             }
          }
        }
      ]
    );
  };

  const renderUserCard = ({ item }: { item: UserData }) => {
    const isSelected = selectedIds.includes(item.id);
    return (
      <TouchableOpacity 
        style={[styles.card, isSelected && styles.cardSelected]}
        onLongPress={() => { setIsSelectMode(true); toggleSelection(item.id); }}
        onPress={() => isSelectMode ? toggleSelection(item.id) : null}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          {/* Checkbox indicator when in select mode */}
          {isSelectMode && (
            <View style={[styles.checkbox, isSelected && styles.checkboxChecked]}>
              {isSelected && <Text style={styles.checkboxText}>✓</Text>}
            </View>
          )}

          {item.photoUrl ? (
            <Image source={{ uri: item.photoUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>{item.name.charAt(0).toUpperCase()}</Text>
            </View>
          )}
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{item.name}</Text>
            <Text style={styles.userEmail}>{item.email}</Text>
            {item.sekolah && (
              <Text style={styles.userSchool}>🏫 {item.sekolah}</Text>
            )}
          </View>
        </View>
        <View style={styles.cardFooter}>
          {item.ueqData ? (
            <>
              <View style={[styles.badge, styles.badgeSuccess]}>
                <Text style={styles.badgeTextSuccess}>✅ Sudah Isi UEQ</Text>
              </View>
              <TouchableOpacity style={styles.detailBtn} onPress={() => navigation.navigate('DetailKuesionerSiswa', { student: item })}>
                <Text style={styles.detailBtnText}>Lihat Selengkapnya</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={[styles.badge, styles.badgeWarning]}>
              <Text style={styles.badgeTextWarning}>⏳ Belum Isi UEQ</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {isSelectMode ? (
          <>
            <TouchableOpacity onPress={() => { setIsSelectMode(false); setSelectedIds([]); }} style={styles.iconBtn}>
              <Text style={{ fontWeight: 'bold' }}>X</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{selectedIds.length} Dipilih</Text>
            <TouchableOpacity onPress={handleDeleteSelected} style={styles.deleteBtnTop}>
              <Text style={styles.deleteBtnTopText}>🗑️</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Text style={{ fontWeight: 'bold' }}>{'<'}</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Data User</Text>
            <View style={{ width: 32 }} />
          </>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>Total User Terdaftar: {users.length}</Text>
          {users.length > 0 && (
            <TouchableOpacity onPress={handleSelectAll} style={styles.selectAllBtn}>
              <Text style={styles.selectAllText}>
                {selectedIds.length === users.length ? 'Batal Pilih Semua' : 'Pilih Semua'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#2e7d32" />
            <Text style={{ marginTop: 10, color: '#6b7280' }}>Memuat data user...</Text>
          </View>
        ) : (
          <FlatList
            data={users}
            keyExtractor={item => item.id}
            renderItem={renderUserCard}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Belum ada data user terdaftar.</Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backBtn: {
    width: 32,
    height: 32,
    borderWidth: 2,
    borderColor: '#333',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    backgroundColor: '#e6f4ea',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#d1e7dd',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsText: {
    color: '#0f5132',
    fontWeight: 'bold',
    fontSize: 14,
  },
  selectAllBtn: {
    backgroundColor: '#d1fae5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#34d399',
  },
  selectAllText: {
    color: '#047857',
    fontSize: 12,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
    borderWidth: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#d1fae5',
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2e7d32',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#d1fae5',
  },
  avatarInitial: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 4,
  },
  userSchool: {
    fontSize: 12,
    color: '#4b5563',
    fontWeight: '500',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
  },
  cardFooter: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeSuccess: {
    backgroundColor: '#dcfce7',
  },
  badgeTextSuccess: {
    color: '#166534',
    fontSize: 12,
    fontWeight: '600',
  },
  badgeWarning: {
    backgroundColor: '#fef9c3',
  },
  badgeTextWarning: {
    color: '#854d0e',
    fontSize: 12,
    fontWeight: '600',
  },
  detailBtn: {
    backgroundColor: '#374151',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  detailBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#9ca3af',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  checkboxText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  iconBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtnTop: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtnTopText: {
    fontSize: 18,
  },
});
