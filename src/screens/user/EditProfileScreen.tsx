import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';

export default function EditProfileScreen({ navigation }: any) {
  const { user, userData } = useAuth();
  const [name, setName] = useState(userData?.name || '');
  const [phone, setPhone] = useState(userData?.phone || '');
  const [bio, setBio] = useState(userData?.bio || '');
  const [photoUri, setPhotoUri] = useState(userData?.photoUrl || null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Izin Ditolak', 'Anda perlu memberikan izin untuk mengakses galeri foto.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Gagal memilih gambar');
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Validasi', 'Nama tidak boleh kosong');
      return;
    }

    setLoading(true);
    try {
      const updateData: any = {
        name: name.trim(),
        phone: phone.trim(),
        bio: bio.trim(),
      };

      // Jika ada foto baru yang dipilih dan berbeda dari foto lama
      if (photoUri && photoUri !== userData?.photoUrl) {
        // TODO: Upload foto ke Firebase Storage
        // Untuk sementara simpan URI lokal saja
        updateData.photoUrl = photoUri;
      }

      await updateDoc(doc(db, 'users', user!.uid), updateData);
      
      Alert.alert('Berhasil', 'Profil berhasil diperbarui', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Gagal memperbarui profil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#01190a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Data Diri</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {name ? name[0].toUpperCase() : 'U'}
                </Text>
              </View>
            )}
            
            {/* Camera Button */}
            <TouchableOpacity style={styles.cameraBtn} onPress={pickImage}>
              <Ionicons name="camera" size={20} color="#cbead0" />
            </TouchableOpacity>
          </View>
          <Text style={styles.avatarHint}>Ketuk ikon kamera untuk mengubah foto</Text>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          {/* Nama */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nama Lengkap *</Text>
            <TextInput
              style={styles.input}
              placeholder="Masukkan nama lengkap"
              placeholderTextColor="#9ca3af"
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* Email (Read-only) */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email (tidak dapat diubah)</Text>
            <View style={[styles.input, styles.inputDisabled]}>
              <Text style={styles.disabledText}>{user?.email}</Text>
            </View>
          </View>

          {/* Phone */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nomor Telepon</Text>
            <TextInput
              style={styles.input}
              placeholder="Contoh: 081234567890"
              placeholderTextColor="#9ca3af"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>

          {/* Bio */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bio / Tentang Saya</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Ceritakan sedikit tentang diri Anda..."
              placeholderTextColor="#9ca3af"
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity 
          style={[styles.saveBtn, loading && styles.saveBtnDisabled]} 
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#cbead0" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#cbead0" />
              <Text style={styles.saveBtnText}>Simpan Perubahan</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#faf8f3', // cream
    paddingHorizontal: 20,
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    marginTop: 50, 
    marginBottom: 24,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1eee3',
    borderWidth: 2,
    borderColor: '#01190a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { 
    fontSize: 20, 
    fontWeight: '800', 
    color: '#1c1c15' // on-background
  },
  
  // Avatar Section
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    borderColor: '#01190a',
  },
  avatarPlaceholder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#b0ceb5',
    borderWidth: 2,
    borderColor: '#01190a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 48,
    fontWeight: '800',
    color: '#01190a', // primary
  },
  cameraBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2e7d32',
    borderWidth: 2,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarHint: {
    fontSize: 13,
    color: '#424843', // on-surface-variant
    textAlign: 'center',
    fontWeight: '600',
  },
  
  // Form Card
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#01190a',
    padding: 20,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1c1c15', // on-background
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f1eee3',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#01190a',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1c1c15',
  },
  inputDisabled: {
    backgroundColor: '#e5e2d8',
    justifyContent: 'center',
  },
  disabledText: {
    fontSize: 15,
    color: '#424843', // on-surface-variant
  },
  textArea: {
    height: 100,
    paddingTop: 14,
  },
  
  // Save Button
  saveBtn: {
    backgroundColor: '#142e1d',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#01190a',
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#cbead0', // primary-fixed
  },
});
