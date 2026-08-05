import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';

const menuItems = [
  { icon: 'person-outline', label: 'Edit Data Diri', action: 'EditProfile' },
  { icon: 'document-text-outline', label: 'Isi Kuesioner Evaluasi (UEQ)', action: 'UEQForm' },
  { icon: 'time-outline', label: 'Riwayat Ujian & Simulasi', action: 'Riwayat' },
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
      {/* Header - Icon removed */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profil</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          {userData?.photoUrl ? (
            <Image source={{ uri: userData.photoUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {userData?.name ? userData.name[0].toUpperCase() : 'U'}
              </Text>
            </View>
          )}
        </View>

        {/* Name & Email */}
        <Text style={styles.name}>{userData?.name || 'Pengguna'}</Text>
        <Text style={styles.email}>{user?.email} • Terdaftar {new Date(user?.metadata?.creationTime || '').getFullYear() || 2026}</Text>

        {/* Menu List */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.menuRow, i === menuItems.length - 1 && { borderBottomWidth: 0 }]}
              onPress={() => item.action && navigation.navigate(item.action)}
            >
              <View style={styles.menuIcon}>
                <Ionicons name={item.icon as any} size={20} color="#1c1c15" />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={24} color="#424843" />
            </TouchableOpacity>
          ))}

          {/* Logout */}
          <TouchableOpacity style={[styles.menuRow, { borderBottomWidth: 0 }]} onPress={handleLogout}>
            <View style={[styles.menuIcon, { backgroundColor: '#fee2e2', borderColor: '#dc2626' }]}>
              <Ionicons name="log-out-outline" size={20} color="#dc2626" />
            </View>
            <Text style={[styles.menuLabel, { color: '#dc2626' }]}>Keluar Sesi (Logout)</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#faf8f3', // cream - konsisten dengan HomeScreen
    paddingHorizontal: 20 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center',
    marginTop: 50, 
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1c1c15', // on-background
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  avatarText: { 
    fontSize: 48, 
    fontWeight: '800', 
    color: '#01190a' // primary
  },
  name: { 
    fontSize: 24, 
    fontWeight: '800', 
    color: '#1c1c15', // on-background
    textAlign: 'center', 
    marginBottom: 8 
  },
  email: { 
    fontSize: 14, 
    color: '#424843', // on-surface-variant
    textAlign: 'center', 
    marginBottom: 36,
    fontWeight: '600',
  },
  menuContainer: { 
    backgroundColor: '#ffffff', 
    borderRadius: 16, 
    borderWidth: 2,
    borderColor: '#01190a',
    overflow: 'hidden',
  },
  menuRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 18, 
    gap: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: '#f1eee3'
  },
  menuIcon: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#f1eee3',
    borderWidth: 2,
    borderColor: '#01190a',
  },
  menuIconText: { 
    fontSize: 20,
  },
  menuLabel: { 
    flex: 1, 
    fontSize: 15, 
    fontWeight: '700', 
    color: '#1c1c15' // on-background
  },
  menuArrow: { 
    fontSize: 24, 
    color: '#424843', // on-surface-variant
    fontWeight: '800',
  },
});
