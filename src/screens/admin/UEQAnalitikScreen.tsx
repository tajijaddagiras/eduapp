import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert
} from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { db } from '../../config/firebase';

const DIMENSIONS: Record<string, string> = {
  attractiveness: 'Daya Tarik (Attractiveness)',
  perspicuity: 'Kejelasan (Perspicuity)',
  efficiency: 'Efisiensi (Efficiency)',
  dependability: 'Keterpercayaan (Dependability)',
  stimulation: 'Stimulasi (Stimulation)',
  novelty: 'Kebaruan (Novelty)',
};

const DIM_KEYS = Object.keys(DIMENSIONS);

interface Response {
  userId: string;
  dimensions: Record<string, number>;
  simulasiScore: number;
  submittedAt: any;
  gender?: string;
  ageGroup?: string;
  education?: string;
}

export default function UEQAnalitikScreen({ navigation }: any) {
  const [responses, setResponses] = useState<Response[]>([]);
  const [loading, setLoading] = useState(true);
  const [means, setMeans] = useState<Record<string, number>>({});
  const [demographics, setDemographics] = useState<{
    gender: Record<string, number>;
    ageGroup: Record<string, number>;
    education: Record<string, number>;
  }>({
    gender: { 'Laki-laki': 0, 'Perempuan': 0 },
    ageGroup: { '< 18 Tahun': 0, '18–25 Tahun': 0, '> 25 Tahun': 0 },
    education: { 'SMA/Sederajat': 0, 'Diploma/Sarjana': 0, 'Lainnya': 0 }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const snap = await getDocs(collection(db, 'ueq_responses'));
        const data: Response[] = [];
        snap.forEach(doc => data.push(doc.data() as Response));
        setResponses(data);

        // Calculate mean per dimension across all respondents
        if (data.length > 0) {
          const sums: Record<string, number> = {};
          DIM_KEYS.forEach(k => { sums[k] = 0; });
          
          const demo = {
            gender: { 'Laki-laki': 0, 'Perempuan': 0 } as Record<string, number>,
            ageGroup: { '< 18 Tahun': 0, '18–25 Tahun': 0, '> 25 Tahun': 0 } as Record<string, number>,
            education: { 'SMA/Sederajat': 0, 'Diploma/Sarjana': 0, 'Lainnya': 0 } as Record<string, number>
          };

          data.forEach(r => {
            DIM_KEYS.forEach(k => {
              sums[k] += (r.dimensions?.[k] || 0);
            });
            // Demographics mapping
            if (r.gender && demo.gender[r.gender] !== undefined) demo.gender[r.gender]++;
            if (r.ageGroup && demo.ageGroup[r.ageGroup] !== undefined) demo.ageGroup[r.ageGroup]++;
            if (r.education && demo.education[r.education] !== undefined) demo.education[r.education]++;
          });
          
          setDemographics(demo);
          const meansCalc: Record<string, number> = {};
          DIM_KEYS.forEach(k => {
            meansCalc[k] = parseFloat((sums[k] / data.length).toFixed(2));
          });
          setMeans(meansCalc);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getInterpretation = (val: number) => {
    if (val >= 1.5) return { label: 'Excellent', color: '#15803d' };
    if (val >= 0.5) return { label: 'Good', color: '#65a30d' };
    if (val >= -0.5) return { label: 'Netral', color: '#d97706' };
    if (val >= -1.5) return { label: 'Bad', color: '#dc2626' };
    return { label: 'Terrible', color: '#7f1d1d' };
  };

  // Bar width: scale -3..+3 to 0..100% (center at 50%)
  const getBarStyle = (val: number) => {
    const pct = Math.min(Math.abs(val) / 3, 1) * 50;
    return { width: `${pct}%`, left: val >= 0 ? '50%' : undefined, right: val < 0 ? '50%' : undefined };
  };

  const handleExport = async () => {
    try {
      const total = responses.length;
      let csv = 'TABEL KARAKTERISTIK RESPONDEN\n';
      csv += 'Karakteristik,Kategori,Jumlah,Persentase\n';
      
      const appendDemo = (charName: string, dataObj: Record<string, number>) => {
        Object.entries(dataObj).forEach(([cat, count]) => {
          const pct = total > 0 ? ((count / total) * 100).toFixed(1) + '%' : '0%';
          csv += `${charName},${cat},${count},${pct}\n`;
        });
      };
      
      appendDemo('Jenis Kelamin', demographics.gender);
      appendDemo('Usia', demographics.ageGroup);
      appendDemo('Pendidikan Terakhir', demographics.education);
      
      csv += '\nTABEL HASIL UEQ\n';
      csv += 'Skala UEQ,Nilai Rata-rata,Kategori\n';
      DIM_KEYS.forEach(k => {
        const interp = getInterpretation(means[k] || 0);
        csv += `${DIMENSIONS[k]},${means[k] || 0},${interp.label}\n`;
      });
      
      const fileName = `Rekap_UEQ_EduSampah_${new Date().toISOString().split('T')[0]}.csv`;
      const fileUri = (FileSystem.documentDirectory || '') + fileName;
      
      await FileSystem.writeAsStringAsync(fileUri, csv, { encoding: FileSystem.EncodingType.UTF8 });
      
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: 'Bagikan Rekap Data UEQ',
        });
      } else {
        Alert.alert('Perhatian', 'Fitur berbagi tidak didukung di perangkat atau emulator ini, tetapi file berhasil dibuat.');
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Gagal Ekspor', 'Terjadi kesalahan saat membuat file CSV.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconCircle}>
          <Text style={{ fontWeight: 'bold' }}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rekap Kuesioner UX</Text>
        <View style={{ width: 32 }} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2e7d32" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Ringkasan */}
          <Text style={styles.summary}>
            Ringkasan nilai rata-rata dari{'\n'}
            <Text style={{ fontWeight: 'bold' }}>{responses.length} Responden (N={responses.length})</Text>
          </Text>

          {responses.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>Belum ada responden.</Text>
              <Text style={styles.emptySubtext}>Data akan muncul setelah user mengisi kuesioner UEQ.</Text>
            </View>
          ) : (
            <>
              {/* Tabel Karakteristik Responden */}
              <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>Karakteristik Responden</Text>
                <Text style={styles.chartSubtitle}>Distribusi Demografis dari {responses.length} Responden</Text>
                
                <View style={styles.tableHeader}>
                  <Text style={[styles.th, { flex: 2 }]}>Kategori</Text>
                  <Text style={[styles.th, { flex: 1, textAlign: 'center' }]}>Jumlah</Text>
                  <Text style={[styles.th, { flex: 1, textAlign: 'right' }]}>Persentase</Text>
                </View>
                
                <View style={styles.tableSectionTitle}><Text style={styles.sectionTitleText}>Jenis Kelamin</Text></View>
                {Object.entries(demographics.gender).map(([cat, count]) => (
                  <View key={`gender-${cat}`} style={styles.tableRow}>
                    <Text style={[styles.td, { flex: 2 }]}>{cat}</Text>
                    <Text style={[styles.td, { flex: 1, textAlign: 'center', fontWeight: 'bold' }]}>{count}</Text>
                    <Text style={[styles.td, { flex: 1, textAlign: 'right' }]}>{responses.length > 0 ? ((count/responses.length)*100).toFixed(1) : 0}%</Text>
                  </View>
                ))}

                <View style={styles.tableSectionTitle}><Text style={styles.sectionTitleText}>Usia</Text></View>
                {Object.entries(demographics.ageGroup).map(([cat, count]) => (
                  <View key={`age-${cat}`} style={styles.tableRow}>
                    <Text style={[styles.td, { flex: 2 }]}>{cat}</Text>
                    <Text style={[styles.td, { flex: 1, textAlign: 'center', fontWeight: 'bold' }]}>{count}</Text>
                    <Text style={[styles.td, { flex: 1, textAlign: 'right' }]}>{responses.length > 0 ? ((count/responses.length)*100).toFixed(1) : 0}%</Text>
                  </View>
                ))}

                <View style={styles.tableSectionTitle}><Text style={styles.sectionTitleText}>Pendidikan Terakhir</Text></View>
                {Object.entries(demographics.education).map(([cat, count]) => (
                  <View key={`edu-${cat}`} style={styles.tableRow}>
                    <Text style={[styles.td, { flex: 2 }]}>{cat}</Text>
                    <Text style={[styles.td, { flex: 1, textAlign: 'center', fontWeight: 'bold' }]}>{count}</Text>
                    <Text style={[styles.td, { flex: 1, textAlign: 'right' }]}>{responses.length > 0 ? ((count/responses.length)*100).toFixed(1) : 0}%</Text>
                  </View>
                ))}
              </View>

              {/* Chart Card */}
              <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>Skala Pengalaman Pengguna</Text>
                <Text style={styles.chartSubtitle}>Skala: -3 (Sangat Buruk) hingga +3 (Sangat Baik)</Text>

                {/* Zero line header */}
                <View style={styles.axisRow}>
                  <Text style={styles.axisLabel}>-3</Text>
                  <Text style={styles.axisLabel}>0</Text>
                  <Text style={styles.axisLabel}>+3</Text>
                </View>

                {DIM_KEYS.map(k => {
                  const val = means[k] || 0;
                  const interp = getInterpretation(val);
                  return (
                    <View key={k} style={styles.barRow}>
                      <Text style={styles.barLabel}>{DIMENSIONS[k]}</Text>
                      <View style={styles.barTrack}>
                        {/* Center zero line */}
                        <View style={styles.zeroLine} />
                        {/* Bar */}
                        <View style={[
                          styles.bar,
                          { backgroundColor: interp.color },
                          val >= 0
                            ? { left: '50%', width: `${Math.min(val / 3, 1) * 50}%` }
                            : { right: '50%', width: `${Math.min(Math.abs(val) / 3, 1) * 50}%` }
                        ]} />
                      </View>
                      <View style={styles.barMeta}>
                        <Text style={[styles.barValue, { color: interp.color }]}>{val > 0 ? '+' : ''}{val}</Text>
                        <Text style={[styles.barInterp, { color: interp.color }]}>{interp.label}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>

              {/* Stats Tabel */}
              <View style={styles.tableCard}>
                <Text style={styles.tableTitle}>Tabel Rekap Dimensi</Text>
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableCell, styles.tableHeadText, { flex: 2 }]}>Dimensi</Text>
                  <Text style={[styles.tableCell, styles.tableHeadText]}>Mean</Text>
                  <Text style={[styles.tableCell, styles.tableHeadText]}>Status</Text>
                </View>
                {DIM_KEYS.map(k => {
                  const val = means[k] || 0;
                  const interp = getInterpretation(val);
                  return (
                    <View key={k} style={styles.tableRow}>
                      <Text style={[styles.tableCell, { flex: 2, fontSize: 11 }]}>{DIMENSIONS[k]}</Text>
                      <Text style={[styles.tableCell, { fontWeight: 'bold', color: interp.color }]}>{val > 0 ? '+' : ''}{val}</Text>
                      <Text style={[styles.tableCell, { color: interp.color, fontSize: 11 }]}>{interp.label}</Text>
                    </View>
                  );
                })}
              </View>
            </>
          )}

          {/* Export Button */}
          <TouchableOpacity style={styles.exportBtn} onPress={handleExport}>
            <Text style={styles.exportText}>[ CSV ] Ekspor Data Mentah</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: 50, borderBottomWidth: 1, borderBottomColor: '#e5e7eb', backgroundColor: '#fff' },
  iconCircle: { width: 32, height: 32, borderWidth: 2, borderColor: '#333', borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
  scroll: { flex: 1, padding: 20 },
  summary: { textAlign: 'center', fontSize: 13, color: '#6b7280', marginBottom: 20, lineHeight: 22 },
  emptyBox: { alignItems: 'center', padding: 40, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1.5, borderColor: '#e5e7eb' },
  emptyText: { fontSize: 16, fontWeight: 'bold', color: '#374151' },
  emptySubtext: { fontSize: 12, color: '#6b7280', marginTop: 6, textAlign: 'center' },
  chartCard: { backgroundColor: '#fafafa', borderWidth: 2, borderColor: '#374151', borderRadius: 12, padding: 16, marginBottom: 20 },
  chartTitle: { fontSize: 15, fontWeight: 'bold', textAlign: 'center', marginBottom: 4 },
  chartSubtitle: { fontSize: 10, color: '#6b7280', textAlign: 'center', marginBottom: 16 },
  axisRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  axisLabel: { fontSize: 10, color: '#9ca3af', fontWeight: 'bold' },
  barRow: { marginBottom: 16 },
  barLabel: { fontSize: 11, fontWeight: 'bold', color: '#374151', marginBottom: 4 },
  barTrack: { height: 20, backgroundColor: '#e5e7eb', borderRadius: 4, position: 'relative', marginBottom: 4 },
  zeroLine: { position: 'absolute', left: '50%', top: 0, bottom: 0, width: 2, backgroundColor: '#9ca3af', zIndex: 2 },
  bar: { position: 'absolute', top: 2, bottom: 2, borderRadius: 3, zIndex: 1 },
  barMeta: { flexDirection: 'row', justifyContent: 'space-between' },
  barValue: { fontSize: 12, fontWeight: 'bold' },
  barInterp: { fontSize: 11 },
  tableCard: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1.5, borderColor: '#e5e7eb', overflow: 'hidden', marginBottom: 20 },
  tableTitle: { fontSize: 14, fontWeight: 'bold', padding: 14, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#f9fafb', paddingHorizontal: 14, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  tableRow: { flexDirection: 'row', paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  tableCell: { flex: 1, fontSize: 12, color: '#374151' },
  tableHeadText: { fontWeight: 'bold', color: '#111827' },
  exportBtn: { backgroundColor: '#374151', padding: 16, borderRadius: 12, alignItems: 'center' },
  exportText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  th: { fontSize: 12, fontWeight: 'bold', color: '#374151' },
  td: { fontSize: 12, color: '#4b5563' },
  tableSectionTitle: { backgroundColor: '#e5e7eb', paddingVertical: 4, paddingHorizontal: 8, marginTop: 8, borderRadius: 4 },
  sectionTitleText: { fontSize: 11, fontWeight: 'bold', color: '#374151' },
});
