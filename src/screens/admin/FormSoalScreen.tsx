import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ActivityIndicator, Alert, ScrollView, Image, Modal, FlatList
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { collection, addDoc, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';

const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

interface Level {
  id: string;
  name: string;
  gameType: string;
  durasi?: number;
  nilaiPerSoal?: number;
}

const uploadToCloudinary = async (uri: string): Promise<string> => {
  const formData = new FormData();
  formData.append('file', { uri, type: 'image/jpeg', name: 'soal.jpg' } as any);
  formData.append('upload_preset', UPLOAD_PRESET!);
  formData.append('folder', 'edusampah/soal');

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: formData,
  });
  const data = await res.json();
  if (!data.secure_url) throw new Error('Upload gagal');
  return data.secure_url;
};

export default function FormSoalScreen({ route, navigation }: any) {
  const { gameType, editItem } = route.params;
  const isEditMode = !!editItem;
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [levelList, setLevelList] = useState<Level[]>([]);
  const [showLevelModal, setShowLevelModal] = useState(false);
  
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  
  const [formName, setFormName] = useState('');
  const [formImageUri, setFormImageUri] = useState<string | null>(null);
  
  const [formQuestion, setFormQuestion] = useState('');
  const [formOptionA, setFormOptionA] = useState('');
  const [formOptionB, setFormOptionB] = useState('');
  const [formOptionC, setFormOptionC] = useState('');
  const [formOptionD, setFormOptionD] = useState('');
  const [formCorrectAnswer, setFormCorrectAnswer] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [formExplanation, setFormExplanation] = useState('');
  
  // Untuk Drag & Drop dan Binary: pilih tipe sampah (organik/anorganik)
  const [formType, setFormType] = useState<'organik' | 'anorganik'>('organik');

  useEffect(() => {
    fetchLevel();
    
    if (isEditMode) {
      if (gameType === 'MultipleChoice') {
        setFormQuestion(editItem.question || '');
        setFormOptionA(editItem.optionA || '');
        setFormOptionB(editItem.optionB || '');
        setFormOptionC(editItem.optionC || '');
        setFormOptionD(editItem.optionD || '');
        setFormCorrectAnswer(editItem.correctAnswer || 'A');
        setFormExplanation(editItem.explanation || '');
      } else {
        setFormName(editItem.name || '');
        setFormType(editItem.type || 'organik'); // Set tipe saat edit
      }
      setFormImageUri(editItem.imageUrl || null);
    }
  }, []);

  const fetchLevel = async () => {
    try {
      const q = query(collection(db, 'level'), where('gameType', '==', gameType));
      const querySnapshot = await getDocs(q);
      const list: Level[] = [];
      querySnapshot.forEach((docSnap) => {
        const lv = { id: docSnap.id, ...docSnap.data() } as Level;
        list.push(lv);
        
        if (isEditMode && editItem.levelId === lv.id) {
          setSelectedLevel(lv);
        }
      });
      setLevelList(list);
    } catch (error) {
      console.error("Error fetching level:", error);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setFormImageUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!selectedLevel) {
      Alert.alert('Error', 'Pilih level terlebih dahulu!');
      return;
    }

    setLoading(true);
    setUploading(true);
    
    try {
      let finalImageUrl = formImageUri;
      
      if (formImageUri && !formImageUri.startsWith('http')) {
        finalImageUrl = await uploadToCloudinary(formImageUri);
      }

      const baseData = {
        levelId: selectedLevel.id,
        levelName: selectedLevel.name,
        gameType: gameType,
        imageUrl: finalImageUrl || '',
      };

      if (gameType === 'DragDrop' || gameType === 'Binary') {
        if (!formName.trim()) {
          Alert.alert('Error', 'Nama objek tidak boleh kosong!');
          setLoading(false);
          setUploading(false);
          return;
        }

        const soalData = {
          ...baseData,
          name: formName,
          type: formType, // Gunakan formType yang dipilih user
        };

        if (isEditMode) {
          await updateDoc(doc(db, 'soal', editItem.id), soalData);
        } else {
          await addDoc(collection(db, 'soal'), {
            ...soalData,
            createdAt: new Date()
          });
        }
      } else if (gameType === 'MultipleChoice') {
        if (!formQuestion.trim() || !formOptionA.trim() || !formOptionB.trim() || 
            !formOptionC.trim() || !formOptionD.trim() || !formExplanation.trim()) {
          Alert.alert('Error', 'Semua field harus diisi!');
          setLoading(false);
          setUploading(false);
          return;
        }

        const soalData = {
          ...baseData,
          question: formQuestion,
          optionA: formOptionA,
          optionB: formOptionB,
          optionC: formOptionC,
          optionD: formOptionD,
          correctAnswer: formCorrectAnswer,
          explanation: formExplanation,
        };

        if (isEditMode) {
          await updateDoc(doc(db, 'soal', editItem.id), soalData);
        } else {
          await addDoc(collection(db, 'soal'), {
            ...soalData,
            createdAt: new Date()
          });
        }
      }

      Alert.alert('Sukses', `Soal berhasil ${isEditMode ? 'diupdate' : 'ditambahkan'}`, [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error("Error saving document: ", error);
      Alert.alert('Error', `Gagal ${isEditMode ? 'mengupdate' : 'menambahkan'} soal. Pastikan koneksi internet stabil.`);
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const getTitle = () => {
    const action = isEditMode ? 'Edit' : 'Tambah';
    if (gameType === 'DragDrop') return `${action} Drag & Drop`;
    if (gameType === 'Binary') return `${action} Klasifikasi`;
    return `${action} Pilihan Ganda`;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconCircle}>
          <Text style={{ fontWeight: 'bold' }}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{getTitle()}</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Dropdown Level */}
        <Text style={styles.fieldLabel}>Level Soal</Text>
        <TouchableOpacity 
          style={styles.dropdownBtn} 
          onPress={() => setShowLevelModal(true)}
        >
          <Text style={selectedLevel ? styles.dropdownTextSelected : styles.dropdownTextPlaceholder}>
            {selectedLevel ? selectedLevel.name : 'Pilih Level ▼'}
          </Text>
        </TouchableOpacity>
        {selectedLevel && selectedLevel.durasi && selectedLevel.nilaiPerSoal && (
          <Text style={styles.fieldHint}>
            ⏱ {selectedLevel.durasi} menit • ⭐ {selectedLevel.nilaiPerSoal} poin/soal
          </Text>
        )}

        {gameType === 'MultipleChoice' ? (
          // Multiple Choice Form
          <>
            <Text style={styles.fieldLabel}>Pertanyaan</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder="Contoh: Manakah yang termasuk sampah organik?"
              value={formQuestion}
              onChangeText={setFormQuestion}
              multiline
              textAlignVertical="top"
            />

            <Text style={styles.fieldLabel}>Unggah Gambar Referensi (Opsional)</Text>
            <TouchableOpacity style={styles.uploadBox} onPress={pickImage}>
              {formImageUri ? (
                <Image source={{ uri: formImageUri }} style={styles.previewImage} />
              ) : (
                <>
                  <Text style={styles.uploadText}>[ Pilih Gambar dari Galeri ]</Text>
                  <Text style={styles.uploadSubtext}>Akan diunggah ke Cloudinary</Text>
                </>
              )}
            </TouchableOpacity>

            <Text style={styles.fieldLabel}>Pilihan A</Text>
            <TextInput
              style={styles.input}
              placeholder="Opsi A"
              value={formOptionA}
              onChangeText={setFormOptionA}
            />

            <Text style={styles.fieldLabel}>Pilihan B</Text>
            <TextInput
              style={styles.input}
              placeholder="Opsi B"
              value={formOptionB}
              onChangeText={setFormOptionB}
            />

            <Text style={styles.fieldLabel}>Pilihan C</Text>
            <TextInput
              style={styles.input}
              placeholder="Opsi C"
              value={formOptionC}
              onChangeText={setFormOptionC}
            />

            <Text style={styles.fieldLabel}>Pilihan D</Text>
            <TextInput
              style={styles.input}
              placeholder="Opsi D"
              value={formOptionD}
              onChangeText={setFormOptionD}
            />

            <Text style={styles.fieldLabel}>Jawaban Benar</Text>
            <View style={styles.answerRow}>
              {['A', 'B', 'C', 'D'].map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[styles.answerBtn, formCorrectAnswer === opt && styles.answerBtnActive]}
                  onPress={() => setFormCorrectAnswer(opt as 'A' | 'B' | 'C' | 'D')}
                >
                  <Text style={[styles.answerText, formCorrectAnswer === opt && styles.answerTextActive]}>
                    {opt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Penjelasan</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder="Jelaskan mengapa jawaban tersebut benar..."
              value={formExplanation}
              onChangeText={setFormExplanation}
              multiline
              textAlignVertical="top"
            />
          </>
        ) : (
          // Drag & Drop / Binary Form
          <>
            <Text style={styles.fieldLabel}>Nama Objek</Text>
            <TextInput
              style={styles.input}
              placeholder={gameType === 'DragDrop' ? "Cth: Botol Kaca" : "Cth: Kulit Pisang"}
              value={formName}
              onChangeText={setFormName}
            />

            <Text style={styles.fieldLabel}>Tipe Sampah (Jawaban Benar)</Text>
            <View style={styles.answerRow}>
              <TouchableOpacity
                style={[styles.typeBtn, styles.typeBtnOrganik, formType === 'organik' && styles.typeBtnActive]}
                onPress={() => setFormType('organik')}
              >
                <Text style={[styles.typeText, formType === 'organik' && styles.typeTextActive]}>
                  🌿 Organik
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeBtn, styles.typeBtnAnorganik, formType === 'anorganik' && styles.typeBtnActive]}
                onPress={() => setFormType('anorganik')}
              >
                <Text style={[styles.typeText, formType === 'anorganik' && styles.typeTextActive]}>
                  ♻️ Anorganik
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.fieldHint}>
              Pilih tipe yang benar untuk objek ini
            </Text>

            <Text style={styles.fieldLabel}>Unggah Gambar (Opsional)</Text>
            <TouchableOpacity style={styles.uploadBox} onPress={pickImage}>
              {formImageUri ? (
                <Image source={{ uri: formImageUri }} style={styles.previewImage} />
              ) : (
                <>
                  <Text style={styles.uploadText}>[ Pilih Gambar dari Galeri ]</Text>
                  <Text style={styles.uploadSubtext}>Akan diunggah ke Cloudinary</Text>
                </>
              )}
            </TouchableOpacity>
          </>
        )}

        {/* Save Button */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={uploading}>
          {uploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveBtnText}>{isEditMode ? 'Update Soal' : 'Simpan Soal'}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelBtnText}>Batal</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal Level */}
      <Modal visible={showLevelModal} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Pilih Level</Text>
            <FlatList
              data={levelList}
              keyExtractor={item => item.id}
              renderItem={({item}) => (
                <TouchableOpacity 
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedLevel(item);
                    setShowLevelModal(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{item.name}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>Belum ada level. Tambahkan di menu Kelola Level</Text>
              }
            />
            <TouchableOpacity 
              style={styles.modalCloseBtn} 
              onPress={() => setShowLevelModal(false)}
            >
              <Text style={styles.modalCloseText}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  scrollContent: { padding: 20, paddingBottom: 40 },
  fieldLabel: { 
    fontSize: 13, 
    fontWeight: 'bold', 
    color: '#374151', 
    marginBottom: 8, 
    marginTop: 16 
  },
  input: { 
    borderWidth: 1.5, 
    borderColor: '#d1d5db', 
    borderRadius: 10, 
    padding: 14, 
    backgroundColor: '#fafafa', 
    fontSize: 14 
  },
  textarea: { height: 100, textAlignVertical: 'top' },
  fieldHint: { 
    fontSize: 11, 
    color: '#6b7280', 
    marginTop: -6, 
    marginBottom: 8,
    fontStyle: 'italic'
  },
  uploadBox: { 
    borderWidth: 2, 
    borderStyle: 'dashed', 
    borderColor: '#d1d5db', 
    borderRadius: 10, 
    padding: 20, 
    alignItems: 'center', 
    marginBottom: 8 
  },
  uploadText: { color: '#6b7280', fontWeight: '600' },
  uploadSubtext: { fontSize: 11, color: '#9ca3af', marginTop: 4 },
  previewImage: { width: '100%', height: 160, borderRadius: 8, resizeMode: 'cover' },
  catRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  catBtn: { 
    flex: 1, 
    padding: 14, 
    borderWidth: 1.5, 
    borderColor: '#9ca3af', 
    borderRadius: 10, 
    alignItems: 'center' 
  },
  catBtnActive: { backgroundColor: '#374151', borderColor: '#374151' },
  catText: { fontWeight: 'bold', color: '#374151', fontSize: 14 },
  catTextActive: { color: '#fff' },
  answerRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 8, 
    gap: 8 
  },
  answerBtn: {
    flex: 1,
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 8,
    alignItems: 'center'
  },
  answerBtnActive: { backgroundColor: '#374151', borderColor: '#374151' },
  answerText: { fontSize: 16, fontWeight: 'bold', color: '#374151' },
  answerTextActive: { color: '#fff' },
  typeBtn: {
    flex: 1,
    paddingVertical: 16,
    borderWidth: 2,
    borderRadius: 12,
    alignItems: 'center',
  },
  typeBtnOrganik: {
    borderColor: '#2e7d32',
    backgroundColor: '#f0fdf4',
  },
  typeBtnAnorganik: {
    borderColor: '#9ca3af',
    backgroundColor: '#f9fafb',
  },
  typeBtnActive: {
    backgroundColor: '#374151',
    borderColor: '#374151',
  },
  typeText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#374151',
  },
  typeTextActive: {
    color: '#fff',
  },
  dropdownBtn: {
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    borderRadius: 10,
    padding: 14,
    backgroundColor: '#fafafa',
    marginBottom: 8
  },
  dropdownTextPlaceholder: { color: '#9ca3af', fontSize: 14 },
  dropdownTextSelected: { color: '#111827', fontSize: 14, fontWeight: '600' },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    maxHeight: '70%'
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#111827'
  },
  modalItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6'
  },
  modalItemText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827'
  },
  modalItemSubtext: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4
  },
  emptyText: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 13,
    marginTop: 20
  },
  modalCloseBtn: {
    marginTop: 16,
    padding: 14,
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    alignItems: 'center'
  },
  modalCloseText: {
    color: '#374151',
    fontWeight: '600'
  },
  saveBtn: { 
    backgroundColor: '#374151', 
    padding: 16, 
    borderRadius: 12, 
    alignItems: 'center', 
    marginTop: 24 
  },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  cancelBtn: { padding: 16, alignItems: 'center' },
  cancelBtnText: { color: '#6b7280', fontSize: 14 },
});
