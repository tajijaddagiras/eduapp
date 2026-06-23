import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput,
  ActivityIndicator, Alert, Modal, ScrollView, Image
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

interface Materi {
  id: string;
  title: string;
  category: string;
  status: string;
  content?: string;
  readTime?: string;
  imageUrl?: string;
}

const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

const uploadToCloudinary = async (uri: string): Promise<string> => {
  const formData = new FormData();
  formData.append('file', { uri, type: 'image/jpeg', name: 'materi.jpg' } as any);
  formData.append('upload_preset', UPLOAD_PRESET!);
  formData.append('folder', 'edusampah/materi');

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: formData,
  });
  const data = await res.json();
  if (!data.secure_url) throw new Error('Upload gagal');
  return data.secure_url;
};

export default function ManageMateriScreen({ navigation }: any) {
  const [data, setData] = useState<Materi[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editItem, setEditItem] = useState<Materi | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('Organik');
  const [formContent, setFormContent] = useState('');
  const [formReadTime, setFormReadTime] = useState('5');
  const [formImageUri, setFormImageUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

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

  useEffect(() => { fetchMateri(); }, []);

  const openAdd = () => {
    setEditItem(null);
    setFormTitle(''); setFormCategory('Organik'); setFormContent(''); setFormReadTime('5'); setFormImageUri(null);
    setModalVisible(true);
  };

  const openEdit = (item: Materi) => {
    setEditItem(item);
    setFormTitle(item.title); setFormCategory(item.category);
    setFormContent(item.content || ''); setFormReadTime(item.readTime || '5'); setFormImageUri(item.imageUrl || null);
    setModalVisible(true);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setFormImageUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!formTitle.trim()) { Alert.alert('Error', 'Judul materi tidak boleh kosong!'); return; }
    setLoading(true);
    setUploading(true);
    try {
      let finalImageUrl = formImageUri;
      
      // If there's an image and it's a local file (not already a Cloudinary URL), upload it
      if (formImageUri && !formImageUri.startsWith('http')) {
        finalImageUrl = await uploadToCloudinary(formImageUri);
      }

      if (editItem) {
        await updateDoc(doc(db, 'materi', editItem.id), {
          title: formTitle, category: formCategory,
          content: formContent, readTime: formReadTime,
          imageUrl: finalImageUrl,
        });
      } else {
        await addDoc(collection(db, 'materi'), {
          title: formTitle, category: formCategory,
          content: formContent, readTime: `${formReadTime} Menit`,
          status: 'Published', createdAt: new Date(),
          imageUrl: finalImageUrl,
        });
      }
      setModalVisible(false);
      fetchMateri();
    } catch (e) { 
      console.error(e); 
      Alert.alert('Error', 'Gagal menyimpan materi. Pastikan koneksi internet stabil.');
    } finally { 
      setLoading(false); 
      setUploading(false);
    }
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

      {/* Modal Form */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconCircle}>
                <Text style={{ fontWeight: 'bold' }}>{'<'}</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{editItem ? 'Edit Modul' : 'Pembuatan Modul'}</Text>
              <View style={{ width: 32 }} />
            </View>

            <ScrollView>
              <Text style={styles.fieldLabel}>Judul Bahasan</Text>
              <TextInput style={styles.input} placeholder="Input teks judul di sini..." value={formTitle} onChangeText={setFormTitle} />

              <Text style={styles.fieldLabel}>Kategori Klasifikasi</Text>
              <View style={styles.catRow}>
                {['Organik', 'Anorganik'].map(c => (
                  <TouchableOpacity key={c} style={[styles.catOpt, formCategory === c && styles.catOptActive]} onPress={() => setFormCategory(c)}>
                    <Text style={[styles.catOptText, formCategory === c && styles.catOptTextActive]}>[O] {c}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.fieldLabel}>Estimasi Waktu Baca (menit)</Text>
              <TextInput style={styles.input} placeholder="5" keyboardType="numeric" value={formReadTime} onChangeText={setFormReadTime} />

              <Text style={styles.fieldLabel}>Isi Konten Pelajaran</Text>
              <TextInput
                style={[styles.input, styles.textarea]}
                placeholder="Tulis draf naskah materi lengkap di sini..."
                value={formContent}
                onChangeText={setFormContent}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />

              <Text style={styles.fieldLabel}>Unggah Aset Visual</Text>
              <TouchableOpacity style={styles.uploadBox} onPress={pickImage}>
                {formImageUri ? (
                  <Image source={{ uri: formImageUri }} style={styles.previewImage} />
                ) : (
                  <>
                    <Text style={styles.uploadText}>[ Pilih Foto Header dari Galeri ]</Text>
                    <Text style={styles.uploadSubtext}>Akan diunggah ke Cloudinary</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={uploading}>
                {uploading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveBtnText}>Simpan (*Publish*)</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Batal</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  // Modal
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  modalBox: { flex: 1, backgroundColor: '#fff', marginTop: 60, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  fieldLabel: { fontSize: 13, fontWeight: 'bold', color: '#374151', marginBottom: 6, marginTop: 16 },
  input: { borderWidth: 1.5, borderColor: '#d1d5db', borderRadius: 10, padding: 14, backgroundColor: '#fafafa', fontSize: 14 },
  textarea: { height: 120, textAlignVertical: 'top' },
  catRow: { flexDirection: 'row', gap: 12 },
  catOpt: { flex: 1, padding: 14, borderWidth: 1.5, borderColor: '#9ca3af', borderRadius: 10, alignItems: 'center' },
  catOptActive: { backgroundColor: '#374151', borderColor: '#374151' },
  catOptText: { fontWeight: 'bold', color: '#374151' },
  catOptTextActive: { color: '#fff' },
  uploadBox: { borderWidth: 2, borderStyle: 'dashed', borderColor: '#d1d5db', borderRadius: 10, padding: 20, alignItems: 'center', marginTop: 8 },
  uploadText: { color: '#6b7280' },
  uploadSubtext: { fontSize: 11, color: '#9ca3af', marginTop: 4 },
  previewImage: { width: '100%', height: 160, borderRadius: 8, resizeMode: 'cover' },
  saveBtn: { backgroundColor: '#374151', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  cancelBtn: { padding: 16, alignItems: 'center' },
  cancelBtnText: { color: '#6b7280', fontSize: 14 },
});
