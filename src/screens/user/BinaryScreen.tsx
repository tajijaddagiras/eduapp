import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { collection, getDocs, query, where, addDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';

interface Item {
  id: string;
  name: string;
  type: string;
}

export default function BinaryScreen({ route, navigation }: any) {
  const { user } = useAuth();
  const { kategoriId, kategoriName, levelId, levelName } = route.params || {};
  
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [disableButtons, setDisableButtons] = useState(false);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        let q = query(
          collection(db, 'soal'), 
          where('gameType', '==', 'Binary')
        );
        
        // Add kategori and level filters if provided
        if (kategoriId && levelId) {
          q = query(
            collection(db, 'soal'),
            where('gameType', '==', 'Binary'),
            where('kategoriId', '==', kategoriId),
            where('levelId', '==', levelId)
          );
        }
        
        const querySnapshot = await getDocs(q);
        const fetched: Item[] = [];
        querySnapshot.forEach(doc => {
          fetched.push({ id: doc.id, name: doc.data().name, type: doc.data().type });
        });
        setItems(fetched);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [kategoriId, levelId]);

  const handleAnswer = async (userAnswer: string) => {
    setDisableButtons(true);
    const item = items[currentIndex];
    const isCorrect = item.type === userAnswer;
    
    if (!isCorrect) {
      setWrongAnswers(prev => [...prev, {
        name: item.name,
        userAnswer: userAnswer,
        correctAnswer: item.type,
      }]);
    }

    const newScore = isCorrect ? score + 1 : score;
    if (isCorrect) setScore(newScore);

    // Show feedback briefly
    setFeedback(isCorrect ? '✓ Benar!' : '✗ Salah!');
    setTimeout(async () => {
      setFeedback(null);
      setDisableButtons(false);
      
      if (currentIndex < items.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // Game finished — save progress and navigate to result
        const finalScore = Math.round((newScore / items.length) * 100);
        try {
          if (user) {
            await addDoc(collection(db, 'progress'), {
              userId: user.uid,
              type: 'klasifikasi',
              score: finalScore,
              correctCount: newScore,
              totalItems: items.length,
              completedAt: new Date(),
            });
          }
        } catch (e) { console.error(e); }

        navigation.replace('HasilEvaluasi', {
          score: finalScore,
          totalItems: items.length,
          correctCount: newScore,
          wrongAnswers: wrongAnswers.concat(isCorrect ? [] : [{
            name: item.name, userAnswer, correctAnswer: item.type
          }]),
          evaluasiName: 'Klasifikasi Cepat',
        });
      }
    }, 800);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1d4ed8" />
        <Text style={styles.loadingText}>Menyiapkan Klasifikasi...</Text>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIcon}>
            <Text style={{ fontWeight: 'bold' }}>X</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Klasifikasi: 0 / 0</Text>
          <View style={{ width: 32 }} />
        </View>
        <Text style={styles.emptyText}>Belum ada soal klasifikasi.</Text>
      </View>
    );
  }

  const progress = ((currentIndex) / items.length) * 100;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIcon}>
          <Text style={{ fontWeight: 'bold' }}>X</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={styles.headerTitle}>Klasifikasi: {currentIndex + 1} / {items.length}</Text>
          {kategoriName && levelName && (
            <Text style={styles.headerSubtitle}>{kategoriName} - {levelName}</Text>
          )}
        </View>
        <View style={{ width: 32 }} />
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>

      {/* Instruction */}
      <Text style={styles.instruction}>Klasifikasi Cepat:{'\n'}Pilih kategori yang tepat!</Text>

      {/* Feedback overlay */}
      {feedback && (
        <View style={[styles.feedbackBadge, { backgroundColor: feedback.includes('Benar') ? '#1d4ed8' : '#dc2626' }]}>
          <Text style={styles.feedbackText}>{feedback}</Text>
        </View>
      )}

      {/* Item Display */}
      <View style={styles.itemCard}>
        <View style={styles.itemImage} />
        <Text style={styles.itemName}>{items[currentIndex]?.name}</Text>
        <Text style={styles.itemHint}>Pilih kategori yang benar</Text>
      </View>

      {/* Binary Choice Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.choiceBtn, styles.btnOrganik]}
          onPress={() => handleAnswer('organik')}
          disabled={disableButtons}
        >
          <Text style={styles.btnIcon}>🌱</Text>
          <Text style={styles.btnText}>ORGANIK</Text>
          <Text style={styles.btnSubtext}>Sampah alami</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.choiceBtn, styles.btnAnorganik]}
          onPress={() => handleAnswer('anorganik')}
          disabled={disableButtons}
        >
          <Text style={styles.btnIcon}>♻️</Text>
          <Text style={styles.btnText}>ANORGANIK</Text>
          <Text style={styles.btnSubtext}>Sampah buatan</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' },
  loadingText: { marginTop: 12, color: '#6b7280' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: 50 },
  headerIcon: { width: 32, height: 32, borderWidth: 2, borderColor: '#333', borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 14, fontWeight: 'bold', color: '#374151' },
  headerSubtitle: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  progressBg: { height: 8, backgroundColor: '#e5e7eb', marginHorizontal: 20, borderRadius: 4, marginBottom: 20 },
  progressFill: { height: 8, backgroundColor: '#1d4ed8', borderRadius: 4 },
  instruction: { textAlign: 'center', fontSize: 18, fontWeight: 'bold', color: '#111827', lineHeight: 26, marginBottom: 30, paddingHorizontal: 20 },
  feedbackBadge: { alignSelf: 'center', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, marginBottom: 10 },
  feedbackText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  itemCard: { width: 160, height: 160, backgroundColor: '#fff', borderWidth: 2, borderColor: '#374151', borderRadius: 16, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 6, marginBottom: 40 },
  itemImage: { width: 60, height: 60, backgroundColor: '#e5e7eb', borderRadius: 8, marginBottom: 12 },
  itemName: { fontSize: 16, fontWeight: 'bold', textAlign: 'center', paddingHorizontal: 12 },
  itemHint: { fontSize: 11, color: '#9ca3af', marginTop: 6 },
  buttonContainer: { flexDirection: 'row', paddingHorizontal: 20, gap: 16 },
  choiceBtn: { flex: 1, paddingVertical: 24, borderRadius: 16, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 6 },
  btnOrganik: { backgroundColor: '#2e7d32' },
  btnAnorganik: { backgroundColor: '#dc2626' },
  btnIcon: { fontSize: 32, marginBottom: 8 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginBottom: 4 },
  btnSubtext: { color: '#fff', fontSize: 11, opacity: 0.9 },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#6b7280' },
});
