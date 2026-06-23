import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';

const menuItems = [
  { icon: '[E]', label: 'Edit Data Diri', action: null },
  { icon: '[Q]', label: 'Isi Kuesioner Evaluasi (UEQ)', action: 'UEQForm' },
  { icon: '[H]', label: 'Riwayat Ujian & Simulasi', action: null },
];

export default function ProfileScreen({ navigation }: any) {
  const { user, userData } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <View style={styles.container}>
      {/* Gear Icon Header */}
      <View style={styles.header}>
        <View style={styles.gearIcon}>
          <Text style={styles.gearText}>[cfg]</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Avatar */}
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>
            {userData?.name ? userData.name[0].toUpperCase() : 'U'}
          </Text>
        </View>

        {/* Name & Email */}
        <Text style={styles.name}>{userData?.name || 'Pengguna'}</Text>
        <Text style={styles.email}>
          {user?.email} • Terdaftar {new Date(user?.metadata?.creationTime || '').getFullYear() || 2026}
        </Text>

        {/* Menu List */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.menuRow, i === menuItems.length - 1 && { borderBottomWidth: 0 }]}
              onPress={() => item.action && navigation.navigate(item.action)}
            >
              <View style={styles.menuIcon}>
                <Text style={styles.menuIconText}>{item.icon}</Text>
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}

          {/* Logout */}
          <TouchableOpacity style={[styles.menuRow, { borderBottomWidth: 0 }]} onPress={handleLogout}>
            <View style={[styles.menuIcon, { backgroundColor: '#374151' }]}>
              <Text style={[styles.menuIconText, { color: '#fff' }]}>[!]</Text>
            </View>
            <Text style={[styles.menuLabel, { color: '#dc2626' }]}>Keluar Sesi (Logout)</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 50, marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  gearIcon: { width: 36, height: 36, borderWidth: 1.5, borderColor: '#374151', borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  gearText: { fontSize: 10, fontWeight: 'bold' },
  avatarCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#2e7d32', borderWidth: 2, borderColor: '#2e7d32', justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: 16 },
  avatarText: { fontSize: 36, fontWeight: 'bold', color: '#fff' },
  name: { fontSize: 22, fontWeight: 'bold', color: '#111827', textAlign: 'center', marginBottom: 6 },
  email: { fontSize: 13, color: '#6b7280', textAlign: 'center', marginBottom: 32 },
  menuContainer: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1.5, borderColor: '#e5e7eb', overflow: 'hidden' },
  menuRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  menuIcon: { width: 32, height: 32, borderWidth: 1.5, borderColor: '#374151', borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  menuIconText: { fontSize: 10, fontWeight: 'bold', color: '#374151' },
  menuLabel: { flex: 1, fontSize: 14, fontWeight: 'bold', color: '#111827' },
  menuArrow: { fontSize: 20, color: '#9ca3af' },
});
