import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';

const UEQ_ITEMS = [
  { id: 1, left: 'menyusahkan', right: 'menyenangkan', dimension: 'attractiveness', reverse: false },
  { id: 2, left: 'tidak dapat dipahami', right: 'dapat dipahami', dimension: 'perspicuity', reverse: false },
  { id: 3, left: 'kreatif', right: 'monoton', dimension: 'novelty', reverse: true },
  { id: 4, left: 'mudah dipelajari', right: 'sulit dipelajari', dimension: 'perspicuity', reverse: true },
  { id: 5, left: 'bernilai', right: 'tidak bernilai', dimension: 'stimulation', reverse: true },
  { id: 6, left: 'membosankan', right: 'mengasyikkan', dimension: 'stimulation', reverse: false },
  { id: 7, left: 'tidak menarik', right: 'menarik', dimension: 'stimulation', reverse: false },
  { id: 8, left: 'tidak dapat diprediksi', right: 'dapat diprediksi', dimension: 'dependability', reverse: false },
  { id: 9, left: 'cepat', right: 'lambat', dimension: 'efficiency', reverse: true },
  { id: 10, left: 'berdaya cipta', right: 'konvensional', dimension: 'novelty', reverse: true },
  { id: 11, left: 'menghalangi', right: 'mendukung', dimension: 'dependability', reverse: false },
  { id: 12, left: 'baik', right: 'buruk', dimension: 'attractiveness', reverse: true },
  { id: 13, left: 'rumit', right: 'sederhana', dimension: 'perspicuity', reverse: false },
  { id: 14, left: 'tidak disukai', right: 'menggembirakan', dimension: 'attractiveness', reverse: false },
  { id: 15, left: 'biasa', right: 'inovatif', dimension: 'novelty', reverse: false },
  { id: 16, left: 'tidak nyaman', right: 'nyaman', dimension: 'attractiveness', reverse: false },
  { id: 17, left: 'aman', right: 'tidak aman', dimension: 'dependability', reverse: true },
  { id: 18, left: 'memotivasi', right: 'tidak memotivasi', dimension: 'stimulation', reverse: true },
  { id: 19, left: 'memenuhi ekspektasi', right: 'tidak memenuhi ekspektasi', dimension: 'dependability', reverse: true },
  { id: 20, left: 'tidak efisien', right: 'efisien', dimension: 'efficiency', reverse: false },
  { id: 21, left: 'jelas', right: 'membingungkan', dimension: 'perspicuity', reverse: true },
  { id: 22, left: 'tidak praktis', right: 'praktis', dimension: 'efficiency', reverse: false },
  { id: 23, left: 'terorganisasi', right: 'berantakan', dimension: 'efficiency', reverse: true },
  { id: 24, left: 'menarik', right: 'tidak menarik', dimension: 'attractiveness', reverse: true },
  { id: 25, left: 'ramah pengguna', right: 'tidak ramah pengguna', dimension: 'attractiveness', reverse: true },
  { id: 26, left: 'konservatif', right: 'inovatif', dimension: 'novelty', reverse: false },
];

const DIMENSIONS: Record<string, string> = {
  attractiveness: 'Daya Tarik',
  perspicuity: 'Kejelasan',
  efficiency: 'Efisiensi',
  dependability: 'Keterpercayaan',
  stimulation: 'Stimulasi',
  novelty: 'Kebaruan',
};

const getInterpretation = (val: number) => {
  if (val >= 1.5) return { label: 'Excellent', color: '#15803d' };
  if (val >= 0.5) return { label: 'Good', color: '#65a30d' };
  if (val >= -0.5) return { label: 'Netral', color: '#d97706' };
  if (val >= -1.5) return { label: 'Bad', color: '#dc2626' };
  return { label: 'Terrible', color: '#7f1d1d' };
};

export default function DetailKuesionerSiswaScreen({ route, navigation }: any) {
  const { student } = route.params;
  const answers = student.ueqAnswers || {};
  const dimensionsData = student.ueqData || {};

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={{ fontWeight: 'bold' }}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detail Kuesioner Siswa</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.infoCard}>
          <View style={styles.profileRow}>
            {student.photoUrl ? (
              <Image source={{ uri: student.photoUrl }} style={styles.profileAvatar} />
            ) : (
              <View style={styles.profileAvatarPlaceholder}>
                <Text style={styles.profileAvatarInitial}>
                  {student.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.infoName}>{student.name}</Text>
              <Text style={styles.infoEmail}>{student.email}</Text>
              {student.sekolah && <Text style={styles.infoSchool}>🏫 {student.sekolah}</Text>}
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Jawaban Kuesioner (UEQ)</Text>
        
        {UEQ_ITEMS.map((item) => {
          const selectedVal = answers[item.id] || 0;
          return (
            <View key={item.id} style={styles.questionCard}>
              <View style={styles.questionHeader}>
                <Text style={styles.questionNumber}>{item.id}</Text>
                <View style={styles.labelsContainer}>
                  <Text style={styles.labelText}>{item.left}</Text>
                  <Text style={styles.labelText}>{item.right}</Text>
                </View>
              </View>

              <View style={styles.optionsContainer}>
                {[1, 2, 3, 4, 5, 6, 7].map(val => {
                  const isSelected = selectedVal === val;
                  return (
                    <View key={val} style={[styles.optionCircle, isSelected && styles.optionSelected]}>
                      <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                        {val}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          );
        })}

        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Hasil Analisis Dimensi</Text>
        <View style={styles.tableCard}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCell, styles.tableHeadText, { flex: 2 }]}>Dimensi</Text>
            <Text style={[styles.tableCell, styles.tableHeadText]}>Skor</Text>
            <Text style={[styles.tableCell, styles.tableHeadText]}>Status</Text>
          </View>
          {Object.keys(DIMENSIONS).map(k => {
            const val = dimensionsData[k] || 0;
            const interp = getInterpretation(val);
            return (
              <View key={k} style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 2 }]}>{DIMENSIONS[k]}</Text>
                <Text style={[styles.tableCell, { fontWeight: 'bold', color: interp.color }]}>
                  {val > 0 ? '+' : ''}{val}
                </Text>
                <Text style={[styles.tableCell, { color: interp.color, fontSize: 11 }]}>
                  {interp.label}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={{ height: 60 }} />
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
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backBtn: {
    width: 32,
    height: 32,
    borderWidth: 2,
    borderColor: '#333',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  scroll: { padding: 16 },
  infoCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  profileAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#e5e7eb',
  },
  profileAvatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#166534',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileAvatarInitial: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
  },
  infoName: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  infoEmail: { fontSize: 14, color: '#6b7280', marginTop: 2 },
  infoSchool: { fontSize: 13, color: '#4b5563', marginTop: 6 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#374151', marginBottom: 12 },
  
  questionCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  questionHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  questionNumber: {
    width: 28,
    height: 28,
    backgroundColor: '#e6f4ea',
    color: '#166534',
    textAlign: 'center',
    textAlignVertical: 'center',
    borderRadius: 14,
    fontWeight: 'bold',
    marginRight: 12,
  },
  labelsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  labelText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4b5563',
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  optionCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  optionSelected: {
    backgroundColor: '#166534',
    borderColor: '#14532d',
  },
  optionText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4b5563',
  },
  optionTextSelected: {
    color: '#fff',
  },

  tableCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tableRow: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  tableCell: {
    flex: 1,
    fontSize: 13,
    color: '#374151',
  },
  tableHeadText: {
    fontWeight: 'bold',
    color: '#111827',
  },
});
