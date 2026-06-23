import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

export default function SimulasiScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Evaluasi Pembelajaran</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Card: Evaluasi Teori */}
        <View style={[styles.card, styles.cardHighlight]}>
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Simulasi Interaktif</Text>
            </View>
          </View>
          <Text style={styles.cardTitle}>Praktek Pemilahan Sampah</Text>
          <Text style={styles.cardSub}>Tipe: Drag & Drop</Text>

          <View style={styles.cardFooter}>
            <Text style={styles.statusText}>Ayo mulai!</Text>
            <TouchableOpacity
              style={styles.btnOutline}
              onPress={() => navigation.navigate('DragAndDrop')}
            >
              <Text style={styles.btnOutlineText}>Mulai Simulasi</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Card: Simulasi (segera hadir) */}
        <View style={styles.card}>
          <View style={styles.badgeRow}>
            <View style={[styles.badge, { borderColor: '#9ca3af' }]}>
              <Text style={[styles.badgeText, { color: '#6b7280' }]}>Modul: Pengenalan Kompos</Text>
            </View>
          </View>
          <Text style={styles.cardTitle}>Evaluasi Teori Organik</Text>
          <Text style={styles.cardSub}>10 Soal • Tipe: Pilihan Ganda</Text>

          <View style={styles.cardFooter}>
            <Text style={styles.statusText}>Segera Hadir</Text>
            <View style={[styles.btnOutline, { borderColor: '#9ca3af' }]}>
              <Text style={[styles.btnOutlineText, { color: '#9ca3af' }]}>Terkunci</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 50, marginBottom: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  card: { backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 12, padding: 16, marginBottom: 16 },
  cardHighlight: { borderColor: '#2e7d32', backgroundColor: '#f9fafb' },
  badgeRow: { marginBottom: 10 },
  badge: { borderWidth: 1.5, borderColor: '#374151', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
  badgeText: { fontSize: 11, fontWeight: 'bold', color: '#374151' },
  cardTitle: { fontSize: 17, fontWeight: 'bold', color: '#111827', marginBottom: 4 },
  cardSub: { fontSize: 12, color: '#6b7280', marginBottom: 16 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  statusText: { fontSize: 13, color: '#6b7280' },
  btnOutline: { borderWidth: 2, borderColor: '#2e7d32', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8 },
  btnOutlineText: { color: '#2e7d32', fontWeight: 'bold', fontSize: 13 },
});
