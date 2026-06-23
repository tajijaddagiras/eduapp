import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, ActivityIndicator, Alert, Modal } from 'react-native';
import { collection, addDoc, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../../config/firebase';

interface SoalItem {
  id: string;
  name: string;
  type: string; // 'organik' or 'anorganik'
  gameType: string; // 'DragDrop'
}

export default function ManageSoalScreen({ navigation }: any) {
  const [data, setData] = useState<SoalItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('organik');

  const fetchSoal = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'soal'), where('gameType', '==', 'DragDrop'));
      const querySnapshot = await getDocs(q);
      const soalList: SoalItem[] = [];
      querySnapshot.forEach((doc) => {
        soalList.push({ id: doc.id, ...doc.data() } as SoalItem);
      });
      setData(soalList);
    } catch (error) {
      console.error("Error fetching soal:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSoal();
  }, []);

  const handleAdd = async () => {
    if (!newName.trim()) {
      Alert.alert('Error', 'Nama objek tidak boleh kosong!');
      return;
    }
    
    setLoading(true);
    try {
      await addDoc(collection(db, 'soal'), {
        name: newName,
        type: newType,
        gameType: 'DragDrop',
        createdAt: new Date()
      });
      setModalVisible(false);
      setNewName('');
      fetchSoal();
      Alert.alert('Sukses', 'Item simulasi berhasil ditambahkan');
    } catch (error) {
      console.error("Error adding document: ", error);
      Alert.alert('Error', 'Gagal menambahkan item simulasi');
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert('Hapus Item', 'Yakin ingin menghapus item ini dari simulasi?', [
      { text: 'Batal', style: 'cancel' },
      { 
        text: 'Hapus', 
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            await deleteDoc(doc(db, 'soal', id));
            fetchSoal();
          } catch (error) {
            console.error("Error deleting document: ", error);
            setLoading(false);
          }
        }
      }
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>{'< Kembali'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Kelola Simulasi</Text>
      </View>

      <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
        <Text style={styles.addText}>+ Tambah Objek Simulasi</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color="#2e7d32" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={data}
          keyExtractor={item => item.id}
          renderItem={({item}) => (
            <View style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardCategory}>Kategori Benar: {item.type.toUpperCase()}</Text>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#fee2e2' }]} onPress={() => handleDelete(item.id)}>
                  <Text style={[styles.actionText, { color: '#dc2626' }]}>Hapus</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={<Text style={{textAlign: 'center', marginTop: 20, color: '#6b7280'}}>Belum ada item simulasi.</Text>}
        />
      )}

      {/* Modal Form Tambah Soal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tambah Objek Simulasi</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Nama Objek (Cth: Botol Kaca)"
              value={newName}
              onChangeText={setNewName}
            />

            <Text style={{ marginTop: 10, marginBottom: 5 }}>Jawaban Benar:</Text>
            <View style={styles.categoryRow}>
              <TouchableOpacity 
                style={[styles.catBtn, newType === 'organik' && styles.catBtnActive]}
                onPress={() => setNewType('organik')}
              >
                <Text style={[styles.catText, newType === 'organik' && styles.catTextActive]}>Organik</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.catBtn, newType === 'anorganik' && styles.catBtnActive]}
                onPress={() => setNewType('anorganik')}
              >
                <Text style={[styles.catText, newType === 'anorganik' && styles.catTextActive]}>Anorganik</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.submitBtn, { backgroundColor: '#9ca3af' }]} onPress={() => setModalVisible(false)}>
                <Text style={styles.submitText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleAdd}>
                <Text style={styles.submitText}>Simpan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f9fafb' },
  header: { flexDirection: 'row', alignItems: 'center', marginTop: 40, marginBottom: 20 },
  backBtn: { marginRight: 15 },
  backText: { color: '#2e7d32', fontWeight: 'bold' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  addBtn: { backgroundColor: '#2e7d32', padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 20 },
  addText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: 'bold' },
  cardCategory: { color: '#6b7280', fontSize: 12, marginTop: 5 },
  actions: { flexDirection: 'row' },
  actionBtn: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8 },
  actionText: { fontWeight: 'bold', fontSize: 12 },
  
  modalContainer: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 20 },
  modalContent: { backgroundColor: '#fff', padding: 20, borderRadius: 15 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, padding: 15, marginBottom: 15 },
  categoryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  catBtn: { flex: 1, padding: 15, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, marginHorizontal: 5, alignItems: 'center' },
  catBtnActive: { backgroundColor: '#2e7d32', borderColor: '#2e7d32' },
  catText: { color: '#374151' },
  catTextActive: { color: '#fff', fontWeight: 'bold' },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between' },
  submitBtn: { flex: 1, backgroundColor: '#2e7d32', padding: 15, borderRadius: 10, marginHorizontal: 5, alignItems: 'center' },
  submitText: { color: '#fff', fontWeight: 'bold' }
});
