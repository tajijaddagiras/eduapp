import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

interface WrongAnswer {
  name: string;
  userAnswer: string;
  correctAnswer: string;
  explanation?: string;
}

export default function PembahasanScreen({ navigation, route }: any) {
  const { wrongAnswers = [], evaluasiName = 'Simulasi' } = route.params || {};

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconCircle}>
          <Text style={{ fontWeight: 'bold' }}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pembahasan Salah</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView style={styles.scroll}>
        <Text style={styles.intro}>
          Tinjau kembali kesalahan Anda pada sesi simulasi sebelumnya untuk evaluasi perbaikan.
        </Text>

        {wrongAnswers.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>🎉</Text>
            <Text style={styles.emptyText}>Tidak ada kesalahan!</Text>
            <Text style={styles.emptySubtext}>Anda menjawab semua dengan benar.</Text>
          </View>
        ) : (
          wrongAnswers.map((item: WrongAnswer, i: number) => (
            <View key={i} style={styles.itemCard}>
              <View style={styles.cardTop}>
                <View style={styles.itemImage} />
                <View style={styles.cardInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.wrongText}>
                    Anda menjawab: {item.userAnswer.toUpperCase()} (SALAH)
                  </Text>
                </View>
              </View>
              <View style={styles.explanationBox}>
                <Text style={styles.correctAnswer}>
                  Jawaban Benar: {item.correctAnswer.toUpperCase()}
                </Text>
                <Text style={styles.explanation}>
                  {item.explanation ||
                    `${item.name} termasuk sampah ${item.correctAnswer} karena ${
                      item.correctAnswer === 'organik'
                        ? 'dapat terurai secara alami oleh mikroorganisme.'
                        : 'tidak dapat terurai secara alami dan perlu proses daur ulang khusus.'
                    }`
                  }
                </Text>
              </View>
            </View>
          ))
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: 50, borderBottomWidth: 1, borderBottomColor: '#e5e7eb', backgroundColor: '#fff' },
  iconCircle: { width: 32, height: 32, borderWidth: 2, borderColor: '#333', borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
  scroll: { flex: 1, padding: 20 },
  intro: { fontSize: 13, color: '#6b7280', marginBottom: 20, lineHeight: 20 },
  itemCard: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1.5, borderColor: '#e5e7eb', borderLeftWidth: 4, borderLeftColor: '#374151', padding: 16, marginBottom: 16 },
  cardTop: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  itemImage: { width: 48, height: 48, backgroundColor: '#e5e7eb', borderRadius: 8 },
  cardInfo: { flex: 1 },
  itemName: { fontSize: 15, fontWeight: 'bold', color: '#111827', marginBottom: 4 },
  wrongText: { fontSize: 12, color: '#dc2626' },
  explanationBox: { backgroundColor: '#f3f4f6', padding: 12, borderRadius: 8 },
  correctAnswer: { fontSize: 12, fontWeight: 'bold', color: '#2e7d32', marginBottom: 6 },
  explanation: { fontSize: 12, color: '#374151', lineHeight: 18 },
  emptyBox: { alignItems: 'center', padding: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  emptySubtext: { fontSize: 13, color: '#6b7280', marginTop: 4 },
});
