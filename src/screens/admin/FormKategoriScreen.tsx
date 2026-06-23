import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ActivityIndicator, Alert, ScrollView
} from 'react-native';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

export default function FormKategoriScreen({ navigation }: any) {
  const [loading, setLoading] = useState(false);
  const [formName, setFormName] = useState('');
  const [formDuration, setFormDuration] = useState('30');

  const handleSave = async () => {
    if (!formName.trim()) {
      Alert.alert('Error', 'Nama kategori tidak boleh kosong!');
      return;
    }

    if (!formDuration.trim() || parseInt(formDuration) <= 0) {
      Alert.alert('Error', 'Durasi harus lebih dari 0 menit!');
      return;
    }

    setLoading(true);
    
    try {
      await addDoc(collection(db, 'kategori'), {
        name: formName,
        duration: parseInt(formDuration),
        createdAt: new Date()
      });

      Alert.alert('Sukses', 'Kategori berhasil ditambahkan', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error("Error adding kategori: ", error);
      Alert.alert('Error', 'Gagal menambahkan kategori');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconCircle}>
          <Text style={{ fontWeight: 'bold' }}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Tambah Kategori</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.fieldLabel}>Nama Kategori</Text>
        <TextInput
          style={styles.input}
          placeholder="Contoh: Organik"
          value={formName}
          onChangeText={setFormName}
        />

        <Text style={styles.fieldLabel}>Durasi Soal (Menit)</Text>
        <TextInput
          style={styles.input}
          placeholder="30"
          keyboardType="numeric"
          value={formDuration}
          onChangeText={setFormDuration}
        />
        <Text style={styles.fieldHint}>
          Durasi ini akan berlaku untuk semua soal dalam kategori ini
        </Text>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveBtnText}>Simpan Kategori</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelBtnText}>Batal</Text>
        </TouchableOpacity>
      </ScrollView>
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
  fieldHint: { 
    fontSize: 11, 
    color: '#6b7280', 
    marginTop: 6, 
    marginBottom: 8,
    fontStyle: 'italic'
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
