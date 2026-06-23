import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';

export default function DetailMateriScreen({ route, navigation }: any) {
  const { materi } = route.params;
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const handleMarkDone = async () => {
    if (!user || done) return;
    setSaving(true);
    try {
      await setDoc(doc(db, 'progress', `${user.uid}_materi_${materi.id}`), {
        userId: user.uid,
        type: 'materi',
        materiId: materi.id,
        completedAt: new Date()
      });
      setDone(true);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconCircle}>
            <Text style={{ fontWeight: 'bold' }}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Materi</Text>
          <View style={styles.iconCircle}>
            <Text>•••</Text>
          </View>
        </View>

        {/* Banner */}
        {materi.imageUrl ? (
          <Image source={{ uri: materi.imageUrl }} style={[styles.banner, { borderWidth: 0 }]} />
        ) : (
          <View style={styles.banner}>
            <Text style={styles.bannerText}>[ BANNER GAMBAR ]</Text>
          </View>
        )}

        <View style={styles.body}>
          {/* Category Badge */}
          <View style={[styles.badge, materi.category === 'Anorganik' ? styles.badgeAnorg : styles.badgeOrg]}>
            <Text style={[styles.badgeText, materi.category === 'Anorganik' ? styles.badgeTextAnorg : styles.badgeTextOrg]}>
              [ {materi.category?.toUpperCase()} ]
            </Text>
          </View>

          <Text style={styles.title}>{materi.title}</Text>
          <Text style={styles.readTime}>Estimasi baca: 5 Menit</Text>

          <View style={styles.divider} />

          <Text style={styles.content}>
            {materi.content || 
              `Ini adalah materi tentang ${materi.title}. Konten lengkap materi ini dapat ditambahkan oleh admin melalui halaman pengelolaan materi.\n\nSampah dapat dibagi menjadi dua kategori utama: organik dan anorganik. Pemahaman yang baik tentang perbedaan keduanya sangat penting untuk pengelolaan sampah yang efektif.\n\nPilah sampah dengan benar adalah langkah awal menjaga lingkungan kita tetap bersih dan sehat untuk generasi mendatang.`
            }
          </Text>
        </View>
        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.doneBtn, done && styles.doneBtnActive]}
          onPress={handleMarkDone}
          disabled={saving || done}
        >
          {saving ? (
            <ActivityIndicator color="#2e7d32" />
          ) : (
            <Text style={[styles.doneBtnText, done && styles.doneBtnTextActive]}>
              {done ? '✓ Sudah Selesai Dibaca' : '[ ✓ ] Tandai Telah Selesai Dibaca'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: 50, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  iconCircle: { width: 32, height: 32, borderWidth: 2, borderColor: '#333', borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 15, fontWeight: 'bold', color: '#111827' },
  banner: { width: '100%', height: 200, backgroundColor: '#e5e7eb', borderWidth: 2, borderStyle: 'dashed', borderColor: '#9ca3af', justifyContent: 'center', alignItems: 'center' },
  bannerText: { color: '#6b7280', fontSize: 14 },
  body: { padding: 20 },
  badge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, alignSelf: 'flex-start', marginBottom: 10, borderWidth: 1 },
  badgeOrg: { borderColor: '#2e7d32', backgroundColor: '#f0fdf4' },
  badgeAnorg: { borderColor: '#dc2626', backgroundColor: '#fef2f2' },
  badgeText: { fontSize: 11, fontWeight: 'bold' },
  badgeTextOrg: { color: '#2e7d32' },
  badgeTextAnorg: { color: '#dc2626' },
  title: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 8 },
  readTime: { fontSize: 12, color: '#6b7280', marginBottom: 16 },
  divider: { height: 1, backgroundColor: '#e5e7eb', marginBottom: 16 },
  content: { fontSize: 14, color: '#374151', lineHeight: 22, textAlign: 'justify' },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  doneBtn: { borderWidth: 2, borderColor: '#2e7d32', borderRadius: 10, padding: 16, alignItems: 'center' },
  doneBtnActive: { backgroundColor: '#2e7d32' },
  doneBtnText: { fontWeight: 'bold', color: '#2e7d32', fontSize: 14 },
  doneBtnTextActive: { color: '#fff' },
});
