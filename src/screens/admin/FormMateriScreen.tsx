import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ActivityIndicator, Alert, ScrollView, Image, Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

export interface NumberedItem {
  title: string;
  description: string;
}

export interface ContentSection {
  subtitle: string;
  content: string;
  isNumbered?: boolean;
  numberedSectionDescription?: string; // Deskripsi sebelum daftar nomor
  numberedItems?: NumberedItem[];      // Item dengan judul + penjelasan
}

const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

const uploadToCloudinary = async (uri: string): Promise<string> => {
  const formData = new FormData();
  
  if (Platform.OS === 'web' || uri.startsWith('data:')) {
    formData.append('file', uri); // Cloudinary accepts raw data URIs
  } else {
    formData.append('file', { uri, type: 'image/jpeg', name: 'materi.jpg' } as any);
  }
  
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

const emptySection = (): ContentSection => ({
  subtitle: '',
  content: '',
  isNumbered: false,
  numberedSectionDescription: '',
  numberedItems: [],
});

const emptyNumberedItem = (): NumberedItem => ({ title: '', description: '' });

export default function FormMateriScreen({ route, navigation }: any) {
  const { editItem } = route.params || {};
  const isEditMode = !!editItem;

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('Organik');
  const [formImageUri, setFormImageUri] = useState<string | null>(null);
  const [formSections, setFormSections] = useState<ContentSection[]>([emptySection()]);

  useEffect(() => {
    if (isEditMode && editItem) {
      setFormTitle(editItem.title || '');
      setFormCategory(editItem.category || 'Organik');
      setFormImageUri(editItem.imageUrl || null);

      if (editItem.sections && editItem.sections.length > 0) {
        setFormSections(editItem.sections.map((s: any) => ({
          subtitle: s.subtitle || '',
          content: s.content || '',
          isNumbered: s.isNumbered || false,
          numberedSectionDescription: s.numberedSectionDescription || '',
          // Migrate legacy string[] to NumberedItem[]
          numberedItems: (s.numberedItems || []).map((item: any) =>
            typeof item === 'string'
              ? { title: item, description: '' }
              : { title: item.title || '', description: item.description || '' }
          ),
        })));
      } else if (editItem.content) {
        setFormSections([{ ...emptySection(), content: editItem.content }]);
      } else {
        setFormSections([emptySection()]);
      }
    }
  }, [isEditMode, editItem]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
      base64: true,
    });
    
    if (!result.canceled) {
      if (result.assets[0].base64) {
        setFormImageUri(`data:image/jpeg;base64,${result.assets[0].base64}`);
      } else {
        setFormImageUri(result.assets[0].uri);
      }
    }
  };

  const updateSection = (index: number, updates: Partial<ContentSection>) => {
    const newSections = [...formSections];
    newSections[index] = { ...newSections[index], ...updates };
    setFormSections(newSections);
  };

  const updateNumberedItem = (sectionIndex: number, itemIndex: number, updates: Partial<NumberedItem>) => {
    const newSections = [...formSections];
    const newSection = { ...newSections[sectionIndex] };
    const items = [...(newSection.numberedItems || [])];
    
    let currentItem = items[itemIndex];
    if (typeof currentItem === 'string') {
      currentItem = { title: currentItem, description: '' };
    }
    
    items[itemIndex] = { ...currentItem, ...updates };
    newSection.numberedItems = items;
    newSections[sectionIndex] = newSection;
    setFormSections(newSections);
  };

  const addNumberedItem = (sectionIndex: number) => {
    const newSections = [...formSections];
    const newSection = { ...newSections[sectionIndex] };
    const items = [...(newSection.numberedItems || [])];
    items.push(emptyNumberedItem());
    newSection.numberedItems = items;
    newSections[sectionIndex] = newSection;
    setFormSections(newSections);
  };

  const removeNumberedItem = (sectionIndex: number, itemIndex: number) => {
    const newSections = [...formSections];
    const newSection = { ...newSections[sectionIndex] };
    newSection.numberedItems = (newSection.numberedItems || []).filter((_, i) => i !== itemIndex);
    newSections[sectionIndex] = newSection;
    setFormSections(newSections);
  };

  const toggleNumbered = (index: number) => {
    const newSections = [...formSections];
    const newSection = { ...newSections[index] };
    const willBeNumbered = !newSection.isNumbered;
    newSection.isNumbered = willBeNumbered;
    if (willBeNumbered && (!newSection.numberedItems || newSection.numberedItems.length === 0)) {
      newSection.numberedItems = [emptyNumberedItem()];
    }
    if (!newSection.numberedSectionDescription) {
      newSection.numberedSectionDescription = '';
    }
    newSections[index] = newSection;
    setFormSections(newSections);
  };

  const handleSave = async () => {
    if (!formTitle.trim()) { Alert.alert('Error', 'Judul materi tidak boleh kosong!'); return; }
    setLoading(true);
    setUploading(true);
    try {
      let finalImageUrl = formImageUri;
      if (formImageUri && !formImageUri.startsWith('http')) {
        finalImageUrl = await uploadToCloudinary(formImageUri);
      }

      const filteredSections = formSections.filter(s => {
        if (s.isNumbered) {
          return (s.numberedItems || []).some(i => i.title.trim() !== '' || i.description.trim() !== '');
        }
        return s.content.trim() !== '';
      });

      const payload = {
        title: formTitle,
        category: formCategory,
        content: filteredSections.length > 0 ? filteredSections[0].content : '',
        sections: filteredSections,
        imageUrl: finalImageUrl,
      };

      if (isEditMode) {
        await updateDoc(doc(db, 'materi', editItem.id), payload);
      } else {
        await addDoc(collection(db, 'materi'), {
          ...payload,
          status: 'Published',
          createdAt: new Date(),
        });
      }

      Alert.alert('Berhasil', isEditMode ? 'Materi berhasil diperbarui!' : 'Materi berhasil ditambahkan!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Gagal menyimpan materi. Pastikan koneksi internet stabil.');
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconCircle}>
          <Text style={{ fontWeight: 'bold' }}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{isEditMode ? 'Edit Modul' : 'Pembuatan Modul'}</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
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

        <Text style={styles.fieldLabel}>Isi Konten Pelajaran</Text>
        <Text style={styles.fieldHint}>💡 Tambahkan beberapa paragraf atau sub-judul. Mode Penomoran cocok untuk langkah-langkah atau poin penting.</Text>

        {formSections.map((section, index) => (
          <View key={index} style={styles.sectionBox}>
            {/* Section Header */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionLabel}>Paragraf {index + 1}</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity
                  onPress={() => toggleNumbered(index)}
                  style={[styles.toggleNumberBtn, section.isNumbered && styles.toggleNumberBtnActive]}
                >
                  <Text style={[styles.toggleNumberText, section.isNumbered && styles.toggleNumberTextActive]}>
                    {section.isNumbered ? '🔢 Penomoran' : '📝 Paragraf'}
                  </Text>
                </TouchableOpacity>

                {formSections.length > 1 && (
                  <TouchableOpacity
                    onPress={() => setFormSections(formSections.filter((_, i) => i !== index))}
                    style={styles.removeSectionBtn}
                  >
                    <Text style={styles.removeSectionText}>Hapus</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Sub-judul (always shown) */}
            <TextInput
              style={styles.input}
              placeholder={`Sub-judul ${section.isNumbered ? '(Contoh: Cara Penanganan yang Bijak)' : '(opsional)'}`}
              value={section.subtitle}
              onChangeText={(text) => updateSection(index, { subtitle: text })}
            />

            {section.isNumbered ? (
              <View style={{ marginTop: 8 }}>
                {/* Deskripsi Pembuka sebelum nomor */}
                <Text style={styles.numberedSectionLabel}>📄 Deskripsi Pembuka (opsional)</Text>
                <TextInput
                  style={[styles.input, styles.textarea, { marginBottom: 16, backgroundColor: '#f0fdf4', borderColor: '#86efac' }]}
                  placeholder="Tulis kalimat pengantar sebelum daftar nomor, contoh: 'Berikut adalah cara-cara yang bisa kamu lakukan...'"
                  value={section.numberedSectionDescription || ''}
                  onChangeText={(text) => updateSection(index, { numberedSectionDescription: text })}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />

                {/* Daftar Item Bernomor */}
                <Text style={styles.numberedSectionLabel}>🔢 Daftar Poin Bernomor</Text>
                {(section.numberedItems || [emptyNumberedItem()]).map((item, itemIndex) => (
                  <View key={itemIndex} style={styles.numberedInputBox}>
                    {/* Header nomor + hapus */}
                    <View style={styles.numberedInputHeader}>
                      <View style={styles.listNumberBadge}>
                        <Text style={styles.listNumberText}>{itemIndex + 1}</Text>
                      </View>
                      <Text style={styles.numberedItemSectionText}>Poin ke-{itemIndex + 1}</Text>
                      {(section.numberedItems?.length || 0) > 1 && (
                        <TouchableOpacity
                          onPress={() => removeNumberedItem(index, itemIndex)}
                          style={styles.removeNumberItemBtn}
                        >
                          <Text style={styles.removeNumberItemText}>✕</Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    {/* Judul item */}
                    <TextInput
                      style={[styles.input, { marginBottom: 6, backgroundColor: '#fffbeb', borderColor: '#fbbf24' }]}
                      placeholder={`Judul Poin ${itemIndex + 1} (Contoh: Jadikan Pupuk Kompos)`}
                      value={item.title}
                      onChangeText={(text) => updateNumberedItem(index, itemIndex, { title: text })}
                    />

                    {/* Penjelasan item */}
                    <TextInput
                      style={[styles.input, styles.textarea, { backgroundColor: '#fffbeb', borderColor: '#fbbf24' }]}
                      placeholder={`Penjelasan Poin ${itemIndex + 1} (Contoh: Kumpulkan kulit buah di ember kecil, campurkan dengan daun kering...)`}
                      value={item.description}
                      onChangeText={(text) => updateNumberedItem(index, itemIndex, { description: text })}
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                    />
                  </View>
                ))}

                <TouchableOpacity
                  style={styles.addNumberItemBtn}
                  onPress={() => addNumberedItem(index)}
                >
                  <Text style={styles.addNumberItemText}>+ Tambah Poin Baru</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TextInput
                style={[styles.input, styles.textarea, { marginTop: 8 }]}
                placeholder="Tulis isi paragraf di sini..."
                value={section.content}
                onChangeText={(text) => updateSection(index, { content: text })}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            )}
          </View>
        ))}

        <TouchableOpacity
          style={styles.addSectionBtn}
          onPress={() => setFormSections([...formSections, emptySection()])}
        >
          <Text style={styles.addSectionText}>+ Tambah Paragraf Baru</Text>
        </TouchableOpacity>

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
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: 50, borderBottomWidth: 1, borderBottomColor: '#e5e7eb', backgroundColor: '#fff' },
  iconCircle: { width: 32, height: 32, borderWidth: 2, borderColor: '#333', borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  fieldLabel: { fontSize: 13, fontWeight: 'bold', color: '#374151', marginBottom: 6, marginTop: 16 },
  fieldHint: { fontSize: 11, color: '#6b7280', marginBottom: 12, fontStyle: 'italic' },
  input: { borderWidth: 1.5, borderColor: '#d1d5db', borderRadius: 10, padding: 14, backgroundColor: '#fafafa', fontSize: 14 },
  textarea: { height: 100, textAlignVertical: 'top' },

  sectionBox: {
    backgroundColor: '#f9fafb',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionLabel: { fontSize: 13, fontWeight: 'bold', color: '#374151' },
  removeSectionBtn: { paddingHorizontal: 10, paddingVertical: 4, backgroundColor: '#fee2e2', borderRadius: 6 },
  removeSectionText: { fontSize: 11, fontWeight: '600', color: '#dc2626' },
  toggleNumberBtn: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#f3f4f6', borderRadius: 8, borderWidth: 1.5, borderColor: '#d1d5db' },
  toggleNumberBtnActive: { backgroundColor: '#fffbeb', borderColor: '#fbbf24' },
  toggleNumberText: { fontSize: 11, fontWeight: '600', color: '#6b7280' },
  toggleNumberTextActive: { color: '#92400e' },

  numberedSectionLabel: { fontSize: 12, fontWeight: '700', color: '#374151', marginBottom: 8 },

  numberedInputBox: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#fde68a',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  numberedInputHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  listNumberBadge: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: '#fbbf24',
    justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#000',
  },
  listNumberText: { fontSize: 13, fontWeight: 'bold', color: '#111827' },
  numberedItemSectionText: { fontSize: 12, fontWeight: '600', color: '#92400e', flex: 1 },
  removeNumberItemBtn: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: '#fee2e2',
    justifyContent: 'center', alignItems: 'center',
  },
  removeNumberItemText: { fontSize: 14, color: '#dc2626', fontWeight: 'bold' },
  addNumberItemBtn: {
    borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#fbbf24', borderRadius: 10,
    padding: 12, alignItems: 'center', marginTop: 4, backgroundColor: '#fffbeb',
  },
  addNumberItemText: { fontSize: 13, fontWeight: '600', color: '#92400e' },

  addSectionBtn: {
    borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#9ca3af', borderRadius: 10,
    padding: 14, alignItems: 'center', marginTop: 4, marginBottom: 16,
  },
  addSectionText: { fontSize: 13, fontWeight: '600', color: '#6b7280' },

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
});
