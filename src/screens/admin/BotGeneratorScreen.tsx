import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator, Alert, FlatList
} from 'react-native';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

// ─── UEQ Items (sama persis dengan UEQFormScreen) ────────────────────────────
const UEQ_ITEMS = [
  { id: 1,  left: 'menyusahkan',             right: 'menyenangkan',              dimension: 'attractiveness', reverse: false },
  { id: 2,  left: 'tidak dapat dipahami',    right: 'dapat dipahami',            dimension: 'perspicuity',   reverse: false },
  { id: 3,  left: 'kreatif',                 right: 'monoton',                   dimension: 'novelty',       reverse: true  },
  { id: 4,  left: 'mudah dipelajari',        right: 'sulit dipelajari',          dimension: 'perspicuity',   reverse: true  },
  { id: 5,  left: 'bernilai',               right: 'tidak bernilai',            dimension: 'stimulation',   reverse: true  },
  { id: 6,  left: 'membosankan',            right: 'mengasyikkan',              dimension: 'stimulation',   reverse: false },
  { id: 7,  left: 'tidak menarik',          right: 'menarik',                   dimension: 'stimulation',   reverse: false },
  { id: 8,  left: 'tidak dapat diprediksi', right: 'dapat diprediksi',          dimension: 'dependability', reverse: false },
  { id: 9,  left: 'cepat',                  right: 'lambat',                    dimension: 'efficiency',    reverse: true  },
  { id: 10, left: 'berdaya cipta',          right: 'konvensional',              dimension: 'novelty',       reverse: true  },
  { id: 11, left: 'menghalangi',            right: 'mendukung',                 dimension: 'dependability', reverse: false },
  { id: 12, left: 'baik',                   right: 'buruk',                     dimension: 'attractiveness',reverse: true  },
  { id: 13, left: 'rumit',                  right: 'sederhana',                 dimension: 'perspicuity',   reverse: false },
  { id: 14, left: 'tidak disukai',          right: 'menggembirakan',            dimension: 'attractiveness',reverse: false },
  { id: 15, left: 'biasa',                  right: 'inovatif',                  dimension: 'novelty',       reverse: false },
  { id: 16, left: 'tidak nyaman',           right: 'nyaman',                    dimension: 'attractiveness',reverse: false },
  { id: 17, left: 'aman',                   right: 'tidak aman',                dimension: 'dependability', reverse: true  },
  { id: 18, left: 'memotivasi',             right: 'tidak memotivasi',          dimension: 'stimulation',   reverse: true  },
  { id: 19, left: 'memenuhi ekspektasi',    right: 'tidak memenuhi ekspektasi', dimension: 'dependability', reverse: true  },
  { id: 20, left: 'tidak efisien',          right: 'efisien',                   dimension: 'efficiency',    reverse: false },
  { id: 21, left: 'jelas',                  right: 'membingungkan',             dimension: 'perspicuity',   reverse: true  },
  { id: 22, left: 'tidak praktis',          right: 'praktis',                   dimension: 'efficiency',    reverse: false },
  { id: 23, left: 'terorganisasi',          right: 'berantakan',                dimension: 'efficiency',    reverse: true  },
  { id: 24, left: 'menarik',               right: 'tidak menarik',             dimension: 'attractiveness',reverse: true  },
  { id: 25, left: 'ramah pengguna',         right: 'tidak ramah pengguna',      dimension: 'attractiveness',reverse: true  },
  { id: 26, left: 'konservatif',            right: 'inovatif',                  dimension: 'novelty',       reverse: false },
];

// ─── Target rata-rata skor per dimensi ───────────────────────────────────────
const TARGET_MEANS: Record<string, number> = {
  attractiveness: 1.65,
  perspicuity:    2.10,
  efficiency:     1.75,
  dependability:  1.20,
  stimulation:    1.55,
  novelty:        1.35,
};

// ─── Data demografis untuk distribusi 50 responden ───────────────────────────
const MALE_NAMES   = ['Budi','Andi','Dika','Farhan','Gilang','Hendra','Irfan','Kurnia','Lukman','Maulana','Nanda','Putra','Ridwan','Sandi','Teguh','Wahyu','Yudha','Arief','Bagas','Fauzan'];
const FEMALE_NAMES = ['Ani','Bunga','Citra','Dewi','Fitri','Gita','Hana','Indah','Jasmine','Kartika','Laila','Maya','Nabila','Putri','Rini','Sari','Tari','Ulfa','Vina','Wati','Yani','Zahra','Amelia','Bella','Cindy','Dian','Eka','Farah','Gina','Intan'];
const SURNAMES     = ['Santoso','Wijaya','Rahayu','Sari','Utama','Pratama','Saputra','Hidayat','Kusuma','Nugroho','Wibowo','Hartono','Susanto','Permata','Dewanti','Cahyani','Lestari','Purnama','Suryadi','Hakim'];

const rnd = () => Math.random();
const pick = <T,>(arr: T[]): T => arr[Math.floor(rnd() * arr.length)];
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

// ─── Generate jawaban UEQ realistis ──────────────────────────────────────────
const generateAnswers = (profile: number): Record<number, number> => {
  // Setiap profil punya "bias" unik agar bervariasi antar responden
  const bias = (rnd() - 0.5) * 0.8; // -0.4 ~ +0.4 per responden

  const answers: Record<number, number> = {};
  UEQ_ITEMS.forEach(item => {
    const target = TARGET_MEANS[item.dimension];
    // Hitung target raw (skala 1-7)
    // non-reverse: final = raw-4 → raw = final+4
    // reverse:     final = 4-raw  → raw = 4-final
    const targetRaw = item.reverse ? (4 - target) : (target + 4);
    const noise = (rnd() - 0.5) * 2.4 + bias; // ±1.2 ± bias
    answers[item.id] = clamp(Math.round(targetRaw + noise), 1, 7);
  });
  return answers;
};

// ─── Hitung dimensi dari jawaban (sama persis dengan UEQFormScreen) ───────────
const calcDimensions = (answers: Record<number, number>): Record<string, number> => {
  const dims: Record<string, number[]> = {
    attractiveness: [], perspicuity: [], efficiency: [],
    dependability: [], stimulation: [], novelty: [],
  };
  UEQ_ITEMS.forEach(item => {
    const raw = answers[item.id];
    if (raw === undefined) return;
    const converted = raw - 4;
    const final = item.reverse ? -converted : converted;
    dims[item.dimension].push(final);
  });
  const means: Record<string, number> = {};
  Object.entries(dims).forEach(([k, v]) => {
    means[k] = v.length > 0 ? parseFloat((v.reduce((a, b) => a + b, 0) / v.length).toFixed(2)) : 0;
  });
  return means;
};

// ─── Tipe data responden ──────────────────────────────────────────────────────
interface Responden {
  no: number;
  name: string;
  gender: 'Laki-laki' | 'Perempuan';
  ageGroup: '< 18 Tahun' | '18–25 Tahun' | '> 25 Tahun';
  education: 'SMA/Sederajat' | 'Diploma/Sarjana' | 'Lainnya';
  answers: Record<number, number>;
  dimensions: Record<string, number>;
  simulasiScore: number;
  submittedAt: Date;
}

// ─── Rencana distribusi 50 responden ─────────────────────────────────────────
// Gender: L=19, P=31
// Usia: <18=7, 18-25=32, >25=11
// Edu: SMA=13, Diploma/Sarjana=33, Lainnya=4
const buildDemographics = (i: number): Pick<Responden, 'gender' | 'name' | 'ageGroup' | 'education'> => {
  const gender: 'Laki-laki' | 'Perempuan' = i < 19 ? 'Laki-laki' : 'Perempuan';
  const name = gender === 'Laki-laki'
    ? `${pick(MALE_NAMES)} ${pick(SURNAMES)}`
    : `${pick(FEMALE_NAMES)} ${pick(SURNAMES)}`;

  let ageGroup: '< 18 Tahun' | '18–25 Tahun' | '> 25 Tahun';
  if (i < 7) ageGroup = '< 18 Tahun';
  else if (i < 39) ageGroup = '18–25 Tahun';
  else ageGroup = '> 25 Tahun';

  let education: 'SMA/Sederajat' | 'Diploma/Sarjana' | 'Lainnya';
  if (i < 13) education = 'SMA/Sederajat';
  else if (i < 46) education = 'Diploma/Sarjana';
  else education = 'Lainnya';

  return { gender, name, ageGroup, education };
};

// ─── Generate 50 responden ────────────────────────────────────────────────────
const generateResponden = (): Responden[] => {
  const list: Responden[] = [];
  // Shuffle index agar demografi tidak terlihat berurutan
  const indices = Array.from({ length: 50 }, (_, i) => i);
  // Fisher-Yates shuffle
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  for (let i = 0; i < 50; i++) {
    const demo = buildDemographics(indices[i]);
    const answers = generateAnswers(i);
    const dimensions = calcDimensions(answers);
    // Sebaran waktu submit: acak dalam 14 hari terakhir
    const daysAgo = Math.floor(rnd() * 14);
    const hoursAgo = Math.floor(rnd() * 20) + 6;
    const submittedAt = new Date();
    submittedAt.setDate(submittedAt.getDate() - daysAgo);
    submittedAt.setHours(hoursAgo, Math.floor(rnd() * 60));

    list.push({
      no: i + 1,
      name: demo.name,
      gender: demo.gender,
      ageGroup: demo.ageGroup,
      education: demo.education,
      answers,
      dimensions,
      simulasiScore: clamp(Math.round(60 + rnd() * 40), 60, 100),
      submittedAt,
    });
  }
  return list;
};

// ─── Komponen Utama ───────────────────────────────────────────────────────────
const DIM_SHORT: Record<string, string> = {
  attractiveness: 'Attrac.', perspicuity: 'Perspic.',
  efficiency: 'Effic.', dependability: 'Depend.',
  stimulation: 'Stimul.', novelty: 'Novel.',
};

export default function BotGeneratorScreen({ navigation }: any) {
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState<Responden[]>([]);
  const [overallMeans, setOverallMeans] = useState<Record<string, number>>({});

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      const data = generateResponden();
      // Hitung rata-rata keseluruhan
      const sums: Record<string, number> = {
        attractiveness: 0, perspicuity: 0, efficiency: 0,
        dependability: 0, stimulation: 0, novelty: 0,
      };
      data.forEach(r => {
        Object.keys(sums).forEach(k => { sums[k] += r.dimensions[k] || 0; });
      });
      const means: Record<string, number> = {};
      Object.keys(sums).forEach(k => {
        means[k] = parseFloat((sums[k] / data.length).toFixed(2));
      });
      setOverallMeans(means);
      setPreview(data);
      setGenerating(false);
    }, 800);
  };

  const handleSave = async () => {
    if (preview.length === 0) {
      Alert.alert('Info', 'Generate data terlebih dahulu.');
      return;
    }
    Alert.alert(
      'Konfirmasi Simpan',
      `Simpan ${preview.length} responden bot ke database Firebase?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Simpan',
          style: 'default',
          onPress: async () => {
            setSaving(true);
            try {
              const col = collection(db, 'ueq_responses');
              await Promise.all(
                preview.map(r =>
                  addDoc(col, {
                    userId: `bot_${r.no}_${Date.now()}`,
                    name: r.name,
                    gender: r.gender,
                    ageGroup: r.ageGroup,
                    education: r.education,
                    answers: r.answers,
                    dimensions: r.dimensions,
                    simulasiScore: r.simulasiScore,
                    submittedAt: r.submittedAt,
                    isBot: true,
                  })
                )
              );
              Alert.alert('Berhasil! ✅', `${preview.length} data responden berhasil disimpan ke Firebase.`, [
                { text: 'Lihat Analitik', onPress: () => navigation.replace('UEQAnalitik') },
                { text: 'OK' },
              ]);
            } catch (e) {
              console.error(e);
              Alert.alert('Error', 'Gagal menyimpan data. Coba lagi.');
            } finally {
              setSaving(false);
            }
          },
        },
      ]
    );
  };

  const handleReset = () => {
    setPreview([]);
    setOverallMeans({});
  };

  const getInterpretation = (val: number) => {
    if (val >= 1.5) return { label: 'Excellent', color: '#15803d' };
    if (val >= 0.5) return { label: 'Good', color: '#65a30d' };
    if (val >= -0.5) return { label: 'Netral', color: '#d97706' };
    return { label: 'Bad', color: '#dc2626' };
  };

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.iconCircle}>
          <Text style={{ fontWeight: 'bold' }}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Bot Generator Kuesioner</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Info card */}
        <View style={s.infoCard}>
          <Text style={s.infoTitle}>🤖 Auto-Generate 50 Responden</Text>
          <Text style={s.infoDesc}>
            Sistem akan membuat 50 data responden sintetis dengan distribusi demografis dan skor UEQ yang telah dikonfigurasi. Data disimpan langsung ke Firebase.
          </Text>
          <View style={s.targetGrid}>
            {Object.entries(TARGET_MEANS).map(([k, v]) => (
              <View key={k} style={s.targetChip}>
                <Text style={s.targetKey}>{DIM_SHORT[k]}</Text>
                <Text style={s.targetVal}>+{v}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Tombol Generate */}
        <TouchableOpacity
          style={[s.genBtn, generating && { opacity: 0.7 }]}
          onPress={handleGenerate}
          disabled={generating || saving}
        >
          {generating
            ? <ActivityIndicator color="#fff" />
            : <Text style={s.genBtnText}>🤖 Generate 50 Responden</Text>}
        </TouchableOpacity>

        {/* Preview ringkasan skor rata-rata */}
        {preview.length > 0 && (
          <>
            <View style={s.summaryCard}>
              <Text style={s.summaryTitle}>📊 Rata-rata Skor Keseluruhan (N=50)</Text>
              {Object.entries(overallMeans).map(([k, v]) => {
                const interp = getInterpretation(v);
                return (
                  <View key={k} style={s.summaryRow}>
                    <Text style={s.summaryDim}>{k.charAt(0).toUpperCase() + k.slice(1)}</Text>
                    <Text style={[s.summaryVal, { color: interp.color }]}>
                      {v > 0 ? '+' : ''}{v}
                    </Text>
                    <Text style={[s.summaryInterp, { color: interp.color }]}>{interp.label}</Text>
                  </View>
                );
              })}
            </View>

            {/* Preview tabel responden */}
            <Text style={s.tableLabel}>👀 Preview Data Responden ({preview.length} orang)</Text>
            {preview.map(r => (
              <View key={r.no} style={s.respCard}>
                <View style={s.respHeader}>
                  <Text style={s.respNo}>#{r.no}</Text>
                  <Text style={s.respName}>{r.name}</Text>
                  <Text style={s.respGender}>
                    {r.gender === 'Laki-laki' ? '♂' : '♀'}
                  </Text>
                </View>
                <Text style={s.respDemo}>
                  {r.ageGroup} · {r.education}
                </Text>
                <View style={s.dimMiniGrid}>
                  {Object.entries(r.dimensions).map(([k, v]) => (
                    <View key={k} style={s.dimMiniChip}>
                      <Text style={s.dimMiniKey}>{DIM_SHORT[k]}</Text>
                      <Text style={[s.dimMiniVal, { color: v >= 0.5 ? '#15803d' : '#d97706' }]}>
                        {v > 0 ? '+' : ''}{v}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}

            {/* Action buttons */}
            <View style={s.actionRow}>
              <TouchableOpacity style={s.resetBtn} onPress={handleReset} disabled={saving}>
                <Text style={s.resetBtnText}>↺ Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.saveBtn, saving && { opacity: 0.7 }]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={s.saveBtnText}>💾 Simpan ke Database</Text>}
              </TouchableOpacity>
            </View>
          </>
        )}

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 20, paddingTop: 50, borderBottomWidth: 1, borderBottomColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  iconCircle: { width: 32, height: 32, borderWidth: 2, borderColor: '#333', borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
  scroll: { flex: 1, padding: 20 },

  // Info card
  infoCard: { backgroundColor: '#f0fdf4', borderRadius: 12, padding: 16, marginBottom: 20, borderWidth: 1.5, borderColor: '#2e7d32' },
  infoTitle: { fontSize: 15, fontWeight: 'bold', color: '#14532d', marginBottom: 8 },
  infoDesc: { fontSize: 12, color: '#374151', lineHeight: 18, marginBottom: 12 },
  targetGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  targetChip: { backgroundColor: '#dcfce7', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, alignItems: 'center' },
  targetKey: { fontSize: 10, color: '#374151', fontWeight: '700' },
  targetVal: { fontSize: 12, color: '#15803d', fontWeight: 'bold' },

  // Generate button
  genBtn: { backgroundColor: '#374151', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4 },
  genBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },

  // Summary card
  summaryCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1.5, borderColor: '#e5e7eb' },
  summaryTitle: { fontSize: 13, fontWeight: 'bold', color: '#111827', marginBottom: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  summaryDim: { flex: 2, fontSize: 12, color: '#374151', fontWeight: '600' },
  summaryVal: { flex: 1, fontSize: 13, fontWeight: 'bold', textAlign: 'center' },
  summaryInterp: { flex: 1, fontSize: 11, textAlign: 'right' },

  // Table label
  tableLabel: { fontSize: 13, fontWeight: 'bold', color: '#374151', marginBottom: 10 },

  // Responden card
  respCard: { backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#e5e7eb' },
  respHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  respNo: { fontSize: 11, color: '#9ca3af', fontWeight: 'bold', marginRight: 6 },
  respName: { flex: 1, fontSize: 13, fontWeight: 'bold', color: '#111827' },
  respGender: { fontSize: 16 },
  respDemo: { fontSize: 11, color: '#6b7280', marginBottom: 10 },
  dimMiniGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  dimMiniChip: { backgroundColor: '#f9fafb', borderRadius: 6, padding: 6, alignItems: 'center', minWidth: 60 },
  dimMiniKey: { fontSize: 9, color: '#6b7280' },
  dimMiniVal: { fontSize: 11, fontWeight: 'bold' },

  // Action row
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 16, marginBottom: 20 },
  resetBtn: { flex: 1, borderWidth: 1.5, borderColor: '#9ca3af', borderRadius: 10, padding: 14, alignItems: 'center' },
  resetBtnText: { color: '#6b7280', fontWeight: 'bold', fontSize: 13 },
  saveBtn: { flex: 2, backgroundColor: '#15803d', borderRadius: 10, padding: 14, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4 },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
});
