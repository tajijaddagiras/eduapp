import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView, Platform } from 'react-native';
import { db } from '../../config/firebase';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';

const COLLECTIONS = [
  'users',
  'materi',
  'soal',
  'kategori',
  'level',
  'ueq_responses',
  'progress'
];

export default function BackupRestoreScreen({ navigation }: any) {
  const [loadingBackup, setLoadingBackup] = useState(false);
  const [loadingRestore, setLoadingRestore] = useState(false);

  const handleBackup = async () => {
    setLoadingBackup(true);
    try {
      const backupData: any = {};
      
      for (const colName of COLLECTIONS) {
        const querySnapshot = await getDocs(collection(db, colName));
        const colData: any = {};
        querySnapshot.forEach((docSnap) => {
          colData[docSnap.id] = docSnap.data();
        });
        backupData[colName] = colData;
      }

      const jsonString = JSON.stringify(backupData, null, 2);
      const fileName = `backup_edusampah_${new Date().getTime()}.json`;
      
      if (Platform.OS === 'web') {
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        Alert.alert('Sukses', 'File JSON telah diunduh ke komputer Anda.');
      } else {
        const fileUri = `${FileSystem.documentDirectory}${fileName}`;
        await FileSystem.writeAsStringAsync(fileUri, jsonString, {
          encoding: FileSystem.EncodingType.UTF8,
        });

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri);
        } else {
          Alert.alert('Sukses', `Data berhasil dibackup ke:\n${fileUri}`);
        }
      }
    } catch (error: any) {
      console.error('Error Backup:', error);
      Alert.alert('Gagal Backup', error.message);
    } finally {
      setLoadingBackup(false);
    }
  };

  const handleRestore = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const file = result.assets[0];
      
      if (Platform.OS === 'web') {
        const confirmed = window.confirm('Apakah Anda yakin ingin merestore data?\nData yang ada di database saat ini akan tertimpa atau ditambahkan jika ID sama.');
        if (confirmed) {
          processRestore(file);
        }
      } else {
        Alert.alert(
          'Konfirmasi Restore',
          'Apakah Anda yakin ingin merestore data? Data yang ada di database saat ini akan tertimpa atau ditambahkan jika ID sama.',
          [
            { text: 'Batal', style: 'cancel' },
            { 
              text: 'Restore', 
              style: 'destructive',
              onPress: () => processRestore(file)
            }
          ]
        );
      }

    } catch (error: any) {
      console.error('Error Memilih File:', error);
      if (Platform.OS === 'web') {
        window.alert('Gagal: Tidak dapat memilih file backup.');
      } else {
        Alert.alert('Gagal', 'Tidak dapat memilih file backup.');
      }
    }
  };

  const processRestore = async (file: any) => {
    setLoadingRestore(true);
    try {
      let jsonString = '';
      if (Platform.OS === 'web') {
        // Gunakan fetch untuk membaca blob URI di Web
        const response = await fetch(file.uri);
        jsonString = await response.text();
      } else {
        jsonString = await FileSystem.readAsStringAsync(file.uri, {
          encoding: FileSystem.EncodingType.UTF8,
        });
      }

      const backupData = JSON.parse(jsonString);

      // Loop through collections and documents to restore
      for (const colName of Object.keys(backupData)) {
        if (!COLLECTIONS.includes(colName)) continue; // skip unknown collections

        const colData = backupData[colName];
        for (const docId of Object.keys(colData)) {
          const docData = colData[docId];
          await setDoc(doc(db, colName, docId), docData);
        }
      }

      Alert.alert('Sukses', 'Data berhasil direstore!');
    } catch (error: any) {
      console.error('Error Restore:', error);
      Alert.alert('Gagal Restore', 'Terjadi kesalahan saat memproses data. Pastikan format file sesuai.');
    } finally {
      setLoadingRestore(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Backup & Restore Data</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={28} color="#0284c7" />
          <Text style={styles.infoText}>
            Gunakan fitur ini untuk memindahkan atau mencadangkan seluruh data koleksi Firebase Anda sebelum bermigrasi, atau sebagai keamanan tambahan.
          </Text>
        </View>

        {/* Backup Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Backup Data</Text>
          <Text style={styles.sectionDesc}>
            Fitur ini akan mengunduh semua data koleksi (User, Materi, Soal, Kategori, Level, Respon UEQ, Progress) menjadi satu file berformat JSON.
          </Text>
          <TouchableOpacity 
            style={[styles.button, styles.backupBtn]} 
            onPress={handleBackup}
            disabled={loadingBackup || loadingRestore}
          >
            {loadingBackup ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="cloud-download-outline" size={20} color="#fff" />
                <Text style={styles.buttonText}>Backup ke File JSON</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Restore Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Restore Data</Text>
          <Text style={styles.sectionDesc}>
            Pilih file JSON hasil backup sebelumnya untuk dikembalikan ke database. Peringatan: Proses ini dapat menimpa data saat ini.
          </Text>
          <TouchableOpacity 
            style={[styles.button, styles.restoreBtn]} 
            onPress={handleRestore}
            disabled={loadingBackup || loadingRestore}
          >
            {loadingRestore ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
                <Text style={styles.buttonText}>Restore dari File JSON</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 20, 
    paddingTop: 50, 
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  backButton: { marginRight: 15 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  content: { padding: 20 },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#e0f2fe',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
    gap: 12
  },
  infoText: { flex: 1, color: '#075985', fontSize: 13, lineHeight: 20 },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 20
  },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#111827', marginBottom: 6 },
  sectionDesc: { fontSize: 13, color: '#6b7280', marginBottom: 16, lineHeight: 20 },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    gap: 8
  },
  backupBtn: { backgroundColor: '#10b981' }, 
  restoreBtn: { backgroundColor: '#f59e0b' }, 
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 }
});
