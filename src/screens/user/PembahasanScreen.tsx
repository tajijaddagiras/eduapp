import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface WrongAnswer {
  name: string;
  userAnswer: string;
  userAnswerText?: string;    // Teks lengkap pilihan (khusus pilihan ganda)
  correctAnswer: string;
  correctAnswerText?: string; // Teks lengkap jawaban benar (khusus pilihan ganda)
  explanation?: string;
  imageUrl?: string | null;
}

export default function PembahasanScreen({ navigation, route }: any) {
  const { wrongAnswers = [], evaluasiName = 'Simulasi' } = route.params || {};

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#01190a" />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={styles.headerTitle}>Pembahasan Salah</Text>
          <Text style={styles.headerSub}>{evaluasiName}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {wrongAnswers.length === 0 ? (
          /* Empty state — semua benar */
          <View style={styles.emptyBox}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="checkmark-circle" size={64} color="#2e7d32" />
            </View>
            <Text style={styles.emptyTitle}>Sempurna! 🎉</Text>
            <Text style={styles.emptySubtext}>Anda menjawab semua soal dengan benar.</Text>
            <TouchableOpacity style={styles.backHomeBtn} onPress={() => navigation.navigate('UserTabs')}>
              <Text style={styles.backHomeBtnText}>Kembali ke Beranda</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Info banner */}
            <View style={styles.infoBanner}>
              <Ionicons name="information-circle" size={18} color="#01190a" />
              <Text style={styles.infoText}>
                Terdapat <Text style={{ fontWeight: '800' }}>{wrongAnswers.length} soal</Text> yang perlu ditinjau ulang.
              </Text>
            </View>

            {wrongAnswers.map((item: WrongAnswer, i: number) => (
              <View key={i} style={styles.itemCard}>
                {/* Card Header: nomor + nama */}
                <View style={styles.cardHeader}>
                  <View style={styles.itemNumber}>
                    <Text style={styles.itemNumberText}>{i + 1}</Text>
                  </View>
                  <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                </View>

                {/* Image — dari database jika ada */}
                <View style={styles.imageWrapper}>
                  {item.imageUrl ? (
                    <Image
                      source={{ uri: item.imageUrl }}
                      style={styles.itemImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <Ionicons name="image-outline" size={40} color="#c2c8c0" />
                      <Text style={styles.imagePlaceholderText}>Tidak ada gambar</Text>
                    </View>
                  )}
                </View>

                {/* Jawaban row — tampilkan teks lengkap jika ada (pilihan ganda) */}
                <View style={styles.answersRow}>
                  <View style={[styles.answerChip, styles.answerChipWrong]}>
                    <Ionicons name="close-circle" size={14} color="#dc2626" />
                    <Text style={styles.answerChipWrongText} numberOfLines={3}>
                      Salah: {item.userAnswerText || item.userAnswer.toUpperCase()}
                    </Text>
                  </View>
                </View>
                <View style={styles.answersRow}>
                  <View style={[styles.answerChip, styles.answerChipCorrect]}>
                    <Ionicons name="checkmark-circle" size={14} color="#2e7d32" />
                    <Text style={styles.answerChipCorrectText} numberOfLines={3}>
                      Benar: {item.correctAnswerText || item.correctAnswer.toUpperCase()}
                    </Text>
                  </View>
                </View>

                {/* Explanation box */}
                {!!item.explanation && (
                  <View style={styles.explanationBox}>
                    <Text style={styles.explanationLabel}>Penjelasan</Text>
                    <Text style={styles.explanationText}>
                      {item.explanation}
                    </Text>
                  </View>
                )}
              </View>
            ))}

            <TouchableOpacity style={styles.backHomeBtn} onPress={() => navigation.navigate('UserTabs')}>
              <Text style={styles.backHomeBtnText}>Selesai & Kembali ke Beranda</Text>
            </TouchableOpacity>
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fcf9ee', // background
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
    backgroundColor: '#fcf9ee',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e2d8', // surface-variant
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#01190a',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1c1c15',
  },
  headerSub: {
    fontSize: 12,
    color: '#424843',
    fontWeight: '600',
    marginTop: 2,
  },

  scroll: { flex: 1 },
  scrollContent: { padding: 20 },

  // Info banner
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f1eee3',
    borderWidth: 1.5,
    borderColor: '#c2c8c0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#424843',
    fontWeight: '500',
    lineHeight: 20,
  },

  // Item Card
  itemCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#e5e2d8',
    borderLeftWidth: 4,
    borderLeftColor: '#01190a',
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  itemNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#142e1d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemNumberText: {
    color: '#cbead0',
    fontSize: 13,
    fontWeight: '800',
  },
  itemName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    color: '#1c1c15',
    lineHeight: 22,
  },

  // Image
  imageWrapper: {
    width: '100%',
    height: 180,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 14,
    borderWidth: 2,
    borderColor: '#e5e2d8',
    backgroundColor: '#f7f4e9',
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  imagePlaceholderText: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '600',
  },

  // Answer chips
  answersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
    flexWrap: 'wrap',
  },
  answerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1.5,
    flex: 1, // Allow chip to grow/shrink
    width: '100%', // Take full width
  },
  answerChipWrong: {
    backgroundColor: '#fef2f2',
    borderColor: '#dc2626',
  },
  answerChipWrongText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#dc2626',
    flex: 1, // Allow text to wrap
  },
  answerChipCorrect: {
    backgroundColor: '#f0fdf4',
    borderColor: '#2e7d32',
  },
  answerChipCorrectText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2e7d32',
    flex: 1, // Allow text to wrap
  },

  // Explanation
  explanationBox: {
    backgroundColor: '#f7f4e9',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e2d8',
  },
  explanationLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#424843',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  explanationText: {
    fontSize: 13,
    color: '#1c1c15',
    lineHeight: 20,
    fontWeight: '500',
  },

  // Back home button
  backHomeBtn: {
    backgroundColor: '#142e1d',
    borderWidth: 2,
    borderColor: '#01190a',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.8,
    shadowRadius: 0,
    elevation: 5,
  },
  backHomeBtnText: {
    color: '#cbead0',
    fontWeight: '800',
    fontSize: 16,
  },

  // Empty state
  emptyBox: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  emptyIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0fdf4',
    borderWidth: 3,
    borderColor: '#2e7d32',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1c1c15',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 15,
    color: '#424843',
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
});
